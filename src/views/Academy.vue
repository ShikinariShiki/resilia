<template>
  <div>
    <TourGuide :steps="academyTourSteps" tourKey="academy" />

    <!-- Mission Dossier Header -->
    <div class="dossier-header mb-6 animate-slide-up">
      <div class="flex items-center gap-3 mb-2">
        <span class="text-2xl">📁</span>
        <div>
          <h1 class="font-heading font-bold text-xl text-ink dark:text-white tracking-tight">Mission Dossier</h1>
          <p class="text-[10px] font-heading uppercase tracking-[0.2em] text-amber-600/80 dark:text-amber-400/60">
            CLASSIFIED · LIA'S ASEAN JOURNEY · {{ completedChapters }}/{{ store.academyChapters.length }} FILES PROCESSED
          </p>
        </div>
      </div>

      <div class="mt-3 flex items-center gap-3">
        <div class="flex-1 h-2 rounded-full bg-slate-200/50 dark:bg-slate-700/50 overflow-hidden">
          <div class="h-full bg-gradient-to-r from-amber-400 to-teal-500 rounded-full transition-all duration-1000 ease-out"
            :style="{ width: overallProgress + '%' }"></div>
        </div>
        <span class="text-[10px] font-heading font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap">
          {{ Math.round(overallProgress) }}%
        </span>
      </div>

      <div class="flex gap-4 mt-4">
        <div class="dossier-stat">
          <span class="text-sm font-heading font-bold text-teal-600 dark:text-teal-400">{{ totalActsCompleted }}</span>
          <span class="text-[8px] uppercase tracking-wider text-gray-400">Acts Done</span>
        </div>
        <div class="dossier-stat">
          <span class="text-sm font-heading font-bold text-orange-500">{{ store.completedChapterQuests?.length || 0 }}</span>
          <span class="text-[8px] uppercase tracking-wider text-gray-400">Quests</span>
        </div>
        <div v-if="showSimHP" class="dossier-stat">
          <span class="text-sm font-heading font-bold text-red-500">❤️ {{ store.simulationHP }}</span>
          <span class="text-[8px] uppercase tracking-wider text-gray-400">Sim HP</span>
        </div>
      </div>
    </div>

    <!-- ERQ Pre-Test Banner -->
    <div v-if="!store.erqCompleted.pre" class="mb-6 animate-slide-up" style="animation-delay: 0.06s">
      <div class="dossier-alert border-l-4 border-red-500 bg-red-50/50 dark:bg-red-900/10 rounded-r-2xl p-4">
        <div class="flex items-center gap-3">
          <span class="text-xl">🔐</span>
          <div class="flex-1">
            <p class="font-heading font-bold text-xs text-red-700 dark:text-red-300">PREREQUISITE: Emotion Regulation Assessment</p>
            <p class="text-[10px] text-red-500/70 dark:text-red-400/60 font-body mt-0.5">Complete before accessing mission files</p>
          </div>
          <RouterLink to="/academy/erq/pre" class="px-4 py-2 bg-red-500 text-white text-[10px] font-heading font-bold rounded-xl hover:-translate-y-0.5 transition-all">
            Begin →
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════ -->
    <!-- HSR-STYLE BOOK LAYOUT (Two-Panel)      -->
    <!-- ═══════════════════════════════════════ -->
    <div class="book-container" :class="{ 'book-opened': bookOpened, 'book-closed': !bookOpened }">
      <!-- Book spine divider -->
      <div class="book-spine"></div>

      <!-- LEFT PANEL — Chapter File Tabs (like book chapters/map tabs) -->
      <div class="book-left">
        <div class="book-tabs-header">
          <span class="text-[9px] font-heading uppercase tracking-widest text-amber-700/60 dark:text-amber-400/40">Table of Contents</span>
        </div>

        <div class="book-tabs-scroll">
          <button v-for="(chapter, idx) in store.academyChapters" :key="chapter.id"
            class="book-tab"
            :class="{
              'tab-selected': selectedFolder === chapter.id,
              'tab-completed': chapter.status === 'completed',
              'tab-active': chapter.status === 'available' && !isChapterLocked(chapter),
              'tab-locked': isChapterLocked(chapter),
            }"
            @click="openFolder(chapter)">

            <!-- Tab color bar -->
            <div class="tab-color-bar" :style="{ backgroundColor: selectedFolder === chapter.id ? chapter.color : 'transparent' }"></div>

            <!-- Tab content -->
            <div class="tab-content">
              <span class="tab-number" :style="selectedFolder === chapter.id ? { color: chapter.color } : {}">
                {{ chapterDisplayId(chapter.id) }}
              </span>
              <span class="tab-icon">{{ chapter.icon }}</span>
              <div class="tab-text">
                <span class="tab-title">{{ chapter.title.replace(/Chapter \d+(\.\d+)?\s*—\s*/, '') }}</span>
                <span class="tab-status">
                  {{ chapter.status === 'completed' ? '✓ Done' : isChapterLocked(chapter) ? '🔒' : 'Active' }}
                </span>
              </div>
            </div>

            <!-- Progress dots (mini) -->
            <div v-if="chapter.acts && !isChapterLocked(chapter)" class="tab-dots">
              <span v-for="act in chapter.acts" :key="act.id"
                class="tab-dot"
                :class="store.isActCompleted(chapter.id, act.id) ? 'dot-done' : 'dot-pending'"
                :style="store.isActCompleted(chapter.id, act.id) ? { backgroundColor: chapter.color } : {}">
              </span>
            </div>
          </button>
        </div>
      </div>

      <!-- RIGHT PANEL — Chapter Page (acts & details) -->
      <div class="book-right">
        <!-- Embedded ActLesson overlay -->
        <div v-if="actMode" class="book-chat-panel" :key="'act-' + actMode.chapterId + '-' + actMode.actId">
          <ActLesson
            :propChapterId="actMode.chapterId"
            :propActId="actMode.actId"
            :embedded="true"
            @close="closeAct"
            @next-act="handleNextAct"
          />
        </div>

        <!-- Embedded LiaChat overlay -->
        <div v-else-if="chatMode" class="book-chat-panel" :key="chatMode.chapterId + (chatMode.actId || chatMode.phase)">
          <LiaChat
            :propChapterId="chatMode.chapterId"
            :propPhase="chatMode.phase || ''"
            :propActId="chatMode.actId || ''"
            :embedded="true"
            @close="closeChat"
          />
        </div>

        <!-- Empty state -->
        <div v-else-if="!selectedFolder" class="book-empty">
          <div class="book-empty-icon">📂</div>
          <p class="book-empty-text">Select a chapter file to view</p>
          <p class="book-empty-sub">Click any chapter on the left to open its contents</p>
        </div>

        <!-- Chapter page content -->
        <div v-else-if="selectedChapter && !chatMode && !actMode" class="book-page" :key="selectedFolder">
          <!-- Page header -->
          <div class="page-header" :style="{ borderBottomColor: selectedChapter.color + '40' }">
            <span class="page-icon">{{ selectedChapter.icon }}</span>
            <div class="page-header-text">
              <h2 class="page-title">{{ selectedChapter.title }}</h2>
              <p class="page-desc">{{ selectedChapter.description }}</p>
            </div>
          </div>

          <!-- Destinations -->
          <div v-if="selectedChapter.destinations?.length" class="page-destinations">
            <span v-for="dest in selectedChapter.destinations" :key="dest" class="dest-tag">{{ dest }}</span>
          </div>

          <!-- Lia Chat gate -->
          <div v-if="selectedChapter.liaChat" class="page-section">
            <div v-if="isLiaGated(selectedChapter) && !hasCompletedLiaPhase(selectedChapter.id, 'pre')" class="page-lia-gate">
              <p class="text-[11px] text-teal-600 dark:text-teal-400 font-body mb-2">🔒 Chat with Lia to unlock acts</p>
              <button @click="openChat(selectedChapter.id, 'pre')"
                class="page-btn bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                💬 Chat with Lia
              </button>
            </div>
            <button
              v-else-if="!hasCompletedLiaPhase(selectedChapter.id, 'pre')"
              @click="openChat(selectedChapter.id, 'pre')"
              class="page-btn bg-gradient-to-r from-teal-500 to-teal-600 text-white">
              💬 Chat with Lia
            </button>
            <span v-else class="page-status-badge text-teal-500">✓ Lia chat complete</span>
          </div>

          <!-- Acts list -->
          <div v-if="selectedChapter.acts && !(isLiaGated(selectedChapter) && !hasCompletedLiaPhase(selectedChapter.id, 'pre'))" class="page-acts">
            <div v-for="(act, ai) in selectedChapter.acts" :key="act.id" class="page-act"
              :class="{
                'act-done': store.isActCompleted(selectedChapter.id, act.id),
                'act-active': canAccessAct(selectedChapter.id, ai) && !store.isActCompleted(selectedChapter.id, act.id),
                'act-locked': !canAccessAct(selectedChapter.id, ai),
              }">
              <div class="act-indicator"
                :class="store.isActCompleted(selectedChapter.id, act.id) ? 'bg-teal-500 text-white' : canAccessAct(selectedChapter.id, ai) ? 'bg-white dark:bg-slate-600 text-gray-400' : 'bg-gray-200 dark:bg-slate-700 text-gray-300'">
                {{ store.isActCompleted(selectedChapter.id, act.id) ? '✓' : canAccessAct(selectedChapter.id, ai) ? '○' : '🔒' }}
              </div>
              <div class="act-info">
                <span class="act-title">{{ act.title }}</span>
                <span class="act-duration">{{ act.duration }}</span>
              </div>
              <button v-if="canAccessAct(selectedChapter.id, ai) && !store.isActCompleted(selectedChapter.id, act.id)"
                @click="act.chatSimulation ? openChat(selectedChapter.id, '', act.id) : openAct(selectedChapter.id, act.id)"
                class="act-start-btn" :style="{ color: selectedChapter.color }">
                {{ act.chatSimulation ? '💬 Play' : 'Start' }} →
              </button>
              <span v-else-if="store.isActCompleted(selectedChapter.id, act.id)" class="text-[10px] font-heading font-bold text-teal-500">Done</span>
            </div>
          </div>

          <!-- Bottom actions -->
          <div v-if="selectedChapter.acts && selectedChapter.status !== 'locked'" class="page-actions">
            <RouterLink v-if="allActsCompleted(selectedChapter) && selectedChapter.questId && !store.completedChapterQuests?.includes(selectedChapter.questId)"
              :to="`/academy/quest/${selectedChapter.questId}`"
              class="page-btn" :style="{ backgroundColor: selectedChapter.color, color: 'white' }">
              ⚔️ RPG Quest
            </RouterLink>
            <span v-if="store.completedChapterQuests?.includes(selectedChapter?.questId)" class="page-status-badge text-teal-500">✓ Quest Complete</span>

            <button
              v-if="selectedChapter.liaChat && store.completedChapterQuests?.includes(selectedChapter.questId) && !hasCompletedLiaPhase(selectedChapter.id, 'post')"
              @click="openChat(selectedChapter.id, 'post')"
              class="page-btn bg-amber-500 text-white">
              💬 Wrap-up with Lia
            </button>

            <RouterLink v-if="selectedChapter.bridgeId && hasCompletedLiaPhase(selectedChapter.id, 'post') && !store.completedBridgingQuests.includes(selectedChapter.bridgeId)"
              :to="`/academy/bridging/${selectedChapter.bridgeId}`"
              class="page-btn bg-amber-500 text-white">
              📖 Continue Story →
            </RouterLink>
          </div>

          <!-- Locked hint -->
          <div v-if="selectedChapter.status === 'locked' && selectedChapter.acts" class="page-locked-hint">
            <p class="text-xs text-gray-400">🔒 Complete the previous chapter to unlock</p>
            <p class="text-[10px] text-gray-300 mt-1">{{ selectedChapter.acts.length }} acts · {{ selectedChapter.acts.reduce((s, a) => s + parseInt(a.duration), 0) }} min total</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ERQ Post-Test -->
    <div v-if="store.erqCompleted.pre && !store.erqCompleted.post && allChaptersComplete" class="mt-8 animate-slide-up">
      <div class="dossier-alert border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-900/10 rounded-r-2xl p-5">
        <div class="flex items-center gap-4">
          <span class="text-3xl">🎓</span>
          <div class="flex-1">
            <h3 class="font-heading font-bold text-sm text-amber-800 dark:text-amber-300 mb-1">All Files Processed</h3>
            <p class="text-[11px] text-amber-600/80 dark:text-amber-400/70 font-body">Final assessment: see how much you've grown.</p>
          </div>
          <RouterLink to="/academy/erq/post" class="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-heading font-bold rounded-2xl hover:-translate-y-0.5 transition-all shadow-sm shadow-amber-500/20">
            Start →
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Training RPG Scenarios -->
    <div v-if="Object.keys(store.disasterRPGScenarios).length > 0" class="mt-10 animate-slide-up" style="animation-delay: 0.3s">
      <h2 class="font-heading text-base font-bold text-ink dark:text-white mb-4 flex items-center gap-2">
        <span class="w-7 h-7 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-xs">🎮</span>
        Training RPG Scenarios
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <RouterLink v-for="(rpg, key) in store.disasterRPGScenarios" :key="key" :to="`/disaster-rpg/${key}`"
          class="rpg-card p-4 cursor-pointer hover:-translate-y-1 transition-all">
          <h3 class="font-heading font-bold text-sm text-ink dark:text-white mb-1">{{ rpg.title }}</h3>
          <p class="text-[10px] text-gray-400 font-body">{{ rpg.description }}</p>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import TourGuide from '../components/TourGuide.vue'
import LiaChat from './LiaChat.vue'
import ActLesson from './ActLesson.vue'

const store = useResiliaStore()

const completedChapters = computed(() => store.academyChapters.filter(c => c.status === 'completed').length)
const overallProgress = computed(() => (completedChapters.value / store.academyChapters.length) * 100)
const totalActsCompleted = computed(() => store.completedActs?.length || 0)
const allChaptersComplete = computed(() => store.academyChapters.every(c => c.status === 'completed'))
const showSimHP = computed(() => store.academyChapters.some(c => c.chatSimulation && c.status !== 'locked'))

const selectedFolder = ref(null)
const selectedChapter = computed(() => store.academyChapters.find(c => c.id === selectedFolder.value))

// Book opening animation
const bookOpened = ref(false)
onMounted(() => {
  setTimeout(() => { bookOpened.value = true }, 100)
})

// Chat mode state — when set, LiaChat is embedded in right panel
const chatMode = ref(null)
// Act mode state — when set, ActLesson is embedded in right panel
const actMode = ref(null)

function openChat(chapterId, phase, actId) {
  actMode.value = null
  chatMode.value = { chapterId, phase: phase || '', actId: actId || '' }
}

function closeChat() {
  chatMode.value = null
}

function openAct(chapterId, actId) {
  chatMode.value = null
  actMode.value = { chapterId, actId }
}

function closeAct() {
  actMode.value = null
}

function handleNextAct(payload) {
  // payload = { chapterId, actId, chatSimulation }
  if (payload.chatSimulation) {
    openChat(payload.chapterId, '', payload.actId)
  } else {
    openAct(payload.chapterId, payload.actId)
  }
}

function chapterDisplayId(id) {
  if (id === 'ch1h') return '1.5'
  if (id === 'ch2h') return '2.5'
  if (id === 'ch3h') return '3.5'
  if (id === 'ch4h') return '4.5'
  return id.replace('ch', '')
}

function openFolder(chapter) {
  if (isChapterLocked(chapter)) return
  chatMode.value = null // close any open chat
  actMode.value = null  // close any open act
  if (selectedFolder.value === chapter.id) {
    selectedFolder.value = null
    return
  }
  selectedFolder.value = chapter.id
}

function isChapterLocked(chapter) {
  if (chapter.id === 'ch1' && !store.erqCompleted.pre) return true
  return chapter.status === 'locked'
}

function canAccessAct(chapterId, actIndex) {
  if (actIndex === 0) return true
  const chapter = store.academyChapters.find(c => c.id === chapterId)
  if (!chapter?.acts) return false
  const prevAct = chapter.acts[actIndex - 1]
  return store.isActCompleted(chapterId, prevAct.id)
}

function allActsCompleted(chapter) {
  if (!chapter.acts) return false
  return chapter.acts.every(act => store.isActCompleted(chapter.id, act.id))
}

function hasCompletedLiaPhase(chapterId, phase) {
  const scores = store.liaEvalScores?.[chapterId]?.[phase]
  return scores && Object.keys(scores).length > 0
}

// Gate acts behind Lia pre-chat for chapters with liaChat + chatSimulation (x.5 chapters) or requiresLiaChat
function isLiaGated(chapter) {
  if (chapter.requiresLiaChat) return true
  if (chapter.chatSimulation && chapter.liaChat) return true
  return false
}

const academyTourSteps = [
  { title: 'Mission Files', description: 'Each tab is a chapter in Lia\'s journey. Click a tab to open the chapter page.', target: '.book-left' },
  { title: 'Chapter Details', description: 'The right panel shows acts, quizzes, and the RPG quest for the selected chapter.', target: '.book-right' },
  { title: 'Progress Tracking', description: 'Dots show act completion. Green = done, gray = in progress.', target: '.tab-dots' },
]
</script>

<style scoped>
/* ═══════════════════════════════════════ */
/* DOSSIER HEADER                          */
/* ═══════════════════════════════════════ */
.dossier-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(245,158,11,0.05), rgba(15,23,42,0));
  border: 1px solid rgba(245,158,11,0.1);
  border-radius: 20px;
  backdrop-filter: blur(8px);
}

.dossier-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

/* ═══════════════════════════════════════ */
/* BOOK CONTAINER — HSR "As I've Written" */
/* ═══════════════════════════════════════ */
.book-container {
  display: flex;
  height: 560px;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(135deg, #FFF9F0 0%, #FFFDF8 100%);
  border: 1px solid rgba(217,178,121,0.25);
  box-shadow:
    0 4px 24px rgba(139,109,63,0.08),
    0 1px 3px rgba(0,0,0,0.04),
    inset 0 1px 0 rgba(255,255,255,0.8);
  position: relative;
  /* Animation base */
  transform-origin: left center;
  transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Book closed state */
.book-closed {
  opacity: 0;
  transform: perspective(1200px) rotateY(-60deg) scaleX(0.3);
  filter: blur(4px);
}

/* Book opened state */
.book-opened {
  opacity: 1;
  transform: perspective(1200px) rotateY(0deg) scaleX(1);
  filter: blur(0);
}

:root.dark .book-container,
.dark .book-container {
  background: linear-gradient(135deg, #1C1916 0%, #181613 100%);
  border-color: rgba(180,140,80,0.12);
  box-shadow:
    0 4px 24px rgba(0,0,0,0.3),
    0 1px 3px rgba(0,0,0,0.2),
    inset 0 1px 0 rgba(255,255,255,0.02);
}

/* Book spine */
.book-spine {
  position: absolute;
  left: 260px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg,
    rgba(180,140,80,0.1) 0%,
    rgba(180,140,80,0.3) 20%,
    rgba(180,140,80,0.4) 50%,
    rgba(180,140,80,0.3) 80%,
    rgba(180,140,80,0.1) 100%
  );
  z-index: 2;
}

.dark .book-spine {
  background: linear-gradient(180deg,
    rgba(180,140,80,0.05) 0%,
    rgba(180,140,80,0.15) 50%,
    rgba(180,140,80,0.05) 100%
  );
}

/* LEFT PANEL — Chapter tabs */
.book-left {
  width: 260px;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(245,158,11,0.03) 0%, transparent 100%);
  border-right: 1px solid rgba(217,178,121,0.12);
}

.dark .book-left {
  background: linear-gradient(180deg, rgba(245,158,11,0.02) 0%, transparent 100%);
  border-right-color: rgba(180,140,80,0.08);
}

.book-tabs-header {
  padding: 16px 20px 8px;
  border-bottom: 1px solid rgba(217,178,121,0.1);
}

.book-tabs-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

/* Individual tab */
.book-tab {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  text-align: left;
}

.book-tab:hover:not(.tab-locked) {
  background: rgba(245,158,11,0.06);
}

.book-tab.tab-selected {
  background: rgba(245,158,11,0.1);
}

.dark .book-tab.tab-selected {
  background: rgba(245,158,11,0.08);
}

.book-tab.tab-locked {
  opacity: 0.4;
  cursor: default;
}

/* Color bar on the left edge */
.tab-color-bar {
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  transition: all 0.25s ease;
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.tab-number {
  font-size: 10px;
  font-weight: 800;
  color: #9CA3AF;
  min-width: 22px;
  font-family: var(--font-heading, inherit);
}

.tab-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.tab-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.tab-title {
  font-size: 11px;
  font-weight: 700;
  color: #1E293B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-heading, inherit);
}

.dark .tab-title {
  color: #E2E8F0;
}

.tab-status {
  font-size: 9px;
  color: #9CA3AF;
  font-family: var(--font-heading, inherit);
}

.tab-dots {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}

.tab-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.tab-dot.dot-done {
  opacity: 1;
}

.tab-dot.dot-pending {
  background: #D1D5DB;
}

.dark .tab-dot.dot-pending {
  background: #4B5563;
}

/* RIGHT PANEL — Chapter page */
.book-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
  overflow: hidden;
}

/* Embedded chat panel fills the right side */
.book-chat-panel {
  position: absolute;
  inset: 0;
  z-index: 10;
  animation: chatSlideIn 0.3s ease-out;
}

@keyframes chatSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Empty state */
.book-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.book-empty-icon {
  font-size: 48px;
  opacity: 0.3;
  margin-bottom: 12px;
}

.book-empty-text {
  font-size: 14px;
  font-weight: 700;
  color: #9CA3AF;
  font-family: var(--font-heading, inherit);
}

.book-empty-sub {
  font-size: 11px;
  color: #D1D5DB;
  margin-top: 4px;
  font-family: var(--font-body, inherit);
}

/* Page content */
.book-page {
  flex: 1;
  padding: 24px 28px;
  overflow-y: auto;
  animation: pageFadeIn 0.3s ease-out;
}

@keyframes pageFadeIn {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}

.page-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 2px solid rgba(0,0,0,0.04);
}

.dark .page-header {
  border-bottom-color: rgba(255,255,255,0.04);
}

.page-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.page-header-text {
  min-width: 0;
}

.page-title {
  font-size: 16px;
  font-weight: 800;
  color: #1E293B;
  font-family: var(--font-heading, inherit);
  line-height: 1.3;
}

.dark .page-title {
  color: white;
}

.page-desc {
  font-size: 11px;
  color: #6B7280;
  margin-top: 4px;
  line-height: 1.5;
  font-family: var(--font-body, inherit);
}

.dark .page-desc {
  color: #9CA3AF;
}

.page-destinations {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.dest-tag {
  font-size: 10px;
  padding: 3px 10px;
  background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.15);
  border-radius: 20px;
  color: #B45309;
  font-family: var(--font-heading, inherit);
  font-weight: 600;
}

.dark .dest-tag {
  background: rgba(245,158,11,0.06);
  border-color: rgba(245,158,11,0.1);
  color: #F59E0B;
}

.page-section {
  margin-bottom: 16px;
}

.page-status-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-heading, inherit);
  padding: 4px 12px;
  background: rgba(16,185,129,0.08);
  border-radius: 12px;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 700;
  font-family: var(--font-heading, inherit);
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.page-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

/* Acts list */
.page-acts {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.page-act {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255,255,255,0.5);
  border: 1px solid rgba(0,0,0,0.04);
  transition: all 0.15s;
}

.dark .page-act {
  background: rgba(255,255,255,0.02);
  border-color: rgba(255,255,255,0.04);
}

.page-act.act-done {
  background: rgba(16,185,129,0.04);
  border-color: rgba(16,185,129,0.12);
}

.page-act.act-locked {
  opacity: 0.45;
}

.act-indicator {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

.act-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.act-title {
  font-size: 12px;
  font-weight: 700;
  color: #1E293B;
  font-family: var(--font-heading, inherit);
}

.dark .act-title {
  color: #E2E8F0;
}

.act-duration {
  font-size: 10px;
  color: #9CA3AF;
  font-family: var(--font-body, inherit);
}

.act-start-btn {
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  font-family: var(--font-heading, inherit);
  transition: all 0.15s;
  white-space: nowrap;
}

.act-start-btn:hover {
  transform: translateX(2px);
}

.page-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0,0,0,0.04);
}

.dark .page-actions {
  border-top-color: rgba(255,255,255,0.04);
}

.page-locked-hint {
  padding: 24px;
  text-align: center;
}

/* ═══════════════════════════════════════ */
/* RESPONSIVE — stack vertically on mobile */
/* ═══════════════════════════════════════ */
@media (max-width: 768px) {
  .book-container {
    flex-direction: column;
    min-height: auto;
  }

  .book-left {
    width: 100%;
    min-width: 100%;
    max-height: 240px;
    border-right: none;
    border-bottom: 1px solid rgba(217,178,121,0.15);
  }

  .book-spine {
    display: none;
  }

  .book-tabs-scroll {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 4px 8px;
    gap: 2px;
  }

  .book-tab {
    flex-shrink: 0;
    width: auto;
    padding: 8px 12px;
    border-radius: 10px;
  }

  .tab-color-bar { display: none; }
  .tab-text { display: none; }

  .book-right {
    min-height: 300px;
  }
}

/* ═══════════════════════════════════════ */
/* RPG Cards                               */
/* ═══════════════════════════════════════ */
.rpg-card {
  background: linear-gradient(135deg, #FFF9F0 0%, #FFFDF8 100%);
  border: 1px solid rgba(217,178,121,0.2);
  border-radius: 16px;
  transition: all 0.2s;
}

.dark .rpg-card {
  background: linear-gradient(135deg, #1E1B15, #1A1814);
  border-color: rgba(180,140,80,0.1);
}

.rpg-card:hover { box-shadow: 0 4px 16px rgba(139,109,63,0.12); }

/* ═══════════════════════════════════════ */
/* UTILITY                                 */
/* ═══════════════════════════════════════ */
.dossier-alert {
  backdrop-filter: blur(8px);
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out both;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
