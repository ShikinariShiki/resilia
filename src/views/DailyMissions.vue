<template>
  <div>
    <div class="mb-8 sm:mb-10 animate-slide-up">
      <h1 class="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-ink dark:text-white leading-tight">
        Daily Missions 🎯
      </h1>
      <p class="text-gray-400 font-body mt-2 text-sm sm:text-base">Complete missions to earn XP, ResiCoins, and streak rewards.</p>
    </div>

    <!-- Streak Banner -->
    <div class="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl sm:rounded-3xl p-5 sm:p-7 mb-8 text-white animate-slide-up" style="animation-delay: 0.03s">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-[10px] font-heading font-bold uppercase tracking-wider text-white/70 mb-1">LOGIN STREAK</p>
          <p class="font-heading text-3xl sm:text-4xl font-bold">🔥 {{ store.loginStreak }} day{{ store.loginStreak !== 1 ? 's' : '' }}</p>
        </div>
        <div class="text-right">
          <p class="text-xs font-body text-white/80">Next perk at</p>
          <p class="font-heading font-bold text-lg">{{ nextStreakMilestone }} days</p>
        </div>
      </div>
      <!-- Streak milestones -->
      <div class="flex items-center gap-1 mt-4">
        <div v-for="ms in streakMilestones" :key="ms.days"
          class="flex-1 h-2 rounded-full transition-all"
          :class="store.loginStreak >= ms.days ? 'bg-white' : 'bg-white/20'">
        </div>
      </div>
      <div class="flex items-center justify-between mt-1.5">
        <span v-for="ms in streakMilestones" :key="ms.days" class="text-[9px] font-heading font-bold"
          :class="store.loginStreak >= ms.days ? 'text-white' : 'text-white/40'">
          {{ ms.days }}d {{ ms.icon }}
        </span>
      </div>
    </div>

    <!-- Active Streak Perks -->
    <div v-if="activePerks.length" class="mb-8 animate-slide-up" style="animation-delay: 0.05s">
      <p class="text-[10px] font-heading font-bold text-gray-300 dark:text-gray-500 uppercase tracking-wider mb-3">ACTIVE PERKS</p>
      <div class="flex flex-wrap gap-2">
        <span v-for="perk in activePerks" :key="perk.days"
          class="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-heading font-bold rounded-xl">
          {{ perk.icon }} {{ perk.perk }}
        </span>
      </div>
    </div>

    <!-- Today's Missions -->
    <div class="space-y-3 animate-slide-up" style="animation-delay: 0.07s">
      <p class="text-[10px] font-heading font-bold text-gray-300 dark:text-gray-500 uppercase tracking-wider mb-1">TODAY'S MISSIONS</p>
      <div v-for="mission in store.dailyMissions" :key="mission.type"
        class="bg-white dark:bg-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 flex items-center gap-4 transition-all"
        :class="mission.completed ? 'opacity-60' : ''">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          :class="mission.completed ? 'bg-teal-50 dark:bg-teal-900/20' : 'bg-gray-50 dark:bg-slate-700/30'">
          {{ mission.completed ? '✅' : mission.type === 'checkin' ? '📋' : mission.type === 'lesson' ? '📖' : mission.type === 'rpg' ? '⚔️' : '💰' }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-heading font-bold text-sm text-ink dark:text-white">{{ mission.title }}</p>
          <p class="text-[10px] text-gray-400 font-body mt-0.5">+{{ mission.xpReward }} XP · +{{ mission.coinReward }} ResiCoins</p>
        </div>
        <span v-if="mission.completed" class="text-xs font-heading font-bold text-teal-500">Done ✓</span>
        <span v-else class="text-xs font-heading font-bold text-gray-300">Pending</span>
      </div>
    </div>

    <!-- Mission Progress -->
    <div class="mt-8 bg-white dark:bg-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 animate-slide-up" style="animation-delay: 0.1s">
      <div class="flex items-center justify-between mb-3">
        <p class="text-[10px] font-heading font-bold text-gray-300 dark:text-gray-500 uppercase tracking-wider">Daily Progress</p>
        <span class="font-heading font-bold text-sm text-teal-600 dark:text-teal-400">{{ store.dailyMissionsCompleted }}/{{ store.dailyMissionsTotal }}</span>
      </div>
      <div class="w-full h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500"
          :style="{ width: (store.dailyMissionsCompleted / store.dailyMissionsTotal * 100) + '%' }"></div>
      </div>
      <p v-if="store.dailyMissionsCompleted === store.dailyMissionsTotal" class="text-xs text-teal-500 font-heading font-bold mt-3">🏆 All missions complete! Come back tomorrow.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useResiliaStore } from '../stores/resiliaStore'

const store = useResiliaStore()

const streakMilestones = [
  { days: 3, icon: '🎁', perk: '+5% XP Boost' },
  { days: 7, icon: '⚡', perk: '+10% XP Boost' },
  { days: 14, icon: '🛡️', perk: 'Streak Shield (1 miss)' },
  { days: 30, icon: '👑', perk: 'Golden Frame + 2x Coins' },
]

const activePerks = computed(() => streakMilestones.filter(m => store.loginStreak >= m.days))
const nextStreakMilestone = computed(() => {
  const next = streakMilestones.find(m => store.loginStreak < m.days)
  return next ? next.days : '∞'
})
</script>
