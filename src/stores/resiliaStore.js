import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import * as authService from '../services/authService'
import * as dataService from '../services/dataService'
import { isSupabaseConfigured } from '../lib/supabaseClient'

export const useResiliaStore = defineStore('resilia', () => {
    // ═══ Session TTL (6 hours) ═══
    const SESSION_TTL = 6 * 60 * 60 * 1000 // 6 hours in ms
    const sessionTs = parseInt(localStorage.getItem('resilia_session_ts') || '0')
    if (sessionTs && Date.now() - sessionTs > SESSION_TTL) {
        // Session expired — clear auth
        localStorage.removeItem('resilia_auth')
        localStorage.removeItem('resilia_session_ts')
    }

    // Auth
    const isAuthenticated = ref(localStorage.getItem('resilia_auth') === 'true')
    const userEmail = ref(localStorage.getItem('resilia_email') || '')
    const isAdmin = computed(() => userEmail.value === 'natkevin143@gmail.com')

    watch(isAdmin, (isAdm) => {
        if (isAdm) {
            academyChapters.value.forEach(ch => { if (ch.status === 'locked') ch.status = 'available' })
            beginnerModules.value.forEach(m => { if (m.status === 'locked') m.status = 'available' })
            modules.value.forEach(m => { if (m.status === 'locked') m.status = 'available' })
        }
    }, { immediate: true })

    // Persisted user profile
    const _savedProfile = JSON.parse(localStorage.getItem('resilia_profile') || 'null')
    const userName = ref(_savedProfile?.userName || '')
    const countryCode = ref(_savedProfile?.countryCode || '')
    const onboarded = ref(localStorage.getItem('resilia_onboarded') === 'true')
    const locale = ref(localStorage.getItem('resilia_locale') || 'en')
    const bio = ref(_savedProfile?.bio || '')
    const avatarColor = ref(_savedProfile?.avatarColor || '#0D9488')
    const avatarUrl = ref(_savedProfile?.avatarUrl || '') // Google profile photo
    const joinDate = ref(_savedProfile?.joinDate || '')

    // Extended onboarding (persisted)
    const userAge = ref(_savedProfile?.userAge || '') // 'adult' | 'minor'
    const userGender = ref(_savedProfile?.userGender || '') // 'male' | 'female' | 'prefer_not_to_say'
    const hasDisasterExperience = ref(_savedProfile?.hasDisasterExperience ?? null) // true | false | null

    // Personalization (Random Forest output)
    const userPersonalization = ref(JSON.parse(localStorage.getItem('resilia_personalization') || 'null') || {
        contentDifficulty: 0.5,    // 0=gentle, 1=intense
        quizFrequency: 0.5,        // 0=less, 1=more
        narrativeTone: 'supportive', // supportive | neutral | challenging
        focusTopics: [],           // ['stress', 'anxiety', 'depression']
        recommendedCountry: '',    // country code to prioritize
        dailyMissionWeights: {},   // mission type → weight multiplier
    })

    const stabilityScore = ref(0)
    const isStable = ref(true)
    const soothingModeActive = ref(false)
    const lastCheckInDate = ref(localStorage.getItem('resilia_checkin_date') || '')
    const hasCompletedCheckIn = ref(false)

    // ── Daily Reset System (3 AM WIB = 20:00 UTC previous day) ──
    // Returns a date string that represents the current "RESILIA day".
    // The day boundary is 3:00 AM WIB (UTC+7), i.e. 20:00 UTC of the previous calendar day.
    // Any time before 3 AM WIB still counts as "yesterday".
    function getResiliaDay() {
        const now = new Date()
        // Convert to WIB (UTC+7) by adding 7 hours worth of ms
        const wibMs = now.getTime() + (7 * 60 * 60 * 1000)
        const wibDate = new Date(wibMs)
        // Subtract 3 hours to shift the day boundary to 3 AM
        const shifted = new Date(wibDate.getTime() - (3 * 60 * 60 * 1000))
        return shifted.toISOString().slice(0, 10) // YYYY-MM-DD
    }

    const resiliaDay = getResiliaDay()
    const savedSession = JSON.parse(localStorage.getItem('resilia_daily_session') || 'null')
    const loginStreak = ref(1)

    // Check if we need to reset daily state
    const isNewDay = !savedSession || savedSession.day !== resiliaDay

    if (isNewDay) {
        // New RESILIA day — reset daily state
        hasCompletedCheckIn.value = false
        lastCheckInDate.value = ''
        // If we had a previous session, increment login streak
        if (savedSession && savedSession.day) {
            // Check if the previous day was exactly yesterday (consecutive)
            const prevDate = new Date(savedSession.day + 'T03:00:00+07:00')
            const currDate = new Date(resiliaDay + 'T03:00:00+07:00')
            const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24))
            if (diffDays === 1) {
                // Consecutive day — streak continues
                const savedStreak = parseInt(localStorage.getItem('resilia_login_streak') || '1')
                loginStreak.value = savedStreak + 1
            } else {
                // Gap — streak resets
                loginStreak.value = 1
            }
        }
    } else {
        // Same RESILIA day — restore saved state
        hasCompletedCheckIn.value = savedSession.checkInDone || false
        if (hasCompletedCheckIn.value) lastCheckInDate.value = resiliaDay
        loginStreak.value = parseInt(localStorage.getItem('resilia_login_streak') || '1')
    }

    const currentModule = ref(0)
    const moduleProgress = ref({})
    const xp = ref(0)
    const totalXPEarned = ref(0)
    const level = ref(1)
    const completedModules = ref([])
    const completedRPGs = ref([])
    const achievements = ref([])
    const darkMode = ref(localStorage.getItem('resilia_theme') === 'dark' || (!('resilia_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches))

    // Persistence watchers
    watch(locale, (val) => localStorage.setItem('resilia_locale', val))
    watch(darkMode, (val) => {
        localStorage.setItem('resilia_theme', val ? 'dark' : 'light')
        if (val) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
    }, { immediate: true })



    // Daily Login Reward System
    const lastLoginDate = ref(isNewDay ? '' : (savedSession?.lastLoginDate || ''))
    const loginRewardsCollected = ref(parseInt(localStorage.getItem('resilia_login_rewards_collected') || '0'))
    const todayRewardClaimed = ref(isNewDay ? false : (savedSession?.rewardClaimed || false))
    const dailyRewardHistory = ref(JSON.parse(localStorage.getItem('resilia_reward_history') || '[]'))

    // Toolkit
    const breathingSessions = ref(0)
    const moodLogs = ref([])
    const groundingSessions = ref(0)

    // Beginner Academy
    const completedBeginnerModules = ref([])

    // Daily missions — default blueprint
    const defaultDailyMissions = [
        { id: 1, title: 'Complete a Lesson', description: 'Finish any academy module today', icon: '📖', xpReward: 25, coinReward: 5, completed: false, type: 'lesson' },
        { id: 2, title: 'Daily Journal', description: 'Write in your daily journal', icon: '💚', xpReward: 15, coinReward: 3, completed: false, type: 'checkin' },
        { id: 3, title: 'Play an RPG Scenario', description: 'Practice a disaster response scenario', icon: '🎮', xpReward: 30, coinReward: 8, completed: false, type: 'rpg' },
        { id: 4, title: 'Donate ResiCoins', description: 'Contribute any amount to the community fund', icon: '🤝', xpReward: 20, coinReward: 5, completed: false, type: 'donate' },
        { id: 5, title: 'Review ASEAN Data', description: 'Check the analytics dashboard', icon: '📊', xpReward: 10, coinReward: 2, completed: false, type: 'dashboard' },
    ]

    // Restore or reset daily missions
    const dailyMissions = ref(
        isNewDay
            ? defaultDailyMissions.map(m => ({ ...m, completed: false }))
            : (savedSession?.missions || defaultDailyMissions.map(m => ({ ...m, completed: false })))
    )
    const dailyMissionsCompleted = computed(() => dailyMissions.value.filter(m => m.completed).length)
    const dailyMissionsTotal = computed(() => dailyMissions.value.length)

    // Save daily session to localStorage
    function saveDailySession() {
        const session = {
            day: getResiliaDay(),
            checkInDone: hasCompletedCheckIn.value,
            rewardClaimed: todayRewardClaimed.value,
            lastLoginDate: lastLoginDate.value,
            missions: dailyMissions.value.map(m => ({ ...m })),
        }
        localStorage.setItem('resilia_daily_session', JSON.stringify(session))
        localStorage.setItem('resilia_login_streak', loginStreak.value.toString())
        localStorage.setItem('resilia_login_rewards_collected', loginRewardsCollected.value.toString())
        localStorage.setItem('resilia_reward_history', JSON.stringify(dailyRewardHistory.value))
    }

    // Save immediately on init for new day
    saveDailySession()

    const resiCoinBalance = ref(0)
    const transactions = ref([])

    const totalDonated = ref(12450)
    const activeResponders = ref(3782)
    const modulesCompletedGlobal = ref(28910)

    const regionData = ref([
        { country: 'Indonesia', code: 'ID', flag: '🇮🇩', population: 275.5, gdpPerCapita: 4788, hdi: 0.705, disasterRiskIndex: 46.92, readiness: 74, responders: 1240, recentDisaster: 'Cianjur Earthquake 2022', annualDisasters: 3092, topDisasters: 'Earthquake, Flood, Volcano', emergencyHotline: '112 / 119' },
        { country: 'Philippines', code: 'PH', flag: '🇵🇭', population: 115.6, gdpPerCapita: 3623, hdi: 0.699, disasterRiskIndex: 45.12, readiness: 68, responders: 890, recentDisaster: 'Typhoon Rai 2021', annualDisasters: 1058, topDisasters: 'Typhoon, Earthquake, Flood', emergencyHotline: '911' },
        { country: 'Vietnam', code: 'VN', flag: '🇻🇳', population: 99.5, gdpPerCapita: 4164, hdi: 0.703, disasterRiskIndex: 24.96, readiness: 55, responders: 420, recentDisaster: 'Typhoon Noru 2022', annualDisasters: 394, topDisasters: 'Typhoon, Flood, Landslide', emergencyHotline: '113 / 115' },
        { country: 'Thailand', code: 'TH', flag: '🇹🇭', population: 71.8, gdpPerCapita: 7233, hdi: 0.800, disasterRiskIndex: 14.37, readiness: 82, responders: 610, recentDisaster: 'Southern Floods 2023', annualDisasters: 128, topDisasters: 'Flood, Drought, Landslide', emergencyHotline: '1669' },
        { country: 'Malaysia', code: 'MY', flag: '🇲🇾', population: 33.9, gdpPerCapita: 12448, hdi: 0.803, disasterRiskIndex: 8.63, readiness: 78, responders: 340, recentDisaster: 'Selangor Floods 2021', annualDisasters: 52, topDisasters: 'Flood, Landslide, Haze', emergencyHotline: '999' },
        { country: 'Myanmar', code: 'MM', flag: '🇲🇲', population: 54.4, gdpPerCapita: 1210, hdi: 0.585, disasterRiskIndex: 42.55, readiness: 42, responders: 180, recentDisaster: 'Cyclone Mocha 2023', annualDisasters: 312, topDisasters: 'Cyclone, Flood, Earthquake', emergencyHotline: '199' },
        { country: 'Cambodia', code: 'KH', flag: '🇰🇭', population: 16.9, gdpPerCapita: 1768, hdi: 0.593, disasterRiskIndex: 16.58, readiness: 48, responders: 95, recentDisaster: 'Mekong Floods 2022', annualDisasters: 67, topDisasters: 'Flood, Drought, Storm', emergencyHotline: '119' },
        { country: 'Laos', code: 'LA', flag: '🇱🇦', population: 7.5, gdpPerCapita: 2054, hdi: 0.607, disasterRiskIndex: 15.57, readiness: 38, responders: 45, recentDisaster: 'Dam Collapse 2018', annualDisasters: 34, topDisasters: 'Flood, Drought, UXO', emergencyHotline: '1195' },
        { country: 'Singapore', code: 'SG', flag: '🇸🇬', population: 5.9, gdpPerCapita: 72794, hdi: 0.939, disasterRiskIndex: 2.42, readiness: 91, responders: 220, recentDisaster: 'Heatwave 2023', annualDisasters: 3, topDisasters: 'Heatwave, Flood, Haze', emergencyHotline: '995' },
        { country: 'Brunei', code: 'BN', flag: '🇧🇳', population: 0.45, gdpPerCapita: 31449, hdi: 0.829, disasterRiskIndex: 3.08, readiness: 85, responders: 42, recentDisaster: 'Floods 2021', annualDisasters: 5, topDisasters: 'Flood, Haze, Fire', emergencyHotline: '993' },
    ])

    const countries = ref([
        { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
        { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
        { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
        { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
        { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
        { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
        { code: 'KH', name: 'Cambodia', flag: '🇰🇭' },
        { code: 'LA', name: 'Laos', flag: '🇱🇦' },
        { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
        { code: 'BN', name: 'Brunei', flag: '🇧🇳' },
    ])

    const levelTiers = [
        { level: 1, name: 'Cadet', minXP: 0, color: '#9CA3AF', icon: '🔰' },
        { level: 2, name: 'Trainee', minXP: 100, color: '#0D9488', icon: '🌱' },
        { level: 3, name: 'Responder', minXP: 250, color: '#F97316', icon: '🛡️' },
        { level: 4, name: 'Guardian', minXP: 500, color: '#EAB308', icon: '⭐' },
        { level: 5, name: 'Commander', minXP: 1000, color: '#8B5CF6', icon: '🎖️' },
        { level: 6, name: 'Marshal', minXP: 2000, color: '#DC2626', icon: '🏆' },
    ]

    const modules = ref([
        { id: 1, title: 'Introduction to Psychological First Aid', description: 'Learn the core principles and goals of PFA — what it is, what it isn\'t, and why it matters in disaster response.', xpReward: 50, coinReward: 10, status: 'available', duration: '12 min' },
        { id: 2, title: 'Active Listening & Empathy', description: 'Master the art of empathetic communication — reflecting feelings, validating emotions, and building trust with survivors.', xpReward: 75, coinReward: 15, status: 'locked', duration: '15 min' },
        { id: 3, title: 'Crisis De-escalation Techniques', description: 'Handle high-stress confrontations with calm authority using verbal and non-verbal de-escalation strategies.', xpReward: 100, coinReward: 20, status: 'locked', duration: '20 min' },
        { id: 4, title: 'Cultural Sensitivity in ASEAN', description: 'Understand how culture shapes grief, trauma expression, and help-seeking behavior across 10 ASEAN nations.', xpReward: 75, coinReward: 15, status: 'locked', duration: '18 min' },
        { id: 5, title: 'Post-Disaster Triage & Assessment', description: 'Learn to rapidly assess mental health needs, prioritize cases, and allocate limited resources effectively.', xpReward: 125, coinReward: 25, status: 'locked', duration: '25 min' },
        { id: 6, title: 'Community Mobilization', description: 'Organize neighborhood support networks, coordinate volunteer efforts, and build sustainable community resilience.', xpReward: 150, coinReward: 30, status: 'locked', duration: '22 min' },
        { id: 7, title: 'Child & Adolescent PFA', description: 'Special techniques for supporting children and teenagers — play-based interventions, age-appropriate language, and school-based recovery.', xpReward: 100, coinReward: 20, status: 'locked', duration: '20 min' },
        { id: 8, title: 'Self-Care for Responders', description: 'Recognize burnout, compassion fatigue, and secondary trauma. Build sustainable self-care routines that keep you effective.', xpReward: 75, coinReward: 15, status: 'locked', duration: '16 min' },
        { id: 9, title: 'Disaster Communication & Media', description: 'Manage misinformation, use social media responsibly during crises, and communicate effectively with affected populations.', xpReward: 100, coinReward: 20, status: 'locked', duration: '18 min' },
        { id: 10, title: 'Shelter & Evacuation Support', description: 'Coordinate evacuation center operations, manage displaced populations, and maintain dignity in temporary shelters.', xpReward: 125, coinReward: 25, status: 'locked', duration: '22 min' },
        { id: 11, title: 'Grief, Loss & Bereavement', description: 'Support individuals dealing with death, displacement, and the loss of livelihoods — the hardest conversations in PFA.', xpReward: 150, coinReward: 30, status: 'locked', duration: '24 min' },
        { id: 12, title: 'Long-Term Recovery Planning', description: 'Transition from emergency response to sustained recovery — PTSD referrals, community rebuilding, and measuring impact.', xpReward: 200, coinReward: 40, status: 'locked', duration: '28 min' },
    ])

    // Beginner modules — Foundations stage
    const beginnerModules = ref([
        {
            id: 'b1',
            title: 'Why Natural Disasters Are Increasing',
            description: 'Understand why natural disasters are growing in frequency and intensity — climate change, urbanization, deforestation, and what the data tells us.',
            xpReward: 30,
            coinReward: 8,
            status: 'available',
            duration: '10 min',
            icon: '🌍',
            sections: [
                { title: 'The Rising Trend', content: 'Over the past 50 years, the number of recorded natural disasters has increased by nearly 5× — from ~700 per decade in the 1970s to over 3,500 per decade in the 2020s. Climate change is the primary driver, but urbanization and deforestation amplify the impact.' },
                { title: 'Key Factors', content: '• Climate Change: Rising global temperatures increase extreme weather events — more intense typhoons, prolonged droughts, heavier rainfall.\n• Urbanization: More people living in flood-prone and coastal areas means more exposure.\n• Deforestation: Removing natural barriers increases landslide and flood risk.\n• Population Growth: More people in vulnerable areas = more impact per disaster.' },
                { title: 'ASEAN Impact', content: 'Southeast Asia is one of the most disaster-prone regions on Earth. The Philippines alone experiences 20+ typhoons per year. Indonesia sits on the Ring of Fire with active volcanoes and earthquake zones. Vietnam, Myanmar and Cambodia face annual monsoon flooding.' },
            ],
            quiz: [
                { question: 'By how much has the number of recorded disasters increased over 50 years?', options: ['2×', '3×', '5×', '10×'], correct: 2 },
                { question: 'Which factor is the PRIMARY driver of increasing disasters?', options: ['Population growth', 'Climate change', 'Technology', 'Urbanization'], correct: 1 },
                { question: 'Which ASEAN country sits on the Ring of Fire?', options: ['Thailand', 'Vietnam', 'Indonesia', 'Cambodia'], correct: 2 },
            ]
        },
        {
            id: 'b2',
            title: 'Understanding Disaster Impact',
            description: 'Learn about the physical, psychological, economic, and social impacts of disasters — and the factors that determine severity.',
            xpReward: 30,
            coinReward: 8,
            status: 'locked',
            duration: '12 min',
            icon: '💔',
            sections: [
                { title: 'Types of Impact', content: '• Physical: Injuries, loss of homes, damage to infrastructure, displacement\n• Psychological: Trauma, PTSD, anxiety, grief, loss of sense of safety\n• Economic: Job loss, crop destruction, rebuilding costs, long-term poverty\n• Social: Family separation, community breakdown, loss of cultural heritage' },
                { title: 'Vulnerability Factors', content: 'Not everyone is affected equally. Vulnerability depends on:\n• Poverty: Poor communities have fewer resources to prepare, respond, and recover\n• Geography: Coastal and low-lying areas face higher flood/tsunami risk\n• Age & Health: Children, elderly, and disabled people are disproportionately affected\n• Gender: Women and girls often face increased risks during and after disasters' },
                { title: 'Mitigation & Preparedness', content: 'Impact can be reduced through:\n• Early warning systems (sirens, SMS alerts, community radio)\n• Building codes that withstand earthquakes/typhoons\n• Community drills and evacuation plans\n• Psychological first aid training (that\'s you!)\n• Economic safety nets and insurance' },
            ],
            quiz: [
                { question: 'Which is NOT a type of disaster impact?', options: ['Physical', 'Psychological', 'Technological', 'Economic'], correct: 2 },
                { question: 'Which factor makes communities MORE vulnerable?', options: ['Wealth', 'Poverty', 'Education', 'Technology'], correct: 1 },
                { question: 'What is one way to reduce disaster impact?', options: ['Ignoring warnings', 'Early warning systems', 'Building in flood zones', 'Removing shelters'], correct: 1 },
            ]
        },
        {
            id: 'b3',
            title: 'Disasters in ASEAN: A Cultural Lens',
            description: 'Explore how each ASEAN nation faces unique disaster risks and responds through local culture, indigenous knowledge, and community traditions.',
            xpReward: 40,
            coinReward: 10,
            status: 'locked',
            duration: '15 min',
            icon: '🌏',
            sections: [
                { title: 'The ASEAN Disaster Landscape', content: 'ASEAN sits at the intersection of the Pacific Ring of Fire, the Monsoon Belt, and the Typhoon Corridor — making it one of the most disaster-prone regions on Earth.\n\n🇮🇩 Indonesia: Earthquakes, volcanic eruptions, tsunamis, floods (3,000+ disasters/year)\n🇵🇭 Philippines: Typhoons, volcanic eruptions, earthquakes (1,000+ disasters/year)\n🇻🇳 Vietnam: Typhoons, floods, landslides\n🇲🇲 Myanmar: Cyclones, floods, earthquakes\n🇹🇭 Thailand: Floods, droughts, tsunamis\n🇲🇾 Malaysia: Floods, landslides, haze' },
                { title: 'Cultural Responses', content: '• 🇮🇩 Indonesia — Gotong Royong: "Mutual cooperation" — communities rebuild together after disasters. Deep cultural norm of collective action.\n• 🇵🇭 Philippines — Bayanihan: "Community spirit" — literally means carrying a neighbor\'s house together. Extends to disaster response.\n• 🇻🇳 Vietnam — Bốn Phương: Four Directions tradition of multi-directional social support networks.\n• 🇹🇭 Thailand — Buddhist merit-making: Disaster relief as religious obligation through temple-based distribution networks.\n• 🇲🇲 Myanmar — Monastery shelters: Monasteries serve as emergency evacuation centers in cyclone zones.' },
                { title: 'Indigenous Knowledge', content: 'Local wisdom often saves lives:\n• Smong (Simeulue Island, Indonesia): Oral tradition about tsunami signs — when the 2004 tsunami hit, the Simeulue people evacuated early and had near-zero casualties.\n• Badjao sea nomads (Philippines): Read ocean currents and weather patterns to predict storms days in advance.\n• Vietnamese floating houses: Mekong Delta communities build houses that rise with floodwaters.\n• Thai mangrove conservation: Local fishing communities protect mangroves as natural tsunami barriers.' },
            ],
            quiz: [
                { question: 'What THREE geographic features make ASEAN disaster-prone?', options: ['Ring of Fire, Monsoon Belt, Typhoon Corridor', 'Amazon Basin, Arctic Circle, Sahara', 'Himalayas, Gobi, Pacific', 'Mediterranean, Atlantic, Indian'], correct: 0 },
                { question: 'What is the Indonesian concept of mutual community cooperation?', options: ['Bayanihan', 'Gotong Royong', 'Smong', 'Bốn Phương'], correct: 1 },
                { question: 'How did Simeulue Islanders survive the 2004 tsunami?', options: ['Government warning', 'Oral tradition (Smong)', 'Luck', 'International aid'], correct: 1 },
            ]
        },
    ])

    const beginnerCompleted = computed(() => completedBeginnerModules.value.length >= beginnerModules.value.length)

    // ═══════════════════════════════════════════════════
    // NEW ACADEMY STATE — HP, acts, prologue
    // ═══════════════════════════════════════════════════
    const prologueChatCompleted = ref(false)
    const prologueCheckInCompleted = ref(false)
    const completedActs = ref([]) // e.g. ['ch1_act1', 'ch1_act2']
    const completedBridgingQuests = ref([]) // e.g. ['bridge_prologue_ch1']
    const questHP = ref(5)
    const questRetries = ref({}) // { 'quest_ch1': 0 }
    const MAX_QUEST_HP = 5
    const MAX_RETRIES = 2

    function completeAct(chapterId, actId) {
        const key = `${chapterId}_${actId}`
        if (!completedActs.value.includes(key)) {
            completedActs.value.push(key)
            earnXP(30)
            earnCoins(8, `Completed Act: ${actId}`)
            completeDailyMission('lesson')
            checkAchievements()
        }
    }

    function isActCompleted(chapterId, actId) {
        return completedActs.value.includes(`${chapterId}_${actId}`)
    }

    function getChapterActsCompleted(chapterId) {
        return completedActs.value.filter(k => k.startsWith(`${chapterId}_`)).length
    }

    function completeBridgingQuest(bridgeId) {
        if (!completedBridgingQuests.value.includes(bridgeId)) {
            completedBridgingQuests.value.push(bridgeId)
            earnXP(50)
            earnCoins(10, `Bridging Quest: ${bridgeId}`)

            // Unlock the next chapter using the bridge quest's 'to' field
            const quest = bridgingQuests.value[bridgeId]
            if (quest) {
                // Try to match by parsing the bridge ID last segment (e.g. bridge_ch1_ch1h → ch1h)
                const parts = bridgeId.split('_')
                const nextChapterId = parts[parts.length - 1]
                const nextChapter = academyChapters.value.find(ch => ch.id === nextChapterId)
                if (nextChapter && nextChapter.status === 'locked') {
                    nextChapter.status = 'available'
                }
            }
        }
    }

    function resetQuestHP() {
        questHP.value = MAX_QUEST_HP
    }

    function damageQuestHP() {
        questHP.value = Math.max(0, questHP.value - 1)
        return questHP.value
    }

    function getQuestRetries(questId) {
        return questRetries.value[questId] || 0
    }

    function useQuestRetry(questId) {
        if (!questRetries.value[questId]) questRetries.value[questId] = 0
        questRetries.value[questId]++
        resetQuestHP()
        return true // Infinite retries for everyone
    }

    const academyChapters = ref([
        {
            id: 'ch1',
            title: 'Chapter 1 — Disasters in ASEAN',
            subtitle: 'Understanding Natural Disasters Across Southeast Asia',
            icon: '🏫',
            description: 'An introduction to natural disasters across ASEAN — their global, regional, and local impact, how local cultures have faced them for centuries, and the institutions that watch over 680 million lives.',
            location: '🏫 School',
            color: '#0D9488',
            type: 'theory',
            difficulty: null,
            destinations: [],
            requiresLiaChat: true,
            acts: [
                {
                    id: 'act1', title: 'Natural Disaster in ASEAN', description: 'Learn how to identify the situation during a disaster: who needs help first, safety and security risks, physical injuries, immediate basic needs, and emotional reactions.', duration: '10 min', xpReward: 30, coinReward: 8, videoTitle: 'Identifying the Situation', videoDesc: 'How to assess a disaster situation and identify who needs help.', quiz: [
                        { question: 'When arriving at a disaster scene, what should you identify FIRST?', options: ['The number of casualties', 'Safety and security risks in the area', 'Where to set up a command post', 'Who is in charge'], correct: 1 },
                        { question: 'Why is it important to check for emotional reactions during a disaster?', options: ['To diagnose mental illness', 'Because emotional distress can be as urgent as physical injuries and affects decision-making', 'It is not important — focus only on physical injuries', 'To write a report for authorities'], correct: 1 },
                        { question: 'Which of the following is an "immediate basic need" after a disaster?', options: ['Entertainment and recreation', 'Clean water, shelter, and safety from further harm', 'Insurance claims processing', 'Social media access'], correct: 1 },
                    ]
                },
                {
                    id: 'act2', title: 'Why We Must Care', description: 'Understand the devastating impact of natural disasters on a global, ASEAN, and local scale — and why every person who learns to respond makes a difference.', duration: '12 min', xpReward: 30, coinReward: 8, videoTitle: 'The Impact of Disasters', videoDesc: 'From global statistics to the village next door — why this matters.', quiz: [
                        { question: 'What percentage of global natural disaster fatalities occur in the Asia-Pacific region?', options: ['About 20%', 'About 40%', 'About 60%', 'About 80%'], correct: 1 },
                        { question: 'How do natural disasters disproportionately affect ASEAN communities compared to wealthier regions?', options: ['They don\'t — disasters affect all regions equally', 'ASEAN nations have higher vulnerability due to geography, population density, and infrastructure gaps', 'Wealthier nations suffer more due to complex infrastructure', 'Natural disasters only affect coastal areas'], correct: 1 },
                        { question: 'At the local level, the long-term impact of a natural disaster includes:', options: ['Only property damage', 'Economic disruption, displacement, trauma, food insecurity, and loss of livelihoods', 'A temporary inconvenience that resolves in weeks', 'Only physical injuries'], correct: 1 },
                    ]
                },
                {
                    id: 'act3', title: 'How Our People Facing It With Culture', description: 'A Javanese farmer reads the clouds. A Thai fisherman watches the tide. Indigenous knowledge has saved lives for centuries — local culture is not just heritage, it\'s survival strategy.', duration: '12 min', xpReward: 30, coinReward: 8, videoTitle: 'Cultural Resilience', videoDesc: 'How ASEAN communities use cultural wisdom to face disasters.', quiz: [
                        { question: 'What role does indigenous knowledge play in disaster preparedness?', options: ['It is outdated and unreliable', 'It complements scientific early warning systems and has saved lives for centuries', 'It replaces the need for technology', 'It only works in rural areas'], correct: 1 },
                        { question: 'The Simeulue people of Indonesia survived the 2004 tsunami because of:', options: ['Government evacuation orders', 'Oral tradition warning them to run to hills when the sea recedes', 'Advanced seismograph readings', 'Military helicopter rescue'], correct: 1 },
                        { question: 'Why is cultural sensitivity important in disaster response across ASEAN?', options: ['To avoid legal issues', 'Because each community has unique beliefs, practices, and social structures that affect how they respond', 'It is not important — one approach works everywhere', 'Only for tourism purposes'], correct: 1 },
                    ]
                },
                {
                    id: 'act4', title: 'Institutions & Organizations Involved', description: 'BMKG, PAGASA, TMD — behind every earthquake alert and typhoon warning stands an institution built on decades of expertise. Meet the guardians who watch over ASEAN.', duration: '12 min', xpReward: 30, coinReward: 8, videoTitle: 'ASEAN Disaster Institutions', videoDesc: 'From BMKG to PAGASA — the guardians of early warning.', quiz: [
                        { question: 'What is BMKG?', options: ['A disaster relief NGO', 'Indonesia\'s meteorology, climatology, and geophysics agency', 'A UN peacekeeping force', 'A Malaysian flood prevention system'], correct: 1 },
                        { question: 'What does an early warning system primarily aim to do?', options: ['Predict disasters with 100% accuracy', 'Give communities time to prepare and evacuate before a disaster strikes', 'Replace the need for community training', 'Only alert government officials'], correct: 1 },
                        { question: 'The ASEAN Agreement on Disaster Management (AADMER) is significant because it:', options: ['Only applies during wartime', 'Creates a regional framework for cooperation on disaster risk reduction', 'Replaces national disaster agencies', 'Focuses exclusively on earthquake preparedness'], correct: 1 },
                    ]
                },
            ],
            liaChat: {
                pre: [
                    { from: 'lia', text: 'heyyy welcome to RESILIA!! 🎉 im Lia, ur guide through this whole journey' },
                    { from: 'lia', text: 'before we jump in, i just wanna know how ur feeling rn. no wrong answers ok?' },
                    { from: 'lia', text: 'on a scale of 1-5, how confident do you feel about handling unexpected situations?', type: 'scale', scaleLabel: ['not at all', 'a little', 'kinda', 'pretty confident', 'super ready'], key: 'confidence' },
                    { from: 'lia', text: 'got it! and how much do you know about natural disasters in Southeast Asia?', type: 'scale', scaleLabel: ['nothing', 'heard of it', 'some stuff', 'quite a bit', 'expert mode'], key: 'knowledge' },
                    { from: 'lia', text: 'last one — how calm do you usually feel when things get chaotic?', type: 'scale', scaleLabel: ['i panic', 'pretty anxious', 'depends', 'mostly calm', 'ice cold'], key: 'calmness' },
                    { from: 'lia', text: 'thanks for sharing 💛 lets get started!' },
                ],
                post: [
                    { from: 'lia', text: 'you finished Chapter 1!! 🥳 how was that?' },
                    { from: 'lia', text: 'same questions real quick — how confident do you feel NOW about handling unexpected situations?', type: 'scale', scaleLabel: ['not at all', 'a little', 'kinda', 'pretty confident', 'super ready'], key: 'confidence' },
                    { from: 'lia', text: 'and how much do you think you know about natural disasters now?', type: 'scale', scaleLabel: ['nothing', 'heard of it', 'some stuff', 'quite a bit', 'expert mode'], key: 'knowledge' },
                    { from: 'lia', text: 'one more — how calm do you feel about chaotic situations now?', type: 'scale', scaleLabel: ['i panic', 'pretty anxious', 'depends', 'mostly calm', 'ice cold'], key: 'calmness' },
                    { from: 'lia', text: 'awesome progress 🌟 see u in the next chapter!!' },
                ],
            },
            questId: 'quest_ch1',
            bridgeId: 'bridge_ch1_ch1h',
            status: 'available',
        },
        {
            id: 'ch1h',
            title: 'Chapter 1.5 — Infrastructure Recon',
            subtitle: 'Infrastructure Observation & Basic Education',
            icon: '🏙️',
            description: 'Your first deployment. Singapore\'s gleaming disaster center hides a truth most tourists never see. And in Brunei, a royal decree changed how an entire nation thinks about survival.',
            location: '🇸🇬 Singapore · 🇧🇳 Brunei',
            color: '#3B82F6',
            type: 'simulation',
            difficulty: 'Low',
            destinations: ['🇸🇬 Singapore', '🇧🇳 Brunei'],
            chatSimulation: true,
            npcCharacters: [
                { id: 'dr_tan', name: 'Dr. Tan Wei Lin', role: 'SCDF Disaster Response Specialist', avatar: '👩‍🔬', country: '🇸🇬' },
                { id: 'haji_omar', name: 'Haji Omar', role: 'Brunei Community Resilience Elder', avatar: '👳', country: '🇧🇳' },
            ],
            acts: [
                {
                    id: 'act1', title: 'Singapore — High-Tech Safety', chatSimulation: true, description: 'Tour Singapore\'s Civil Defence Force HQ. Dr. Tan reveals how a city-state the size of a district protects 6 million people from disasters they statistically shouldn\'t survive.', duration: '15 min', xpReward: 40, coinReward: 10, chatFlow: [
                        { from: 'lia', text: 'welcome to Singapore!! 🇸🇬 we\'re at the SCDF headquarters. Dr. Tan is gonna show us around' },
                        { from: 'lia', text: 'this place is INSANE btw. like something out of a sci-fi movie 🤯' },
                        { from: 'dr_tan', text: 'Welcome to the Singapore Civil Defence Force headquarters. I\'m Dr. Tan Wei Lin, and I\'ve spent 15 years designing systems to protect this island.' },
                        { from: 'dr_tan', text: 'Let me start with a fact that surprises most people: Singapore is one of the safest places on Earth from natural disasters. No earthquakes. No typhoons. No volcanoes.' },
                        { from: 'dr_tan', text: 'But that doesn\'t mean we\'re safe. Our biggest threat is invisible — and it\'s getting worse every year.' },
                        {
                            from: 'dr_tan', text: 'Quick question: what do you think is Singapore\'s BIGGEST natural disaster risk?', type: 'choice', choices: [
                                { text: 'Earthquakes from nearby fault lines', hpEffect: -5, response: 'Not quite. Singapore is far from major fault lines. Think about what surrounds us — water.' },
                                { text: 'Flooding from rising sea levels and intense rainfall', hpEffect: 5, response: 'Exactly. Two-thirds of Singapore is less than 15 meters above sea level. Flooding is our existential threat.' },
                                { text: 'Volcanic eruptions from Indonesia', hpEffect: 0, response: 'That\'s a concern, but the bigger daily threat is water. Flooding is what keeps our engineers awake at night.' },
                            ], key: 'sg_risk'
                        },
                        { from: 'dr_tan', text: 'In 2010, Orchard Road — our most famous shopping street — was completely underwater. Three floods in three months. $30 million in damage. It was a national humiliation.' },
                        { from: 'lia', text: 'wait Orchard Road?? like where all the luxury malls are? 😱' },
                        { from: 'dr_tan', text: 'Yes. Louis Vuitton bags floating down the street. The images went viral. Singapore\'s reputation as a \'perfect city\' was shattered overnight.' },
                        { from: 'dr_tan', text: 'After that, we built the Marina Barrage — a dam across the Marina Channel. $226 million. It controls sea water inflow AND stores freshwater. Dual purpose engineering at its finest.' },
                        { from: 'lia', text: 'ok we\'re walking towards the Barrage now... it\'s HUGE' },
                        { from: 'dr_tan', text: 'Our drainage system handles 37 million cubic meters of stormwater per year. But here\'s what most people don\'t know — it was designed with climate change projections from 2100.' },
                        { from: 'lia', text: 'literally planning 75 years ahead 🤯 that\'s insane' },
                        { from: 'lia', text: 'wait hold on...' },
                        { from: 'lia', text: 'Dr. Tan, is that crack normal? 👀' },
                        { from: 'lia', text: 'there\'s a hairline crack running along the eastern flood gate seal. it\'s thin but it\'s LONG. like maybe 2 meters?' },
                        { from: 'dr_tan', text: 'That? It\'s cosmetic. Thermal expansion. Concrete naturally develops micro-cracks. Nothing to worry about.' },
                        { from: 'lia', text: '...but it\'s on the SEAL, Dr. Tan. not the concrete. the rubber seal between the gate and the frame. wouldn\'t that compromise waterproofing under extreme surge?' },
                        { from: 'dr_tan', text: '...' },
                        { from: 'dr_tan', text: 'I... let me look at that more closely.' },
                        { from: 'lia', text: 'omg {Name} he\'s getting his phone out. he\'s calling someone. did I just find something real?? 😰' },
                        { from: 'dr_tan', text: 'I\'ve contacted PUB\'s maintenance team. They\'ll inspect this within 24 hours. You have good eyes, young lady.' },
                        { from: 'lia', text: 'HE JUST CALLED PUB BECAUSE OF MY OBSERVATION 🤯🤯🤯' },
                        { from: 'lia', text: 'ok but also I feel kinda bad... like what if it IS just cosmetic and I wasted everyone\'s time?' },
                        {
                            from: 'dr_tan', text: 'Let me tell you something important. In safety engineering, we have a principle: the cost of a false alarm is always lower than the cost of a missed warning. ALWAYS report. How does that make you feel about speaking up?', type: 'choice', choices: [
                                { text: 'Validated — it\'s better to be wrong than to be silent about a real threat', hpEffect: 5, response: 'That\'s the right mindset. The Challenger shuttle disaster happened because engineers\' safety concerns were overruled by managers who didn\'t want to delay the launch. NEVER be afraid to speak up.' },
                                { text: 'Still nervous — what if experts think I\'m annoying?', hpEffect: 0, response: 'Good experts welcome extra eyes. Bad experts silence them. The fact that I called PUB immediately should tell you what kind of expert I try to be.' },
                            ], key: 'sg_reporting'
                        },
                        { from: 'dr_tan', text: 'We also have underground civil defence shelters beneath every HDB block built after 1997. Over 1 million shelter spaces across the island.' },
                        { from: 'dr_tan', text: 'But technology alone is not enough. During our annual Total Defence Day, every school, office, and neighborhood practices emergency procedures. Preparedness is cultural here.' },
                        { from: 'lia', text: 'so Singapore has the TECH side down... $226 million barrages, million shelter spaces, drainage systems designed for 2100...' },
                        { from: 'lia', text: 'but even with all that money and tech, ONE crack that nobody noticed could potentially compromise the whole system' },
                        { from: 'lia', text: 'so it\'s both tech AND culture AND vigilance... i wonder how that compares to Brunei 🤔' },
                    ], quiz: [
                        { question: 'What is Singapore\'s primary natural disaster risk?', options: ['Earthquakes', 'Flooding from rainfall and sea level rise', 'Volcanic eruptions', 'Typhoons'], correct: 1 },
                        { question: 'Singapore\'s drainage system was designed with projections from which year?', options: ['2025', '2050', '2075', '2100'], correct: 3 },
                    ]
                },
                {
                    id: 'act2', title: 'Brunei — Cultural Calm', chatSimulation: true, description: 'In the quietest monarchy of Southeast Asia, Haji Omar shows you how faith, royalty, and tradition created a disaster culture that doesn\'t need sirens — because the community IS the warning system.', duration: '15 min', xpReward: 35, coinReward: 8, chatFlow: [
                        { from: 'lia', text: 'next stop: Brunei 🇧🇳 it\'s SO different from Singapore. meet Haji Omar!' },
                        { from: 'lia', text: 'fun fact: Brunei is one of the richest countries in Asia per capita but their disaster approach is completely different from Singapore\'s tech-first method' },
                        { from: 'haji_omar', text: 'Selamat datang, young ones. Welcome to Kampong Ayer — the water village. 600 years old. Built entirely on stilts above the Brunei River.' },
                        { from: 'haji_omar', text: 'People think we\'re crazy for living on water. But we learned to LIVE with the river, not fight it. When floods come, the kampong rises. When the tide drops, we come back down.' },
                        { from: 'lia', text: 'wait so the whole village... floats? 😮' },
                        { from: 'haji_omar', text: 'In a way, yes. The stilts are designed to handle tidal changes. It\'s ancient engineering — passed down for generations. No computer designed this. Our ancestors did.' },
                        { from: 'haji_omar', text: 'In Brunei, we don\'t have earthquakes or typhoons. But we prepare anyway. You know why?' },
                        { from: 'haji_omar', text: 'Because our neighbors do. And in ASEAN, your neighbor\'s disaster is your disaster too.' },
                        { from: 'lia', text: 'that\'s such a beautiful way to think about it 🥺' },
                        {
                            from: 'haji_omar', text: 'A question for you: when a flood warning comes, what should a community leader do FIRST?', type: 'choice', choices: [
                                { text: 'Call the government and wait for instructions', hpEffect: -5, response: 'Waiting can cost lives. A leader must act immediately with what they have.' },
                                { text: 'Alert the most vulnerable people — elderly, children, disabled — first', hpEffect: 5, response: 'Exactly. The weakest must be warned first. This is what we call "community triage."' },
                                { text: 'Evacuate yourself and your family', hpEffect: -10, response: 'Understandable instinct, but a leader who abandons their people loses trust forever.' },
                            ], key: 'bn_leadership'
                        },
                        { from: 'haji_omar', text: 'Let me tell you a story. In 2020, Brunei sent 15 tonnes of aid to the Philippines after Typhoon Goni. We\'ve never had a typhoon ourselves. But we sent help anyway.' },
                        { from: 'haji_omar', text: 'The Sultan said: "A nation that only prepares for itself is a nation that stands alone. And in ASEAN, no one stands alone."' },
                        { from: 'lia', text: 'that\'s... that\'s exactly what i want RESILIA to be about 🌏' },
                        { from: 'lia', text: 'wait... Haji Omar looks worried. he just got a call 📱' },
                        { from: 'haji_omar', text: 'Young ones, I have bad news. The tide monitoring station just issued a surge warning. Water levels could rise 1.5 meters above normal within the next 2 hours.' },
                        { from: 'lia', text: 'WHAT?? during our visit?? 😰' },
                        { from: 'haji_omar', text: 'This is not a drill. This is real. And now you will see what Kampong Ayer does when the water comes.' },
                        { from: 'haji_omar', text: 'Children — to the school hall. It\'s on reinforced stilts, highest platform in the kampong. Elderly — I\'m sending boats. Everyone else — secure your homes and move valuables to upper levels.' },
                        { from: 'lia', text: 'he literally didn\'t hesitate for ONE second. he already knows exactly who goes where 🤯' },
                        { from: 'haji_omar', text: 'We need to check on the far stilts. Three families live there. Pak Hamid is 83 and can\'t walk well. Mak Aminah lost her sight last year. And... there\'s Mak Fatimah\'s family.' },
                        { from: 'lia', text: 'what about Mak Fatimah?' },
                        { from: 'haji_omar', text: '*sighs* Mak Fatimah\'s husband died in the 2014 flash flood. Since then, she doesn\'t trust ANY warning system. Not the government\'s. Not mine. She says the warnings came too late for her husband, so why listen now?' },
                        { from: 'lia', text: 'oh no... that\'s heartbreaking 😢' },
                        { from: 'haji_omar', text: 'She has two small children. She won\'t leave. And I cannot FORCE her. In our community, trust is earned, not demanded.' },
                        {
                            from: 'haji_omar', text: 'What would you suggest? I\'ve tried everything over the years.', type: 'choice', choices: [
                                { text: 'Can her children\'s school friends come to the boat and ask them to come play at the school hall? Children convince children.', hpEffect: 5, response: 'Brilliant. You understand something many adults don\'t — trust moves through relationships, not authority. The children are the bridge.' },
                                { text: 'Override her decision. Force evacuation. Her children\'s safety comes first.', hpEffect: -10, response: 'If I force her today, she will never trust ANYONE in this kampong again. And next time — when I\'m not here — who will she listen to? Nobody. We break trust ONCE, it takes a generation to rebuild.' },
                                { text: 'Send a government official to explain the danger.', hpEffect: -5, response: 'A government official is who she trusts LEAST. Remember — it was the government warning that came too late for her husband.' },
                            ], key: 'bn_fatimah'
                        },
                        { from: 'haji_omar', text: 'The children idea... yes. Her daughter Nurul is friends with my granddaughter Aisyah. Let me call Aisyah.' },
                        { from: 'lia', text: '15 minutes later...' },
                        { from: 'lia', text: 'it worked. Aisyah came in her little boat and said "Kak Nurul, we\'re having a party at the school! Come play!" and just like that, Nurul pulled her little brother to the boat' },
                        { from: 'lia', text: 'Mak Fatimah followed. not because of the warning. not because of authority. because her daughter was happy and safe. 🥺' },
                        { from: 'haji_omar', text: 'Do you see? Sirens and sensors are for cities. For communities like ours, trust is the warning system. Aisyah is more powerful than any siren.' },
                        { from: 'lia', text: 'the water is rising now. everyone is at the school hall. Haji Omar is serving tea like nothing happened. the calm is... surreal.' },
                        { from: 'haji_omar', text: 'Remember: infrastructure can fail. Technology can fail. But a community that cares for each other — that never fails.' },
                        { from: 'lia', text: 'Singapore builds $226 million barriers. Brunei builds trust networks that even overcome a widow\'s grief.' },
                        { from: 'lia', text: 'maybe the real answer is BOTH. tech for the infrastructure. community for the soul. and ALWAYS having people who notice the cracks — whether in a barrage seal or in a neighbor\'s heart 💛' },
                    ], quiz: [
                        { question: 'According to Haji Omar, what should a community leader do FIRST when a flood warning comes?', options: ['Call the government', 'Alert the most vulnerable people first', 'Evacuate their own family', 'Post on social media'], correct: 1 },
                        { question: 'Why did Mak Fatimah refuse to evacuate?', options: ['She didn\'t believe in floods', 'Her husband died because warnings came too late', 'She wanted to protect her home', 'She couldn\'t hear the sirens'], correct: 1 },
                    ]
                },
            ],
            liaChat: {
                pre: [
                    { from: 'lia', text: 'ok so this is your first field trip!! 🗺️ we\'re going to Singapore and Brunei' },
                    { from: 'lia', text: 'quick check — how ready do you feel for your first real-world experience?', type: 'scale', scaleLabel: ['nervous', 'a bit unsure', 'ok i guess', 'lets go', 'BORN READY'], key: 'readiness' },
                ],
                post: [
                    { from: 'lia', text: 'you survived your first field trip!! 🇸🇬🇧🇳' },
                    { from: 'lia', text: 'how much did observing real infrastructure boost your confidence?', type: 'scale', scaleLabel: ['not much', 'a tiny bit', 'somewhat', 'a lot', 'game changer'], key: 'readiness' },
                    { from: 'lia', text: 'amazing start 🌱 things get more real from here!' },
                ],
            },
            questId: 'quest_ch1h',
            bridgeId: 'bridge_ch1h_ch2',
            status: 'locked',
        },
        {
            id: 'ch2',
            title: 'Chapter 2 — First Aid for The Heart',
            subtitle: 'Introduction to Psychological First Aid',
            icon: '🩹',
            description: 'Understand the psychological impact of disasters and the fundamentals of Psychological First Aid (PFA). Learn who PFA is for, when to apply it, and the three foundational stages: Look, Listen, Link.',
            location: '🏫 School',
            color: '#059669',
            type: 'theory',
            difficulty: null,
            destinations: [],
            acts: [
                {
                    id: 'act1', title: 'PFA 101', description: 'Disasters don\'t just destroy buildings — they shatter minds. Learn what Psychological First Aid is, why it exists, and how it differs from therapy or counseling.', duration: '12 min', xpReward: 50, coinReward: 10, videoTitle: 'PFA Introduction', videoDesc: 'What is PFA and why does it matter after a disaster?', quiz: [
                        { question: 'Psychological First Aid (PFA) is best described as:', options: ['A form of therapy for trauma patients', 'Immediate emotional support and practical help for people in crisis', 'A medical treatment for PTSD', 'A certification program for counselors'], correct: 1 },
                        { question: 'What is a common psychological impact of experiencing a natural disaster?', options: ['Improved mental health due to community bonding', 'Acute stress reactions including anxiety, confusion, and grief', 'No psychological impact if there are no physical injuries', 'Only children are psychologically affected'], correct: 1 },
                        { question: 'Who can provide PFA?', options: ['Only licensed psychologists', 'Only trained medical professionals', 'Anyone with basic training and genuine compassion', 'Only government-appointed responders'], correct: 2 },
                    ]
                },
                {
                    id: 'act2', title: 'Who, When, Where, to Whom?', description: 'PFA isn\'t just for disaster zones. Learn when and where PFA should be applied, who benefits from it, and how to recognize the right moment to step in — starting with yourself.', duration: '15 min', xpReward: 50, coinReward: 12, videoTitle: 'Applying PFA', videoDesc: 'Understanding context: when, where, and for whom.', quiz: [
                        { question: 'When should PFA be provided?', options: ['Only weeks after a disaster', 'In the immediate aftermath when someone is distressed', 'Only in clinical settings', 'Only when requested by the victim'], correct: 1 },
                        { question: 'PFA should FIRST be applied to:', options: ['Only other people — helpers don\'t need PFA', 'Yourself — you cannot help others if you are not grounded', 'Only children and elderly', 'Only people with visible injuries'], correct: 1 },
                        { question: 'Which of the following is a suitable setting for PFA?', options: ['Only in hospitals', 'Evacuation centers, community spaces, or even beside a road — wherever someone needs support', 'Only in professional counseling rooms', 'Only in government buildings'], correct: 1 },
                    ]
                },
                {
                    id: 'act3', title: 'Look, Listen, Link', description: 'The three pillars of PFA: LOOK to assess the situation and identify needs. LISTEN to hear, validate, and calm. LINK to connect people to resources and support.', duration: '15 min', xpReward: 50, coinReward: 12, videoTitle: 'The Three Pillars', videoDesc: 'Look around, listen carefully, link to support.', quiz: [
                        { question: 'In PFA, "LOOK" primarily means:', options: ['Looking for medical supplies', 'Observing the situation, identifying who needs help, and checking for safety', 'Looking at your phone for instructions', 'Watching news coverage of the disaster'], correct: 1 },
                        { question: '"LISTEN" in PFA involves:', options: ['Giving advice as quickly as possible', 'Actively hearing someone\'s concerns without judgment and validating their feelings', 'Listening to official radio channels only', 'Recording their testimony for legal purposes'], correct: 1 },
                        { question: '"LINK" means connecting people to:', options: ['Social media groups', 'Professional support, community resources, and personal support networks', 'News outlets for information', 'Insurance companies for claims'], correct: 1 },
                    ]
                },
            ],
            liaChat: {
                pre: [
                    { from: 'lia', text: 'chapter 2 time! 🩹 we\'re getting into the real stuff now' },
                    { from: 'lia', text: 'before we start — how comfortable are you with supporting someone who\'s going through a tough time?', type: 'scale', scaleLabel: ['idk what to do', 'a bit lost', 'i can try', 'fairly comfortable', 'i got this'], key: 'pfa_comfort' },
                    { from: 'lia', text: 'and how well do you understand your own emotions when things get intense?', type: 'scale', scaleLabel: ['no clue', 'barely', 'somewhat', 'pretty well', 'very well'], key: 'self_awareness' },
                ],
                post: [
                    { from: 'lia', text: 'PFA basics down!! 💪 how comfortable do you feel NOW about supporting others?', type: 'scale', scaleLabel: ['idk what to do', 'a bit lost', 'i can try', 'fairly comfortable', 'i got this'], key: 'pfa_comfort' },
                    { from: 'lia', text: 'and your self-awareness — did it level up?', type: 'scale', scaleLabel: ['no clue', 'barely', 'somewhat', 'pretty well', 'very well'], key: 'self_awareness' },
                    { from: 'lia', text: 'proud of you 🫶 buckle up for the next field mission tho...' },
                ],
            },
            questId: 'quest_ch2',
            bridgeId: 'bridge_ch2_ch2h',
            status: 'locked',
        },
        {
            id: 'ch2h',
            title: 'Chapter 2.5 — Community Adaptation',
            subtitle: 'Community Adaptation & Seasonal Disasters',
            icon: '🌊',
            description: 'Modern Malaysia bets everything on engineering. Rural Thailand trusts the river\'s mood. When a flash flood kills the power grid — which philosophy saves more lives?',
            location: '🇲🇾 Malaysia · 🇹🇭 Thailand',
            color: '#DC2626',
            type: 'simulation',
            difficulty: 'Medium',
            destinations: ['🇲🇾 Malaysia', '🇹🇭 Thailand'],
            chatSimulation: true,
            npcCharacters: [
                { id: 'eng_farah', name: 'Ir. Farah Azri', role: 'Malaysian Flood Prevention Engineer', avatar: '👩‍💼', country: '🇲🇾' },
                { id: 'ajarn_som', name: 'Ajarn Somchai', role: 'Thai Village Chief & Flood Wisdom Keeper', avatar: '👨‍🌾', country: '🇹🇭' },
            ],
            acts: [
                {
                    id: 'act1', title: 'Malaysian Infrastructure', chatSimulation: true, description: 'Ir. Farah walks you through Malaysia\'s SMART Tunnel — a $500M engineering marvel that doubles as a highway and flood bypass. But she has a confession about its biggest weakness.', duration: '12 min', xpReward: 50, coinReward: 10, chatFlow: [
                        { from: 'lia', text: 'we\'re in Kuala Lumpur 🇲🇾 meeting Ir. Farah — she\'s an engineer on the SMART Tunnel project!' },
                        { from: 'lia', text: 'this is like the most expensive piece of flood infrastructure in all of Southeast Asia btw 🤯' },
                        { from: 'eng_farah', text: 'Welcome. The Stormwater Management And Road Tunnel — SMART — cost 1.8 billion ringgit and took 4 years to build.' },
                        { from: 'eng_farah', text: 'It operates in three modes. Normal: it\'s just a highway. Mode 2: lower level floods while cars still drive above. Mode 3: total flood bypass. All traffic stops and 3 million cubic meters of water flows through.' },
                        { from: 'lia', text: 'wait so the ROAD itself becomes a river?? that\'s genius 😮' },
                        { from: 'eng_farah', text: 'Genius... and dangerous. Because here\'s Malaysia\'s big secret: we\'ve built one of the world\'s best flood systems. But I\'ll tell you its weakness.' },
                        {
                            from: 'eng_farah', text: 'What do YOU think is the biggest weakness of relying purely on engineering solutions?', type: 'choice', choices: [
                                { text: 'The cost is too high for most countries', hpEffect: 0, response: 'Cost matters, but that\'s not the critical flaw.' },
                                { text: 'When the system fails, people who trusted it completely don\'t know what to do', hpEffect: 5, response: 'Exactly. Overreliance on infrastructure creates a dangerous complacency. When tech fails, untrained communities are the most vulnerable.' },
                                { text: 'It takes too long to build', hpEffect: -5, response: 'Speed matters, but the real danger is what happens to people\'s instincts when they believe technology will always save them.' },
                            ], key: 'my_infra_weakness'
                        },
                        { from: 'eng_farah', text: 'In the 2021 Shah Alam floods, entire neighborhoods were submerged because residents believed the drainage system would protect them. They didn\'t evacuate until it was too late.' },
                        { from: 'eng_farah', text: 'Fifty-four people died. Not because we lacked infrastructure — but because people had forgotten how to survive WITHOUT it.' },
                        { from: 'lia', text: 'that\'s... terrifying. Singapore\'s Dr. Tan said something similar — tech alone isn\'t enough. you need the CULTURE of preparedness too' },
                        { from: 'eng_farah', text: 'Precisely. After Shah Alam, we created the "Jiran Prihatin" program — Caring Neighbor initiative. We train community leaders to organize evacuations even when ALL systems are down.' },
                    ], quiz: [
                        { question: 'The biggest risk of purely engineering-based flood prevention is:', options: ['High cost', 'Community complacency when systems fail', 'Slow construction', 'Environmental damage'], correct: 1 },
                        { question: 'Malaysia\'s SMART Tunnel serves what dual purpose?', options: ['Train station and flood bypass', 'Highway and flood diversion channel', 'Power plant and reservoir', 'Shopping mall and drainage'], correct: 1 },
                    ]
                },
                {
                    id: 'act2', title: 'Thai Community Wisdom', chatSimulation: true, description: 'Ajarn Somchai hasn\'t lost a single villager to floods in 40 years. His secret? He listens to the ants, watches the elephants, and reads the river like a sacred text.', duration: '15 min', xpReward: 50, coinReward: 12, chatFlow: [
                        { from: 'lia', text: 'now to rural Thailand 🇹🇭 heading to a village along the Chao Phraya river' },
                        { from: 'lia', text: 'Ajarn Somchai has been the village chief for 40 years. ZERO flood deaths on his watch. ZERO. in one of the most flood-prone regions in Asia!!!' },
                        { from: 'ajarn_som', text: 'Welcome, young travelers. You come from the world of computers and satellites. Let me show you something older — and perhaps wiser.' },
                        { from: 'ajarn_som', text: 'The river speaks, child. When the water turns brown two days before the rain, the soil upstream is already saturated. That is when I ring the bell.' },
                        { from: 'ajarn_som', text: 'When the frogs stop singing at night, the pressure is dropping. When the elephants at the temple become restless, the earth itself is warning us.' },
                        { from: 'lia', text: 'so you basically read NATURE like Dr. Tan reads data dashboards? 🐜🐘' },
                        { from: 'ajarn_som', text: 'Exactly. My "dashboard" is 600 years of accumulated observation. No battery required. No internet needed.' },
                        {
                            from: 'ajarn_som', text: 'Your turn. The ants are moving to higher ground and the well water tastes metallic. What does this mean?', type: 'choice', choices: [
                                { text: 'The ants are just migrating seasonally', hpEffect: -10, response: 'No! When ants move upward and water tastes of iron, the water table is rising fast. A flood is 24-48 hours away.' },
                                { text: 'Heavy rain or flooding is coming within 1-2 days', hpEffect: 5, response: 'Correct. You\'re learning to read nature\'s signals. These signs have saved thousands of lives across generations.' },
                                { text: 'It means the dry season is ending', hpEffect: -5, response: 'Partially true, but the urgency is greater — these are immediate flood indicators, not seasonal markers.' },
                            ], key: 'th_nature_signs'
                        },
                        { from: 'ajarn_som', text: 'My village has a rule: when I ring the bell, everyone moves. No debate. No committees. The bell rings, you walk uphill. That trust took 40 years to build.' },
                        { from: 'lia', text: 'Malaysia builds tunnels, Thailand builds TRUST. i\'m starting to see the pattern now 🤔' },
                    ], quiz: [
                        { question: 'Ajarn Somchai\'s zero-death record is primarily due to:', options: ['Government-provided technology', 'Reading natural signs and traditional knowledge', 'Military evacuation drills', 'Building higher walls'], correct: 1 },
                    ]
                },
                {
                    id: 'act3', title: '⚡ System Lockdown', chatSimulation: true, description: 'A simulated flash flood hits. The SMART Tunnel overflows. Cell towers go dark. GPS is useless. You must choose: trust the dying technology, or follow Ajarn Somchai\'s ancient signs?', duration: '18 min', xpReward: 80, coinReward: 18, chatFlow: [
                        { from: 'lia', text: '⚠️ ALERT: Flash flood simulation activated! Power grid is DOWN. No phones. No GPS.' },
                        { from: 'eng_farah', text: 'The backup generators should— [CONNECTION LOST]' },
                        { from: 'ajarn_som', text: 'The river color changed 6 hours ago. We should have moved then. But there is still time. Do you trust my reading, or wait for the system to restore?' },
                        {
                            from: 'lia', text: 'you HAVE to decide now 😰', type: 'choice', choices: [
                                { text: 'Wait for the tech systems to come back online — they\'re more accurate', hpEffect: -15, response: 'The systems didn\'t come back in time. You waited 40 minutes in rising water. People nearly drowned.' },
                                { text: 'Follow Ajarn Somchai\'s guidance — move to higher ground immediately', hpEffect: 10, response: 'You made it. The water reached chest height 20 minutes after you moved. Traditional knowledge bought you survival time.' },
                                { text: 'Split up — half wait for tech, half follow Somchai', hpEffect: -5, response: 'The group that waited nearly didn\'t make it. Splitting resources during a crisis weakened everyone.' },
                            ], key: 'lockdown_choice'
                        },
                    ], quiz: [
                        { question: 'When technology fails during a disaster, the best backup is:', options: ['Waiting for restoration', 'Traditional knowledge and community leadership', 'Individual decision-making', 'Military intervention'], correct: 1 },
                    ]
                },
                {
                    id: 'act4', title: '🫀 Calm Your Heart', chatSimulation: true, description: 'Ir. Farah is hyperventilating. She\'s never been in a flood without her instruments. You must use what you learned about personal PFA to stabilize HER — before the water rises higher.', duration: '15 min', xpReward: 80, coinReward: 18, chatFlow: [
                        { from: 'lia', text: 'Farah is NOT ok. she\'s panicking. you need to help her RIGHT NOW.' },
                        { from: 'eng_farah', text: '[gasping] I can\'t— the readings— my instruments— I don\'t know what to do without data—' },
                        {
                            from: 'lia', text: 'remember Look · Listen · Link? what do you do FIRST?', type: 'choice', choices: [
                                { text: 'LOOK: Check if Farah and the area around you are physically safe', hpEffect: 5, response: 'Good instinct. You confirmed no immediate physical danger, which let you focus on Farah\'s emotional state.' },
                                { text: 'Tell her to calm down and stop panicking', hpEffect: -10, response: 'Never tell someone in panic to "calm down." It invalidates their fear and makes them feel worse.' },
                                { text: 'Give her your phone to check for data', hpEffect: -5, response: 'There\'s no signal. Offering false hope makes the crash harder when reality hits.' },
                            ], key: 'pfa_farah'
                        },
                        { from: 'ajarn_som', text: 'You did well. She needed a human anchor, not more data. Remember this — sometimes the best technology is your own presence.' },
                    ], quiz: [
                        { question: 'When someone is panicking, the WORST thing you can say is:', options: ['I\'m here with you', 'Calm down, stop panicking', 'Tell me what you need', 'You\'re safe right now'], correct: 1 },
                    ]
                },
            ],
            liaChat: {
                pre: [
                    { from: 'lia', text: '⚠️ heads up — this chapter gets INTENSE' },
                    { from: 'lia', text: 'how calm do you think you\'d be if technology suddenly failed during a disaster?', type: 'scale', scaleLabel: ['id freeze', 'pretty scared', 'nervous but ok', 'id manage', 'bring it on'], key: 'tech_fail_calm' },
                ],
                post: [
                    { from: 'lia', text: 'omg you made it through the lockdown!! 🔓' },
                    { from: 'lia', text: 'after that experience — how calm would you be if tech failed during a real emergency?', type: 'scale', scaleLabel: ['id freeze', 'pretty scared', 'nervous but ok', 'id manage', 'bring it on'], key: 'tech_fail_calm' },
                    { from: 'lia', text: 'you literally proved you can handle it 💪 onwards!!' },
                ],
            },
            questId: 'quest_ch2h',
            bridgeId: 'bridge_ch2h_ch3',
            status: 'locked',
        },
        {
            id: 'ch3',
            title: 'Chapter 3 — Implementing PFA for Your Heart',
            subtitle: 'Personal Psychological First Aid',
            icon: '🧘',
            description: 'Apply Look, Listen, and Link to yourself. Learn to identify stress signals across physical, emotional, mental, spiritual, and behavioral dimensions. Process and validate your feelings using breathing techniques. Connect with coping activities and support networks.',
            location: '🏫 School',
            color: '#8B5CF6',
            type: 'theory',
            difficulty: null,
            destinations: [],
            acts: [
                {
                    id: 'act1', title: 'Look for The Signs', description: 'The first stage of PFA: LOOK. Learn how to identify signs of stress in yourself — from physical signals like trembling hands, to emotional, mental, spiritual, and behavioral indicators.', duration: '15 min', xpReward: 60, coinReward: 12, videoTitle: 'Recognizing Stress Signals', videoDesc: 'Identifying stress through physical, emotional, mental, spiritual, and behavioral signs.', quiz: [
                        { question: 'Which of the following is a PHYSICAL sign of stress?', options: ['Feeling hopeful about the future', 'Trembling hands, rapid heartbeat, or tension headaches', 'Having a clear plan of action', 'Feeling hungry after a long day'], correct: 1 },
                        { question: 'A BEHAVIORAL sign of stress might include:', options: ['Sleeping well every night', 'Withdrawal from social activities, aggression, or substance use', 'Exercising regularly', 'Reading books for relaxation'], correct: 1 },
                        { question: 'Why is it important to recognize SPIRITUAL signs of stress?', options: ['It is not relevant to PFA', 'Because loss of meaning, hopelessness, or questioning one\'s purpose can deeply affect recovery', 'Spiritual stress only affects religious people', 'Spiritual stress is always temporary'], correct: 1 },
                    ]
                },
                {
                    id: 'act2', title: 'Listen to Your Feelings', description: 'The second stage: LISTEN. Learn how to process and validate what you\'re feeling by understanding its cause. Practice the Breathing Technique as a method to calm your body and mind.', duration: '15 min', xpReward: 60, coinReward: 12, videoTitle: 'Processing Your Emotions', videoDesc: 'Validating feelings and using breathing techniques to manage stress.', quiz: [
                        { question: 'What does it mean to "validate" your feelings?', options: ['Ignoring them until they go away', 'Acknowledging that your emotions are real and understandable given the situation', 'Convincing yourself you shouldn\'t feel that way', 'Asking others to confirm your feelings are correct'], correct: 1 },
                        { question: 'The Breathing Technique in PFA helps because:', options: ['It replaces the need for professional help', 'Slow, controlled breathing activates the parasympathetic nervous system, reducing the stress response', 'It is a distraction technique that avoids the real problem', 'It only works during panic attacks'], correct: 1 },
                        { question: 'When you identify the CAUSE of your stress, you should:', options: ['Blame someone else for it', 'Acknowledge it without judgment and consider what is within your control', 'Suppress the feeling to stay productive', 'Immediately fix the cause at any cost'], correct: 1 },
                    ]
                },
                {
                    id: 'act3', title: 'Link and Connect', description: 'The third stage: LINK. Learn how to cope by engaging in activities that make you feel better and by reaching out to people you trust. Connection is the antidote to distress.', duration: '15 min', xpReward: 60, coinReward: 12, videoTitle: 'Coping & Connection', videoDesc: 'Activities and people that help you recover from stress.', quiz: [
                        { question: 'Which of the following is a healthy coping activity after a stressful event?', options: ['Isolating yourself completely', 'Engaging in physical activity, journaling, or creative expression', 'Avoiding all thoughts about the event forever', 'Using substances to numb your feelings'], correct: 1 },
                        { question: 'Talking to a trusted person about your feelings after a disaster:', options: ['Is a sign of weakness', 'Helps process emotions and reduces the burden of carrying stress alone', 'Should be avoided to not burden others', 'Is only appropriate in formal therapy'], correct: 1 },
                        { question: 'The most important quality of a personal support network is:', options: ['Having as many people as possible', 'Trust, availability, and mutual care', 'Only including family members', 'Only including professional therapists'], correct: 1 },
                    ]
                },
            ],
            liaChat: {
                pre: [
                    { from: 'lia', text: 'this chapter is all about YOU 🫵 let\'s go deep' },
                    { from: 'lia', text: 'how well do you think you understand your own reactions when things go wrong?', type: 'scale', scaleLabel: ['no idea', 'barely', 'a little', 'pretty well', 'like a pro'], key: 'self_understanding' },
                    { from: 'lia', text: 'and how connected do you feel to people who\'d support you in tough times?', type: 'scale', scaleLabel: ['alone', 'not really', 'a few people', 'solid crew', 'army behind me'], key: 'support_network' },
                ],
                post: [
                    { from: 'lia', text: 'deep dive complete 🧘 how well do you understand your reactions NOW?', type: 'scale', scaleLabel: ['no idea', 'barely', 'a little', 'pretty well', 'like a pro'], key: 'self_understanding' },
                    { from: 'lia', text: 'and your support network — feel stronger?', type: 'scale', scaleLabel: ['alone', 'not really', 'a few people', 'solid crew', 'army behind me'], key: 'support_network' },
                    { from: 'lia', text: 'you\'re becoming seriously resilient 🌟' },
                ],
            },
            questId: 'quest_ch3',
            bridgeId: 'bridge_ch3_ch3h',
            status: 'locked',
        },
        {
            id: 'ch3h',
            title: 'Chapter 3.5 — Personal Emergency Drill',
            subtitle: 'Personal Emergency Simulation',
            icon: '⛈️',
            description: 'You are no longer observing. A tropical storm tears through the Mekong Delta. Roads vanish underwater. Your phone dies. Three countries. Three crises. One rule: you can only save yourself.',
            location: '🇻🇳 Vietnam · 🇰🇭 Cambodia · 🇱🇦 Laos',
            color: '#B91C1C',
            type: 'simulation',
            difficulty: 'Medium-High',
            destinations: ['🇻🇳 Vietnam', '🇰🇭 Cambodia', '🇱🇦 Laos'],
            chatSimulation: true,
            npcCharacters: [
                { id: 'nguyen', name: 'Nguyễn Thị Hoa', role: 'Vietnamese Red Cross Volunteer', avatar: '👩‍⚕️', country: '🇻🇳' },
                { id: 'sokha', name: 'Sokha', role: 'Cambodian Street Kid Survivor', avatar: '👦', country: '🇰🇭' },
                { id: 'kham', name: 'Khamla', role: 'Laotian Farmer & River Guide', avatar: '🧑‍🌾', country: '🇱🇦' },
            ],
            acts: [
                {
                    id: 'act1', title: 'Storm in Vietnam', chatSimulation: true, description: 'Trapped in Hội An when a tropical storm makes landfall. Nguyễn Hoa finds you sheltering in a flooded alley. She offers a choice that will define the rest of your journey.', duration: '15 min', xpReward: 70, coinReward: 15, chatFlow: [
                        { from: 'lia', text: '🚨 STORM WARNING — you\'re in Hội An, Vietnam. the streets are flooding FAST.' },
                        { from: 'lia', text: 'the old town is built at river level. when it rains like this, the Thu Bồn River overflows in MINUTES.' },
                        { from: 'nguyen', text: 'Hey! You — you can\'t stay here. The water will reach waist height in 20 minutes. Come with me or find your own way.' },
                        { from: 'nguyen', text: 'I\'ve been through twelve floods. I know every alley, every elevated path. But I need to know — can you handle this?' },
                        {
                            from: 'nguyen', text: 'LOOK at yourself first. Your hands — are they shaking?', type: 'choice', choices: [
                                { text: 'Yes. I\'m terrified and I can feel it in my body.', hpEffect: 5, response: 'Good. Acknowledging fear is the first step to managing it. You just used LOOK on yourself. Hoa nods: \"Honest. I can work with honest.\"' },
                                { text: 'I\'m fine. Let\'s just go.', hpEffect: -5, response: 'Denying your fear doesn\'t make it disappear. Hoa frowns: \"People who say they\'re fine in a storm are the ones who freeze when it gets worse.\"' },
                                { text: 'I don\'t know — I can\'t think straight.', hpEffect: 0, response: 'That\'s honest. Hoa grabs your shoulder: \"When you can\'t think, slow down. Breathe. Then LOOK.\"' },
                            ], key: 'vn_self_look'
                        },
                        { from: 'nguyen', text: 'Quick exercise. Name 3 things you can see right now. Don\'t think — just say them.' },
                        { from: 'lia', text: '👆 she\'s teaching you grounding. this is a real PFA technique — 5-4-3-2-1 sensory anchoring.' },
                        { from: 'nguyen', text: 'Good. Now two sounds. The rain on the roof tiles... the river. Your brain is anchored to NOW. Not to fear.' },
                        {
                            from: 'lia', text: 'the water is rising. Hoa says there are two routes. which one?', type: 'choice', choices: [
                                { text: 'The rooftop path — slower but stays above water level', hpEffect: 5, response: 'Smart. Hoa leads you across connected rooftops. Your legs burn but your feet stay dry. \"LOOK before you move,\" she says. \"Every time.\"' },
                                { text: 'The main road — faster but the water is ankle-deep and rising', hpEffect: -5, response: 'You wade into brown water. Something sharp cuts your foot. Hoa pulls you onto a wall: \"Speed means nothing if you can\'t walk tomorrow.\"' },
                                { text: 'Ask Hoa which she recommends — she knows this city', hpEffect: 10, response: 'Hoa smiles for the first time. \"Rooftops. Always rooftops.\" LISTENing to local knowledge just saved your energy and your feet.' },
                            ], key: 'vn_route'
                        },
                        { from: 'nguyen', text: '[at the Red Cross shelter] You made it. Not everyone does on their first storm. Rest now.' },
                        { from: 'lia', text: 'she\'s seen so many storms. but did you notice? she was scared too. she just knew HOW to manage it 💪' },
                    ], quiz: [
                        { question: 'During a crisis, acknowledging fear is important because:', options: ['It makes you weaker', 'It\'s the first step to managing your stress response', 'Others will help you more', 'It doesn\'t matter'], correct: 1 },
                    ]
                },
                {
                    id: 'act2', title: 'Flood Crisis in Cambodia', chatSimulation: true, description: 'Sokha is 14, alone, and has survived three floods by himself. He doesn\'t trust adults. He doesn\'t trust you. Can you LISTEN well enough to earn his trust before the water rises?', duration: '18 min', xpReward: 80, coinReward: 18, chatFlow: [
                        { from: 'lia', text: 'you crossed into Cambodia. the flooding is worse here. and there\'s a kid — Sokha — he\'s alone 🥺' },
                        { from: 'lia', text: 'he\'s been sitting on the same rooftop since yesterday. won\'t come down. won\'t talk to the aid workers.' },
                        { from: 'sokha', text: '...go away. I don\'t need help. I survived the last three floods alone. Adults always promise help and then disappear.' },
                        { from: 'lia', text: 'he\'s 14. his parents went to Thailand for work and never came back. he\'s been alone for 2 years. 💔' },
                        {
                            from: 'lia', text: 'he won\'t trust you easily. what\'s your move?', type: 'choice', choices: [
                                { text: 'Sit nearby silently and wait. Let him see you\'re not leaving.', hpEffect: 5, response: 'You sit 3 meters away. Say nothing. 10 minutes pass. Sokha\'s eyes dart toward you. Then: \"...you\'re still here.\" You just used LISTEN — sometimes it means listening to silence.' },
                                { text: 'Tell him you\'re here to help and he needs to come with you now.', hpEffect: -10, response: 'Sokha jumps back. \"See?! Just like the others. TELLING me what to do!\" He runs to the far edge of the roof. Pushing too hard confirmed his fear that adults are controlling.' },
                                { text: 'Offer food and water first, then try to talk.', hpEffect: 0, response: 'He takes the water bottle without looking at you. Drinks half in one gulp. He was dehydrated. \"...thanks.\" It\'s something — but he needs emotional safety, not just physical resources.' },
                            ], key: 'kh_sokha_trust'
                        },
                        { from: 'sokha', text: '...my friend Dara. he was with me last flood. we had a system. we\'d signal each other from the rooftops with flashlights.' },
                        { from: 'sokha', text: 'Dara moved to Phnom Penh. Now it\'s just me.' },
                        { from: 'lia', text: 'he\'s opening up 🥺 this is LISTENing in action — he\'s telling you what he LOST. not just things. PEOPLE.' },
                        {
                            from: 'lia', text: 'Sokha trusts you enough to talk. but the water is still rising. what now?', type: 'choice', choices: [
                                { text: 'Ask Sokha what HIS plan would be — he knows this area better than you', hpEffect: 10, response: 'Sokha\'s eyes light up. \"There\'s a temple on the hill. Concrete. It survived every flood.\" You just gave him agency. He\'s not a victim anymore — he\'s a guide.' },
                                { text: 'Tell Sokha to follow you to the evacuation point the Red Cross set up', hpEffect: 0, response: 'Sokha goes quiet. He follows but looks miserable. You solved the problem but took away his control. Sometimes being safe isn\'t enough — feeling respected matters too.' },
                                { text: 'Carry him to safety — he\'s just a kid', hpEffect: -10, response: 'Sokha shoves you away. \"I\'m NOT a baby!\" He survived 3 floods alone. Treating him as helpless erases his strength. Responders empower — they don\'t infantilize.' },
                            ], key: 'kh_sokha_plan'
                        },
                        { from: 'sokha', text: '[walking together] ...you\'re the first person who asked what I think.' },
                        { from: 'lia', text: 'LISTENing changed him. not from being afraid — from being INVISIBLE. you gave him the most powerful gift: being heard. 💛' },
                    ], quiz: [
                        { question: 'When someone doesn\'t trust you, the most effective PFA approach is:', options: ['Assert authority to show competence', 'Be present and patient — show through actions, not words', 'Offer material resources immediately', 'Call for professional help and leave'], correct: 1 },
                    ]
                },
                {
                    id: 'act3', title: 'Drought in Laos', chatSimulation: true, description: 'The Mekong drops to its lowest level in decades. Khamla\'s village is dying of thirst. He knows a hidden spring — but it\'s across territory claimed by another village. Will you LINK across cultural boundaries?', duration: '18 min', xpReward: 70, coinReward: 15, chatFlow: [
                        { from: 'lia', text: 'the flooding receded but now the REAL crisis: the Mekong is drying up. Khamla\'s village has no clean water.' },
                        { from: 'lia', text: 'the Mekong used to be 12 meters deep here. now it\'s less than 3. the fish are gone. the rice paddies are cracking.' },
                        { from: 'kham', text: 'My grandfather fished this river for 60 years. He said the spirits would always provide. But even spirits cannot fight the dams upstream.' },
                        { from: 'kham', text: 'There is a spring. Fresh water. But it\'s on land claimed by the village across the river. We\'ve been in conflict for decades over fishing rights.' },
                        { from: 'lia', text: 'this is LINK territory — connecting people across divides. but it\'s not easy when history is involved.' },
                        {
                            from: 'kham', text: 'If we go together, how should we approach their chief?', type: 'choice', choices: [
                                { text: 'Offer something in trade — cooperation must be mutual', hpEffect: 5, response: 'Khamla nods slowly. "Our rice harvest... we share it. In exchange for water access." The rival chief considers. "...your grandfather helped mine build a boat, once. I remember." Both villages survived because someone chose cooperation.' },
                                { text: 'Just take the water — survival is more important than politics', hpEffect: -15, response: 'The rival village spotted you at the spring. They\'re furious. They blocked the path with fallen trees. Khamla is devastated: "You turned water into war." Now both communities are losing.' },
                                { text: 'Ask Lia to mediate as a neutral party', hpEffect: 0, response: 'I appreciate the trust, but LINKing requires YOU to build the bridge. I can support, but you must lead the connection. That\'s what makes you a responder, not a bystander.' },
                            ], key: 'la_diplomacy'
                        },
                        { from: 'kham', text: '[at the spring] The water is cold and clean. Both villages are drinking from it now.' },
                        {
                            from: 'lia', text: 'the rival chief asks if this arrangement can be permanent. what do you suggest?', type: 'choice', choices: [
                                { text: 'Create a shared council — both village chiefs manage the spring together', hpEffect: 10, response: 'A joint water council. Both villages have a voice. You just turned a crisis into a community institution. This is LINK at its most powerful — lasting connection.' },
                                { text: 'Leave it as a temporary emergency arrangement', hpEffect: 0, response: 'Fair. But when the next drought comes, will they cooperate again? Or will the old distrust return? Sustainability matters in disaster response.' },
                                { text: 'Let the government decide water rights formally', hpEffect: -5, response: 'The nearest government office is 4 hours away. By the time bureaucracy moves, people will have already dehydrated. Local solutions save lives faster.' },
                            ], key: 'la_longterm'
                        },
                        { from: 'lia', text: 'LINK isn\'t just connecting people in the moment — it\'s building structures that survive the next crisis. 🌉' },
                    ], quiz: [
                        { question: 'LINK across cultural boundaries requires:', options: ['Imposing your own solution', 'Mutual respect and finding shared interests', 'Avoiding the conflict entirely', 'Military intervention'], correct: 1 },
                    ]
                },
                {
                    id: 'act4', title: '🧭 Find the Exit', chatSimulation: true, description: 'All three principles at once. The storm returns. Sokha is panicking. Khamla is injured. And you need to navigate a flooded rice paddy in the dark to reach the evacuation point — alone.', duration: '22 min', xpReward: 100, coinReward: 22, chatFlow: [
                        { from: 'lia', text: 'the storm is BACK. this is the final test. everyone is counting on you.' },
                        { from: 'sokha', text: '[shaking] I can\'t... I can\'t do this again...' },
                        { from: 'kham', text: '[clutching his leg] My ankle... I stepped in a hidden ditch. I can\'t walk.' },
                        {
                            from: 'lia', text: 'LOOK · LISTEN · LINK. all three. right now. what comes first?', type: 'choice', choices: [
                                { text: 'LOOK: Scan for dangers, check everyone\'s physical state, assess the water level', hpEffect: 10, response: 'Perfect sequence. You identified the rising water, confirmed Khamla needs support walking, and noticed Sokha needs emotional anchoring.' },
                                { text: 'Carry Khamla and tell Sokha to follow', hpEffect: -5, response: 'You acted without assessing. Sokha froze behind you and nearly got separated in the dark water.' },
                                { text: 'LISTEN: Ask how everyone is feeling', hpEffect: 0, response: 'Emotion matters, but in immediate danger, LOOK comes first — assess physical safety, then emotional state.' },
                            ], key: 'final_drill'
                        },
                        { from: 'lia', text: 'good. you LOOKed first. now... Sokha.' },
                        { from: 'sokha', text: '[hyperventilating] the water... it\'s coming up... it\'s like last time...' },
                        {
                            from: 'lia', text: 'Sokha is having a flashback. what\'s your LISTEN move?', type: 'choice', choices: [
                                { text: 'Get at his eye level and say: "Sokha. Can you hear my voice? Tell me what you see right NOW."', hpEffect: 10, response: 'Sokha\'s breathing slows. "I see... mud. And you." Grounding works. You pulled him out of the past and into the present.' },
                                { text: 'Tell him to calm down — panicking won\'t help anyone', hpEffect: -10, response: 'Telling someone to calm down during a flashback is like telling someone to stop bleeding. It doesn\'t work and it makes them feel broken.' },
                                { text: 'Hug him tightly and tell him it\'ll be okay', hpEffect: 0, response: 'Physical contact without consent during a trauma response can feel like restraint. He flinches. Good intentions, wrong approach.' },
                            ], key: 'final_listen'
                        },
                        { from: 'kham', text: 'The water reached my knee. We need to move NOW.' },
                        {
                            from: 'lia', text: 'final move. how do you LINK everyone together to get to safety?', type: 'choice', choices: [
                                { text: 'Khamla leans on you for his ankle. Sokha walks ahead — he knows these fields. Give everyone a role.', hpEffect: 15, response: 'Khamla has your shoulder. Sokha has the flashlight. You have both of them. Three people, three strengths, ONE team. This is LINK.' },
                                { text: 'You carry Khamla and let Sokha follow', hpEffect: 0, response: 'Khamla is heavy and Sokha falls behind in the dark. You arrive, but barely. A team is stronger than a hero carrying dead weight.' },
                                { text: 'Send Sokha ahead to get help while you stay with Khamla', hpEffect: -5, response: 'Sokha doesn\'t know who to find. He wanders in the dark, scared. Splitting up removed your biggest asset: each other.' },
                            ], key: 'final_link'
                        },
                        { from: 'sokha', text: '[at the evacuation point, trembling but smiling] ...we made it.' },
                        { from: 'kham', text: 'You were good tonight. Even my grandfather would say so.' },
                        { from: 'lia', text: 'you got everyone to safety. LOOK · LISTEN · LINK. all three. in the dark. in the rain. YOU did that. 🥹' },
                    ], quiz: [
                        { question: 'In an active emergency with multiple people, the correct PFA sequence is:', options: ['LISTEN → LOOK → LINK', 'LINK → LISTEN → LOOK', 'LOOK → LISTEN → LINK', 'Any order works'], correct: 2 },
                    ]
                },
            ],
            liaChat: {
                pre: [
                    { from: 'lia', text: '🚨 this is NOT a drill — well ok it is but it\'ll FEEL real' },
                    { from: 'lia', text: 'you\'re going survivalist mode. how ready are you to handle a crisis on your own?', type: 'scale', scaleLabel: ['nope', 'kinda scared', 'i\'ll try', 'fairly ready', 'let\'s go'], key: 'solo_readiness' },
                ],
                post: [
                    { from: 'lia', text: 'YOU SURVIVED 🎉🎉🎉 that was INTENSE' },
                    { from: 'lia', text: 'after going through all that — how ready do you feel to handle a crisis solo?', type: 'scale', scaleLabel: ['nope', 'kinda scared', 'i\'ll try', 'fairly ready', 'let\'s go'], key: 'solo_readiness' },
                    { from: 'lia', text: 'you\'re not just learning anymore... you\'re becoming a responder 🫡' },
                ],
            },
            questId: 'quest_ch3h',
            bridgeId: 'bridge_ch3h_ch4',
            status: 'locked',
        },
        {
            id: 'ch4',
            title: 'Chapter 4 — Implementing PFA for People\'s Heart',
            subtitle: 'Psychological First Aid for Others',
            icon: '🤝',
            description: 'Apply Look, Listen, and Link to help others. Learn to assess situations, identify who needs support, approach and actively listen to people in distress, and connect them to information, psychoeducation, basic needs, and social support.',
            location: '🏫 School',
            color: '#2563EB',
            type: 'theory',
            difficulty: null,
            destinations: [],
            acts: [
                {
                    id: 'act1', title: 'Look for The Signs', description: 'LOOK for others: identify the current situation, who needs help first, check safety and security risks, physical injuries, immediate basic and practical needs, and emotional reactions around you.', duration: '18 min', xpReward: 75, coinReward: 15, videoTitle: 'Assessing the Situation', videoDesc: 'How to identify who needs help and prioritize in a disaster zone.', quiz: [
                        { question: 'When LOOKing at a disaster scene to help others, your FIRST priority is:', options: ['Providing emotional support to the nearest person', 'Assessing safety and security risks for yourself and others', 'Counting the total number of affected people', 'Looking for news cameras to report'], correct: 1 },
                        { question: 'Identifying "who needs help first" involves checking for:', options: ['Only physical injuries visible to the eye', 'Safety risks, physical injuries, basic needs, AND emotional reactions', 'Only people who are crying or screaming', 'Only children and elderly people'], correct: 1 },
                        { question: 'A person who appears physically uninjured but is staring blankly and unresponsive likely:', options: ['Is fine and doesn\'t need help', 'May be in dissociative shock and needs gentle engagement', 'Should be left alone to recover naturally', 'Is pretending to get attention'], correct: 1 },
                    ]
                },
                {
                    id: 'act2', title: 'Listen to Their Heart', description: 'LISTEN for others: learn how to approach someone who may need support, introduce yourself, practice active listening, accept their feelings, calm the person in distress, ask about their needs, and help find solutions to immediate problems.', duration: '20 min', xpReward: 80, coinReward: 18, videoTitle: 'Active Listening & Support', videoDesc: 'Approaching, introducing, listening, calming, and problem-solving.', quiz: [
                        { question: 'When approaching someone in distress, you should:', options: ['Rush towards them confidently', 'Approach calmly, introduce yourself, and ask if you can help', 'Wait until they ask for help first', 'Start by telling them everything will be fine'], correct: 1 },
                        { question: 'Active listening when helping others means:', options: ['Giving advice as quickly as possible', 'Giving full presence, reflecting their feelings, and validating without judgment', 'Asking many detailed questions about what happened', 'Listening while planning your next steps'], correct: 1 },
                        { question: '"Accepting other\'s feelings" in PFA means:', options: ['Agreeing with everything they say', 'Not judging or dismissing their emotional responses, even if they seem disproportionate', 'Telling them their feelings are normal and they should stop worrying', 'Feeling the same emotions they feel'], correct: 1 },
                    ]
                },
                {
                    id: 'act3', title: 'Link and Connect', description: 'LINK for others: provide access to information about the current situation, share psychoeducation about emotional reactions to disasters and coping methods, help with basic needs, and mobilize social support.', duration: '18 min', xpReward: 75, coinReward: 15, videoTitle: 'Connecting People to Help', videoDesc: 'Information access, psychoeducation, basic needs, and social support.', quiz: [
                        { question: 'Providing "psychoeducation" to disaster-affected people means:', options: ['Giving them a psychology textbook', 'Explaining that their emotional reactions are normal responses to abnormal events and sharing healthy coping strategies', 'Diagnosing their mental health condition', 'Telling them to see a therapist immediately'], correct: 1 },
                        { question: 'When LINKing someone to support, the most important thing is:', options: ['Solving all their problems yourself', 'Ensuring they have access to accurate information, know their options, and feel safe about getting help', 'Making appointments for them without asking', 'Giving them your personal phone number'], correct: 1 },
                        { question: 'Helping with "basic needs" after a disaster includes:', options: ['Only providing food and water', 'Ensuring safety, shelter, food, water, and access to reunification with family members', 'Only providing medical attention', 'Only offering emotional support'], correct: 1 },
                    ]
                },
            ],
            liaChat: {
                pre: [
                    { from: 'lia', text: 'ok this is where it gets REAL. you\'re learning to help OTHERS now 🫂' },
                    { from: 'lia', text: 'how confident do you feel about supporting someone in a really tough moment?', type: 'scale', scaleLabel: ['no idea', 'nervous', 'i\'d try my best', 'fairly confident', 'i\'m ready'], key: 'help_others' },
                    { from: 'lia', text: 'and how well can you stay calm when someone else is freaking out?', type: 'scale', scaleLabel: ['i\'d panic too', 'struggle', 'depends', 'mostly calm', 'rock solid'], key: 'emotional_stability' },
                ],
                post: [
                    { from: 'lia', text: 'you learned SO much 🌟 how confident do you feel about helping others now?', type: 'scale', scaleLabel: ['no idea', 'nervous', 'i\'d try my best', 'fairly confident', 'i\'m ready'], key: 'help_others' },
                    { from: 'lia', text: 'and staying calm when others panic?', type: 'scale', scaleLabel: ['i\'d panic too', 'struggle', 'depends', 'mostly calm', 'rock solid'], key: 'emotional_stability' },
                    { from: 'lia', text: 'next up... the ultimate test. no pressure 😅' },
                ],
            },
            questId: 'quest_ch4',
            bridgeId: 'bridge_ch4_ch4h',
            status: 'locked',
        },
        {
            id: 'ch4h',
            title: 'Chapter 4.5 — Frontline Volunteer Mission',
            subtitle: 'Frontline Volunteer Mission',
            icon: '🔥',
            description: 'The military wants order. The NGO wants aid distribution. The imam wants dignity. The mother wants her child back. Four factions. One disaster zone. Every decision you make saves someone — and fails someone else.',
            location: '🇮🇩 Indonesia · 🇵🇭 Philippines · 🇲🇲 Myanmar',
            color: '#7F1D1D',
            type: 'simulation',
            difficulty: 'Very High',
            destinations: ['🇮🇩 Indonesia', '🇵🇭 Philippines', '🇲🇲 Myanmar'],
            chatSimulation: true,
            npcCharacters: [
                { id: 'kapten_adi', name: 'Kapten Adi Pratama', role: 'Indonesian Military Field Commander', avatar: '🎖️', country: '🇮🇩' },
                { id: 'maria', name: 'Maria Santos', role: 'Philippine NGO Aid Director', avatar: '👩‍💼', country: '🇵🇭' },
                { id: 'u_myint', name: 'U Myint Thein', role: 'Myanmar Buddhist Monastery Abbot', avatar: '🧑‍🦲', country: '🇲🇲' },
                { id: 'ibu_sari', name: 'Ibu Sari', role: 'Indonesian Earthquake Survivor & Mother', avatar: '👩', country: '🇮🇩' },
            ],
            acts: [
                {
                    id: 'act1', title: '🇮🇩 Post-Earthquake Indonesia', chatSimulation: true, description: 'Palu. 7.5 magnitude. Kapten Adi wants martial law. Ibu Sari just wants to know if her daughter is alive. You\'re standing between a soldier and a mother — choose carefully.', duration: '25 min', xpReward: 100, coinReward: 25, chatFlow: [
                        { from: 'lia', text: '🚨 we\'re in Palu, Indonesia. the earthquake was 7.5. buildings are down. kapten adi is in charge but there\'s chaos everywhere.' },
                        { from: 'lia', text: 'the ground liquefied in Petobo. entire neighborhoods sank into the earth. this isn\'t a movie — this actually happened in 2018.' },
                        { from: 'kapten_adi', text: 'Listen — I need order. Civilians must stay behind the perimeter. No one enters the collapse zone. That includes you.' },
                        { from: 'kapten_adi', text: 'I lost two of my own soldiers in the first collapse trying to rescue without a plan. I will NOT lose more people to chaos.' },
                        { from: 'ibu_sari', text: '[crying] My daughter — she was in the school building. Please, you have to let me through. She\'s only 8.' },
                        { from: 'ibu_sari', text: 'Her name is Putri. She was wearing a yellow shirt today. Yellow. She loves yellow.' },
                        { from: 'lia', text: 'the way she\'s describing Putri\'s clothes... she\'s already preparing herself to identify a body. 💔' },
                        {
                            from: 'lia', text: 'kapten adi won\'t budge. ibu sari is breaking down. what do you do?', type: 'choice', choices: [
                                { text: 'Support Kapten Adi — the perimeter is for everyone\'s safety, including Ibu Sari\'s', hpEffect: -5, response: 'Ibu Sari collapses. She screams that you\'re all the same. The crowd grows hostile. A mother watching her world collapse — and you chose a fence. Safety matters, but so does humanity.' },
                                { text: 'Advocate for Ibu Sari — ask Kapten Adi to assign a soldier to escort her to the school zone', hpEffect: 10, response: 'Kapten Adi\'s jaw clenches. But he sees it — a mother\'s desperation isn\'t defiance. It\'s love. He orders: Sersan! Take this woman to sector 3. A compromise. Authority AND compassion.' },
                                { text: 'Sneak Ibu Sari past the perimeter yourself', hpEffect: -15, response: 'Kapten Adi catches you. He revokes your volunteer access. One person breaking rules means everyone thinks they can. You meant well — but short-cuts in disaster zones cost lives.' },
                            ], key: 'palu_crisis'
                        },
                        { from: 'lia', text: 'kapten adi agrees to the escort. the soldier leads Ibu Sari through the rubble...' },
                        { from: 'ibu_sari', text: '[running] PUTRI!! PUTRI SAYANG!!!' },
                        { from: 'lia', text: '...she found her. alive. covered in dust. clutching a book. she\'s alive. 😭' },
                        {
                            from: 'kapten_adi', text: '[to you, quietly] You were right to push back. But tell me — how do I maintain order when every mother in this camp has the same desperation?', type: 'choice', choices: [
                                { text: 'Create a family reunification desk — organized search with registered names, sectors, and updates', hpEffect: 10, response: 'Kapten Adi stares at you. Then he orders his soldiers to set up a registry table. Organized hope, he calls it. You just gave him a system that respects BOTH safety and humanity.' },
                                { text: 'Let families search freely — the perimeter causes more panic than it prevents', hpEffect: -5, response: 'Three minutes later, a secondary collapse injures two civilians in the uncontrolled zone. Freedom without structure is chaos.' },
                                { text: 'I don\'t know — I\'m just a volunteer, not military', hpEffect: 0, response: 'Kapten Adi sighs. Nobody is just anything in a disaster. You saw something I didn\'t. That\'s why we need you. Sometimes you underestimate your own impact.' },
                            ], key: 'palu_system'
                        },
                        { from: 'lia', text: 'you didn\'t just save one child. you changed how this entire camp handles family reunification. that\'s what a RESPONDER does. 🫡' },
                    ], quiz: [
                        { question: 'In a disaster with military control, the best approach to an emotional crisis is:', options: ['Defy orders to help', 'Find a compromise that respects both authority and human dignity', 'Always obey without question', 'Leave and let others handle it'], correct: 1 },
                    ]
                },
                {
                    id: 'act2', title: '🇲🇲 Cyclone in Myanmar', chatSimulation: true, description: 'Cyclone Mocha devastated Rakhine. U Myint Thein\'s monastery shelters 200 Buddhists. But 50 Rohingya refugees are at the gate. Decades of ethnic tension. One decision.', duration: '22 min', xpReward: 120, coinReward: 28, chatFlow: [
                        { from: 'lia', text: 'omg this is the hardest one yet. U Myint Thein\'s monastery has space. but the Rohingya refugees...' },
                        { from: 'u_myint', text: 'For thirty years, my monastery has sheltered the faithful. I have 200 people inside already. The Rohingya... our communities have suffered much conflict. My people will not accept them easily.' },
                        {
                            from: 'u_myint', text: 'But I am a monk. The Buddha teaches compassion for ALL beings. Tell me — what should I do?', type: 'choice', choices: [
                                { text: 'Open the gates to everyone — compassion knows no ethnicity', hpEffect: 5, response: 'U Myint Thein opens the gates. Tensions are high at first, but when a Rohingya mother shares her last rice with a Buddhist child, something shifts. Humanity wins — but it\'s fragile.' },
                                { text: 'Keep the monastery for Buddhists only — mixing will cause violence', hpEffect: -20, response: 'The Rohingya huddle outside in the cyclone. Three don\'t survive the night. You chose safety over justice. History will remember this.' },
                                { text: 'Create separate sections — start with physical safety, then work on integration', hpEffect: 10, response: 'Wise. You respected both communities\' fears while maintaining basic dignity. Separate sections with shared resources. It\'s not perfect, but everyone survives.' },
                            ], key: 'myanmar_access'
                        },
                    ], quiz: [
                        { question: 'When ethnic tensions affect disaster response, the responder should:', options: ['Ignore the tensions and treat everyone equally without any accommodation', 'Acknowledge the tensions, prioritize safety for all, and create practical compromises', 'Support the majority group to maintain order', 'Refuse to get involved in cultural issues'], correct: 1 },
                    ]
                },
                {
                    id: 'act3', title: '🇵🇭 Super Typhoon Philippines', chatSimulation: true, description: 'Super Typhoon Yolanda II. Maria\'s NGO has 500 food packs but 2,000 families need them. The mayor wants everything for his voters. Maria wants fair distribution. Who controls the aid?', duration: '25 min', xpReward: 150, coinReward: 35, chatFlow: [
                        { from: 'lia', text: 'this is a MASSIVE disaster. Maria is trying to distribute aid fairly but the mayor is being... political 😤' },
                        { from: 'maria', text: 'We have 500 food packs. 2,000 families. The mayor wants to hand them out himself — only to his supporters. I want transparent distribution based on need.' },
                        {
                            from: 'maria', text: 'If I defy the mayor, he cuts our access to the disaster zone. If I comply, the most vulnerable get nothing. What would you do?', type: 'choice', choices: [
                                { text: 'Work with the mayor — some aid distributed is better than none', hpEffect: -10, response: 'The aid reaches only political allies. The poorest families, the disabled, the elderly — they got nothing. Pragmatism without justice is just complicity.' },
                                { text: 'Propose public distribution with community witnesses — transparency protects both sides', hpEffect: 10, response: 'Maria holds a public distribution with community leaders present. The mayor can\'t divert aid with everyone watching. Power of transparency.' },
                                { text: 'Report the mayor to higher authorities', hpEffect: -5, response: 'The report takes weeks to process. People starve in the meantime. Accountability matters, but it\'s too slow for a crisis.' },
                            ], key: 'ph_aid'
                        },
                    ], quiz: [
                        { question: 'The most effective way to prevent aid diversion in disasters is:', options: ['Giving all aid to the government', 'Transparent public distribution with community oversight', 'Only using military for distribution', 'Reporting corruption to the media'], correct: 1 },
                    ]
                },
                {
                    id: 'act4', title: '💛 The Heart of a Responder', chatSimulation: true, description: 'Final mission. Ibu Sari found her daughter — alive but traumatized. The child won\'t speak, won\'t eat, won\'t look at anyone. Use everything you\'ve ever learned. This is your moment.', duration: '25 min', xpReward: 150, coinReward: 35, chatFlow: [
                        { from: 'lia', text: 'ibu sari\'s daughter Putri was found. she\'s alive. but she hasn\'t spoken in 3 days. she won\'t eat. she won\'t look at anyone.' },
                        { from: 'lia', text: 'remember the yellow shirt? she\'s still wearing it. dusty. torn at the shoulder. but she won\'t let anyone take it off.' },
                        { from: 'ibu_sari', text: '[whispering] She used to sing all day. Now she just sits there staring at the wall. Please... can you try? I\'ve tried everything.' },
                        { from: 'lia', text: 'Putri is sitting in a corner of the medical tent. her knees are drawn up. her eyes are open but she\'s not really HERE.' },
                        { from: 'lia', text: 'this is called dissociation. her brain protected her by checking out. your job isn\'t to force her back. it\'s to make HERE feel safe enough that she WANTS to return.' },
                        {
                            from: 'lia', text: 'this is everything. LOOK · LISTEN · LINK. for the most vulnerable person you\'ve ever met. go.', type: 'choice', choices: [
                                { text: 'Sit on the floor near Putri — at her eye level — and just be present. Don\'t speak. Don\'t touch. Just exist beside her.', hpEffect: 15, response: 'You sit. Minutes pass. Five. Ten. Twenty. The world shrinks to just this corner. Then — Putri\'s eyes shift. Toward you. Small. Barely perceptible. But she noticed you. She\'s coming back.' },
                                { text: 'Try to engage her with a drawing activity — art can express what words can\'t', hpEffect: 5, response: 'You place crayons near her. She doesn\'t move. After 8 minutes, her hand slides toward the yellow crayon. She holds it but doesn\'t draw. Non-verbal engagement is a start. But she needs presence first.' },
                                { text: 'Talk to her gently about what happened to help her process', hpEffect: -15, response: 'Putri covers her ears and curls tighter. Her body shakes. Asking a traumatized child to verbalize their experience can trigger re-traumatization. Silence was the right medicine.' },
                            ], key: 'putri_pfa'
                        },
                        { from: 'lia', text: 'she looked at you. she LOOKED at you. 🥹' },
                        { from: 'lia', text: 'now — very gently — can you build on that connection?' },
                        {
                            from: 'lia', text: 'Putri\'s eyes are on you. the tiniest window is open. what do you do next?', type: 'choice', choices: [
                                { text: 'Place a crayon and paper between you and her. Start drawing something simple — a sun, a house. Don\'t look at her directly.', hpEffect: 10, response: 'You draw a sun. Simple. Warm. Putri watches your hand move. After a long silence... she picks up the yellow crayon. She draws a small, shaky circle. It\'s a flower. She\'s communicating.' },
                                { text: 'Say her name softly: Putri. I\'m here. You\'re safe now.', hpEffect: 5, response: 'Her name. The first human word directed at her that wasn\'t a question or command. She blinks. Her grip on her knees loosens — just slightly.' },
                                { text: 'Offer her food — she hasn\'t eaten in days', hpEffect: -5, response: 'She turns away. Her body isn\'t hungry — her soul is wounded. Physical needs can wait. Emotional safety comes first for trauma recovery.' },
                            ], key: 'putri_build'
                        },
                        { from: 'ibu_sari', text: '[tears streaming] She... she drew something. She hasn\'t moved her hand in three days.' },
                        { from: 'lia', text: 'and then...' },
                        { from: 'lia', text: 'Putri looks at you. and whispers the first word anyone has heard from her in 72 hours:' },
                        { from: 'lia', text: '...aman. Safe.' },
                        { from: 'ibu_sari', text: '[sobbing, holding Putri] My baby... you\'re back. You\'re back.' },
                        { from: 'lia', text: 'you didn\'t heal her. healing takes months, years, maybe. but you opened the door. you showed her that HERE — right now — is safe enough to come back to. 💛' },
                        { from: 'lia', text: 'THAT is what a responder does. not save. not fix. just... be present. be human. be enough.' },
                    ], quiz: [
                        { question: 'When supporting a traumatized child who won\'t speak, the best approach is:', options: ['Ask them to describe what happened', 'Be physically present without pressure — let them set the pace', 'Distract them with games', 'Leave them alone until they\'re ready'], correct: 1 },
                    ]
                },
            ],
            liaChat: {
                pre: [
                    { from: 'lia', text: '🔥 this is it. the FINAL field mission. the hardest zones in all of ASEAN.' },
                    { from: 'lia', text: 'how ready do you feel to provide real support to people who\'ve been through the worst?', type: 'scale', scaleLabel: ['terrified', 'very nervous', 'nervous but willing', 'ready', 'absolutely ready'], key: 'frontline_ready' },
                    { from: 'lia', text: 'and how well can you handle hearing really heavy stories from survivors?', type: 'scale', scaleLabel: ['i\'d break down', 'struggle a lot', 'it\'d be hard', 'id manage', 'i can hold space'], key: 'emotional_capacity' },
                ],
                post: [
                    { from: 'lia', text: 'YOU. DID. IT. 🥹🥹🥹' },
                    { from: 'lia', text: 'after everything — how ready are you now to support people in the worst situations?', type: 'scale', scaleLabel: ['terrified', 'very nervous', 'nervous but willing', 'ready', 'absolutely ready'], key: 'frontline_ready' },
                    { from: 'lia', text: 'and handling heavy stories?', type: 'scale', scaleLabel: ['i\'d break down', 'struggle a lot', 'it\'d be hard', 'id manage', 'i can hold space'], key: 'emotional_capacity' },
                    { from: 'lia', text: 'im SO proud of you 💛 one more chapter to go — graduation!! 🎓' },
                ],
            },
            questId: 'quest_ch4h',
            bridgeId: 'bridge_ch4h_ch5',
            status: 'locked',
        },
        {
            id: 'ch5',
            title: 'Chapter 5 — Graduation Day',
            subtitle: 'Final Recall',
            icon: '🎓',
            description: 'Everything has led to this. From your first earthquake lessons in a classroom to holding a traumatized child\'s hand in the rubble — today, you prove you\'re ready to join the Digital Reserve Corps.',
            location: '🏫 School — Graduation Exam',
            color: '#F59E0B',
            type: 'final',
            difficulty: 'Final Recall',
            destinations: [],
            acts: [
                {
                    id: 'act1', title: 'Recall — Disaster Knowledge', description: 'Singapore\'s drainage. Brunei\'s community triage. The Ring of Fire. BMKG. How much do you still remember from where it all began?', duration: '15 min', xpReward: 80, coinReward: 20, videoTitle: 'Knowledge Review', videoDesc: 'How well do you remember the foundations?', quiz: [
                        { question: 'The Simeulue people survived the 2004 tsunami primarily through:', options: ['Government evacuation', 'Oral tradition and indigenous knowledge', 'Military rescue', 'Advanced technology'], correct: 1 },
                        { question: 'Singapore\'s primary natural disaster threat is:', options: ['Earthquakes', 'Volcanic eruptions', 'Flooding', 'Typhoons'], correct: 2 },
                        { question: 'AADMER stands for:', options: ['ASEAN Agreement on Disaster Management and Emergency Response', 'Asian Alliance for Disaster Mitigation and Emergency Readiness', 'ASEAN Association of Defense and Medical Emergency Response', 'Asian Agreement on Development and Meteorological Evaluation Research'], correct: 0 },
                    ]
                },
                {
                    id: 'act2', title: 'Recall — Personal PFA', description: 'The flash flood simulation. Ir. Farah\'s panic attack. Sokha\'s distrust. Khamla\'s injury. Can you still apply LOOK, LISTEN, LINK to yourself and those around you?', duration: '15 min', xpReward: 80, coinReward: 20, videoTitle: 'Personal PFA Review', videoDesc: 'Can you still find your center?', quiz: [
                        { question: 'In the correct PFA sequence for an emergency, LOOK comes first because:', options: ['It\'s alphabetically first', 'You must assess physical safety before addressing emotions', 'Looking is easier than listening', 'Professional guidelines require it'], correct: 1 },
                        { question: 'When someone says "I\'m fine" during a crisis, the best response involves:', options: ['Accepting it and moving on', 'Gently acknowledging what you observe in their body language', 'Insisting they talk about their feelings', 'Leaving them alone'], correct: 1 },
                        { question: 'A grounding technique helps by:', options: ['Anchoring you to the present moment during emotional overwhelm', 'Replacing the need for professional help', 'Making you forget the trauma', 'Only working in calm environments'], correct: 0 },
                    ]
                },
                {
                    id: 'act3', title: 'Recall — PFA for Others', description: 'Kapten Adi\'s perimeter. U Myint Thein\'s impossible choice. Maria\'s aid diversion fight. Putri\'s silent trauma. Can you hold space under the hardest conditions imaginable?', duration: '15 min', xpReward: 80, coinReward: 20, videoTitle: 'Others PFA Review', videoDesc: 'Can you hold space for someone in need?', quiz: [
                        { question: 'When military authority conflicts with a civilian\'s emotional crisis, a responder should:', options: ['Always side with the military', 'Find a compromise that respects both authority and human dignity', 'Always side with the civilian', 'Leave the situation'], correct: 1 },
                        { question: 'The best way to prevent aid diversion in disasters is:', options: ['Trusting local politicians', 'Transparent public distribution with community oversight', 'Only using foreign organizations', 'Distributing secretly'], correct: 1 },
                        { question: 'When supporting a traumatized, non-verbal child, the most powerful tool is:', options: ['Asking direct questions', 'Unhurried physical presence without pressure', 'Offering toys and games', 'Teaching them coping skills'], correct: 1 },
                    ]
                },
                {
                    id: 'act4', title: '🎓 Graduation Ceremony', description: 'You walked in as a student. You walk out as a Responder. Your Digital Reserve Corps certificate isn\'t just a piece of paper — it\'s a promise to 680 million neighbors.', duration: '10 min', xpReward: 200, coinReward: 50, videoTitle: 'Graduation', videoDesc: 'Welcome to the Corps, Responder.', quiz: [
                        { question: 'The most important lesson from RESILIA is:', options: ['Memorizing disaster facts', 'Technology will always save us', 'Human connection and compassion are the foundation of resilience', 'Individual survival is all that matters'], correct: 2 },
                    ]
                },
            ],
            liaChat: {
                pre: [
                    { from: 'lia', text: '🎓 GRADUATION DAY!! this is the final stretch!!' },
                    { from: 'lia', text: 'one last time — overall, how prepared do you feel for emergency situations?', type: 'scale', scaleLabel: ['not at all', 'a little', 'somewhat', 'well prepared', 'completely ready'], key: 'overall_preparedness' },
                    { from: 'lia', text: 'and how confident are you in your ability to help others during a crisis?', type: 'scale', scaleLabel: ['not confident', 'a bit', 'moderate', 'confident', 'very confident'], key: 'help_confidence' },
                ],
                post: [
                    { from: 'lia', text: '🎉🎉🎉 YOU GRADUATED!!! WELCOME TO THE DIGITAL RESERVE CORPS!! 🎉🎉🎉' },
                    { from: 'lia', text: 'final final check — how prepared do you feel for emergency situations?', type: 'scale', scaleLabel: ['not at all', 'a little', 'somewhat', 'well prepared', 'completely ready'], key: 'overall_preparedness' },
                    { from: 'lia', text: 'and confidence in helping others?', type: 'scale', scaleLabel: ['not confident', 'a bit', 'moderate', 'confident', 'very confident'], key: 'help_confidence' },
                    { from: 'lia', text: 'from day 1 to NOW... you\'ve grown so much 🥹💛 im gonna miss chatting with u' },
                    { from: 'lia', text: 'but remember — this isn\'t goodbye. this is just the beginning of YOUR story as a responder 🌟' },
                ],
            },
            questId: 'quest_ch5',
            bridgeId: null,
            status: 'locked',
        },
    ])

    const liaEvalScores = ref(JSON.parse(localStorage.getItem('resilia_lia_eval') || '{}'))

    function saveLiaEvalScore(chapterId, phase, key, value) {
        if (!liaEvalScores.value[chapterId]) liaEvalScores.value[chapterId] = {}
        if (!liaEvalScores.value[chapterId][phase]) liaEvalScores.value[chapterId][phase] = {}
        liaEvalScores.value[chapterId][phase][key] = value
        localStorage.setItem('resilia_lia_eval', JSON.stringify(liaEvalScores.value))
        syncToSupabase()
    }

    function getLiaEvalScore(chapterId, phase, key) {
        return liaEvalScores.value?.[chapterId]?.[phase]?.[key] ?? null
    }

    // ═══════════════════════════════════════════════════
    // ERQ (Emotion Regulation Questionnaire) — Scenario-Based
    // Pre-test: Before Chapter 1 | Post-test: After Chapter 5
    // ═══════════════════════════════════════════════════
    const erqPreTest = [
        { id: 1, dimension: 'CR', scenario: 'A violent tremor suddenly collapses the ceiling. Dust fills the air. You dive under a sturdy desk. To control your panic, what do you think?', options: [{ text: 'This building is going to collapse and this is the end for me.', score: 1 }, { text: 'Try to empty your mind and shut your eyes tight.', score: 3 }, { text: 'The shaking is terrifying, but this desk is shielding me from the lighter debris.', score: 5 }] },
        { id: 2, dimension: 'ES', scenario: 'While evacuating down the emergency stairwell, you see someone crying and clutching their injured leg. You yourself are trembling with fear.', options: [{ text: 'Start crying too and show your panic openly in front of them.', score: 1 }, { text: 'Let a few tears fall but quickly wipe them away so no one notices.', score: 3 }, { text: 'Put on the flattest expression you can and swallow your fear deep inside.', score: 5 }] },
        { id: 3, dimension: 'CR', scenario: 'You made it outside, but the evacuation road is completely gridlocked. Panicked crowds and blaring horns make your head spin. How do you ease the pressure?', options: [{ text: 'Keep imagining the worst — what if an aftershock hits while you\'re stuck in traffic?', score: 1 }, { text: 'Stare at your phone screen aimlessly just to distract yourself.', score: 3 }, { text: 'Think: "Of course it\'s jammed — everyone wants to survive. At least I\'m in an open area now."', score: 5 }] },
        { id: 4, dimension: 'ES', scenario: 'In the middle of the chaos, you finally get a signal and a call from your family — they\'re all safe and uninjured.', options: [{ text: 'Shout with joy and cry with relief as loudly as you can in the middle of the crowd.', score: 1 }, { text: 'Smile broadly for a moment, then quickly look down and compose yourself.', score: 3 }, { text: 'Immediately put on a neutral expression because others around you are still searching for their loved ones.', score: 5 }] },
        { id: 5, dimension: 'CR', scenario: 'A warning siren blares from the city\'s loudspeakers, ratcheting up the tension. You need to keep your composure right now.', options: [{ text: 'Take the siren as a sign that a small-scale doomsday is happening.', score: 1 }, { text: 'Cover your ears and hope the sound stops soon.', score: 3 }, { text: 'Remind yourself: "This siren means the early warning system is working properly to keep us safe."', score: 5 }] },
        { id: 6, dimension: 'ES', scenario: 'While pushing through the crowd toward an open field, someone shoves you so hard you nearly fall — then walks away without a word.', options: [{ text: 'Immediately shout at them and curse them out.', score: 1 }, { text: 'Grumble under your breath and flash an annoyed look.', score: 3 }, { text: 'Stay silent and hold your anger entirely inside without showing any expression.', score: 5 }] },
        { id: 7, dimension: 'CR', scenario: 'At the assembly point, you see large sections of your city badly damaged. A wave of hopelessness begins to rise.', options: [{ text: 'Feel that your city\'s life is destroyed and can never recover.', score: 1 }, { text: 'Look away at the sky so you don\'t have to see the wreckage.', score: 3 }, { text: 'Focus on the many relief teams already arriving to help rebuild.', score: 5 }] },
        { id: 8, dimension: 'CR', scenario: 'Someone next to you is screaming hysterically and can\'t be calmed down. Their panic is making you feel even more pressured.', options: [{ text: 'Think: "This person is so annoying and making me want to scream too."', score: 1 }, { text: 'Slowly move away from them to find a quieter spot.', score: 3 }, { text: 'Shift your perspective: "They\'re in severe shock. This isn\'t their fault — it\'s a trauma response."', score: 5 }] },
        { id: 9, dimension: 'ES', scenario: 'You suddenly realize your wallet and laptop — with all your thesis/work files — are still inside the potentially damaged building. Overwhelming sadness hits you.', options: [{ text: 'Cry openly and tell the person next to you about your regret.', score: 1 }, { text: 'Take a deep sigh and bow your head, holding back tears.', score: 3 }, { text: 'Bite your lip and put on a brave face as if those things don\'t matter at all.', score: 5 }] },
        { id: 10, dimension: 'CR', scenario: 'Night falls. The air is freezing and no tents have been set up yet. You have to sleep on cardboard in an open field.', options: [{ text: 'Curse your bad luck and feel like you\'re the unluckiest person here.', score: 1 }, { text: 'Force yourself to close your eyes so the night passes faster.', score: 3 }, { text: 'Convince yourself: "Sleeping outside right now is the most rational and safest option against aftershocks."', score: 5 }] },
    ]

    const erqPostTest = [
        { id: 1, dimension: 'CR', scenario: 'You wake up aching all over from the thin sleeping pad and the cramped tent. You want to start the day feeling lighter.', options: [{ text: 'Keep complaining about how miserable life in the shelter is.', score: 1 }, { text: 'Step outside immediately for fresh air without thinking much.', score: 3 }, { text: 'Remind yourself: "My body hurts, but at least I woke up safe today."', score: 5 }] },
        { id: 2, dimension: 'ES', scenario: 'An unfounded rumor spreads through the tent that a bigger megathrust earthquake will hit this afternoon. You\'re terrified.', options: [{ text: 'Immediately panic, cry, and ask everyone around you if the rumor is true.', score: 1 }, { text: 'Quietly ask an officer in a trembling voice.', score: 3 }, { text: 'Sit calmly with a composed expression, hiding your pounding heart.', score: 5 }] },
        { id: 3, dimension: 'CR', scenario: 'Sudden heavy rain starts pouring. Parts of the tent leak and your clothes get slightly wet. How do you ease your frustration?', options: [{ text: 'Feel like nature is punishing you and piling on bad luck.', score: 1 }, { text: 'Move to a dry corner and try to sleep again.', score: 3 }, { text: 'Think: "The rain is a bit inconvenient, but it\'ll wash away the earthquake debris dust outside."', score: 5 }] },
        { id: 4, dimension: 'ES', scenario: 'You find a packet of your favorite snack in your bag that survived. Among the boring canned food, this makes you incredibly happy.', options: [{ text: 'Smile widely and let out a small cheer celebrating your find.', score: 1 }, { text: 'Smile happily and eat it slowly right away.', score: 3 }, { text: 'Put on a neutral face and hide the snack so no one sees your happiness.', score: 5 }] },
        { id: 5, dimension: 'CR', scenario: 'While eating, an aftershock hits hard enough to shake the tent poles. People scatter in panic again.', options: [{ text: 'Think that this time the earth will truly crack open and swallow everyone.', score: 1 }, { text: 'Duck down hugging your knees and wait for the shaking to stop.', score: 3 }, { text: 'Tell yourself: "This is an open area. Aftershocks are the earth\'s natural process of stabilizing after the main quake."', score: 5 }] },
        { id: 6, dimension: 'ES', scenario: 'An exhausted medical volunteer accidentally snaps at you when you ask where the medicine supplies are. You feel offended.', options: [{ text: 'Snap right back at them because you feel disrespected.', score: 1 }, { text: 'Frown and walk away grumbling under your breath.', score: 3 }, { text: 'Reply in a flat tone as if nothing happened, and keep the frustration to yourself.', score: 5 }] },
        { id: 7, dimension: 'CR', scenario: 'At night, you think about your studies/career that\'s been put on hold indefinitely. Anxiety about the future grips you.', options: [{ text: 'Feel that your future is ruined and you\'ve fallen too far behind everyone else.', score: 1 }, { text: 'Try listening to music or chatting to forget about the future for a moment.', score: 3 }, { text: 'Focus your thoughts on the fact that this disaster is a temporary pause, and your institution will surely make special accommodations.', score: 5 }] },
        { id: 8, dimension: 'CR', scenario: 'You\'re assigned to clean the dirty, smelly emergency public toilets. You feel disgusted and frustrated.', options: [{ text: 'Think this is degrading work that you shouldn\'t have to do.', score: 1 }, { text: 'Pinch your nose tight and do it as fast as possible to get it over with.', score: 3 }, { text: 'Shift your perspective: "Keeping these toilets clean is the best way to prevent disease outbreaks in the shelter."', score: 5 }] },
        { id: 9, dimension: 'ES', scenario: 'You see a news update showing the ruins of your neighborhood. Sudden homesickness and grief make you feel like you can\'t breathe.', options: [{ text: 'Let yourself cry and pour out your longing to the person next to you.', score: 1 }, { text: 'Take a deep breath and go for a short walk to neutralize the feeling.', score: 3 }, { text: 'Stare blankly at your phone screen, clench your jaw, and don\'t let a single tear fall.', score: 5 }] },
        { id: 10, dimension: 'CR', scenario: 'Aid distribution is delayed. Hundreds of people are queuing in the blazing heat and growing increasingly irritable.', options: [{ text: 'Silently curse the government and aid organizers for being so slow.', score: 1 }, { text: 'Fan yourself and hold your annoyance in silence.', score: 3 }, { text: 'Convince yourself: "Logistics are genuinely difficult to deliver to disaster areas. Queuing patiently is my contribution to maintaining order."', score: 5 }] },
    ]

    const erqScores = ref(JSON.parse(localStorage.getItem('resilia_erq_scores') || '{}'))

    function saveErqScore(phase, questionId, score) {
        if (!erqScores.value[phase]) erqScores.value[phase] = {}
        erqScores.value[phase][questionId] = score
        localStorage.setItem('resilia_erq_scores', JSON.stringify(erqScores.value))
        syncToSupabase()
    }

    function getErqResults(phase) {
        const scores = erqScores.value[phase] || {}
        const crKeys = erqPreTest.filter(q => q.dimension === 'CR').map(q => q.id)
        const esKeys = erqPreTest.filter(q => q.dimension === 'ES').map(q => q.id)
        const crTotal = crKeys.reduce((sum, k) => sum + (scores[k] || 0), 0)
        const esTotal = esKeys.reduce((sum, k) => sum + (scores[k] || 0), 0)
        return { cr: crTotal, es: esTotal, total: crTotal + esTotal, count: Object.keys(scores).length }
    }

    const erqCompleted = computed(() => ({
        pre: (erqScores.value.pre && Object.keys(erqScores.value.pre).length >= 10),
        post: (erqScores.value.post && Object.keys(erqScores.value.post).length >= 10),
    }))

    // ═══════════════════════════════════════════════════
    // Shared Simulation HP Pool (ch1.5 → ch4.5)
    // ═══════════════════════════════════════════════════
    const MAX_SIM_HP = 100
    const simulationHP = ref(parseInt(localStorage.getItem('resilia_sim_hp') || String(MAX_SIM_HP)))
    const simCheckpoint = ref(localStorage.getItem('resilia_sim_checkpoint') || 'ch1h')

    function damageSimHP(amount) {
        if (isAdmin.value) return simulationHP.value
        simulationHP.value = Math.max(0, simulationHP.value - amount)
        localStorage.setItem('resilia_sim_hp', String(simulationHP.value))
        return simulationHP.value
    }

    function healSimHP(amount) {
        simulationHP.value = Math.min(MAX_SIM_HP, simulationHP.value + amount)
        localStorage.setItem('resilia_sim_hp', String(simulationHP.value))
        return simulationHP.value
    }

    function resetSimHP() {
        simulationHP.value = MAX_SIM_HP
        localStorage.setItem('resilia_sim_hp', String(MAX_SIM_HP))
    }

    function setSimCheckpoint(chapterId) {
        simCheckpoint.value = chapterId
        localStorage.setItem('resilia_sim_checkpoint', chapterId)
    }

    // ═══════════════════════════════════════════════════
    // Story Progress Persistence
    // ═══════════════════════════════════════════════════
    const storyProgress = ref(JSON.parse(localStorage.getItem('resilia_story_progress') || '{"currentChapter":"ch1","currentAct":null,"narrativeFlags":{}}'))

    function updateStoryProgress(chapter, act = null, flags = {}) {
        storyProgress.value.currentChapter = chapter
        storyProgress.value.currentAct = act
        Object.assign(storyProgress.value.narrativeFlags, flags)
        localStorage.setItem('resilia_story_progress', JSON.stringify(storyProgress.value))
        syncToSupabase()
    }

    // Post-test KKM (Kriteria Ketuntasan Minimal) system
    const postTestAttempts = ref({}) // { moduleId: { attempts: 0, passed: false } }
    const KKM_THRESHOLD = 80

    function submitPostTest(moduleId, scorePercent) {
        if (!postTestAttempts.value[moduleId]) {
            postTestAttempts.value[moduleId] = { attempts: 0, passed: false, scores: [] }
        }
        const record = postTestAttempts.value[moduleId]
        record.attempts++
        record.scores.push(scorePercent)
        if (scorePercent >= KKM_THRESHOLD || isAdmin.value) {
            record.passed = true
            return { passed: true, score: scorePercent, attempts: record.attempts }
        }
        return {
            passed: false,
            score: scorePercent,
            attempts: record.attempts,
            canRetry: true, // Infinite retries for everyone
            message: `Score: ${scorePercent}%. Need ${KKM_THRESHOLD}% to pass. Infinite attempts remaining.`
        }
    }

    // ═══════════════════════════════════════════════════
    // PROLOGUE — iMessage-style Lia Chat Data
    // ═══════════════════════════════════════════════════
    const prologueChatFlow = ref([
        { sender: 'lia', text: 'prologue.msg1', delay: 1500 },
        { sender: 'lia', text: 'prologue.msg2', delay: 2000 },
        { sender: 'lia', text: 'prologue.msg3', delay: 2500 },
        {
            sender: 'user', type: 'choice', question: 'prologue.q1',
            options: [
                { text: 'prologue.q1_a', mood: 'friendly' },
                { text: 'prologue.q1_b', mood: 'neutral' },
                { text: 'prologue.q1_c', mood: 'cold' },
            ]
        },
        { sender: 'lia', text: 'prologue.r_friendly', delay: 1500, condition: 'friendly' },
        { sender: 'lia', text: 'prologue.r_neutral', delay: 1800, condition: 'neutral' },
        { sender: 'lia', text: 'prologue.r_cold', delay: 2000, condition: 'cold' },
        { sender: 'lia', text: 'prologue.msg4', delay: 2500 },
        { sender: 'lia', text: 'prologue.msg5', delay: 2000 },
        { sender: 'lia', text: 'prologue.msg6', delay: 3000 },
        { sender: 'lia', text: 'prologue.msg7', delay: 1500 },
        {
            sender: 'user', type: 'choice', question: 'prologue.q2',
            options: [
                { text: 'prologue.q2_a', mood: 'supportive' },
                { text: 'prologue.q2_b', mood: 'enthusiastic' },
                { text: 'prologue.q2_c', mood: 'dismissive' },
            ]
        },
        { sender: 'lia', text: 'prologue.r_supportive', delay: 2000, condition: 'supportive' },
        { sender: 'lia', text: 'prologue.r_enthusiastic', delay: 1500, condition: 'enthusiastic' },
        { sender: 'lia', text: 'prologue.r_dismissive', delay: 2000, condition: 'dismissive' },
        { sender: 'lia', text: 'prologue.msg8', delay: 2000 },
        {
            sender: 'user', type: 'checkin', question: 'prologue.q3',
            options: [
                'prologue.q3_a',
                'prologue.q3_b',
                'prologue.q3_c',
                'prologue.q3_d',
            ]
        },
        { sender: 'lia', text: 'prologue.r_experienced', delay: 2500, condition: 'experienced' },
        { sender: 'lia', text: 'prologue.r_community', delay: 2000, condition: 'community' },
        { sender: 'lia', text: 'prologue.r_curious', delay: 2000, condition: 'curious' },
        { sender: 'lia', text: 'prologue.r_assignment', delay: 2000, condition: 'assignment' },
        {
            sender: 'user', type: 'checkin', question: 'prologue.q4',
            options: [
                'prologue.q4_a',
                'prologue.q4_b',
                'prologue.q4_c',
                'prologue.q4_d',
            ]
        },
        { sender: 'lia', text: 'prologue.r_energized', delay: 1500, condition: 'energized' },
        { sender: 'lia', text: 'prologue.r_nervous', delay: 2000, condition: 'nervous' },
        { sender: 'lia', text: 'prologue.r_tired', delay: 2000, condition: 'tired' },
        { sender: 'lia', text: 'prologue.r_impatient', delay: 1500, condition: 'impatient' },
        { sender: 'lia', text: 'prologue.msg9', delay: 2000 },
        { sender: 'lia', text: 'prologue.msg10', delay: 2500 },
        { sender: 'lia', text: 'prologue.msg11', delay: 2000 },
        { sender: 'lia', text: 'prologue.msg12', delay: 3000 },
        { sender: 'lia', text: 'prologue.msg13', delay: 3000 },
    ])

    // ═══════════════════════════════════════════════════
    // BRIDGING QUESTS — Story checkpoints between chapters (no HP)
    // ═══════════════════════════════════════════════════
    const bridgingQuests = ref({
        'bridge_prologue_ch1': {
            title: 'The First Tremor',
            from: 'Prologue', to: 'Chapter 1',
            description: 'A routine orientation day takes a terrifying turn. An earthquake drill becomes real — and Lia discovers what she\'s made of.',
            isBridging: true,
            steps: [
                {
                    narrative: 'It\'s a quiet Tuesday afternoon. The orientation speaker is mid-sentence about club sign-ups when the building begins to vibrate. Gently at first, then violently.',
                    npc: '"Is this... is this real?! {Name}, the lights are flickering! Everyone is screaming. What do we do?!" *Lia grabs your arm*',
                    emotion: '😱', emotionLabel: 'Terrified',
                    options: [
                        { text: '"DROP! Under the desk, NOW. Cover your head. This is real, Lia — remember the drill protocol from earlier."', score: 3, feedback: 'Textbook response. Duck, Cover, Hold. The drill saved you.' },
                        { text: '"Let\'s run outside!"', score: 1, feedback: 'Running during shaking is dangerous — falling debris is the #1 cause of earthquake injuries indoors.' },
                        { text: '"Stay calm, it\'s probably just a truck outside."', score: 0, feedback: 'Denial in a crisis delays action. The building is clearly shaking.' },
                    ]
                },
                {
                    narrative: 'The earthquake was a 4.1 — small but real. You and Lia are in the assembly field, hearts pounding.',
                    npc: '"My hands are still shaking, {Name}. But... we did it right, didn\'t we? We followed the protocol." *she takes a shaky breath* "This is exactly why I want to learn this stuff. Imagine if that happened in a village with no drills..."',
                    emotion: '😰', emotionLabel: 'Shaken but resolved',
                    options: [
                        { text: '"You stayed calm when it mattered, Lia. That\'s not nothing. And you\'re right — that\'s exactly why preparation matters."', score: 3, feedback: 'Reframing fear as evidence for her dream.' },
                        { text: '"Yeah, it was scary. But we\'re safe now."', score: 2, feedback: 'Honest and reassuring.' },
                    ]
                },
                {
                    narrative: 'The dean announces the Disaster Preparedness Club is recruiting. Lia looks at you with bright eyes.',
                    npc: '"Let\'s join together, {Name}! I have a feeling this is the start of something big." *she pulls out the crumpled ASEAN map* "Each star is a place. Let\'s make them real."',
                    emotion: '🌟', emotionLabel: 'Hopeful',
                    options: [
                        { text: '"Count me in, Lia. Let\'s make those stars real."', score: 3, feedback: 'And so the journey begins. 🌟' },
                        { text: '"Sure, why not."', score: 1, feedback: 'Lukewarm, but you\'re in.' },
                    ]
                },
            ]
        },
        // Ch1 → Ch1.5 (theory → simulation)
        'bridge_ch1_ch1h': {
            title: 'First Assignment',
            from: 'Chapter 1', to: 'Chapter 1.5',
            isBridging: true,
            description: 'After learning about ASEAN disasters in the classroom, Lia gets an unexpected field assignment — your theory is about to become reality.',
            steps: [
                {
                    narrative: 'The university disaster club meets weekly now. After acing the Chapter 1 modules, the club advisor calls you and Lia aside.',
                    npc: '"The club advisor just told us something WILD, {Name}! There\'s a student exchange program with Singapore\'s SCDF and Brunei\'s NDMC. We can observe their disaster infrastructure FIRSTHAND!" *she literally bouncing* "This is like... the stuff we learned in class but FOR REAL!"',
                    emotion: '🤩', emotionLabel: 'Ecstatic',
                    options: [
                        { text: '"Let\'s go, Lia! Theory means nothing if we can\'t see it in action. Singapore and Brunei have completely different approaches — this will be incredible."', score: 3, feedback: 'From textbook to field. The real learning begins.' },
                        { text: '"Sounds interesting. When do we leave?"', score: 2, feedback: 'Practical. You\'re ready.' },
                    ]
                },
                {
                    narrative: 'Lia is packing her bag with notebooks, a portable charger, and her ASEAN map. She puts a pin on Singapore.',
                    npc: '"Okay so I researched it — Singapore has ZERO natural disasters but THE BEST disaster infrastructure in ASEAN. And Brunei? They barely have any tech but their community response is legendary." *she pauses* "It\'s like... opposites. Hi-tech vs. culture. I wonder which one actually saves more lives?"',
                    emotion: '🤔', emotionLabel: 'Curious',
                    options: [
                        { text: '"That\'s the million-dollar question, Lia. Maybe it\'s not either/or. Let\'s find out together."', score: 3, feedback: 'The nuance of disaster preparedness. Both matter. 🇸🇬🇧🇳' },
                    ]
                },
            ]
        },
        // Ch1.5 → Ch2 (simulation → theory)
        'bridge_ch1h_ch2': {
            title: 'The Scholarship Letter',
            from: 'Chapter 1.5', to: 'Chapter 2',
            isBridging: true,
            description: 'After Singapore and Brunei, Lia receives a life-changing letter. The field experience ignited something deeper — a desire to understand the HUMAN side of disasters.',
            steps: [
                {
                    narrative: 'Back at campus after the Singapore-Brunei trip. You\'re at the café when Lia bursts through the door, waving an envelope.',
                    npc: '"Remember how Dr. Tan mentioned the psychological impact of floods on children? And how Haji Omar said the community IS the healing? That got me thinking..." *she unfolds the letter* "I applied for a PFA training certification. {Name}, I got ACCEPTED!"',
                    emotion: '🎉', emotionLabel: 'Overjoyed',
                    options: [
                        { text: '"That\'s amazing, Lia! Infrastructure saves bodies but PFA saves minds. After seeing Singapore\'s tech and Brunei\'s community spirit, learning PFA is the perfect next step."', score: 3, feedback: 'Connecting the dots between physical and psychological disaster response.' },
                        { text: '"Nice! What\'s PFA?"', score: 1, feedback: 'You\'ll find out soon. Chapter 2 awaits.' },
                    ]
                },
                {
                    narrative: 'Lia opens her laptop to the PFA training portal. A message from the instructor reads: "Welcome. Before we teach you how to help, we must first teach you how to FEEL."',
                    npc: '"Whoa, {Name}. This isn\'t like the disaster modules at all. Listen to what the instructor wrote: \'Disasters don\'t just destroy buildings — they shatter minds.\' I never thought about it that way. Infrastructure is one thing, but what about people\'s HEARTS?"',
                    emotion: '💭', emotionLabel: 'Reflective',
                    options: [
                        { text: '"That\'s the missing piece, Lia. We learned to save structures and read warning signs. Now we learn to save hearts. Let\'s do this."', score: 3, feedback: 'From infrastructure to empathy. Chapter 2 begins. 🩹' },
                    ]
                },
            ]
        },
        // Ch2 → Ch2.5 (theory → simulation)
        'bridge_ch2_ch2h': {
            title: 'The Field Dispatch',
            from: 'Chapter 2', to: 'Chapter 2.5',
            isBridging: true,
            description: 'PFA theory is done. Now Lia faces her first real deployment — a flood zone in Malaysia and Thailand where knowledge meets chaos.',
            steps: [
                {
                    narrative: 'PFA classroom. The instructor finishes the final lecture and looks directly at Lia.',
                    npc: '"The instructor said our final assessment isn\'t an exam — it\'s a FIELD deployment! Malaysia and Thailand are experiencing seasonal flooding and they need PFA volunteers!" *she grabs your arm* "This is it, {Name}. Everything we learned — Look, Listen, Link — it\'s about to get REAL. Real floods. Real people."',
                    emotion: '😳', emotionLabel: 'Nervous excitement',
                    options: [
                        { text: '"We trained for this, Lia. Theory becomes practice. Let\'s show them what Look, Listen, Link looks like in action."', score: 3, feedback: 'From the classroom to the field. Time to test your PFA skills.' },
                        { text: '"Are we ready for this?"', score: 2, feedback: 'A healthy question. The answer is: you will be.' },
                    ]
                },
            ]
        },
        // Ch2.5 → Ch3 (simulation → theory)
        'bridge_ch2h_ch3': {
            title: 'The Mekong Reflection',
            from: 'Chapter 2.5', to: 'Chapter 3',
            isBridging: true,
            description: 'After the Malaysia-Thailand deployment, Lia realizes she helped everyone else but forgot one person — herself.',
            steps: [
                {
                    narrative: 'Hotel room in Chiang Mai after the deployment. Lia is sitting on the bed, staring at the wall.',
                    npc: '"I helped 47 people in two weeks, {Name}. Calmed panicking mothers. Listened to elderly flood victims for HOURS. But..." *she pauses* "...nobody asked how I was doing. And honestly? I didn\'t ask MYSELF either. My hands haven\'t stopped shaking since we left Malaysia."',
                    emotion: '😔', emotionLabel: 'Drained',
                    options: [
                        { text: '"Lia, you just described the #1 mistake helpers make — helping everyone but yourself. PFA starts with YOU. Remember Look, Listen, Link? It applies to your own heart too."', score: 3, feedback: 'The hardest lesson: the helper needs help too. Chapter 3 awaits.' },
                    ]
                },
            ]
        },
        // Ch3 → Ch3.5 (theory → simulation)
        'bridge_ch3_ch3h': {
            title: 'The Personal Test',
            from: 'Chapter 3', to: 'Chapter 3.5',
            isBridging: true,
            description: 'After learning to apply PFA to herself, Lia faces a scenario where a tropical storm tests everything she just learned — personally.',
            steps: [
                {
                    narrative: 'Lia closes her Chapter 3 workbook. She\'s learned to look at her own stress signs, listen to her own feelings, and link to her support network.',
                    npc: '"I feel so much more grounded now, {Name}. I can actually NAME what I\'m feeling instead of just... drowning in it." *her phone buzzes — weather alert* "Oh no. A tropical storm warned across Vietnam, Cambodia, and Laos. The instructor says this is our SOLO self-care simulation — we have to manage ourselves through a crisis scenario. No team. Just us and what we learned."',
                    emotion: '😤', emotionLabel: 'Determined',
                    options: [
                        { text: '"This is exactly what Chapter 3 prepared you for, Lia. You know the signs. You know how to breathe. You know who to call. Trust yourself."', score: 3, feedback: 'Time to practice self-PFA under pressure. 🌀' },
                    ]
                },
            ]
        },
        // Ch3.5 → Ch4 (simulation → theory)
        'bridge_ch3h_ch4': {
            title: 'The Upgrade',
            from: 'Chapter 3.5', to: 'Chapter 4',
            isBridging: true,
            description: 'After mastering self-care under pressure, Lia is ready for the ultimate upgrade: applying PFA to help others.',
            steps: [
                {
                    narrative: 'After the personal emergency drill. Lia video-calls you from her dorm, looking more composed than ever.',
                    npc: '"I survived the simulation, {Name}! I used breathing technique when I felt my chest tighten. I recognized my behavioral stress signs before they spiraled. I even called my support person!" *she grins* "Now the instructor says we\'re ready for Chapter 4 — applying PFA to OTHERS. Real people in real distress. Am I ready?"',
                    emotion: '💪', emotionLabel: 'Confident',
                    options: [
                        { text: '"You just proved you can take care of yourself under pressure, Lia. That\'s the foundation. Now you pour from a FULL cup — not an empty one. Let\'s learn to help others."', score: 3, feedback: 'From self-care to other-care. The journey evolves. 🤝' },
                    ]
                },
            ]
        },
        // Ch4 → Ch4.5 (theory → simulation)
        'bridge_ch4_ch4h': {
            title: 'The Frontline Dispatch',
            from: 'Chapter 4', to: 'Chapter 4.5',
            isBridging: true,
            description: 'PFA for others is mastered in theory. Now Lia joins a real volunteer mission — Indonesia, Philippines, Myanmar. Three disasters. Three cultures. One mission.',
            steps: [
                {
                    narrative: 'Final day of Chapter 4 training. The instructor projects a map with three active disaster zones.',
                    npc: '"This is it, {Name}. The ASEAN Volunteer Corps just called. Three simultaneous disasters — earthquake aftermath in Indonesia, typhoon recovery in Philippines, and cyclone response in Myanmar. They need trained PFA volunteers." *she takes a deep breath* "This is the real frontline. No simulations. No retries. Real people who need us."',
                    emotion: '😰', emotionLabel: 'Gravity',
                    options: [
                        { text: '"You\'ve mastered Look, Listen, and Link for yourself AND for others. You\'re not the same person who panicked at that first earthquake. You\'re ready, Lia."', score: 3, feedback: 'The ultimate test awaits. 🔥' },
                    ]
                },
            ]
        },
        // Ch4.5 → Ch5 (simulation → final)
        'bridge_ch4h_ch5': {
            title: 'The Final Chapter',
            from: 'Chapter 4.5', to: 'Chapter 5',
            isBridging: true,
            description: 'After three frontline deployments, Lia reflects on everything she\'s learned and prepares for the final challenge.',
            steps: [
                {
                    narrative: 'Airport departure lounge. Lia takes out her ASEAN map — it\'s covered in pins now.',
                    npc: '"Look at this map, {Name}. Indonesia, Philippines, Singapore, Brunei, Malaysia, Thailand, Vietnam, Cambodia, Laos, Myanmar..." *she traces each pin* "I started as a scared student who didn\'t know what to do when the building shook. Now I\'ve helped people across ASEAN. The final chapter is about bringing it all together."',
                    emotion: '🌟', emotionLabel: 'Pivotal',
                    options: [
                        { text: '"Every pin is a lesson, every person is a story. You didn\'t just learn PFA, Lia — you lived it. Let\'s finish what we started."', score: 3, feedback: 'One last chapter. Everything has led to this. 🌏' },
                    ]
                },
            ]
        },
    })

    // ═══════════════════════════════════════════════════
    // CHAPTER RPG QUESTS — HP system, escalating difficulty
    // ═══════════════════════════════════════════════════
    const chapterQuests = ref({
        'quest_ch1': {
            title: 'The Volcano\'s Warning',
            chapter: 'ch1', difficulty: 1,
            location: 'Yogyakarta, Indonesia',
            description: 'After learning about ASEAN disasters in the classroom, Lia drags you on a cultural trip to Yogyakarta. But Mount Merapi has other plans — and everything you studied becomes terrifyingly real.',
            cover: '🌋', hasHP: true,
            culturalElement: 'Gotong Royong — Indonesian communal mutual aid',
            steps: [
                {
                    narrative: 'Three months after joining the Disaster Preparedness Club. Lia convinced you to visit Yogyakarta — home to Mount Merapi, one of the most active volcanoes in the world. It\'s exactly the kind of place you learned about in Chapter 1. The warung owner points to the mountain — more smoke than usual, and the sky has turned amber.',
                    npc: '"Look at Merapi, {Name}! Remember what we learned about Indonesia — 127 active volcanoes, the most in the world! More smoke than usual. The warung owner says the village upslope is packing. Is this what our textbooks were talking about?"',
                    emotion: '😟', emotionLabel: 'Nervous',
                    options: [
                        { text: '"Let\'s check the PVMBG alert level. Remember what we learned — Indonesia has the best volcanic monitoring in ASEAN. Don\'t panic, stay informed."', score: 3, isCorrect: true, feedback: 'Data-first approach. Exactly what the Disasters in ASEAN module taught you.' },
                        { text: '"It\'s probably nothing. Let\'s go see Borobudur!"', score: 0, isCorrect: false, feedback: 'Ignoring volcanic warning signs for tourism is exactly what Chapter 1 warned against.' },
                        { text: '"WE\'RE ALL GOING TO DIE! RUN!"', score: 0, isCorrect: false, feedback: 'Panic helps nobody. Remember: preparation beats panic.' },
                    ]
                },
                {
                    narrative: 'PVMBG confirms Alert Level III (Siaga). The village chief, Mbak Dewi, activates gotong royong — the Indonesian tradition of communal mutual aid that you studied in class. Neighbors help neighbors. The whole village moves as one organism.',
                    npc: '"This is REAL, {Name}! Mbak Dewi is doing gotong royong — remember? That\'s the Indonesian community cooperation tradition from our Chapter 1 module! The WHOLE village is helping each other evacuate. It\'s exactly like what we studied! But she needs more hands."',
                    emotion: '💪', emotionLabel: 'Determined',
                    options: [
                        { text: '"Let\'s split up and help. You take east side, I take west. We meet at the village hall every 30 minutes. Keep your phone charged and your tone calm."', score: 3, isCorrect: true, feedback: 'Organized, delegated, systematic. Gotong royong in action.' },
                        { text: '"Maybe let the professional responders handle it."', score: 1, isCorrect: false, feedback: 'BNPB responders may take hours. In ASEAN, community response is often the FIRST response.' },
                        { text: '"I don\'t remember any protocols."', score: 0, isCorrect: false, feedback: 'Should have paid more attention in the Institutions & Organizations act!' },
                    ]
                },
                {
                    narrative: 'At the evacuation center, an old farmer named Pak Suryo sits apart from everyone, weeping silently. He left his water buffalo behind — three years of income, and in Indonesian rural culture, almost like a family member. Lia looks at you, unsure how to help.',
                    npc: '"He won\'t stop crying, {Name}. The buffalo is worth three years of income. In Indonesian rural culture, losing livestock is like losing everything. This isn\'t a problem I can Google. I studied disasters in ASEAN but nobody taught me what to SAY to this man."',
                    emotion: '😢', emotionLabel: 'Overwhelmed',
                    options: [
                        { text: '"Don\'t try to fix it, Lia. Just sit with him. Tell him you understand his loss is real. Being present IS helping. Sometimes the most powerful thing is just being there."', score: 3, isCorrect: true, feedback: 'This is the foundation of what you\'ll learn in Chapter 2 — Psychological First Aid. Being present IS the aid.' },
                        { text: '"Tell him to stop crying, it\'s just an animal."', score: 0, isCorrect: false, feedback: 'Dismissing someone\'s grief is cruel. That buffalo IS three years of income and a part of his family.' },
                        { text: '"Promise him we\'ll buy a new one?"', score: 0, isCorrect: false, feedback: 'Empty promises in disaster zones destroy trust. Be honest about what you can and can\'t do.' },
                    ]
                },
                {
                    narrative: 'Merapi erupts at dawn — a massive pyroclastic flow takes the village. But EVERY family is safe, evacuated hours before. Pak Suryo wipes his eyes and says something that stops Lia in her tracks: "The mountain takes, but the mountain gives. Gotong royong doesn\'t stop after evacuation — it\'s how we rebuild."',
                    npc: '"We did it, {Name}. Every single family, safe. And Pak Suryo said: \'Gotong royong doesn\'t stop after evacuation — it\'s how we rebuild.\' That\'s not just Indonesian culture, that\'s the ASEAN way. Thailand has their version. Philippines has theirs. Vietnam, Cambodia, Laos — everyone has this." *Lia pulls out her map* "I want to see ALL of them."',
                    emotion: '🌟', emotionLabel: 'Inspired',
                    options: [
                        { text: '"Gotong royong isn\'t just about crisis — it\'s about healing and rebuilding. Every ASEAN nation has their own version of \'we take care of each other.\' That\'s what Chapter 1 was really about, Lia."', score: 3, isCorrect: true, feedback: 'Connecting classroom theory to real-world experience. Chapter 1 complete. 🌋' },
                        { text: '"Can we just go home now?"', score: 1, isCorrect: false, feedback: 'A natural reaction after trauma, but Lia\'s drive is only growing.' },
                    ]
                },
            ]
        },
        'quest_ch1h': {
            title: 'The Silent Crack',
            chapter: 'ch1h', difficulty: 1,
            location: 'Singapore & Brunei',
            description: 'Your field observations become real when you spot something the engineers missed. In Singapore, a crack. In Brunei, a community warning. Can you connect what the classroom taught with what the ground reveals?',
            cover: '🔍', hasHP: true,
            culturalElement: 'Field observation meets local wisdom',
            steps: [
                {
                    narrative: 'Day one of your field trip. Dr. Tan has shown you the Marina Barrage — $226 million of flood engineering. Everything looks perfect. But as the group moves on, you notice something: a hairline crack running along the eastern flood gate seal. It could be cosmetic. Or it could mean the seal would fail under extreme storm surge.',
                    npc: '"Hey {Name}, look at this crack I found on the flood gate! Dr. Tan says it\'s probably cosmetic but... should I report it? What if I\'m wrong and I waste everyone\'s time? Or what if I\'m RIGHT and nobody checks?"',
                    emotion: '🤨', emotionLabel: 'Uncertain',
                    options: [
                        { text: '"Report it. Always report. False alarms save more lives than missed warnings. Take a photo, note the exact location, and email PUB. Better embarrassed than responsible for a failure."', score: 3, isCorrect: true, feedback: 'The See Something, Say Something principle. In infrastructure safety, overcaution saves lives.' },
                        { text: '"Dr. Tan said it\'s fine. He\'s the expert."', score: 0, isCorrect: false, feedback: 'Experts miss things. The Challenger shuttle disaster happened because engineers\' warnings were overruled. Trust your eyes.' },
                        { text: '"Take a photo but don\'t say anything yet."', score: 1, isCorrect: false, feedback: 'Documentation is good, but delayed reporting defeats the purpose of early warning.' },
                    ]
                },
                {
                    narrative: 'In Brunei, Haji Omar takes you to Kampong Ayer during an actual tidal surge warning. The water is rising faster than predicted. Three elderly residents in the far stilts need immediate evacuation, but the boat can only take two trips before the water reaches dangerous levels.',
                    npc: '"Haji Omar says the water will be too high for the boat in 30 minutes. There are three elderly residents: Pak Hamid who can\'t walk, Mak Aminah who is blind, and Dato Ismail who refuses to leave his home. We have time for two boat trips. WHO do we get first?"',
                    emotion: '😰', emotionLabel: 'Pressured',
                    options: [
                        { text: '"Trip 1: Pak Hamid and Mak Aminah — they physically cannot self-evacuate. Trip 2: go to Dato Ismail and convince him. If he still refuses, respect his choice but make sure he has emergency supplies and a whistle."', score: 3, isCorrect: true, feedback: 'Triage by vulnerability + respecting autonomy. Community triage at its finest.' },
                        { text: '"Force all three onto the boat at once."', score: 0, isCorrect: false, feedback: 'Overloading the boat in rising water could kill everyone.' },
                        { text: '"Let Haji Omar decide — this is his village."', score: 1, isCorrect: false, feedback: 'Haji Omar is coordinating the entire village. He delegated THIS decision to you. Lead.' },
                    ]
                },
                {
                    narrative: 'Everyone is safe. As the water recedes, Haji Omar invites you to the community hall. He shows you a wall covered in photos — every flood, every evacuation, every rebuild over 40 years. "This is our memory," he says. "Singapore has databases. We have THIS."',
                    npc: '"Look at this wall, {Name}. 40 years of floods, 40 years of zero deaths. Not because of technology — because of MEMORY. Haji Omar remembers every flood pattern. The community remembers every evacuation. This is their database — it\'s just written in photos and stories instead of code."',
                    emotion: '🌟', emotionLabel: 'Enlightened',
                    options: [
                        { text: '"Digital databases AND community memory. Singapore\'s weakness is forgetting their ancestors\' wisdom. Brunei\'s weakness might be not scaling their knowledge beyond one village. The answer is COMBINING both — and that\'s what we\'re here to learn."', score: 3, isCorrect: true, feedback: 'The synthesis of modern and traditional. Chapter 1.5 complete. 🔍' },
                        { text: '"Technology is still better though."', score: 0, isCorrect: false, feedback: 'You just saw a village with zero deaths in 40 years using NO technology. Think again.' },
                    ]
                },
            ]
        },
        'quest_ch2': {
            title: 'The Typhoon\'s Edge',
            chapter: 'ch2', difficulty: 2,
            location: 'Manila, Philippines',
            description: 'Typhoon season arrives early. A missing child, an overwhelmed shelter, and the bayanihan spirit are your only shield.',
            cover: '🌪️', hasHP: true,
            culturalElement: 'Bayanihan — Filipino community spirit',
            steps: [
                {
                    narrative: 'Manila. Typhoon makes landfall. At the evacuation center, a mother searches frantically for her 7-year-old son Kevin.',
                    npc: '"Ate Minda can\'t find Kevin! He was near the basketball court when the storm hit. She\'s hyperventilating. The barangay captain is overwhelmed."',
                    emotion: '😢', emotionLabel: 'Panicked',
                    options: [
                        { text: '"Lia, stay with Ate Minda — keep doing breathing. I\'ll organize a search team with barangay tanods. We need Kevin\'s description and usual hiding spots."', score: 3, isCorrect: true, feedback: 'Divide and conquer: emotional support + practical search.' },
                        { text: '"I\'ll run out in the storm myself!"', score: 0, isCorrect: false, feedback: 'Running INTO a typhoon? You become the next missing person.' },
                        { text: '"He\'ll turn up eventually."', score: 0, isCorrect: false, feedback: 'A missing 7-year-old in a typhoon needs immediate action.' },
                        { text: '"Everyone search everywhere at once!"', score: 1, isCorrect: false, feedback: 'Uncoordinated searching wastes time and creates more panic.' },
                    ]
                },
                {
                    narrative: 'Kevin is found under the bleachers, wet but safe. Ate Minda sobs with relief. The shelter weathers the night.',
                    npc: '"In Indonesia we have gotong royong. Here, they call it bayanihan. Different word. Same heart." *she helps distribute rice* "The titas are already cooking lugaw. Nobody asked them — they just started."',
                    emotion: '🙏', emotionLabel: 'Grateful',
                    options: [
                        { text: '"That\'s the thread, Lia. Every ASEAN country has its version of \'we take care of each other.\' You\'re connecting these stories. That matters."', score: 3, isCorrect: true, feedback: 'Cultural bridge-building. The deeper lesson.' },
                        { text: '"Good thing we found Kevin."', score: 1, isCorrect: false, feedback: 'True but surface-level.' },
                    ]
                },
                {
                    narrative: 'PLOT TWIST: After the storm, you discover that the evacuation center was built on a known flood plain. The barangay captain admits he ignored engineering warnings to save money.',
                    npc: '"Wait... this shelter floods EVERY typhoon season? And they KNEW? {Name}, there are 300 people in here right now. Some of them could have gone to the school on the hill instead. Why didn\'t anyone say anything?"',
                    emotion: '😤', emotionLabel: 'Furious',
                    options: [
                        { text: '"Corruption doesn\'t erase community spirit, Lia. The bayanihan is real — the institutional failure is also real. We address both: help people NOW, then advocate for better infrastructure AFTER."', score: 3, isCorrect: true, feedback: 'Nuanced thinking. Separating the systemic failure from the community response.' },
                        { text: '"Let\'s expose the captain publicly."', score: 1, isCorrect: false, feedback: 'Accountability matters, but timing matters more — not during the crisis.' },
                        { text: '"This is why I don\'t trust politicians."', score: 0, isCorrect: false, feedback: 'Cynicism without action helps nobody.' },
                    ]
                },
            ]
        },
        'quest_ch2h': {
            title: 'The Tunnel\'s Limit',
            chapter: 'ch2h', difficulty: 2,
            location: 'Kuala Lumpur & Bangkok',
            description: 'The SMART Tunnel hits capacity during a once-in-50-year rain. In Bangkok, the ancient klong system faces a modern crisis. Can engineering and tradition coexist when both are pushed to breaking point?',
            cover: '🚇', hasHP: true,
            culturalElement: 'Engineering marvels vs. ancestral systems',
            steps: [
                {
                    narrative: 'Kuala Lumpur. The SMART Tunnel has entered Mode 3 — full flood diversion, no traffic. But water levels are still rising. SMART\'s chief engineer Dr. Amira reveals that a blocked intake upstream is reducing capacity by 30%. Someone needs to reach the intake and clear it, but the access route is partially flooded.',
                    npc: '"Dr. Amira says the tunnel can\'t handle this volume at 70% capacity. The intake is 2km upstream — we could reach it by boat, but the current is strong. She says we have maybe 40 minutes before Shah Alam starts flooding AGAIN. Like 2021 when 50 people died, {Name}. What do we do?"',
                    emotion: '😰', emotionLabel: 'Desperate',
                    options: [
                        { text: '"Contact BOMBA fire rescue for a water rescue boat to reach the intake. Send drone footage first to assess the blockage. If it\'s debris, BOMBA can clear it. If it\'s structural, we need to activate backup pumping stations and start evacuating Shah Alam NOW."', score: 3, isCorrect: true, feedback: 'Multi-pronged approach: assess before committing, prepare backup plan. Lives depend on thinking two moves ahead.' },
                        { text: '"Let\'s swim to the intake ourselves."', score: 0, isCorrect: false, feedback: 'Floodwater kills trained swimmers. Never enter flowing water above knee height.' },
                        { text: '"Wait for water levels to drop naturally."', score: 0, isCorrect: false, feedback: 'The rain isn\'t stopping. Waiting means Shah Alam floods. 50 died last time.' },
                    ]
                },
                {
                    narrative: 'Bangkok. Ajarn Somchai watches the Chao Phraya from his balcony. The river is rising, but something is different this time — the frogs have gone silent, and the elephants at the sanctuary upstream moved to high ground 6 hours ago. Government sensors show "moderate" risk. Nature says otherwise.',
                    npc: '"The government says moderate risk. But Ajarn Somchai says the frogs stopped singing at 3 AM — that\'s never wrong. And the elephants moved. He wants to ring the village bell and start evacuation. But if he\'s wrong and the government is right, the village loses a whole day of fishing income. These people can\'t afford that, {Name}."',
                    emotion: '🤔', emotionLabel: 'Torn',
                    options: [
                        { text: '"Ring the bell. A false alarm costs one day of fishing. A missed flood costs lives. Tell the village: better one hungry day than one funeral. And when the government data catches up to what the frogs already know, they\'ll thank Ajarn Somchai."', score: 3, isCorrect: true, feedback: 'Precautionary principle + cultural wisdom. Animals detect seismic and pressure changes humans can\'t. Trust nature\'s instruments.' },
                        { text: '"Trust the government sensors. They\'re more accurate."', score: 0, isCorrect: false, feedback: 'Sensors measure what they\'re designed to measure. Animals sense what sensors can\'t. The 2004 tsunami proved this — elephants fled 30 minutes before the wave hit.' },
                        { text: '"Wait 2 more hours and re-check."', score: 1, isCorrect: false, feedback: 'Every hour of delay narrows the evacuation window. The frogs already gave you a 6-hour head start.' },
                    ]
                },
                {
                    narrative: 'The flood hits Bangkok at full force — 4 hours after the frogs went silent, exactly when Ajarn Somchai predicted. The village is already safe on high ground. Meanwhile, downstream communities that trusted only government sensors are now scrambling to evacuate.',
                    npc: '"We made it. The village is safe because of a 78-year-old man and some frogs. Meanwhile, the government just upgraded to \'severe\' — 4 hours too late. {Name}, the SMART Tunnel in KL is a $2 billion masterpiece. Ajarn Somchai\'s bell cost 50 baht. Both saved lives today. What does that tell you?"',
                    emotion: '🌟', emotionLabel: 'Humbled',
                    options: [
                        { text: '"It tells me that the best warning system is the one that works for the COMMUNITY, not the one that impresses engineers. KL needs SMART tunnels. Thai villages need frogs and bells. And BOTH need the other\'s strengths. That\'s the ASEAN lesson — diversity of methods, unity of purpose."', score: 3, isCorrect: true, feedback: 'The central thesis of Chapter 2.5. Technology AND tradition. Not either/or. 🚇' },
                        { text: '"We should just build SMART tunnels everywhere."', score: 0, isCorrect: false, feedback: 'A $2 billion tunnel for every Thai village? That\'s not just impractical — it\'s missing the point entirely.' },
                    ]
                },
            ]
        },
        'quest_ch3': {
            title: 'The River Divides',
            chapter: 'ch3', difficulty: 3,
            location: 'Mekong Delta, Vietnam',
            description: 'A village chief says your evacuation plan is wrong. An ancient tradition holds the answer — if you\'re humble enough to see it.',
            cover: '🌊', hasHP: true,
            culturalElement: 'Mekong floating houses — living with floods',
            steps: [
                {
                    narrative: 'Vietnamese fishing village, Can Tho. Village chief Ông Nhân questions your evacuation plan.',
                    npc: '"He says the floating houses will survive the flood. They\'ve done it for 200 years. Maybe we don\'t evacuate — maybe we reinforce THEIR system?"',
                    emotion: '🤔', emotionLabel: 'Reconsidering',
                    options: [
                        { text: '"Work WITH Ông Nhân. Strengthen the floating house system AND add emergency radio for when water gets too high."', score: 3, isCorrect: true, feedback: 'Cultural humility + augmentation. Gold standard.' },
                        { text: '"Our plan is scientifically better. Override him."', score: 0, isCorrect: false, feedback: 'Ignoring centuries of survival knowledge is arrogance.' },
                        { text: '"Skip this village then."', score: 0, isCorrect: false, feedback: 'You\'d miss the biggest learning opportunity.' },
                        { text: '"Let me study the houses first, then decide."', score: 2, isCorrect: false, feedback: 'Cautious but delays action. The monsoon won\'t wait.' },
                    ]
                },
                {
                    narrative: 'The monsoon arrives. Ông Nhân\'s floating houses ride the water. But one family\'s house has a cracked hull — it\'s sinking.',
                    npc: '"The Trần family house is taking water! They\'ve got a grandmother and a baby inside. Ông Nhân\'s boats are all deployed upstream. What do we do?"',
                    emotion: '😨', emotionLabel: 'Urgent',
                    options: [
                        { text: '"Use the emergency radio we installed to contact the upstream boats. Meanwhile, get the Tràns to higher ground in the neighboring house. Connect the houses with rope for stability."', score: 3, isCorrect: true, feedback: 'Using the infrastructure you helped build. Every piece matters.' },
                        { text: '"Swim to them."', score: 0, isCorrect: false, feedback: 'Mekong floodwater is deadly. Don\'t become another victim.' },
                        { text: '"Wait for the boats."', score: 1, isCorrect: false, feedback: 'The house is sinking NOW. Waiting risks lives.' },
                    ]
                },
                {
                    narrative: 'SURPRISE: The cracked hull wasn\'t from the flood — someone sabotaged it. A land developer wants to buy the village and has been threatening residents who refuse to sell.',
                    npc: '"Ông Nhân found tool marks on the hull. Someone CUT it. The Trần family refused to sell their land last month. {Name}... this wasn\'t nature. This was human."',
                    emotion: '😡', emotionLabel: 'Enraged',
                    options: [
                        { text: '"Document everything — photos, testimony, the tool marks. Protect the Trần family first. Then we contact the local authorities and the NGO legal team. Justice AND safety."', score: 3, isCorrect: true, feedback: 'Evidence-based response. Protect first, prosecute second.' },
                        { text: '"Find the developer and confront him."', score: 0, isCorrect: false, feedback: 'Vigilante action puts you and the village at risk.' },
                        { text: '"This isn\'t our problem. We\'re disaster responders, not police."', score: 1, isCorrect: false, feedback: 'When disaster is weaponized, it IS your problem.' },
                    ]
                },
            ]
        },
        'quest_ch3h': {
            title: 'The Storm\'s Eye',
            chapter: 'ch3h', difficulty: 3,
            location: 'Vietnam, Cambodia & Laos',
            description: 'Three countries. One storm system. Different responses. You must coordinate across borders when communication fails and trust is the only currency that works.',
            cover: '⛈️', hasHP: true,
            culturalElement: 'Cross-border ASEAN cooperation under pressure',
            steps: [
                {
                    narrative: 'A massive storm system is hitting Vietnam, Cambodia, and Laos simultaneously. In Hội An, the Thu Bồn River has breached its banks. The ancient town\'s UNESCO heritage buildings are flooding. The local authorities have to choose: save the artifacts or save the 200 families still in the old quarter.',
                    npc: '"The museum director is begging us to save the 500-year-old ceramics. But there are 200 families upstairs who need boats. We don\'t have enough boats for both. The ceramics are irreplaceable... but so are people. {Name}, what do we prioritize?"',
                    emotion: '😢', emotionLabel: 'Agonized',
                    options: [
                        { text: '"People first. Always. Move the ceramics to upper floors if there\'s time, but every boat goes to families. Tell the museum director: artifacts can be restored, lives cannot. UNESCO will understand — and if they don\'t, they should."', score: 3, isCorrect: true, feedback: 'The hardest lesson in disaster response: triage means choosing, and people always come first.' },
                        { text: '"Split the boats — half for people, half for artifacts."', score: 1, isCorrect: false, feedback: 'Splitting resources sounds fair but means neither task gets done properly. In triage, decisive focus saves more.' },
                        { text: '"The ceramics are priceless. Save them first."', score: 0, isCorrect: false, feedback: 'No artifact on Earth is worth a human life. This is a fundamental ethical line.' },
                    ]
                },
                {
                    narrative: 'Cambodia. Siem Reap is flooding. The Tonlé Sap lake has reversed flow — a natural phenomenon the Khmer people have lived with for centuries. But climate change has made it unpredictable. A floating village elder, Lok Ta Pheap, says the water patterns don\'t match anything he\'s seen in 60 years.',
                    npc: '"Lok Ta Pheap says the water is behaving \\"drunk\\" — his word, not mine. It\'s not following the patterns his grandfather taught him. The floating village knows how to ride normal floods. But this isn\'t normal. He says we need to move the entire village to the western bank — 300 families, 150 floating houses. The government says stay put. Who do you trust?"',
                    emotion: '😟', emotionLabel: 'Uncertain',
                    options: [
                        { text: '"Lok Ta Pheap has 60 years of pattern recognition that no sensor can replicate. If the water doesn\'t match his lifetime of observations, that IS the warning. Help him move the village. Contact the provincial governor to support — don\'t ask permission, ask for assistance."', score: 3, isCorrect: true, feedback: 'When traditional knowledge says something is unprecedented, LISTEN. This isn\'t superstition — it\'s 60 years of data analysis.' },
                        { text: '"The government has better data. Stay put."', score: 0, isCorrect: false, feedback: 'Government sensors measure current conditions. Lok Ta Pheap measures whether current conditions are NORMAL. Different and complementary datasets.' },
                        { text: '"Wait and see which way the water goes."', score: 0, isCorrect: false, feedback: 'By the time you see which way the water goes, it\'s too late to move 300 families.' },
                    ]
                },
                {
                    narrative: 'Laos. The Mekong dams upstream have released water without warning — a geopolitical failure. Pak Ou village has 45 minutes. Lia realizes this isn\'t nature anymore. This is human-caused flooding from dam operations.',
                    npc: '"45 minutes, {Name}. No warning from upstream. No coordination between countries. Vietnam is flooding because Cambodia released water. Cambodia released water because Laos released water. Laos released water because China\'s dams overflowed. It\'s a cascade — and nobody TALKED to each other. THIS is why ASEAN cooperation isn\'t optional."',
                    emotion: '😤', emotionLabel: 'Furious',
                    options: [
                        { text: '"Save Pak Ou first — evacuate to the cave temple above. Then we document everything: the timestamps, the lack of warning, the cascade. This becomes our evidence for the ASEAN cross-border water management summit. We turn this failure into the REASON for better cooperation."', score: 3, isCorrect: true, feedback: 'Immediate action + systemic change. The personal AND the political. Chapter 3.5 complete. ⛈️' },
                        { text: '"We should protest against the dams."', score: 1, isCorrect: false, feedback: 'Protests matter but not while people are drowning. Sequence: save, stabilize, THEN advocate.' },
                    ]
                },
            ]
        },
        'quest_ch4': {
            title: 'The Sacred Shelter',
            chapter: 'ch4', difficulty: 4,
            location: 'Chiang Rai, Thailand',
            description: 'A temple shelter faces an impossible choice. Phra Somchai\'s wisdom is tested when politics invade the sacred space.',
            cover: '🏯', hasHP: true,
            steps: [
                {
                    narrative: 'The temple shelter is at capacity. A government official arrives and demands that Myanmar refugees be removed to make room for Thai citizens.',
                    npc: '"Phra Somchai refuses. He says \'the Dhamma does not discriminate by passport.\' But the official threatens to cut the temple\'s disaster funding. What do we do?"',
                    emotion: '😤', emotionLabel: 'Conflicted',
                    options: [
                        { text: '"Document the official\'s demand. Contact the media and international monitors. A government threatening a temple over refugee protection is a story that writes itself. The official will back down from public scrutiny."', score: 3, isCorrect: true, feedback: 'Strategic leverage. The truth is the most powerful tool.' },
                        { text: '"Comply. We can\'t lose the funding."', score: 0, isCorrect: false, feedback: 'Sacrificing vulnerable people for funding is a moral failure.' },
                        { text: '"Hide the refugees somewhere else."', score: 1, isCorrect: false, feedback: 'Band-aid solution that treats refugees as a problem to conceal.' },
                    ]
                },
                {
                    narrative: 'TWIST: The official\'s own family was affected by the flood — his daughter is one of the Myanmar refugees. He didn\'t recognize her because she uses her mother\'s maiden name (his ex-wife is from Myanmar).',
                    npc: '"He\'s crying in Phra Somchai\'s office. His own daughter. The man who wanted them removed has a daughter among them. I... I don\'t know if I should feel angry or sad."',
                    emotion: '🥹', emotionLabel: 'Stunned',
                    options: [
                        { text: '"Both. Anger at the system that made him choose nationalism over family. And compassion for a father separated from his child by politics. Let this moment teach him — and us."', score: 3, isCorrect: true, feedback: 'The deepest empathy comes from understanding complexity.' },
                        { text: '"He deserves what he gets."', score: 0, isCorrect: false, feedback: 'Vengeance solves nothing.' },
                    ]
                },
            ]
        },
        'quest_ch4h': {
            title: 'The Community Shield',
            chapter: 'ch4h', difficulty: 4,
            location: 'Indonesia, Philippines & Myanmar',
            description: 'A multi-disaster scenario across three countries. Earthquake in Indonesia, landslide in the Philippines, cyclone in Myanmar. You must deploy PFA principles in each — but every community has a different definition of "help."',
            cover: '🛡️', hasHP: true,
            culturalElement: 'Culturally adaptive PFA deployment',
            steps: [
                {
                    narrative: 'Padang, Indonesia. Post-earthquake. A mosque has become the primary shelter. The imam, Ustaz Rahman, has organized everything beautifully — food, water, sleeping areas. But he refuses to let the female psychologist from Jakarta conduct trauma counseling sessions. He says the community will heal through prayer.',
                    npc: '"Ustaz Rahman says prayer IS therapy. The psychologist says untreated PTSD will cause long-term damage. They\'re both right in their own way. But we\'re losing time — the survivors need BOTH spiritual comfort and professional support. {Name}, how do we bridge this without disrespecting either?"',
                    emotion: '😤', emotionLabel: 'Frustrated',
                    options: [
                        { text: '"Ask Ustaz Rahman if the psychologist can join the prayer sessions first — just listening, not intervening. After the community sees she respects their faith, propose joint sessions: spiritual healing AND emotional processing. Frame it as \'complete healing\' — body, mind, AND soul.\'"', score: 3, isCorrect: true, feedback: 'Cultural integration of PFA. Meeting the community in their framework, then expanding it. This is how real aid works in ASEAN.' },
                        { text: '"Override the imam. Mental health is more important."', score: 0, isCorrect: false, feedback: 'Overriding a community leader destroys trust instantly. You\'ll lose access to everyone.' },
                        { text: '"Just do prayer then. Skip the psychology."', score: 0, isCorrect: false, feedback: 'Prayer comforts. But PTSD requires more than comfort — it requires processing. Both are needed.' },
                    ]
                },
                {
                    narrative: 'Leyte, Philippines. Post-landslide. A barangay captain has organized a remarkable community response using the bayanihan spirit. But one family — the Santoses — has been ostracized because rumors spread that their illegal logging caused the landslide. Their 12-year-old daughter hasn\'t eaten in 2 days.',
                    npc: '"The Santoses are being blamed for the landslide. Even if the logging was a factor, their daughter Marisol is a CHILD. She didn\'t log anything. She\'s sitting alone while everyone else shares food. The barangay captain says he can\'t force people to share with \'the family that killed the mountain.\' This is so wrong, {Name}."',
                    emotion: '💔', emotionLabel: 'Heartbroken',
                    options: [
                        { text: '"We sit with Marisol and eat with her. Publicly. Where everyone can see. Then we bring food to the Santos family ourselves. Don\'t lecture the community — SHOW them. One act of kindness breaks the spell. Others will follow."', score: 3, isCorrect: true, feedback: 'Leading by example in PFA. Sometimes the first aid isn\'t medical — it\'s moral courage.' },
                        { text: '"Announce publicly that blaming families is wrong."', score: 1, isCorrect: false, feedback: 'Public shaming the community creates defensiveness. Model the behavior instead.' },
                        { text: '"This is their cultural issue. Don\'t interfere."', score: 0, isCorrect: false, feedback: 'A child not eating for 2 days because of adult blame is not \'culture\'. It\'s cruelty.' },
                    ]
                },
                {
                    narrative: 'Rakhine, Myanmar. A cyclone has devastated both Rakhine Buddhist and Rohingya communities. The military checkpoint between them means aid can reach one side but not the other. A local monk, Sayadaw U Pandita, secretly opens a back path through the monastery.',
                    npc: '"Sayadaw U Pandita says ALL suffering is equal before the Dhamma. He\'s opening the monastery path so we can bring medicine to the Rohingya side. But if the military finds out, HE goes to prison. He says he\'ll take that risk. {Name}, do we use the path? If we\'re caught, the monk pays the price, not us."',
                    emotion: '🥺', emotionLabel: 'Moved',
                    options: [
                        { text: '"Use the path. But document everything — the checkpoint, the blocked aid, the monk\'s courage. If the monk is willing to risk prison for equality of care, the LEAST we can do is ensure the world knows WHY he had to. This becomes our testimony for ASEAN human rights review."', score: 3, isCorrect: true, feedback: 'Moral courage + accountability. The monk teaches the hardest lesson: aid without borders, compassion without conditions. Chapter 4.5 complete. 🛡️' },
                        { text: '"It\'s too risky. Don\'t use the path."', score: 1, isCorrect: false, feedback: 'Safe for you. Fatal for the people who don\'t receive medicine. Sometimes the right choice isn\'t the safe one.' },
                    ]
                },
            ]
        },
        'quest_ch5': {
            title: 'The Invisible Crisis',
            chapter: 'ch5', difficulty: 5,
            location: 'Kuala Lumpur / Singapore',
            cover: '🌺', hasHP: true,
            description: 'In the glass towers of modern ASEAN, Lia discovers that the most vulnerable people are often the most invisible.',
            steps: [
                {
                    narrative: 'Singapore. Flash floods in Orchard Road — but the 300 Bangladeshi construction workers in basement dormitories aren\'t on any evacuation list.',
                    npc: '"Nobody told them to evacuate, {Name}. They\'re not citizens so they\'re not on the civil defense notification system. The water is at their door."',
                    emotion: '😠', emotionLabel: 'Outraged',
                    options: [
                        { text: '"Every person matters regardless of passport. Contact their employer AND the civil defense force. Use WeChat and WhatsApp groups common among foreign workers. Go physical if digital fails."', score: 3, isCorrect: true, feedback: 'Multi-channel approach to reach a marginalized population.' },
                        { text: '"Not our jurisdiction."', score: 0, isCorrect: false, feedback: 'Jurisdictional thinking kills people in disasters.' },
                        { text: '"The government should have systems for this."', score: 1, isCorrect: false, feedback: 'True, but the workers need help NOW, not policy reform.' },
                    ]
                },
                {
                    narrative: 'A 6-year-old girl at the Malaysian shelter hasn\'t spoken since the flood. She draws pictures of dark water over and over.',
                    npc: '"She won\'t talk, won\'t eat. Her mom says she\'s been like this for three days. I tried asking her questions but she just stares. How do we reach a child who\'s locked inside herself?"',
                    emotion: '💔', emotionLabel: 'Heartbroken',
                    options: [
                        { text: '"Don\'t ask questions. Sit beside her and draw WITH her. Match her drawings first, then slowly introduce light — a sun, a flower. Let her lead the story. Play is a child\'s language."', score: 3, isCorrect: true, feedback: 'Play-based intervention. Meeting the child where she is.' },
                        { text: '"She needs a professional therapist, not us."', score: 1, isCorrect: false, feedback: 'True long-term, but PFA can provide immediate stabilization. And therapists aren\'t available right now.' },
                        { text: '"She\'ll snap out of it eventually."', score: 0, isCorrect: false, feedback: 'Untreated childhood trauma can last a lifetime. Don\'t wait.' },
                    ]
                },
            ]
        },
        'quest_ch6': {
            title: 'The Checkpoint',
            chapter: 'ch6', difficulty: 6,
            location: 'Rakhine State, Myanmar',
            cover: '🌀', hasHP: true,
            description: 'Political reality meets humanitarian need. Lia must navigate a military checkpoint to deliver aid — and discovers a conspiracy.',
            steps: [
                {
                    narrative: 'Myanmar border. Aid trucks are blocked at a military checkpoint. The commander says aid must be "inspected" — a process that takes days while people starve.',
                    npc: '"They\'re not inspecting, {Name}. They\'re confiscating. I saw soldiers loading our medical supplies into their own trucks. If I report this, they\'ll revoke our access entirely."',
                    emotion: '😤', emotionLabel: 'Moral fury',
                    options: [
                        { text: '"Document covertly — photos, timestamps, quantities. Share with your NGO HQ through encrypted channels. Don\'t confront directly. Build the case quietly while finding alternative routes for critical supplies."', score: 3, isCorrect: true, feedback: 'Strategic documentation + alternative action. The art of persistence in hostile environments.' },
                        { text: '"Confront the commander publicly."', score: 0, isCorrect: false, feedback: 'Getting expelled from the country helps nobody.' },
                        { text: '"Just accept the loss and move on."', score: 1, isCorrect: false, feedback: 'Accepting theft normalizes it and ensures it continues.' },
                    ]
                },
                {
                    narrative: 'TWIST: The monastery your team uses as a distribution point is secretly sheltering political dissidents alongside cyclone victims. The military learns this and threatens to raid the monastery.',
                    npc: '"Phra Aung says he can\'t turn away people in danger — whether from cyclones or politics. But if the military raids, EVERYONE in the monastery — including our patients — is at risk." *Lia is trembling* "There\'s no right answer here, {Name}."',
                    emotion: '😰', emotionLabel: 'Impossible choice',
                    options: [
                        { text: '"Move the cyclone patients to a medically safer location first. Then work with Phra Aung to negotiate — separate the humanitarian mission from the political shelter. Both causes are just, but mixing them endangers everyone."', score: 3, isCorrect: true, feedback: 'Pragmatic humanism. Protecting the humanitarian space while respecting the monk\'s conviction.' },
                        { text: '"Denounce the dissidents to protect our patients."', score: 0, isCorrect: false, feedback: 'Betraying people seeking safety is never the answer.' },
                        { text: '"Evacuate everyone — abandon the monastery."', score: 1, isCorrect: false, feedback: 'Abandoning the location loses all your distribution infrastructure.' },
                    ]
                },
            ]
        },
        'quest_ch7': {
            title: 'The Mekong\'s Grief',
            chapter: 'ch7', difficulty: 7,
            location: 'Kampong Cham, Cambodia',
            cover: '🕊️', hasHP: true,
            description: 'Death. Displacement. The hardest conversations Lia has ever faced — and a secret that changes everything.',
            steps: [
                {
                    narrative: 'A family of five lived along the Mekong. The flood took three of them. The father, Sok, sits motionless. His surviving daughter, 12-year-old Dara, asks Lia: "Where did my mother go?"',
                    npc: '"I froze, {Name}. A 12-year-old asked me where her dead mother went and I... I had nothing. What do you say? What CAN you say?"',
                    emotion: '😢', emotionLabel: 'Devastated',
                    options: [
                        { text: '"You don\'t explain death to a child, Lia. You sit with her grief. Hold her hand. Say: \'Your mother loved you very much. She\'s not in pain anymore. And you are safe now.\' Don\'t philosophize — comfort."', score: 3, isCorrect: true, feedback: 'Age-appropriate grief support. Simple truth, warm presence.' },
                        { text: '"Tell her the truth — her mother drowned."', score: 0, isCorrect: false, feedback: 'Brutal honesty without emotional cushion traumatizes rather than helps.' },
                        { text: '"Let someone else handle it."', score: 0, isCorrect: false, feedback: 'The child asked YOU. Deflecting breaks the fragile trust.' },
                        { text: '"Tell her mother went to heaven."', score: 1, isCorrect: false, feedback: 'Well-meaning but may not align with the family\'s Buddhist beliefs. Ask the father first.' },
                    ]
                },
                {
                    narrative: 'SECRET REVEALED: Sok confesses that he knew the flood warning came 4 hours early. He didn\'t evacuate because he was hiding something in the house — a buried savings that represented 10 years of work.',
                    npc: '"He stayed for MONEY, {Name}. He chose money over evacuation and his wife and two children died. And now he can\'t even look at the money. He wants to throw it in the river."',
                    emotion: '😓', emotionLabel: 'Moral complexity',
                    options: [
                        { text: '"Sok made an impossible calculation in a moment of panic. He wasn\'t choosing money over family — he was trying to save EVERYTHING at once. His guilt is his punishment. Our job is not to judge him. Use that money for Dara\'s education — let it become his family\'s legacy instead of his shame."', score: 3, isCorrect: true, feedback: 'Transforming guilt into purpose. The most advanced PFA you\'ve ever done.' },
                        { text: '"He killed his own family."', score: 0, isCorrect: false, feedback: 'Technically true, morally devastating, and therapeutically useless.' },
                        { text: '"Everyone makes mistakes."', score: 1, isCorrect: false, feedback: 'Understating the magnitude of his trauma and guilt.' },
                    ]
                },
            ]
        },
        'quest_ch8': {
            title: 'The Mirror Cracks',
            chapter: 'ch8', difficulty: 8,
            location: 'Dili, Timor-Leste',
            cover: '🌅', hasHP: true,
            description: 'Lia faces herself. The helper becomes the patient — and discovers that vulnerability is not weakness.',
            steps: [
                {
                    narrative: 'Lia collapses during a community workshop in Dili. Heat, exhaustion, and months of accumulated trauma. She\'s taken to a clinic.',
                    npc: '"The doctor says I need to rest for a WEEK, {Name}. A whole week. There are communities waiting for me in Brunei. People who need help. I can\'t just... stop."',
                    emotion: '😤', emotionLabel: 'Frustrated denial',
                    options: [
                        { text: '"Lia, listen to your own advice. What would you tell a survivor who refuses to rest? You\'d say: \'Your body is telling you something. Listen.\' The communities will still be there. YOU won\'t be if you don\'t stop."', score: 3, isCorrect: true, feedback: 'The hardest person to counsel is yourself. But you used her own words.' },
                        { text: '"Push through it. People need you."', score: 0, isCorrect: false, feedback: 'Enabling self-destruction. She just collapsed.' },
                        { text: '"Take as long as you need."', score: 2, isCorrect: true, feedback: 'Supportive but lacks the confrontation she needs. She needs to hear WHY rest matters, not just permission.' },
                    ]
                },
                {
                    narrative: 'During her recovery, Lia reads her old journal entries. She realizes she hasn\'t called her mother in two months.',
                    npc: '"I\'ve been so focused on saving the world that I forgot the people who matter most. My mom doesn\'t even know I collapsed." *she picks up the phone* "Will you stay while I call her? I\'m scared she\'ll say \'I told you so.\'"',
                    emotion: '🥺', emotionLabel: 'Vulnerable',
                    options: [
                        { text: '"I\'ll be right here. And Lia — your mom won\'t say \'I told you so.\' She\'ll say \'I\'m glad you called.\' Because that\'s what mothers do."', score: 3, isCorrect: true, feedback: 'Being present for vulnerability. The purest form of friendship.' },
                        { text: '"You should have called her sooner."', score: 0, isCorrect: false, feedback: 'Adding guilt to vulnerability is cruel.' },
                    ]
                },
            ]
        },
        'quest_ch9': {
            title: 'The ASEAN Shield',
            chapter: 'ch9', difficulty: 9,
            location: 'All of ASEAN',
            cover: '🌏', hasHP: true,
            description: 'The final test. Multiple crises. Impossible choices. Every lesson, every ally. Lia leads — and the ending depends on you.',
            steps: [
                {
                    narrative: 'SIMULTANEOUS CRISES: Earthquake in Sulawesi. Typhoon approaching Visayas. Mekong flooding in Cambodia. Lia has 12 volunteers and can only send teams to two of three.',
                    npc: '"I can\'t be in three places, {Name}. Indonesia has the highest casualties but the Philippines has the most exposed population. Cambodia\'s flood is slow-onset — we might have 48 hours there." *she stares at the map* "Which two do we prioritize?"',
                    emotion: '💪', emotionLabel: 'Commander mode',
                    options: [
                        { text: '"Indonesia (immediate casualties) and Philippines (exposed population). For Cambodia, call Ông Nhân — his floating houses and river boats can hold 48 hours. Use every ally you\'ve made. This is what the network was built for."', score: 3, isCorrect: true, feedback: 'EVERYTHING connects. Every relationship, every Cultural lesson. This is leadership.' },
                        { text: '"Go to all three with skeleton crews."', score: 1, isCorrect: false, feedback: 'Spreading thin risks all three failing. Concentration of force matters.' },
                        { text: '"Only respond to the closest one."', score: 0, isCorrect: false, feedback: 'Proximity isn\'t the same as priority. Triage by impact.' },
                    ]
                },
                {
                    narrative: 'FINAL TWIST: While commanding the operation remotely, Lia receives a call. Her mother\'s village in Malang — where it all began — is flooded. Her mother is trapped.',
                    npc: '"My mom... {Name}... my MOM is trapped." *Lia\'s hands shake over the radio* "I\'m coordinating three countries and my own mother is drowning in my hometown. Do I... do I abandon my team? Do I fly back?"',
                    emotion: '😭', emotionLabel: 'The ultimate test',
                    options: [
                        { text: '"Lia. Your mother has local emergency response — call 112, contact your neighbors, use the WhatsApp group from Brawijaya. You trained THOSE communities too. Trust the system you built. Your team here needs their commander. Your mother needs her neighbors. Trust both."', score: 3, isCorrect: true, feedback: 'The hardest lesson: you cannot save everyone personally. But the systems you build can.' },
                        { text: '"Go. Your family comes first."', score: 1, isCorrect: false, feedback: 'Understandable but abandoning three simultaneous operations risks hundreds of lives. The answer is trust.' },
                        { text: '"She\'ll be fine. Focus on the mission."', score: 0, isCorrect: false, feedback: 'Dismissing her anguish is not leadership. Acknowledge the pain, then provide the path forward.' },
                    ]
                },
                {
                    narrative: 'All three operations succeed. Lia\'s mother is rescued by neighbors she trained two years ago. Lia sits on a riverbank at dawn, her ASEAN map spread beside her — every star now has a pin.',
                    npc: '"We did it, {Name}. Every star. Every pin." *she cries quietly* "I started as a scared freshman who couldn\'t find Room 204. And now..." *she turns to you* "None of this happens without you. Thank you for believing in the stars."',
                    emotion: '🌟', emotionLabel: 'Complete',
                    options: [
                        { text: '"No, Lia. Thank YOU. You taught me that preparation isn\'t about fear — it\'s about love. Every star on that map isn\'t a place — it\'s a family you helped keep safe. This is just the beginning."', score: 3, isCorrect: true, feedback: '🌟 The journey is complete. From Room 204 to the ASEAN Shield. Lia\'s story — YOUR story — ends here. But the mission never does.' },
                        { text: '"Good job, Lia. Gold star."', score: 2, isCorrect: true, feedback: 'Understatement level: infinite. But Lia laughs through her tears.' },
                    ]
                },
            ]
        },
    })

    const completedLiaRPGs = ref([])
    const completedChapterQuests = ref([])

    // ═══ Auto-sync to Supabase when ANY critical data changes ═══
    // NOTE: Must be placed after ALL referenced refs are declared
    const _syncTrigger = computed(() => JSON.stringify({
        // Profile
        xp: xp.value,
        level: level.value,
        coins: resiCoinBalance.value,
        onboarded: onboarded.value,
        name: userName.value,
        country: countryCode.value,
        // Progress
        acts: completedActs.value.length,
        quests: completedLiaRPGs.value?.length || 0,
        bridges: completedBridgingQuests.value?.length || 0,
        chapQuests: completedChapterQuests.value?.length || 0,
        sim: simulationHP.value,
        simCp: simCheckpoint.value,
        liaEval: Object.keys(liaEvalScores.value || {}).length,
        erq: Object.keys(erqScores.value || {}).length,
        story: storyProgress.value?.currentChapter,
        // Settings
        locale: locale.value,
        dark: darkMode.value,
        streak: loginStreak.value,
        rewards: loginRewardsCollected.value,
    }))
    watch(_syncTrigger, () => {
        // Only sync if authenticated and Supabase is active
        if (isAuthenticated.value && isSupabaseConfigured()) {
            syncToSupabase()
        }
    })

    function completeLiaRPG(rpgId, score) {
        if (!completedLiaRPGs.value.includes(rpgId)) {
            completedLiaRPGs.value.push(rpgId)
            earnXP(150)
            earnCoins(30, `Story RPG: ${rpgId}`)
            completeDailyMission('rpg')
            checkAchievements()
        }
    }

    function completeChapterQuest(questId, score) {
        if (!completedChapterQuests.value.includes(questId)) {
            completedChapterQuests.value.push(questId)
            earnXP(200)
            earnCoins(40, `Chapter Quest: ${questId}`)
            completeDailyMission('rpg')
            // Unlock next chapter
            const chapIdx = academyChapters.value.findIndex(c => c.questId === questId)
            if (chapIdx >= 0) {
                academyChapters.value[chapIdx].status = 'completed'
                if (chapIdx < academyChapters.value.length - 1) {
                    academyChapters.value[chapIdx + 1].status = 'available'
                }
            }
            checkAchievements()
        }
    }

    function completePrologueChat() {
        prologueChatCompleted.value = true
        academyChapters.value[0].status = 'completed'
        earnXP(50)
        earnCoins(10, 'Prologue: Chat with Lia')
    }

    // Toolkit items (free, moved from marketplace)
    const toolkitItems = ref([
        { id: 1, name: 'Digital Counseling Session', partner: 'Puskesmas Jakarta', icon: '🏥', category: 'Health', description: 'Access free digital counseling sessions with trained professionals.' },
        { id: 2, name: 'Mental Health Toolkit', partner: 'Klinik Sehat', icon: '🧠', category: 'Health', description: 'Comprehensive mental health resources and self-help guides.' },
        { id: 3, name: 'Disaster Prep Kit Guide', partner: 'Red Cross ASEAN', icon: '🎒', category: 'Preparedness', description: 'Step-by-step guide to building your own disaster preparedness kit.' },
        { id: 4, name: 'Emergency Contact Card', partner: 'BNPB', icon: '📞', category: 'Safety', description: 'Printable emergency contact card with local emergency numbers.' },
        { id: 5, name: 'Community Workshop Guide', partner: 'PMI', icon: '🏫', category: 'Community', description: 'Guide to organizing PFA workshops in your community.' },
    ])

    const marketplace = ref([
        // Boosters (Common/Rare)
        { id: 1, name: 'XP Boost (1h)', cost: 15, icon: '⚡', category: 'Booster', rarity: 'Common', description: '+25% XP for 1 hour' },
        { id: 2, name: 'XP Boost (24h)', cost: 75, icon: '⚡', category: 'Booster', rarity: 'Rare', description: '+25% XP for 24 hours' },
        { id: 3, name: 'Coin Doubler (24h)', cost: 90, icon: '🪙', category: 'Booster', rarity: 'Rare', description: '2x ResiCoins for 24 hours' },
        { id: 4, name: 'Streak Shield', cost: 60, icon: '🛡️', category: 'Booster', rarity: 'Rare', description: 'Protects your streak if you miss a day' },
        // Cosmetics (Common → Legendary)
        { id: 5, name: 'Custom Avatar Frame', cost: 50, icon: '🖼️', category: 'Cosmetic', rarity: 'Common', description: 'A basic colored frame for your avatar' },
        { id: 6, name: 'Dark Theme Premium', cost: 40, icon: '🌙', category: 'Cosmetic', rarity: 'Common', description: 'Unlock premium dark mode palette' },
        { id: 7, name: 'Name Color: Teal', cost: 60, icon: '✨', category: 'Cosmetic', rarity: 'Common', description: 'Change your display name to teal' },
        { id: 8, name: 'Custom Profile Banner', cost: 80, icon: '🎨', category: 'Cosmetic', rarity: 'Rare', description: 'Upload a custom banner image' },
        { id: 9, name: 'Animated Avatar Frame', cost: 150, icon: '💫', category: 'Cosmetic', rarity: 'Epic', description: 'Glowing animated frame for your avatar' },
        { id: 10, name: 'Title: Guardian of ASEAN', cost: 250, icon: '👑', category: 'Cosmetic', rarity: 'Legendary', description: 'Exclusive title displayed on your profile' },
        { id: 11, name: 'Golden Name Effect', cost: 300, icon: '🌟', category: 'Cosmetic', rarity: 'Legendary', description: 'Your name shimmers in gold' },
        // Community / Donation
        { id: 12, name: 'Emergency Supply Box', cost: 60, icon: '📦', category: 'Community', rarity: 'Common', description: 'Sponsors an emergency supply kit via UNICEF' },
        { id: 13, name: 'Workshop Sponsorship', cost: 150, icon: '🏫', category: 'Community', rarity: 'Epic', description: 'Fund a PFA workshop in an ASEAN community' },
        { id: 14, name: 'Red Cross Donation', cost: 100, icon: '❤️', category: 'Community', rarity: 'Rare', description: 'Direct donation to Red Cross ASEAN' },
        { id: 15, name: 'School Kit Sponsorship', cost: 80, icon: '🎒', category: 'Community', rarity: 'Rare', description: 'Sponsor a disaster prep kit for a school' },
        // Content & Status
        { id: 16, name: 'Certificate of Completion', cost: 100, icon: '📜', category: 'Content', rarity: 'Rare', description: 'Printable certificate for your PFA training' },
        { id: 17, name: 'Mentor Badge', cost: 120, icon: '🏅', category: 'Content', rarity: 'Epic', description: 'Unlocks mentoring features' },
        { id: 18, name: 'Exclusive Scenario Pack', cost: 200, icon: '🎭', category: 'Content', rarity: 'Epic', description: '3 bonus disaster RPG scenarios' },
        { id: 19, name: 'Lucky Loot Box', cost: 30, icon: '🎁', category: 'Content', rarity: 'Common', description: 'Random reward: XP, coins, or cosmetic' },
        { id: 20, name: 'Leaderboard Crown', cost: 500, icon: '👑', category: 'Content', rarity: 'Legendary', description: 'Crown icon next to your name on leaderboard' },
        // Utilities
        { id: 21, name: 'Quiz Retry Token', cost: 25, icon: '🔄', category: 'Booster', rarity: 'Common', description: 'One extra attempt on any post-test' },
        { id: 22, name: 'Hint Token (RPG)', cost: 35, icon: '💡', category: 'Booster', rarity: 'Common', description: 'Get a hint during RPG decisions' },
        { id: 23, name: 'Module Skip Token', cost: 200, icon: '⏭️', category: 'Booster', rarity: 'Epic', description: 'Skip one module (still must pass test)' },
        { id: 24, name: 'ASEAN Aid Bundle', cost: 400, icon: '🌏', category: 'Community', rarity: 'Legendary', description: 'Sponsors aid packages to 5 ASEAN countries' },
    ])

    // Achievements
    const achievementsList = ref([
        { id: 'first_steps', name: 'First Steps', icon: '🌱', description: 'Complete your first module', unlocked: false, date: null },
        { id: 'on_fire', name: 'On Fire', icon: '🔥', description: '7-day login streak', unlocked: false, date: null },
        { id: 'sharpshooter', name: 'Sharpshooter', icon: '🎯', description: 'Score 100% on any RPG', unlocked: false, date: null },
        { id: 'scholar', name: 'Scholar', icon: '📚', description: 'Complete all Foundations modules', unlocked: false, date: null },
        { id: 'responder_ready', name: 'Responder Ready', icon: '🛡️', description: 'Complete 6+ PFA modules', unlocked: false, date: null },
        { id: 'generous', name: 'Generous Heart', icon: '💰', description: 'Donate 100+ RC total', unlocked: false, date: null },
        { id: 'zen_master', name: 'Zen Master', icon: '🧘', description: 'Complete 10 breathing sessions', unlocked: false, date: null },
        { id: 'graduate', name: 'Graduate', icon: '🏆', description: 'Complete all 12 PFA modules', unlocked: false, date: null },
    ])

    // Level perks
    const levelPerks = {
        1: ['Access to Foundations modules', 'Toolkit access', 'Daily missions'],
        2: ['Unlock PFA modules', 'Calm Breathing tool', 'Community challenges'],
        3: ['Advanced RPG scenarios', 'Mood tracking history', 'Double daily rewards'],
        4: ['Mentor badge', 'Double XP weekends', 'Priority event access'],
        5: ['Custom avatar frames', 'Exclusive scenarios', 'Community leadership'],
        6: ['Leaderboard crown', 'All cosmetics unlocked', 'Legacy status'],
    }

    // Weekly community challenge
    const weeklyChallenge = ref({
        title: 'Module Marathon',
        description: '500 users complete a module this week — everyone gets 50 RC bonus!',
        target: 500,
        current: 287,
        reward: 50,
        endsIn: '3 days',
    })

    // Personal milestones
    const personalMilestones = ref([
        { id: 1, title: 'Complete all modules in 30 days', progress: 0, target: 12, reward: 200, icon: '📚' },
        { id: 2, title: 'Maintain a 30-day streak', progress: 1, target: 30, reward: 150, icon: '🔥' },
        { id: 3, title: 'Score perfect on 5 RPGs', progress: 0, target: 5, reward: 100, icon: '🎯' },
    ])

    // Daily login reward calendar
    const dailyRewards = computed(() => {
        const rewards = []
        for (let i = 1; i <= 49; i++) {
            const isWeekBonus = i % 7 === 0
            rewards.push({
                day: i,
                coins: isWeekBonus ? 25 : 5,
                claimed: i <= loginRewardsCollected.value,
                isBonus: isWeekBonus,
                week: Math.ceil(i / 7),
            })
        }
        return rewards
    })

    const currentRewardWeek = computed(() => Math.ceil((loginRewardsCollected.value + 1) / 7))
    const currentRewardDay = computed(() => loginRewardsCollected.value + 1)

    const currentTier = computed(() => {
        const sorted = [...levelTiers].reverse()
        return sorted.find(t => totalXPEarned.value >= t.minXP) || levelTiers[0]
    })

    const nextTier = computed(() => {
        const idx = levelTiers.findIndex(t => t.name === currentTier.value.name)
        return idx < levelTiers.length - 1 ? levelTiers[idx + 1] : null
    })

    const tierProgress = computed(() => {
        if (!nextTier.value) return 100
        const current = totalXPEarned.value - currentTier.value.minXP
        const needed = nextTier.value.minXP - currentTier.value.minXP
        return Math.min(Math.round((current / needed) * 100), 100)
    })

    const xpForNextLevel = computed(() => level.value * 100)
    const xpProgress = computed(() => Math.min((xp.value / xpForNextLevel.value) * 100, 100))

    const completionRate = computed(() => {
        return modules.value.length > 0
            ? Math.round((completedModules.value.length / modules.value.length) * 100)
            : 0
    })

    // ═══ Supabase User ID ═══
    const supabaseUserId = ref(null)

    async function registerUser(email, password, name) {
        // Try Supabase first
        if (isSupabaseConfigured()) {
            const result = await authService.signUp(email, password, name)
            if (result.error) {
                console.error('[Store] Registration error:', result.error)
                return { error: result.error }
            }
            if (result.user) {
                supabaseUserId.value = result.user.id
            }
        }
        // Always set local state (works as fallback too)
        userEmail.value = email
        userName.value = name
        isAuthenticated.value = true
        localStorage.setItem('resilia_auth', 'true')
        localStorage.setItem('resilia_email', email)
        localStorage.setItem('resilia_session_ts', Date.now().toString())
        localStorage.setItem('resilia_user', JSON.stringify({ email, name }))
        return { error: null }
    }

    async function loginUser(email, password) {
        // Try Supabase first
        if (isSupabaseConfigured()) {
            const result = await authService.signIn(email, password)
            if (result.error) {
                return { success: false, error: result.error }
            }
            if (result.user) {
                supabaseUserId.value = result.user.id
                userEmail.value = result.user.email
                isAuthenticated.value = true
                localStorage.setItem('resilia_auth', 'true')
                localStorage.setItem('resilia_email', result.user.email)
                localStorage.setItem('resilia_session_ts', Date.now().toString())
                // Hydrate from Supabase
                await initFromSupabase(result.user.id)
                return { success: true, error: null }
            }
        }
        // Fallback: localStorage-based login
        const stored = localStorage.getItem('resilia_user')
        if (stored) {
            const user = JSON.parse(stored)
            if (user.email === email) {
                isAuthenticated.value = true
                userEmail.value = email
                userName.value = user.name
                localStorage.setItem('resilia_auth', 'true')
                localStorage.setItem('resilia_session_ts', Date.now().toString())
                const profile = JSON.parse(localStorage.getItem('resilia_profile') || 'null')
                if (profile) {
                    countryCode.value = profile.countryCode || ''
                    userAge.value = profile.userAge || ''
                    userGender.value = profile.userGender || ''
                    hasDisasterExperience.value = profile.hasDisasterExperience ?? null
                    bio.value = profile.bio || ''
                    joinDate.value = profile.joinDate || ''
                }
                return { success: true, error: null }
            }
        }
        // Allow any login for mock (local-only mode)
        isAuthenticated.value = true
        userEmail.value = email
        localStorage.setItem('resilia_auth', 'true')
        localStorage.setItem('resilia_email', email)
        localStorage.setItem('resilia_session_ts', Date.now().toString())
        return { success: true, error: null }
    }

    async function loginWithGoogle() {
        if (!isSupabaseConfigured()) return { error: 'Supabase not configured' }
        return await authService.signInWithGoogle()
    }

    async function logoutUser() {
        if (isSupabaseConfigured()) {
            await authService.signOut()
        }
        supabaseUserId.value = null
        isAuthenticated.value = false
        onboarded.value = false
        hasCompletedCheckIn.value = false

        const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('resilia_') && !['resilia_theme', 'resilia_locale'].includes(k))
        keysToRemove.forEach(k => localStorage.removeItem(k))

        setTimeout(() => {
            window.location.href = '/auth'
        }, 100)
    }

    // ═══ Hydrate store from Supabase ═══
    async function initFromSupabase(userId) {
        if (!userId) return
        supabaseUserId.value = userId

        // Try migration first
        await dataService.migrateFromLocalStorage(userId)

        const data = await dataService.loadUserData(userId)
        if (!data) return

        // Profile
        if (data.profile) {
            const p = data.profile
            userName.value = p.display_name || ''
            countryCode.value = p.country_code || ''
            userAge.value = p.age_group || ''
            userGender.value = p.gender || ''
            hasDisasterExperience.value = p.has_disaster_experience
            bio.value = p.bio || ''
            avatarColor.value = p.avatar_color || '#14B8A6'
            xp.value = p.xp || 0
            level.value = p.level || 1
            totalXPEarned.value = p.total_xp_earned || 0
            resiCoinBalance.value = p.coins || 0
            onboarded.value = p.onboarded || false
            joinDate.value = p.join_date || ''
            if (p.avatar_url) avatarUrl.value = p.avatar_url
            // Sync to localStorage cache
            localStorage.setItem('resilia_onboarded', p.onboarded ? 'true' : 'false')
            _saveProfile()
        }

        // Progress
        if (data.progress) {
            const pr = data.progress
            if (pr.completed_acts) completedActs.value = pr.completed_acts
            if (pr.completed_quests) completedLiaRPGs.value = pr.completed_quests
            if (pr.completed_bridges) completedBridgingQuests.value = pr.completed_bridges
            if (pr.completed_chapter_quests) completedChapterQuests.value = pr.completed_chapter_quests
            if (pr.lia_eval_scores) liaEvalScores.value = pr.lia_eval_scores
            if (pr.erq_scores) erqScores.value = pr.erq_scores
            if (pr.story_progress) storyProgress.value = pr.story_progress
            if (pr.sim_hp !== undefined) simulationHP.value = pr.sim_hp
            if (pr.sim_checkpoint) simCheckpoint.value = pr.sim_checkpoint
            if (pr.personalization) userPersonalization.value = pr.personalization
        }

        // Settings
        if (data.settings) {
            const s = data.settings
            if (s.locale) locale.value = s.locale
            if (s.dark_mode !== undefined) darkMode.value = s.dark_mode
            if (s.login_streak) loginStreak.value = s.login_streak
            if (s.login_rewards_collected) loginRewardsCollected.value = s.login_rewards_collected
            if (s.reward_history) dailyRewardHistory.value = s.reward_history
        }
    }

    // ═══ Sync all state to Supabase (debounced) ═══
    function syncToSupabase() {
        if (!supabaseUserId.value) return
        dataService.debouncedSave(supabaseUserId.value, {
            profile: {
                userName: userName.value,
                email: userEmail.value,
                countryCode: countryCode.value,
                userAge: userAge.value,
                userGender: userGender.value,
                hasDisasterExperience: hasDisasterExperience.value,
                bio: bio.value,
                avatarColor: avatarColor.value,
                xp: xp.value,
                level: level.value,
                totalXPEarned: totalXPEarned.value,
                resiCoinBalance: resiCoinBalance.value,
                onboarded: onboarded.value,
                joinDate: joinDate.value,
                avatarUrl: avatarUrl.value,
            },
            progress: {
                completedActs: completedActs.value,
                completedQuests: completedLiaRPGs.value,
                completedBridges: completedBridgingQuests.value,
                completedChapterQuests: completedChapterQuests.value,
                liaEvalScores: liaEvalScores.value,
                erqScores: erqScores.value,
                storyProgress: storyProgress.value,
                simHP: simulationHP.value,
                simCheckpoint: simCheckpoint.value,
                personalization: userPersonalization.value,
            },
            settings: {
                locale: locale.value,
                darkMode: darkMode.value,
                loginStreak: loginStreak.value,
                loginRewardsCollected: loginRewardsCollected.value,
                rewardHistory: dailyRewardHistory.value,
            },
        })
    }

    function completeOnboarding(name, country, age, gender, disasterExp) {
        userName.value = name
        countryCode.value = country
        if (age) userAge.value = age
        if (gender) userGender.value = gender
        if (disasterExp !== undefined) hasDisasterExperience.value = disasterExp
        onboarded.value = true
        joinDate.value = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        localStorage.setItem('resilia_onboarded', 'true')
        _saveProfile()
        computePersonalization()
        syncToSupabase()
    }

    function _saveProfile() {
        localStorage.setItem('resilia_profile', JSON.stringify({
            userName: userName.value,
            countryCode: countryCode.value,
            userAge: userAge.value,
            userGender: userGender.value,
            hasDisasterExperience: hasDisasterExperience.value,
            bio: bio.value,
            avatarColor: avatarColor.value,
            avatarUrl: avatarUrl.value,
            joinDate: joinDate.value,
        }))
    }

    // ═══ Random Forest Personalization ═══
    function computePersonalization() {
        const features = {
            isAdult: userAge.value === 'adult',
            isMale: userGender.value === 'male',
            hasExperience: hasDisasterExperience.value === true,
            country: countryCode.value,
        }
        // Tree 1: Content difficulty
        let difficultyVote = 0.5
        if (features.hasExperience && features.isAdult) difficultyVote = 0.8
        else if (features.hasExperience) difficultyVote = 0.65
        else if (!features.isAdult) difficultyVote = 0.3

        // Tree 2: Narrative tone
        let toneVote = 'supportive'
        if (features.hasExperience && features.isAdult) toneVote = 'challenging'
        else if (features.isAdult) toneVote = 'neutral'

        // Tree 3: Focus topics & quiz frequency
        let quizFreq = 0.5
        const focusTopics = []
        if (!features.hasExperience) {
            focusTopics.push('basics', 'awareness')
            quizFreq = 0.3
        } else {
            focusTopics.push('advanced', 'leadership')
            quizFreq = 0.7
        }

        const countryChapterMap = {
            'ID': 'ch1', 'PH': 'ch2', 'VN': 'ch3', 'TH': 'ch4',
            'MY': 'ch5', 'SG': 'ch5', 'MM': 'ch6',
            'KH': 'ch7', 'LA': 'ch7', 'TL': 'ch8', 'BN': 'ch8'
        }

        const personalization = {
            contentDifficulty: difficultyVote,
            quizFrequency: quizFreq,
            narrativeTone: toneVote,
            focusTopics,
            recommendedCountry: countryChapterMap[features.country] || 'ch1',
            dailyMissionWeights: {
                lesson: features.hasExperience ? 0.8 : 1.2,
                rpg: features.hasExperience ? 1.2 : 0.8,
                checkin: 1.0,
                donate: features.isAdult ? 1.1 : 0.7,
                dashboard: 0.9,
            }
        }
        userPersonalization.value = personalization
        localStorage.setItem('resilia_personalization', JSON.stringify(personalization))
    }

    function updateProfile(data) {
        if (data.name) userName.value = data.name
        if (data.country) countryCode.value = data.country
        if (data.bio !== undefined) bio.value = data.bio
        if (data.avatarColor) avatarColor.value = data.avatarColor
    }

    function updateStability(score) {
        stabilityScore.value = score
        isStable.value = score <= 21
        hasCompletedCheckIn.value = true
        lastCheckInDate.value = new Date().toISOString().slice(0, 10)
        localStorage.setItem('resilia_checkin_date', lastCheckInDate.value)
        if (!isStable.value) soothingModeActive.value = true
        completeDailyMission('checkin')
        saveDailySession()
        syncToSupabase()
    }

    function completeSoothing() {
        soothingModeActive.value = false
        isStable.value = true
    }

    function earnXP(amount) {
        xp.value += amount
        totalXPEarned.value += amount
        while (xp.value >= xpForNextLevel.value) {
            xp.value -= xpForNextLevel.value
            level.value++
        }
    }

    function earnCoins(amount, reason) {
        resiCoinBalance.value += amount
        transactions.value.unshift({ id: Date.now(), type: 'earn', amount, reason, date: new Date().toLocaleDateString() })
    }

    function redeemCoins(itemId) {
        const item = marketplace.value.find(i => i.id === itemId)
        if (item && resiCoinBalance.value >= item.cost) {
            resiCoinBalance.value -= item.cost
            transactions.value.unshift({ id: Date.now(), type: 'redeem', amount: -item.cost, reason: `Redeemed: ${item.name}`, date: new Date().toLocaleDateString() })
            return true
        }
        return false
    }

    function donateCoins(amount) {
        if (resiCoinBalance.value >= amount) {
            resiCoinBalance.value -= amount
            totalDonated.value += amount
            transactions.value.unshift({ id: Date.now(), type: 'donate', amount: -amount, reason: 'Community Donation', date: new Date().toLocaleDateString() })
            completeDailyMission('donate')
            return true
        }
        return false
    }

    function completeModule(moduleId) {
        // Enforce RPG completion before module completion
        if (!moduleRPGCompleted(moduleId)) {
            return { success: false, message: 'Complete the RPG scenario first!' }
        }

        const mod = modules.value.find(m => m.id === moduleId)
        if (mod && mod.status !== 'completed') {
            mod.status = 'completed'
            completedModules.value.push(moduleId)
            earnXP(mod.xpReward)
            earnCoins(mod.coinReward, `Completed: ${mod.title}`)
            const next = modules.value.find(m => m.id === moduleId + 1)
            if (next && next.status === 'locked') next.status = 'available'
            completeDailyMission('lesson')
        }
        return { success: true }
    }

    function completeRPG(rpgId) {
        // Normalize rpgId to number if it matches module ID
        const id = Number(rpgId)
        if (!completedRPGs.value.includes(id)) {
            completedRPGs.value.push(id)
            earnXP(100)
            earnCoins(20, 'RPG Scenario Completed')
            completeDailyMission('rpg')
        }
    }

    function moduleRPGCompleted(moduleId) {
        return completedRPGs.value.includes(moduleId)
    }

    function completeDailyMission(type) {
        const mission = dailyMissions.value.find(m => m.type === type && !m.completed)
        if (mission) {
            mission.completed = true
            earnXP(mission.xpReward)
            earnCoins(mission.coinReward, `Daily: ${mission.title}`)
            saveDailySession()
        }
    }

    function claimDailyReward() {
        if (todayRewardClaimed.value) return false
        const dayIndex = loginRewardsCollected.value
        const reward = dailyRewards.value[dayIndex]
        if (!reward) return false
        todayRewardClaimed.value = true
        loginRewardsCollected.value++
        lastLoginDate.value = new Date().toDateString()
        earnCoins(reward.coins, `Daily Login Reward (Day ${reward.day})`)
        dailyRewardHistory.value.push({ day: reward.day, date: new Date().toLocaleDateString(), coins: reward.coins })
        // Reset cycle after 49 days
        if (loginRewardsCollected.value >= 49) loginRewardsCollected.value = 0
        saveDailySession()
        return reward
    }

    function completeBeginnerModule(moduleId) {
        const mod = beginnerModules.value.find(m => m.id === moduleId)
        if (mod && mod.status !== 'completed') {
            mod.status = 'completed'
            completedBeginnerModules.value.push(moduleId)
            earnXP(mod.xpReward)
            earnCoins(mod.coinReward, `Foundation: ${mod.title}`)
            const idx = beginnerModules.value.findIndex(m => m.id === moduleId)
            if (idx < beginnerModules.value.length - 1) {
                beginnerModules.value[idx + 1].status = 'available'
            }
            completeDailyMission('lesson')
            checkAchievements()
        }
    }

    function logBreathingSession() {
        breathingSessions.value++
        earnXP(10)
        earnCoins(2, 'Breathing session completed')
        checkAchievements()
    }

    function logMood(emoji, note = '') {
        moodLogs.value.unshift({ emoji, note, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() })
    }

    function logGroundingSession() {
        groundingSessions.value++
        earnXP(10)
        earnCoins(2, 'Grounding exercise completed')
    }

    function toggleDarkMode() {
        darkMode.value = !darkMode.value
    }

    function checkAchievements() {
        const now = new Date().toLocaleDateString()
        const checks = [
            { id: 'first_steps', condition: completedModules.value.length >= 1 || completedBeginnerModules.value.length >= 1 },
            { id: 'on_fire', condition: loginStreak.value >= 7 },
            { id: 'scholar', condition: beginnerCompleted.value },
            { id: 'responder_ready', condition: completedModules.value.length >= 6 },
            { id: 'generous', condition: totalDonated.value >= 100 },
            { id: 'zen_master', condition: breathingSessions.value >= 10 },
            { id: 'graduate', condition: completedModules.value.length >= 12 },
        ]
        checks.forEach(({ id, condition }) => {
            const ach = achievementsList.value.find(a => a.id === id)
            if (ach && !ach.unlocked && condition) {
                ach.unlocked = true
                ach.date = now
            }
        })
    }

    function unlockAchievement(id) {
        const ach = achievementsList.value.find(a => a.id === id)
        if (ach && !ach.unlocked) {
            ach.unlocked = true
            ach.date = new Date().toLocaleDateString()
        }
    }

    // Pre/Post Test Scores
    const moduleTestScores = ref({})

    function submitTestScore(moduleId, testType, score) {
        if (!moduleTestScores.value[moduleId]) moduleTestScores.value[moduleId] = {}
        moduleTestScores.value[moduleId][testType] = score
    }

    // Module test questions (pre & post use same questions)
    const moduleTests = ref({
        1: [
            { question: 'What is the primary goal of Psychological First Aid?', options: ['Diagnose mental illness', 'Provide emotional support and practical help', 'Prescribe medication', 'Conduct therapy'], correct: 1 },
            { question: 'When should PFA be provided?', options: ['Weeks after a disaster', 'Immediately during/after a crisis', 'Only by licensed therapists', 'Never'], correct: 1 },
            { question: 'PFA is NOT:', options: ['Professional counseling', 'Emotional support', 'Practical help', 'Listening actively'], correct: 0 },
        ],
        2: [
            { question: 'What is reflective listening?', options: ['Repeating exactly what someone says', 'Paraphrasing the speaker\'s feelings', 'Giving advice', 'Staying silent'], correct: 1 },
            { question: 'Which response shows empathy?', options: ['"You\'ll be fine"', '"That must be incredibly difficult"', '"Others have it worse"', '"Stop crying"'], correct: 1 },
            { question: 'Why is eye contact important?', options: ['To intimidate', 'To show you are present and engaged', 'It is not important', 'To diagnose PTSD'], correct: 1 },
        ],
        3: [
            { question: 'What is the FIRST step in de-escalation?', options: ['Call security', 'Acknowledge the person\'s feelings', 'Raise your voice', 'Walk away'], correct: 1 },
            { question: 'Saying "calm down" usually:', options: ['Works well', 'Escalates the situation', 'Has no effect', 'Is recommended by WHO'], correct: 1 },
            { question: 'Why validate anger in a crisis?', options: ['To agree with them', 'To build rapport and reduce tension', 'To show weakness', 'It is not recommended'], correct: 1 },
        ],
    })

    // Disaster RPG scenarios (parallel to beginner modules)
    const disasterRPGScenarios = ref({
        'd1': {
            title: 'The Trembling Ground',
            description: 'Strange seismic readings detected. An earthquake may be imminent. Investigate the warning signs and help the village evacuate.',
            tag: '🌋 Earthquake', tagClass: 'bg-red-600/20 text-red-100',
            npcName: 'Pak Hendra', npcAvatar: '👨🏽',
            difficulty: 1,
            mysteryHint: 'Something about the tremor pattern is... unusual.',
            steps: [
                {
                    narrative: 'The seismograph at the local station shows unusual micro-tremors. The pattern doesn\'t match any known tectonic activity. Pak Hendra, the village chief, approaches you looking worried.',
                    npc: 'The animals have been acting strange for days. My goats won\'t eat. The birds left the trees this morning. Something is coming.',
                    emotion: '😰', emotionLabel: 'Worried',
                    options: [
                        { text: 'Just superstition, Pak. Animals behave randomly.', score: 0, feedback: 'Indigenous knowledge about animal behavior before earthquakes has been documented by researchers. Dismissing it is a mistake.' },
                        { text: 'That is valuable information. In many cultures, animal behavior has predicted earthquakes. Let\'s check the seismic data together.', score: 3, feedback: 'Excellent! Combining indigenous observation with scientific data is the gold standard of early warning.' },
                        { text: 'We should evacuate immediately.', score: 1, feedback: 'Premature evacuation without evidence can cause panic and erode trust for future warnings.' },
                    ]
                },
                {
                    narrative: 'You check the seismograph readings. The micro-tremors are increasing in frequency — every 45 minutes now, compared to every 3 hours yesterday.',
                    npc: 'My neighbor says he saw cracks appearing in the road near the river. Should I be worried?',
                    emotion: '😟', emotionLabel: 'Anxious',
                    options: [
                        { text: 'Road cracks near a river combined with increasing micro-tremors could indicate ground instability. Let\'s organize a calm, staged evacuation of the riverside area.', score: 3, feedback: 'Perfect analysis. Multiple converging indicators justify a targeted evacuation. Keeping it calm prevents panic.' },
                        { text: 'It\'s probably just the heat causing road expansion.', score: 0, feedback: 'Dangerous dismissal. Road cracks combined with tremors are a serious warning sign.' },
                        { text: 'Tell everyone to run to higher ground now!', score: 1, feedback: 'The urgency is right but shouting "run" creates stampede risk. Organized evacuation saves more lives.' },
                    ]
                },
                {
                    narrative: 'A 5.2 magnitude earthquake strikes. Thanks to the early warning, the riverside families are already in the evacuation center. But the tremors continue...',
                    npc: 'It worked! But... the tremors haven\'t stopped. My brother says aftershocks can be worse. What do we do?',
                    emotion: '😨', emotionLabel: 'Fearful',
                    clue: '🔍 CLUE: The tremor pattern suggests this may be a foreshock, not the main event.',
                    options: [
                        { text: 'Aftershocks are normal and usually weaker. We should stay in the evacuation center, keep monitoring the seismograph, and prepare for the possibility of a larger event.', score: 3, feedback: 'Calm, evidence-based leadership. Acknowledging the unknown while maintaining preparedness is key.' },
                        { text: 'The worst is over, everyone can go home.', score: 0, feedback: 'Fatally wrong. The tremor pattern suggests this could be a foreshock preceding a larger quake.' },
                        { text: 'We need to leave the island entirely.', score: 1, feedback: 'Overreaction for a 5.2 event. Stay local, stay prepared.' },
                    ]
                },
            ]
        },
        'd2': {
            title: 'Rising Waters',
            description: 'Monsoon rains have swollen the river beyond capacity. Reports of missing evacuees add urgency. Coordinate the rescue before the second flood wave hits.',
            tag: '🌊 Flood', tagClass: 'bg-blue-600/20 text-blue-100',
            npcName: 'Ibu Sari', npcAvatar: '👩🏽',
            difficulty: 2,
            mysteryHint: 'Three families were marked as evacuated... but they never arrived at the shelter.',
            steps: [
                {
                    narrative: 'The evacuation log shows 47 families checked in. But the village roster lists 50. Three families are unaccounted for. Rain continues to pound the corrugated roof of the community hall.',
                    npc: 'I called the Suryadi family, the Wibowos, and old Mbah Parno. No answer on any of them. The road to their neighborhood is already underwater.',
                    emotion: '😰', emotionLabel: 'Desperate',
                    options: [
                        { text: 'We can\'t risk rescuers in floodwater at night. We\'ll search at dawn.', score: 1, feedback: 'Safety-first thinking is good, but with rising waters, dawn may be too late. Find a middle ground.' },
                        { text: 'Let\'s contact the local SAR team with boats. We can guide them using the neighborhood map. Meanwhile, try reaching the families through their neighbors\' phones.', score: 3, feedback: 'Multi-channel approach: professional rescue + community networks. Never rely on a single method.' },
                        { text: 'I\'ll swim out there myself.', score: 0, feedback: 'Heroic but reckless. An untrained swimmer in floodwater becomes another victim.' },
                    ]
                },
                {
                    narrative: 'The SAR team locates the Suryadi family on their roof. The Wibowos are at a neighbor\'s house on higher ground. But Mbah Parno is still missing. His house is empty.',
                    npc: 'Mbah Parno is 82. He can\'t swim. His daughter says he refused to leave because of his wife\'s grave in the backyard. He said he\'d rather stay with her.',
                    emotion: '😢', emotionLabel: 'Heartbroken',
                    clue: '🔍 CLUE: The daughter mentions a path behind the cemetery that leads to an elevated shrine.',
                    options: [
                        { text: 'His emotional attachment to his wife\'s grave is understandable. Let\'s check the elevated shrine behind the cemetery — he might have gone there for high ground. Send the boat team.', score: 3, feedback: 'Empathy + clue-following. Understanding his motivation helps predict his location.' },
                        { text: 'He made his choice. We can\'t force people to evacuate.', score: 0, feedback: 'Ethical obligation to attempt rescue. Elderly people in crisis may not make fully rational decisions.' },
                        { text: 'Drag him out by force if needed.', score: 1, feedback: 'Good urgency, bad method. Forcing an elderly person can cause injury and trauma.' },
                    ]
                },
                {
                    narrative: 'The SAR boat finds Mbah Parno at the shrine, praying. He is wet but alive. The second flood wave arrives 20 minutes later, submerging the entire lower village.',
                    npc: 'Thank God... if you hadn\'t found him... the water just covered his house completely.',
                    emotion: '🙏', emotionLabel: 'Grateful',
                    options: [
                        { text: 'Let\'s make sure he\'s warm and has water. And Ibu Sari — you did incredible work tracking those families. Your knowledge of the community saved lives today.', score: 3, feedback: 'Immediate care + community empowerment. Recognizing local heroes builds long-term resilience.' },
                        { text: 'He was irresponsible for not evacuating.', score: 0, feedback: 'Blaming an elderly widower for emotional decisions is cruel and unproductive.' },
                        { text: 'Close call. Let\'s move on.', score: 1, feedback: 'Too dismissive. Take a moment to acknowledge the emotional weight of what just happened.' },
                    ]
                },
            ]
        },
        'd3': {
            title: 'The Ash Veil',
            description: 'Mount Sinabung shows signs of imminent eruption. An informant claims the eruption won\'t happen, contradicting scientific readings. Uncover the truth while evacuating the danger zone.',
            tag: '🌋 Volcano', tagClass: 'bg-orange-700/20 text-orange-100',
            npcName: 'Dr. Megawati', npcAvatar: '👩🏻‍🔬',
            difficulty: 3,
            mysteryHint: 'The local "expert" telling everyone to stay... has financial interests in the upcoming harvest.',
            steps: [
                {
                    narrative: 'PVMBG (volcano monitoring center) raises the alert to Level III. But a man named Pak Gunawan, who claims to be a retired geologist, is telling villagers the readings are wrong and they should stay to protect the harvest.',
                    npc: 'The sulfur dioxide levels have tripled in 48 hours. Tilt meters show ground deformation. This is textbook pre-eruption behavior. But half the village believes Gunawan over us because he\'s local.',
                    emotion: '😤', emotionLabel: 'Frustrated',
                    options: [
                        { text: 'Let\'s publicly discredit Gunawan. Show the data and call him a liar.', score: 1, feedback: 'Confrontation can backfire. The village trusts him — attacking him may make them distrust you more.' },
                        { text: 'Can we verify Gunawan\'s credentials? Meanwhile, let\'s present our data at the village meeting in a way that\'s simple and visual — graphs, photos of the sulfur vents.', score: 3, feedback: 'Two-pronged approach: verify the counter-narrative AND communicate science accessibly. Brilliant.' },
                        { text: 'Force the evacuation. Who cares what they think.', score: 0, feedback: 'Forced evacuations destroy trust and may cause resistance that delays the process.' },
                    ]
                },
                {
                    narrative: 'You discover that Pak Gunawan is not a retired geologist — he owns 30 hectares of tomato crops due for harvest next week. If the village evacuates, he loses everything.',
                    npc: 'I knew it! His credentials are fake. But how do we tell the villagers without causing a fight?',
                    emotion: '😑', emotionLabel: 'Vindicated',
                    clue: '🔍 CLUE: Gunawan\'s motivation is financial, not malicious. He\'s terrified of losing his livelihood.',
                    options: [
                        { text: 'Let\'s approach Gunawan privately. Acknowledge his fear of losing the harvest. Then explain that the government disaster relief fund can compensate crop losses — but it can\'t bring back lives.', score: 3, feedback: 'Empathy-first. Understanding the root cause (economic fear) and offering a solution is masterful crisis communication.' },
                        { text: 'Expose him at the village meeting.', score: 1, feedback: 'Public shaming may work short-term but destroys community trust long-term.' },
                        { text: 'Arrest him for endangering the village.', score: 0, feedback: 'Disproportionate. He\'s scared, not criminal.' },
                    ]
                },
                {
                    narrative: 'Gunawan tearfully agrees to support the evacuation. He helps load his neighbors\' belongings onto trucks. Mount Sinabung erupts 6 hours later, burying the farmland in pyroclastic flow.',
                    npc: 'Everyone is safe. And Gunawan... he became the most active volunteer at the shelter. He\'s cooking for 200 people.',
                    emotion: '😊', emotionLabel: 'Relieved',
                    options: [
                        { text: 'That\'s the power of understanding someone\'s fear instead of fighting it. Gunawan wasn\'t the enemy — his economic insecurity was. Let\'s make sure he\'s connected to the crop compensation program.', score: 3, feedback: 'Full circle. Addressing root causes + follow-through = sustainable resilience.' },
                        { text: 'He\'s lucky we caught him in time.', score: 1, feedback: 'True but misses the redemption arc. Gunawan went from obstacle to hero.' },
                        { text: 'He should still be investigated.', score: 0, feedback: 'Punitive thinking undermines the community healing process.' },
                    ]
                },
                {
                    narrative: 'At the shelter, you brief the emergency coordination team. The mystery is solved — the "unreliable informant" was driven by fear, not deception.',
                    npc: 'You taught me something today: in a disaster, the hardest enemy isn\'t nature. It\'s fear. Thank you.',
                    emotion: '🙏', emotionLabel: 'Grateful',
                    options: [
                        { text: 'That\'s why we train, Dr. Megawati. Science tells us WHEN the danger comes. But understanding people tells us HOW to respond. Both matter equally.', score: 3, feedback: 'Perfect synthesis. The intersection of science and empathy is the core of disaster response.' },
                        { text: 'Just doing my job.', score: 2, feedback: 'Humble, but this was a teaching moment worth embracing.' },
                        { text: 'Next time, just force the evacuation earlier.', score: 0, feedback: 'Misses the entire lesson.' },
                    ]
                },
            ]
        },
    })

    const completedDisasterRPGs = ref([])

    function completeDisasterRPG(rpgId) {
        if (!completedDisasterRPGs.value.includes(rpgId)) {
            completedDisasterRPGs.value.push(rpgId)
            earnXP(120)
            earnCoins(25, `Disaster RPG: ${disasterRPGScenarios.value[rpgId]?.title || rpgId}`)
        }
    }

    return {
        isAuthenticated, userEmail, isAdmin,
        userName, countryCode, onboarded, locale, bio, avatarColor, avatarUrl, joinDate,
        userAge, userGender, hasDisasterExperience, userPersonalization,
        stabilityScore, isStable, soothingModeActive, hasCompletedCheckIn,
        currentModule, moduleProgress, xp, totalXPEarned, level, completedModules, completedRPGs,
        loginStreak, achievements, darkMode,
        lastLoginDate, loginRewardsCollected, todayRewardClaimed, dailyRewardHistory,
        breathingSessions, moodLogs, groundingSessions, completedBeginnerModules,
        dailyMissions, dailyMissionsCompleted, dailyMissionsTotal,
        resiCoinBalance, transactions,
        totalDonated, activeResponders, modulesCompletedGlobal, regionData,
        countries, levelTiers, modules, marketplace,
        beginnerModules, beginnerCompleted, toolkitItems,
        academyChapters, completedLiaRPGs, postTestAttempts, KKM_THRESHOLD,
        liaEvalScores, saveLiaEvalScore, getLiaEvalScore,
        erqPreTest, erqPostTest, erqScores, erqCompleted, saveErqScore, getErqResults,
        simulationHP, MAX_SIM_HP, simCheckpoint, damageSimHP, healSimHP, resetSimHP, setSimCheckpoint,
        storyProgress, updateStoryProgress,
        bridgingQuests, chapterQuests, completedChapterQuests,
        completedActs, completedBridgingQuests,
        questHP, questRetries, MAX_QUEST_HP, MAX_RETRIES,
        achievementsList, levelPerks, weeklyChallenge, personalMilestones,
        dailyRewards, currentRewardWeek, currentRewardDay,
        currentTier, nextTier, tierProgress,
        xpForNextLevel, xpProgress, completionRate,
        moduleTestScores, moduleTests,
        disasterRPGScenarios, completedDisasterRPGs,
        registerUser, loginUser, loginWithGoogle, logoutUser,
        supabaseUserId, initFromSupabase, syncToSupabase,
        completeOnboarding, updateProfile, updateStability, completeSoothing,
        earnXP, earnCoins, redeemCoins, donateCoins,
        completeModule, completeRPG, completeDailyMission, moduleRPGCompleted,
        claimDailyReward, completeBeginnerModule,
        completeDisasterRPG, submitTestScore, submitPostTest, completeLiaRPG,
        completeAct, isActCompleted, getChapterActsCompleted,
        completeBridgingQuest, completeChapterQuest,
        resetQuestHP, damageQuestHP, getQuestRetries, useQuestRetry,
        logBreathingSession, logMood, logGroundingSession,
        toggleDarkMode, checkAchievements, unlockAchievement,
    }
})
