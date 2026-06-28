<template>
  <div 
    class="rounded-2xl sm:rounded-3xl transition-all"
    :class="[
      paddingClasses,
      glass 
        ? 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/40 dark:border-slate-700/50 shadow-xl shadow-teal-900/5' 
        : 'bg-white dark:bg-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700',
      hoverable ? 'hover-lift hover:shadow-lg dark:hover:border-slate-600 cursor-pointer' : ''
    ]"
  >
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  padding: { type: String, default: 'md' },
  hoverable: { type: Boolean, default: false },
  glass: { type: Boolean, default: false }
})

const paddingClasses = computed(() => {
  const p = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-7',
    lg: 'p-6 sm:p-8 md:p-10'
  }
  return p[props.padding] || p.md
})
</script>
