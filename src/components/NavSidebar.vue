<template>
  <aside
    class="fixed left-0 top-0 h-screen bg-white dark:bg-[#1C1916] flex flex-col z-40 transition-all duration-300"
    :class="[
      mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      collapsed ? 'md:w-[72px]' : 'md:w-[260px]',
      'w-[280px]'
    ]"
    :style="{ boxShadow: '1px 0 0 rgba(0,0,0,0.06)' }"
  >
    <!-- Logo -->
    <div class="h-16 flex items-center justify-between" :class="collapsed ? 'md:px-4 md:justify-center px-6' : 'px-6'">
      <RouterLink to="/home" class="flex items-center gap-3">
        <img src="../assets/icon.png" class="w-10 h-10 object-cover rounded-2xl flex-shrink-0 bg-teal-50" alt="RESILIA" />
        <div v-if="!collapsed || mobileOpen">
          <h1 class="font-heading text-lg font-bold text-ink dark:text-white tracking-tight leading-none">RESILIA</h1>
          <p class="text-[10px] text-gray-400 font-body leading-none mt-0.5">Digital Reserve Corps</p>
        </div>
      </RouterLink>
      <button @click="$emit('close-mobile')" class="md:hidden w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700">
        <X :size="18" />
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 py-4 px-3 overflow-y-auto space-y-1">
      <RouterLink
        v-for="item in navItems" :key="item.to" :to="item.to"
        @click="$emit('close-mobile')"
        class="flex items-center gap-3 h-11 text-[13px] font-medium transition-all group relative rounded-xl"
        :class="[
          isActive(item.to)
            ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-semibold'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-gray-300',
          collapsed && !mobileOpen ? 'justify-center px-0' : 'px-4'
        ]"
      >
        <component :is="item.icon" :size="20" :stroke-width="1.75" class="flex-shrink-0" :class="isActive(item.to) ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'" />
        <span v-if="!collapsed || mobileOpen">{{ item.label }}</span>
        <div v-if="collapsed && !mobileOpen" class="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 shadow-lg">
          {{ item.label }}
        </div>
      </RouterLink>
    </nav>

    <!-- Collapse btn -->
    <div class="px-3 py-3 border-t border-gray-100 dark:border-slate-700 hidden md:block">
      <button @click="$emit('toggle')"
        class="w-full flex items-center justify-center gap-2 h-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-medium">
        <component :is="collapsed ? ChevronRight : ChevronLeft" :size="16" />
        <span v-if="!collapsed">Collapse</span>
      </button>
    </div>

    <!-- User -->
    <div class="px-3 py-4 border-t border-gray-100 dark:border-slate-700">
      <RouterLink to="/profile" @click="$emit('close-mobile')" class="flex items-center gap-3 group" :class="collapsed && !mobileOpen ? 'justify-center' : ''">
        <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-heading font-bold text-sm flex-shrink-0"
          :style="{ backgroundColor: store.avatarColor }">
          {{ initials }}
        </div>
        <div v-if="!collapsed || mobileOpen" class="min-w-0">
          <p class="text-sm font-semibold text-ink dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate leading-tight">{{ store.userName || 'Responder' }}</p>
          <p class="text-[11px] text-gray-400 leading-tight">{{ store.currentTier.icon }} {{ store.currentTier.name }}</p>
        </div>
      </RouterLink>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import { useI18n } from '../i18n'
import { Home, BookOpen, Briefcase, Wallet, BarChart3, User, ChevronLeft, ChevronRight, X, Target, Settings2 } from 'lucide-vue-next'

defineProps({
  collapsed: { type: Boolean, default: false },
  mobileOpen: { type: Boolean, default: false }
})
defineEmits(['toggle', 'close-mobile'])

const { t } = useI18n()
const store = useResiliaStore()
const route = useRoute()

const navItems = computed(() => {
  const items = [
    { to: '/home', label: t('nav.home'), icon: Home },
    { to: '/daily', label: 'Daily Missions', icon: Target },
    { to: '/academy', label: t('nav.academy'), icon: BookOpen },
    { to: '/toolkit', label: t('nav.toolkit'), icon: Briefcase },
    { to: '/wallet', label: t('nav.wallet'), icon: Wallet },
    { to: '/dashboard', label: t('nav.dashboard'), icon: BarChart3 },
  ]
  if (store.isAdmin) {
    items.push({ to: '/admin', label: 'Admin Hub', icon: Settings2 })
  }
  return items
})

const initials = computed(() => {
  const name = store.userName || 'R'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

function isActive(path) {
  if (path === '/home') return route.path === '/home'
  return route.path === path || route.path.startsWith(path + '/')
}
</script>
