<template>
  <div class="min-h-screen" :class="[store.darkMode ? 'dark bg-slate-900' : 'bg-sand-50', { 'authenticated-layout': store.onboarded && !isFullscreenRoute }]">
    <template v-if="store.onboarded && !isFullscreenRoute">
      <!-- Fixed Sidebar -->
      <NavSidebar
        :collapsed="sidebarCollapsed"
        :mobileOpen="mobileMenuOpen"
        @toggle="sidebarCollapsed = !sidebarCollapsed"
        @close-mobile="mobileMenuOpen = false"
      />

      <!-- Mobile Overlay -->
      <div v-if="mobileMenuOpen" @click="mobileMenuOpen = false"
        class="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"></div>
      
      <!-- Main Content: Margin Left + Width Strategy -->
      <div 
        class="min-h-screen flex flex-col transition-all duration-300"
        :style="{
          marginLeft: isMobile ? '0px' : (sidebarCollapsed ? '72px' : '260px'),
          width: isMobile ? '100%' : (sidebarCollapsed ? 'calc(100% - 72px)' : 'calc(100% - 260px)'),
          maxWidth: isMobile ? '100vw' : undefined,
          overflowX: 'hidden'
        }"
      >
        <TopBar @toggle-menu="mobileMenuOpen = !mobileMenuOpen" />
        <main class="flex-1 px-4 sm:px-6 md:px-10 lg:px-14 py-6 sm:py-8 md:py-10 lg:py-12 animate-fade-in w-full box-border">
          <RouterView />
        </main>
      </div>
    </template>
    
    <template v-else>
      <RouterView />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { useRoute, useRouter, RouterView } from 'vue-router'
import { useResiliaStore } from './stores/resiliaStore'
import NavSidebar from './components/NavSidebar.vue'
import TopBar from './components/TopBar.vue'
import { onAuthStateChange, getSession } from './services/authService'
import { isSupabaseConfigured } from './lib/supabaseClient'

const store = useResiliaStore()
const route = useRoute()
const router = useRouter()
const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)
const windowWidth = ref(1024)

function onResize() {
  windowWidth.value = window.innerWidth
  if (windowWidth.value >= 768) mobileMenuOpen.value = false
}
onMounted(async () => {
  windowWidth.value = window.innerWidth
  window.addEventListener('resize', onResize)

  // ═══ Supabase: Restore session on app load ═══
  if (isSupabaseConfigured()) {
    const { session, user } = await getSession()
    if (session && user) {
      store.isAuthenticated = true
      store.userEmail = user.email
      await store.initFromSupabase(user.id)
      // If not onboarded but authenticated, go to onboarding
      if (!store.onboarded && route.name !== 'onboarding') {
        router.push('/onboarding')
      }
    }
  }
})
onUnmounted(() => window.removeEventListener('resize', onResize))

// ═══ Supabase: Listen for auth state changes ═══
if (isSupabaseConfigured()) {
  onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      store.isAuthenticated = true
      store.userEmail = session.user.email

      // Extract Google profile photo and name from user metadata
      const meta = session.user.user_metadata || {}
      if (meta.avatar_url) {
        store.avatarUrl = meta.avatar_url
      }
      // Extract first name from Google full_name (e.g. "John Doe" → "John")
      const googleName = meta.full_name || meta.name || ''
      
      await store.initFromSupabase(session.user.id)
      
      // If store didn't already have a display name, use Google's
      if (!store.userName && googleName) {
        store.userName = googleName.split(' ')[0]
      }
      
      // Sync the Google avatar + name to Supabase
      store.syncToSupabase()
      
      // Route based on onboarding state
      if (!store.onboarded) router.push('/onboarding')
      else router.push('/home')
    } else if (event === 'SIGNED_OUT') {
      store.isAuthenticated = false
      store.supabaseUserId = null
      router.push('/auth')
    }
  })
}

// Dark mode: toggle class on <html> for Tailwind dark: variants
watchEffect(() => {
  if (store.darkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

const fullscreenRoutes = ['landing', 'auth', 'onboarding', 'journal', 'soothing', 'terms', 'privacy']
const isFullscreenRoute = computed(() => fullscreenRoutes.includes(route.name))
const isMobile = computed(() => windowWidth.value < 768)
</script>

<style scoped>
/* No specific styles needed for margin strategy */
</style>
