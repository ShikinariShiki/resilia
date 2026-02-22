<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isActive" class="fixed inset-0 z-[9999]">
        <!-- Dim overlay with cutout -->
        <div class="absolute inset-0 bg-black/60 transition-opacity duration-300" @click="skip"></div>

        <!-- Highlight element (positioned via JS) -->
        <div v-if="highlightStyle" class="absolute border-2 border-teal-400 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] bg-transparent pointer-events-none transition-all duration-500 ease-out"
          :style="highlightStyle"></div>

        <!-- Tooltip card — always within viewport -->
        <div ref="tooltipEl"
          class="absolute bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-5 transition-all duration-500 ease-out animate-slide-up"
          :style="tooltipStyle"
          style="max-width: min(360px, calc(100vw - 32px)); width: max-content;">
          <!-- Close button -->
          <button @click="skip" class="absolute top-3 right-3 w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400 hover:text-ink dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors" aria-label="Close tour">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
          </button>
          <!-- Icon + Content -->
          <div class="flex items-start gap-3 mb-3 pr-6">
            <div class="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <component :is="currentStep?.icon || PhShieldCheck" :size="18" class="text-white" weight="fill" />
            </div>
            <div class="flex-1">
              <p class="font-heading font-bold text-ink dark:text-white text-sm leading-tight">{{ currentStep?.title }}</p>
              <p class="text-xs text-gray-400 font-body mt-1 leading-relaxed">{{ currentStep?.description }}</p>
            </div>
          </div>

          <!-- Step counter & buttons -->
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
            <span class="text-[10px] font-heading font-bold text-gray-300 dark:text-gray-500 uppercase tracking-wider">
              {{ currentIndex + 1 }} / {{ totalStepsAllPages }}
            </span>
            <div class="flex gap-2">
              <button @click="skip" class="px-3 py-1.5 text-xs text-gray-400 font-heading font-bold hover:text-ink dark:hover:text-white transition-colors">
                Skip Tour
              </button>
              <button @click="next"
                class="px-4 py-1.5 bg-ink dark:bg-teal-600 text-white rounded-xl text-xs font-heading font-bold hover:bg-gray-800 dark:hover:bg-teal-500 transition-colors">
                {{ isLastStepOverall ? 'Done' : 'Next' }}
              </button>
            </div>
          </div>

          <!-- Progress dots -->
          <div class="flex justify-center gap-1.5 mt-2.5">
            <div v-for="(_, i) in steps" :key="i"
              class="w-1.5 h-1.5 rounded-full transition-all duration-300"
              :class="i === currentIndex ? 'bg-teal-500 w-4' : i < currentIndex ? 'bg-teal-300' : 'bg-gray-200 dark:bg-gray-600'"></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { PhShieldCheck } from '@phosphor-icons/vue'

const props = defineProps({
  steps: {
    type: Array,
    required: true,
    // Each step: { title, description, target (CSS selector), icon (component) }
  },
  tourKey: {
    type: String,
    required: true,
  },
  autoStart: {
    type: Boolean,
    default: true,
  },
  /** Delay before auto-starting (ms). Set higher to wait for daily reward etc. */
  delay: {
    type: Number,
    default: 1500,
  },
  /** If set, navigate to this route after tour completes, to chain tours */
  nextTourRoute: {
    type: String,
    default: '',
  },
  /** Global step offset for multi-page tours (e.g. page 2 starts at step 4) */
  globalStepOffset: {
    type: Number,
    default: 0,
  },
  /** Total steps across all tour pages */
  totalSteps: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['complete', 'skip'])

const router = useRouter()
const isActive = ref(false)
const currentIndex = ref(0)
const highlightStyle = ref(null)
const tooltipStyle = ref(null)
const tooltipEl = ref(null)

const currentStep = computed(() => props.steps[currentIndex.value])
const totalStepsAllPages = computed(() => props.totalSteps || props.steps.length)
const isLastStepOverall = computed(() => {
  const isLastLocal = currentIndex.value >= props.steps.length - 1
  return isLastLocal && !props.nextTourRoute
})

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

function markAllToursCompleted() {
  // When skipping, mark ALL page tours as done
  const tours = getCompletedTours()
  const allKeys = ['home', 'dashboard', 'academy']
  allKeys.forEach(k => {
    if (!tours.includes(k)) tours.push(k)
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tours))
}

function positionElements() {
  if (!currentStep.value) return

  const target = document.querySelector(currentStep.value.target)
  if (target) {
    const rect = target.getBoundingClientRect()
    const padding = 8

    // Scroll target into view if needed
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Re-calc after scroll
      setTimeout(() => positionElements(), 400)
      return
    }

    highlightStyle.value = {
      top: `${rect.top - padding}px`,
      left: `${rect.left - padding}px`,
      width: `${rect.width + padding * 2}px`,
      height: `${rect.height + padding * 2}px`,
    }

    // Calculate tooltip position — clamp to viewport
    const tooltipWidth = 340
    const tooltipHeight = 200
    const margin = 16
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    let top, left

    // Prefer below, then above, then center
    if (spaceBelow > tooltipHeight + margin) {
      top = rect.bottom + margin
    } else if (spaceAbove > tooltipHeight + margin) {
      top = rect.top - tooltipHeight - margin
    } else {
      // Center vertically
      top = Math.max(margin, (window.innerHeight - tooltipHeight) / 2)
    }

    // Horizontal: center on target, clamp to edges
    left = rect.left + rect.width / 2 - tooltipWidth / 2
    left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin))

    // Final clamp: ensure bottom doesn't exceed viewport
    top = Math.min(top, window.innerHeight - tooltipHeight - margin)
    top = Math.max(margin, top)

    tooltipStyle.value = {
      top: `${top}px`,
      left: `${left}px`,
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
  } else if (props.nextTourRoute) {
    // Chain to next page's tour
    markCompleted()
    isActive.value = false
    router.push(props.nextTourRoute)
  } else {
    complete()
  }
}

function skip() {
  markAllToursCompleted()
  isActive.value = false
  emit('skip')
}

function complete() {
  markCompleted()
  isActive.value = false
  emit('complete')
}

function isDailyRewardOpen() {
  // Check if the DailyRewardModal's overlay is visible in the DOM
  const modals = document.querySelectorAll('.fixed.inset-0[class*="z-[100]"]')
  return modals.length > 0
}

function waitForRewardThenStart() {
  if (isDailyRewardOpen()) {
    // Poll every 500ms until reward modal is closed
    const interval = setInterval(() => {
      if (!isDailyRewardOpen()) {
        clearInterval(interval)
        setTimeout(start, 600) // Small delay after modal closes
      }
    }, 500)
    // Safety: stop polling after 30 seconds
    setTimeout(() => clearInterval(interval), 30000)
  } else {
    start()
  }
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
    setTimeout(waitForRewardThenStart, props.delay)
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
