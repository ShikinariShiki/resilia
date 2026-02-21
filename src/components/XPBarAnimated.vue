<template>
  <div class="relative w-full">
    <div class="flex justify-between items-end mb-1">
      <span class="text-xs font-heading font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Level {{ level }}</span>
      <span class="text-xs font-heading font-bold text-teal-600 dark:text-teal-400">
        <span class="tabular-nums">{{ Math.round(displayedValue) }}</span> / {{ max }} XP
      </span>
    </div>
    <div class="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden relative shadow-inner">
      <!-- Background shimmer -->
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2 h-full skew-x-12 animate-shimmer" style="display: none;"></div>
      
      <!-- Fill bar -->
      <div class="h-full bg-gradient-to-r from-teal-400 to-teal-600 dark:from-teal-500 dark:to-teal-400 rounded-full transition-all duration-1000 ease-out relative"
        :style="{ width: percentage + '%' }">
        <!-- Glow at tip -->
        <div class="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps({
  current: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  level: { type: Number, default: 1 }
})

const displayedValue = ref(props.current)

const percentage = computed(() => {
  if (props.max === 0) return 0
  return Math.min((props.current / props.max) * 100, 100)
})

watch(() => props.current, (newVal) => {
  animateValue(displayedValue.value, newVal)
})

function animateValue(start, end) {
  const duration = 1000
  const startTime = performance.now()

  function update(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3)
    
    displayedValue.value = start + (end - start) * ease

    if (progress < 1) {
      requestAnimationFrame(update)
    } else {
      displayedValue.value = end
    }
  }

  requestAnimationFrame(update)
}
</script>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-150%) skewX(-12deg); }
  100% { transform: translateX(250%) skewX(-12deg); }
}
.animate-shimmer {
  animation: shimmer 2s infinite linear;
}
</style>
