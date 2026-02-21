<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 text-white flex flex-col">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
      <div class="max-w-3xl mx-auto flex items-center justify-between">
        <button @click="confirmExit" class="text-sm text-gray-400 font-body hover:text-white transition-colors">← Exit RPG</button>
        <div class="flex items-center gap-3">
          <span class="text-xs px-3 py-1 rounded-full font-heading font-bold" :class="scenario?.tagClass || 'bg-gray-700 text-gray-300'">
            {{ scenario?.tag || 'RPG' }}
          </span>
          <div class="flex gap-0.5">
            <span v-for="i in 3" :key="i" class="text-sm" :class="i <= (scenario?.difficulty || 1) ? 'text-amber-400' : 'text-gray-700'">★</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 flex flex-col max-w-3xl mx-auto w-full px-6 py-6">
      <Transition name="slide" mode="out-in">
        <!-- Intro -->
        <div v-if="phase === 'intro'" key="intro" class="flex-1 flex flex-col items-center justify-center text-center animate-slide-up">
          <div class="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-white/10 rounded-3xl flex items-center justify-center mb-8">
            <span class="text-4xl">🌋</span>
          </div>
          <h1 class="font-heading text-3xl font-bold mb-4">{{ scenario?.title }}</h1>
          <p class="text-gray-400 font-body text-sm mb-4 max-w-md">{{ scenario?.description }}</p>
          <div v-if="scenario?.mysteryHint" class="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-6 py-3 mb-10 max-w-sm">
            <p class="text-xs text-amber-300 font-body italic">🕵️ {{ scenario.mysteryHint }}</p>
          </div>
          <button @click="phase = 'play'" class="px-10 py-4 bg-white text-gray-900 rounded-2xl font-heading font-bold text-sm hover:shadow-xl transition-all">
            Begin Mission →
          </button>
        </div>

        <!-- Gameplay -->
        <div v-else-if="phase === 'play'" key="play" class="flex-1 flex flex-col">
          <!-- Progress -->
          <div class="w-full h-1.5 bg-white/5 rounded-full mb-6 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-red-400 to-amber-400 rounded-full transition-all duration-500"
              :style="{ width: ((currentStep + 1) / steps.length * 100) + '%' }"></div>
          </div>

          <!-- Chat area -->
          <div class="flex-1 overflow-auto space-y-4 mb-6" ref="chatContainer">
            <!-- Narrative -->
            <div class="animate-slide-up">
              <div class="bg-white/5 rounded-2xl p-5 border border-white/5">
                <p class="text-xs text-gray-500 font-heading font-bold uppercase tracking-wider mb-2">Situation Report</p>
                <p class="font-body text-sm text-gray-300 leading-relaxed">{{ currentData.narrative }}</p>
              </div>
            </div>

            <!-- NPC dialogue -->
            <div class="flex items-start gap-3 animate-slide-up" style="animation-delay: 0.1s">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/30 to-teal-600/30 border border-teal-400/20 flex items-center justify-center text-lg flex-shrink-0">
                {{ scenario?.npcAvatar || '👤' }}
              </div>
              <div class="flex-1 bg-teal-500/10 border border-teal-500/10 rounded-2xl rounded-tl-md p-4">
                <p class="text-[10px] font-heading font-bold text-teal-400 mb-1">{{ scenario?.npcName }}</p>
                <p class="text-sm font-body text-gray-300 leading-relaxed">{{ currentData.npc }}</p>
                <span v-if="currentData.emotion" class="inline-block mt-2 text-xs bg-white/5 rounded-full px-3 py-1 text-gray-400">
                  {{ currentData.emotion }} {{ currentData.emotionLabel }}
                </span>
              </div>
            </div>

            <!-- Clue popup -->
            <div v-if="currentData.clue && showClue" class="animate-slide-up bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
              <p class="text-sm font-body text-amber-300">{{ currentData.clue }}</p>
            </div>

            <!-- User response (after selection) -->
            <div v-if="selectedOption !== null" class="flex justify-end animate-slide-up">
              <div class="max-w-[85%] bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl rounded-br-md p-4 shadow-lg">
                <p class="text-sm font-body text-white leading-relaxed">{{ currentData.options[selectedOption].text }}</p>
              </div>
            </div>

            <!-- Feedback -->
            <div v-if="selectedOption !== null" class="animate-slide-up" style="animation-delay: 0.1s">
              <div class="rounded-2xl p-4 border"
                :class="currentData.options[selectedOption].score >= 3 ? 'bg-green-500/10 border-green-500/20' : currentData.options[selectedOption].score >= 1 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm">{{ currentData.options[selectedOption].score >= 3 ? '✅' : currentData.options[selectedOption].score >= 1 ? '⚠️' : '❌' }}</span>
                  <span class="text-xs font-heading font-bold text-gray-400">
                    +{{ currentData.options[selectedOption].score }} pts
                  </span>
                </div>
                <p class="text-sm font-body text-gray-300">{{ currentData.options[selectedOption].feedback }}</p>
              </div>
            </div>
          </div>

          <!-- Options (before selection) -->
          <div v-if="selectedOption === null" class="space-y-3 pb-4 animate-slide-up" style="animation-delay: 0.2s">
            <p class="text-[10px] font-heading font-bold text-gray-500 uppercase tracking-wider mb-2">Choose your response</p>
            <button v-for="(opt, i) in currentData.options" :key="i" @click="selectOption(i)"
              class="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl font-body text-sm text-gray-300 transition-all hover:translate-x-1">
              {{ opt.text }}
            </button>
          </div>

          <!-- Next button (after selection) -->
          <div v-else class="pb-4">
            <button @click="nextStep"
              class="w-full py-4 bg-white text-gray-900 rounded-2xl font-heading font-bold text-sm hover:shadow-xl transition-all">
              {{ currentStep < steps.length - 1 ? 'Continue →' : 'Complete Mission →' }}
            </button>
          </div>
        </div>

        <!-- Results -->
        <div v-else-if="phase === 'results'" key="results" class="flex-1 flex flex-col items-center justify-center text-center animate-slide-up">
          <div class="w-20 h-20 bg-gradient-to-br from-green-400/20 to-teal-400/20 border border-green-400/20 rounded-3xl flex items-center justify-center mb-8">
            <span class="text-4xl">🎖️</span>
          </div>
          <h1 class="font-heading text-3xl font-bold mb-3">Mission Complete</h1>
          <p class="text-gray-400 font-body text-sm mb-2">{{ scenario?.title }}</p>
          <p class="font-heading text-4xl font-bold text-teal-400 mb-8">{{ totalScore }} / {{ maxScore }} pts</p>

          <div class="grid grid-cols-3 gap-4 w-full max-w-sm mb-10">
            <div class="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
              <p class="text-2xl mb-1">🎯</p>
              <p class="text-xs text-gray-400 font-body">Score</p>
              <p class="font-heading font-bold text-sm">{{ Math.round(totalScore / maxScore * 100) }}%</p>
            </div>
            <div class="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
              <p class="text-2xl mb-1">⭐</p>
              <p class="text-xs text-gray-400 font-body">XP Earned</p>
              <p class="font-heading font-bold text-sm">+120</p>
            </div>
            <div class="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
              <p class="text-2xl mb-1">🪙</p>
              <p class="text-xs text-gray-400 font-body">ResiCoins</p>
              <p class="font-heading font-bold text-sm">+25</p>
            </div>
          </div>

          <button @click="router.push('/academy')"
            class="w-full max-w-sm py-4 bg-white text-gray-900 rounded-2xl font-heading font-bold text-sm hover:shadow-xl transition-all">
            Back to Academy →
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'

const route = useRoute()
const router = useRouter()
const store = useResiliaStore()

const rpgId = route.params.id
const scenario = computed(() => store.disasterRPGScenarios[rpgId])
const steps = computed(() => scenario.value?.steps || [])
const maxScore = computed(() => steps.value.reduce((sum, s) => sum + Math.max(...s.options.map(o => o.score)), 0))

const phase = ref('intro')
const currentStep = ref(0)
const selectedOption = ref(null)
const totalScore = ref(0)
const showClue = ref(false)
const chatContainer = ref(null)

const currentData = computed(() => steps.value[currentStep.value] || {})

function selectOption(i) {
  selectedOption.value = i
  totalScore.value += currentData.value.options[i].score
  if (currentData.value.clue) {
    setTimeout(() => { showClue.value = true }, 500)
  }
  nextTick(() => {
    chatContainer.value?.scrollTo({ top: chatContainer.value.scrollHeight, behavior: 'smooth' })
  })
}

function nextStep() {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++
    selectedOption.value = null
    showClue.value = false
  } else {
    store.completeDisasterRPG(rpgId)
    phase.value = 'results'
  }
}

function confirmExit() {
  if (phase.value === 'play' && currentStep.value > 0) {
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
      router.push('/academy')
    }
  } else {
    router.push('/academy')
  }
}
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
