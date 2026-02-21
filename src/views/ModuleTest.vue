<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 dark:from-[#141210] dark:via-[#181614] dark:to-[#14120F] flex flex-col">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-white/80 dark:bg-[#0e0e18]/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-6 py-4">
      <div class="max-w-2xl mx-auto flex items-center justify-between">
        <button @click="goBack" class="text-sm text-gray-400 dark:text-gray-500 font-body hover:text-ink dark:hover:text-white transition-colors">← Back to Academy</button>
        <span class="text-[10px] font-heading font-bold text-gray-300 dark:text-gray-600 uppercase tracking-wider">
          {{ testType === 'pre' ? 'Knowledge Check' : 'Chapter Review' }} · Module {{ moduleId }}
        </span>
      </div>
    </div>

    <div class="flex-1 flex items-center justify-center px-6 py-10">
      <div class="w-full max-w-2xl">
        <Transition name="slide" mode="out-in">
          <!-- Intro screen -->
          <div v-if="phase === 'intro'" key="intro" class="text-center animate-slide-up">
            <div class="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg"
              :class="testType === 'pre' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-green-400 to-green-600'">
              <span class="text-4xl">{{ testType === 'pre' ? '📋' : '🎯' }}</span>
            </div>
            <h1 class="font-heading text-3xl font-bold text-ink dark:text-white mb-4">
              {{ testType === 'pre' ? 'Knowledge Check' : 'Test Your Growth' }}
            </h1>
            <p class="text-gray-400 font-body text-sm mb-3 max-w-md mx-auto">
              {{ testType === 'pre'
                ? 'Before you begin this module, let\'s see what you already know. Don\'t worry — there are no wrong answers here!'
                : 'You\'ve completed the module! Let\'s see how much you\'ve learned. Ready?' }}
            </p>
            <p class="text-xs text-gray-300 dark:text-gray-600 font-body mb-10">{{ questions.length }} questions · No time limit</p>
            <button @click="phase = 'quiz'"
              class="px-10 py-4 bg-ink dark:bg-white text-white dark:text-ink rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-all hover:shadow-xl">
              Start {{ testType === 'pre' ? 'Knowledge Check' : 'Chapter Review' }} →
            </button>
          </div>

          <!-- Quiz -->
          <div v-else-if="phase === 'quiz'" key="quiz" class="animate-slide-up">
            <!-- Progress bar -->
            <div class="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500 bg-gradient-to-r"
                :class="testType === 'pre' ? 'from-blue-400 to-blue-500' : 'from-green-400 to-green-500'"
                :style="{ width: ((currentQ + 1) / questions.length * 100) + '%' }"></div>
            </div>

            <p class="text-[10px] font-heading font-bold text-gray-300 dark:text-gray-600 uppercase tracking-wider mb-6">
              Question {{ currentQ + 1 }} of {{ questions.length }}
            </p>

            <Transition name="slide" mode="out-in">
              <div :key="currentQ">
                <h2 class="font-heading text-xl md:text-2xl font-bold text-ink dark:text-white mb-8 leading-snug">
                  {{ questions[currentQ].question }}
                </h2>

                <div class="space-y-3 mb-8">
                  <button v-for="(opt, i) in questions[currentQ].options" :key="i"
                    @click="selectAnswer(i)" :disabled="answered !== null"
                    class="w-full text-left p-5 rounded-2xl font-body text-sm transition-all"
                    :class="answerClass(i)">
                    <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-heading font-bold mr-3"
                      :class="answered === i
                        ? 'bg-white/30 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'">
                      {{ ['A', 'B', 'C', 'D'][i] }}
                    </span>
                    {{ opt }}
                  </button>
                </div>

                <div v-if="answered !== null" class="animate-slide-up">
                  <div class="p-4 rounded-2xl mb-6 text-sm font-body"
                    :class="answered === questions[currentQ].correct ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'">
                    {{ answered === questions[currentQ].correct ? '✅ Correct!' : '❌ Not quite. The correct answer is: ' + questions[currentQ].options[questions[currentQ].correct] }}
                  </div>
                  <button @click="nextQuestion"
                    class="w-full py-4 bg-ink dark:bg-white text-white dark:text-ink rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-all">
                    {{ currentQ < questions.length - 1 ? 'Next Question →' : 'See Results →' }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Results -->
          <div v-else-if="phase === 'results'" key="results" class="text-center animate-slide-up">
            <div class="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg"
              :class="scorePercent >= 70 ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-amber-400 to-amber-600'">
              <span class="text-4xl">{{ scorePercent >= 70 ? '🏆' : '💡' }}</span>
            </div>

            <h1 class="font-heading text-3xl font-bold text-ink dark:text-white mb-3">
              {{ scorePercent >= 70 ? 'Excellent Work!' : 'Keep Learning!' }}
            </h1>
            <p class="text-gray-400 font-body text-sm mb-8">
              You scored {{ correctCount }} out of {{ questions.length }}
            </p>

            <!-- Score ring -->
            <div class="relative w-32 h-32 mx-auto mb-8">
              <svg class="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" stroke-width="10" class="text-gray-100 dark:text-slate-800"/>
                <circle cx="64" cy="64" r="56" fill="none"
                  :stroke="scorePercent >= 70 ? '#10b981' : '#f59e0b'" stroke-width="10"
                  stroke-linecap="round"
                  :stroke-dasharray="351.86"
                  :stroke-dashoffset="351.86 - (351.86 * scorePercent / 100)"
                  class="transition-all duration-1000"/>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="font-heading text-3xl font-bold text-ink dark:text-white">{{ scorePercent }}%</span>
              </div>
            </div>

            <!-- Comparison (post-test only) -->
            <div v-if="testType === 'post' && preScore !== null" class="bg-white dark:bg-slate-800/60 rounded-2xl p-6 mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none dark:border dark:border-slate-700/50">
              <p class="text-[10px] font-heading font-bold text-gray-300 dark:text-gray-600 uppercase tracking-wider mb-4">Your Growth</p>
              <div class="flex items-center justify-center gap-6">
                <div class="text-center">
                  <p class="text-2xl font-heading font-bold text-gray-400">{{ preScore }}%</p>
                  <p class="text-[10px] text-gray-300 dark:text-gray-600 font-body mt-1">Before</p>
                </div>
                <div class="text-2xl text-gray-400">→</div>
                <div class="text-center">
                  <p class="text-2xl font-heading font-bold" :class="scorePercent > preScore ? 'text-green-500' : 'text-amber-500'">{{ scorePercent }}%</p>
                  <p class="text-[10px] text-gray-300 dark:text-gray-600 font-body mt-1">After</p>
                </div>
              </div>
              <p v-if="scorePercent > preScore" class="text-xs text-green-600 dark:text-green-400 font-body mt-4">
                📈 Your score improved by {{ scorePercent - preScore }}%! Great progress!
              </p>
            </div>

            <button @click="router.push('/academy')"
              class="w-full py-4 bg-ink dark:bg-white text-white dark:text-ink rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-all">
              Back to Academy →
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'

const route = useRoute()
const router = useRouter()
const store = useResiliaStore()

const moduleId = parseInt(route.params.moduleId)
const testType = route.params.testType // 'pre' or 'post'

const phase = ref('intro')
const currentQ = ref(0)
const answered = ref(null)
const correctCount = ref(0)

const questions = computed(() => store.moduleTests[moduleId] || [])

const preScore = computed(() => {
  const scores = store.moduleTestScores[moduleId]
  return scores?.pre ?? null
})

const scorePercent = computed(() => {
  if (!questions.value.length) return 0
  return Math.round((correctCount.value / questions.value.length) * 100)
})

function selectAnswer(i) {
  if (answered.value !== null) return
  answered.value = i
  if (i === questions.value[currentQ.value].correct) correctCount.value++
}

function answerClass(i) {
  if (answered.value === null) return 'bg-white dark:bg-slate-800/60 hover:bg-gray-50 dark:hover:bg-slate-700/60 text-ink dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none dark:border dark:border-slate-700/50'
  if (i === questions.value[currentQ.value].correct) return 'bg-green-500 text-white shadow-lg'
  if (i === answered.value) return 'bg-red-400 text-white shadow-lg'
  return 'bg-gray-50 dark:bg-slate-800/30 text-gray-300 dark:text-gray-600'
}

function nextQuestion() {
  if (currentQ.value < questions.value.length - 1) {
    currentQ.value++
    answered.value = null
  } else {
    store.submitTestScore(moduleId, testType, scorePercent.value)
    phase.value = 'results'
  }
}

function goBack() { router.push('/academy') }
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
