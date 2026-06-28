<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block text-xs font-heading font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
      {{ label }}
    </label>
    <div class="relative">
      <div v-if="$slots.prefix" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        <slot name="prefix" />
      </div>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-ink dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none font-body placeholder:text-gray-400"
        :class="[
          sizeClasses,
          $slots.prefix ? 'pl-10' : '',
          $slots.suffix ? 'pr-10' : '',
          error ? 'border-red-400 focus:ring-red-500' : ''
        ]"
        v-bind="$attrs"
      >
      <div v-if="$slots.suffix" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
        <slot name="suffix" />
      </div>
    </div>
    <p v-if="error" class="text-xs text-red-500 font-body mt-1.5 ml-1">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-gray-400 font-body mt-1.5 ml-1">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  type: { type: String, default: 'text' },
  id: { type: String, default: () => 'input-' + Math.random().toString(36).substring(2, 9) },
  size: { type: String, default: 'md' }
})

defineEmits(['update:modelValue'])

const sizeClasses = computed(() => {
  const s = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  }
  return s[props.size] || s.md
})
</script>
