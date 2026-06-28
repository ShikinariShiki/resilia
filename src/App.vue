<template>
  <div class="min-h-screen" :class="[store.darkMode ? 'dark bg-slate-900' : 'bg-sand-50', { 'authenticated-layout': store.onboarded && !isFullscreenRoute }]">
    
    <!-- Offline Banner -->
    <Transition name="slide-down">
      <div v-if="isOffline" class="fixed top-0 left-0 right-0 z-[100] bg-red-500 text-white px-4 py-2 text-center text-sm font-heading font-bold shadow-lg flex items-center justify-center gap-2 animate-pulse">
        <PhWifiSlash :size="18" weight="bold" />
        Offline Mode Active
      </div>
    </Transition>

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
        <main class="flex-1 px-4 sm:px-6 md:px-10 lg:px-14 py-6 sm:py-8 md:py-10 lg:py-12 w-full box-border relative">
          <RouterView v-slot="{ Component }">
            <Transition name="page" mode="out-in">
              <component :is="Component" :key="route.path" />
            </Transition>
          </RouterView>
        </main>
      </div>
    </template>
    
    <template v-else>
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
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
import { PhWifiSlash } from '@phosphor-icons/vue'

const store = useResiliaStore()
const route = useRoute()
const router = useRouter()
const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)
const windowWidth = ref(1024)
const isOffline = ref(!navigator.onLine)

function updateOnlineStatus() {
  isOffline.value = !navigator.onLine
}

function onResize() {
  windowWidth.value = window.innerWidth
  if (windowWidth.value >= 768) mobileMenuOpen.value = false
}
onMounted(async () => {
  windowWidth.value = window.innerWidth
  window.addEventListener('resize', onResize)
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  // ═══ Supabase: Restore session on app load ═══
  if (isSupabaseConfigured()) {
    const { session, user } = await getSession()
    if (session && user) {
      store.isAuthenticated = true
      store.userEmail = user.email
      store.authProvider = user.app_metadata?.provider || 'local'
      await store.initFromSupabase(user.id)
      // If not onboarded but authenticated, go to onboarding
      if (!store.onboarded && route.name !== 'onboarding') {
        router.push('/onboarding')
      }
    }
  }
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})

// ═══ Supabase: Listen for auth state changes ═══
if (isSupabaseConfigured()) {
  onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      store.isAuthenticated = true
      store.userEmail = session.user.email
      store.authProvider = session.user.app_metadata?.provider || 'local'

      // Extract Google profile photo and name from user metadata
      const meta = session.user.user_metadata || {}
      // Google may expose the photo as avatar_url or picture
      const googlePhoto = meta.avatar_url || meta.picture || ''
      if (googlePhoto) {
        store.avatarUrl = googlePhoto
      }
      // Extract first name from Google full_name (e.g. "John Doe" → "John")
      const googleName = meta.full_name || meta.name || meta.given_name || ''
      
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
      store.authProvider = 'local'
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

<style>
/* Offline Banner Transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(15px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
