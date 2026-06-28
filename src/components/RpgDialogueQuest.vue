<template>
  <div
    class="rpg-stage"
    :class="{ 'is-shaking': shaking, 'is-flash': flash }"
    @click="onStageClick"
  >
    <div class="rpg-bg" :style="{ backgroundImage: bgUrl }"></div>
    <div class="rpg-bg-vignette"></div>
    <div v-if="flash" class="rpg-damage-flash"></div>

    <!-- HUD -->
    <div class="rpg-hud">
      <div class="rpg-progress">
        <span class="rpg-chapter" v-text="scenario.tag"></span>
        <div class="rpg-progress-track">
          <div class="rpg-progress-fill" :style="{ width: progressPct + '%' }"></div>
        </div>
      </div>
      <div class="rpg-hearts" :class="{ 'hp-hit': heartShake }">
        <span v-for="n in maxHp" :key="n" class="rpg-heart"
          :class="{ lost: n > hp, popped: n === hp + 1 && heartShake, healed: n <= hp && healPulse }"
          aria-hidden="true">&#9829;</span>
      </div>
    </div>

    <!-- Sprites (dim during choices) -->
    <transition name="sprite-left">
      <img v-if="leftSprite" :key="'L' + leftSprite" :src="leftSprite"
        class="rpg-sprite rpg-sprite-left"
        :class="{ dim: activeSide !== 'left' || showChoices, talking: activeSide === 'left' && typing, choosing: showChoices }" alt="" />
    </transition>
    <transition name="sprite-right">
      <img v-if="rightSprite" :key="'R' + rightSprite" :src="rightSprite"
        class="rpg-sprite rpg-sprite-right"
        :class="{ dim: activeSide !== 'right' || showChoices, talking: activeSide === 'right' && typing, choosing: showChoices }" alt="" />
    </transition>

    <!-- Dialogue (hidden during choices per R1) -->
    <div v-if="!finished && !gameOver && !showChoices" class="rpg-dialogue">
      <div v-if="currentSpeakerName" class="rpg-nameplate" v-text="currentSpeakerName"></div>
      <p class="rpg-line"><span v-text="shownText"></span><span v-if="typing" class="rpg-caret">&#9612;</span></p>
      <div v-if="!typing" class="rpg-continue">
        <span>Tap to continue</span>
        <span class="rpg-continue-arrow">&#9662;</span>
      </div>
    </div>

    <!-- ZZZ-style Choice Overlay (R1, R4) -->
    <transition name="choice-overlay">
      <div v-if="showChoices && !gameOver" class="rpg-choice-overlay" @click.stop>
        <p class="rpg-choice-prompt" v-text="currentNode.choice.prompt"></p>
        <div class="rpg-choice-stack">
          <button v-for="(opt, i) in currentNode.choice.options" :key="i"
            class="rpg-choice" :class="choiceClass(i)" :disabled="answered" @click="choose(i)">
            <span v-text="opt.text"></span>
          </button>
        </div>
      </div>
    </transition>

    <!-- Game Over -->
    <transition name="overlay">
      <div v-if="gameOver" class="rpg-overlay" @click.stop>
        <div class="rpg-overlay-card">
          <h2 v-text="endingResult?.title || 'Resolve Broke'"></h2>
          <p v-text="endingResult?.line || 'The pressure got to you this time. Every responder learns by trying again.'"></p>
          <div class="rpg-overlay-actions">
            <button class="rpg-btn-primary" @click="retry">Try Again</button>
            <button class="rpg-btn-ghost" @click="$emit('exit')">Leave</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Victory / Graded Ending -->
    <transition name="overlay">
      <div v-if="finished" class="rpg-overlay" @click.stop>
        <div class="rpg-overlay-card win">
          <div class="rpg-ending-badge" :class="endingResult?.outcome || 'gold'">
            {{ endingResult?.outcome === 'gold' ? 'GOLD' : endingResult?.outcome === 'silver' ? 'SILVER' : 'BRONZE' }}
          </div>
          <h2 v-text="endingResult?.title || 'Scenario Cleared'"></h2>
          <p v-text="endingResult?.line || 'You kept a clear head under real pressure.'"></p>
          <div class="rpg-rewards">
            <div class="rpg-reward"><span class="v" v-text="'+' + earnedXp"></span><span class="l">XP</span></div>
            <div class="rpg-reward"><span class="v" v-text="'+' + earnedCoins"></span><span class="l">ResiCoins</span></div>
          </div>
          <p v-if="endingResult?.outcome !== 'gold'" class="rpg-replay-hint">
            You reached the {{ endingResult?.outcome }} ending. Replay for a better outcome
          </p>
          <button class="rpg-btn-primary" @click="emitComplete">Continue</button>
        </div>
      </div>
    </transition>

    <!-- Intro -->
    <transition name="overlay">
      <div v-if="showIntro" class="rpg-overlay" @click.stop>
        <div class="rpg-intro-card">
          <span class="rpg-intro-loc" v-text="scenario.intro.location"></span>
          <h2 v-text="scenario.title"></h2>
          <p v-text="scenario.intro.blurb"></p>
          <button class="rpg-btn-primary" @click="startQuest">Begin</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { computeGrade } from '../data/rpgScenarios'

const props = defineProps({
  scenario: { type: Object, required: true },
  playerName: { type: String, default: 'Recruit' },
})
const emit = defineEmits(['complete', 'exit'])

const maxHp = 5
const hp = ref(maxHp)
const currentId = ref('')
const shownText = ref('')
const typing = ref(false)
const showChoices = ref(false)
const answered = ref(false)
const selectedIndex = ref(-1)
const flashTone = ref('')
const gameOver = ref(false)
const finished = ref(false)
const showIntro = ref(true)
const shaking = ref(false)
const flash = ref(false)
const heartShake = ref(false)
const healPulse = ref(false)
const bestCount = ref(0)
const okCount = ref(0)
const poorCount = ref(0)
const visitedCount = ref(0)
const endingResult = ref(null)

let typeTimer = null

const currentNode = computed(() => props.scenario.nodes?.[currentId.value] || {})
const progressPct = computed(() => {
  const len = props.scenario.length || Object.keys(props.scenario.nodes || {}).length
  return Math.min(100, Math.round((visitedCount.value / Math.max(1, len)) * 100))
})

const interpolate = (txt) => (txt || '').split('{name}').join(props.playerName)
const activeSide = computed(() => currentNode.value?.speaker?.side || 'left')
const currentSpeakerName = computed(() => currentNode.value?.speaker?.name || '')
const leftSprite = computed(() => spriteForSide('left'))
const rightSprite = computed(() => spriteForSide('right'))

function spriteForSide(side) {
  const nd = currentNode.value
  if (!nd) return null
  if (nd.speaker?.side === side) return nd.speaker.sprite
  if (nd.partner?.side === side) return nd.partner.sprite
  return null
}

const bgUrl = computed(() => {
  const bg = currentNode.value?.bg
  if (bg) return 'url(' + bg + ')'
  const first = props.scenario.nodes?.[props.scenario.start]
  return 'url(' + (first?.bg || '') + ')'
})

const earnedXp = computed(() => {
  const base = props.scenario?.reward?.xp || 100
  const mult = endingResult.value?.rewardMult ?? 1
  return Math.round(base * mult)
})
const earnedCoins = computed(() => {
  const base = props.scenario?.reward?.coins || 0
  const mult = endingResult.value?.rewardMult ?? 1
  return Math.round(base * mult)
})

function emitComplete() {
  emit('complete', { xp: earnedXp.value, coins: earnedCoins.value, hp: hp.value, ending: endingResult.value?.outcome })
}

function startQuest() {
  showIntro.value = false
  currentId.value = props.scenario.start
  visitedCount.value = 0
  playNode()
}

function playNode() {
  showChoices.value = false
  answered.value = false
  selectedIndex.value = -1
  flashTone.value = ''
  visitedCount.value++
  const nd = currentNode.value
  if (!nd || nd.ending) return
  typeText(interpolate(nd.text))
}

function typeText(text) {
  clearInterval(typeTimer)
  shownText.value = ''
  typing.value = true
  let i = 0
  typeTimer = setInterval(() => {
    shownText.value = text.slice(0, ++i)
    if (i >= text.length) {
      clearInterval(typeTimer)
      typing.value = false
      if (currentNode.value.choice) {
        setTimeout(() => { showChoices.value = true }, 250)
      }
    }
  }, 22)
}

function onStageClick() {
  if (showIntro.value || gameOver.value || finished.value) return
  if (typing.value) {
    clearInterval(typeTimer)
    shownText.value = interpolate(currentNode.value.text)
    typing.value = false
    if (currentNode.value.choice) setTimeout(() => { showChoices.value = true }, 150)
    return
  }
  if (showChoices.value) return
  advance()
}

function advance() {
  const nd = currentNode.value
  if (nd.ending) { resolveEnding(nd); return }
  if (nd.next) { goTo(nd.next); return }
  finished.value = true
}

function goTo(id) {
  const node = props.scenario.nodes[id]
  if (!node) { finished.value = true; return }
  currentId.value = id
  if (node.ending) { resolveEnding(node); return }
  playNode()
}

function resolveEnding(node) {
  if (node.ending === 'computed') {
    const grade = computeGrade(bestCount.value, okCount.value, poorCount.value)
    endingResult.value = props.scenario.endings?.[grade] || props.scenario.endings?.gold
  } else {
    endingResult.value = node.ending
  }
  finished.value = true
}

function choose(i) {
  if (answered.value) return
  answered.value = true
  selectedIndex.value = i
  const opt = currentNode.value.choice.options[i]
  if (opt.tone === 'best') bestCount.value++
  else if (opt.tone === 'ok') okCount.value++
  else poorCount.value++
  flashTone.value = opt.tone === 'best' ? 'good' : opt.tone === 'poor' ? 'bad' : 'neutral'
  if (opt.heart && opt.heart < 0) damage(-opt.heart)
  setTimeout(() => {
    showChoices.value = false
    flashTone.value = ''
    if (hp.value <= 0) return
    goTo(opt.next)
  }, 520)
}

function damage(n) {
  hp.value = Math.max(0, hp.value - n)
  flash.value = true
  shaking.value = true
  heartShake.value = true
  setTimeout(() => { flash.value = false }, 280)
  setTimeout(() => { shaking.value = false }, 420)
  setTimeout(() => { heartShake.value = false }, 520)
  if (hp.value <= 0) {
    const failEnding = props.scenario.endings?.fail
    if (failEnding) endingResult.value = failEnding
    setTimeout(() => { gameOver.value = true }, 700)
  }
}

function heal(n) {
  hp.value = Math.min(maxHp, hp.value + n)
  healPulse.value = true
  setTimeout(() => { healPulse.value = false }, 600)
}

function retry() {
  hp.value = maxHp
  bestCount.value = 0
  okCount.value = 0
  poorCount.value = 0
  visitedCount.value = 0
  gameOver.value = false
  finished.value = false
  endingResult.value = null
  currentId.value = props.scenario.start
  playNode()
}

function choiceClass(i) {
  if (!answered.value) return ''
  if (i !== selectedIndex.value) return 'muted'
  return flashTone.value === 'good' ? 'flash-good' : flashTone.value === 'bad' ? 'flash-bad' : ''
}

function handleKey(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    if (showIntro.value) { startQuest(); e.preventDefault() }
    else { onStageClick(); e.preventDefault() }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKey)
  if (props.scenario.nodes) {
    Object.values(props.scenario.nodes).forEach(nd => {
      ;[nd.bg, nd.speaker?.sprite, nd.partner?.sprite].forEach(src => {
        if (src) { const im = new Image(); im.src = src }
      })
    })
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKey)
  clearInterval(typeTimer)
})
</script>

<style scoped>
.rpg-stage { position: fixed; inset: 0; overflow: hidden; background: var(--color-bark-950, #121009); user-select: none; font-family: var(--font-body, 'Hanken Grotesk Variable', sans-serif); z-index: 60; }
.rpg-bg { position: absolute; inset: -3%; background-size: cover; background-position: center; transform: scale(1.06); transition: background-image 0.5s ease; will-change: transform; animation: bgDrift 24s ease-in-out infinite alternate; }
@keyframes bgDrift { from { transform: scale(1.06) translate(0,0);} to { transform: scale(1.1) translate(-1.5%, -1%);} }
.rpg-bg-vignette { position: absolute; inset: 0; background: radial-gradient(120% 90% at 50% 30%, transparent 40%, rgba(0,0,0,0.45) 100%); pointer-events: none; }
.rpg-damage-flash { position: absolute; inset: 0; background: rgba(220,38,38,0.32); pointer-events: none; z-index: 40; }
.is-shaking { animation: shake 0.42s cubic-bezier(.36,.07,.19,.97); }
@keyframes shake { 10%,90%{transform:translate(-2px,0)} 20%,80%{transform:translate(4px,0)} 30%,50%,70%{transform:translate(-7px,0)} 40%,60%{transform:translate(7px,0)} }
.rpg-hud { position: absolute; top: 0; left: 0; right: 0; padding: 18px 22px; display: flex; align-items: flex-start; justify-content: space-between; z-index: 30; }
.rpg-progress { display: flex; flex-direction: column; gap: 7px; }
.rpg-chapter { font-family: var(--font-mono, 'DM Mono', monospace); font-weight:500; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:#fff; text-shadow:0 1px 4px rgba(0,0,0,.6); }
.rpg-progress-track { width: 180px; height: 5px; border-radius: 99px; background: rgba(255,255,255,.25); overflow: hidden; }
.rpg-progress-fill { height:100%; border-radius:99px; background: linear-gradient(90deg,#2DD4BF,#0D9488); transition: width .5s cubic-bezier(.22,1,.36,1); }
.rpg-hearts { display:flex; gap:4px; }
.rpg-heart { font-size: 30px; line-height:1; color:#ef4444; filter: drop-shadow(0 2px 3px rgba(0,0,0,.5)); transition: transform .2s, color .2s; }
.rpg-heart.lost { color: rgba(20,20,20,.75); }
.rpg-heart.popped { animation: heartPop .5s ease; }
.rpg-heart.healed { animation: heartHeal .6s ease; }
.rpg-hearts.hp-hit { animation: shake 0.4s; }
@keyframes heartPop { 0%{transform:scale(1.5);color:#fff} 100%{transform:scale(1)} }
@keyframes heartHeal { 0%{transform:scale(1.4);filter:drop-shadow(0 0 8px #34d399)} 100%{transform:scale(1)} }
.rpg-sprite { position:absolute; bottom:0; height: min(78vh, 760px); max-width:46vw; object-fit:contain; z-index:10; filter: drop-shadow(0 12px 24px rgba(0,0,0,.4)); transition: transform .45s cubic-bezier(.22,1,.36,1), filter .35s, opacity .35s; }
.rpg-sprite-left { left: clamp(-40px, -2vw, 0px); transform-origin: bottom left; }
.rpg-sprite-right { right: clamp(-40px, -2vw, 0px); transform-origin: bottom right; }
.rpg-sprite.dim { filter: brightness(.62) drop-shadow(0 12px 24px rgba(0,0,0,.4)); transform: scale(.94) translateY(8px); }
.rpg-sprite.choosing { filter: brightness(.5) blur(1px); }
.rpg-sprite.talking { animation: talkBob 1.6s ease-in-out infinite; }
@keyframes talkBob { 0%,100%{ transform: translateY(0)} 50%{ transform: translateY(-6px)} }
.sprite-left-enter-active,.sprite-right-enter-active{ transition: all .5s cubic-bezier(.22,1,.36,1);}
.sprite-left-enter-from{ opacity:0; transform: translateX(-40px) translateY(10px);}
.sprite-right-enter-from{ opacity:0; transform: translateX(40px) translateY(10px);}
.rpg-dialogue { position:absolute; left:50%; bottom: 8%; transform: translateX(-50%); width: min(78vw, 920px); z-index:25; background: rgba(244,240,232,.82); backdrop-filter: blur(8px); border:1px solid rgba(255,255,255,.5); border-radius:18px; padding: 26px 30px 22px; box-shadow: 0 18px 50px rgba(0,0,0,.35); }
.rpg-nameplate { position:absolute; top:-14px; left:24px; background: linear-gradient(135deg,#0D9488,#2DD4BF); color:#fff; font-family: var(--font-body); font-weight:700; font-size:13px; padding:5px 16px; border-radius:99px; box-shadow:0 4px 12px rgba(13,148,136,.4); }
.rpg-line { font-size: clamp(16px, 2vw, 21px); line-height:1.6; color:#1A1A1A; margin:0; min-height: 2.2em; }
.rpg-caret { color:#0D9488; animation: blink 1s step-end infinite; }
@keyframes blink { 50%{opacity:0} }
.rpg-continue { margin-top:10px; display:flex; align-items:center; justify-content:flex-end; gap:6px; font-size:12px; color:#6b6256; font-weight:600; animation: fadeIn .4s ease; }
.rpg-continue-arrow { animation: nudge 1.1s ease-in-out infinite; }
@keyframes nudge { 0%,100%{transform:translateY(0)} 50%{transform:translateY(3px)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }

/* ZZZ-style choice overlay */
.rpg-choice-overlay {
  position: absolute; inset: 0; z-index: 30;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; padding: 24px;
  background: rgba(10,12,16,0.45);
  backdrop-filter: blur(10px) brightness(0.7);
  -webkit-backdrop-filter: blur(10px) brightness(0.7);
}
.rpg-choice-stack { display:flex; flex-direction:column; gap:14px; width:min(78vw,720px); }
.rpg-choice-prompt { color:#F4F0E8; font-family: var(--font-display, 'Fraunces Variable', serif); font-weight:700; font-size:16px; letter-spacing:.02em; text-shadow:0 2px 6px rgba(0,0,0,.6); margin:0 0 4px; text-align:center; }
.rpg-choice {
  text-align:center; padding:18px 28px; border-radius:999px;
  background: rgba(20,22,28,0.82); border:1.5px solid rgba(255,255,255,0.18);
  color:#F4F0E8; font-size:clamp(15px,1.6vw,18px); font-weight:600; cursor:pointer;
  transition: transform .16s, background .2s, border-color .2s, box-shadow .2s;
}
.rpg-choice:hover:not(:disabled){ transform:translateY(-2px) scale(1.01); border-color:#2DD4BF; background:rgba(13,148,136,0.32); box-shadow:0 10px 30px rgba(0,0,0,.45); }
.rpg-choice:disabled{ cursor:default; }
.rpg-choice.flash-good{ border-color:#2DD4BF; background:rgba(13,148,136,.55); }
.rpg-choice.flash-bad{ border-color:#dc2626; background:rgba(220,38,38,.5); animation:shake .4s; }
.rpg-choice.muted{ opacity:.4; }
.choice-overlay-enter-active{ transition: all .35s cubic-bezier(.22,1,.36,1);} .choice-overlay-enter-from{ opacity:0; }

.rpg-overlay { position:absolute; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; background: rgba(8,12,18,.72); backdrop-filter: blur(6px); padding:20px; }
.rpg-overlay-card,.rpg-intro-card { background:#fff; border-radius:24px; padding:38px 34px; max-width:460px; text-align:center; box-shadow:0 30px 80px rgba(0,0,0,.5); animation: cardIn .45s cubic-bezier(.22,1.2,.4,1); }
@keyframes cardIn { from{opacity:0; transform: translateY(24px) scale(.96)} to{opacity:1; transform:none} }
.rpg-overlay-card h2,.rpg-intro-card h2{ font-family: var(--font-display, 'Fraunces Variable', serif); font-size:26px; font-weight:800; color:#1A1A1A; margin:10px 0 8px; }
.rpg-overlay-card p,.rpg-intro-card p{ color:#5b5650; font-size:15px; line-height:1.6; margin:0 0 22px; }
.rpg-overlay-actions{ display:flex; gap:12px; justify-content:center; }
.rpg-btn-primary{ background: linear-gradient(135deg,#0D9488,#2DD4BF); color:#fff; border:none; border-radius:12px; padding:13px 30px; font-weight:700; font-size:15px; cursor:pointer; box-shadow:0 10px 24px rgba(13,148,136,.35); transition: transform .15s; }
.rpg-btn-primary:hover{ transform: translateY(-2px); }
.rpg-btn-ghost{ background:transparent; color:#6b6256; border:1.5px solid #d8d2c8; border-radius:12px; padding:13px 26px; font-weight:600; cursor:pointer; }
.rpg-intro-loc{ display:inline-block; font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:#0D9488; font-weight:700; font-family: var(--font-mono); }
.rpg-rewards{ display:flex; gap:18px; justify-content:center; margin-bottom:24px; }
.rpg-reward{ display:flex; flex-direction:column; }
.rpg-reward .v{ font-family: var(--font-mono, 'DM Mono', monospace); font-weight:500; font-size:26px; color:#0D9488; }
.rpg-reward .l{ font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:#9a948b; }
.rpg-ending-badge { display:inline-block; padding:6px 18px; border-radius:99px; font-size:13px; font-weight:700; letter-spacing:.15em; text-transform:uppercase; margin-bottom:8px; font-family: var(--font-mono); }
.rpg-ending-badge.gold { background: linear-gradient(135deg,#ECA227,#F4C770); color:#1A1712; }
.rpg-ending-badge.silver { background: linear-gradient(135deg,#9CA3AF,#D1D5DB); color:#1A1712; }
.rpg-ending-badge.bronze { background: linear-gradient(135deg,#C95A28,#F2935C); color:#fff; }
.rpg-replay-hint { font-size:13px; color:#8C8475; margin:0 0 16px; font-style:italic; }
.overlay-enter-active{ transition: opacity .3s;} .overlay-enter-from{ opacity:0; }
@media (max-width: 640px) {
  .rpg-sprite{ height: 52vh; max-width:60vw; }
  .rpg-dialogue{ width: 92vw; bottom: 4%; }
  .rpg-choice-stack{ width:92vw; }
  .rpg-line{ font-size:16px; }
  .rpg-heart{ font-size:24px; }
  .rpg-progress-track{ width:120px; }
}
@media (prefers-reduced-motion: reduce) { .rpg-bg{ animation:none; } .rpg-sprite.talking{ animation:none; } .is-shaking{ animation:none; } .rpg-choice-overlay{ backdrop-filter:brightness(0.7); } }
</style>

