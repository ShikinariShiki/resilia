<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 flex items-center justify-center overflow-hidden px-6 py-10 sm:px-8 md:px-12">
    <!-- Decorative blobs -->
    <div class="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10">
      <!-- Logo -->
      <div class="text-center mb-10 animate-slide-up">
        <div class="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl">
          <span class="text-3xl">🛡️</span>
        </div>
        <h1 class="font-heading text-3xl md:text-4xl font-bold text-ink">
          Join <span class="bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">RESILIA</span>
        </h1>
        <p class="text-gray-400 font-body text-sm mt-2">Train to be a Digital First Responder</p>
      </div>

      <!-- Tab Switcher -->
      <div class="flex bg-gray-100 rounded-2xl p-1.5 mb-8 animate-slide-up" style="animation-delay: 0.05s">
        <button @click="mode = 'register'"
          class="flex-1 py-3 rounded-xl font-heading font-bold text-sm transition-all duration-300"
          :class="mode === 'register' ? 'bg-white text-ink shadow-sm' : 'text-gray-400 hover:text-gray-600'">
          Sign Up
        </button>
        <button @click="mode = 'login'"
          class="flex-1 py-3 rounded-xl font-heading font-bold text-sm transition-all duration-300"
          :class="mode === 'login' ? 'bg-white text-ink shadow-sm' : 'text-gray-400 hover:text-gray-600'">
          Log In
        </button>
      </div>

      <Transition name="slide" mode="out-in">
        <!-- Register Form -->
        <div v-if="mode === 'register'" key="register" class="animate-slide-up" style="animation-delay: 0.1s">
          <div class="space-y-4 mb-6">
            <!-- Name -->
            <div>
              <label class="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider mb-2">Display Name</label>
              <input v-model="regName" type="text" placeholder="Your callsign"
                class="w-full px-5 py-4 bg-white rounded-2xl font-body text-sm text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-teal-400/50 placeholder:text-gray-300 transition-all"
                :class="nameError ? 'ring-2 ring-red-400/50' : ''"
                @input="checkName" />
              <p v-if="nameError" class="text-xs text-red-500 font-body mt-2 flex items-center gap-1.5">
                <span>⚠️</span> {{ nameError }}
              </p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
              <input v-model="regEmail" type="email" placeholder="you@example.com"
                class="w-full px-5 py-4 bg-white rounded-2xl font-body text-sm text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-teal-400/50 placeholder:text-gray-300 transition-all" />
            </div>

            <!-- Password -->
            <div>
              <label class="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <input v-model="regPassword" type="password" placeholder="Min 6 characters"
                class="w-full px-5 py-4 bg-white rounded-2xl font-body text-sm text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-teal-400/50 placeholder:text-gray-300 transition-all" />
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider mb-2">Confirm Password</label>
              <input v-model="regConfirm" type="password" placeholder="Re-enter password"
                class="w-full px-5 py-4 bg-white rounded-2xl font-body text-sm text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-teal-400/50 placeholder:text-gray-300 transition-all"
                :class="regConfirm && regPassword !== regConfirm ? 'ring-2 ring-red-400/50' : ''" />
              <p v-if="regConfirm && regPassword !== regConfirm" class="text-xs text-red-500 font-body mt-2">Passwords don't match</p>
            </div>
          </div>

          <!-- ToS Checkbox -->
          <label class="flex items-start gap-3 mb-6 cursor-pointer group">
            <input type="checkbox" v-model="agreedToS"
              class="mt-0.5 w-5 h-5 rounded-lg border-2 border-gray-200 text-teal-500 focus:ring-teal-400/50 cursor-pointer accent-teal-500" />
            <span class="text-xs text-gray-500 font-body leading-relaxed">
              I agree to the
              <button @click.prevent="showToS = true" class="text-teal-600 font-bold hover:underline">Terms of Service</button>
              and
              <button @click.prevent="showPrivacy = true" class="text-teal-600 font-bold hover:underline">Privacy Policy</button>,
              including the prohibition of inappropriate usernames.
            </span>
          </label>

          <!-- Error -->
          <p v-if="formError" class="text-xs text-red-500 font-body mb-4 flex items-center gap-1.5"><span>❌</span> {{ formError }}</p>

          <!-- Register Button -->
          <button @click="handleRegister" :disabled="!canRegister"
            class="w-full py-4 bg-ink text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed mb-4">
            Create Account →
          </button>

          <!-- Google -->
          <button @click="handleGoogleAuth"
            class="w-full py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-md transition-all flex items-center justify-center gap-3">
            <svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
        </div>

        <!-- Login Form -->
        <div v-else key="login" class="animate-slide-up" style="animation-delay: 0.1s">
          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
              <input v-model="loginEmail" type="email" placeholder="you@example.com"
                class="w-full px-5 py-4 bg-white rounded-2xl font-body text-sm text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-teal-400/50 placeholder:text-gray-300 transition-all" />
            </div>
            <div>
              <label class="block text-xs font-heading font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <input v-model="loginPassword" type="password" placeholder="Enter your password"
                class="w-full px-5 py-4 bg-white rounded-2xl font-body text-sm text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-teal-400/50 placeholder:text-gray-300 transition-all"
                @keyup.enter="handleLogin" />
            </div>
          </div>

          <p v-if="formError" class="text-xs text-red-500 font-body mb-4 flex items-center gap-1.5"><span>❌</span> {{ formError }}</p>

          <button @click="handleLogin" :disabled="!loginEmail || !loginPassword"
            class="w-full py-4 bg-ink text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed mb-4">
            Log In →
          </button>

          <button @click="handleGoogleAuth"
            class="w-full py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-md transition-all flex items-center justify-center gap-3">
            <svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
        </div>
      </Transition>

      <!-- Back to landing -->
      <div class="text-center mt-8 animate-slide-up" style="animation-delay: 0.15s">
        <RouterLink to="/" class="text-sm text-gray-400 font-body hover:text-teal-600 transition-colors">
          ← Back to landing page
        </RouterLink>
      </div>
    </div>

    <!-- ToS Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showToS || showPrivacy" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" @click.self="showToS = false; showPrivacy = false">
          <div class="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-8 animate-slide-up shadow-2xl">
            <h2 class="font-heading text-2xl font-bold text-ink mb-4">{{ showToS ? 'Terms of Service' : 'Privacy Policy' }}</h2>
            <div v-if="showToS" class="text-sm text-gray-500 font-body space-y-4 leading-relaxed">
              <p><strong>1. Acceptance of Terms</strong><br>By creating an account on RESILIA, you agree to these Terms of Service.</p>
              <p><strong>2. User Conduct</strong><br>You agree not to use inappropriate, offensive, or vulgar language in your display name or any user-generated content. RESILIA reserves the right to remove or modify names that violate community standards. Prohibited content includes hate speech, profanity, sexually explicit language, and discriminatory terms in any language.</p>
              <p><strong>3. Account</strong><br>You are responsible for maintaining the security of your account. RESILIA is an educational platform and does not provide professional medical or psychological advice.</p>
              <p><strong>4. Content</strong><br>All educational content is based on WHO Psychological First Aid guidelines and is provided for informational purposes only.</p>
              <p><strong>5. Virtual Currency</strong><br>ResiCoins have no real-world monetary value. They are earned through platform engagement and can be redeemed for digital items within the platform.</p>
            </div>
            <div v-else class="text-sm text-gray-500 font-body space-y-4 leading-relaxed">
              <p><strong>1. Data Collection</strong><br>We collect your display name, country, age group, gender, and disaster experience for personalization purposes only.</p>
              <p><strong>2. Data Storage</strong><br>All data is stored locally in your browser. No data is transmitted to external servers in this MVP version.</p>
              <p><strong>3. Data Usage</strong><br>Your data is used solely to personalize your learning experience within RESILIA.</p>
              <p><strong>4. Your Rights</strong><br>You may delete all your data at any time by clearing your browser storage.</p>
            </div>
            <button @click="showToS = false; showPrivacy = false"
              class="mt-6 w-full py-3 bg-ink text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 transition-colors">
              Close
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import { validateDisplayName } from '../utils/profanityFilter'

const store = useResiliaStore()
const router = useRouter()

const mode = ref('register')

// Register
const regName = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regConfirm = ref('')
const agreedToS = ref(false)
const nameError = ref('')
const formError = ref('')

// Login
const loginEmail = ref('')
const loginPassword = ref('')

// Modals
const showToS = ref(false)
const showPrivacy = ref(false)

function checkName() {
  nameError.value = validateDisplayName(regName.value) || ''
}

const canRegister = computed(() => {
  return regName.value.trim() &&
    regEmail.value.trim() &&
    regPassword.value.length >= 6 &&
    regPassword.value === regConfirm.value &&
    agreedToS.value &&
    !nameError.value
})

function handleRegister() {
  formError.value = ''
  const nameErr = validateDisplayName(regName.value)
  if (nameErr) { nameError.value = nameErr; return }
  if (!regEmail.value.includes('@')) { formError.value = 'Please enter a valid email'; return }
  if (regPassword.value.length < 6) { formError.value = 'Password must be at least 6 characters'; return }
  if (regPassword.value !== regConfirm.value) { formError.value = 'Passwords do not match'; return }
  if (!agreedToS.value) { formError.value = 'You must agree to the Terms of Service'; return }

  store.registerUser(regEmail.value, regPassword.value, regName.value)
  router.push('/onboarding')
}

function handleLogin() {
  formError.value = ''
  if (!loginEmail.value || !loginPassword.value) { formError.value = 'Please fill in all fields'; return }

  const success = store.loginUser(loginEmail.value, loginPassword.value)
  if (success) {
    router.push(store.onboarded ? '/home' : '/onboarding')
  } else {
    formError.value = 'Invalid email or password'
  }
}

function handleGoogleAuth() {
  // Mock Google authentication
  const mockEmail = 'user@gmail.com'
  const mockName = 'RESILIA User'
  store.registerUser(mockEmail, 'google-auth', mockName)
  router.push(store.onboarded ? '/home' : '/onboarding')
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
