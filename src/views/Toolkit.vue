<template>
  <div>
    <div v-motion class="mb-10 sm:mb-12">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <PhToolbox :size="22" class="text-white" weight="fill" />
        </div>
        <div>
          <h1 class="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-ink dark:text-white leading-tight">{{ t('toolkit.title') }}</h1>
          <p class="text-gray-400 font-body text-sm sm:text-base mt-0.5">{{ t('toolkit.desc') }}</p>
        </div>
      </div>
    </div>

    <!-- Interactive Tools -->
    <div v-motion class="mb-8 sm:mb-10" style="animation-delay: 0.03s">
      <h2 class="font-heading text-lg font-bold text-ink dark:text-white mb-5 flex items-center gap-2">
        <span class="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-sm"><PhTarget :size="16" weight="fill" class="text-teal-500" /></span>
        {{ t('toolkit.interactiveTools') }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">

        <!-- Calm Breathing -->
        <div class="bg-white dark:bg-slate-800/80 rounded-2xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 text-center">
          <p class="text-[10px] font-heading font-bold text-teal-500 uppercase tracking-wider mb-2">{{ t('toolkit.calmBreathing') }}</p>
          <p class="text-[10px] text-gray-400 font-body mb-4">{{ t('toolkit.calmBreathingDesc') }}</p>
          <div class="relative w-36 h-36 mx-auto mb-4">
            <div class="absolute inset-0 rounded-full transition-all duration-1000 ease-in-out flex items-center justify-center"
              :class="breathingActive ? 'bg-gradient-to-br from-teal-400/20 to-cyan-400/20' : 'bg-gray-50 dark:bg-slate-700'"
              :style="{ transform: `scale(${breathScale})` }">
              <div class="text-center">
                <p class="font-heading font-bold text-sm" :class="breathingActive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'">{{ breathPhaseLabel }}</p>
                <p v-if="breathingActive" class="text-2xl font-heading font-bold text-teal-600 dark:text-teal-400 mt-1">{{ breathTimer }}</p>
              </div>
            </div>
            <svg v-if="breathingActive" class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 144 144">
              <circle cx="72" cy="72" r="68" fill="none" stroke="currentColor" stroke-width="3" class="text-gray-100 dark:text-slate-700" />
              <circle cx="72" cy="72" r="68" fill="none" stroke="currentColor" stroke-width="3" class="text-teal-500"
                :stroke-dasharray="427" :stroke-dashoffset="427 - (427 * breathProgress)" stroke-linecap="round"
                style="transition: stroke-dashoffset 1s linear" />
            </svg>
          </div>
          <button @click="toggleBreathing"
            class="px-5 py-2.5 rounded-xl font-heading font-bold text-xs transition-all"
            :class="breathingActive ? 'bg-red-50 dark:bg-red-900/30 text-red-500' : 'bg-teal-500 text-white hover:bg-teal-600 shadow-md shadow-teal-500/20'">
            {{ breathingActive ? t('toolkit.btnStop') : t('toolkit.btnStartBreathing') }}
          </button>
          <p class="text-[9px] text-gray-400 font-body mt-2">{{ t('toolkit.sessionsText').replace('{count}', store.breathingSessions) }}</p>
        </div>

        <!-- 5-4-3-2-1 Grounding -->
        <div class="bg-white dark:bg-slate-800/80 rounded-2xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 text-center">
          <p class="text-[10px] font-heading font-bold text-purple-500 uppercase tracking-wider mb-2">{{ t('toolkit.grounding') }}</p>
          <p class="text-[10px] text-gray-400 font-body mb-4">{{ t('toolkit.groundingDesc') }}</p>
          <div v-if="!groundingActive" class="space-y-2 mb-4">
            <div v-for="step in groundingSteps" :key="step.count" class="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/50">
              <span class="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-400">{{ step.count }}</span>
              <span class="text-[10px] text-gray-600 dark:text-gray-300 font-body text-left">{{ step.label }}</span>
            </div>
          </div>
          <div v-else class="mb-4">
            <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <p class="text-3xl mb-2">{{ groundingSteps[groundingStep].emoji }}</p>
              <p class="font-heading font-bold text-purple-700 dark:text-purple-300 text-base mb-1">{{ groundingSteps[groundingStep].count }}</p>
              <p class="text-xs text-purple-600 dark:text-purple-400 font-body">{{ groundingSteps[groundingStep].prompt }}</p>
            </div>
            <div class="flex justify-center gap-1.5 mt-3">
              <div v-for="(_, i) in groundingSteps" :key="i" class="h-1.5 rounded-full transition-all" :class="i <= groundingStep ? 'bg-purple-500 w-5' : 'bg-gray-200 dark:bg-slate-600 w-1.5'"></div>
            </div>
          </div>
          <button @click="toggleGrounding"
            class="px-5 py-2.5 rounded-xl font-heading font-bold text-xs transition-all"
            :class="groundingActive ? (groundingStep >= 4 ? 'bg-teal-500 text-white' : 'bg-purple-500 text-white') : 'bg-purple-500 text-white hover:bg-purple-600 shadow-md shadow-purple-500/20'">
            {{ groundingActive ? (groundingStep >= 4 ? t('toolkit.btnFinish') : t('toolkit.btnNext')) : t('toolkit.btnStartExercise') }}
          </button>
          <p class="text-[9px] text-gray-400 font-body mt-2">{{ t('toolkit.sessionsText').replace('{count}', store.groundingSessions) }}</p>
        </div>

        <!-- Quick Mood Log -->
        <div class="bg-white dark:bg-slate-800/80 rounded-2xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 text-center">
          <p class="text-[10px] font-heading font-bold text-orange-500 uppercase tracking-wider mb-2">{{ t('toolkit.moodLog') }}</p>
          <p class="text-[10px] text-gray-400 font-body mb-4">{{ t('toolkit.moodDesc') }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 font-body mb-3">{{ t('toolkit.moodPrompt') }}</p>
          <div class="flex justify-center gap-2.5 mb-4">
            <button v-for="mood in moods" :key="mood.emoji" @click="logMood(mood)"
              class="w-10 h-10 rounded-lg text-xl hover:scale-110 transition-all active:scale-95"
              :class="selectedMood === mood.emoji ? 'bg-orange-100 dark:bg-orange-900/30 ring-2 ring-orange-400 scale-110' : 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600'">
              {{ mood.emoji }}
            </button>
          </div>
          <div v-if="moodLogged" class="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 mb-3">
            <p class="text-xs font-heading font-bold text-teal-600 dark:text-teal-400">{{ t('toolkit.moodLogged') }} {{ selectedMood }}</p>
          </div>
          <div v-if="store.moodLogs.length > 0" class="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
            <p class="text-[9px] font-heading font-bold text-gray-300 dark:text-gray-500 uppercase tracking-wider mb-2">{{ t('toolkit.recent') }}</p>
            <div class="flex justify-center gap-1.5">
              <div v-for="log in store.moodLogs.slice(0, 7)" :key="log.date + log.time"
                class="w-7 h-7 rounded-md bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-sm" :title="log.date">
                {{ log.emoji }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NEW: Expanded tools row -->
    <div v-motion class="mb-8 sm:mb-10" style="animation-delay: 0.06s">
      <h2 class="font-heading text-lg font-bold text-ink dark:text-white mb-5">{{ t('toolkit.wellnessStudio') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

        <!-- Guided Meditation Timer -->
        <div class="bg-white dark:bg-slate-800/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 text-center">
          <p class="text-[10px] font-heading font-bold text-cyan-500 uppercase tracking-wider mb-2">{{ t('toolkit.meditation') }}</p>
          <p class="text-[10px] text-gray-400 font-body mb-3">{{ t('toolkit.meditationDesc') }}</p>
          <div class="text-3xl font-heading font-bold mb-3" :class="meditating ? 'text-cyan-500' : 'text-gray-300 dark:text-gray-600'">
            {{ medMinutes }}:{{ medSeconds }}
          </div>
          <div class="flex justify-center gap-2 mb-3">
            <button v-for="t in medTimes" :key="t" @click="medDuration = t; medRemaining = t * 60"
              class="px-2.5 py-1 rounded-md text-[10px] font-heading font-bold transition-all"
              :class="medDuration === t ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'">
              {{ t }}m
            </button>
          </div>
          <button @click="toggleMeditation"
            class="px-5 py-2 rounded-xl font-heading font-bold text-xs transition-all"
            :class="meditating ? 'bg-red-50 dark:bg-red-900/30 text-red-500' : 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-md shadow-cyan-500/20'">
            {{ meditating ? t('toolkit.btnStopIcon') : t('toolkit.btnStartIcon') }}
          </button>
        </div>

        <!-- Positive Affirmations -->
        <div class="bg-white dark:bg-slate-800/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 text-center">
          <p class="text-[10px] font-heading font-bold text-pink-500 uppercase tracking-wider mb-2">{{ t('toolkit.affirmations') }}</p>
          <p class="text-[10px] text-gray-400 font-body mb-3">{{ t('toolkit.affirmationsDesc') }}</p>
          <div class="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4 min-h-[80px] flex items-center justify-center mb-3">
            <p class="text-sm font-body italic text-pink-700 dark:text-pink-300 leading-relaxed">
              "{{ currentAffirmation }}"
            </p>
          </div>
          <button @click="nextAffirmation" class="px-5 py-2 rounded-xl bg-pink-500 text-white font-heading font-bold text-xs hover:bg-pink-600 transition-all shadow-md shadow-pink-500/20">
            <PhSparkle :size="14" weight="fill" class="inline" /> {{ t('toolkit.btnNewAff') }}
          </button>
        </div>

        <!-- Emotion Wheel -->
        <div class="bg-white dark:bg-slate-800/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 text-center">
          <p class="text-[10px] font-heading font-bold text-amber-500 uppercase tracking-wider mb-2">{{ t('toolkit.emotionWheel') }}</p>
          <p class="text-[10px] text-gray-400 font-body mb-3">{{ t('toolkit.emotionDesc') }}</p>
          <div class="grid grid-cols-3 gap-1.5 mb-3">
            <button v-for="e in emotionWheel" :key="e.name" @click="selectEmotion(e)"
              class="p-2 rounded-lg text-center transition-all hover:scale-105"
              :class="selectedEmotion === e.name ? 'ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-slate-700/50'">
              <span class="text-lg">{{ e.emoji }}</span>
              <p class="text-[8px] font-body text-gray-500 dark:text-gray-400 mt-0.5">{{ e.name }}</p>
            </button>
          </div>
          <p v-if="selectedEmotion" class="text-[10px] text-amber-600 dark:text-amber-400 font-body italic">
            {{ emotionWheel.find(e => e.name === selectedEmotion)?.tip }}
          </p>
        </div>

        <!-- Quick Journal -->
        <div class="bg-white dark:bg-slate-800/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50">
          <p class="text-[10px] font-heading font-bold text-emerald-500 uppercase tracking-wider mb-2 text-center">{{ t('toolkit.quickJournal') }}</p>
          <p class="text-[10px] text-gray-400 font-body mb-3 text-center">{{ t('toolkit.journalDesc') }}</p>
          <textarea v-model="journalEntry" rows="3" :placeholder="t('toolkit.journalPlaceholder')"
            class="w-full p-3 bg-gray-50 dark:bg-slate-700/50 dark:text-white rounded-lg text-xs font-body focus:outline-none focus:ring-2 focus:ring-emerald-400/50 resize-none mb-2"></textarea>
          <button @click="saveJournal" :disabled="!journalEntry.trim()"
            class="w-full py-2 rounded-lg bg-emerald-500 text-white font-heading font-bold text-xs hover:bg-emerald-600 transition-all disabled:opacity-30 shadow-sm">
            {{ journalSaved ? t('toolkit.btnSaved') : t('toolkit.btnSaveEntry') }}
          </button>
          <p class="text-[9px] text-gray-400 font-body mt-1.5 text-center">{{ t('toolkit.entriesWritten').replace('{count}', journalEntries.length) }}</p>
        </div>

        <!-- Sleep Hygiene Guide -->
        <div class="bg-white dark:bg-slate-800/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 text-center">
          <p class="text-[10px] font-heading font-bold text-indigo-500 uppercase tracking-wider mb-2">{{ t('toolkit.sleepHygiene') }}</p>
          <p class="text-[10px] text-gray-400 font-body mb-3">{{ t('toolkit.sleepDesc') }}</p>
          <div class="space-y-2 mb-3 text-left">
            <div v-for="(tip, i) in sleepTips" :key="i" class="flex items-start gap-2 p-2 rounded-lg transition-all"
              :class="checkedSleepTips.includes(i) ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-gray-50 dark:bg-slate-700/50'">
              <button @click="toggleSleepTip(i)" class="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] transition-all"
                :class="checkedSleepTips.includes(i) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300 dark:border-slate-600'">
                {{ checkedSleepTips.includes(i) ? '✓' : '' }}
              </button>
              <span class="text-[10px] font-body leading-relaxed" :class="checkedSleepTips.includes(i) ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'">{{ tip }}</span>
            </div>
          </div>
          <p class="text-[9px] text-indigo-500 font-heading font-bold">{{ t('toolkit.habitsPracticed').replace('{done}', checkedSleepTips.length).replace('{total}', sleepTips.length) }}</p>
        </div>
      </div>
    </div>

    <!-- Emergency Contacts by ASEAN Country -->
    <div v-motion class="mb-8 sm:mb-10" style="animation-delay: 0.08s">
      <h2 class="font-heading text-lg font-bold text-ink dark:text-white mb-5">{{ t('toolkit.emergencyContacts') }} <PhSiren :size="16" weight="fill" class="inline text-red-500" /></h2>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div v-for="r in store.regionData" :key="r.code" class="bg-white dark:bg-slate-800/80 rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 text-center">
          <img :src="r.flag" class="w-6 h-auto inline-block rounded-sm shadow-sm" alt="Flag" />
          <p class="text-[10px] font-heading font-bold text-ink dark:text-white">{{ r.country }}</p>
          <p class="text-sm font-heading font-bold text-red-500 mt-1">{{ r.emergencyHotline }}</p>
        </div>
      </div>
    </div>

    <!-- Free Resources -->
    <div v-motion style="animation-delay: 0.1s">
      <h2 class="font-heading text-lg font-bold text-ink dark:text-white mb-5">{{ t('toolkit.freeResources') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button v-for="item in store.toolkitItems" :key="item.id" @click="openResource(item)"
          class="bg-white dark:bg-slate-800/80 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 hover:shadow-md transition-all group text-left">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-xl flex-shrink-0">{{ item.icon }}</div>
            <div class="min-w-0">
              <h3 class="font-heading font-bold text-xs text-ink dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{{ item.name }}</h3>
              <p class="text-[10px] text-gray-400 font-body mt-0.5">{{ item.description }}</p>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-[9px] font-heading font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-1.5 py-0.5 rounded">{{ t('toolkit.free') }}</span>
                <span class="text-[9px] text-gray-400 font-body">{{ item.partner }}</span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Resource detail modal -->
    <Teleport to="body">
      <div v-if="activeResource" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="activeResource = null">
        <div v-motion class="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-2xl">{{ activeResource.icon }}</div>
            <div>
              <h3 class="font-heading font-bold text-base text-ink dark:text-white">{{ activeResource.name }}</h3>
              <p class="text-[10px] text-gray-400 font-body">{{ activeResource.partner }}</p>
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300 font-body mb-4 leading-relaxed">{{ activeResource.description }}</p>
          <div class="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4 mb-5">
            <p class="text-xs text-teal-700 dark:text-teal-300 font-body">
              <PhPhone :size="14" weight="fill" class="inline" /> {{ t('toolkit.contactProvider').replace('{category}', activeResource.category) }}
            </p>
          </div>
          <button @click="activeResource = null" class="w-full py-3 rounded-xl bg-teal-500 text-white font-heading font-bold text-sm hover:bg-teal-600 transition-colors">{{ t('toolkit.btnClose') }}</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useResiliaStore } from '../stores/resiliaStore'
import { PhToolbox, PhTarget, PhSparkle, PhSiren, PhPhone } from '@phosphor-icons/vue'
import { useI18n } from '../i18n'

const store = useResiliaStore()
const { t } = useI18n()

// ── Breathing ──
const breathingActive = ref(false)
const breathPhase = ref('idle')
const breathTimer = ref(0)
const breathScale = ref(1)
const breathProgress = ref(0)
let breathInterval = null

const breathPhaseLabel = computed(() => {
  switch(breathPhase.value) {
    case 'inhale': return t('toolkit.breathIn')
    case 'hold': return t('toolkit.breathHold')
    case 'exhale': return t('toolkit.breathOut')
    default: return t('toolkit.breathReady')
  }
})

function toggleBreathing() { breathingActive.value ? stopBreathing() : startBreathing() }
function startBreathing() {
  breathingActive.value = true; breathPhase.value = 'inhale'; breathTimer.value = 4; breathScale.value = 1; breathProgress.value = 0; runBreathCycle()
}
function runBreathCycle() {
  const phases = [{ name: 'inhale', duration: 4, scaleEnd: 1.3 }, { name: 'hold', duration: 7, scaleEnd: 1.3 }, { name: 'exhale', duration: 8, scaleEnd: 1 }]
  let phaseIdx = 0, elapsed = 0, totalCycle = 19
  breathInterval = setInterval(() => {
    if (!breathingActive.value) { clearInterval(breathInterval); return }
    const phase = phases[phaseIdx]; elapsed++
    breathTimer.value = phase.duration - (elapsed % (phase.duration + 1))
    breathProgress.value = elapsed / totalCycle
    if (elapsed >= phase.duration) {
      phaseIdx++; elapsed = 0
      if (phaseIdx >= phases.length) { phaseIdx = 0; breathProgress.value = 0; store.logBreathingSession() }
      breathPhase.value = phases[phaseIdx].name
      breathScale.value = phases[phaseIdx].name === 'exhale' ? 1 : 1.3
      breathTimer.value = phases[phaseIdx].duration
    }
  }, 1000)
}
function stopBreathing() {
  breathingActive.value = false; breathPhase.value = 'idle'; breathTimer.value = 0; breathScale.value = 1; breathProgress.value = 0
  if (breathInterval) clearInterval(breathInterval)
}

// ── Grounding ──
const groundingActive = ref(false)
const groundingStep = ref(0)
const groundingSteps = computed(() => [
  { count: '5', label: t('toolkit.g1Label'), emoji: '👀', prompt: t('toolkit.g1Prompt') },
  { count: '4', label: t('toolkit.g2Label'), emoji: '✋', prompt: t('toolkit.g2Prompt') },
  { count: '3', label: t('toolkit.g3Label'), emoji: '👂', prompt: t('toolkit.g3Prompt') },
  { count: '2', label: t('toolkit.g4Label'), emoji: '👃', prompt: t('toolkit.g4Prompt') },
  { count: '1', label: t('toolkit.g5Label'), emoji: '👅', prompt: t('toolkit.g5Prompt') },
])
function toggleGrounding() {
  if (!groundingActive.value) { groundingActive.value = true; groundingStep.value = 0 }
  else if (groundingStep.value >= 4) { groundingActive.value = false; groundingStep.value = 0; store.logGroundingSession() }
  else { groundingStep.value++ }
}

// ── Mood ──
const moods = [{ emoji: '😊', label: 'Happy' }, { emoji: '😌', label: 'Calm' }, { emoji: '😐', label: 'Neutral' }, { emoji: '😔', label: 'Sad' }, { emoji: '😰', label: 'Anxious' }]
const selectedMood = computed(() => store.moodLogs[0]?.emoji || null)
const moodLogged = ref(false)
function logMood(mood) {
  const success = store.logMood(mood.emoji)
  if (success) {
    moodLogged.value = true
    setTimeout(() => { moodLogged.value = false }, 2000)
  }
}

// ── Guided Meditation Timer ──
const medTimes = [1, 3, 5, 10]
const medDuration = ref(3)
const medRemaining = ref(180)
const meditating = ref(false)
let medInterval = null
const medMinutes = computed(() => String(Math.floor(medRemaining.value / 60)).padStart(2, '0'))
const medSeconds = computed(() => String(medRemaining.value % 60).padStart(2, '0'))
function toggleMeditation() {
  if (meditating.value) { clearInterval(medInterval); meditating.value = false; medRemaining.value = medDuration.value * 60 }
  else { meditating.value = true; medRemaining.value = medDuration.value * 60; medInterval = setInterval(() => { if (medRemaining.value <= 0) { clearInterval(medInterval); meditating.value = false } else { medRemaining.value-- } }, 1000) }
}

// ── Affirmations ──
const affirmations = computed(() => [
  t('toolkit.aff0'), t('toolkit.aff1'), t('toolkit.aff2'), t('toolkit.aff3'),
  t('toolkit.aff4'), t('toolkit.aff5'), t('toolkit.aff6'), t('toolkit.aff7'),
  t('toolkit.aff8'), t('toolkit.aff9'), t('toolkit.aff10'), t('toolkit.aff11'),
])
const affirmationIdx = ref(Math.floor(Math.random() * 12))
const currentAffirmation = computed(() => affirmations.value[affirmationIdx.value])
function nextAffirmation() { affirmationIdx.value = (affirmationIdx.value + 1) % affirmations.value.length }

// ── Emotion Wheel ──
const emotionWheel = computed(() => [
  { emoji: '😡', name: t('toolkit.emo1Name'), tip: t('toolkit.emo1Tip') },
  { emoji: '😢', name: t('toolkit.emo2Name'), tip: t('toolkit.emo2Tip') },
  { emoji: '😨', name: t('toolkit.emo3Name'), tip: t('toolkit.emo3Tip') },
  { emoji: '😊', name: t('toolkit.emo4Name'), tip: t('toolkit.emo4Tip') },
  { emoji: '🫢', name: t('toolkit.emo5Name'), tip: t('toolkit.emo5Tip') },
  { emoji: '🤢', name: t('toolkit.emo6Name'), tip: t('toolkit.emo6Tip') },
  { emoji: '😌', name: t('toolkit.emo7Name'), tip: t('toolkit.emo7Tip') },
  { emoji: '😤', name: t('toolkit.emo8Name'), tip: t('toolkit.emo8Tip') },
  { emoji: '🥰', name: t('toolkit.emo9Name'), tip: t('toolkit.emo9Tip') },
])
const selectedEmotion = computed(() => {
  const lastEmoji = store.moodLogs[0]?.emoji
  if (!lastEmoji) return null
  const found = emotionWheel.value.find(e => e.emoji === lastEmoji)
  return found ? found.name : null
})
function selectEmotion(e) { store.logMood(e.emoji) }

// ── Journal ──
const journalEntry = ref('')
const journalSaved = ref(false)
const journalEntries = ref(JSON.parse(localStorage.getItem('resilia_journal') || '[]'))
function saveJournal() {
  if (!journalEntry.value.trim()) return
  journalEntries.value.unshift({ text: journalEntry.value, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() })
  localStorage.setItem('resilia_journal', JSON.stringify(journalEntries.value))
  journalEntry.value = ''; journalSaved.value = true
  setTimeout(() => { journalSaved.value = false }, 2000)
}

// ── Free Resources ──
const activeResource = ref(null)
function openResource(item) { activeResource.value = item }

// ── Sleep Hygiene ──
const sleepTips = computed(() => [
  t('toolkit.sleep1'),
  t('toolkit.sleep2'),
  t('toolkit.sleep3'),
  t('toolkit.sleep4'),
  t('toolkit.sleep5'),
])
const checkedSleepTips = ref(JSON.parse(localStorage.getItem('resilia_sleep_tips') || '[]'))
function toggleSleepTip(i) {
  if (checkedSleepTips.value.includes(i)) checkedSleepTips.value = checkedSleepTips.value.filter(x => x !== i)
  else checkedSleepTips.value.push(i)
  localStorage.setItem('resilia_sleep_tips', JSON.stringify(checkedSleepTips.value))
}

// ── Cleanup ──
onUnmounted(() => {
  if (breathInterval) clearInterval(breathInterval)
  if (medInterval) clearInterval(medInterval)
})
</script>
