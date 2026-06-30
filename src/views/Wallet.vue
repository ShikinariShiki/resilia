<template>
  <div>
    <!-- Balance + Donate -->
    <div v-motion class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
      <div class="lg:col-span-2 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl sm:rounded-2xl p-5 sm:p-7 md:p-8 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div class="flex items-center justify-between relative">
          <div>
            <p class="text-[10px] sm:text-[11px] font-heading font-bold text-teal-200 uppercase tracking-wider mb-3">{{ t('wallet.vault') }} <PhVault :size="14" weight="fill" class="inline" /></p>
            <div class="flex items-baseline gap-2 sm:gap-3">
              <PhCoins :size="28" class="text-teal-200" weight="fill" />
              <span class="font-heading text-3xl sm:text-4xl md:text-5xl font-bold">{{ store.resiCoinBalance }}</span>
              <span class="font-heading text-sm sm:text-lg text-teal-200">{{ t('wallet.rc') }}</span>
            </div>
          </div>
          <div class="text-right hidden sm:block">
            <p class="text-[10px] font-heading font-bold text-teal-200 uppercase tracking-wider">{{ t('wallet.lifetimeEarned') }}</p>
            <p class="font-heading text-2xl font-bold mt-1">{{ totalEarned }} {{ t('wallet.rc') }}</p>
            <p class="text-[10px] text-teal-200/70 mt-0.5">{{ t('wallet.transactionsCount').replace('{count}', store.transactions.length) }}</p>
          </div>
        </div>
      </div>

      <BaseCard>
        <p class="text-[10px] font-heading font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wider mb-1">{{ t('wallet.communityFund') }} <PhHandshake :size="14" weight="fill" class="inline" /></p>
        <p class="text-[10px] text-gray-400 font-body mb-3">{{ t('wallet.sponsorText') }}</p>
        <div class="flex gap-2.5 mb-3 items-start">
          <BaseInput v-model="donateAmount" type="number" min="1" :placeholder="t('wallet.amountPlaceholder')" size="sm" class="flex-1 min-w-0" />
          <BaseButton @click="donate" :disabled="donateAmount < 1 || donateAmount > store.resiCoinBalance" class="!bg-orange-500 hover:!bg-orange-600 focus:ring-orange-500 flex-shrink-0">
            {{ t('wallet.btnContribute') }}
          </BaseButton>
        </div>
        <!-- Transparency & perks -->
        <div class="space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-700/50">
          <p class="text-[9px] text-gray-400 font-body flex items-center gap-1.5">
            <PhDiamondsFour :size="10" weight="fill" class="text-teal-500" /> {{ t('wallet.perk1') }}
          </p>
          <p class="text-[9px] text-gray-400 font-body flex items-center gap-1.5">
            <PhDiamondsFour :size="10" weight="fill" class="text-orange-500" /> {{ t('wallet.perk2') }}
          </p>
          <p class="text-[9px] text-gray-400 font-body flex items-center gap-1.5">
            <PhDiamondsFour :size="10" weight="fill" class="text-purple-500" /> {{ t('wallet.perk3') }}
          </p>
        </div>
      </BaseCard>
    </div>

    <!-- Toolkit Banner -->
    <div v-motion class="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-4 sm:p-5 mb-8 flex items-center justify-between gap-4" style="animation-delay: 0.03s">
      <div>
        <p class="font-heading font-bold text-xs text-teal-700 dark:text-teal-400"><PhToolbox :size="14" weight="fill" class="inline" /> {{ t('wallet.bannerTitle') }}</p>
        <p class="text-[10px] text-teal-600/70 dark:text-teal-400/70 font-body mt-0.5">{{ t('wallet.bannerDesc') }}</p>
      </div>
      <RouterLink to="/toolkit" class="px-4 py-2 bg-teal-500 text-white rounded-xl font-heading font-bold text-xs hover:bg-teal-600 transition-colors flex-shrink-0">
        {{ t('wallet.btnOpenToolkit') }}
      </RouterLink>
    </div>

    <!-- Category filter -->
    <div v-motion class="flex flex-wrap gap-2 mb-6" style="animation-delay: 0.05s">
      <button v-for="cat in categories" :key="cat" @click="activeCategory = cat"
        class="px-3.5 py-1.5 rounded-xl text-[10px] font-heading font-bold transition-all"
        :class="activeCategory === cat ? 'bg-teal-500 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'">
        {{ t('wallet.cat' + cat) }}
      </button>
    </div>

    <!-- Shop grid -->
    <BaseCard v-motion class="mb-8 sm:mb-10" style="animation-delay: 0.07s">
      <h3 class="font-heading text-base sm:text-lg font-bold text-ink dark:text-white mb-5">{{ t('wallet.guildShop') }} <PhSword :size="16" weight="fill" class="inline text-teal-500" /></h3>
      
      <!-- Active boosters banner -->
      <div v-if="store.activeBoosters.length > 0" class="mb-5 p-3 bg-amber-50 dark:bg-amber-900/15 rounded-xl border border-amber-200/30 dark:border-amber-800/20">
        <p class="text-[10px] font-heading font-bold text-amber-600 dark:text-amber-400 uppercase mb-2">Active Boosters</p>
        <div class="flex flex-wrap gap-2">
          <span v-for="(b, i) in store.activeBoosters" :key="i"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-[10px] font-heading font-bold text-amber-700 dark:text-amber-400">
            {{ b.type === 'xp_boost' ? '⚡ XP x1.25' : b.type === 'coin_doubler' ? '🪙 2x Coins' : '🛡️ Streak' }}
            <span class="text-amber-500/70">({{ timeLeft(b.expiresAt) }})</span>
          </span>
        </div>
      </div>

      <!-- Purchase toast -->
      <Transition name="fade-slide">
        <div v-if="purchaseToast" class="mb-5 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200/30 dark:border-teal-800/20 text-center">
          <p class="text-xs font-heading font-bold text-teal-700 dark:text-teal-400">{{ purchaseToast }}</p>
        </div>
      </Transition>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <div v-for="item in filteredShop" :key="item.id" 
          class="group relative bg-gray-50 dark:bg-slate-700/40 rounded-xl sm:rounded-2xl p-4 transition-all duration-300 hover:shadow-lg overflow-hidden border-2"
          :class="[
            store.resiCoinBalance >= item.cost ? 'hover:shadow-teal-500/10' : 'opacity-60 grayscale-[30%]',
            rarityBorder(item.rarity)
          ]">
          
          <!-- Rarity tag -->
          <span class="absolute top-2 right-2 text-[8px] font-heading font-bold px-1.5 py-0.5 rounded-md"
            :class="rarityClass(item.rarity)">
            {{ item.rarity }}
          </span>

          <div class="text-3xl sm:text-4xl mb-2 text-teal-500 dark:text-teal-400">
            <component :is="iconMap[item.phosphorIcon]" :size="32" weight="duotone" />
          </div>
          
          <p class="font-heading font-bold text-xs text-ink dark:text-white mb-0.5 leading-tight min-h-[2em]">{{ item.name }}</p>
          <p class="text-[9px] text-gray-400 font-body mb-3 line-clamp-2">{{ item.description }}</p>
          
          <button @click="redeem(item.id)" :disabled="store.resiCoinBalance < item.cost || isOwnedCosmetic(item.id)"
            class="w-full py-2 rounded-lg text-[10px] font-heading font-bold transition-colors flex items-center justify-center gap-1"
            :class="isOwnedCosmetic(item.id)
              ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 cursor-default'
              : store.resiCoinBalance >= item.cost ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-sm shadow-teal-500/20' : 'bg-gray-200 dark:bg-slate-600 text-gray-400 cursor-not-allowed'">
            <span v-if="isOwnedCosmetic(item.id)" class="flex items-center gap-0.5">✓ Owned</span>
            <span v-else class="flex items-center gap-0.5"><PhCoins :size="12" weight="fill" /> {{ item.cost }} {{ t('wallet.rc') }}</span>
          </button>
        </div>
      </div>
    </BaseCard>

    <!-- Transaction History (collapsible) -->
    <BaseCard padding="none" v-motion style="animation-delay: 0.09s">
      <button @click="showHistory = !showHistory" class="w-full flex items-center justify-between p-5 sm:p-7">
        <h3 class="font-heading text-base sm:text-lg font-bold text-ink dark:text-white">{{ t('wallet.history') }} <PhReceipt :size="16" weight="fill" class="inline text-gray-400" /></h3>
        <span class="text-gray-400 transition-transform duration-300 text-sm" :class="showHistory ? 'rotate-180' : ''">▼</span>
      </button>
      <div v-show="showHistory" class="px-5 sm:px-7 pb-5 sm:pb-7">
        <div v-if="store.transactions.length === 0" class="text-center py-10">
          <PhReceipt :size="28" class="text-gray-300 dark:text-gray-600 mx-auto mb-3" weight="duotone" />
          <p class="text-gray-400 font-body text-xs">{{ t('wallet.noHistory') }}</p>
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
              {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }} {{ t('wallet.rc') }}
            </span>
          </div>
        </div>
      </div>
    </BaseCard>

    <CoinAnimation :trigger="coinTrigger" :amount="coinAmount" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import { PhCoins, PhVault, PhHandshake, PhDiamondsFour, PhToolbox, PhSword, PhReceipt,
  PhLightning, PhShieldCheck, PhFrameCorners, PhMoon, PhPalette, PhImage, PhSparkle,
  PhCrown, PhStar, PhPackage, PhChalkboardTeacher, PhHeart, PhBackpack, PhCertificate,
  PhIdentificationBadge, PhGameController, PhGift, PhArrowCounterClockwise, PhLightbulb,
  PhFastForward, PhGlobeHemisphereEast } from '@phosphor-icons/vue'
import CoinAnimation from '../components/CoinAnimation.vue'
import { useI18n } from '../i18n'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'

const store = useResiliaStore()
const { t } = useI18n()
const donateAmount = ref(10)
const coinTrigger = ref(0)
const coinAmount = ref(0)
const showHistory = ref(false)
const activeCategory = ref('All')
const purchaseToast = ref('')
let toastTimer = null

// Phosphor icon map for marketplace items
const iconMap = {
  PhLightning, PhCoins, PhShieldCheck, PhFrameCorners, PhMoon, PhPalette,
  PhImage, PhSparkle, PhCrown, PhStar, PhPackage, PhChalkboardTeacher,
  PhHeart, PhBackpack, PhCertificate, PhIdentificationBadge, PhGameController,
  PhGift, PhArrowCounterClockwise, PhLightbulb, PhFastForward, PhGlobeHemisphereEast,
}

// Cosmetic item IDs that are one-time purchases
const cosmeticIds = [5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 20]

function isOwnedCosmetic(itemId) {
  if (!cosmeticIds.includes(itemId)) return false
  return store.ownedItems.some(i => i.id === itemId)
}

function timeLeft(expiresAt) {
  const diff = expiresAt - Date.now()
  if (diff <= 0) return 'expired'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 24) return Math.floor(hours / 24) + 'd ' + (hours % 24) + 'h'
  return hours + 'h ' + mins + 'm'
}

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
  if (isOwnedCosmetic(itemId)) return
  const item = store.marketplace.find(i => i.id === itemId)
  if (store.redeemCoins(itemId)) {
    coinAmount.value = -item.cost
    coinTrigger.value++
    purchaseToast.value = store.lastPurchaseMessage || `${item.name} redeemed!`
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { purchaseToast.value = '' }, 3000)
  }
}
function donate() {
  if (store.donateCoins(donateAmount.value)) { coinAmount.value = -donateAmount.value; coinTrigger.value++; donateAmount.value = 10 }
}
</script>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
