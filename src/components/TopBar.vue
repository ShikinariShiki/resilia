<template>
  <header class="sticky top-0 bg-white/80 dark:bg-[#0d0d14]/90 backdrop-blur-xl z-20 h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-14" :style="{ boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }">
    <div class="flex items-center gap-2 sm:gap-3 min-w-0 mr-3">
      <button @click="$emit('toggle-menu')" class="md:hidden p-1.5 text-gray-400 hover:text-ink dark:hover:text-white transition-colors flex-shrink-0">
        <Menu :size="20" />
      </button>
      <h2 class="font-heading text-sm sm:text-base font-bold text-ink dark:text-white truncate">{{ pageTitle }}</h2>
    </div>
    <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
      <LanguageSwitcher class="mr-0.5" />
      <button @click="store.toggleDarkMode()" class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors text-gray-400 hover:text-ink dark:hover:text-white" title="Toggle dark mode">
        <Sun v-if="store.darkMode" :size="18" />
        <Moon v-else :size="18" />
      </button>
      <div class="hidden sm:flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-xl px-3 py-1.5">
        <span class="text-sm">🪙</span>
        <span class="font-heading font-bold text-orange-600 dark:text-orange-400 text-xs">{{ store.resiCoinBalance }} RC</span>
      </div>
      <div class="flex items-center gap-1.5 rounded-xl px-3 py-1.5" :style="{ backgroundColor: store.currentTier.color + '10' }">
        <span class="text-sm">{{ store.currentTier.icon }}</span>
        <span class="font-heading font-bold text-xs" :style="{ color: store.currentTier.color }">
          Lv.{{ store.level }}<span class="hidden sm:inline ml-1">{{ store.currentTier.name }}</span>
        </span>
      </div>
      <div class="hidden lg:flex items-center bg-gradient-to-r from-teal-400 to-teal-600 rounded-xl px-3 py-1.5">
        <span class="text-white text-xs font-bold font-heading">{{ store.xp }}/{{ store.xpForNextLevel }} XP</span>
      </div>
      <!-- Profile avatar -->
      <RouterLink to="/profile" class="flex-shrink-0 ml-1">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white font-heading font-bold text-sm transition-all hover:scale-105 hover:shadow-md"
          :style="{ backgroundColor: store.avatarColor }">
          {{ initials }}
        </div>
      </RouterLink>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import { Menu, Sun, Moon } from 'lucide-vue-next'
import LanguageSwitcher from './LanguageSwitcher.vue'

defineEmits(['toggle-menu'])
const store = useResiliaStore()
const route = useRoute()

const pageTitles = { home: 'Dashboard', 'journal': 'Daily Journal', academy: 'Resilia Academy', lesson: 'Lesson', rpg: 'Scenario RPG', wallet: 'ResiCoin Wallet', dashboard: 'Open Ledger Analytics', profile: 'My Profile', toolkit: 'Toolkit', 'foundations-lesson': 'Foundation', daily: 'Daily Missions', 'module-test': 'Module Test', 'disaster-rpg': 'Disaster RPG' }
const pageTitle = computed(() => pageTitles[route.name] || 'RESILIA')

const initials = computed(() => {
  const name = store.userName || 'R'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})
</script>
