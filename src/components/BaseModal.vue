<template>
  <Transition name="modal">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-ink/40 dark:bg-ink/80 backdrop-blur-sm" @click="$emit('update:modelValue', false)"></div>
      
      <!-- Content -->
      <div v-motion class="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-full flex flex-col overflow-hidden" :class="contentClass">
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
.modal-enter-active 
.modal-leave-active 
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
@keyframes slideDown {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(20px); }
}
</style>
