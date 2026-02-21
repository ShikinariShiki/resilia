<template>
  <div>
    <DailyRewardModal />
    <TourGuide :steps="homeTourSteps" tourKey="home" />

    <!-- Header -->
    <div class="mb-8 sm:mb-10 md:mb-12 lg:mb-14 animate-slide-up">
      <h1 class="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-ink dark:text-white leading-tight">{{ t('home.welcome', { name: store.userName }) }}</h1>
      <p class="text-gray-400 font-body mt-2 sm:mt-3 text-sm sm:text-base">{{ t('home.subtitle') }}</p>
    </div>

    <!-- Rank + Balance -->
    <div id="tour-rank-balance" class="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 md:mb-12 lg:mb-14 animate-slide-up" style="animation-delay: 0.05s">
      <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 lg:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700">
        <div class="flex items-start justify-between mb-6 sm:mb-8">
          <div class="flex items-center gap-4 sm:gap-5">
            <div class="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl md:text-4xl" :style="{ backgroundColor: store.currentTier.color + '15' }">
              {{ store.currentTier.icon }}
            </div>
            <div>
              <p class="font-heading text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold" :style="{ color: store.currentTier.color }">{{ store.currentTier.name }}</p>
              <p class="text-xs sm:text-sm text-gray-400 font-body mt-1">Level {{ store.level }} · {{ store.totalXPEarned }} XP</p>
            </div>
          </div>
          <div class="text-right hidden md:block">
            <p class="text-[11px] font-heading font-bold text-gray-300 dark:text-gray-500 uppercase tracking-wider">{{ t('home.rank.next') }}</p>
            <p class="font-heading font-bold text-lg mt-1" v-if="store.nextTier" :style="{ color: store.nextTier.color }">{{ store.nextTier.icon }} {{ store.nextTier.name }}</p>
            <p class="font-heading font-bold text-lg mt-1 text-gold" v-else>🏆 {{ t('home.rank.max') }}</p>
          </div>
        </div>
        <div class="w-full mt-3 sm:mt-4">
          <XPBarAnimated 
            :current="store.nextTier ? store.totalXPEarned - store.currentTier.minXP : 100" 
            :max="store.nextTier ? store.nextTier.minXP - store.currentTier.minXP : 100" 
            :level="store.level" 
          />
        </div>
        <p class="text-xs sm:text-sm text-gray-400 font-body mt-2 sm:mt-3" v-if="store.nextTier">{{ t('home.rank.to_next', { xp: store.nextTier.minXP - store.totalXPEarned, next_rank: store.nextTier.name }) }}</p>
      </div>

      <div class="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 lg:p-10 text-white flex flex-col justify-between min-h-[160px] sm:min-h-0 hover-lift">
        <div>
          <p class="text-[10px] sm:text-[11px] font-heading font-bold text-teal-200 uppercase tracking-wider mb-3 sm:mb-4">{{ t('home.balance.label') }}</p>
          <div class="flex items-baseline gap-2 sm:gap-3">
            <span class="text-2xl sm:text-3xl md:text-4xl animate-float">🪙</span>
            <span class="font-heading text-3xl sm:text-4xl md:text-5xl font-bold">{{ store.resiCoinBalance }}</span>
            <span class="font-heading text-sm sm:text-lg text-teal-200">RC</span>
          </div>
        </div>
        <RouterLink to="/wallet" class="inline-block mt-4 sm:mt-6 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/15 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-heading font-bold hover:bg-white/25 transition-colors w-fit backdrop-blur-sm">
          {{ t('home.balance.view_wallet') }}
        </RouterLink>
      </div>
    </div>

    <!-- Community Challenge -->
    <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 mb-8 sm:mb-10 md:mb-12 lg:mb-14 animate-slide-up hover-lift" style="animation-delay: 0.07s">
      <div class="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-500/20 dark:bg-purple-500/30 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 animate-pulse-soft">🏆</div>
          <div>
            <p class="font-heading font-bold text-sm sm:text-base text-ink dark:text-white">{{ store.weeklyChallenge.title }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 font-body mt-0.5">{{ store.weeklyChallenge.description }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <div class="flex-1 sm:w-32">
            <div class="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" :style="{ width: (store.weeklyChallenge.current / store.weeklyChallenge.target * 100) + '%' }"></div>
            </div>
            <p class="text-[10px] text-gray-400 font-heading font-bold mt-1">{{ store.weeklyChallenge.current }}/{{ store.weeklyChallenge.target }} · {{ store.weeklyChallenge.endsIn }}</p>
          </div>
          <span class="text-xs font-heading font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-lg flex-shrink-0 animate-shake">{{ t('home.challenge.reward', { amount: store.weeklyChallenge.reward }) }}</span>
        </div>
      </div>
    </div>

    <!-- Academy Spotlight + Streak -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 md:mb-12 lg:mb-14 animate-slide-up" style="animation-delay: 0.1s">
      <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 lg:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700 hover-lift">
        <div class="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h3 class="font-heading text-base sm:text-lg md:text-xl font-bold text-ink dark:text-white">Academy Spotlight</h3>
            <p class="text-xs sm:text-sm text-gray-400 font-body mt-1">Your current adventure across ASEAN</p>
          </div>
          <RouterLink to="/academy" class="text-[10px] font-heading font-bold text-teal-500 hover:text-teal-600 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg transition-colors">
            Open Academy →
          </RouterLink>
        </div>
        <div class="space-y-3 sm:space-y-4">
          <div v-for="chapter in store.academyChapters.slice(0, 3)" :key="chapter.id"
            class="flex items-center gap-3 sm:gap-4 md:gap-5 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl transition-all"
            :class="chapter.status === 'completed' ? 'bg-teal-50/60 dark:bg-teal-900/20' : chapter.status === 'available' ? 'bg-white dark:bg-slate-700 shadow-md shadow-teal-500/5' : 'bg-gray-50/50 dark:bg-slate-700/30 opacity-60'">
            <div class="w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl md:text-2xl flex-shrink-0" :style="{ backgroundColor: chapter.color + '15' }">
              {{ chapter.icon }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-heading font-bold text-xs sm:text-sm" :class="chapter.status === 'completed' ? 'text-teal-600 dark:text-teal-400' : 'text-ink dark:text-white'">{{ chapter.title }}</p>
              <p class="text-[10px] sm:text-xs text-gray-400 mt-0.5 font-body truncate">
                {{ chapter.status === 'completed' ? '✓ Complete' : chapter.status === 'available' ? (chapter.chatSimulation ? '🎮 Simulation' : '📖 In Progress') : '🔒 Locked' }}
              </p>
            </div>
            <span class="text-[9px] sm:text-[10px] font-heading font-bold px-2 py-1 rounded-lg flex-shrink-0"
              :class="chapter.status === 'completed' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600' : chapter.status === 'available' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'">
              {{ chapter.status === 'completed' ? 'DONE' : chapter.status === 'available' ? 'ACTIVE' : 'LOCKED' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Streak + Today's Progress -->
      <div class="grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
        <div class="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-white hover-lift">
          <p class="text-[9px] sm:text-[10px] md:text-[11px] font-heading font-bold text-orange-200 uppercase tracking-wider mb-2 sm:mb-3">{{ t('home.streak.label') }}</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl sm:text-3xl md:text-4xl animate-pulse-soft">🔥</span>
            <span class="font-heading text-3xl sm:text-4xl md:text-5xl font-bold">{{ store.loginStreak }}</span>
          </div>
          <p class="text-xs sm:text-sm text-orange-200 mt-1 sm:mt-2 font-body">{{ t('home.streak.unit') }}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700 hover-lift">
          <p class="text-[9px] sm:text-[10px] md:text-[11px] font-heading font-bold text-gray-300 dark:text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Chapters Done</p>
          <p class="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-teal-600 dark:text-teal-400">{{ chaptersCompleted }}</p>
          <p class="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2 font-body">of {{ store.academyChapters.length }} chapters</p>
        </div>
      </div>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 md:mb-12 lg:mb-14 animate-slide-up" style="animation-delay: 0.15s">
      <div v-for="stat in stats" :key="stat.label" class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700 hover-lift">
        <p class="text-[8px] sm:text-[10px] md:text-[11px] font-heading font-bold text-gray-300 dark:text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">{{ stat.label }}</p>
        <p class="font-heading text-xl sm:text-2xl md:text-3xl font-bold" :class="stat.color">{{ stat.value }}</p>
        <p class="text-[9px] sm:text-[10px] md:text-xs text-gray-400 mt-1 sm:mt-2 font-body" v-if="stat.sub">{{ stat.sub }}</p>
      </div>
    </div>

    <!-- Quick Actions + Course Progress -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 md:mb-12 lg:mb-14 animate-slide-up" style="animation-delay: 0.2s">
      <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 lg:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700 hover-lift">
        <h3 class="font-heading text-base sm:text-lg md:text-xl font-bold text-ink dark:text-white mb-5 sm:mb-6 md:mb-8">{{ t('home.quick_actions.title') }}</h3>
        <div class="space-y-3 sm:space-y-4">
          <RouterLink v-for="action in quickActions" :key="action.to" :to="action.to"
            class="flex items-center gap-3 sm:gap-4 md:gap-5 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl transition-all group hover:scale-[1.02]" :class="action.bg">
            <div class="w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6" :class="action.iconBg">
              <component :is="action.icon" :size="20" class="text-white" />
            </div>
            <div class="min-w-0">
              <span class="text-sm sm:text-base font-heading font-bold text-ink dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors block">{{ action.label }}</span>
              <p class="text-xs sm:text-sm text-gray-400 mt-0.5 truncate">{{ action.desc }}</p>
            </div>
          </RouterLink>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 lg:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700 hover-lift relative overflow-hidden">
        <!-- Background decoration -->
        <div class="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl"></div>

        <div class="flex items-center justify-between mb-5 sm:mb-6 md:mb-8 relative z-10">
          <div>
            <h3 class="font-heading text-base sm:text-lg md:text-xl font-bold text-ink dark:text-white">{{ t('home.course_progress.title') }}</h3>
            <p class="text-xs text-gray-400 mt-1">Lia's ASEAN Journey</p>
          </div>
          <span class="text-sm sm:text-base md:text-lg font-heading font-bold text-teal-600 dark:text-teal-400">{{ academyProgress }}%</span>
        </div>

        <div class="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 sm:h-2.5 mb-5 sm:mb-6 md:mb-8 overflow-hidden">
          <div class="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500 relative" :style="{ width: academyProgress + '%' }">
             <div class="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
          </div>
        </div>

        <div class="space-y-3 sm:space-y-4 max-h-[350px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
          <div v-for="(chapter, index) in store.academyChapters" :key="chapter.id"
            class="relative rounded-2xl transition-all duration-300 border border-transparent"
            :class="[
              chapter.status === 'completed' ? 'bg-teal-50/60 dark:bg-teal-900/10 border-teal-100 dark:border-teal-900/30' :
              chapter.status === 'available' ? 'bg-white dark:bg-slate-800 shadow-md shadow-orange-500/10 scale-[1.02] border-orange-100 dark:border-orange-500/20 z-10' :
              'bg-gray-50/50 dark:bg-slate-800/50 opacity-70 grayscale-[0.5]'
            ]">
            
            <div class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
              <!-- Icon -->
              <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl flex-shrink-0 transition-colors"
                :style="{ backgroundColor: chapter.color + '15' }">
                <span v-if="chapter.status === 'completed'" class="text-teal-500 font-bold">✓</span>
                <span v-else-if="chapter.status === 'available'" class="animate-pulse">{{ chapter.icon }}</span>
                <span v-else class="text-gray-400">{{ chapter.icon }}</span>
              </div>

              <!-- Text Content -->
              <div class="flex-1 min-w-0">
                <p class="font-heading font-bold text-xs sm:text-sm truncate transition-colors"
                   :class="chapter.status === 'available' ? 'text-ink dark:text-white' : 'text-gray-500 dark:text-gray-400'">
                  {{ chapter.status === 'locked' ? `${chapter.icon} ${chapter.title.split(' — ')[0]}` : chapter.title }}
                </p>
                <p class="text-[10px] sm:text-xs mt-0.5" :class="chapter.status === 'available' ? 'text-orange-600 dark:text-orange-400 font-bold' : 'text-gray-400'">
                   {{ chapter.status === 'completed' ? '✓ Complete' : chapter.status === 'available' ? 'Continue your journey' : 'Complete previous to unlock' }}
                </p>
              </div>

              <!-- Action Badge -->
              <RouterLink v-if="chapter.status === 'available'" to="/academy"
                class="text-[9px] sm:text-[10px] font-heading font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg flex-shrink-0 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 transition-colors">
                GO →
              </RouterLink>
              <span v-else class="text-[9px] sm:text-[10px] font-heading font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg flex-shrink-0"
                :class="chapter.status === 'completed' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'">
                {{ chapter.status === 'completed' ? 'DONE' : 'LOCKED' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Personal Milestones -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 lg:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700 mb-8 sm:mb-10 md:mb-12 lg:mb-14 animate-slide-up hover-lift" style="animation-delay: 0.22s">
      <h3 class="font-heading text-base sm:text-lg md:text-xl font-bold text-ink dark:text-white mb-5 sm:mb-6">{{ t('home.milestones.title') }}</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div v-for="ms in store.personalMilestones" :key="ms.id"
          class="p-4 rounded-2xl bg-gray-50 dark:bg-slate-700 transition-transform hover:scale-[1.02]">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl animate-float" :style="{ animationDelay: ms.id * 0.5 + 's' }">{{ ms.icon }}</span>
            <div class="flex-1 min-w-0">
              <p class="font-heading font-bold text-xs text-ink dark:text-white truncate">{{ ms.title }}</p>
              <p class="text-[10px] text-gray-400 font-body">{{ ms.progress }}/{{ ms.target }}</p>
            </div>
          </div>
          <div class="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all" :style="{ width: (ms.progress / ms.target * 100) + '%' }"></div>
          </div>
          <p class="text-[9px] text-amber-500 font-heading font-bold mt-2">🪙 {{ t('home.milestones.reward', { amount: ms.reward }) }}</p>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 lg:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700 animate-slide-up hover-lift" style="animation-delay: 0.25s">
      <h3 class="font-heading text-base sm:text-lg md:text-xl font-bold text-ink dark:text-white mb-5 sm:mb-6 md:mb-8">{{ t('home.activity.title') }}</h3>
      <div v-if="store.transactions.length === 0" class="text-center py-10 sm:py-12 md:py-16">
        <p class="text-4xl sm:text-5xl mb-3 sm:mb-4 animate-float">📝</p>
        <p class="text-gray-400 font-body text-xs sm:text-sm md:text-base">{{ t('home.activity.empty') }}</p>
      </div>
      <div v-else class="space-y-2 sm:space-y-3">
        <div v-for="tx in store.transactions.slice(0, 5)" :key="tx.id" class="flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          <div class="flex items-center gap-3 sm:gap-4 min-w-0">
            <span class="w-9 sm:w-10 md:w-11 h-9 sm:h-10 md:h-11 rounded-lg sm:rounded-xl flex items-center justify-center text-sm flex-shrink-0"
              :class="tx.type === 'earn' ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' : tx.type === 'donate' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'">
              {{ tx.type === 'earn' ? '↑' : '↓' }}
            </span>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-medium font-body text-ink dark:text-white truncate">{{ tx.reason }}</p>
              <p class="text-[9px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{{ tx.date }}</p>
            </div>
          </div>
          <span class="font-heading font-bold text-xs sm:text-sm md:text-base flex-shrink-0 ml-3" :class="tx.amount > 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500'">
            {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }} RC
          </span>
        </div>
      </div>
    </div>

    <ConfettiAnimation :trigger="confettiTrigger" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import { useI18n } from '../i18n'
import { BookOpen, Briefcase, Wallet, BarChart3 } from 'lucide-vue-next'
import DailyRewardModal from '../components/DailyRewardModal.vue'
import ConfettiAnimation from '../components/ConfettiAnimation.vue'
import XPBarAnimated from '../components/XPBarAnimated.vue'
import TourGuide from '../components/TourGuide.vue'

const { t } = useI18n()
const store = useResiliaStore()
const confettiTrigger = ref(0)

watch(() => store.level, (newVal, oldVal) => {
  if (newVal > oldVal) {
    confettiTrigger.value++
  }
})

const chaptersCompleted = computed(() => store.academyChapters.filter(c => c.status === 'completed').length)
const academyProgress = computed(() => {
  const total = store.academyChapters.length
  if (!total) return 0
  return Math.round((chaptersCompleted.value / total) * 100)
})

const stats = computed(() => [
  { label: t('home.stats.modules'), value: `${store.completedModules.length + store.completedBeginnerModules.length}/${store.modules.length + store.beginnerModules.length}`, color: 'text-teal-600 dark:text-teal-400' },
  { label: t('home.stats.rpgs'), value: String(store.completedRPGs.length), color: 'text-orange-500' },
  { label: t('home.stats.xp'), value: `${store.xp}/${store.xpForNextLevel}`, color: 'text-ink dark:text-white', sub: t('home.stats.sub_xp') },
  { label: t('home.stats.missions'), value: `${store.dailyMissionsCompleted}/${store.dailyMissionsTotal}`, color: 'text-purple-600 dark:text-purple-400', sub: t('home.stats.sub_missions') },
])

const quickActions = computed(() => [
  { to: '/academy', label: t('home.quick_actions.academy'), desc: t('home.quick_actions.academy_desc'), icon: BookOpen, bg: 'bg-teal-50/50 dark:bg-teal-900/20 hover:bg-teal-50 dark:hover:bg-teal-900/30', iconBg: 'bg-teal-500' },
  { to: '/toolkit', label: t('home.quick_actions.toolkit'), desc: t('home.quick_actions.toolkit_desc'), icon: Briefcase, bg: 'bg-purple-50/50 dark:bg-purple-900/20 hover:bg-purple-50 dark:hover:bg-purple-900/30', iconBg: 'bg-purple-500' },
  { to: '/wallet', label: t('home.quick_actions.wallet'), desc: t('home.quick_actions.wallet_desc'), icon: Wallet, bg: 'bg-orange-50/50 dark:bg-orange-900/20 hover:bg-orange-50 dark:hover:bg-orange-900/30', iconBg: 'bg-orange-500' },
  { to: '/dashboard', label: t('home.quick_actions.analytics'), desc: t('home.quick_actions.analytics_desc'), icon: BarChart3, bg: 'bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30', iconBg: 'bg-blue-500' },
])

const homeTourSteps = [
  { title: 'Your Rank Card', description: 'Track your progress as a Digital First Responder. Level up by completing modules and earning XP!', target: '#tour-rank-balance' },
  { title: 'Daily Missions', description: 'Complete daily missions to earn bonus XP and ResiCoins. New missions appear every day!', target: '.grid.grid-cols-2.sm\\:grid-cols-4' },
  { title: 'Quick Actions', description: 'Jump to any section of the app from here. Academy, Toolkit, Wallet, and Analytics are just one click away.', target: '.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4' },
]
</script>
