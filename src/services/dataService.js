import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

/**
 * Data Service — syncs user data between Supabase and localStorage.
 * Uses debounced saves to avoid excessive writes.
 * Falls back to localStorage-only if Supabase is not configured.
 */

let _saveTimer = null
const SAVE_DEBOUNCE_MS = 2000

// ═══════════════════════════════════════
// Load All User Data
// ═══════════════════════════════════════
export async function loadUserData(userId) {
    if (!isSupabaseConfigured() || !userId) return null

    try {
        const [profileRes, progressRes, settingsRes] = await Promise.all([
            supabase.from('user_profiles').select('*').eq('id', userId).single(),
            supabase.from('user_progress').select('*').eq('id', userId).single(),
            supabase.from('user_settings').select('*').eq('id', userId).single(),
        ])

        return {
            profile: profileRes.data,
            progress: progressRes.data,
            settings: settingsRes.data,
            errors: {
                profile: profileRes.error?.message,
                progress: progressRes.error?.message,
                settings: settingsRes.error?.message,
            },
        }
    } catch (err) {
        console.error('[DataService] loadUserData error:', err)
        return null
    }
}

// ═══════════════════════════════════════
// Save Profile
// ═══════════════════════════════════════
export async function saveProfile(userId, data) {
    if (!isSupabaseConfigured() || !userId) return

    const { error } = await supabase
        .from('user_profiles')
        .upsert({
            id: userId,
            display_name: data.userName,
            email: data.email,
            country_code: data.countryCode,
            age_group: data.userAge,
            gender: data.userGender,
            has_disaster_experience: data.hasDisasterExperience,
            bio: data.bio,
            avatar_color: data.avatarColor,
            xp: data.xp,
            level: data.level,
            total_xp_earned: data.totalXPEarned,
            coins: data.resiCoinBalance,
            onboarded: data.onboarded,
            join_date: data.joinDate,
            avatar_url: data.avatarUrl || null,
            updated_at: new Date().toISOString(),
        })

    if (error) console.error('[DataService] saveProfile error:', error.message)
}

// ═══════════════════════════════════════
// Save Progress (JSONB)
// ═══════════════════════════════════════
export async function saveProgress(userId, data) {
    if (!isSupabaseConfigured() || !userId) return

    const { error } = await supabase
        .from('user_progress')
        .upsert({
            id: userId,
            completed_acts: data.completedActs,
            completed_quests: data.completedQuests,
            completed_bridges: data.completedBridges,
            completed_chapter_quests: data.completedChapterQuests,
            lia_eval_scores: data.liaEvalScores,
            erq_scores: data.erqScores,
            story_progress: data.storyProgress,
            sim_hp: data.simHP,
            sim_checkpoint: data.simCheckpoint,
            personalization: data.personalization,
            updated_at: new Date().toISOString(),
        })

    if (error) console.error('[DataService] saveProgress error:', error.message)
}

// ═══════════════════════════════════════
// Save Settings
// ═══════════════════════════════════════
export async function saveSettings(userId, data) {
    if (!isSupabaseConfigured() || !userId) return

    const { error } = await supabase
        .from('user_settings')
        .upsert({
            id: userId,
            locale: data.locale,
            dark_mode: data.darkMode,
            login_streak: data.loginStreak,
            login_rewards_collected: data.loginRewardsCollected,
            reward_history: data.rewardHistory,
            daily_session: data.dailySession,
            updated_at: new Date().toISOString(),
        })

    if (error) console.error('[DataService] saveSettings error:', error.message)
}

// ═══════════════════════════════════════
// Debounced Save — batches all saves
// ═══════════════════════════════════════
export function debouncedSave(userId, { profile, progress, settings }) {
    if (_saveTimer) clearTimeout(_saveTimer)

    _saveTimer = setTimeout(async () => {
        const promises = []
        if (profile) promises.push(saveProfile(userId, profile))
        if (progress) promises.push(saveProgress(userId, progress))
        if (settings) promises.push(saveSettings(userId, settings))

        await Promise.allSettled(promises)
    }, SAVE_DEBOUNCE_MS)
}

// ═══════════════════════════════════════
// One-Time Migration: localStorage → Supabase
// ═══════════════════════════════════════
export async function migrateFromLocalStorage(userId) {
    if (!isSupabaseConfigured() || !userId) return false

    // Check if user already has data in Supabase
    const { data: existing } = await supabase
        .from('user_profiles')
        .select('onboarded')
        .eq('id', userId)
        .single()

    // If they already have onboarded data, skip migration
    if (existing?.onboarded) return false

    // Check if localStorage has data to migrate
    const localProfile = JSON.parse(localStorage.getItem('resilia_profile') || 'null')
    if (!localProfile) return false

    console.log('[DataService] Migrating localStorage data to Supabase...')

    // Migrate profile
    await saveProfile(userId, {
        userName: localProfile.userName,
        email: localStorage.getItem('resilia_email') || '',
        countryCode: localProfile.countryCode,
        userAge: localProfile.userAge,
        userGender: localProfile.userGender,
        hasDisasterExperience: localProfile.hasDisasterExperience,
        bio: localProfile.bio,
        avatarColor: localProfile.avatarColor,
        xp: 0,
        level: 1,
        totalXPEarned: 0,
        resiCoinBalance: 0,
        onboarded: localStorage.getItem('resilia_onboarded') === 'true',
        joinDate: localProfile.joinDate,
    })

    // Migrate progress
    const storyProgress = JSON.parse(localStorage.getItem('resilia_story_progress') || 'null')
    await saveProgress(userId, {
        completedActs: [],
        completedQuests: [],
        completedBridges: [],
        completedChapterQuests: [],
        liaEvalScores: JSON.parse(localStorage.getItem('resilia_lia_eval') || '{}'),
        erqScores: JSON.parse(localStorage.getItem('resilia_erq_scores') || '{}'),
        storyProgress: storyProgress,
        simHP: parseInt(localStorage.getItem('resilia_sim_hp') || '100'),
        simCheckpoint: localStorage.getItem('resilia_sim_checkpoint') || 'ch1h',
        personalization: JSON.parse(localStorage.getItem('resilia_personalization') || 'null'),
    })

    // Migrate settings
    await saveSettings(userId, {
        locale: localStorage.getItem('resilia_locale') || 'en',
        darkMode: localStorage.getItem('resilia_theme') === 'dark',
        loginStreak: parseInt(localStorage.getItem('resilia_login_streak') || '1'),
        loginRewardsCollected: parseInt(localStorage.getItem('resilia_login_rewards_collected') || '0'),
        rewardHistory: JSON.parse(localStorage.getItem('resilia_reward_history') || '[]'),
        dailySession: JSON.parse(localStorage.getItem('resilia_daily_session') || 'null'),
    })

    console.log('[DataService] Migration complete!')
    return true
}
