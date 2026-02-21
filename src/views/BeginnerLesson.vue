<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex flex-col">
    <!-- Header -->
    <div class="px-6 sm:px-8 md:px-12 py-5 md:py-6 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
      <button @click="$router.push('/academy')" class="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 font-heading font-bold transition-colors">
        <span>←</span> Back to Academy
      </button>
    </div>

    <!-- Main -->
    <div class="flex-1 px-6 sm:px-8 md:px-12 py-6 md:py-10">
      <div class="w-full max-w-3xl mx-auto">
        <div v-if="mod" class="animate-slide-up">
          <!-- Module header -->
          <div class="text-center mb-10 md:mb-14">
            <div class="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/20">
              <span class="text-4xl">{{ mod.icon }}</span>
            </div>
            <div class="flex items-center justify-center gap-2 mb-3">
              <span class="text-[10px] font-heading font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full uppercase tracking-wider">Foundation {{ modIndex + 1 }} of {{ store.beginnerModules.length }}</span>
            </div>
            <h1 class="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-ink dark:text-white mb-3 leading-tight">{{ mod.title }}</h1>
            <p class="text-gray-400 font-body text-sm md:text-base max-w-lg mx-auto leading-relaxed">{{ mod.description }}</p>
            <div class="flex items-center justify-center gap-4 mt-4 text-xs font-heading font-bold text-gray-400">
              <span>⏱ {{ mod.duration }}</span>
              <span>+{{ mod.xpReward }} XP</span>
              <span>+{{ mod.coinReward }} RC</span>
            </div>
          </div>

          <!-- Progress -->
          <div class="mb-8">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-heading font-bold text-gray-400 dark:text-gray-500">Progress</span>
              <span class="text-xs font-heading font-bold text-teal-600 dark:text-teal-400">{{ currentSection + 1 }} / {{ totalSteps }}</span>
            </div>
            <div class="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full transition-all duration-500"
                :style="{ width: ((currentSection + 1) / totalSteps * 100) + '%' }"></div>
            </div>
          </div>

          <!-- Content sections -->
          <Transition name="fade-slide" mode="out-in">
            <div :key="currentSection">
              <!-- Reading sections -->
              <div v-if="currentSection < mod.sections.length"
                class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none dark:border dark:border-slate-700 mb-8">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                    <span class="text-lg">📖</span>
                  </div>
                  <h2 class="font-heading text-xl sm:text-2xl font-bold text-ink dark:text-white">{{ mod.sections[currentSection].title }}</h2>
                </div>
                <div class="prose prose-sm">
                  <p v-for="(para, i) in mod.sections[currentSection].content.split('\\n')" :key="i"
                    class="text-gray-600 dark:text-gray-300 font-body text-sm sm:text-base leading-relaxed mb-3"
                    :class="para.startsWith('•') ? 'pl-4' : ''">
                    {{ para }}
                  </p>
                </div>
              </div>

              <!-- Quiz -->
              <div v-else-if="currentSection >= mod.sections.length && !quizComplete"
                class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none dark:border dark:border-slate-700 mb-8">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                    <span class="text-lg">❓</span>
                  </div>
                  <h2 class="font-heading text-xl font-bold text-ink dark:text-white">Quiz — Question {{ quizIndex + 1 }}/{{ mod.quiz.length }}</h2>
                </div>

                <p class="font-heading font-bold text-ink dark:text-white text-base sm:text-lg mb-6">{{ mod.quiz[quizIndex].question }}</p>

                <div class="space-y-3">
                  <button v-for="(opt, i) in mod.quiz[quizIndex].options" :key="i"
                    @click="answerQuiz(i)"
                    :disabled="quizAnswered"
                    class="w-full text-left p-4 rounded-2xl font-body text-sm sm:text-base transition-all"
                    :class="getOptionClass(i)">
                    <span class="font-heading font-bold mr-2">{{ String.fromCharCode(65 + i) }}.</span> {{ opt }}
                  </button>
                </div>

                <div v-if="quizAnswered" class="mt-6 p-4 rounded-2xl"
                  :class="quizCorrect ? 'bg-teal-50 dark:bg-teal-900/20' : 'bg-red-50 dark:bg-red-900/20'">
                  <p class="font-heading font-bold text-sm" :class="quizCorrect ? 'text-teal-600 dark:text-teal-400' : 'text-red-500'">
                    {{ quizCorrect ? '✓ Correct!' : '✗ Not quite — the correct answer is highlighted above.' }}
                  </p>
                </div>
              </div>

              <!-- Completion -->
              <div v-else
                class="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none dark:border dark:border-slate-700 mb-8 text-center">
                <div class="mb-6">
                  <span class="text-6xl">🎉</span>
                </div>
                <h2 class="font-heading text-2xl font-bold text-ink dark:text-white mb-3">Foundation Complete!</h2>
                <p class="text-gray-400 font-body text-sm mb-2">You scored {{ quizScore }}/{{ mod.quiz.length }} on the quiz</p>
                <div class="flex items-center justify-center gap-4 text-sm font-heading font-bold mb-6">
                  <span class="text-teal-600 dark:text-teal-400">+{{ mod.xpReward }} XP</span>
                  <span class="text-amber-500">+{{ mod.coinReward }} RC</span>
                </div>
                <button @click="$router.push('/academy')"
                  class="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-heading font-bold text-sm hover:shadow-lg hover:shadow-teal-500/20 transition-all">
                  Back to Academy →
                </button>
              </div>
            </div>
          </Transition>

          <!-- Navigation -->
          <div class="flex justify-between gap-4" v-if="!quizComplete">
            <button v-if="currentSection > 0" @click="prevSection"
              class="px-6 py-3 bg-white dark:bg-slate-800 text-ink dark:text-white rounded-2xl font-heading font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              ← Previous
            </button>
            <div v-else></div>
            <button @click="nextSection"
              class="px-6 py-3 rounded-2xl font-heading font-bold text-sm transition-all"
              :class="canAdvance
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/20'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-400 cursor-not-allowed'"
              :disabled="!canAdvance">
              {{ currentSection < mod.sections.length - 1 ? 'Continue →' : currentSection === mod.sections.length - 1 ? 'Start Quiz →' : 'Next Question →' }}
            </button>
          </div>
        </div>

        <!-- Module not found -->
        <div v-else class="text-center py-20">
          <p class="text-4xl mb-4">🔍</p>
          <p class="text-gray-400 font-body">Foundation module not found.</p>
          <button @click="$router.push('/academy')" class="mt-4 px-6 py-3 bg-teal-500 text-white rounded-2xl font-heading font-bold text-sm">Back to Academy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'

const store = useResiliaStore()
const route = useRoute()

const modId = route.params.id
const mod = computed(() => store.beginnerModules.find(m => m.id === modId))
const modIndex = computed(() => store.beginnerModules.findIndex(m => m.id === modId))

const currentSection = ref(0)
const quizIndex = ref(0)
const quizAnswered = ref(false)
const quizCorrect = ref(false)
const quizSelectedAnswer = ref(-1)
const quizScore = ref(0)
const quizComplete = ref(false)

const totalSteps = computed(() => mod.value ? mod.value.sections.length + mod.value.quiz.length : 0)

const canAdvance = computed(() => {
  if (currentSection.value < mod.value.sections.length) return true
  return quizAnswered.value
})

function getOptionClass(i) {
  if (!quizAnswered.value) {
    return 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-ink dark:text-white'
  }
  if (i === mod.value.quiz[quizIndex.value].correct) return 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 ring-2 ring-teal-500'
  if (i === quizSelectedAnswer.value) return 'bg-red-50 dark:bg-red-900/30 text-red-500 ring-2 ring-red-400'
  return 'bg-gray-50 dark:bg-slate-700 text-gray-400 opacity-50'
}

function answerQuiz(i) {
  if (quizAnswered.value) return
  quizAnswered.value = true
  quizSelectedAnswer.value = i
  quizCorrect.value = i === mod.value.quiz[quizIndex.value].correct
  if (quizCorrect.value) quizScore.value++
}

function nextSection() {
  if (currentSection.value < mod.value.sections.length - 1) {
    currentSection.value++
  } else if (currentSection.value === mod.value.sections.length - 1) {
    currentSection.value++
  } else if (quizAnswered.value) {
    if (quizIndex.value < mod.value.quiz.length - 1) {
      quizIndex.value++
      quizAnswered.value = false
      quizCorrect.value = false
      quizSelectedAnswer.value = -1
      currentSection.value++
    } else {
      quizComplete.value = true
      store.completeBeginnerModule(modId)
    }
  }
}

function prevSection() {
  if (currentSection.value > 0) {
    currentSection.value--
    if (currentSection.value >= mod.value.sections.length) {
      const qi = currentSection.value - mod.value.sections.length
      if (qi >= 0) quizIndex.value = qi
    }
  }
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
