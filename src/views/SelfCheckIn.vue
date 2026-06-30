<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex flex-col transition-colors duration-700">
    <div class="px-5 pt-5 pb-3">
      <RouterLink to="/home" class="inline-flex items-center gap-2 group">
        <div class="w-7 h-7 rounded-lg bg-teal-500/10 dark:bg-teal-400/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
          <span class="text-sm">←</span>
        </div>
        <span class="font-heading text-sm font-bold text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">RESILIA</span>
      </RouterLink>
    </div>

    <div class="flex-1 flex items-center justify-center px-6 sm:px-8 md:px-12 py-6 md:py-10">
      <div class="w-full max-w-2xl relative">

        <div v-motion class="text-center mb-10 md:mb-14">
          <h1 class="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-ink dark:text-white leading-tight mb-3">Daily Journal 📝</h1>
          <p class="text-gray-400 font-body text-sm md:text-base max-w-md mx-auto leading-relaxed">Help yourself before helping others. How have you been feeling lately?</p>
        </div>

        <div class="mb-8 md:mb-10 transition-all duration-500">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-heading font-bold text-gray-300 dark:text-gray-500 uppercase tracking-wider">{{ currentIndex + 1 }} of {{ questions.length }}</span>
            <span class="text-xs font-heading font-bold text-teal-600 dark:text-teal-400">{{ Math.round(progress) }}%</span>
          </div>
          <div class="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-700 ease-out" :style="{ width: progress + '%' }"></div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800/80 rounded-2xl p-6 sm:p-8 md:p-10 mb-8 md:mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none dark:border dark:border-slate-700/50 transition-all duration-500">
          <Transition name="fade-scale" mode="out-in">
            <div :key="currentIndex" class="w-full">
              <div class="flex items-start gap-4 md:gap-5 mb-8 md:mb-10">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                  {{ questions[currentIndex].emoji }}
                </div>
                <div>
                  <p class="font-heading font-bold text-base md:text-lg text-ink dark:text-white leading-snug">{{ questions[currentIndex].text }}</p>
                  <p class="text-xs text-gray-400 font-body mt-1">Tap a number that fits how you feel</p>
                </div>
              </div>

              <div class="flex justify-center gap-2 sm:gap-3 mb-6">
                <button
                  v-for="n in 7"
                  :key="n"
                  @click="selectAnswer(n)"
                  class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-heading font-bold text-sm sm:text-base transition-all duration-200 border-2"
                  :class="answers[currentIndex] === n
                    ? 'bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/30 scale-110'
                    : 'bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-600 hover:border-teal-300 dark:hover:border-teal-600 hover:scale-105'"
                >
                  {{ n }}
                </button>
              </div>

              <div class="flex justify-between text-[9px] sm:text-[10px] font-heading font-bold text-gray-300 dark:text-gray-500 px-1 select-none">
                <span>Not at all</span>
                <span>Totally</span>
              </div>

              <Transition name="fade-scale">
                <div v-if="answers[currentIndex] > 0" class="mt-4 text-center">
                  <span class="inline-block px-4 py-1.5 rounded-xl text-xs font-heading font-bold transition-all duration-300"
                    :class="answerBg[answers[currentIndex] - 1]">
                    {{ answerLabels[answers[currentIndex] - 1] }}
                  </span>
                </div>
              </Transition>
            </div>
          </Transition>
        </div>

        <div class="flex justify-between gap-4">
          <button
            v-if="currentIndex > 0"
            @click="currentIndex--"
            class="px-6 py-3 rounded-2xl text-sm font-heading font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            ← Back
          </button>
          <div v-else></div>

          <button
            v-if="currentIndex < questions.length - 1"
            @click="nextQuestion"
            :disabled="answers[currentIndex] === 0"
            class="px-8 py-3 rounded-2xl text-sm font-heading font-bold transition-all duration-300"
            :class="answers[currentIndex] > 0
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-gray-500 cursor-not-allowed'"
          >
            Next →
          </button>
          <button
            v-else
            @click="submit"
            :disabled="answers[currentIndex] === 0"
            class="px-8 py-3 rounded-2xl text-sm font-heading font-bold transition-all duration-300"
            :class="answers[currentIndex] > 0
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-300 dark:text-gray-500 cursor-not-allowed'"
          >
            Done! Let's go 🚀
          </button>
        </div>

        <!-- Dynamic Activity Offer Overlay -->
        <div v-if="activityOffer" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-6">
          <div v-motion class="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div class="text-5xl mb-4">{{ popupContent.emoji }}</div>
            <h2 class="font-heading text-xl font-bold text-ink dark:text-white mb-3">{{ popupContent.title }}</h2>
            <p class="text-sm text-gray-400 font-body mb-6 leading-relaxed">{{ popupContent.desc }}</p>
            <div class="flex flex-col gap-3">
              <button @click="acceptActivity" class="w-full px-6 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-heading font-bold text-sm rounded-2xl shadow-lg shadow-teal-500/25 hover:-translate-y-0.5 transition-all">
                {{ popupContent.btn }}
              </button>
              <button @click="skipActivity" class="w-full px-6 py-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-heading font-bold text-sm rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
                Skip for now →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'

const store = useResiliaStore()
const router = useRouter()
const route = useRoute()

const questions = [
  { text: 'I found it hard to wind down lately', emoji: '😮‍💨', _cat: 's' },
  { text: "I've been feeling a bit on edge", emoji: '😬', _cat: 'a' },
  { text: "I haven't been vibing lately tbh", emoji: '😔', _cat: 'd' },
  { text: 'Little things have been bugging me more than usual', emoji: '😤', _cat: 's' },
  { text: "My body's been feeling kinda tense", emoji: '😣', _cat: 'a' },
  { text: "It's been hard to feel excited about stuff", emoji: '😶', _cat: 'd' },
  { text: 'Chilling out has been harder than usual', emoji: '🫠', _cat: 's' },
]

const currentIndex = ref(0)
const answers = ref(new Array(questions.length).fill(0))

const progress = computed(() => ((currentIndex.value + 1) / questions.length) * 100)

const answerLabels = ['Not at all', 'A tiny bit', 'A little', 'Somewhat', 'Quite a bit', 'A lot', 'Totally']

const answerBg = [
  'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
]

function selectAnswer(n) {
  answers.value[currentIndex.value] = n
}

function nextQuestion() {
  if (answers.value[currentIndex.value] > 0 && currentIndex.value < questions.length - 1) {
    currentIndex.value++
  }
}

const activityOffer = ref(false)
const bestActivity = ref('toolkit')

// KNN-driven popup: content adapts based on distress level and journal answers
const popupContent = computed(() => {
  const cat = bestActivity.value
  const avg = answers.value.reduce((s, v) => s + v, 0) / questions.length
  const distressLevel = (avg - 1) / 6  // normalized 0..1

  // Category-specific routes and base data
  const routes = {
    toolkit: '/toolkit',
    checkin: '/journal',
    lesson: '/academy',
    rpg: '/academy',
    donate: '/wallet',
    dashboard: '/dashboard'
  }

  // KNN-adaptive titles and descriptions based on distress level
  const content = {
    toolkit: {
      high: { emoji: '🧘', title: 'Let\'s Take a Breather', desc: 'Your journal shows some heavy feelings today. A short breathing exercise can help your body relax before anything else.', btn: 'Start Breathing' },
      mid: { emoji: '🧘', title: 'A Quick Pause?', desc: 'You seem a bit tense. A guided breathing session might help you feel more grounded.', btn: 'Let\'s Breathe' },
      low: { emoji: '🌿', title: 'Stay Grounded', desc: 'You are doing well today. A quick grounding exercise can help you stay balanced.', btn: 'Quick Exercise' }
    },
    checkin: {
      high: { emoji: '📝', title: 'It Helps to Write It Down', desc: 'Your answers suggest a lot on your mind right now. Putting thoughts into words can ease the weight.', btn: 'Open Journal' },
      mid: { emoji: '📝', title: 'Need to Vent?', desc: 'You seem a bit overwhelmed. Writing your thoughts down can help clear your mind.', btn: 'Open Journal' },
      low: { emoji: '📓', title: 'Daily Reflection', desc: 'Good time for a quick reflection. Journaling keeps your mental fitness sharp.', btn: 'Write Today' }
    },
    lesson: {
      high: { emoji: '📖', title: 'Learn at Your Own Pace', desc: 'When things feel heavy, learning can be a healthy distraction. A short lesson might help shift focus.', btn: 'Browse Lessons' },
      mid: { emoji: '🧠', title: 'Build Your Skills', desc: 'You are in a decent headspace. This is a good time to build disaster readiness skills.', btn: 'Go to Academy' },
      low: { emoji: '📚', title: 'Sharp and Ready', desc: 'You are feeling great. Perfect time to deepen your knowledge and stay ahead.', btn: 'Start Learning' }
    },
    rpg: {
      high: { emoji: '🛡️', title: 'A Gentle Challenge', desc: 'Sometimes a structured scenario helps process what we are feeling. Try a short drill at your pace.', btn: 'Try a Scenario' },
      mid: { emoji: '🎮', title: 'Test Your Instincts', desc: 'Your focus is decent today. A disaster response scenario could sharpen your skills.', btn: 'Start Scenario' },
      low: { emoji: '⚔️', title: 'Field Drill Time', desc: 'Your focus is sharp. Run a disaster response scenario to put your training to the test.', btn: 'Start RPG Drill' }
    },
    donate: {
      high: { emoji: '💛', title: 'Small Acts Help You Too', desc: 'Helping others can lift your own spirits. Even a small contribution makes a difference.', btn: 'See Causes' },
      mid: { emoji: '🤝', title: 'Spread Some Good', desc: 'You are doing okay. Consider paying it forward with a community donation.', btn: 'View Community' },
      low: { emoji: '🌍', title: 'Pay It Forward', desc: 'You are in a great spot. Share some positivity with the community today.', btn: 'Donate Now' }
    },
    dashboard: {
      high: { emoji: '📊', title: 'Ground Yourself with Facts', desc: 'Sometimes looking at real data helps put things in perspective. Check the latest updates.', btn: 'View Data' },
      mid: { emoji: '📈', title: 'Stay Informed', desc: 'A quick look at the disaster data can help you feel prepared and in control.', btn: 'Open Dashboard' },
      low: { emoji: '🗺️', title: 'Analytical Mindset', desc: 'You are feeling balanced. Great time to review ASEAN disaster data and stay sharp.', btn: 'Open Dashboard' }
    }
  }

  const level = distressLevel > 0.6 ? 'high' : distressLevel > 0.3 ? 'mid' : 'low'
  const catContent = content[cat] || content.toolkit
  const selected = catContent[level] || catContent.mid

  return {
    ...selected,
    route: routes[cat] || '/home'
  }
})

function submit() {
  if (answers.value[currentIndex.value] === 0) return
  const total = answers.value.reduce((sum, v) => sum + v, 0)
  const avg = total / questions.length
  let scorePercent = Math.round(((7 - avg) / 6) * 100)
  
  bestActivity.value = store.updateStability(scorePercent, avg, answers.value)
  activityOffer.value = true
}

function acceptActivity() {
  router.push(popupContent.value.route)
}

function skipActivity() {
  const redirectTo = route.query.redirect || '/home'
  router.push(redirectTo)
}
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-scale-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}
</style>
