<template>
  <div v-motion class="mb-5 sm:mb-8">
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
