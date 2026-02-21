<template>
  <div class="min-h-screen bg-sand-50 flex flex-col items-center justify-center p-6">
    <div class="text-center mb-12">
      <h1 class="font-heading text-3xl font-bold text-ink mb-2">Take a Moment</h1>
      <p class="text-gray-500 font-body max-w-md mx-auto">Your well-being comes first. Follow the breathing exercise below to center yourself.</p>
    </div>

    <div class="relative flex items-center justify-center mb-12" style="width: 280px; height: 280px;">
      <div
        class="absolute rounded-full border-4 border-teal-500 transition-all ease-in-out"
        :class="phase === 'hold' ? '' : ''"
        :style="circleStyle"
      ></div>
      <div class="text-center z-10">
        <p class="font-heading text-2xl font-bold text-teal-700">{{ phaseLabel }}</p>
        <p class="font-heading text-5xl font-bold text-ink mt-1">{{ timer }}</p>
      </div>
    </div>

    <div class="flex items-center gap-6 mb-8">
      <div v-for="n in totalCycles" :key="n" class="w-4 h-4 border-2 border-ink" :class="n <= completedCycles ? 'bg-teal-500' : 'bg-sand-200'"></div>
    </div>

    <p class="text-sm text-gray-400 font-body mb-8">Cycle {{ Math.min(completedCycles + 1, totalCycles) }} of {{ totalCycles }}</p>

    <Transition name="fade">
      <button
        v-if="done"
        @click="proceed"
        class="px-8 py-3 bg-teal-500 text-white border-2 border-ink font-heading font-bold text-sm shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all"
      >
        Continue to Academy →
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'

const store = useResiliaStore()
const router = useRouter()

const totalCycles = 3
const completedCycles = ref(0)
const done = ref(false)
const phase = ref('in')
const timer = ref(4)

let intervalId = null

const phases = [
  { name: 'in', label: 'Breathe In', duration: 4 },
  { name: 'hold', label: 'Hold', duration: 4 },
  { name: 'out', label: 'Breathe Out', duration: 6 },
]

let phaseIndex = 0

const phaseLabel = computed(() => {
  if (done.value) return 'Complete'
  return phases[phaseIndex]?.label || ''
})

const circleStyle = computed(() => {
  if (phase.value === 'in') {
    return { width: '260px', height: '260px', opacity: 1, background: 'rgba(13, 148, 136, 0.08)' }
  } else if (phase.value === 'hold') {
    return { width: '260px', height: '260px', opacity: 0.8, background: 'rgba(13, 148, 136, 0.12)' }
  } else {
    return { width: '120px', height: '120px', opacity: 0.5, background: 'rgba(13, 148, 136, 0.04)' }
  }
})

function tick() {
  timer.value--
  if (timer.value <= 0) {
    phaseIndex++
    if (phaseIndex >= phases.length) {
      phaseIndex = 0
      completedCycles.value++
      if (completedCycles.value >= totalCycles) {
        done.value = true
        clearInterval(intervalId)
        return
      }
    }
    phase.value = phases[phaseIndex].name
    timer.value = phases[phaseIndex].duration
  }
}

onMounted(() => {
  phase.value = phases[0].name
  timer.value = phases[0].duration
  intervalId = setInterval(tick, 1000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

function proceed() {
  store.completeSoothing()
  router.push('/home')
}
</script>

<style scoped>
.fade-enter-active { transition: opacity 0.5s ease; }
.fade-enter-from { opacity: 0; }
</style>
