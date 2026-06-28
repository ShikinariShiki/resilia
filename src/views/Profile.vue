<template>
  <div>
    <!-- Hero Profile Card -->
    <div v-motion class="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-10 text-white relative overflow-hidden">
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>
      <div class="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-8">
        <!-- Avatar -->
        <div class="relative group">
          <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-5xl sm:text-6xl font-heading font-bold bg-white/20 backdrop-blur-sm shadow-lg flex-shrink-0 overflow-hidden transition-transform group-hover:scale-105"
            :style="{ borderColor: store.avatarColor, borderWidth: '3px' }">
            {{ store.userName.charAt(0).toUpperCase() }}
          </div>
          <button @click="triggerFileInput" class="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <span class="text-white text-xs font-bold font-heading flex items-center gap-1"><PhCamera :size="14" weight="fill" /> {{ t('profile.upload') }}</span>
          </button>
          <input type="file" id="avatar-upload" class="hidden" accept="image/*" @change="handleFileUpload">
        </div>
        <!-- Info -->
        <div class="text-center sm:text-left flex-1">
          <h1 class="font-heading text-2xl sm:text-3xl font-bold mb-1">{{ store.userName }}</h1>
          <div class="flex items-center justify-center sm:justify-start gap-2 mb-3">
            <span class="text-sm opacity-80">{{ userCountry?.flag }} {{ userCountry?.name }}</span>
            <span class="text-xs opacity-60">·</span>
            <span class="text-xs opacity-60">{{ t('profile.joined').replace('{date}', store.joinDate) }}</span>
          </div>
          <div class="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
            <div class="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-heading font-bold flex items-center gap-1.5">
              {{ store.currentTier.icon }} {{ store.currentTier.name }}
            </div>
            <div class="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-heading font-bold">
              {{ t('profile.level').replace('{level}', store.level) }}
            </div>
            <div class="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-heading font-bold">
              <PhFire :size="14" weight="fill" class="inline" /> {{ t('profile.streakCount').replace('{streak}', store.loginStreak) }}
            </div>
          </div>
          <!-- XP bar -->
          <div class="mt-4 max-w-xs mx-auto sm:mx-0">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] opacity-70">{{ t('profile.xpDisplay').replace('{current}', store.xp).replace('{next}', store.xpForNextLevel) }}</span>
              <span class="text-[10px] opacity-70">{{ store.xpProgress }}%</span>
            </div>
            <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div class="h-full bg-white rounded-full transition-all duration-500" :style="{ width: store.xpProgress + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div v-motion class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-10" style="animation-delay: 0.05s">
      <BaseCard v-for="stat in stats" :key="stat.label" padding="sm" class="text-center">
        <component :is="stat.icon" :size="22" :weight="'fill'" class="mb-1 mx-auto" :class="stat.color" />
        <p class="font-heading font-bold text-xl text-ink dark:text-white">{{ stat.value }}</p>
        <p class="text-[10px] text-gray-400 font-body mt-0.5">{{ stat.label }}</p>
      </BaseCard>
    </div>

    <!-- Achievements -->
    <div v-motion class="mb-8 sm:mb-10" style="animation-delay: 0.08s">
      <h2 class="font-heading text-lg sm:text-xl font-bold text-ink dark:text-white mb-5">{{ t('profile.achievements') }}</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <BaseCard v-for="ach in store.achievementsList" :key="ach.id" padding="sm"
          class="text-center transition-all"
          :class="ach.unlocked ? 'hover:shadow-md' : 'opacity-40 grayscale'">
          <span class="text-3xl block mb-2">{{ ach.icon }}</span>
          <p class="font-heading font-bold text-xs text-ink dark:text-white mb-1">{{ ach.name }}</p>
          <p class="text-[10px] text-gray-400 font-body">{{ ach.description }}</p>
          <p v-if="ach.unlocked" class="text-[9px] text-teal-500 font-heading font-bold mt-2">{{ ach.date }}</p>
          <p v-else class="text-[9px] text-gray-300 dark:text-gray-600 font-heading font-bold mt-2 flex items-center justify-center gap-0.5"><PhLock :size="10" weight="fill" /> {{ t('profile.locked') }}</p>
        </BaseCard>
      </div>
    </div>

    <!-- Bio / Profile Edit Section -->
    <BaseCard v-motion class="mb-8 sm:mb-10" style="animation-delay: 0.1s">
      <SectionHeading :title="t('profile.editProfile')" />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <BaseInput v-model="editName" :label="t('profile.displayName')" size="sm" />
        <div>
          <label class="text-[10px] font-heading font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">{{ t('profile.country') }}</label>
          <select v-model="editCountry"
            class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl font-body text-sm text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all">
            <option v-for="c in store.countries" :key="c.code" :value="c.code">{{ c.name }}</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="text-[10px] font-heading font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">{{ t('profile.bio') }}</label>
          <textarea v-model="editBio" rows="3" :placeholder="t('profile.bioPlaceholder')"
            class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl font-body text-sm text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none transition-all"></textarea>
        </div>
        <div>
          <label class="text-[10px] font-heading font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">{{ t('profile.avatarColor') }}</label>
          <div class="flex items-center gap-2 flex-wrap">
            <button v-for="color in avatarColors" :key="color" @click="editColor = color"
              class="w-8 h-8 rounded-lg transition-all hover:scale-110"
              :style="{ background: color }"
              :class="editColor === color ? 'ring-2 ring-offset-2 ring-teal-500 scale-110' : ''">
            </button>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-slate-700">
        <Transition name="fade-slide">
          <BaseButton v-if="hasChanges" @click="saveProfile">
            {{ t('profile.saveChanges') }}
          </BaseButton>
        </Transition>
        <BaseButton v-if="hasChanges" @click="resetProfile" variant="ghost" class="bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600">
          {{ t('profile.reset') }}
        </BaseButton>
        <span v-if="saved" class="text-sm font-heading font-bold text-teal-500 ml-2 animate-bounce">{{ t('profile.saved') }}</span>
      </div>
    </BaseCard>

    <!-- Recent Activity -->
    <div v-motion style="animation-delay: 0.12s">
      <h2 class="font-heading text-lg sm:text-xl font-bold text-ink dark:text-white mb-5">{{ t('profile.recentActivity') }}</h2>
      <div class="space-y-2">
        <div v-for="tx in store.transactions.slice(0, 10)" :key="tx.id"
          class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              :class="tx.type === 'earn' ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-500' : tx.type === 'donate' ? 'bg-red-50 dark:bg-red-900/30 text-red-500' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-500'">
              <PhCurrencyCircleDollar v-if="tx.type === 'earn'" :size="16" weight="fill" />
              <PhHeartStraight v-else-if="tx.type === 'donate'" :size="16" weight="fill" />
              <PhShoppingCart v-else :size="16" weight="fill" />
            </div>
            <div>
              <p class="font-heading font-bold text-xs text-ink dark:text-white">{{ tx.reason }}</p>
              <p class="text-[10px] text-gray-400 font-body">{{ tx.date }}</p>
            </div>
          </div>
          <span class="font-heading font-bold text-sm" :class="tx.amount > 0 ? 'text-teal-500' : 'text-red-500'">
            {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }} RC
          </span>
        </div>
        <div v-if="store.transactions.length === 0"
          class="text-center py-10 text-gray-400 font-body text-sm">
          {{ t('profile.noActivity') }}
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div v-motion class="mt-8 sm:mt-10" style="animation-delay: 0.15s">
      <BaseCard>
        <h2 class="font-heading text-lg font-bold text-ink dark:text-white mb-2">{{ t('profile.accountTitle') }}</h2>
        <p class="text-xs text-gray-400 font-body mb-5">{{ t('profile.accountDesc') }}</p>
        <div class="flex items-center gap-3">
          <BaseButton v-if="!showLogoutConfirm" @click="showLogoutConfirm = true" variant="outline" class="!border-red-200 !text-red-500 hover:!bg-red-50">
            {{ t('profile.btnSignOut') }}
          </BaseButton>
          <template v-else>
            <BaseButton @click="handleLogout" variant="danger">
              {{ t('profile.btnConfirmSignOut') }}
            </BaseButton>
            <BaseButton @click="showLogoutConfirm = false" variant="ghost" class="bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600">
              {{ t('profile.btnCancel') }}
            </BaseButton>
          </template>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import { PhTrophy, PhCoins, PhBookOpen, PhGameController, PhFlower, PhFire, PhCamera, PhLock, PhCurrencyCircleDollar, PhHeartStraight, PhShoppingCart } from '@phosphor-icons/vue'
import { useI18n } from '../i18n'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import SectionHeading from '../components/SectionHeading.vue'

const store = useResiliaStore()
const router = useRouter()
const { t } = useI18n()

const editName = ref(store.userName)
const editCountry = ref(store.countryCode)
const editBio = ref(store.bio)
const editColor = ref(store.avatarColor)
const saved = ref(false)

const avatarColors = ['#0D9488', '#F97316', '#8B5CF6', '#EF4444', '#3B82F6', '#EAB308', '#EC4899', '#10B981']

const userCountry = computed(() => store.countries.find(c => c.code === store.countryCode))

const stats = computed(() => [
  { icon: PhTrophy, value: store.totalXPEarned, label: t('profile.statTotalXP'), color: 'text-amber-500' },
  { icon: PhCoins, value: store.resiCoinBalance, label: t('profile.statResiCoins'), color: 'text-orange-500' },
  { icon: PhBookOpen, value: store.completedModules.length + store.completedBeginnerModules.length, label: t('profile.statModules'), color: 'text-teal-500' },
  { icon: PhGameController, value: store.completedRPGs.length, label: t('profile.statRpgs'), color: 'text-purple-500' },
  { icon: PhFlower, value: store.breathingSessions, label: t('profile.statBreathing'), color: 'text-pink-500' },
  { icon: PhFire, value: store.loginStreak, label: t('profile.statStreak'), color: 'text-red-500' },
])

const hasChanges = computed(() => {
  return editName.value !== store.userName ||
    editCountry.value !== store.countryCode ||
    editBio.value !== store.bio ||
    editColor.value !== store.avatarColor
})

function triggerFileInput() {
  document.getElementById('avatar-upload').click()
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file) {
    // Mock upload - in real app, this would upload to server
    alert(t('profile.mockUploadAlert').replace('{file}', file.name))
  }
}

function saveProfile() {
  if (!hasChanges.value) return
  
  store.updateProfile({
    name: editName.value,
    country: editCountry.value,
    bio: editBio.value,
    avatarColor: editColor.value,
  })
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

function resetProfile() {
  editName.value = store.userName
  editCountry.value = store.countryCode
  editBio.value = store.bio
  editColor.value = store.avatarColor
}

// Logout
const showLogoutConfirm = ref(false)

function handleLogout() {
  store.logoutUser()
  router.push('/')
}
</script>
