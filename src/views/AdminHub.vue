<template>
  <div class="admin-hub min-h-screen bg-slate-50 dark:bg-slate-900 p-6 sm:p-10">
    <div class="max-w-4xl mx-auto space-y-8">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
          <Settings2 :size="32" />
        </div>
        <div>
          <h1 class="text-3xl font-heading font-black text-slate-800 dark:text-white">Admin Control Hub</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1">Force trigger components & states for testing</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Onboarding -->
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
            <UserPlus :size="24" />
          </div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">Onboarding Flow</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 min-h-[40px]">Test the initial user registration, personalization, and profile setup.</p>
          <button @click="triggerOnboarding" class="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            Start Onboarding
          </button>
        </div>

        <!-- Daily Check In -->
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
            <ClipboardCheck :size="24" />
          </div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">Daily Check-In</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 min-h-[40px]">Force the daily mental stability pop-up to appear on Home.</p>
          <button @click="triggerCheckIn" class="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            Trigger Check-In Popup
          </button>
        </div>

        <!-- Tour -->
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Map :size="24" />
          </div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">App Tour Guide</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 min-h-[40px]">Reset the tutorial tours across the whole app (Home, Academy, Dashboard).</p>
          <button @click="triggerTour" class="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            Reset & Restart Tour
          </button>
        </div>

        <!-- God Mode Tools -->
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 border-2 !border-teal-500/50">
          <div class="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
            <Zap :size="24" />
          </div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">God Mode Status</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 min-h-[40px]">Account: {{ store.userEmail }}<br>Level: {{ store.level }} / Coins: {{ store.resiCoinBalance }}</p>
          <button @click="resetBypass" class="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold transition-colors shadow-md shadow-teal-500/20">
            Reapply Admin Privileges
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import { Settings2, UserPlus, ClipboardCheck, Map, Zap } from 'lucide-vue-next'

const router = useRouter()
const store = useResiliaStore()

onMounted(() => {
  if (!store.isAdmin) {
    router.push('/home')
  }
})

function triggerOnboarding() {
  localStorage.setItem('resilia_onboarded', 'false')
  store.onboarded = false
  router.push('/onboarding')
}

function triggerCheckIn() {
  store.hasCompletedCheckIn = false
  localStorage.setItem('resilia_checkin_date', '')
  
  const savedSession = JSON.parse(localStorage.getItem('resilia_daily_session') || '{}')
  savedSession.checkInDone = false
  localStorage.setItem('resilia_daily_session', JSON.stringify(savedSession))
  
  router.push('/home').then(() => {
    window.location.reload()
  })
}

function triggerTour() {
  localStorage.removeItem('resilia_tours_completed')
  router.push('/home').then(() => {
    window.location.reload()
  })
}

function resetBypass() {
  localStorage.removeItem('admin_bypassed')
  window.location.reload()
}
</script>
