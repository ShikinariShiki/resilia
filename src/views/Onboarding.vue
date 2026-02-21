<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 flex items-center justify-center overflow-hidden px-6 py-10 sm:px-8 md:px-12">
    <!-- Decorative blobs -->
    <div class="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-lg relative z-10">
      <!-- Progress dots (6 steps) -->
      <div class="flex items-center justify-center gap-2 mb-12 md:mb-14">
        <div v-for="i in 6" :key="i" class="h-2 rounded-full transition-all duration-500"
          :class="step >= i - 1 ? 'bg-teal-500 w-8' : 'bg-gray-200 w-2'"></div>
      </div>

      <Transition name="slide" mode="out-in">
        <!-- Step 0: Welcome Splash (Narrative) -->
        <div v-if="step === 0" key="welcome" class="text-center">
          <div class="mb-12 animate-slide-up">
            <div class="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-xl animate-pulse-slow">
              <span class="text-5xl">📡</span>
            </div>
            <p class="text-teal-600/70 font-body text-xs uppercase tracking-[0.25em] mb-6 animate-slide-up">[ INCOMING TRANSMISSION ]</p>
            <h1 class="font-heading text-3xl md:text-4xl font-bold text-ink mb-5 leading-tight animate-slide-up" style="animation-delay: 0.05s">
              A signal has been<br>
              <span class="bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">detected…</span>
            </h1>
            <p class="text-gray-400 font-body text-sm md:text-base leading-relaxed max-w-sm mx-auto animate-slide-up" style="animation-delay: 0.1s">
              Across Southeast Asia, communities are calling for help. Disasters strike without warning. 
              But there are those who are prepared — the <strong class="text-ink">Digital Reserve Corps</strong>.
            </p>
            <p class="text-gray-500 font-body text-sm mt-4 italic animate-slide-up" style="animation-delay: 0.15s">
              Your training begins now.
            </p>
          </div>
          <div class="space-y-5 animate-slide-up" style="animation-delay: 0.2s">
            <button @click="step = 1"
              class="w-full px-8 py-5 bg-ink text-white rounded-2xl font-heading font-bold text-base md:text-lg hover:bg-gray-800 transition-all hover:shadow-xl">
              Accept the Mission →
            </button>
            <RouterLink to="/" class="inline-block text-sm text-gray-400 font-body hover:text-teal-600 transition-colors">
              ← Back to landing page
            </RouterLink>
          </div>
        </div>

        <!-- Step 1: Country Selection -->
        <div v-else-if="step === 1" key="country" class="animate-slide-up">
          <div class="text-center mb-8 md:mb-10">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span class="text-3xl">🌏</span>
            </div>
            <p class="text-teal-600/70 font-body text-[10px] uppercase tracking-[0.25em] mb-3">[ MISSION BRIEFING ]</p>
            <h2 class="font-heading text-2xl md:text-3xl font-bold text-ink mb-3">Every region has its own story</h2>
            <p class="text-gray-400 font-body text-sm">Where will your journey begin? Select your ASEAN base of operations.</p>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-8">
            <button
              v-for="c in store.countries" :key="c.code"
              @click="selectedCountry = c.code"
              class="flex items-center gap-3 p-4 rounded-2xl text-left font-body transition-all"
              :class="selectedCountry === c.code
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 scale-[1.02]'
                : 'bg-white hover:bg-gray-50 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'"
            >
              <span class="text-xl">{{ c.flag }}</span>
              <span class="font-medium text-xs">{{ c.name }}</span>
            </button>
          </div>

          <div class="flex justify-between gap-4">
            <button @click="step = 0" class="px-6 py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors">
              ← Back
            </button>
            <button @click="step = 2" :disabled="!selectedCountry"
              class="flex-1 px-6 py-4 bg-ink text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              Continue →
            </button>
          </div>
        </div>

        <!-- Step 2: Age Check -->
        <div v-else-if="step === 2" key="age" class="animate-slide-up">
          <div class="text-center mb-8 md:mb-10">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span class="text-3xl">🎂</span>
            </div>
            <p class="text-teal-600/70 font-body text-[10px] uppercase tracking-[0.25em] mb-3">[ CLEARANCE CHECK ]</p>
            <h2 class="font-heading text-2xl md:text-3xl font-bold text-ink mb-3">Your readiness level</h2>
            <p class="text-gray-400 font-body text-sm">Before we assign your training path, we need to calibrate your experience level.</p>
          </div>

          <div class="space-y-3 mb-8">
            <button @click="selectedAge = 'adult'"
              class="w-full flex items-center gap-4 p-5 rounded-2xl text-left font-body transition-all"
              :class="selectedAge === 'adult'
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white hover:bg-gray-50 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'">
              <span class="text-2xl">✅</span>
              <div>
                <p class="font-heading font-bold text-sm">I am 18 or above</p>
                <p class="text-xs mt-1" :class="selectedAge === 'adult' ? 'text-white/70' : 'text-gray-400'">Full access to all training modules</p>
              </div>
            </button>
            <button @click="selectedAge = 'minor'"
              class="w-full flex items-center gap-4 p-5 rounded-2xl text-left font-body transition-all"
              :class="selectedAge === 'minor'
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white hover:bg-gray-50 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'">
              <span class="text-2xl">🔰</span>
              <div>
                <p class="font-heading font-bold text-sm">I am under 18</p>
                <p class="text-xs mt-1" :class="selectedAge === 'minor' ? 'text-white/70' : 'text-gray-400'">Age-appropriate training path</p>
              </div>
            </button>
          </div>

          <div class="flex justify-between gap-4">
            <button @click="step = 1" class="px-6 py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors">← Back</button>
            <button @click="step = 3" :disabled="!selectedAge"
              class="flex-1 px-6 py-4 bg-ink text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed">Continue →</button>
          </div>
        </div>

        <!-- Step 3: Gender -->
        <div v-else-if="step === 3" key="gender" class="animate-slide-up">
          <div class="text-center mb-8 md:mb-10">
            <div class="w-16 h-16 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span class="text-3xl">🧑‍🤝‍🧑</span>
            </div>
            <p class="text-teal-600/70 font-body text-[10px] uppercase tracking-[0.25em] mb-3">[ RESPONDER PROFILE ]</p>
            <h2 class="font-heading text-2xl md:text-3xl font-bold text-ink mb-3">Every responder is unique</h2>
            <p class="text-gray-400 font-body text-sm">Your perspective matters. This helps us personalize your training experience.</p>
          </div>

          <div class="space-y-3 mb-8">
            <button v-for="g in genderOptions" :key="g.value" @click="selectedGender = g.value"
              class="w-full flex items-center gap-4 p-5 rounded-2xl text-left font-body transition-all"
              :class="selectedGender === g.value
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white hover:bg-gray-50 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'">
              <span class="text-2xl">{{ g.icon }}</span>
              <p class="font-heading font-bold text-sm">{{ g.label }}</p>
            </button>
          </div>

          <div class="flex justify-between gap-4">
            <button @click="step = 2" class="px-6 py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors">← Back</button>
            <button @click="step = 4" :disabled="!selectedGender"
              class="flex-1 px-6 py-4 bg-ink text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed">Continue →</button>
          </div>
        </div>

        <!-- Step 4: Disaster Experience -->
        <div v-else-if="step === 4" key="disaster" class="animate-slide-up">
          <div class="text-center mb-8 md:mb-10">
            <div class="w-16 h-16 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span class="text-3xl">🌊</span>
            </div>
            <p class="text-teal-600/70 font-body text-[10px] uppercase tracking-[0.25em] mb-3">[ FIELD EXPERIENCE ]</p>
            <h2 class="font-heading text-2xl md:text-3xl font-bold text-ink mb-3">Some of us have already faced the storm</h2>
            <p class="text-gray-400 font-body text-sm">Have you ever personally experienced a natural disaster? This helps us tailor your journey.</p>
          </div>

          <div class="space-y-3 mb-8">
            <button @click="disasterExp = true"
              class="w-full flex items-center gap-4 p-5 rounded-2xl text-left font-body transition-all"
              :class="disasterExp === true
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white hover:bg-gray-50 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'">
              <span class="text-2xl">🌧️</span>
              <div>
                <p class="font-heading font-bold text-sm">Yes, I have</p>
                <p class="text-xs mt-1" :class="disasterExp === true ? 'text-white/70' : 'text-gray-400'">Your experience makes you an invaluable responder</p>
              </div>
            </button>
            <button @click="disasterExp = false"
              class="w-full flex items-center gap-4 p-5 rounded-2xl text-left font-body transition-all"
              :class="disasterExp === false
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white hover:bg-gray-50 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'">
              <span class="text-2xl">☀️</span>
              <div>
                <p class="font-heading font-bold text-sm">No, I haven't</p>
                <p class="text-xs mt-1" :class="disasterExp === false ? 'text-white/70' : 'text-gray-400'">That's okay — preparation is the best defense</p>
              </div>
            </button>
          </div>

          <div class="flex justify-between gap-4">
            <button @click="step = 3" class="px-6 py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors">← Back</button>
            <button @click="step = 5" :disabled="disasterExp === null"
              class="flex-1 px-6 py-4 bg-ink text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed">Continue →</button>
          </div>
        </div>

        <!-- Step 5: Name + Profile Preview -->
        <div v-else-if="step === 5" key="name" class="animate-slide-up">
          <div class="text-center mb-8 md:mb-10">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span class="text-3xl">✨</span>
            </div>
            <p class="text-teal-600/70 font-body text-[10px] uppercase tracking-[0.25em] mb-3">[ CALLSIGN ASSIGNMENT ]</p>
            <h2 class="font-heading text-2xl md:text-3xl font-bold text-ink mb-3">Your callsign awaits</h2>
            <p class="text-gray-400 font-body text-sm">This name will be remembered across ASEAN. Choose wisely, responder.</p>
          </div>

          <div class="mb-6">
            <input
              v-model="name"
              type="text"
              placeholder="Enter your callsign"
              class="w-full px-6 py-5 bg-white rounded-2xl font-body text-base text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-teal-400/50 placeholder:text-gray-300 transition-all"
              :class="nameError ? 'ring-2 ring-red-400/50' : ''"
              @input="checkName"
              @keyup.enter="finish"
              autofocus
            />
            <p v-if="nameError" class="text-xs text-red-500 font-body mt-2 flex items-center gap-1.5">
              <span>⚠️</span> {{ nameError }}
            </p>
          </div>

          <!-- Preview card -->
          <div v-if="name.trim() && !nameError" class="bg-white rounded-2xl p-6 mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] animate-slide-up">
            <p class="text-[10px] font-heading font-bold text-gray-300 uppercase tracking-wider mb-4">Your responder profile</p>
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-heading font-bold text-lg">
                {{ name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) }}
              </div>
              <div>
                <p class="font-heading font-bold text-ink text-base">{{ name.trim() }}</p>
                <p class="text-xs text-gray-400 font-body mt-1">🔰 Cadet · {{ selectedFlag }} · {{ selectedAge === 'adult' ? '18+' : 'Under 18' }}</p>
              </div>
            </div>
          </div>

          <div class="flex justify-between gap-4">
            <button @click="step = 4" class="px-6 py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors">← Back</button>
            <button @click="finish" :disabled="!name.trim() || !!nameError"
              class="flex-1 px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-heading font-bold text-sm hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              Begin Training →
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import { validateDisplayName } from '../utils/profanityFilter'

const store = useResiliaStore()
const router = useRouter()

const step = ref(0)
const selectedCountry = ref('')
const selectedAge = ref('')
const selectedGender = ref('')
const disasterExp = ref(null)
const name = ref('')
const nameError = ref('')

const genderOptions = [
  { value: 'male', label: 'Male', icon: '♂️' },
  { value: 'female', label: 'Female', icon: '♀️' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: '🤝' },
]

const selectedFlag = computed(() => {
  const country = store.countries.find(c => c.code === selectedCountry.value)
  return country ? `${country.flag} ${country.name}` : ''
})

function checkName() {
  nameError.value = validateDisplayName(name.value) || ''
}

function finish() {
  const err = validateDisplayName(name.value)
  if (err) { nameError.value = err; return }
  if (name.value.trim() && selectedCountry.value) {
    store.completeOnboarding(
      name.value.trim(),
      selectedCountry.value,
      selectedAge.value,
      selectedGender.value,
      disasterExp.value
    )
    router.push('/journal')
  }
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
@keyframes pulse-slow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}
</style>
