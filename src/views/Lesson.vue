<template>
  <div>
    <button @click="$router.push('/academy')" class="text-sm text-gray-400 hover:text-teal-600 font-heading font-bold transition-colors mb-8 inline-flex items-center gap-1.5">
      <span>←</span> Back to Academy
    </button>

    <!-- Video player -->
    <div class="bg-gray-900 rounded-3xl shadow-xl mb-8 overflow-hidden">
      <div class="aspect-video relative group">
        <div class="absolute inset-0 flex items-center justify-center" :class="playing ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-800 to-gray-950'">
          <div v-if="!playing" class="text-center z-10">
            <button @click="startPlaying"
              class="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center hover:bg-red-500 hover:scale-105 transition-all mx-auto shadow-xl">
              <span class="text-white text-4xl ml-1">▶</span>
            </button>
            <p class="text-white font-heading font-bold text-xl mt-6">{{ currentMod?.title }}</p>
            <p class="text-gray-500 text-sm font-body mt-2">{{ currentMod?.duration }} · {{ currentMod?.xpReward }} XP</p>
          </div>
          <div v-else class="w-full h-full flex items-center justify-center">
            <div class="text-center">
              <div class="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
                <span class="text-white text-3xl">📹</span>
              </div>
              <p class="text-white font-heading text-xl">{{ currentMod?.title }}</p>
              <p class="text-gray-500 text-sm font-body mt-2">Playing...</p>
            </div>
          </div>
        </div>
        <div v-if="!playing" class="absolute top-4 left-4">
          <span class="px-3 py-1.5 bg-red-600 text-white text-[11px] font-heading font-bold rounded-xl">RESILIA</span>
        </div>
      </div>

      <div class="px-5 py-3 bg-gray-950 flex items-center gap-4">
        <button @click="playing ? pausePlaying() : startPlaying()" class="text-white hover:text-red-400 transition-colors">
          <span class="text-sm font-heading font-bold">{{ playing ? '⏸' : '▶' }}</span>
        </button>
        <div class="flex-1 h-1.5 bg-white/10 relative cursor-pointer rounded-full overflow-hidden" @click="seekTo($event)">
          <div class="absolute left-0 top-0 h-full bg-red-600 rounded-full transition-all duration-300" :style="{ width: videoProgress + '%' }"></div>
        </div>
        <span class="text-xs text-gray-500 font-heading">{{ formatTime(currentTime) }} / {{ formatTime(totalDuration) }}</span>
      </div>
    </div>

    <!-- Info -->
    <div class="bg-white rounded-3xl p-8 mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h3 class="font-heading font-bold text-ink text-xl mb-2">{{ currentMod?.title }}</h3>
      <p class="text-base text-gray-400 font-body leading-relaxed">{{ currentMod?.description }}</p>
    </div>

    <!-- Quiz -->
    <div v-if="showQuiz" class="bg-white rounded-3xl p-8 mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] animate-slide-up">
      <div class="flex items-center gap-3 mb-6">
        <span class="px-4 py-1.5 bg-orange-500 text-white rounded-xl font-heading font-bold text-xs">⚡ Attention Check</span>
        <span class="text-xs text-gray-400 font-body">Paused at {{ formatTime(currentTime) }}</span>
      </div>
      <h3 class="font-heading text-lg font-bold text-ink mb-6">{{ quiz.question }}</h3>
      <div class="space-y-3">
        <button v-for="(option, i) in quiz.options" :key="i" @click="answerQuiz(i)" :disabled="quizAnswered"
          class="w-full text-left px-6 py-4 rounded-2xl text-sm font-body transition-all leading-relaxed" :class="getQuizClass(i)">
          <span class="font-heading font-bold mr-2">{{ String.fromCharCode(65 + i) }}.</span> {{ option }}
        </button>
      </div>
      <div v-if="quizAnswered" class="mt-6">
        <p v-if="quizCorrect" class="text-teal-600 font-heading font-bold mb-4">✓ Correct! Well done.</p>
        <p v-else class="text-red-500 font-heading font-bold mb-4">✗ Not quite. Answer was {{ String.fromCharCode(65 + quiz.correct) }}.</p>
        <div v-if="!store.moduleRPGCompleted(moduleId)" class="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-6 mb-6 text-center">
          <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">🎮</div>
          <h4 class="font-heading font-bold text-ink dark:text-white mb-2">Final Step: Simulation Required</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 font-body">You must complete the RPG scenario to certify this module.</p>
          <button @click="$router.push(`/academy/rpg/${moduleId}`)" 
            class="py-3 px-8 bg-orange-500 text-white rounded-2xl font-heading font-bold text-sm hover:bg-orange-600 transition-all w-full sm:w-auto shadow-lg shadow-orange-500/20">
            Start Scenario RPG →
          </button>
        </div>

        <button v-else @click="finishLesson"
          class="py-4 px-8 bg-teal-500 text-white rounded-2xl font-heading font-bold text-sm hover:bg-teal-600 transition-all w-full sm:w-auto shadow-lg shadow-teal-500/20">
          Complete Module & Claim Rewards →
        </button>
      </div>
    </div>

    <div v-else-if="playing" class="bg-white rounded-3xl p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <p class="text-base text-gray-400 font-body">Keep watching... an attention check will appear soon.</p>
    </div>

    <CoinAnimation :trigger="coinTrigger" :amount="currentMod?.coinReward || 10" />
    <ConfettiAnimation :trigger="confettiTrigger" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import CoinAnimation from '../components/CoinAnimation.vue'
import ConfettiAnimation from '../components/ConfettiAnimation.vue'

const store = useResiliaStore()
const route = useRoute()
const router = useRouter()

const moduleId = computed(() => parseInt(route.params.id))
const currentMod = computed(() => store.modules.find(m => m.id === moduleId.value))

const playing = ref(false), videoProgress = ref(0), currentTime = ref(0), totalDuration = ref(720)
const showQuiz = ref(false), quizAnswered = ref(false), quizCorrect = ref(false), selectedAnswer = ref(-1), coinTrigger = ref(0), confettiTrigger = ref(0)

const quizzes = {
  1: { question: 'What is the PRIMARY goal of Psychological First Aid (PFA)?', options: ['Diagnosing mental health disorders in survivors', 'Providing immediate emotional support and practical help', 'Prescribing medication for trauma symptoms', 'Conducting long-term therapy sessions'], correct: 1 },

  2: { question: 'In active listening, which technique is MOST effective at building trust?', options: ['Giving advice quickly to show competence', 'Maintaining eye contact without speaking', 'Reflecting feelings and validating the person\'s experience', 'Asking rapid-fire diagnostic questions'], correct: 2 },
  3: { question: 'What is the FIRST thing you should do during a crisis de-escalation?', options: ['Call law enforcement immediately', 'Ensure your own physical safety and positioning', 'Confront the aggressive individual directly', 'Start recording the incident for documentation'], correct: 1 },
  4: { question: 'Cultural sensitivity in ASEAN disaster response means:', options: ['Using only English as the common language', 'Adapting your PFA approach to local customs, beliefs, and gender norms', 'Avoiding all physical contact with survivors', 'Following a strict standardized Western protocol everywhere'], correct: 1 },
  5: { question: 'In post-disaster mental health triage, what gets HIGHEST priority?', options: ['Property damage assessment and insurance claims', 'Individuals showing signs of acute psychosis or suicidal ideation', 'Media briefings and public communication', 'Financial loss calculations for government aid'], correct: 1 },
  6: { question: 'Community mobilization is most effective because:', options: ['It completely replaces the need for professional help', 'Local people understand local needs, language, and cultural context', 'It is always cheaper than professional intervention', 'It avoids government involvement in disaster response'], correct: 1 },
  7: { question: 'When providing PFA to a traumatized child, what approach works BEST?', options: ['Asking them to describe the traumatic event in detail', 'Using play-based activities and age-appropriate language', 'Treating them exactly the same as adult survivors', 'Separating them as quickly as possible from their caregivers'], correct: 1 },
  8: { question: 'Which is an early WARNING sign of responder burnout?', options: ['Feeling motivated and energized by the work', 'Emotional detachment and cynicism toward survivors', 'Wanting to learn more about PFA techniques', 'Taking regular scheduled breaks'], correct: 1 },
  9: { question: 'During a disaster, what is the BIGGEST communication risk?', options: ['Using too many official channels', 'Misinformation spreading on social media causing panic', 'Having too many translators available', 'Over-communicating with affected populations'], correct: 1 },
  10: { question: 'In an evacuation shelter, maintaining DIGNITY means:', options: ['Providing food as quickly as possible regardless of method', 'Ensuring privacy, sanitation, and culturally appropriate facilities', 'Maximizing the number of people per room for efficiency', 'Keeping all evacuees in one large open area for easy monitoring'], correct: 1 },
  11: { question: 'When supporting someone experiencing grief, you should AVOID:', options: ['Sitting in silence with them if they don\'t want to talk', 'Saying "I know exactly how you feel" or "everything happens for a reason"', 'Acknowledging their pain without trying to fix it', 'Asking if they need practical help with daily tasks'], correct: 1 },
  12: { question: 'Long-term recovery planning should include:', options: ['Only emergency food and water distribution', 'PTSD screening referrals, livelihood rebuilding, and community resilience programs', 'Removing all temporary shelters as quickly as possible', 'Focusing exclusively on infrastructure repair'], correct: 1 },
}

const quiz = computed(() => quizzes[moduleId.value] || quizzes[1])
let progressInterval = null

function startPlaying() { playing.value = true }
function pausePlaying() { playing.value = false }
function seekTo(e) { const r = e.currentTarget.getBoundingClientRect(); videoProgress.value = Math.round(((e.clientX - r.left) / r.width) * 100); currentTime.value = Math.round((videoProgress.value / 100) * totalDuration.value) }
function formatTime(s) { return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}` }

watch(playing, v => {
  if (v && !showQuiz.value) {
    progressInterval = setInterval(() => {
      videoProgress.value += 1; currentTime.value = Math.round((videoProgress.value / 100) * totalDuration.value)
      if (videoProgress.value >= 70 && !showQuiz.value) { showQuiz.value = true; playing.value = false; clearInterval(progressInterval) }
    }, 200)
  } else if (progressInterval) clearInterval(progressInterval)
})
onUnmounted(() => { if (progressInterval) clearInterval(progressInterval) })

function answerQuiz(i) { selectedAnswer.value = i; quizCorrect.value = i === quiz.value.correct; quizAnswered.value = true }
function getQuizClass(i) {
  if (!quizAnswered.value) return 'bg-gray-50 hover:bg-teal-50 hover:text-teal-700'
  if (i === quiz.value.correct) return 'bg-teal-50 text-teal-700'
  if (i === selectedAnswer.value) return 'bg-red-50 text-red-700'
  return 'bg-gray-50 opacity-40'
}
function finishLesson() { store.completeModule(moduleId.value); coinTrigger.value++; confettiTrigger.value++; setTimeout(() => router.push('/academy'), 2000) }
</script>
