<template>
  <div class="act-lesson-wrapper" :class="{ 'act-embedded': embedded }">
    <!-- Top Progress Bar -->
    <div class="act-topbar">
      <button class="back-btn" @click="goBack">← Back</button>
      <div class="progress-pills">
        <span v-for="(act, i) in chapterActs" :key="i" :class="['pill', { active: act.id === actId, done: isCompleted(act.id) }]"></span>
      </div>
      <span class="act-label">{{ actData?.title || '' }}</span>
    </div>

    <!-- Pre-test (Act 1 only) -->
    <section v-if="actData?.hasPreTest && phase === 'pretest'" class="test-section">
      <div class="test-card">
        <div class="test-badge">📝 Knowledge Check</div>
        <h2>Before we begin...</h2>
        <p>Let's see what you already know about <strong>{{ chapterData?.subtitle }}</strong>.</p>
        <div v-if="!testStarted" class="test-intro">
          <p class="test-hint">{{ preTestQuestions.length }} questions · No penalties</p>
          <button class="primary-btn" @click="testStarted = true">Start Knowledge Check</button>
        </div>
        <div v-else>
          <div class="question-card" v-if="currentTestQ < preTestQuestions.length">
            <p class="q-number">Question {{ currentTestQ + 1 }} / {{ preTestQuestions.length }}</p>
            <p class="q-text">{{ preTestQuestions[currentTestQ].question }}</p>
            <button
              v-for="(opt, j) in preTestQuestions[currentTestQ].options"
              :key="j"
              :class="['answer-btn', { selected: preTestAnswers[currentTestQ] === j, correct: showPreTestResult && j === preTestQuestions[currentTestQ].correct, wrong: showPreTestResult && preTestAnswers[currentTestQ] === j && j !== preTestQuestions[currentTestQ].correct }]"
              @click="answerPreTest(j)"
              :disabled="showPreTestResult"
            >
              {{ opt }}
            </button>
            <button v-if="showPreTestResult" class="next-q-btn" @click="nextPreTestQ()">
              {{ currentTestQ < preTestQuestions.length - 1 ? 'Next →' : 'Continue to Lesson →' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Video Phase -->
    <section v-if="phase === 'video'" class="video-section">
      <div class="video-player-container">
        <iframe 
          v-if="actData?.videoUrl"
          :src="actData.videoUrl" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
          class="video-iframe">
        </iframe>
        <iframe 
          v-else
          src="https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?rel=0&showinfo=0" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
          class="video-iframe">
        </iframe>
      </div>
      <div class="video-header">
        <h3>{{ actData?.videoTitle }}</h3>
        <p>{{ actData?.videoDesc }}</p>
        <div class="video-meta">
          <span>🕐 {{ actData?.duration }}</span>
          <span>📖 {{ chapterData?.title }}</span>
        </div>
        <button class="primary-btn mt-4" @click="completeVideo()">I've watched this video →</button>
      </div>

      <!-- Content cards below the video -->
      <div class="content-cards">
        <div class="content-card">
          <h4>📋 Key Takeaways</h4>
          <p>{{ actData?.description }}</p>
        </div>
        <div class="content-card">
          <h4>🌏 Cultural Context</h4>
          <p>{{ chapterData?.location }} — Understanding local perspectives on disaster response and community resilience.</p>
        </div>
      </div>
    </section>

    <!-- Quiz Phase (after video) -->
    <section v-if="phase === 'quiz'" class="test-section">
      <div class="test-card">
        <div class="test-badge quiz-badge">🎯 Quick Quiz</div>
        <h2>Check Your Understanding</h2>
        <div class="question-card" v-if="currentQuizQ < quizQuestions.length">
          <p class="q-number">Question {{ currentQuizQ + 1 }} / {{ quizQuestions.length }}</p>
          <p class="q-text">{{ quizQuestions[currentQuizQ].question }}</p>
          <button
            v-for="(opt, j) in quizQuestions[currentQuizQ].options"
            :key="j"
            :class="['answer-btn', { selected: quizAnswers[currentQuizQ] === j, correct: showQuizResult && j === quizQuestions[currentQuizQ].correct, wrong: showQuizResult && quizAnswers[currentQuizQ] === j && j !== quizQuestions[currentQuizQ].correct }]"
            @click="answerQuiz(j)"
            :disabled="showQuizResult"
          >
            {{ opt }}
          </button>
          <button v-if="showQuizResult" class="next-q-btn" @click="nextQuizQ()">
            {{ currentQuizQ < quizQuestions.length - 1 ? 'Next →' : 'Finish →' }}
          </button>
        </div>
      </div>
    </section>

    <!-- Post-test (Act 4 only) -->
    <section v-if="actData?.hasPostTest && phase === 'posttest'" class="test-section">
      <div class="test-card">
        <div class="test-badge post-badge">🏆 Chapter Review</div>
        <h2>Final Review</h2>
        <p>Let's see how much you've learned across all 4 acts of <strong>{{ chapterData?.title }}</strong>.</p>
        <div v-if="!postTestStarted" class="test-intro">
          <p class="test-hint">{{ postTestQuestions.length }} questions · Need 80% to pass</p>
          <button class="primary-btn" @click="postTestStarted = true">Start Chapter Review</button>
        </div>
        <div v-else>
          <div class="question-card" v-if="currentPostQ < postTestQuestions.length">
            <p class="q-number">Question {{ currentPostQ + 1 }} / {{ postTestQuestions.length }}</p>
            <p class="q-text">{{ postTestQuestions[currentPostQ].question }}</p>
            <button
              v-for="(opt, j) in postTestQuestions[currentPostQ].options"
              :key="j"
              :class="['answer-btn', { selected: postTestAnswers[currentPostQ] === j, correct: showPostResult && j === postTestQuestions[currentPostQ].correct, wrong: showPostResult && postTestAnswers[currentPostQ] === j && j !== postTestQuestions[currentPostQ].correct }]"
              @click="answerPostTest(j)"
              :disabled="showPostResult"
            >
              {{ opt }}
            </button>
            <button v-if="showPostResult" class="next-q-btn" @click="nextPostQ()">
              {{ currentPostQ < postTestQuestions.length - 1 ? 'Next →' : 'Submit →' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Completion -->
    <section v-if="phase === 'complete'" class="complete-section">
      <div class="complete-card">
        <div class="complete-icon">🎉</div>
        <h2>{{ actData?.title }} Complete!</h2>
        <p>+{{ actData?.xpReward }} XP · +{{ actData?.coinReward }} ResiCoins</p>

        <!-- Last act: show contextual buttons -->
        <template v-if="isLastAct && embedded">
          <div class="complete-actions">
            <button v-if="chapterData?.liaChat?.post && !hasCompletedLiaPost" class="primary-btn lia-wrap-btn" @click="emit('open-lia-post', { chapterId: chapterId })">
              💬 Wrap-up with Lia
            </button>
            <button v-if="chapterData?.bridgeId && !store.completedBridgingQuests.includes(chapterData.bridgeId)" class="primary-btn" @click="emit('open-bridge', { bridgeId: chapterData.bridgeId })">
              📖 Continue Story →
            </button>
            <button v-if="chapterData?.questId && !store.completedChapterQuests?.includes(chapterData.questId)" class="secondary-btn" @click="emit('open-quest', { questId: chapterData.questId })">
              ⚔️ RPG Quest
            </button>
            <button class="back-btn" @click="emit('close')">
              ← Back to Academy
            </button>
          </div>
        </template>

        <!-- Not last act: continue to next -->
        <template v-else>
          <button class="primary-btn" @click="goNext()">
            {{ isLastAct ? 'Start RPG Quest →' : 'Continue to Next Act →' }}
          </button>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import { safeNavigate } from '../utils/safeNavigate'

const props = defineProps({
  propChapterId: { type: String, default: '' },
  propActId: { type: String, default: '' },
  embedded: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'next-act', 'open-quest', 'open-bridge', 'open-lia-post'])

const route = useRoute()
const router = useRouter()
const store = useResiliaStore()

const chapterId = computed(() => props.propChapterId || route.params.chapterId)
const actId = computed(() => props.propActId || route.params.actId)

const chapterData = computed(() => store.academyChapters.find(c => c.id === chapterId.value))
const chapterActs = computed(() => chapterData.value?.acts || [])
const actData = computed(() => chapterActs.value.find(a => a.id === actId.value))
const actIndex = computed(() => chapterActs.value.findIndex(a => a.id === actId.value))
const isLastAct = computed(() => actIndex.value === chapterActs.value.length - 1)
const hasCompletedLiaPost = computed(() => {
  const scores = store.liaEvalScores?.[chapterId.value]?.post
  return scores && Object.keys(scores).length > 0
})

function isCompleted(aId) {
  return store.isActCompleted(chapterId.value, aId)
}

// Phase management
const phase = ref('video') // pretest → video → quiz → posttest → complete

function initPhase() {
  if (actData.value?.hasPreTest) {
    phase.value = 'pretest'
  } else {
    phase.value = 'video'
  }
  // Reset states
  testStarted.value = false
  currentTestQ.value = 0
  showPreTestResult.value = false
  currentQuizQ.value = 0
  showQuizResult.value = false
  postTestStarted.value = false
  currentPostQ.value = 0
  showPostResult.value = false
}

onMounted(() => {
  initPhase()
})

import { watch } from 'vue'
watch(actId, () => {
  initPhase()
})

// ── Pre-Test ──
const testStarted = ref(false)
const currentTestQ = ref(0)
const preTestAnswers = ref({})
const showPreTestResult = ref(false)

const preTestQuestions = computed(() => actData.value?.quiz?.slice(0, 1) || [
  { question: `What is the main focus of ${chapterData.value?.subtitle}?`, options: ['Entertainment', chapterData.value?.subtitle || 'This topic', 'Cooking', 'Sports'], correct: 1 },
])

function answerPreTest(j) {
  preTestAnswers.value[currentTestQ.value] = j
  showPreTestResult.value = true
}

function nextPreTestQ() {
  showPreTestResult.value = false
  if (currentTestQ.value < preTestQuestions.value.length - 1) {
    currentTestQ.value++
  } else {
    phase.value = 'video'
  }
}

// ── Video ──
function completeVideo() {
  phase.value = 'quiz'
}

// ── Quiz ──
const currentQuizQ = ref(0)
const quizAnswers = ref({})
const showQuizResult = ref(false)

const quizQuestions = computed(() => actData.value?.quiz || [
  { question: `Based on the video "${actData.value?.videoTitle}", what is the key concept?`, options: ['Ignore warnings', 'Act with empathy and preparedness', 'Wait for others', 'Panic immediately'], correct: 1 },
])

function answerQuiz(j) {
  quizAnswers.value[currentQuizQ.value] = j
  showQuizResult.value = true
}

function nextQuizQ() {
  showQuizResult.value = false
  if (currentQuizQ.value < quizQuestions.value.length - 1) {
    currentQuizQ.value++
  } else {
    if (actData.value?.hasPostTest) {
      phase.value = 'posttest'
    } else {
      finishAct()
    }
  }
}

// ── Post-Test ──
const postTestStarted = ref(false)
const currentPostQ = ref(0)
const postTestAnswers = ref({})
const showPostResult = ref(false)

const postTestQuestions = computed(() => actData.value?.quiz?.slice(-2) || [
  { question: `Across all acts of ${chapterData.value?.title}, what is the central theme?`, options: ['Individual heroism', 'Community resilience and cultural sensitivity', 'Military response', 'Economic growth'], correct: 1 },
  { question: 'PFA stands for:', options: ['Personal Finance Advice', 'Psychological First Aid', 'Public Fire Alert', 'Professional Faculty Association'], correct: 1 },
])

function answerPostTest(j) {
  postTestAnswers.value[currentPostQ.value] = j
  showPostResult.value = true
}

function nextPostQ() {
  showPostResult.value = false
  if (currentPostQ.value < postTestQuestions.value.length - 1) {
    currentPostQ.value++
  } else {
    // Calculate score
    let correct = 0
    postTestQuestions.value.forEach((q, i) => {
      if (postTestAnswers.value[i] === q.correct) correct++
    })
    const score = Math.round((correct / postTestQuestions.value.length) * 100)
    store.submitPostTest(chapterId.value, score)
    finishAct()
  }
}

// ── Completion ──
function finishAct() {
  store.completeAct(chapterId.value, actId.value)
  phase.value = 'complete'
}

function goBack() {
  if (props.embedded) {
    emit('close')
  } else {
    router.push('/academy')
  }
}

function goNext() {
  if (isLastAct.value) {
    // Go to chapter quest
    if (props.embedded) {
      if (chapterData.value?.questId) {
        emit('open-quest', { questId: chapterData.value.questId })
      } else {
        emit('close')
      }
    } else {
      safeNavigate(router, `/academy/quest/${chapterData.value?.questId}`)
    }
  } else {
    // Go to next act
    const nextAct = chapterActs.value[actIndex.value + 1]
    if (nextAct) {
      if (props.embedded) {
        emit('next-act', { chapterId: chapterId.value, actId: nextAct.id, chatSimulation: nextAct.chatSimulation })
      } else {
        safeNavigate(router, `/academy/chapter/${chapterId.value}/act/${nextAct.id}`)
      }
    }
  }
}
</script>

<style scoped>
.act-lesson-wrapper {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 16px 40px;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, sans-serif;
}

.act-lesson-wrapper.act-embedded {
  max-width: 100%;
  min-height: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 0 16px 24px;
}

/* ──── Top Bar ──── */
.act-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-sand-50, #FAFAF8);
  backdrop-filter: blur(20px);
  padding: 16px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

:where(.dark, .dark *) .act-topbar {
  background: rgba(20, 18, 16, 0.95);
  border-bottom-color: rgba(255,255,255,0.06);
}

.back-btn {
  background: none;
  border: none;
  color: #0D9488;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
}
.back-btn:hover { background: rgba(13,148,136,0.1); }

.progress-pills {
  display: flex;
  gap: 6px;
  flex: 1;
}
.pill {
  height: 4px;
  flex: 1;
  border-radius: 4px;
  background: rgba(0,0,0,0.08);
  transition: background 0.3s;
}
:where(.dark, .dark *) .pill { background: rgba(255,255,255,0.1); }
.pill.active { background: #0D9488; }
.pill.done { background: #22C55E; }

.act-label {
  font-size: 0.75rem;
  color: #9CA3AF;
  white-space: nowrap;
}

/* ──── Video Section ──── */
.video-section {
  margin-top: 24px;
}

.video-player-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  background: #000;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.video-header {
  text-align: center;
  padding: 10px 0 20px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
:where(.dark, .dark *) .video-header { border-bottom-color: rgba(255,255,255,0.06); }

.video-header h3 {
  color: var(--color-ink, #1A1A1A);
  font-size: 1.25rem;
  margin: 0 0 8px;
}
:where(.dark, .dark *) .video-header h3 { color: #F3F0EB; }
.video-header p {
  color: #6B7280;
  font-size: 0.9rem;
  margin: 0 0 16px;
}
:where(.dark, .dark *) .video-header p { color: #9CA3AF; }

.video-meta {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 0.8rem;
  color: #6B7280;
}

/* ──── Content Cards ──── */
.content-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}
.content-card {
  background: rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 14px;
  padding: 16px 20px;
}
:where(.dark, .dark *) .content-card {
  background: rgba(255,255,255,0.03);
  border-color: rgba(255,255,255,0.06);
}
.content-card h4 {
  color: var(--color-ink, #1A1A1A);
  font-size: 0.9rem;
  margin: 0 0 6px;
}
:where(.dark, .dark *) .content-card h4 { color: #E8E0D4; }
.content-card p {
  color: #6B7280;
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.5;
}
:where(.dark, .dark *) .content-card p { color: #9CA3AF; }

/* ──── Test / Quiz Section ──── */
.test-section {
  margin-top: 24px;
}

.test-card {
  background: rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 20px;
  padding: 32px 24px;
}
:where(.dark, .dark *) .test-card {
  background: rgba(255,255,255,0.03);
  border-color: rgba(255,255,255,0.08);
}

.test-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(59,130,246,0.15);
  color: #60A5FA;
  margin-bottom: 16px;
}
.quiz-badge { background: rgba(168,85,247,0.15); color: #C084FC; }
.post-badge { background: rgba(234,179,8,0.15); color: #FACC15; }

.test-card h2 {
  color: var(--color-ink, #1A1A1A);
  font-size: 1.3rem;
  margin: 0 0 8px;
}
:where(.dark, .dark *) .test-card h2 { color: #F3F0EB; }
.test-card > p {
  color: #6B7280;
  font-size: 0.9rem;
  margin: 0 0 20px;
}
:where(.dark, .dark *) .test-card > p { color: #9CA3AF; }

.test-intro {
  text-align: center;
}
.test-hint {
  color: #6B7280;
  font-size: 0.8rem;
  margin: 0 0 16px;
}

.question-card {
  margin-top: 8px;
}
.q-number {
  color: #6B7280;
  font-size: 0.75rem;
  margin: 0 0 8px;
}
.q-text {
  color: var(--color-ink, #1A1A1A);
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 16px;
  line-height: 1.5;
}
:where(.dark, .dark *) .q-text { color: #E8E0D4; }

.answer-btn {
  display: block;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  color: var(--color-ink, #1A1A1A);
  font-size: 0.88rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}
:where(.dark, .dark *) .answer-btn {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.1);
  color: #D4CFC6;
}
.answer-btn:hover:not(:disabled) {
  background: rgba(0,0,0,0.04);
  border-color: rgba(0,0,0,0.15);
}
:where(.dark, .dark *) .answer-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.2);
}
.answer-btn.selected { border-color: #0D9488; background: rgba(13,148,136,0.1); }
.answer-btn.correct { border-color: #22C55E; background: rgba(34,197,94,0.15); color: #16A34A; }
:where(.dark, .dark *) .answer-btn.correct { color: #4ADE80; }
.answer-btn.wrong { border-color: #EF4444; background: rgba(239,68,68,0.15); color: #DC2626; }
:where(.dark, .dark *) .answer-btn.wrong { color: #FCA5A5; }

.next-q-btn {
  margin-top: 12px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #0D9488, #0F766E);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
  float: right;
}

/* ──── Primary Button ──── */
.primary-btn {
  padding: 14px 28px;
  background: linear-gradient(135deg, #0D9488, #0F766E);
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(13,148,136,0.3);
}
.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13,148,136,0.4);
}

/* ──── Complete Section ──── */
.complete-section {
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
.complete-card {
  text-align: center;
  padding: 40px 32px;
  background: rgba(0,0,0,0.02);
  border: 1px solid rgba(34,197,94,0.2);
  border-radius: 24px;
}
:where(.dark, .dark *) .complete-card {
  background: rgba(255,255,255,0.03);
}
.complete-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: bounceIn 0.5s;
}
.complete-card h2 {
  color: var(--color-ink, #1A1A1A);
  font-size: 1.4rem;
  margin: 0 0 8px;
}
:where(.dark, .dark *) .complete-card h2 { color: #F3F0EB; }
.complete-card p {
  color: #22C55E;
  font-size: 0.95rem;
  margin: 0 0 24px;
}

.complete-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.secondary-btn {
  padding: 12px 24px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.25s;
  border: 2px solid #0D9488;
  background: transparent;
  color: #0D9488;
}
.secondary-btn:hover {
  background: rgba(13,148,136,0.1);
}
:where(.dark, .dark *) .secondary-btn {
  border-color: #2DD4BF;
  color: #2DD4BF;
}

.complete-card .back-btn {
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #9CA3AF;
  background: transparent;
  border: none;
  cursor: pointer;
}
.complete-card .back-btn:hover {
  color: #0D9488;
}

@keyframes bounceIn {
  from { transform: scale(0); }
  50% { transform: scale(1.2); }
  to { transform: scale(1); }
}
</style>
