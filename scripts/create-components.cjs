const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../src/components');
if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
}

const components = {
    'BaseButton.vue': `<template>
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
`,

    'BaseCard.vue': `<template>
  <div 
    class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700 transition-all"
    :class="[
      paddingClasses,
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
  hoverable: { type: Boolean, default: false }
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
`,

    'BaseBadge.vue': `<template>
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
`,

    'BaseModal.vue': `<template>
  <Transition name="modal">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-ink/40 dark:bg-ink/80 backdrop-blur-sm" @click="$emit('update:modelValue', false)"></div>
      
      <!-- Content -->
      <div class="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-full flex flex-col overflow-hidden animate-slide-up" :class="contentClass">
        <div class="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 dark:border-slate-700">
          <h2 class="font-heading font-bold text-lg sm:text-xl text-ink dark:text-white">{{ title }}</h2>
          <button @click="$emit('update:modelValue', false)" class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500">
            <span class="sr-only">Close</span>
            ✕
          </button>
        </div>
        
        <div class="p-5 sm:p-6 overflow-y-auto custom-scrollbar">
          <slot />
        </div>
        
        <div v-if="$slots.footer" class="p-5 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: '' },
  contentClass: { type: String, default: '' }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-active .animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.modal-leave-active .animate-slide-up {
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
@keyframes slideDown {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(20px); }
}
</style>
`,

    'BaseInput.vue': `<template>
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
`,

    'BaseProgress.vue': `<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-1" v-if="label || showValue">
      <span v-if="label" class="text-[10px] font-heading font-bold text-gray-400 uppercase tracking-wider">{{ label }}</span>
      <span v-if="showValue" class="text-[10px] font-heading font-bold" :class="textColorClass">{{ Math.round((value / max) * 100) }}%</span>
    </div>
    <div class="w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden" :class="heightClass">
      <div 
        class="h-full rounded-full transition-all duration-500 ease-out"
        :class="colorClass"
        :style="{ width: \`\${Math.min(100, Math.max(0, (value / max) * 100)) }%\` }"
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
`,

    'SectionHeading.vue': `<template>
  <div class="mb-5 sm:mb-8 animate-slide-up">
    <div class="flex items-center gap-2 mb-1">
      <span v-if="icon" class="text-teal-500"><component :is="icon" :size="20" weight="fill" /></span>
      <h2 class="font-heading text-lg sm:text-xl font-bold text-ink dark:text-white">{{ title }}</h2>
    </div>
    <p v-if="subtitle" class="text-xs sm:text-sm text-gray-400 font-body ml-7">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: [Object, Function], default: null } // Expects a Phosphor Icon component
})
</script>
`
}

for (const [name, code] of Object.entries(components)) {
    fs.writeFileSync(path.join(componentsDir, name), code, 'utf8');
    console.log("Created", name);
}
