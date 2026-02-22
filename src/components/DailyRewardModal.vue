<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="close">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-bounce-in z-10">
          <!-- Header -->
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
              <PhCoins :size="32" class="text-white" weight="fill" />
            </div>
            <h2 class="font-heading text-2xl font-bold text-ink dark:text-white">Daily Reward!</h2>
            <p class="text-sm text-gray-400 dark:text-gray-400 font-body mt-1">Week {{ store.currentRewardWeek }} · Day {{ todayDayInWeek }}</p>
          </div>

          <!-- Week calendar -->
          <div class="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4 mb-6">
            <div class="grid grid-cols-7 gap-2">
              <div v-for="day in currentWeekRewards" :key="day.day"
                class="flex flex-col items-center gap-1">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all"
                  :class="getDayClass(day)">
                  <PhCheck v-if="day.claimed" :size="18" weight="bold" />
                  <PhCoins v-else-if="day.day === store.currentRewardDay && !claimed" :size="16" weight="fill" />
                  <PhStar v-else-if="day.isBonus" :size="16" weight="fill" />
                  <span v-else>{{ day.day % 7 || 7 }}</span>
                </div>
                <span class="text-[9px] font-heading font-bold" :class="day.isBonus ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'">
                  {{ day.coins }} RC
                </span>
              </div>
            </div>
          </div>

          <!-- Claim button / claimed state -->
          <div v-if="!claimed">
            <div class="text-center mb-4">
              <p class="text-lg font-heading font-bold text-ink dark:text-white">
                Today's reward: <span class="text-amber-500">{{ todayReward?.coins || 5 }} RC</span>
                <span v-if="todayReward?.isBonus" class="ml-1 text-amber-500 inline-flex items-center gap-1">
                  <PhStar :size="14" weight="fill" /> BONUS!
                </span>
              </p>
            </div>
            <button @click="claim" 
              class="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-heading font-bold text-base hover:shadow-lg hover:shadow-amber-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              <PhGift :size="20" weight="fill" /> Claim Reward!
            </button>
          </div>
          <div v-else class="text-center">
            <div class="mb-4">
              <PhConfetti :size="48" class="text-amber-500 mx-auto animate-bounce" weight="fill" />
            </div>
            <p class="font-heading font-bold text-lg text-teal-600 dark:text-teal-400 mb-2">+{{ claimedAmount }} RC Collected!</p>
            <p class="text-sm text-gray-400 font-body mb-4">Come back tomorrow for more rewards</p>
            <button @click="close"
              class="w-full py-3 bg-gray-100 dark:bg-slate-700 text-ink dark:text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
              Continue
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useResiliaStore } from '../stores/resiliaStore'
import { PhCoins, PhCheck, PhStar, PhGift, PhConfetti } from '@phosphor-icons/vue'

const store = useResiliaStore()
const visible = ref(false)
const claimed = ref(false)
const claimedAmount = ref(0)

const todayReward = computed(() => store.dailyRewards[store.loginRewardsCollected])
const todayDayInWeek = computed(() => {
  const dayNum = store.currentRewardDay
  return ((dayNum - 1) % 7) + 1
})

const currentWeekRewards = computed(() => {
  const week = store.currentRewardWeek
  return store.dailyRewards.filter(r => r.week === week)
})

function getDayClass(day) {
  if (day.claimed) return 'bg-teal-500 text-white'
  if (day.day === store.currentRewardDay && !claimed.value) return 'bg-amber-400 text-white shadow-lg shadow-amber-500/30 scale-110 ring-2 ring-amber-300'
  if (day.isBonus) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
  return 'bg-white dark:bg-slate-600 text-gray-400 dark:text-gray-300 shadow-sm'
}

function claim() {
  const result = store.claimDailyReward()
  if (result) {
    claimed.value = true
    claimedAmount.value = result.coins
  }
}

function close() {
  visible.value = false
}

onMounted(() => {
  if (!store.todayRewardClaimed) {
    setTimeout(() => { visible.value = true }, 800)
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9) translateY(20px);
}

@keyframes bounce-in {
  0% { transform: scale(0.9) translateY(20px); opacity: 0; }
  50% { transform: scale(1.02); }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.animate-bounce-in {
  animation: bounce-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
