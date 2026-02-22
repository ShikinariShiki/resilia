import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

/**
 * Auth Service — wraps Supabase Auth with secure defaults.
 * Falls back to localStorage mock if Supabase is not configured.
 */

// ═══════════════════════════════════════
// Sign Up — email + password
// ═══════════════════════════════════════
export async function signUp(email, password, displayName) {
    if (!isSupabaseConfigured()) {
        return { user: { id: 'local_' + Date.now(), email }, error: null, isLocal: true }
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { display_name: displayName }, // stored in auth.users.raw_user_meta_data
        },
    })

    if (error) return { user: null, error: error.message }

    // Create profile row (RLS allows insert for authenticated user)
    if (data.user) {
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                id: data.user.id,
                display_name: displayName,
                email: email,
            })

        if (profileError) console.error('[Auth] Profile insert error:', profileError.message)

        // Create empty progress row
        await supabase.from('user_progress').insert({ id: data.user.id })
        // Create empty settings row
        await supabase.from('user_settings').insert({ id: data.user.id })
    }

    return { user: data.user, error: null }
}

// ═══════════════════════════════════════
// Sign In — email + password
// ═══════════════════════════════════════
export async function signIn(email, password) {
    if (!isSupabaseConfigured()) {
        return { user: { id: 'local_' + Date.now(), email }, session: null, error: null, isLocal: true }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) return { user: null, session: null, error: error.message }
    return { user: data.user, session: data.session, error: null }
}

// ═══════════════════════════════════════
// Sign In With Google — OAuth redirect
// ═══════════════════════════════════════
export async function signInWithGoogle() {
    if (!isSupabaseConfigured()) {
        return { error: 'Supabase not configured — Google OAuth unavailable' }
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/',
        },
    })

    if (error) return { error: error.message }
    return { url: data.url, error: null }
}

// ═══════════════════════════════════════
// Sign Out
// ═══════════════════════════════════════
export async function signOut() {
    if (!isSupabaseConfigured()) return { error: null }

    const { error } = await supabase.auth.signOut()
    if (error) return { error: error.message }
    return { error: null }
}

// ═══════════════════════════════════════
// Get Current Session
// ═══════════════════════════════════════
export async function getSession() {
    if (!isSupabaseConfigured()) return { session: null, user: null }

    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
        console.error('[Auth] getSession error:', error.message)
        return { session: null, user: null }
    }
    return { session, user: session?.user || null }
}

// ═══════════════════════════════════════
// Listen for Auth State Changes
// ═══════════════════════════════════════
export function onAuthStateChange(callback) {
    if (!isSupabaseConfigured()) return { data: { subscription: { unsubscribe: () => { } } } }

    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session)
    })
}
