<template>
  <button 
    :class="computedClasses" 
    :disabled="disabled || loading" 
    v-bind="$attrs"
  >
    <span v-if="loading" class="mr-2 animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></span>
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false }
})

const computedClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-heading font-bold rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-md hover:shadow-lg',
    secondary: 'bg-ink text-white hover:bg-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 focus:ring-gray-500',
    outline: 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-900/30 focus:ring-teal-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800 focus:ring-gray-500'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-4 text-base md:text-lg'
  }

  return [
    base,
    variants[props.variant] || variants.primary,
    sizes[props.size] || sizes.md,
    props.block ? 'w-full' : ''
  ].join(' ')
})
</script>
