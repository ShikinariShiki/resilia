<template>
  <div>
    <!-- Balance + Donate -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 animate-slide-up">
      <div class="lg:col-span-2 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div class="flex items-center justify-between relative">
          <div>
            <p class="text-[10px] sm:text-[11px] font-heading font-bold text-teal-200 uppercase tracking-wider mb-3">ResiCoin Vault <PhVault :size="14" weight="fill" class="inline" /></p>
            <div class="flex items-baseline gap-2 sm:gap-3">
              <PhCoins :size="28" class="text-teal-200" weight="fill" />
              <span class="font-heading text-3xl sm:text-4xl md:text-5xl font-bold">{{ store.resiCoinBalance }}</span>
              <span class="font-heading text-sm sm:text-lg text-teal-200">RC</span>
            </div>
          </div>
          <div class="text-right hidden sm:block">
            <p class="text-[10px] font-heading font-bold text-teal-200 uppercase tracking-wider">Lifetime earned</p>
            <p class="font-heading text-2xl font-bold mt-1">{{ totalEarned }} RC</p>
            <p class="text-[10px] text-teal-200/70 mt-0.5">{{ store.transactions.length }} transactions</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50">
        <p class="text-[10px] font-heading font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wider mb-1">Community Fund <PhHandshake :size="14" weight="fill" class="inline" /></p>
        <p class="text-[10px] text-gray-400 font-body mb-3">Sponsor PFA workshops across ASEAN communities.</p>
        <div class="flex gap-2.5 mb-3">
          <input v-model.number="donateAmount" type="number" min="1" placeholder="Amount"
            class="flex-1 min-w-0 px-4 py-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/50" />
          <button @click="donate" :disabled="donateAmount < 1 || donateAmount > store.resiCoinBalance"
            class="px-5 py-3 bg-orange-500 text-white rounded-xl font-heading font-bold text-xs hover:bg-orange-600 transition-colors disabled:opacity-30 flex-shrink-0">
            Contribute
          </button>
        </div>
        <!-- Transparency & perks -->
        <div class="space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-700/50">
          <p class="text-[9px] text-gray-400 font-body flex items-center gap-1.5">
            <PhDiamondsFour :size="10" weight="fill" class="text-teal-500" /> Funds go to local PFA training workshops
          </p>
          <p class="text-[9px] text-gray-400 font-body flex items-center gap-1.5">
            <PhDiamondsFour :size="10" weight="fill" class="text-orange-500" /> Earn +10% XP bonus per 50 RC donated
          </p>
          <p class="text-[9px] text-gray-400 font-body flex items-center gap-1.5">
            <PhDiamondsFour :size="10" weight="fill" class="text-purple-500" /> Unlock exclusive "Community Patron" badge at 500 RC
          </p>
        </div>
      </div>
    </div>

    <!-- Toolkit Banner -->
    <div class="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-4 sm:p-5 mb-8 flex items-center justify-between gap-4 animate-slide-up" style="animation-delay: 0.03s">
      <div>
        <p class="font-heading font-bold text-xs text-teal-700 dark:text-teal-400"><PhToolbox :size="14" weight="fill" class="inline" /> Free resources moved to Toolkit!</p>
        <p class="text-[10px] text-teal-600/70 dark:text-teal-400/70 font-body mt-0.5">Counseling sessions, prep kits, and wellness tools are now free.</p>
      </div>
      <RouterLink to="/toolkit" class="px-4 py-2 bg-teal-500 text-white rounded-xl font-heading font-bold text-xs hover:bg-teal-600 transition-colors flex-shrink-0">
        Open Toolkit →
      </RouterLink>
    </div>

    <!-- Category filter -->
    <div class="flex flex-wrap gap-2 mb-6 animate-slide-up" style="animation-delay: 0.05s">
      <button v-for="cat in categories" :key="cat" @click="activeCategory = cat"
        class="px-3.5 py-1.5 rounded-xl text-[10px] font-heading font-bold transition-all"
        :class="activeCategory === cat ? 'bg-teal-500 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'">
        {{ cat }}
      </button>
    </div>

    <!-- Shop grid -->
    <div class="bg-white dark:bg-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 mb-8 sm:mb-10 animate-slide-up" style="animation-delay: 0.07s">
      <h3 class="font-heading text-base sm:text-lg font-bold text-ink dark:text-white mb-5">Guild Shop <PhSword :size="16" weight="fill" class="inline text-teal-500" /></h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <div v-for="item in filteredShop" :key="item.id" 
          class="group relative bg-gray-50 dark:bg-slate-700/40 rounded-xl sm:rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden border-2"
          :class="[
            store.resiCoinBalance >= item.cost ? 'hover:shadow-teal-500/10' : 'opacity-60 grayscale-[30%]',
            rarityBorder(item.rarity)
          ]">
          
          <!-- Rarity tag -->
          <span class="absolute top-2 right-2 text-[8px] font-heading font-bold px-1.5 py-0.5 rounded-md"
            :class="rarityClass(item.rarity)">
            {{ item.rarity }}
          </span>

          <div class="text-3xl sm:text-4xl mb-2 transform transition-transform group-hover:scale-110 group-hover:rotate-3">{{ item.icon }}</div>
          
          <p class="font-heading font-bold text-xs text-ink dark:text-white mb-0.5 leading-tight min-h-[2em]">{{ item.name }}</p>
          <p class="text-[9px] text-gray-400 font-body mb-3 line-clamp-2">{{ item.description }}</p>
          
          <button @click="redeem(item.id)" :disabled="store.resiCoinBalance < item.cost"
            class="w-full py-2 rounded-lg text-[10px] font-heading font-bold transition-colors flex items-center justify-center gap-1"
            :class="store.resiCoinBalance >= item.cost ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-sm shadow-teal-500/20' : 'bg-gray-200 dark:bg-slate-600 text-gray-400 cursor-not-allowed'">
            <span class="flex items-center gap-0.5"><PhCoins :size="12" weight="fill" /> {{ item.cost }} RC</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Transaction History (collapsible) -->
    <div class="bg-white dark:bg-slate-800/80 rounded-2xl sm:rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700/50 animate-slide-up" style="animation-delay: 0.09s">
      <button @click="showHistory = !showHistory" class="w-full flex items-center justify-between p-5 sm:p-7">
        <h3 class="font-heading text-base sm:text-lg font-bold text-ink dark:text-white">Transaction History <PhReceipt :size="16" weight="fill" class="inline text-gray-400" /></h3>
        <span class="text-gray-400 transition-transform duration-300 text-sm" :class="showHistory ? 'rotate-180' : ''">▼</span>
      </button>
      <div v-show="showHistory" class="px-5 sm:px-7 pb-5 sm:pb-7">
        <div v-if="store.transactions.length === 0" class="text-center py-10">
          <PhReceipt :size="28" class="text-gray-300 dark:text-gray-600 mx-auto mb-3" weight="duotone" />
          <p class="text-gray-400 font-body text-xs">No transactions yet. Start earning!</p>
        </div>
        <div v-else class="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
          <div v-for="tx in store.transactions" :key="tx.id" class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
            <div class="flex items-center gap-3 min-w-0">
              <span class="w-8 h-8 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                :class="tx.type === 'earn' ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' : tx.type === 'donate' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'">
                {{ tx.type === 'earn' ? '↑' : '↓' }}
              </span>
              <div class="min-w-0">
                <p class="text-xs font-medium font-body truncate text-ink dark:text-white">{{ tx.reason }}</p>
                <p class="text-[9px] text-gray-400 mt-0.5">{{ tx.date }}</p>
              </div>
            </div>
            <span class="font-heading font-bold text-xs flex-shrink-0 ml-3" :class="tx.amount > 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500'">
              {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }} RC
            </span>
          </div>
        </div>
      </div>
    </div>

    <CoinAnimation :trigger="coinTrigger" :amount="coinAmount" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import { PhCoins, PhVault, PhHandshake, PhDiamondsFour, PhToolbox, PhSword, PhReceipt } from '@phosphor-icons/vue'
import CoinAnimation from '../components/CoinAnimation.vue'

const store = useResiliaStore()
const donateAmount = ref(10)
const coinTrigger = ref(0)
const coinAmount = ref(0)
const showHistory = ref(false)
const activeCategory = ref('All')

const categories = ['All', 'Booster', 'Cosmetic', 'Community', 'Content']

const filteredShop = computed(() => {
  if (activeCategory.value === 'All') return store.marketplace
  return store.marketplace.filter(i => i.category === activeCategory.value)
})

const totalEarned = computed(() => store.transactions.filter(t => t.type === 'earn').reduce((sum, t) => sum + t.amount, 0))

function rarityBorder(rarity) {
  const map = { Common: 'border-gray-200 dark:border-slate-600', Rare: 'border-blue-300 dark:border-blue-700', Epic: 'border-purple-300 dark:border-purple-700', Legendary: 'border-amber-300 dark:border-amber-600' }
  return map[rarity] || map.Common
}
function rarityClass(rarity) {
  const map = { Common: 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300', Rare: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400', Epic: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400', Legendary: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' }
  return map[rarity] || map.Common
}

function redeem(itemId) {
  const item = store.marketplace.find(i => i.id === itemId)
  if (store.redeemCoins(itemId)) { coinAmount.value = -item.cost; coinTrigger.value++ }
}
function donate() {
  if (store.donateCoins(donateAmount.value)) { coinAmount.value = -donateAmount.value; coinTrigger.value++; donateAmount.value = 10 }
}
</script>
