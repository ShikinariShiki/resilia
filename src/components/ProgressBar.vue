<template>
  <div class="h-2 bg-sand-200 border-2 border-ink w-full" :style="{ maxWidth: maxWidth }">
    <div
      class="h-full transition-all duration-500 ease-out"
      :class="colorClass"
      :style="{ width: percentage + '%' }"
    ></div>
  </div>
</template>

<script setup>
const props = defineProps({
  percentage: { type: Number, default: 0 },
  colorClass: { type: String, default: 'bg-teal-500' },
  maxWidth: { type: String, default: '100%' },
})
</script>
