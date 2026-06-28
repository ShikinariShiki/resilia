<template>
  <span 
    class="inline-flex items-center font-heading font-bold rounded-lg"
    :class="[variantClasses, sizeClasses]"
  >
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'neutral' },
  size: { type: String, default: 'md' }
})

const variantClasses = computed(() => {
  const v = {
    info: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    success: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    warning: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    error: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    neutral: 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400'
  }
  return v[props.variant] || v.neutral
})

const sizeClasses = computed(() => {
  const s = {
    sm: 'px-2 py-0.5 text-[9px] sm:text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }
  return s[props.size] || s.md
})
</script>
