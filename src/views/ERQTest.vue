<template>
  <div class="erq-wrapper">
    <!-- Ambient background -->
    <div class="erq-ambient"></div>

    <!-- Header -->
    <div class="erq-header">
      <button class="erq-back" @click="$router.push('/academy')">← Back</button>
      <div class="erq-phase-badge">
        <span v-if="phase === 'pre'">🌏 Before Your Journey</span>
        <span v-else>🎓 After Your Journey</span>
      </div>
    </div>

    <!-- Intro screen -->
    <section v-if="!started" class="erq-intro">
      <div class="erq-intro-card">
        <div class="erq-intro-icon">{{ phase === 'pre' ? '🌏' : '🎓' }}</div>
        <h1 v-if="phase === 'pre'">Before Your Journey Begins...</h1>
        <h1 v-else>Your Journey Is Complete.</h1>
        <p v-if="phase === 'pre'" class="erq-intro-desc">
          An earthquake has just struck. You're about to experience 10 scenarios.
          There are no right or wrong answers — just choose what feels most natural to you.
        </p>
        <p v-else class="erq-intro-desc">
          You've graduated from the Digital Reserve Corps. But the earthquake storyline continues —
          this time, in the aftermath. How has your thinking changed?
        </p>
        <div class="erq-intro-meta">
          <span>📝 10 scenarios</span>
          <span>⏱️ ~8 min</span>
          <span>🎯 No scoring shown</span>
        </div>
        <button class="erq-start-btn" @click="started = true">
          {{ phase === 'pre' ? 'Begin Scenarios →' : 'Start Final Reflection →' }}
        </button>
      </div>
    </section>

    <!-- Scenario cards -->
    <section v-else-if="currentQ < questions.length" class="erq-scenario">
      <div class="erq-progress">
        <div class="erq-progress-bar">
          <div class="erq-progress-fill" :style="{ width: ((currentQ + 1) / questions.length * 100) + '%' }"></div>
        </div>
        <span class="erq-progress-text">{{ currentQ + 1 }} / {{ questions.length }}</span>
      </div>

      <div class="erq-scenario-card" :key="currentQ">
        <div class="erq-scenario-context">
          <span class="erq-scenario-icon">🌋</span>
          <p class="erq-scenario-text">{{ questions[currentQ].scenario }}</p>
        </div>

        <div class="erq-options">
          <button
            v-for="(opt, i) in shuffledOptions"
            :key="i"
            :class="['erq-option', { selected: selectedOption === i, revealed: selectedOption !== null }]"
            :disabled="selectedOption !== null"
            @click="selectOption(i, opt)"
          >
            <span class="erq-option-letter">{{ ['A', 'B', 'C'][i] }}</span>
            <span class="erq-option-text">{{ opt.text }}</span>
          </button>
        </div>

        <button v-if="selectedOption !== null" class="erq-next-btn" @click="nextQuestion">
          {{ currentQ < questions.length - 1 ? 'Next Scenario →' : 'Finish →' }}
        </button>
      </div>
    </section>

    <!-- Completion screen -->
    <section v-else class="erq-complete">
      <div class="erq-complete-card">
        <div class="erq-complete-icon">{{ phase === 'pre' ? '🚀' : '🏆' }}</div>
        <h1 v-if="phase === 'pre'">Ready to Begin!</h1>
        <h1 v-else>Reflection Complete!</h1>
        <p v-if="phase === 'pre'" class="erq-complete-desc">
          Thank you for sharing how you'd respond in those situations.
          Your answers help Lia understand where you're starting from — now let's begin your journey!
        </p>
        <p v-else class="erq-complete-desc">
          You've come so far. From your first day at school to the frontlines of disaster response —
          your growth is remarkable. Welcome to the Digital Reserve Corps. 💛
        </p>
        <button class="erq-continue-btn" @click="finish">
          {{ phase === 'pre' ? 'Start Chapter 1 →' : 'Return to Academy →' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'

const route = useRoute()
const router = useRouter()
const store = useResiliaStore()

const phase = computed(() => route.params.phase || 'pre')
const questions = computed(() => phase.value === 'pre' ? store.erqPreTest : store.erqPostTest)

const started = ref(false)
const currentQ = ref(0)
const selectedOption = ref(null)

// Shuffle options so score order isn't obvious
const shuffledOptions = computed(() => {
  const opts = [...questions.value[currentQ.value]?.options || []]
  // Fisher-Yates shuffle with seeded randomness based on question id
  const seed = questions.value[currentQ.value]?.id || 0
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(((seed * 31 + i * 17) % 100) / 100 * (i + 1))
    ;[opts[i], opts[j]] = [opts[j], opts[i]]
  }
  return opts
})

function selectOption(index, option) {
  selectedOption.value = index
  store.saveErqScore(phase.value, questions.value[currentQ.value].id, option.score)
}

function nextQuestion() {
  selectedOption.value = null
  currentQ.value++
}

function finish() {
  if (phase.value === 'pre') {
    router.push('/academy')
  } else {
    router.push('/academy')
  }
}
</script>

<style scoped>
.erq-wrapper {
  min-height: 100vh;
  position: relative;
  padding: 24px 16px 80px;
  max-width: 640px;
  margin: 0 auto;
}

.erq-ambient {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at 30% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 60%),
              radial-gradient(ellipse at 70% 80%, rgba(239, 68, 68, 0.06) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

.erq-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.erq-back {
  background: none;
  border: none;
  color: var(--text-secondary, #64748b);
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  font-family: inherit;
}

.erq-phase-badge {
  font-size: 13px;
  font-weight: 600;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  padding: 6px 14px;
  border-radius: 20px;
}

/* Intro */
.erq-intro-card {
  text-align: center;
  padding: 48px 24px;
  background: white;
  border-radius: 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  animation: fadeSlideUp 0.6s ease;
}

.dark .erq-intro-card {
  background: #1e293b;
}

.erq-intro-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.erq-intro-card h1 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 12px;
  color: var(--text-primary, #0f172a);
}

.dark .erq-intro-card h1 {
  color: #f1f5f9;
}

.erq-intro-desc {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary, #64748b);
  max-width: 420px;
  margin: 0 auto 24px;
}

.erq-intro-meta {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
  font-size: 12px;
  color: var(--text-secondary, #94a3b8);
}

.erq-start-btn, .erq-continue-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  padding: 14px 36px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.erq-start-btn:hover, .erq-continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
}

/* Progress */
.erq-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.erq-progress-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.dark .erq-progress-bar {
  background: #334155;
}

.erq-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #ef4444);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.erq-progress-text {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary, #64748b);
  min-width: 44px;
  text-align: right;
}

/* Scenario card */
.erq-scenario-card {
  background: white;
  border-radius: 24px;
  padding: 28px 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  animation: fadeSlideUp 0.4s ease;
}

.dark .erq-scenario-card {
  background: #1e293b;
}

.erq-scenario-context {
  display: flex;
  gap: 14px;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(245, 158, 11, 0.06);
  border-radius: 16px;
  border-left: 4px solid #f59e0b;
}

.erq-scenario-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.erq-scenario-text {
  font-size: 15px;
  line-height: 1.65;
  color: var(--text-primary, #1e293b);
}

.dark .erq-scenario-text {
  color: #e2e8f0;
}

/* Options */
.erq-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.erq-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-family: inherit;
  width: 100%;
}

.dark .erq-option {
  background: #0f172a;
  border-color: #334155;
}

.erq-option:hover:not(:disabled) {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.04);
  transform: translateY(-1px);
}

.erq-option.selected {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
}

.erq-option:disabled:not(.selected) {
  opacity: 0.4;
  cursor: default;
}

.erq-option-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #e2e8f0;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  flex-shrink: 0;
}

.erq-option.selected .erq-option-letter {
  background: #f59e0b;
  color: white;
}

.erq-option-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary, #1e293b);
}

.dark .erq-option-text {
  color: #cbd5e1;
}

.erq-next-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
}

.erq-next-btn:hover {
  transform: translateY(-1px);
}

/* Complete */
.erq-complete-card {
  text-align: center;
  padding: 48px 24px;
  background: white;
  border-radius: 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  animation: fadeSlideUp 0.6s ease;
}

.dark .erq-complete-card {
  background: #1e293b;
}

.erq-complete-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.erq-complete-card h1 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 12px;
  color: var(--text-primary, #0f172a);
}

.dark .erq-complete-card h1 {
  color: #f1f5f9;
}

.erq-complete-desc {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary, #64748b);
  max-width: 420px;
  margin: 0 auto 28px;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
