<template>
  <div class="relative group" ref="container">
    <button @click="isOpen = !isOpen" class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
      <span class="text-xl">{{ currentLang.flag }}</span>
      <span class="font-heading font-bold text-sm text-ink dark:text-white uppercase">{{ locale }}</span>
    </button>
    
    <div v-if="isOpen" class="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden min-w-[160px] max-h-[320px] overflow-y-auto z-50 animate-slide-up">
      <button v-for="lang in languages" :key="lang.code" @click="setLocale(lang.code)"
        class="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
        :class="locale === lang.code ? 'bg-teal-50 dark:bg-teal-900/20' : ''">
        <span class="text-lg">{{ lang.flag }}</span>
        <span class="text-sm font-heading font-bold text-ink dark:text-white">{{ lang.label }}</span>
        <span v-if="locale === lang.code" class="ml-auto text-teal-500 text-xs">✓</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../i18n'
import { useResiliaStore } from '../stores/resiliaStore'

const { locale } = useI18n()
const store = useResiliaStore()
const isOpen = ref(false)
const container = ref(null)

const languages = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'id', flag: '🇮🇩', label: 'Bahasa' },
  { code: 'th', flag: '🇹🇭', label: 'ไทย' },
  { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
  { code: 'ms', flag: '🇲🇾', label: 'Melayu' },
  { code: 'tl', flag: '🇵🇭', label: 'Filipino' },
  { code: 'my', flag: '🇲🇲', label: 'မြန်မာ' },
  { code: 'km', flag: '🇰🇭', label: 'ខ្មែរ' },
  { code: 'lo', flag: '🇱🇦', label: 'ລາວ' },
]

const currentLang = computed(() => languages.find(l => l.code === locale.value) || languages[0])

function setLocale(lang) {
  locale.value = lang
  store.locale = lang
  isOpen.value = false
}

function handleClickOutside(e) {
  if (container.value && !container.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>
