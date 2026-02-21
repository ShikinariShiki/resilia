<template>
  <div class="max-w-3xl mx-auto">
    <div v-if="!bridgeQuest" class="text-center py-20">
      <p class="text-4xl mb-4">❌</p>
      <p class="text-gray-400 font-body">Bridging quest not found.</p>
      <RouterLink to="/academy" class="text-teal-500 font-heading font-bold text-sm mt-4 inline-block hover:underline">← Back to Academy</RouterLink>
    </div>

    <div v-else>
      <!-- Start Screen -->
      <div v-if="!started" class="animate-slide-up">
        <RouterLink to="/academy" class="text-xs text-gray-400 hover:text-teal-500 transition-colors font-heading mb-6 inline-block">← Academy</RouterLink>
        <div class="bg-white dark:bg-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 text-center">
          <div class="text-6xl mb-6">📖</div>
          <h1 class="font-heading text-2xl sm:text-3xl font-bold text-ink dark:text-white mb-2">{{ bridgeQuest.title }}</h1>
          <p class="text-sm text-amber-500 font-heading font-bold mb-6">Story Bridge</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-body mb-8 max-w-lg mx-auto leading-relaxed">
            {{ replaceNames(bridgeQuest.description) }}
          </p>
          <p class="text-xs text-gray-400 font-body mb-6">No HP cost • Pure narrative</p>
          <button @click="started = true" class="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-heading font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            Continue Story →
          </button>
        </div>
      </div>

      <!-- Active Step -->
      <div v-else-if="currentStepIndex < bridgeQuest.steps.length" class="animate-slide-up" :key="currentStepIndex">
        <div class="flex items-center gap-3 mb-6">
          <RouterLink to="/academy" class="text-xs text-gray-400 hover:text-teal-500 transition-colors font-heading">← Exit</RouterLink>
          <div class="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500" :style="{ width: stepProgress + '%' }"></div>
          </div>
          <span class="text-[10px] font-heading font-bold text-amber-400">📖 Story</span>
        </div>

        <div class="bg-[#FAFAF8] dark:bg-[#1A1714] w-full max-w-md mx-auto rounded-3xl overflow-hidden border border-amber-200/30 dark:border-amber-800/20 shadow-2xl flex flex-col h-[650px] max-h-[80vh]">
          <!-- Chat Header -->
          <div class="flex items-center gap-3 p-4 bg-[#F0EDE6] dark:bg-[#211E19] backdrop-blur-md border-b border-amber-200/20 dark:border-amber-800/15">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center relative flex-shrink-0">
              <span class="text-xl">👩🏻‍🎓</span>
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#F0EDE6] dark:border-[#211E19] rounded-full"></span>
            </div>
            <div>
              <p class="font-heading font-bold text-ink dark:text-white text-sm">Lia</p>
              <p class="text-[10px] text-green-500 font-body">online</p>
            </div>
          </div>

          <!-- Chat Body -->
          <div class="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            <!-- Narrative Pill -->
            <div v-if="currentStep.narrative" class="text-center my-2">
              <span class="inline-block bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-[11px] font-body px-4 py-2.5 rounded-2xl max-w-[95%] leading-relaxed italic border border-black/5 dark:border-white/5">
                {{ replaceNames(currentStep.narrative) }}
              </span>
            </div>

            <!-- Lia Message Bubble -->
            <div v-if="currentStep.npc" class="flex flex-col gap-1 items-start max-w-[85%] animate-slide-up">
              <div class="bg-[#E8E5DE] dark:bg-[#2A2620] text-ink dark:text-[#E8E0D4] px-4 py-3 rounded-2xl rounded-tl-sm text-sm font-body leading-relaxed relative border border-gray-200/50 dark:border-amber-800/20">
                {{ replaceNames(currentStep.npc) }}
                <span v-if="currentStep.emotion" class="absolute -top-3 -right-3 text-2xl drop-shadow-md">{{ currentStep.emotion }}</span>
              </div>
            </div>

            <!-- User Response Bubble -->
            <div v-if="stepAnswered && selectedOptionIndex !== null" class="flex flex-col gap-1 items-end self-end max-w-[85%] mt-2 animate-slide-up">
               <div class="bg-gradient-to-br from-teal-500 to-teal-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm font-body leading-relaxed shadow-lg shadow-teal-500/20">
                  {{ replaceNames(typeof currentStep.options[selectedOptionIndex] === 'string' ? currentStep.options[selectedOptionIndex] : currentStep.options[selectedOptionIndex].text) }}
               </div>
            </div>
          </div>

          <!-- Bottom Choices Area -->
          <div class="p-4 bg-[#F0EDE6]/95 dark:bg-[#211E19]/95 border-t border-amber-200/20 dark:border-amber-800/15 backdrop-blur-md shrink-0">
             <div v-if="!stepAnswered && currentStep.options" class="flex flex-col gap-2.5">
                <button v-for="(opt, oi) in currentStep.options" :key="oi"
                  @click="selectOption(oi)"
                  class="w-full text-left p-3.5 rounded-xl transition-all border border-teal-500/30 hover:border-teal-400 bg-teal-500/10 hover:bg-teal-500/20 text-teal-800 dark:text-teal-50 text-sm font-body leading-relaxed">
                  {{ replaceNames(typeof opt === 'string' ? opt : opt.text) }}
                </button>
             </div>

             <div v-if="stepAnswered || !currentStep.options" class="flex justify-center w-full">
                <button @click="nextStep"
                  class="w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-heading font-bold text-sm shadow-md shadow-teal-500/20">
                  {{ currentStepIndex < bridgeQuest.steps.length - 1 ? 'Continue →' : 'Complete ✨' }}
                </button>
             </div>
          </div>
        </div>
      </div>

      <!-- Complete -->
      <div v-else class="text-center animate-slide-up">
        <div class="bg-white dark:bg-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50">
          <div class="text-6xl mb-6">✨</div>
          <h2 class="font-heading text-2xl font-bold text-ink dark:text-white mb-3">Story Chapter Complete!</h2>
          <p class="text-sm text-gray-400 font-body mb-4">{{ bridgeQuest.title }}</p>
          <p v-if="nextChapterRoute" class="text-xs text-teal-500 font-heading font-bold mb-6 animate-pulse">Continuing to {{ bridgeQuest.to }} in {{ autoNavCountdown }}s...</p>
          <button v-if="nextChapterRoute" @click="goToNextChapter" class="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-heading font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md shadow-teal-500/20">
            Continue to {{ bridgeQuest.to }} →
          </button>
          <RouterLink v-else to="/academy" class="px-6 py-3 bg-teal-500 text-white rounded-xl font-heading font-bold text-sm hover:bg-teal-600 transition-colors">
            ← Continue Journey
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'

const route = useRoute()
const router = useRouter()
const store = useResiliaStore()

const bridgeId = route.params.id
const bridgeQuest = computed(() => store.bridgingQuests?.[bridgeId])

const started = ref(false)
const currentStepIndex = ref(0)
const stepAnswered = ref(false)
const selectedOptionIndex = ref(null)

const currentStep = computed(() => bridgeQuest.value?.steps[currentStepIndex.value])
const stepProgress = computed(() => ((currentStepIndex.value + 1) / (bridgeQuest.value?.steps.length || 1)) * 100)

function replaceNames(text) {
  if (!text) return ''
  return text.replace(/\{Name\}/g, store.userName || 'Responder')
}

function selectOption(index) {
  selectedOptionIndex.value = index
  stepAnswered.value = true
  // Auto-advance after a short delay
  setTimeout(() => nextStep(), 2500)
}

function nextStep() {
  stepAnswered.value = false
  selectedOptionIndex.value = null
  currentStepIndex.value++

  if (currentStepIndex.value >= bridgeQuest.value.steps.length) {
    store.completeBridgingQuest(bridgeId)
    startAutoNav()
  }
}

// Seamless flow: find next chapter and auto-navigate
const nextChapterRoute = computed(() => {
  if (!bridgeQuest.value) return null
  const toChapter = bridgeQuest.value.to
  // Find the chapter matching 'to' field (e.g., 'Chapter 2')
  const idx = store.academyChapters.findIndex(c => c.title.includes(toChapter) || c.id === toChapter.toLowerCase().replace(' ', ''))
  if (idx >= 0) {
    const ch = store.academyChapters[idx]
    if (ch.acts && ch.acts.length > 0) {
      if (ch.chatSimulation) {
        return `/academy/sim/${ch.id}/${ch.acts[0].id}`
      }
      return `/academy/chapter/${ch.id}/${ch.acts[0].id}`
    }
  }
  return null
})

const autoNavCountdown = ref(5)
let autoNavTimer = null

function startAutoNav() {
  if (!nextChapterRoute.value) return
  autoNavCountdown.value = 5
  autoNavTimer = setInterval(() => {
    autoNavCountdown.value--
    if (autoNavCountdown.value <= 0) {
      clearInterval(autoNavTimer)
      goToNextChapter()
    }
  }, 1000)
}

function goToNextChapter() {
  if (autoNavTimer) clearInterval(autoNavTimer)
  if (nextChapterRoute.value) {
    router.push(nextChapterRoute.value)
  } else {
    router.push('/academy')
  }
}

onUnmounted(() => {
  if (autoNavTimer) clearInterval(autoNavTimer)
})
</script>
