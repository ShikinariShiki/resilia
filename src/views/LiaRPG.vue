<template>
  <div class="max-w-3xl mx-auto">
    <div v-if="!scenario" class="text-center py-20">
      <p class="text-4xl mb-4">❌</p>
      <p class="text-gray-400 font-body">Scenario not found.</p>
      <RouterLink to="/academy" class="text-teal-500 font-heading font-bold text-sm mt-4 inline-block hover:underline">← Back to Academy</RouterLink>
    </div>

    <div v-else>
      <!-- Header -->
      <div v-if="!started" class="animate-slide-up">
        <RouterLink to="/academy" class="text-xs text-gray-400 hover:text-teal-500 transition-colors font-heading mb-6 inline-block">← Academy</RouterLink>
        <div class="bg-white dark:bg-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 text-center">
          <div class="text-6xl mb-6">{{ scenario.cover }}</div>
          <h1 class="font-heading text-2xl sm:text-3xl font-bold text-ink dark:text-white mb-2">{{ scenario.title }}</h1>
          <p class="text-sm text-gray-400 font-body mb-1">{{ scenario.location }}</p>
          <p v-if="scenario.culturalElement" class="text-xs text-teal-500 font-heading font-bold mb-6">🎭 {{ scenario.culturalElement }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-body mb-8 max-w-lg mx-auto leading-relaxed">
            {{ replaceNames(scenario.description) }}
          </p>
          <div class="flex items-center justify-center gap-3 text-xs text-gray-400 font-body mb-8">
            <span>⚔️ {{ scenario.steps.filter(s => !s.isAttentionTest).length }} decisions</span>
            <span>•</span>
            <span>⚡ {{ scenario.attentionTests.length }} attention tests</span>
          </div>
          <button @click="started = true" class="px-8 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-heading font-bold text-sm shadow-lg shadow-teal-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            Begin Story →
          </button>
        </div>
      </div>

      <!-- Active step -->
      <div v-else-if="currentStepIndex < scenario.steps.length" class="animate-slide-up" :key="currentStepIndex">
        <!-- Progress -->
        <div class="flex items-center gap-3 mb-6">
          <RouterLink to="/academy" class="text-xs text-gray-400 hover:text-teal-500 transition-colors font-heading">← Exit</RouterLink>
          <div class="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500" :style="{ width: stepProgress + '%' }"></div>
          </div>
          <span class="text-[10px] font-heading font-bold text-gray-400">{{ currentStepIndex + 1 }}/{{ scenario.steps.length }}</span>
        </div>

        <!-- Attention Test -->
        <div v-if="currentStep.isAttentionTest" class="bg-red-50 dark:bg-red-900/20 rounded-3xl p-8 text-center border-2 border-red-200 dark:border-red-800/50">
          <p class="text-xs font-heading font-bold text-red-500 uppercase tracking-wider mb-4 animate-pulse">⚡ ATTENTION TEST ⚡</p>
          <p class="text-lg font-heading font-bold text-ink dark:text-white mb-6">{{ activeAttentionTest?.prompt }}</p>

          <!-- Timer -->
          <div v-if="attentionTimer > 0" class="mb-6">
            <div class="w-20 h-20 mx-auto rounded-full border-4 border-red-300 dark:border-red-700 flex items-center justify-center">
              <span class="font-heading text-2xl font-bold text-red-500">{{ attentionTimer }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 max-w-lg mx-auto">
            <button v-for="(opt, oi) in activeAttentionTest?.options" :key="oi"
              @click="answerAttentionTest(oi)"
              :disabled="attentionAnswered"
              class="p-4 rounded-2xl text-sm font-heading font-bold transition-all"
              :class="getAttentionClass(oi)">
              {{ opt }}
            </button>
          </div>

          <div v-if="attentionAnswered" class="mt-6">
            <p class="text-sm font-heading font-bold" :class="attentionCorrect ? 'text-teal-500' : 'text-red-500'">
              {{ attentionCorrect ? '✅ Correct! Quick reflexes!' : '❌ Wrong — stay alert next time!' }}
            </p>
            <button @click="nextStep" class="mt-4 px-6 py-2.5 bg-teal-500 text-white rounded-xl font-heading font-bold text-sm hover:bg-teal-600 transition-colors">
              Continue →
            </button>
          </div>
        </div>

        <!-- Story Step -->
        <div v-else class="bg-white dark:bg-slate-800/80 rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50">
          <!-- Narrative -->
          <div class="p-6 sm:p-8 bg-gradient-to-b from-gray-50/80 to-transparent dark:from-slate-700/30">
            <p class="text-sm text-gray-600 dark:text-gray-300 font-body leading-relaxed italic">{{ replaceNames(currentStep.narrative) }}</p>
          </div>

          <!-- NPC Dialogue -->
          <div class="px-6 sm:px-8 pb-4">
            <div class="flex items-start gap-4 bg-teal-50/60 dark:bg-teal-900/15 rounded-2xl p-4 sm:p-5">
              <div class="w-12 h-12 bg-teal-100 dark:bg-teal-800/40 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {{ currentStep.emotion }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-xs font-heading font-bold text-teal-700 dark:text-teal-400">Lia</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-800/40 text-teal-600 dark:text-teal-400 font-body">{{ currentStep.emotionLabel }}</span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 font-body leading-relaxed">{{ replaceNames(currentStep.npc) }}</p>
              </div>
            </div>
          </div>

          <!-- Clue -->
          <div v-if="currentStep.clue" class="px-6 sm:px-8 pb-4">
            <div class="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 font-body">
              {{ replaceNames(currentStep.clue) }}
            </div>
          </div>

          <!-- Choices -->
          <div class="px-6 sm:px-8 pb-6 sm:pb-8 space-y-3" v-if="!stepAnswered">
            <button v-for="(opt, oi) in currentStep.options" :key="oi"
              @click="selectOption(oi)"
              class="w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all hover:shadow-md hover:-translate-y-0.5"
              :class="'border-gray-100 dark:border-slate-700/50 hover:border-teal-300 dark:hover:border-teal-600 bg-gray-50/50 dark:bg-slate-700/20'">
              <p class="text-sm font-body text-gray-700 dark:text-gray-300 leading-relaxed">{{ replaceNames(opt.text) }}</p>
            </button>
          </div>

          <!-- Feedback -->
          <div v-if="stepAnswered" class="px-6 sm:px-8 pb-6 sm:pb-8">
            <div class="p-4 sm:p-5 rounded-2xl mb-4"
              :class="selectedOption.score >= 3 ? 'bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/50' : selectedOption.score >= 1 ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50'">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-sm">{{ selectedOption.score >= 3 ? '🌟' : selectedOption.score >= 1 ? '🤔' : '😬' }}</span>
                <span class="text-xs font-heading font-bold" :class="selectedOption.score >= 3 ? 'text-teal-600 dark:text-teal-400' : selectedOption.score >= 1 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'">
                  {{ selectedOption.score >= 3 ? 'Excellent!' : selectedOption.score >= 1 ? 'Partial Credit' : 'Missed It' }}
                  (+{{ selectedOption.score }} pts)
                </span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 font-body leading-relaxed">{{ replaceNames(selectedOption.feedback) }}</p>
            </div>
            <button @click="nextStep"
              class="px-6 py-2.5 bg-teal-500 text-white rounded-xl font-heading font-bold text-sm hover:bg-teal-600 transition-colors shadow-md shadow-teal-500/20">
              {{ currentStepIndex < scenario.steps.length - 1 ? 'Continue →' : 'Complete Story ✨' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Completion -->
      <div v-else class="text-center animate-slide-up">
        <div class="bg-white dark:bg-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50">
          <div class="text-6xl mb-6">🏆</div>
          <h2 class="font-heading text-2xl sm:text-3xl font-bold text-ink dark:text-white mb-3">Chapter Complete!</h2>
          <p class="text-sm text-gray-400 font-body mb-6">{{ scenario.title }}</p>
          <div class="inline-flex items-center gap-4 bg-gray-50 dark:bg-slate-700/30 rounded-2xl p-5 mb-8">
            <div class="text-center">
              <p class="font-heading text-2xl font-bold text-teal-600 dark:text-teal-400">{{ totalScore }}</p>
              <p class="text-[10px] text-gray-400 font-body mt-0.5">Score</p>
            </div>
            <div class="w-px h-10 bg-gray-200 dark:bg-slate-600"></div>
            <div class="text-center">
              <p class="font-heading text-2xl font-bold text-orange-500">+150</p>
              <p class="text-[10px] text-gray-400 font-body mt-0.5">XP Earned</p>
            </div>
            <div class="w-px h-10 bg-gray-200 dark:bg-slate-600"></div>
            <div class="text-center">
              <p class="font-heading text-2xl font-bold text-amber-500">+30</p>
              <p class="text-[10px] text-gray-400 font-body mt-0.5">ResiCoins</p>
            </div>
          </div>
          <div class="flex justify-center gap-3">
            <RouterLink to="/academy" class="px-6 py-3 bg-teal-500 text-white rounded-xl font-heading font-bold text-sm hover:bg-teal-600 transition-colors">
              ← Back to Academy
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'

const route = useRoute()
const store = useResiliaStore()

const rpgId = route.params.id
const scenario = computed(() => store.liaRPGScenarios[rpgId])

const started = ref(false)
const currentStepIndex = ref(0)
const stepAnswered = ref(false)
const selectedOption = ref(null)
const totalScore = ref(0)

// Attention test state
const attentionAnswered = ref(false)
const attentionCorrect = ref(false)
const attentionTimer = ref(0)
let timerInterval = null

const currentStep = computed(() => scenario.value?.steps[currentStepIndex.value])
const stepProgress = computed(() => ((currentStepIndex.value + 1) / (scenario.value?.steps.length || 1)) * 100)

const activeAttentionTest = computed(() => {
  if (!currentStep.value?.isAttentionTest) return null
  return scenario.value.attentionTests.find(t => t.id === currentStep.value.attentionTestId)
})

function replaceNames(text) {
  if (!text) return ''
  return text.replace(/\{Name\}/g, store.userName || 'Responder')
}

function selectOption(index) {
  selectedOption.value = currentStep.value.options[index]
  totalScore.value += selectedOption.value.score
  stepAnswered.value = true
}

function answerAttentionTest(index) {
  if (attentionAnswered.value) return
  attentionAnswered.value = true
  attentionCorrect.value = index === activeAttentionTest.value.correct
  if (attentionCorrect.value) totalScore.value += 2
  if (timerInterval) clearInterval(timerInterval)
}

function getAttentionClass(index) {
  if (!attentionAnswered.value) return 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-red-300 dark:hover:border-red-500 text-ink dark:text-white'
  if (index === activeAttentionTest.value.correct) return 'bg-teal-50 dark:bg-teal-900/30 border-2 border-teal-500 text-teal-700 dark:text-teal-400'
  return 'bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-400 opacity-50'
}

function nextStep() {
  stepAnswered.value = false
  attentionAnswered.value = false
  attentionCorrect.value = false
  selectedOption.value = null
  currentStepIndex.value++

  // Start attention test timer if applicable
  const next = scenario.value?.steps[currentStepIndex.value]
  if (next?.isAttentionTest) {
    const test = scenario.value.attentionTests.find(t => t.id === next.attentionTestId)
    if (test) {
      attentionTimer.value = test.timeLimit
      timerInterval = setInterval(() => {
        attentionTimer.value--
        if (attentionTimer.value <= 0) {
          clearInterval(timerInterval)
          if (!attentionAnswered.value) {
            attentionAnswered.value = true
            attentionCorrect.value = false
          }
        }
      }, 1000)
    }
  }

  // Complete RPG when done
  if (currentStepIndex.value >= scenario.value.steps.length) {
    store.completeLiaRPG(rpgId, totalScore.value)
  }
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>
