<template>
  <div class="max-w-3xl mx-auto" :class="{ 'quest-embedded': embedded }">
    <div v-if="!quest" class="text-center py-20">
      <p class="text-4xl mb-4">❌</p>
      <p class="text-gray-400 font-body">Quest not found.</p>
      <button v-if="embedded" @click="emit('close')" class="text-teal-500 font-heading font-bold text-sm mt-4 inline-block hover:underline">← Back to Academy</button>
      <RouterLink v-else to="/academy" class="text-teal-500 font-heading font-bold text-sm mt-4 inline-block hover:underline">← Back to Academy</RouterLink>
    </div>

    <div v-else>
      <!-- Start Screen -->
      <div v-if="!started" class="animate-slide-up">
        <button v-if="embedded" @click="emit('close')" class="text-xs text-gray-400 hover:text-teal-500 transition-colors font-heading mb-6 inline-block cursor-pointer">← Academy</button>
        <RouterLink v-else to="/academy" class="text-xs text-gray-400 hover:text-teal-500 transition-colors font-heading mb-6 inline-block">← Academy</RouterLink>
        <div class="bg-white dark:bg-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 text-center">
          <div class="text-6xl mb-6">{{ quest.cover || '⚔️' }}</div>
          <h1 class="font-heading text-2xl sm:text-3xl font-bold text-ink dark:text-white mb-2">{{ quest.title }}</h1>
          <p class="text-sm text-gray-400 font-body mb-1">{{ quest.location }}</p>
          <p v-if="quest.culturalElement" class="text-xs text-teal-500 font-heading font-bold mb-4">🎭 {{ quest.culturalElement }}</p>

          <!-- HP Display -->
          <div class="flex items-center justify-center gap-2 mb-4">
            <span class="text-sm font-heading text-red-400">HP:</span>
            <span v-for="i in store.MAX_QUEST_HP" :key="i" class="text-xl">{{ i <= store.questHP ? '❤️' : '🖤' }}</span>
          </div>

          <!-- Difficulty -->
          <div class="flex items-center justify-center gap-2 mb-6">
            <span class="text-xs text-gray-400 font-heading">Difficulty:</span>
            <span class="text-amber-400">{{ '★'.repeat(quest.difficulty || 1) }}</span>
            <span class="text-gray-600">{{ '☆'.repeat(Math.max(0, 9 - (quest.difficulty || 1))) }}</span>
          </div>

          <p class="text-sm text-gray-500 dark:text-gray-400 font-body mb-8 max-w-lg mx-auto leading-relaxed">
            {{ replaceNames(quest.description) }}
          </p>

          <div class="flex items-center justify-center gap-3 text-xs text-gray-400 font-body mb-8">
            <span>⚔️ {{ quest.steps.filter(s => !s.isAttentionTest).length }} decisions</span>
            <span>•</span>
            <span>❤️ {{ store.MAX_QUEST_HP }} HP</span>
            <span>•</span>
            <span>🔄 {{ store.MAX_RETRIES }} retries</span>
          </div>

          <button @click="startQuest" class="px-8 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-heading font-bold text-sm shadow-lg shadow-teal-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            Begin Quest →
          </button>
        </div>
      </div>

      <!-- Active Step -->
      <div v-else-if="currentStepIndex < quest.steps.length && !questFailed" class="animate-slide-up" :key="currentStepIndex">
        <!-- Top bar with HP -->
        <div class="flex items-center gap-3 mb-6">
          <button v-if="embedded" @click="emit('close')" class="text-xs text-gray-400 hover:text-teal-500 transition-colors font-heading cursor-pointer bg-transparent border-none">← Exit</button>
          <RouterLink v-else to="/academy" class="text-xs text-gray-400 hover:text-teal-500 transition-colors font-heading">← Exit</RouterLink>
          <div class="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500" :style="{ width: stepProgress + '%' }"></div>
          </div>
          <!-- HP hearts -->
          <div class="flex gap-0.5">
            <span v-for="i in store.MAX_QUEST_HP" :key="i" class="text-sm transition-all" :class="{ 'heart-lost': i > currentHP && heartLostIndex === i }">
              {{ i <= currentHP ? '❤️' : '🖤' }}
            </span>
          </div>
        </div>

        <!-- Attention Test -->
        <div v-if="currentStep.isAttentionTest" class="bg-red-50 dark:bg-red-900/20 rounded-3xl p-8 text-center border-2 border-red-200 dark:border-red-800/50">
          <p class="text-xs font-heading font-bold text-red-500 uppercase tracking-wider mb-4 animate-pulse">⚡ ATTENTION TEST ⚡</p>
          <p class="text-lg font-heading font-bold text-ink dark:text-white mb-6">{{ activeAttentionTest?.prompt }}</p>
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
              {{ attentionCorrect ? '✅ Correct! Quick reflexes!' : '❌ Wrong — you lost 1 HP!' }}
            </p>
            <button @click="nextStep" class="mt-4 px-6 py-2.5 bg-teal-500 text-white rounded-xl font-heading font-bold text-sm hover:bg-teal-600 transition-colors">
              Continue →
            </button>
          </div>
        </div>

        <!-- Story Step (Chat UI) -->
        <div v-else class="bg-[#FAFAF8] dark:bg-[#1A1714] w-full max-w-md mx-auto rounded-3xl overflow-hidden border border-amber-200/30 dark:border-amber-800/20 shadow-2xl flex flex-col h-[650px] max-h-[80vh]">
          <!-- Chat Header -->
          <div class="flex items-center gap-3 p-4 bg-[#F0EDE6] dark:bg-[#211E19] backdrop-blur-md border-b border-amber-200/20 dark:border-amber-800/15">
            <div class="w-10 h-10 rounded-full border border-amber-200/20 shadow-sm flex items-center justify-center relative flex-shrink-0 bg-[#F0EDE6] dark:bg-[#211E19]">
              <img src="../assets/icon.png" class="w-full h-full object-cover rounded-full" alt="Lia" />
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#F0EDE6] dark:border-[#211E19] rounded-full"></span>
            </div>
            <div>
              <p class="font-heading font-bold text-ink dark:text-white text-sm">Lia</p>
              <p class="text-[10px] text-green-500 font-body">online</p>
            </div>
            <div class="ml-auto text-xs font-heading font-bold px-2 py-1 rounded bg-teal-500/20 text-teal-600 dark:text-teal-400">
               {{ currentStepIndex + 1 }} / {{ quest.steps.length }}
            </div>
          </div>

          <!-- Chat Body -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-5">
            <!-- Narrative Pill -->
            <div v-if="currentStep.narrative" class="text-center my-2">
              <span class="inline-block bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-[11px] font-body px-4 py-2.5 rounded-2xl max-w-[95%] leading-relaxed italic border border-black/5 dark:border-white/5">
                {{ replaceNames(currentStep.narrative) }}
              </span>
            </div>

            <!-- Lia Message Bubble -->
            <div v-if="currentStep.npc" class="flex flex-col gap-1 items-start max-w-[85%] animate-slide-up">
              <div class="bg-[#E8E5DE] dark:bg-[#2A2620] text-ink dark:text-[#E8E0D4] px-4 py-3 rounded-2xl rounded-tl-sm text-sm font-body leading-relaxed relative border border-gray-200/50 dark:border-amber-800/20">
                <span v-if="currentStep.emotionLabel" class="text-[9px] text-teal-600 dark:text-teal-400 font-bold block mb-1 uppercase tracking-wider">{{ currentStep.emotionLabel }}</span>
                {{ replaceNames(currentStep.npc) }}
                <span v-if="currentStep.emotion" class="absolute -top-3 -right-3 text-2xl drop-shadow-md">{{ currentStep.emotion }}</span>
              </div>
            </div>

            <!-- Clue Pill -->
            <div v-if="currentStep.clue" class="text-center my-2 animate-slide-up" style="animation-delay: 0.1s">
              <span class="inline-block bg-amber-500/10 text-amber-500 dark:text-amber-400 text-[11px] font-body px-4 py-2 rounded-2xl max-w-[90%] border border-amber-500/20">
                💡 {{ replaceNames(currentStep.clue) }}
              </span>
            </div>

            <!-- User Response Bubble -->
            <div v-if="stepAnswered && selectedOption !== null" class="flex flex-col gap-1 items-end self-end max-w-[85%] mt-2 animate-slide-up">
               <div class="bg-gradient-to-br from-teal-500 to-teal-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm font-body leading-relaxed shadow-lg shadow-teal-500/20">
                  {{ replaceNames(selectedOption.text) }}
               </div>
            </div>

            <!-- Feedback Bubble (from Lia) -->
            <div v-if="stepAnswered && selectedOption" class="flex flex-col gap-1 items-start max-w-[85%] mt-2 animate-slide-up" style="animation-delay: 0.1s">
              <div class="bg-[#E8E5DE] dark:bg-[#2A2620] text-ink dark:text-white px-4 py-3 rounded-2xl rounded-tl-sm text-sm font-body leading-relaxed border"
                :class="selectedOption.score >= 3 ? 'border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.15)]' : selectedOption.score >= 1 ? 'border-amber-500/50' : 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]'">
                 <div class="flex items-center gap-1.5 mb-1.5 border-b border-black/10 dark:border-white/10 pb-1.5">
                    <span class="text-sm shadow-none">{{ selectedOption.score >= 3 ? '🌟' : selectedOption.score >= 1 ? '🤔' : '💔' }}</span>
                    <span class="text-[10px] font-heading font-bold uppercase tracking-wider" :class="selectedOption.score >= 3 ? 'text-teal-600 dark:text-teal-400' : selectedOption.score >= 1 ? 'text-amber-500 dark:text-amber-400' : 'text-red-500 dark:text-red-400'">
                      {{ selectedOption.score >= 3 ? 'Excellent (+3)' : selectedOption.score >= 1 ? 'Partial (+1)' : 'Missed (-1 HP)' }}
                    </span>
                 </div>
                 <p class="text-gray-600 dark:text-gray-200">{{ replaceNames(selectedOption.feedback) }}</p>
              </div>
            </div>
          </div>

          <!-- Bottom Choices Area -->
          <div class="p-4 bg-[#F0EDE6]/95 dark:bg-[#211E19]/95 border-t border-amber-200/20 dark:border-amber-800/15 backdrop-blur-md shrink-0">
            <div v-if="!stepAnswered" class="flex flex-col gap-2.5">
              <p class="text-[10px] font-heading font-bold text-gray-500 uppercase tracking-wider text-center mb-1">Your Response</p>
              <button v-for="(opt, oi) in currentStep.options" :key="oi"
                @click="selectOption(oi)"
                class="w-full text-left p-3.5 rounded-xl transition-all border border-teal-500/30 hover:border-teal-400 bg-teal-500/10 hover:bg-teal-500/20 text-teal-800 dark:text-teal-50 text-sm font-body leading-relaxed">
                {{ replaceNames(opt.text) }}
              </button>
            </div>

            <!-- Continue button after answering -->
            <div v-if="stepAnswered" class="flex justify-center w-full mt-2">
              <button @click="nextStep"
                class="w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-heading font-bold text-sm shadow-md shadow-teal-500/20">
                {{ currentStepIndex < quest.steps.length - 1 ? 'Continue →' : 'Complete Quest ✨' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quest Failed -->
      <div v-else-if="questFailed" class="text-center animate-slide-up">
        <div class="bg-white dark:bg-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-red-800/30">
          <div class="text-6xl mb-6">💀</div>
          <h2 class="font-heading text-2xl sm:text-3xl font-bold text-red-500 mb-3">Quest Failed!</h2>
          <p class="text-sm text-gray-400 font-body mb-4">You ran out of HP.</p>

          <!-- Hearts shattered -->
          <div class="flex justify-center gap-2 mb-6">
            <span v-for="i in store.MAX_QUEST_HP" :key="i" class="text-2xl">🖤</span>
          </div>

          <p class="text-xs text-gray-500 font-body mb-6">
            Retries remaining: <strong class="text-amber-400">{{ retriesLeft }}</strong>
          </p>

          <div class="flex justify-center gap-3">
            <button v-if="retriesLeft > 0" @click="retryQuest"
              class="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-heading font-bold text-sm hover:shadow-lg transition-all">
              🔄 Retry Quest ({{ retriesLeft }} left)
            </button>
            <button v-else-if="embedded" @click="emit('close')"
              class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-heading font-bold text-sm">
              📺 Rewatch Videos First
            </button>
            <RouterLink v-else to="/academy"
              class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-heading font-bold text-sm">
              📺 Rewatch Videos First
            </RouterLink>
            <button v-if="embedded" @click="emit('close')" class="px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl font-heading font-bold text-sm hover:bg-gray-300 transition-all">
              ← Back
            </button>
            <RouterLink v-else to="/academy" class="px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl font-heading font-bold text-sm hover:bg-gray-300 transition-all">
              ← Back
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Quest Complete -->
      <div v-else class="text-center animate-slide-up">
        <div class="bg-white dark:bg-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50">
          <div class="text-6xl mb-6 quest-trophy">🏆</div>
          <h2 class="font-heading text-2xl sm:text-3xl font-bold text-ink dark:text-white mb-3">Quest Complete!</h2>
          <p class="text-sm text-gray-400 font-body mb-6">{{ quest.title }}</p>

          <!-- HP remaining -->
          <div class="flex justify-center gap-2 mb-6">
            <span v-for="i in store.MAX_QUEST_HP" :key="i" class="text-xl">{{ i <= currentHP ? '❤️' : '🖤' }}</span>
          </div>

          <div class="inline-flex items-center gap-4 bg-gray-50 dark:bg-slate-700/30 rounded-2xl p-5 mb-8">
            <div class="text-center">
              <p class="font-heading text-2xl font-bold text-teal-600 dark:text-teal-400">{{ totalScore }}</p>
              <p class="text-[10px] text-gray-400 font-body mt-0.5">Score</p>
            </div>
            <div class="w-px h-10 bg-gray-200 dark:bg-slate-600"></div>
            <div class="text-center">
              <p class="font-heading text-2xl font-bold text-orange-500">+200</p>
              <p class="text-[10px] text-gray-400 font-body mt-0.5">XP Earned</p>
            </div>
            <div class="w-px h-10 bg-gray-200 dark:bg-slate-600"></div>
            <div class="text-center">
              <p class="font-heading text-2xl font-bold text-amber-500">+40</p>
              <p class="text-[10px] text-gray-400 font-body mt-0.5">ResiCoins</p>
            </div>
          </div>
          <div class="flex justify-center gap-3">
            <button v-if="embedded" @click="handleQuestComplete" class="px-6 py-3 bg-teal-500 text-white rounded-xl font-heading font-bold text-sm hover:bg-teal-600 transition-colors">
              ← Back to Academy
            </button>
            <RouterLink v-else to="/academy" class="px-6 py-3 bg-teal-500 text-white rounded-xl font-heading font-bold text-sm hover:bg-teal-600 transition-colors">
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

const props = defineProps({
  propQuestId: { type: String, default: '' },
  embedded: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const route = useRoute()
const store = useResiliaStore()

const questId = props.propQuestId || route.params.id
const quest = computed(() => store.chapterQuests?.[questId])

const started = ref(false)
const currentStepIndex = ref(0)
const stepAnswered = ref(false)
const selectedOption = ref(null)
const totalScore = ref(0)
const currentHP = ref(store.MAX_QUEST_HP)
const questFailed = ref(false)
const heartLostIndex = ref(-1)

// Attention test state
const attentionAnswered = ref(false)
const attentionCorrect = ref(false)
const attentionTimer = ref(0)
let timerInterval = null

const retriesLeft = computed(() => store.getQuestRetries(questId))

const currentStep = computed(() => quest.value?.steps[currentStepIndex.value])
const stepProgress = computed(() => ((currentStepIndex.value + 1) / (quest.value?.steps.length || 1)) * 100)

const activeAttentionTest = computed(() => {
  if (!currentStep.value?.isAttentionTest) return null
  return quest.value.attentionTests?.find(t => t.id === currentStep.value.attentionTestId)
})

function replaceNames(text) {
  if (!text) return ''
  return text.replace(/\{Name\}/g, store.userName || 'Responder')
}

function startQuest() {
  store.resetQuestHP()
  currentHP.value = store.MAX_QUEST_HP
  started.value = true
}

function loseHP() {
  currentHP.value--
  heartLostIndex.value = currentHP.value + 1
  store.damageQuestHP()
  setTimeout(() => { heartLostIndex.value = -1 }, 600)

  if (currentHP.value <= 0) {
    questFailed.value = true
  }
}

function selectOption(index) {
  selectedOption.value = currentStep.value.options[index]
  totalScore.value += selectedOption.value.score
  stepAnswered.value = true

  // HP damage for wrong answers (score 0)
  if (selectedOption.value.score === 0) {
    loseHP()
  }
}

function answerAttentionTest(index) {
  if (attentionAnswered.value) return
  attentionAnswered.value = true
  attentionCorrect.value = index === activeAttentionTest.value.correct
  if (attentionCorrect.value) {
    totalScore.value += 2
  } else {
    loseHP()
  }
  if (timerInterval) clearInterval(timerInterval)
}

function getAttentionClass(index) {
  if (!attentionAnswered.value) return 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-red-300 dark:hover:border-red-500 text-ink dark:text-white'
  if (index === activeAttentionTest.value.correct) return 'bg-teal-50 dark:bg-teal-900/30 border-2 border-teal-500 text-teal-700 dark:text-teal-400'
  return 'bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-400 opacity-50'
}

function nextStep() {
  if (questFailed.value) return

  stepAnswered.value = false
  attentionAnswered.value = false
  attentionCorrect.value = false
  selectedOption.value = null
  currentStepIndex.value++

  // Start attention test timer
  const next = quest.value?.steps[currentStepIndex.value]
  if (next?.isAttentionTest) {
    const test = quest.value.attentionTests?.find(t => t.id === next.attentionTestId)
    if (test) {
      attentionTimer.value = test.timeLimit
      timerInterval = setInterval(() => {
        attentionTimer.value--
        if (attentionTimer.value <= 0) {
          clearInterval(timerInterval)
          if (!attentionAnswered.value) {
            attentionAnswered.value = true
            attentionCorrect.value = false
            loseHP()
          }
        }
      }, 1000)
    }
  }

  // Complete quest when done
  if (currentStepIndex.value >= quest.value.steps.length) {
    store.completeChapterQuest(questId, totalScore.value)
  }
}

function retryQuest() {
  store.useQuestRetry(questId)
  currentStepIndex.value = 0
  totalScore.value = 0
  questFailed.value = false
  started.value = false
  currentHP.value = store.MAX_QUEST_HP
}

function handleQuestComplete() {
  emit('close')
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
.quest-embedded {
  max-width: 100%;
  height: 100%;
  overflow-y: auto;
}

.heart-lost {
  animation: heartShatter 0.4s ease-out;
}
@keyframes heartShatter {
  0% { transform: scale(1); }
  50% { transform: scale(1.5); filter: hue-rotate(180deg); }
  100% { transform: scale(0.8); }
}

.quest-trophy {
  animation: trophyBounce 0.6s ease-out;
}
@keyframes trophyBounce {
  0% { transform: scale(0) rotate(-10deg); }
  50% { transform: scale(1.3) rotate(5deg); }
  100% { transform: scale(1) rotate(0); }
}
</style>
