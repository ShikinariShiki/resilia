<template>
  <div>
    <!-- Hero Profile Card -->
    <div class="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-10 text-white relative overflow-hidden animate-slide-up">
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
            <span class="text-white text-xs font-bold font-heading">📷 Upload</span>
          </button>
          <input type="file" id="avatar-upload" class="hidden" accept="image/*" @change="handleFileUpload">
        </div>
        <!-- Info -->
        <div class="text-center sm:text-left flex-1">
          <h1 class="font-heading text-2xl sm:text-3xl font-bold mb-1">{{ store.userName }}</h1>
          <div class="flex items-center justify-center sm:justify-start gap-2 mb-3">
            <span class="text-sm opacity-80">{{ userCountry?.flag }} {{ userCountry?.name }}</span>
            <span class="text-xs opacity-60">·</span>
            <span class="text-xs opacity-60">Joined {{ store.joinDate }}</span>
          </div>
          <div class="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
            <div class="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-heading font-bold flex items-center gap-1.5">
              {{ store.currentTier.icon }} {{ store.currentTier.name }}
            </div>
            <div class="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-heading font-bold">
              Lv.{{ store.level }}
            </div>
            <div class="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-heading font-bold">
              🔥 {{ store.loginStreak }} streak
            </div>
          </div>
          <!-- XP bar -->
          <div class="mt-4 max-w-xs mx-auto sm:mx-0">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] opacity-70">{{ store.xp }}/{{ store.xpForNextLevel }} XP</span>
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
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-10 animate-slide-up" style="animation-delay: 0.05s">
      <div v-for="stat in stats" :key="stat.label"
        class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700 text-center">
        <p class="text-2xl mb-1">{{ stat.icon }}</p>
        <p class="font-heading font-bold text-xl text-ink dark:text-white">{{ stat.value }}</p>
        <p class="text-[10px] text-gray-400 font-body mt-0.5">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Achievements -->
    <div class="mb-8 sm:mb-10 animate-slide-up" style="animation-delay: 0.08s">
      <h2 class="font-heading text-lg sm:text-xl font-bold text-ink dark:text-white mb-5">Achievements</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div v-for="ach in store.achievementsList" :key="ach.id"
          class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700 text-center transition-all"
          :class="ach.unlocked ? 'hover:shadow-md' : 'opacity-40 grayscale'">
          <span class="text-3xl block mb-2">{{ ach.icon }}</span>
          <p class="font-heading font-bold text-xs text-ink dark:text-white mb-1">{{ ach.name }}</p>
          <p class="text-[10px] text-gray-400 font-body">{{ ach.description }}</p>
          <p v-if="ach.unlocked" class="text-[9px] text-teal-500 font-heading font-bold mt-2">{{ ach.date }}</p>
          <p v-else class="text-[9px] text-gray-300 dark:text-gray-600 font-heading font-bold mt-2">🔒 Locked</p>
        </div>
      </div>
    </div>

    <!-- Bio / Profile Edit Section -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700 mb-8 sm:mb-10 animate-slide-up" style="animation-delay: 0.1s">
      <h2 class="font-heading text-lg font-bold text-ink dark:text-white mb-5">Edit Profile</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <div>
          <label class="text-[10px] font-heading font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Display Name</label>
          <input v-model="editName" type="text"
            class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl font-body text-sm text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all" />
        </div>
        <div>
          <label class="text-[10px] font-heading font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Country</label>
          <select v-model="editCountry"
            class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl font-body text-sm text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all">
            <option v-for="c in store.countries" :key="c.code" :value="c.code">{{ c.flag }} {{ c.name }}</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="text-[10px] font-heading font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Bio</label>
          <textarea v-model="editBio" rows="3" placeholder="Tell us about yourself..."
            class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl font-body text-sm text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none transition-all"></textarea>
        </div>
        <div>
          <label class="text-[10px] font-heading font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Avatar Color</label>
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
          <button v-if="hasChanges" @click="saveProfile"
            class="px-6 py-3 bg-teal-500 text-white rounded-xl font-heading font-bold text-sm hover:bg-teal-600 transition-colors shadow-sm shadow-teal-500/20">
            Save Changes
          </button>
        </Transition>
        <button v-if="hasChanges" @click="resetProfile"
          class="px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 rounded-xl font-heading font-bold text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
          Reset
        </button>
        <span v-if="saved" class="text-sm font-heading font-bold text-teal-500 ml-2 animate-bounce">✓ Saved!</span>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="animate-slide-up" style="animation-delay: 0.12s">
      <h2 class="font-heading text-lg sm:text-xl font-bold text-ink dark:text-white mb-5">Recent Activity</h2>
      <div class="space-y-2">
        <div v-for="tx in store.transactions.slice(0, 10)" :key="tx.id"
          class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              :class="tx.type === 'earn' ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-500' : tx.type === 'donate' ? 'bg-red-50 dark:bg-red-900/30 text-red-500' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-500'">
              {{ tx.type === 'earn' ? '💰' : tx.type === 'donate' ? '❤️' : '🛒' }}
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
          No activity yet. Start your training journey!
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="mt-8 sm:mt-10 animate-slide-up" style="animation-delay: 0.15s">
      <div class="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-slate-700">
        <h2 class="font-heading text-lg font-bold text-ink dark:text-white mb-2">Account</h2>
        <p class="text-xs text-gray-400 font-body mb-5">Sign out of your RESILIA account. Your progress is saved locally and will be available when you sign back in.</p>
        <div class="flex items-center gap-3">
          <button v-if="!showLogoutConfirm" @click="showLogoutConfirm = true"
            class="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl font-heading font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-all">
            Sign Out
          </button>
          <template v-else>
            <button @click="handleLogout"
              class="px-6 py-3 bg-red-500 text-white rounded-xl font-heading font-bold text-sm hover:bg-red-600 transition-all shadow-sm shadow-red-500/20">
              Yes, Sign Out
            </button>
            <button @click="showLogoutConfirm = false"
              class="px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 rounded-xl font-heading font-bold text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
              Cancel
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'

const store = useResiliaStore()
const router = useRouter()

const editName = ref(store.userName)
const editCountry = ref(store.countryCode)
const editBio = ref(store.bio)
const editColor = ref(store.avatarColor)
const saved = ref(false)

const avatarColors = ['#0D9488', '#F97316', '#8B5CF6', '#EF4444', '#3B82F6', '#EAB308', '#EC4899', '#10B981']

const userCountry = computed(() => store.countries.find(c => c.code === store.countryCode))

const stats = computed(() => [
  { icon: '🏆', value: store.totalXPEarned, label: 'Total XP' },
  { icon: '🪙', value: store.resiCoinBalance, label: 'ResiCoins' },
  { icon: '📚', value: store.completedModules.length + store.completedBeginnerModules.length, label: 'Modules' },
  { icon: '🎮', value: store.completedRPGs.length, label: 'RPGs Cleared' },
  { icon: '🧘', value: store.breathingSessions, label: 'Breathing' },
  { icon: '🔥', value: store.loginStreak, label: 'Streak' },
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
    alert(`Mock: User selected ${file.name}. Profile picture updated!`)
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
