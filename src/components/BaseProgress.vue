<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-1" v-if="label || showValue">
      <span v-if="label" class="text-[10px] font-heading font-bold text-gray-400 uppercase tracking-wider">{{ label }}</span>
      <span v-if="showValue" class="text-[10px] font-heading font-bold" :class="textColorClass">{{ Math.round((value / max) * 100) }}%</span>
    </div>
    <div class="w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden" :class="heightClass">
      <div 
        class="h-full rounded-full transition-all duration-500 ease-out"
        :class="colorClass"
        :style="{ width: `${Math.min(100, Math.max(0, (value / max) * 100)) }%` }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  max: { type: Number, default: 100 },
  label: { type: String, default: '' },
  showValue: { type: Boolean, default: false },
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' }
})

const colorClass = computed(() => {
  const c = {
    primary: 'bg-gradient-to-r from-teal-400 to-teal-600',
    secondary: 'bg-gradient-to-r from-orange-400 to-orange-600',
    danger: 'bg-gradient-to-r from-red-400 to-red-600',
    info: 'bg-gradient-to-r from-blue-400 to-blue-600',
  }
  return c[props.variant] || c.primary
})

const textColorClass = computed(() => {
  const c = {
    primary: 'text-teal-500',
    secondary: 'text-orange-500',
    danger: 'text-red-500',
    info: 'text-blue-500',
  }
  return c[props.variant] || c.primary
})

const heightClass = computed(() => {
  const h = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  }
  return h[props.size] || h.md
})
</script>
