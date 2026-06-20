<template>
  <div
    class="rpg-stage"
    :class="{ 'is-shaking': shaking, 'is-flash': flash }"
    @click="onStageClick"
  >
    <!-- Background layers (parallax) -->
    <div class="rpg-bg" :style="{ backgroundImage: bgUrl }"></div>
    <div class="rpg-bg-vignette"></div>
    <div v-if="flash" class="rpg-damage-flash"></div>

    <!-- Top HUD: HP hearts + progress -->
    <div class="rpg-hud">
      <div class="rpg-progress">
        <span class="rpg-chapter" v-text="scenario.tag"></span>
        <div class="rpg-progress-track">
          <div class="rpg-progress-fill" :style="{ width: progressPct + '%' }"></div>
        </div>
      </div>
      <div class="rpg-hearts" :class="{ 'hp-hit': heartShake }">
        <span
          v-for="n in maxHp"
          :key="n"
          class="rpg-heart"
          :class="{ lost: n > hp, popped: n === hp + 1 && heartShake, healed: n <= hp && healPulse }"
          aria-hidden="true"
        >♥</span>
      </div>
    </div>

    <!-- Combo badge -->
    <transition name="combo-pop">
      <div v-if="combo >= 2" class="rpg-combo">
        <span class="rpg-combo-x" v-text="combo + 'x'"></span>
        <span class="rpg-combo-label">COMBO</span>
      </div>
    </transition>

    <!-- Character sprites -->
    <transition name="sprite-left">
      <img
        v-if="leftSprite"
        :key="'L' + leftSprite"
        :src="leftSprite"
        class="rpg-sprite rpg-sprite-left"
        :class="{ dim: activeSide !== 'left', talking: activeSide === 'left' && typing }"
        alt=""
      />
    </transition>
    <transition name="sprite-right">
      <img
        v-if="rightSprite"
        :key="'R' + rightSprite"
        :src="rightSprite"
        class="rpg-sprite rpg-sprite-right"
        :class="{ dim: activeSide !== 'right', talking: activeSide === 'right' && typing }"
        alt=""
      />
    </transition>

    <!-- Dialogue banner -->
    <div v-if="!finished && !gameOver" class="rpg-dialogue">
      <div v-if="currentSpeakerName" class="rpg-nameplate" v-text="currentSpeakerName"></div>
      <p class="rpg-line"><span v-text="shownText"></span><span v-if="typing" class="rpg-caret">▌</span></p>

      <!-- Continue hint -->
      <div v-if="!typing && !showChoices" class="rpg-continue">
        <span>Tap to continue</span>
        <span class="rpg-continue-arrow">▾</span>
      </div>
    </div>

    <!-- Choices -->
    <transition name="choices-rise">
      <div v-if="showChoices && !gameOver" class="rpg-choices" @click.stop>
        <p class="rpg-choice-prompt" v-text="currentScene.choice.prompt"></p>
        <button
          v-for="(opt, i) in currentScene.choice.options"
          :key="i"
          class="rpg-choice"
          :class="choiceClass(i)"
          :disabled="answered"
          @click="choose(i)"
        >
          <span class="rpg-choice-text" v-text="opt.text"></span>
        </button>
      </div>
    </transition>

    <!-- Feedback toast -->
    <transition name="toast">
      <div v-if="feedback" class="rpg-feedback" :class="feedbackCorrect ? 'good' : 'bad'" @click.stop>
        <span class="rpg-feedback-icon" v-text="feedbackCorrect ? '✓' : '!'"></span>
        <p v-text="feedback"></p>
        <button class="rpg-feedback-next" @click="afterFeedback">Continue</button>
      </div>
    </transition>

    <!-- Game Over -->
    <transition name="overlay">
      <div v-if="gameOver" class="rpg-overlay" @click.stop>
        <div class="rpg-overlay-card">
          <div class="rpg-overlay-emoji">💔</div>
          <h2>Resolve Broke</h2>
          <p>The pressure got to you this time. Every responder learns by trying again, that is what resilience means.</p>
          <div class="rpg-overlay-actions">
            <button class="rpg-btn-primary" @click="retry">Try Again</button>
            <button class="rpg-btn-ghost" @click="$emit('exit')">Leave</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Victory -->
    <transition name="overlay">
      <div v-if="finished" class="rpg-overlay" @click.stop>
        <div class="rpg-overlay-card win">
          <div class="rpg-overlay-emoji">🌟</div>
          <h2>Scenario Cleared</h2>
          <p>You kept a clear head under real pressure.</p>
          <div class="rpg-rewards">
            <div class="rpg-reward"><span class="v" v-text="'+' + earnedXp"></span><span class="l">XP</span></div>
            <div class="rpg-reward"><span class="v" v-text="'+' + scenario.reward.coins"></span><span class="l">ResiCoins</span></div>
            <div class="rpg-reward" v-if="bestCombo >= 2"><span class="v" v-text="bestCombo + 'x'"></span><span class="l">Best Combo</span></div>
          </div>
          <button class="rpg-btn-primary" @click="emitComplete">Continue</button>
        </div>
      </div>
    </transition>

    <!-- Intro card -->
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

const props = defineProps({
  scenario: { type: Object, required: true },
  playerName: { type: String, default: 'Recruit' },
})
const emit = defineEmits(['complete', 'exit'])

const maxHp = 5
const hp = ref(maxHp)
const sceneIndex = ref(0)
const shownText = ref('')
const typing = ref(false)
const showChoices = ref(false)
const answered = ref(false)
const selectedIndex = ref(-1)
const feedback = ref('')
const feedbackCorrect = ref(false)
const gameOver = ref(false)
const finished = ref(false)
const showIntro = ref(true)
const combo = ref(0)
const bestCombo = ref(0)
const shaking = ref(false)
const flash = ref(false)
const heartShake = ref(false)
const healPulse = ref(false)

let typeTimer = null
let pendingCorrect = false

const scenes = computed(() => props.scenario.scenes || [])
const currentScene = computed(() => scenes.value[sceneIndex.value] || {})
const isLastScene = computed(() => sceneIndex.value >= scenes.value.length - 1)
const progressPct = computed(() => Math.round((sceneIndex.value / Math.max(1, scenes.value.length - 1)) * 100))

const interpolate = (txt) => (txt || '').split('{name}').join(props.playerName)

const activeSide = computed(() => currentScene.value?.speaker?.side || 'left')
const currentSpeakerName = computed(() => currentScene.value?.speaker?.name || '')

const leftSprite = computed(() => spriteForSide('left'))
const rightSprite = computed(() => spriteForSide('right'))
function spriteForSide(side) {
  const sc = currentScene.value
  if (!sc) return null
  if (sc.speaker?.side === side) return sc.speaker.sprite
  if (sc.partner?.side === side) return sc.partner.sprite
  return null
}

const bgUrl = computed(() => 'url(' + (currentScene.value?.bg || props.scenario?.scenes?.[0]?.bg) + ')')

const earnedXp = computed(() => {
  const base = props.scenario?.reward?.xp || 100
  const bonus = bestCombo.value >= 2 ? Math.round(base * 0.1 * (bestCombo.value - 1)) : 0
  return base + bonus
})

function emitComplete() {
  emit('complete', { xp: earnedXp.value, coins: props.scenario.reward.coins, hp: hp.value, bestCombo: bestCombo.value })
}

function startQuest() {
  showIntro.value = false
  sceneIndex.value = 0
  playScene()
}

function playScene() {
  showChoices.value = false
  answered.value = false
  selectedIndex.value = -1
  typeText(interpolate(currentScene.value.text))
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
      if (currentScene.value.choice) {
        setTimeout(() => { showChoices.value = true }, 250)
      }
    }
  }, 22)
}

function onStageClick() {
  if (showIntro.value || gameOver.value || finished.value || feedback.value) return
  if (typing.value) {
    clearInterval(typeTimer)
    shownText.value = interpolate(currentScene.value.text)
    typing.value = false
    if (currentScene.value.choice) setTimeout(() => { showChoices.value = true }, 150)
    return
  }
  if (showChoices.value) return
  advance()
}

function advance() {
  if (isLastScene.value) { win(); return }
  sceneIndex.value++
  if (hp.value < maxHp && sceneIndex.value % 2 === 0) heal(1)
  playScene()
}

function choose(i) {
  if (answered.value) return
  answered.value = true
  selectedIndex.value = i
  const opt = currentScene.value.choice.options[i]
  pendingCorrect = !!opt.correct
  feedbackCorrect.value = !!opt.correct
  feedback.value = opt.feedback || (opt.correct ? 'Good call.' : 'Not quite.')
  if (opt.correct) {
    combo.value++
    bestCombo.value = Math.max(bestCombo.value, combo.value)
  } else {
    combo.value = 0
    damage(opt.damage || 1)
  }
}

function afterFeedback() {
  feedback.value = ''
  if (gameOver.value) return
  if (!pendingCorrect) {
    answered.value = false
    selectedIndex.value = -1
    return
  }
  showChoices.value = false
  advance()
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
    setTimeout(() => { feedback.value = ''; gameOver.value = true }, 700)
  }
}

function heal(n) {
  hp.value = Math.min(maxHp, hp.value + n)
  healPulse.value = true
  setTimeout(() => { healPulse.value = false }, 600)
}

function win() { finished.value = true }

function retry() {
  hp.value = maxHp
  sceneIndex.value = 0
  combo.value = 0
  bestCombo.value = 0
  gameOver.value = false
  finished.value = false
  feedback.value = ''
  playScene()
}

function choiceClass(i) {
  if (!answered.value) return ''
  if (i === selectedIndex.value) return feedbackCorrect.value ? 'correct' : 'wrong'
  const opt = currentScene.value.choice.options[i]
  if (opt.correct && !feedbackCorrect.value) return 'reveal'
  return 'muted'
}

function handleKey(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    if (feedback.value) { afterFeedback(); e.preventDefault() }
    else if (showIntro.value) { startQuest(); e.preventDefault() }
    else onStageClick()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKey)
  scenes.value.forEach(s => {
    ;[s.bg, s.speaker?.sprite, s.partner?.sprite].forEach(src => {
      if (src) { const im = new Image(); im.src = src }
    })
  })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKey)
  clearInterval(typeTimer)
})
</script>

<style scoped>
.rpg-stage { position: fixed; inset: 0; overflow: hidden; background: #0d1117; user-select: none; font-family: 'Inter', system-ui, sans-serif; z-index: 60; }
.rpg-bg { position: absolute; inset: -3%; background-size: cover; background-position: center; transform: scale(1.06); transition: background-image 0.5s ease; will-change: transform; animation: bgDrift 24s ease-in-out infinite alternate; }
@keyframes bgDrift { from { transform: scale(1.06) translate(0,0);} to { transform: scale(1.1) translate(-1.5%, -1%);} }
.rpg-bg-vignette { position: absolute; inset: 0; background: radial-gradient(120% 90% at 50% 30%, transparent 40%, rgba(0,0,0,0.45) 100%); pointer-events: none; }
.rpg-damage-flash { position: absolute; inset: 0; background: rgba(220,38,38,0.32); pointer-events: none; z-index: 40; }
.is-shaking { animation: shake 0.42s cubic-bezier(.36,.07,.19,.97); }
@keyframes shake { 10%,90%{transform:translate(-2px,0)} 20%,80%{transform:translate(4px,0)} 30%,50%,70%{transform:translate(-7px,0)} 40%,60%{transform:translate(7px,0)} }
.rpg-hud { position: absolute; top: 0; left: 0; right: 0; padding: 18px 22px; display: flex; align-items: flex-start; justify-content: space-between; z-index: 30; }
.rpg-progress { display: flex; flex-direction: column; gap: 7px; }
.rpg-chapter { font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:#fff; text-shadow:0 1px 4px rgba(0,0,0,.6); }
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
.rpg-combo { position:absolute; top:74px; right:24px; z-index:30; display:flex; flex-direction:column; align-items:flex-end; line-height:.9; }
.rpg-combo-x { font-family:'Space Grotesk',sans-serif; font-weight:800; font-size:38px; color:#F97316; text-shadow:0 2px 8px rgba(0,0,0,.5); transform: skewX(-8deg); }
.rpg-combo-label { font-size:11px; letter-spacing:.3em; color:#fff; font-weight:700; }
.combo-pop-enter-active{ animation: comboIn .35s cubic-bezier(.22,1.6,.4,1);} @keyframes comboIn{from{transform:scale(.3) skewX(-8deg);opacity:0}to{transform:scale(1) skewX(-8deg);opacity:1}}
.rpg-sprite { position:absolute; bottom:0; height: min(78vh, 760px); max-width:46vw; object-fit:contain; z-index:10; filter: drop-shadow(0 12px 24px rgba(0,0,0,.4)); transition: transform .45s cubic-bezier(.22,1,.36,1), filter .35s, opacity .35s; }
.rpg-sprite-left { left: clamp(-40px, -2vw, 0px); transform-origin: bottom left; }
.rpg-sprite-right { right: clamp(-40px, -2vw, 0px); transform-origin: bottom right; }
.rpg-sprite.dim { filter: brightness(.62) drop-shadow(0 12px 24px rgba(0,0,0,.4)); transform: scale(.94) translateY(8px); }
.rpg-sprite.talking { animation: talkBob 1.6s ease-in-out infinite; }
@keyframes talkBob { 0%,100%{ transform: translateY(0)} 50%{ transform: translateY(-6px)} }
.sprite-left-enter-active,.sprite-right-enter-active{ transition: all .5s cubic-bezier(.22,1,.36,1);}
.sprite-left-enter-from{ opacity:0; transform: translateX(-40px) translateY(10px);}
.sprite-right-enter-from{ opacity:0; transform: translateX(40px) translateY(10px);}
.rpg-dialogue { position:absolute; left:50%; bottom: 8%; transform: translateX(-50%); width: min(78vw, 920px); z-index:25; background: rgba(244,240,232,.82); backdrop-filter: blur(8px); border:1px solid rgba(255,255,255,.5); border-radius:18px; padding: 26px 30px 22px; box-shadow: 0 18px 50px rgba(0,0,0,.35); }
.rpg-nameplate { position:absolute; top:-14px; left:24px; background: linear-gradient(135deg,#0D9488,#2DD4BF); color:#fff; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:13px; padding:5px 16px; border-radius:99px; box-shadow:0 4px 12px rgba(13,148,136,.4); }
.rpg-line { font-size: clamp(16px, 2vw, 21px); line-height:1.6; color:#1A1A1A; margin:0; min-height: 2.2em; }
.rpg-caret { color:#0D9488; animation: blink 1s step-end infinite; }
@keyframes blink { 50%{opacity:0} }
.rpg-continue { margin-top:10px; display:flex; align-items:center; justify-content:flex-end; gap:6px; font-size:12px; color:#6b6256; font-weight:600; animation: fadeIn .4s ease; }
.rpg-continue-arrow { animation: nudge 1.1s ease-in-out infinite; }
@keyframes nudge { 0%,100%{transform:translateY(0)} 50%{transform:translateY(3px)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.rpg-choices { position:absolute; left:50%; bottom: 8%; transform: translateX(-50%); width:min(80vw, 940px); z-index:26; display:flex; flex-direction:column; gap:12px; }
.rpg-choice-prompt { color:#fff; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:14px; letter-spacing:.04em; text-shadow:0 2px 6px rgba(0,0,0,.6); margin:0 0 2px 4px; }
.rpg-choice { text-align:left; background: rgba(244,240,232,.92); border:1.5px solid transparent; border-radius:14px; padding:16px 20px; font-size: clamp(14px,1.5vw,17px); color:#1A1A1A; cursor:pointer; transition: transform .18s, background .2s, border-color .2s, box-shadow .2s; box-shadow:0 6px 18px rgba(0,0,0,.22); }
.rpg-choice:hover:not(:disabled){ transform: translateX(6px); background:#fff; border-color:#2DD4BF; box-shadow:0 8px 22px rgba(13,148,136,.25); }
.rpg-choice:disabled{ cursor:default; }
.rpg-choice.correct{ background:#0D9488; color:#fff; border-color:#0D9488; }
.rpg-choice.wrong{ background:#dc2626; color:#fff; border-color:#dc2626; animation: shake .4s; }
.rpg-choice.reveal{ border-color:#0D9488; background:#ccfbf1; }
.rpg-choice.muted{ opacity:.5; }
.choices-rise-enter-active{ transition: all .4s cubic-bezier(.22,1,.36,1);} .choices-rise-enter-from{ opacity:0; transform: translateX(-50%) translateY(24px);}
.rpg-feedback { position:absolute; left:50%; top: 18%; transform: translateX(-50%); width:min(74vw, 640px); z-index:35; background:#fff; border-radius:18px; padding:22px 24px 20px; box-shadow:0 20px 50px rgba(0,0,0,.4); display:flex; flex-direction:column; align-items:center; text-align:center; gap:10px; border-top:5px solid #0D9488; }
.rpg-feedback.bad{ border-top-color:#dc2626; }
.rpg-feedback-icon{ width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800; color:#fff; background:#0D9488; }
.rpg-feedback.bad .rpg-feedback-icon{ background:#dc2626; }
.rpg-feedback p{ margin:0; font-size:15px; line-height:1.55; color:#33302b; }
.rpg-feedback-next{ margin-top:6px; background:#1A1A1A; color:#fff; border:none; border-radius:10px; padding:10px 26px; font-weight:700; cursor:pointer; transition: background .2s; }
.rpg-feedback-next:hover{ background:#0D9488; }
.toast-enter-active{ transition: all .3s cubic-bezier(.22,1.4,.4,1);} .toast-enter-from{ opacity:0; transform: translateX(-50%) translateY(-16px) scale(.96);}
.rpg-overlay { position:absolute; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; background: rgba(8,12,18,.72); backdrop-filter: blur(6px); padding:20px; }
.rpg-overlay-card,.rpg-intro-card { background:#fff; border-radius:24px; padding:38px 34px; max-width:460px; text-align:center; box-shadow:0 30px 80px rgba(0,0,0,.5); animation: cardIn .45s cubic-bezier(.22,1.2,.4,1); }
@keyframes cardIn { from{opacity:0; transform: translateY(24px) scale(.96)} to{opacity:1; transform:none} }
.rpg-overlay-emoji{ font-size:54px; }
.rpg-overlay-card h2,.rpg-intro-card h2{ font-family:'Space Grotesk',sans-serif; font-size:26px; font-weight:800; color:#1A1A1A; margin:10px 0 8px; }
.rpg-overlay-card p,.rpg-intro-card p{ color:#5b5650; font-size:15px; line-height:1.6; margin:0 0 22px; }
.rpg-overlay-actions{ display:flex; gap:12px; justify-content:center; }
.rpg-btn-primary{ background: linear-gradient(135deg,#0D9488,#2DD4BF); color:#fff; border:none; border-radius:12px; padding:13px 30px; font-weight:700; font-size:15px; cursor:pointer; box-shadow:0 10px 24px rgba(13,148,136,.35); transition: transform .15s; }
.rpg-btn-primary:hover{ transform: translateY(-2px); }
.rpg-btn-ghost{ background:transparent; color:#6b6256; border:1.5px solid #d8d2c8; border-radius:12px; padding:13px 26px; font-weight:600; cursor:pointer; }
.rpg-intro-loc{ display:inline-block; font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:#0D9488; font-weight:700; }
.rpg-rewards{ display:flex; gap:18px; justify-content:center; margin-bottom:24px; }
.rpg-reward{ display:flex; flex-direction:column; }
.rpg-reward .v{ font-family:'Space Grotesk',sans-serif; font-weight:800; font-size:26px; color:#0D9488; }
.rpg-reward .l{ font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:#9a948b; }
.overlay-enter-active{ transition: opacity .3s;} .overlay-enter-from{ opacity:0; }
@media (max-width: 640px) {
  .rpg-sprite{ height: 52vh; max-width:60vw; }
  .rpg-dialogue,.rpg-choices{ width: 92vw; bottom: 4%; }
  .rpg-line{ font-size:16px; }
  .rpg-heart{ font-size:24px; }
  .rpg-progress-track{ width:120px; }
}
@media (prefers-reduced-motion: reduce) { .rpg-bg{ animation:none; } .rpg-sprite.talking{ animation:none; } .is-shaking{ animation:none; } }
</style>
