<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isActive" class="fixed inset-0 z-[9999]">
        <!-- Dim overlay with cutout -->
        <div class="absolute inset-0 bg-black/60 transition-opacity duration-300" @click="skip"></div>

        <!-- Highlight element (positioned via JS) -->
        <div v-if="highlightStyle" class="absolute border-2 border-teal-400 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] bg-transparent pointer-events-none transition-all duration-500 ease-out"
          :style="highlightStyle"></div>

        <!-- Tooltip card -->
        <div class="absolute bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-[90vw] transition-all duration-500 ease-out animate-slide-up"
          :style="tooltipStyle">
          <!-- Close button -->
          <button @click="skip" class="absolute top-3 right-3 w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400 hover:text-ink dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors" aria-label="Close tour">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
          </button>
          <!-- Mascot placeholder -->
          <div class="flex items-start gap-3 mb-4">
            <div class="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <!-- Mascot goes here -->
              <span class="text-lg">🛡️</span>
            </div>
            <div class="flex-1">
              <p class="font-heading font-bold text-ink text-sm">{{ currentStep?.title }}</p>
              <p class="text-xs text-gray-400 font-body mt-1 leading-relaxed">{{ currentStep?.description }}</p>
            </div>
          </div>

          <!-- Step counter & buttons -->
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span class="text-[10px] font-heading font-bold text-gray-300 uppercase tracking-wider">
              {{ currentIndex + 1 }} / {{ steps.length }}
            </span>
            <div class="flex gap-2">
              <button @click="skip" class="px-4 py-2 text-xs text-gray-400 font-heading font-bold hover:text-ink transition-colors">
                Skip Tour
              </button>
              <button @click="next"
                class="px-5 py-2 bg-ink text-white rounded-xl text-xs font-heading font-bold hover:bg-gray-800 transition-colors">
                {{ currentIndex < steps.length - 1 ? 'Next' : 'Done' }}
              </button>
            </div>
          </div>

          <!-- Progress dots -->
          <div class="flex justify-center gap-1.5 mt-3">
            <div v-for="(_, i) in steps" :key="i"
              class="w-1.5 h-1.5 rounded-full transition-all duration-300"
              :class="i === currentIndex ? 'bg-teal-500 w-4' : i < currentIndex ? 'bg-teal-300' : 'bg-gray-200'"></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  steps: {
    type: Array,
    required: true,
    // Each step: { title: string, description: string, target: string (CSS selector) }
  },
  tourKey: {
    type: String,
    required: true,
  },
  autoStart: {
    type: Boolean,
    default: true,
  }
})

const emit = defineEmits(['complete', 'skip'])

const isActive = ref(false)
const currentIndex = ref(0)
const highlightStyle = ref(null)
const tooltipStyle = ref(null)

const currentStep = computed(() => props.steps[currentIndex.value])

const STORAGE_KEY = 'resilia_tours_completed'

function getCompletedTours() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function markCompleted() {
  const tours = getCompletedTours()
  if (!tours.includes(props.tourKey)) {
    tours.push(props.tourKey)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tours))
  }
}

function positionElements() {
  if (!currentStep.value) return

  const target = document.querySelector(currentStep.value.target)
  if (target) {
    const rect = target.getBoundingClientRect()
    const padding = 8

    highlightStyle.value = {
      top: `${rect.top - padding}px`,
      left: `${rect.left - padding}px`,
      width: `${rect.width + padding * 2}px`,
      height: `${rect.height + padding * 2}px`,
    }

    // Position tooltip below or above the target
    const spaceBelow = window.innerHeight - rect.bottom
    const tooltipHeight = 200
    const tooltipWidth = 340

    if (spaceBelow > tooltipHeight + 20) {
      tooltipStyle.value = {
        top: `${rect.bottom + 16}px`,
        left: `${Math.max(16, Math.min(rect.left, window.innerWidth - tooltipWidth - 16))}px`,
      }
    } else {
      tooltipStyle.value = {
        top: `${Math.max(16, rect.top - tooltipHeight - 16)}px`,
        left: `${Math.max(16, Math.min(rect.left, window.innerWidth - tooltipWidth - 16))}px`,
      }
    }
  } else {
    // No target found, center the tooltip
    highlightStyle.value = null
    tooltipStyle.value = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }
}

function next() {
  if (currentIndex.value < props.steps.length - 1) {
    currentIndex.value++
    nextTick(positionElements)
  } else {
    complete()
  }
}

function skip() {
  markCompleted()
  isActive.value = false
  emit('skip')
}

function complete() {
  markCompleted()
  isActive.value = false
  emit('complete')
}

function start() {
  const completed = getCompletedTours()
  if (completed.includes(props.tourKey)) return

  currentIndex.value = 0
  isActive.value = true
  nextTick(positionElements)
}

let resizeHandler
onMounted(() => {
  resizeHandler = () => { if (isActive.value) positionElements() }
  window.addEventListener('resize', resizeHandler)

  if (props.autoStart) {
    setTimeout(start, 1000) // Delay to let page render
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeHandler)
})

// Re-position when step changes
watch(currentIndex, () => nextTick(positionElements))

defineExpose({ start })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
