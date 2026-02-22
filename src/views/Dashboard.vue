<template>
  <div>
    <TourGuide ref="dashTour" :steps="dashboardTourSteps" tourKey="dashboard" nextTourRoute="/academy" :totalSteps="9" :globalStepOffset="3" :delay="800" />

    <!-- Header -->
    <div class="mb-10 sm:mb-12 animate-slide-up">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <PhBroadcast :size="22" class="text-white" weight="fill" />
        </div>
        <div>
          <h1 class="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-ink dark:text-white leading-tight">
            Mission Control
          </h1>
          <p class="text-gray-400 font-body text-sm sm:text-base mt-0.5">ASEAN disaster intelligence & real-time threat overview.</p>
        </div>
      </div>
    </div>

    <!-- Live Threat Ticker -->
    <div class="bg-red-50 dark:bg-red-900/15 rounded-2xl p-4 mb-8 overflow-hidden animate-slide-up border border-red-200/30 dark:border-red-800/30" style="animation-delay:0.02s">
      <div class="flex items-center gap-3">
        <span class="text-xs font-heading font-bold text-red-500 uppercase tracking-wider animate-pulse flex-shrink-0"><PhLightning :size="14" weight="fill" class="inline" /> LIVE</span>
        <div class="overflow-hidden flex-1">
          <div class="flex gap-12 ticker-scroll whitespace-nowrap text-xs font-body text-red-600 dark:text-red-400">
            <span v-for="(alert, i) in tickerAlerts" :key="i" class="inline-flex items-center gap-2">
              <span class="text-sm">{{ alert.flag }}</span>
              {{ alert.text }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Top metrics — Personal Readiness + Global Stats -->
    <div id="top-metrics" class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8 sm:mb-10 animate-slide-up" style="animation-delay:0.03s">
      <!-- Personal Readiness Score -->
      <div class="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <p class="text-[10px] font-heading font-bold text-teal-200 uppercase tracking-wider mb-2">Your Readiness</p>
        <div class="flex items-center gap-3">
          <div class="relative w-16 h-16">
            <svg class="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="white" stroke-width="4"
                :stroke-dasharray="175.9" :stroke-dashoffset="175.9 - (175.9 * readinessScore / 100)" stroke-linecap="round"
                style="transition: stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)" />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-lg font-heading font-bold">{{ readinessScore }}%</span>
            </div>
          </div>
          <div>
            <p class="font-heading font-bold text-lg">{{ readinessLabel }}</p>
            <p class="text-[10px] text-teal-200">Based on your progress</p>
          </div>
        </div>
      </div>

      <div v-for="m in topMetrics" :key="m.label" class="bg-white dark:bg-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50">
        <p class="text-[10px] font-heading font-bold text-gray-300 dark:text-gray-500 uppercase tracking-wider mb-2">{{ m.label }}</p>
        <p class="font-heading text-2xl sm:text-3xl font-bold" :class="m.color">{{ m.value }}</p>
        <p class="text-xs text-gray-400 mt-1 font-body">{{ m.sub }}</p>
      </div>
    </div>

    <!-- ASEAN Risk Comparison Chart -->
    <div class="mb-8 sm:mb-10 bg-white dark:bg-slate-800/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 animate-slide-up" style="animation-delay:0.04s">
      <h3 class="font-heading text-base sm:text-lg font-bold text-ink dark:text-white mb-2 flex items-center gap-2">
        <PhChartBar :size="20" weight="fill" class="inline text-teal-500" /> ASEAN Risk Comparison
      </h3>
      <p class="text-xs text-gray-500 mb-6 font-body">Comparative analysis of Disaster Risk Indices across member nations.</p>
      <div class="relative h-64 sm:h-80 w-full">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- ASEAN Country Cards — Interactive -->
    <div class="mb-8 sm:mb-10 animate-slide-up" style="animation-delay:0.06s">
      <h3 class="font-heading text-base sm:text-lg font-bold text-ink dark:text-white mb-5 flex items-center gap-2">
        <span class="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-sm"><PhGlobeHemisphereWest :size="16" weight="fill" class="text-teal-500" /></span>
        ASEAN Intelligence Hub
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div v-for="r in store.regionData" :key="r.country"
          class="country-card bg-white dark:bg-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden"
          :class="{ 'ring-2 ring-teal-500': selectedCountry === r.code }"
          @click="selectedCountry = selectedCountry === r.code ? null : r.code">
          <!-- Risk color strip -->
          <div class="absolute top-0 left-0 right-0 h-1" :class="r.disasterRiskIndex > 40 ? 'bg-red-500' : r.disasterRiskIndex > 20 ? 'bg-orange-400' : 'bg-teal-400'"></div>

          <div class="text-center">
            <span class="text-3xl sm:text-4xl block mb-2 group-hover:scale-110 transition-transform">{{ r.flag }}</span>
            <p class="font-heading font-bold text-xs text-ink dark:text-white mb-1 truncate">{{ r.country }}</p>
            <div class="flex items-center justify-center gap-1 mb-2">
              <span class="w-2 h-2 rounded-full" :class="r.disasterRiskIndex > 40 ? 'bg-red-500 animate-pulse' : r.disasterRiskIndex > 20 ? 'bg-orange-400' : 'bg-teal-400'"></span>
              <span class="text-[9px] font-heading font-bold" :class="riskColor(r.disasterRiskIndex)">{{ r.disasterRiskIndex }}</span>
            </div>
            <!-- Emergency hotline -->
            <div class="bg-red-50/80 dark:bg-red-900/20 rounded-lg px-2 py-1.5 mt-2">
              <p class="text-[8px] font-heading text-red-400 uppercase tracking-wider">Emergency</p>
              <p class="text-xs font-heading font-bold text-red-600 dark:text-red-400"><PhPhone :size="14" weight="fill" class="inline" /> {{ r.emergencyHotline }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Expanded Country Detail -->
    <Transition name="expand">
      <div v-if="selectedCountry" class="mb-8 sm:mb-10 bg-white dark:bg-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none dark:border dark:border-slate-700/50 animate-slide-up">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div class="flex items-center gap-4">
            <span class="text-5xl">{{ selectedData.flag }}</span>
            <div>
              <h3 class="font-heading text-xl font-bold text-ink dark:text-white">{{ selectedData.country }}</h3>
              <p class="text-xs text-gray-400 font-body">Population: {{ selectedData.population }}M · GDP/Cap: ${{ selectedData.gdpPerCapita?.toLocaleString() }}</p>
            </div>
          </div>
          <button @click="selectedCountry = null" class="text-gray-400 hover:text-gray-600 text-sm">✕</button>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-4 text-center">
            <p class="text-[9px] font-heading text-gray-400 uppercase mb-1">Risk Index</p>
            <p class="font-heading text-2xl font-bold" :class="riskColor(selectedData.disasterRiskIndex)">{{ selectedData.disasterRiskIndex }}</p>
          </div>
          <div class="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-4 text-center">
            <p class="text-[9px] font-heading text-gray-400 uppercase mb-1">HDI</p>
            <p class="font-heading text-2xl font-bold text-ink dark:text-white">{{ selectedData.hdi }}</p>
          </div>
          <div class="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-4 text-center">
            <p class="text-[9px] font-heading text-gray-400 uppercase mb-1">Disasters/yr</p>
            <p class="font-heading text-2xl font-bold text-amber-500">{{ selectedData.annualDisasters }}</p>
          </div>
          <div class="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-4 text-center">
            <p class="text-[9px] font-heading text-gray-400 uppercase mb-1">Responders</p>
            <p class="font-heading text-2xl font-bold text-teal-500">{{ selectedData.responders }}</p>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-4">
            <p class="text-[9px] font-heading text-amber-600 uppercase mb-1">Top Threats</p>
            <p class="text-sm font-body text-amber-700 dark:text-amber-400">{{ selectedData.topDisasters || '—' }}</p>
          </div>
          <div class="bg-red-50/50 dark:bg-red-900/10 rounded-xl p-4">
            <p class="text-[9px] font-heading text-red-600 uppercase mb-1">Most Recent</p>
            <p class="text-sm font-body text-red-700 dark:text-red-400">{{ selectedData.recentDisaster }}</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ASEAN Today + Community -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-8 sm:mb-10 animate-slide-up" style="animation-delay:0.08s">
      <!-- ASEAN Today Feed -->
      <div class="bg-white dark:bg-slate-800/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50">
        <h3 class="font-heading text-base font-bold text-ink dark:text-white mb-5 flex items-center gap-2">
          <PhNewspaper :size="16" weight="fill" class="inline text-teal-500" /> ASEAN Today
        </h3>
        <div class="space-y-3">
          <div v-for="fact in todayFacts" :key="fact.title"
            class="p-4 rounded-xl transition-colors"
            :class="fact.type === 'tip' ? 'bg-teal-50/60 dark:bg-teal-900/10' : fact.type === 'fact' ? 'bg-amber-50/60 dark:bg-amber-900/10' : 'bg-blue-50/60 dark:bg-blue-900/10'">
            <div class="flex items-start gap-3">
              <component :is="fact.icon" :size="18" weight="fill" class="flex-shrink-0" :class="fact.type === 'tip' ? 'text-teal-500' : fact.type === 'fact' ? 'text-amber-500' : 'text-blue-500'" />
              <div>
                <p class="text-xs font-heading font-bold text-ink dark:text-white mb-0.5">{{ fact.title }}</p>
                <p class="text-[11px] text-gray-500 dark:text-gray-400 font-body leading-relaxed">{{ fact.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Community Leaderboard -->
      <div class="bg-white dark:bg-slate-800/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50">
        <h3 class="font-heading text-base font-bold text-ink dark:text-white mb-5 flex items-center gap-2">
          <PhTrophy :size="16" weight="fill" class="inline text-amber-500" /> Community Leaderboard
        </h3>
        <div class="space-y-2.5">
          <div v-for="(user, i) in leaderboard" :key="i"
            class="flex items-center gap-3 p-3 rounded-xl transition-colors"
            :class="user.isYou ? 'bg-teal-50 dark:bg-teal-900/15 ring-1 ring-teal-200 dark:ring-teal-800' : 'hover:bg-gray-50 dark:hover:bg-slate-700/30'">
            <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-heading font-bold flex-shrink-0"
              :class="i < 3 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'">
              {{ i < 3 ? ['1st','2nd','3rd'][i] : i + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-heading font-bold truncate" :class="user.isYou ? 'text-teal-600 dark:text-teal-400' : 'text-ink dark:text-white'">
                {{ user.name }}{{ user.isYou ? ' (You)' : '' }}
              </p>
              <p class="text-[10px] text-gray-400 font-body">{{ user.country }}</p>
            </div>
            <span class="text-xs font-heading font-bold text-amber-500">{{ user.xp }} XP</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Responders + Recent Disasters -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 animate-slide-up" style="animation-delay:0.1s">
      <div id="responders" class="bg-white dark:bg-slate-800/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50">
        <h3 class="font-heading text-base font-bold text-ink dark:text-white mb-5">Responders Deployed <PhShieldCheck :size="16" weight="fill" class="inline text-teal-500" /></h3>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div v-for="r in store.regionData" :key="r.country" class="text-center p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/30 rounded-xl sm:rounded-2xl hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors cursor-default">
            <p class="text-xl sm:text-2xl mb-1.5">{{ r.flag }}</p>
            <p class="font-heading font-bold text-ink dark:text-white text-sm sm:text-lg">{{ r.responders }}</p>
            <p class="text-[9px] text-gray-400 font-body truncate mt-0.5">{{ r.country }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50">
        <h3 class="font-heading text-base font-bold text-ink dark:text-white mb-5">Recent Disasters <PhWarning :size="16" weight="fill" class="inline text-amber-500" /></h3>
        <div class="space-y-2.5">
          <div v-for="r in sortedByRisk" :key="r.country" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
            <span class="text-lg flex-shrink-0">{{ r.flag }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium font-body truncate text-ink dark:text-white">{{ r.recentDisaster }}</p>
              <p class="text-[10px] text-gray-400 mt-0.5">{{ r.country }}</p>
            </div>
            <span class="text-[10px] font-heading font-bold px-2.5 py-1 rounded-full flex-shrink-0" :class="statusClass(r.disasterRiskIndex)">
              {{ r.disasterRiskIndex }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import TourGuide from '../components/TourGuide.vue'
import { PhCompass, PhMapTrifold, PhUsersThree, PhBroadcast, PhLightning, PhChartBar, PhGlobeHemisphereWest, PhPhone, PhNewspaper, PhTrophy, PhShieldCheck, PhWarning, PhLightbulb, PhCrosshair } from '@phosphor-icons/vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const store = useResiliaStore()
const selectedCountry = ref(null)

onMounted(() => store.completeDailyMission('dashboard'))

// Chart Configuration
const chartData = computed(() => ({
  labels: store.regionData.map(r => r.code),
  datasets: [{
    label: 'Risk Index',
    data: store.regionData.map(r => r.disasterRiskIndex),
    backgroundColor: store.regionData.map(r => parseInt(r.disasterRiskIndex) > 40 ? '#ef4444' : parseInt(r.disasterRiskIndex) > 20 ? '#f59e0b' : '#14b8a6'),
    borderRadius: 6,
    borderWidth: 0,
    barPercentage: 0.6
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { 
      beginAtZero: true, 
      max: 60,
      grid: { color: 'rgba(156, 163, 175, 0.1)' }, 
      ticks: { color: '#9CA3AF', font: { family: 'Inter', size: 10 } } 
    },
    x: { 
      grid: { display: false }, 
      ticks: { color: '#9CA3AF', font: { family: 'Outfit', weight: 'bold', size: 12 } } 
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: { 
      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
      titleColor: '#fff', 
      titleFont: { family: 'Outfit', size: 14 },
      bodyColor: '#e2e8f0', 
      bodyFont: { family: 'Inter', size: 12 },
      padding: 12, 
      cornerRadius: 12,
      callbacks: {
        title: (context) => {
          const code = context[0].label
          const r = store.regionData.find(x => x.code === code)
          return r ? `${r.flag} ${r.country}` : code
        }
      }
    }
  }
}

// Personal Readiness Score (based on user progress)
const readinessScore = computed(() => {
  const modulesPct = store.completionRate || 0
  const actsPct = (store.completedActs?.length || 0) * 5
  const checkIn = store.hasCompletedCheckIn ? 15 : 0
  const streak = Math.min(store.loginStreak * 3, 15)
  return Math.min(100, Math.round(modulesPct * 0.5 + actsPct + checkIn + streak))
})
const readinessLabel = computed(() => {
  if (readinessScore.value >= 80) return 'Field Ready'
  if (readinessScore.value >= 60) return 'Advanced'
  if (readinessScore.value >= 30) return 'Developing'
  return 'Beginner'
})

const topMetrics = computed(() => [
  { label: 'Active Responders', value: store.activeResponders.toLocaleString(), sub: 'deployed across ASEAN', color: 'text-teal-600 dark:text-teal-400' },
  { label: 'Community Fund', value: store.totalDonated.toLocaleString() + ' RC', sub: 'sponsored to communities', color: 'text-orange-600 dark:text-orange-400' },
])

const sortedByRisk = computed(() => [...store.regionData].sort((a, b) => b.disasterRiskIndex - a.disasterRiskIndex).slice(0, 6))
const selectedData = computed(() => store.regionData.find(r => r.code === selectedCountry.value) || {})

// Live threat ticker
const tickerAlerts = computed(() => store.regionData.map(r => ({
  flag: r.flag,
  text: `${r.country}: ${r.recentDisaster} · Risk ${r.disasterRiskIndex}`
})))

// ASEAN Today Feed
const todayFacts = [
  { icon: PhLightbulb, title: 'Did You Know?', text: 'Indonesia experiences about 2,000 earthquakes per year, making it the most seismically active country in ASEAN.', type: 'fact' },
  { icon: PhCrosshair, title: 'Training Tip', text: 'Psychological First Aid (PFA) is most effective when applied within the first 72 hours after a disaster event.', type: 'tip' },
  { icon: PhChartBar, title: 'ASEAN Stats', text: 'Over 650 million people in ASEAN face increasing climate-related disaster risks each year.', type: 'stat' },
]

// Mock leaderboard
const leaderboard = computed(() => [
  { name: 'ResiMaster_PH', country: '🇵🇭 Manila', xp: 4520 },
  { name: 'DisasterReady_ID', country: '🇮🇩 Jakarta', xp: 3890 },
  { name: 'CycloneHunter_MM', country: '🇲🇲 Yangon', xp: 3210 },
  { name: store.userName || 'Tester', country: store.countryCode ? `${store.regionData.find(r => r.code === store.countryCode)?.flag || ''} ${store.regionData.find(r => r.code === store.countryCode)?.country || ''}` : '🌏 ASEAN', xp: store.totalXPEarned, isYou: true },
  { name: 'FloodWatch_VN', country: '🇻🇳 Hanoi', xp: 1580 },
  { name: 'QuakeReady_TH', country: '🇹🇭 Bangkok', xp: 1120 },
])

function riskColor(r) { return r > 40 ? 'text-red-500' : r > 20 ? 'text-orange-500' : 'text-teal-600 dark:text-teal-400' }
function statusClass(r) { return r > 40 ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : r > 20 ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' }

const dashboardTourSteps = [
  { title: 'Mission Control', description: 'Your command center for ASEAN disaster intelligence and deployment data.', target: '#top-metrics', icon: PhCompass },
  { title: 'ASEAN Intelligence', description: 'Click any country card to see detailed risk data, threats, and emergency hotlines.', target: '.country-card', icon: PhMapTrifold },
  { title: 'Responder Map', description: 'See trained responders deployed in each country.', target: '#responders', icon: PhUsersThree },
]
</script>

<style scoped>
@keyframes tickerScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.ticker-scroll {
  animation: tickerScroll 30s linear infinite;
}

.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
</style>
