<template>
  <div class="lia-wrapper" :class="{ 'lia-embedded': embedded, 'lia-dark': isDarkMode }">
    <div class="lia-header">
      <button class="lia-back" @click="goBack">← Back</button>
      <div class="lia-header-info">
        <div class="lia-avatar-ring" :class="{'bg-transparent': lastSpeaker === 'lia'}">
          <img v-if="lastSpeaker === 'lia'" src="../assets/icon.png" class="w-full h-full object-cover rounded-full bg-teal-100 shadow-sm" alt="Lia" />
          <span v-else class="lia-avatar-emoji">{{ currentSpeakerAvatar }}</span>
          <div class="lia-online-dot"></div>
        </div>
        <div>
          <h2>{{ currentSpeakerName }}</h2>
          <p v-if="isTyping" class="lia-status typing">typing...</p>
          <p v-else class="lia-status online">online</p>
        </div>
      </div>
      <!-- Sim HP bar -->
      <div v-if="isSimMode" class="lia-hp-bar">
        <span class="lia-hp-label">❤️ {{ store.simulationHP }}</span>
        <div class="lia-hp-track">
          <div class="lia-hp-fill" :style="{ width: (store.simulationHP / store.MAX_SIM_HP * 100) + '%' }"></div>
        </div>
      </div>
    </div>

    <div class="lia-body" ref="chatBody" @click="skipTyping">
      <div class="lia-date-pill">Today</div>

      <TransitionGroup name="msg">
        <div
          v-for="(msg, i) in visibleMessages"
          :key="i"
          class="lia-bubble-row"
          :class="msg.from === 'user' ? 'lia-row-right' : 'lia-row-left'"
        >
          <!-- NPC/Lia avatar -->
          <div v-if="msg.from !== 'user'" class="lia-npc-avatar" :class="{'bg-transparent': msg.from === 'lia'}" :style="msg.from !== 'lia' ? { background: getNpcColor(msg.from) } : {}">
            <img v-if="msg.from === 'lia'" src="../assets/icon.png" class="w-full h-full object-cover rounded-full bg-teal-100 shadow-sm" alt="Lia" />
            <span v-else>{{ getNpcAvatar(msg.from) }}</span>
          </div>
          <div class="lia-bubble" :class="msg.from === 'user' ? 'lia-bubble-right' : 'lia-bubble-left'" :style="msg.from !== 'user' && msg.from !== 'lia' ? { borderLeft: `3px solid ${getNpcColor(msg.from)}` } : {}">
            <p class="lia-npc-name" v-if="msg.from !== 'user' && msg.from !== 'lia'">{{ getNpcName(msg.from) }}</p>
            <p v-html="msg.text"></p>
            <span class="lia-time">{{ formatTime(i) }}</span>
          </div>
        </div>
      </TransitionGroup>

      <!-- iMessage typing indicator -->
      <div v-if="isTyping" class="lia-bubble-row lia-row-left lia-typing-row">
        <div class="lia-npc-avatar" :class="{'bg-transparent': lastSpeaker === 'lia'}" :style="lastSpeaker !== 'lia' ? { background: getNpcColor(lastSpeaker) } : {}">
          <img v-if="lastSpeaker === 'lia'" src="../assets/icon.png" class="w-full h-full object-cover rounded-full bg-teal-100 shadow-sm" alt="Lia" />
          <span v-else>{{ getNpcAvatar(lastSpeaker) }}</span>
        </div>
        <div class="lia-bubble lia-bubble-left lia-typing-bubble">
          <div class="lia-typing-dots">
            <span class="lia-dot"></span>
            <span class="lia-dot"></span>
            <span class="lia-dot"></span>
          </div>
        </div>
      </div>

      <!-- Scale buttons -->
      <div v-if="showScaleButtons" class="lia-scale-container">
        <p class="lia-scale-label">{{ currentScaleItem.text }}</p>
        <div class="lia-scale-buttons">
          <button
            v-for="n in 5"
            :key="n"
            class="lia-scale-btn"
            @click="selectScale(n)"
          >
            <span class="lia-scale-num">{{ n }}</span>
            <span class="lia-scale-text">{{ currentScaleItem.scaleLabel[n - 1] }}</span>
          </button>
        </div>
      </div>

      <!-- Choice buttons -->
      <div v-if="showChoiceButtons" class="lia-choice-container">
        <div class="lia-choice-buttons">
          <button
            v-for="(choice, ci) in currentChoiceItem.choices"
            :key="ci"
            class="lia-choice-btn"
            @click="selectChoice(ci, choice)"
          >
            <span class="lia-choice-letter">{{ ['A', 'B', 'C'][ci] }}</span>
            <span class="lia-choice-text">{{ choice.text }}</span>
          </button>
        </div>
      </div>

      <!-- Next Act transition card -->
      <div v-if="showNextAct" class="lia-next-act-card">
        <div class="next-act-check">✓</div>
        <p class="next-act-title">{{ completedActTitle }} Complete!</p>
        <p v-if="nextActData" class="next-act-subtitle">Next: {{ nextActData.title }}</p>
        <p v-else class="next-act-subtitle">All acts complete! 🎉</p>
        <button v-if="nextActData" class="next-act-btn" @click="loadNextAct">
          Continue to {{ nextActData.title }} →
        </button>
        <button v-else class="next-act-btn next-act-btn-done" @click="goBack">
          ← Back to Academy
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'

const props = defineProps({
  propChapterId: { type: String, default: '' },
  propPhase: { type: String, default: '' },
  propActId: { type: String, default: '' },
  embedded: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'done'])

const router = useRouter()
const route = useRoute()
const store = useResiliaStore()

// Dark mode detection
const isDarkMode = ref(document.documentElement.classList.contains('dark'))
const darkObserver = new MutationObserver(() => {
  isDarkMode.value = document.documentElement.classList.contains('dark')
})
onMounted(() => {
  darkObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})
const chatBody = ref(null)
const visibleMessages = ref([])
const isTyping = ref(false)
const showScaleButtons = ref(false)
const showChoiceButtons = ref(false)
const currentScaleItem = ref(null)
const currentChoiceItem = ref(null)
const flowIndex = ref(0)
const skipFlag = ref(false)
const lastSpeaker = ref('lia')
const showNextAct = ref(false)
const nextActData = ref(null)
const completedActTitle = ref('')
const currentActIndex = ref(0)

const chapterId = computed(() => props.propChapterId || route.params.chapterId)
const phase = computed(() => props.propPhase || route.params.phase)

// Detect if this is a simulation chapter act (e.g., /academy/lia/ch1h/act1)
const internalActId = ref(props.propActId || '')
const actId = computed(() => internalActId.value || route.params.actId || null)
const chapterData = computed(() => store.academyChapters.find(c => c.id === chapterId.value))
const isSimMode = computed(() => !!chapterData.value?.chatSimulation)
const npcCharacters = computed(() => chapterData.value?.npcCharacters || [])

const chatFlow = computed(() => {
  const chapter = chapterData.value
  if (!chapter) return []
  // If actId is set, load act-specific chatFlow (simulation mode)
  if (actId.value && chapter.chatSimulation) {
    const act = chapter.acts?.find(a => a.id === actId.value)
    return act?.chatFlow || []
  }
  // Otherwise load liaChat pre/post flow
  if (!chapter.liaChat) return []
  return chapter.liaChat[phase.value] || []
})

// NPC lookup helpers
function getNpcAvatar(fromId) {
  if (fromId === 'lia') return ''
  const npc = npcCharacters.value.find(n => n.id === fromId)
  return npc?.avatar || '👤'
}

function getNpcName(fromId) {
  if (fromId === 'lia') return 'Lia'
  const npc = npcCharacters.value.find(n => n.id === fromId)
  return npc?.name || fromId
}

const NPC_COLORS = ['#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#EC4899']
function getNpcColor(fromId) {
  if (fromId === 'lia') return '#0D9488'
  const idx = npcCharacters.value.findIndex(n => n.id === fromId)
  return idx >= 0 ? NPC_COLORS[idx % NPC_COLORS.length] : '#64748b'
}

const currentSpeakerAvatar = computed(() => getNpcAvatar(lastSpeaker.value))
const currentSpeakerName = computed(() => {
  if (lastSpeaker.value === 'lia') return 'Lia'
  return getNpcName(lastSpeaker.value)
})

function formatTime(i) {
  const base = new Date()
  base.setMinutes(base.getMinutes() - (visibleMessages.value.length - i))
  return base.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function scrollToBottom() {
  nextTick(() => {
    if (chatBody.value) {
      chatBody.value.scrollTo({ top: chatBody.value.scrollHeight, behavior: 'smooth' })
    }
  })
}

function skipTyping() {
  skipFlag.value = true
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function processFlow() {
  const flow = chatFlow.value
  if (!flow || flow.length === 0) {
    goBack()
    return
  }

  while (flowIndex.value < flow.length) {
    const item = flow[flowIndex.value]

    // Scale interaction
    if (item.type === 'scale') {
      currentScaleItem.value = item
      showScaleButtons.value = true
      scrollToBottom()
      return
    }

    // Choice interaction (NPC decisions with HP effects)
    if (item.type === 'choice') {
      // First show the question text as a message
      lastSpeaker.value = item.from || 'lia'
      isTyping.value = true
      scrollToBottom()
      if (!skipFlag.value) await sleep(1500 + Math.random() * 800)
      skipFlag.value = false
      isTyping.value = false

      visibleMessages.value.push({
        from: item.from || 'lia',
        text: item.text,
      })
      scrollToBottom()

      // Show choice buttons
      currentChoiceItem.value = item
      showChoiceButtons.value = true
      scrollToBottom()
      return
    }

    // Regular message
    lastSpeaker.value = item.from || 'lia'
    isTyping.value = true
    scrollToBottom()
    if (!skipFlag.value) await sleep(1500 + Math.random() * 800)
    skipFlag.value = false
    isTyping.value = false

    visibleMessages.value.push({
      from: item.from || 'lia',
      text: item.text,
    })
    scrollToBottom()

    if (!skipFlag.value) await sleep(600)
    flowIndex.value++
  }

  // If simulation mode, complete the act and check for next
  if (isSimMode.value && actId.value) {
    store.completeAct(chapterId.value, actId.value)
    if (!skipFlag.value) await sleep(1000)

    // Find next act
    const chapter = chapterData.value
    const acts = chapter?.acts || []
    const currentIdx = acts.findIndex(a => a.id === actId.value)
    const nextAct = currentIdx >= 0 && currentIdx < acts.length - 1 ? acts[currentIdx + 1] : null

    completedActTitle.value = acts[currentIdx]?.title || 'Act'
    nextActData.value = nextAct
    currentActIndex.value = currentIdx
    showNextAct.value = true
  } else {
    if (!skipFlag.value) await sleep(1500)
    goBack()
  }
}

function selectScale(value) {
  const item = currentScaleItem.value
  showScaleButtons.value = false

  visibleMessages.value.push({
    from: 'user',
    text: `${value} — ${item.scaleLabel[value - 1]}`,
  })

  store.saveLiaEvalScore(chapterId.value, phase.value || 'sim', item.key, value)

  flowIndex.value++
  scrollToBottom()

  setTimeout(() => processFlow(), 400)
}

function selectChoice(index, choice) {
  showChoiceButtons.value = false

  // Show user's choice
  visibleMessages.value.push({
    from: 'user',
    text: choice.text,
  })
  scrollToBottom()

  const alreadyCompleted = store.isActCompleted(chapterId.value, actId.value)

  // Apply HP effect if simulation and not already completed
  if (isSimMode.value && choice.hpEffect && !alreadyCompleted) {
    if (choice.hpEffect > 0) {
      store.healSimHP(choice.hpEffect)
    } else {
      store.damageSimHP(Math.abs(choice.hpEffect))
    }
  }

  // Show NPC response
  setTimeout(async () => {
    if (choice.response) {
      const item = currentChoiceItem.value
      lastSpeaker.value = item.from || 'lia'
      isTyping.value = true
      scrollToBottom()
      await sleep(600)
      isTyping.value = false

      visibleMessages.value.push({
        from: item.from || 'lia',
        text: choice.response,
      })
      scrollToBottom()
    }

    // Show HP change feedback
    if (isSimMode.value && choice.hpEffect && !alreadyCompleted) {
      await sleep(400)
      visibleMessages.value.push({
        from: 'lia',
        text: choice.hpEffect > 0
          ? `<span style="color:#22c55e">❤️ +${choice.hpEffect} HP</span>`
          : `<span style="color:#ef4444">💔 ${choice.hpEffect} HP</span>`,
      })
      scrollToBottom()
    }

    flowIndex.value++
    await sleep(500)
    processFlow()
  }, 400)
}

function goBack() {
  if (props.embedded) {
    emit('close')
  } else {
    router.push('/academy')
  }
}

function loadNextAct() {
  if (!nextActData.value) return
  showNextAct.value = false
  visibleMessages.value = []
  flowIndex.value = 0
  skipFlag.value = false
  isTyping.value = false
  showScaleButtons.value = false
  showChoiceButtons.value = false
  currentScaleItem.value = null
  currentChoiceItem.value = null
  lastSpeaker.value = 'lia'

  const nextId = nextActData.value.id

  if (props.embedded) {
    // Update internal state directly
    internalActId.value = nextId
    nextTick(() => {
      processFlow()
    })
  } else {
    // Update the route to the next act (keeps URL in sync)
    router.replace(`/academy/sim/${chapterId.value}/${nextId}`)
    nextTick(() => {
      processFlow()
    })
  }
}

onMounted(() => {
  processFlow()
})
</script>

<style scoped>
/* Theme tokens */
.lia-wrapper {
  --chat-bg: #FAFAF8;
  --chat-header-bg: #F0EDE6;
  --chat-header-border: rgba(0,0,0,0.06);
  --chat-bubble-left: #E8E5DE;
  --chat-bubble-left-text: #1A1A1A;
  --chat-bubble-right-text: white;
  --chat-time-color: rgba(0,0,0,0.3);
  --chat-status-color: #6B7280;
  --chat-name-color: #1A1A1A;
  --chat-pill-bg: rgba(0,0,0,0.04);
  --chat-pill-text: #6B7280;
  --chat-npc-name: rgba(0,0,0,0.45);
  --chat-overlay-bg: rgba(255,255,255,0.03);
  --chat-overlay-border: rgba(0,0,0,0.06);
  --chat-dot-color: #9CA3AF;
  --chat-back-bg: rgba(0,0,0,0.05);
  --chat-back-color: #6B7280;
  --chat-back-hover-bg: rgba(0,0,0,0.08);
  --chat-back-hover-color: #374151;
  --chat-online-border: #F0EDE6;
  --chat-scrollbar: rgba(0,0,0,0.08);
  --chat-next-bg: linear-gradient(180deg, rgba(250,250,248,0.97), #F5F5F0);
  --chat-next-title: #1A1A1A;
  --chat-next-sub: #6B7280;
}

.lia-wrapper.lia-dark {
  --chat-bg: #1A1714;
  --chat-header-bg: #211E19;
  --chat-header-border: rgba(255,255,255,0.06);
  --chat-bubble-left: #2A2620;
  --chat-bubble-left-text: #E8E0D4;
  --chat-bubble-right-text: white;
  --chat-time-color: rgba(255,255,255,0.25);
  --chat-status-color: #9CA3AF;
  --chat-name-color: #F3F0EB;
  --chat-pill-bg: rgba(255,255,255,0.04);
  --chat-pill-text: #64748B;
  --chat-npc-name: rgba(255,255,255,0.45);
  --chat-overlay-bg: rgba(255,255,255,0.03);
  --chat-overlay-border: rgba(255,255,255,0.06);
  --chat-dot-color: #64748B;
  --chat-back-bg: rgba(255,255,255,0.06);
  --chat-back-color: #94A3B8;
  --chat-back-hover-bg: rgba(255,255,255,0.1);
  --chat-back-hover-color: #F1F5F9;
  --chat-online-border: #211E19;
  --chat-scrollbar: rgba(255,255,255,0.1);
  --chat-next-bg: linear-gradient(180deg, rgba(26,23,20,0.97), #1A1714);
  --chat-next-title: #F3F0EB;
  --chat-next-sub: #9CA3AF;
}

.lia-wrapper {
  max-width: 480px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--chat-bg);
}

/* Embedded mode — fills parent container */
.lia-wrapper.lia-embedded {
  max-width: 100%;
  height: 100%;
  margin: 0;
  border-radius: 0 0 20px 0;
  overflow: hidden;
}

.lia-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--chat-header-bg);
  border-bottom: 1px solid var(--chat-header-border);
}

.lia-back {
  padding: 6px 12px;
  border: none;
  border-radius: 10px;
  background: var(--chat-back-bg);
  color: var(--chat-back-color);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.lia-back:hover { background: var(--chat-back-hover-bg); color: var(--chat-back-hover-color); }

.lia-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lia-avatar-ring {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0D9488, #14B8A6);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.lia-avatar-emoji { font-size: 22px; }

.lia-online-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22C55E;
  border: 2px solid var(--chat-online-border);
}

.lia-header h2 { font-size: 1rem; font-weight: 600; color: var(--chat-name-color); margin: 0; }
.lia-status { font-size: 0.7rem; margin: 0; }
.lia-status.online { color: #22C55E; }
.lia-status.typing { color: var(--chat-status-color); font-style: italic; }

/* iMessage typing indicator */
.lia-typing-row {
  animation: fadeInUp 0.3s ease;
}
.lia-typing-bubble {
  padding: 12px 16px !important;
  min-height: 24px;
}
.lia-typing-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 18px;
}
.lia-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chat-dot-color);
  animation: typingBounce 1.4s infinite ease-in-out;
}
.lia-dot:nth-child(2) {
  animation-delay: 0.2s;
}
.lia-dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes typingBounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lia-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px 100px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lia-date-pill {
  text-align: center;
  font-size: 0.7rem;
  color: var(--chat-pill-text);
  padding: 6px 16px;
  background: var(--chat-pill-bg);
  border-radius: 20px;
  margin: 0 auto 12px;
  font-weight: 600;
}

.lia-bubble-row {
  display: flex;
  animation: bubbleIn 0.3s ease;
}
.lia-row-left { justify-content: flex-start; }
.lia-row-right { justify-content: flex-end; }

@keyframes bubbleIn {
  from { opacity: 0; transform: translateY(10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.lia-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 0.88rem;
  line-height: 1.5;
  position: relative;
}

.lia-bubble-left {
  background: var(--chat-bubble-left);
  color: var(--chat-bubble-left-text);
  border-bottom-left-radius: 4px;
}

.lia-bubble-right {
  background: linear-gradient(135deg, #0D9488, #0F766E);
  color: var(--chat-bubble-right-text);
  border-bottom-right-radius: 4px;
}

.lia-time {
  display: block;
  font-size: 0.6rem;
  color: var(--chat-time-color);
  margin-top: 4px;
  text-align: right;
}

.lia-scale-container {
  margin-top: 12px;
  padding: 16px;
  background: var(--chat-overlay-bg);
  border-radius: 16px;
  border: 1px solid var(--chat-overlay-border);
}

.lia-scale-label {
  font-size: 0.8rem;
  color: #9CA3AF;
  margin: 0 0 12px;
  text-align: center;
}

.lia-scale-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lia-scale-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: rgba(13, 148, 136, 0.1);
  border: 1px solid rgba(13, 148, 136, 0.2);
  border-radius: 14px;
  color: #5EEAD4;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}
.lia-scale-btn:hover {
  background: rgba(13, 148, 136, 0.25);
  border-color: rgba(13, 148, 136, 0.4);
  transform: translateY(-1px);
}

.lia-scale-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(13, 148, 136, 0.3);
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.lia-scale-text {
  flex: 1;
}

.msg-enter-active { transition: all 0.3s ease; }
.msg-leave-active { transition: all 0.2s ease; }
.msg-enter-from { opacity: 0; transform: translateY(10px); }

.lia-body::-webkit-scrollbar { width: 4px; }
.lia-body::-webkit-scrollbar-thumb { background: var(--chat-scrollbar); border-radius: 4px; }

/* NPC avatars */
.lia-npc-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  margin-right: 8px;
  margin-top: 2px;
}

.lia-npc-name {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--chat-npc-name);
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Choice buttons */
.lia-choice-container {
  margin-top: 12px;
  padding: 16px;
  background: var(--chat-overlay-bg);
  border-radius: 16px;
  border: 1px solid var(--chat-overlay-border);
}

.lia-choice-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lia-choice-btn {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  color: var(--chat-bubble-left-text);
  font-family: inherit;
  font-size: 0.85rem;
  line-height: 1.45;
}

.lia-choice-btn:hover {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.4);
  transform: translateY(-1px);
}

.lia-choice-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.25);
  font-weight: 800;
  font-size: 0.75rem;
  color: #F59E0B;
  flex-shrink: 0;
}

.lia-choice-text { flex: 1; }

/* HP bar in header */
.lia-hp-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  padding: 4px 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 12px;
}

.lia-hp-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #EF4444;
  white-space: nowrap;
}

.lia-hp-track {
  width: 60px;
  height: 6px;
  background: rgba(239, 68, 68, 0.15);
  border-radius: 3px;
  overflow: hidden;
}

.lia-hp-fill {
  height: 100%;
  background: linear-gradient(90deg, #EF4444, #F87171);
  border-radius: 3px;
  transition: width 0.7s ease;
}

/* Next Act transition card */
.lia-next-act-card {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--chat-next-bg);
  padding: 32px 24px;
  text-align: center;
  animation: slideUp 0.4s ease-out;
  z-index: 20;
}

.next-act-check {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  box-shadow: 0 4px 12px rgba(16,185,129,0.3);
}

.next-act-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--chat-next-title);
  margin-bottom: 4px;
}

.next-act-subtitle {
  font-size: 11px;
  color: var(--chat-next-sub);
  margin-bottom: 16px;
}

.next-act-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #0D9488, #0F766E);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(13,148,136,0.3);
}

.next-act-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(13,148,136,0.4);
}

.next-act-btn-done {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  box-shadow: 0 2px 8px rgba(245,158,11,0.3);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
