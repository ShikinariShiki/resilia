<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 flex items-center justify-center overflow-hidden px-6 py-10 sm:px-8 md:px-12">
    <!-- Decorative blobs -->
    <div class="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-lg relative z-10">
      <!-- Progress dots (6 steps) -->
      <div class="flex items-center justify-center gap-2 mb-12 md:mb-14">
        <div v-for="i in 11" :key="i" class="h-2 rounded-full transition-all duration-500"
          :class="step >= i - 1 ? 'bg-teal-500 w-8' : 'bg-gray-200 w-2'"></div>
      </div>

      <Transition name="slide" mode="out-in">
        <!-- Step 0: Welcome Splash (Narrative) -->
        <div v-if="step === 0" key="welcome" class="text-center">
          <div v-motion class="mb-12">
            <div class="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-xl animate-pulse-slow">
              <PhBroadcast :size="48" class="text-teal-100" weight="fill" />
            </div>
            <p v-motion class="text-teal-600/70 font-body text-xs uppercase tracking-[0.25em] mb-6">{{ t('onboarding.step0.transmission') }}</p>
            <h1 v-motion class="font-heading text-3xl md:text-4xl font-bold text-ink mb-5 leading-tight" style="animation-delay: 0.05s">
              {{ t('onboarding.step0.title1') }}<br>
              <span class="bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">{{ t('onboarding.step0.title2') }}</span>
            </h1>
            <p v-motion class="text-gray-400 font-body text-sm md:text-base leading-relaxed max-w-sm mx-auto" style="animation-delay: 0.1s" v-html="t('onboarding.step0.desc')">
            </p>
            <p v-motion class="text-gray-500 font-body text-sm mt-4 italic" style="animation-delay: 0.15s">
              {{ t('onboarding.step0.subdesc') }}
            </p>
          </div>
          <div v-motion class="space-y-5" style="animation-delay: 0.2s">
            <button @click="step = 1"
              class="w-full px-8 py-5 bg-ink text-white rounded-2xl font-heading font-bold text-base md:text-lg hover:bg-gray-800 transition-all hover:shadow-xl">
              {{ t('onboarding.step0.accept') }}
            </button>
            <RouterLink to="/" class="inline-block text-sm text-gray-400 font-body hover:text-teal-600 transition-colors">
              {{ t('onboarding.step0.backToLanding') }}
            </RouterLink>
          </div>
        </div>

        <!-- Step 1: Country Selection -->
        <div v-else-if="step === 1" key="country" v-motion>
          <div class="text-center mb-8 md:mb-10">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PhGlobeHemisphereEast :size="32" class="text-blue-500" weight="fill" />
            </div>
            <p class="text-teal-600/70 font-body text-[10px] uppercase tracking-[0.25em] mb-3">{{ t('onboarding.step1.briefing') }}</p>
            <h2 class="font-heading text-2xl md:text-3xl font-bold text-ink mb-3">{{ t('onboarding.step1.title') }}</h2>
            <p class="text-gray-400 font-body text-sm">{{ t('onboarding.step1.desc') }}</p>
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
              <img :src="c.flag" class="w-6 h-auto inline-block rounded-sm shadow-sm" alt="Flag" />
              <span class="font-medium text-xs">{{ c.name }}</span>
            </button>
          </div>

          <div class="flex justify-between gap-4">
            <button @click="step = 0" class="px-6 py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors">
              {{ t('onboarding.step1.back') }}
            </button>
            <button @click="step = 2" :disabled="!selectedCountry"
              class="flex-1 px-6 py-4 bg-ink text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              {{ t('onboarding.step1.continue') }}
            </button>
          </div>
        </div>

        <!-- Step 2: Age Check -->
        <div v-else-if="step === 2" key="age" v-motion>
          <div class="text-center mb-8 md:mb-10">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PhCake :size="32" class="text-purple-500" weight="fill" />
            </div>
            <p class="text-teal-600/70 font-body text-[10px] uppercase tracking-[0.25em] mb-3">{{ t('onboarding.step2.clearance') }}</p>
            <h2 class="font-heading text-2xl md:text-3xl font-bold text-ink mb-3">{{ t('onboarding.step2.title') }}</h2>
            <p class="text-gray-400 font-body text-sm">{{ t('onboarding.step2.desc') }}</p>
          </div>

          <div class="space-y-3 mb-8">
            <button @click="selectedAge = 'adult'"
              class="w-full flex items-center gap-4 p-5 rounded-2xl text-left font-body transition-all"
              :class="selectedAge === 'adult'
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white hover:bg-gray-50 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'">
              <PhCheckCircle :size="24" class="text-teal-500" weight="fill" />
              <div>
                <p class="font-heading font-bold text-sm">{{ t('onboarding.step2.adult') }}</p>
                <p class="text-xs mt-1" :class="selectedAge === 'adult' ? 'text-white/70' : 'text-gray-400'">{{ t('onboarding.step2.adultDesc') }}</p>
              </div>
            </button>
            <button @click="selectedAge = 'minor'"
              class="w-full flex items-center gap-4 p-5 rounded-2xl text-left font-body transition-all"
              :class="selectedAge === 'minor'
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white hover:bg-gray-50 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'">
              <PhShieldChevron :size="24" class="text-teal-500" weight="fill" />
              <div>
                <p class="font-heading font-bold text-sm">{{ t('onboarding.step2.minor') }}</p>
                <p class="text-xs mt-1" :class="selectedAge === 'minor' ? 'text-white/70' : 'text-gray-400'">{{ t('onboarding.step2.minorDesc') }}</p>
              </div>
            </button>
          </div>

          <div class="flex justify-between gap-4">
            <button @click="step = 1" class="px-6 py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors">{{ t('onboarding.step1.back') }}</button>
            <button @click="step = 3" :disabled="!selectedAge"
              class="flex-1 px-6 py-4 bg-ink text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed">{{ t('onboarding.step1.continue') }}</button>
          </div>
        </div>

        <!-- Step 3: Gender -->
        <div v-else-if="step === 3" key="gender" v-motion>
          <div class="text-center mb-8 md:mb-10">
            <div class="w-16 h-16 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PhUsers :size="32" class="text-pink-500" weight="fill" />
            </div>
            <p class="text-teal-600/70 font-body text-[10px] uppercase tracking-[0.25em] mb-3">{{ t('onboarding.step3.profile') }}</p>
            <h2 class="font-heading text-2xl md:text-3xl font-bold text-ink mb-3">{{ t('onboarding.step3.title') }}</h2>
            <p class="text-gray-400 font-body text-sm">{{ t('onboarding.step3.desc') }}</p>
          </div>

          <div class="space-y-3 mb-8">
            <button v-for="g in genderOptions" :key="g.value" @click="selectedGender = g.value"
              class="w-full flex items-center gap-4 p-5 rounded-2xl text-left font-body transition-all"
              :class="selectedGender === g.value
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white hover:bg-gray-50 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'">
              <component :is="g.icon" :size="24" :class="selectedGender === g.value ? 'text-white' : 'text-gray-400'" weight="fill" />
              <p class="font-heading font-bold text-sm">{{ g.label }}</p>
            </button>
          </div>

          <div class="flex justify-between gap-4">
            <button @click="step = 2" class="px-6 py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors">{{ t('onboarding.step1.back') }}</button>
            <button @click="step = 4" :disabled="!selectedGender"
              class="flex-1 px-6 py-4 bg-ink text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed">{{ t('onboarding.step1.continue') }}</button>
          </div>
        </div>

        <!-- Step 4: Disaster Experience -->
        <div v-else-if="step === 4" key="disaster" v-motion>
          <div class="text-center mb-8 md:mb-10">
            <div class="w-16 h-16 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PhDrop :size="32" class="text-amber-500" weight="fill" />
            </div>
            <p class="text-teal-600/70 font-body text-[10px] uppercase tracking-[0.25em] mb-3">{{ t('onboarding.step4.fieldExp') }}</p>
            <h2 class="font-heading text-2xl md:text-3xl font-bold text-ink mb-3">{{ t('onboarding.step4.title') }}</h2>
            <p class="text-gray-400 font-body text-sm">{{ t('onboarding.step4.desc') }}</p>
          </div>

          <div class="space-y-3 mb-8">
            <button @click="disasterExp = true"
              class="w-full flex items-center gap-4 p-5 rounded-2xl text-left font-body transition-all"
              :class="disasterExp === true
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white hover:bg-gray-50 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'">
              <PhCloudRain :size="24" :class="disasterExp === true ? 'text-white' : 'text-gray-500'" weight="fill" />
              <div>
                <p class="font-heading font-bold text-sm">{{ t('onboarding.step4.yes') }}</p>
                <p class="text-xs mt-1" :class="disasterExp === true ? 'text-white/70' : 'text-gray-400'">{{ t('onboarding.step4.yesDesc') }}</p>
              </div>
            </button>
            <button @click="disasterExp = false"
              class="w-full flex items-center gap-4 p-5 rounded-2xl text-left font-body transition-all"
              :class="disasterExp === false
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white hover:bg-gray-50 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'">
              <PhSun :size="24" :class="disasterExp === false ? 'text-white' : 'text-amber-500'" weight="fill" />
              <div>
                <p class="font-heading font-bold text-sm">{{ t('onboarding.step4.no') }}</p>
                <p class="text-xs mt-1" :class="disasterExp === false ? 'text-white/70' : 'text-gray-400'">{{ t('onboarding.step4.noDesc') }}</p>
              </div>
            </button>
          </div>

          <div class="flex justify-between gap-4">
            <button @click="step = 3" class="px-6 py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors">{{ t('onboarding.step1.back') }}</button>
            <button @click="step = 5" :disabled="disasterExp === null"
              class="flex-1 px-6 py-4 bg-ink text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed">{{ t('onboarding.step1.continue') }}</button>
          </div>
        </div>

        <!-- Step 5: Goal -->
        <div v-else-if="step === 5" key="goal" v-motion>
          <div class="text-center mb-8 md:mb-10">
            <div class="w-16 h-16 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PhTarget :size="32" class="text-teal-500" weight="fill" />
            </div>
            <p class="text-teal-600/70 font-body text-[10px] uppercase tracking-[0.25em] mb-3">MISSION OBJECTIVE</p>
            <h2 class="font-heading text-2xl md:text-3xl font-bold text-ink mb-3">What's your main goal?</h2>
            <p class="text-gray-400 font-body text-sm">This helps us personalize your experience</p>
          </div>
          <div class="space-y-3 mb-8">
            <button v-for="g in goalOptions" :key="g.value" @click="selectedGoal = g.value"
              class="w-full flex items-center gap-4 p-5 rounded-2xl text-left font-body transition-all"
              :class="selectedGoal === g.value
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white hover:bg-gray-50 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'">
              <span class="text-xl">{{ g.emoji }}</span>
              <div>
                <p class="font-heading font-bold text-sm">{{ g.label }}</p>
                <p class="text-xs mt-1" :class="selectedGoal === g.value ? 'text-white/70' : 'text-gray-400'">{{ g.desc }}</p>
              </div>
            </button>
          </div>
          <div class="flex justify-between gap-4">
            <button @click="step = 4" class="px-6 py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors">{{ t('onboarding.step1.back') }}</button>
            <button @click="step = 6" :disabled="!selectedGoal"
              class="flex-1 px-6 py-4 bg-ink text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed">{{ t('onboarding.step1.continue') }}</button>
          </div>
        </div>

        <!-- Step 6: Stressor -->
        <div v-else-if="step === 6" key="stressor" v-motion>
          <div class="text-center mb-8 md:mb-10">
            <div class="w-16 h-16 bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PhHeartBreak :size="32" class="text-rose-500" weight="fill" />
            </div>
            <p class="text-teal-600/70 font-body text-[10px] uppercase tracking-[0.25em] mb-3">STRESS PROFILE</p>
            <h2 class="font-heading text-2xl md:text-3xl font-bold text-ink mb-3">What concerns you most?</h2>
            <p class="text-gray-400 font-body text-sm">We'll adjust difficulty and tone accordingly</p>
          </div>
          <div class="space-y-3 mb-8">
            <button v-for="s in stressorOptions" :key="s.value" @click="selectedStressor = s.value"
              class="w-full flex items-center gap-4 p-5 rounded-2xl text-left font-body transition-all"
              :class="selectedStressor === s.value
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white hover:bg-gray-50 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'">
              <span class="text-xl">{{ s.emoji }}</span>
              <p class="font-heading font-bold text-sm">{{ s.label }}</p>
            </button>
          </div>
          <div class="flex justify-between gap-4">
            <button @click="step = 5" class="px-6 py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors">{{ t('onboarding.step1.back') }}</button>
            <button @click="step = 7" :disabled="!selectedStressor"
              class="flex-1 px-6 py-4 bg-ink text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed">{{ t('onboarding.step1.continue') }}</button>
          </div>
        </div>

        <!-- Step 7: Coping Style -->
        <div v-else-if="step === 7" key="coping" v-motion>
          <div class="text-center mb-8 md:mb-10">
            <div class="w-16 h-16 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PhPuzzlePiece :size="32" class="text-indigo-500" weight="fill" />
            </div>
            <p class="text-teal-600/70 font-body text-[10px] uppercase tracking-[0.25em] mb-3">COPING STRATEGY</p>
            <h2 class="font-heading text-2xl md:text-3xl font-bold text-ink mb-3">How do you usually cope?</h2>
            <p class="text-gray-400 font-body text-sm">No wrong answers. This calibrates your missions</p>
          </div>
          <div class="space-y-3 mb-8">
            <button v-for="c in copingOptions" :key="c.value" @click="selectedCoping = c.value"
              class="w-full flex items-center gap-4 p-5 rounded-2xl text-left font-body transition-all"
              :class="selectedCoping === c.value
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white hover:bg-gray-50 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'">
              <span class="text-xl">{{ c.emoji }}</span>
              <div>
                <p class="font-heading font-bold text-sm">{{ c.label }}</p>
                <p class="text-xs mt-1" :class="selectedCoping === c.value ? 'text-white/70' : 'text-gray-400'">{{ c.desc }}</p>
              </div>
            </button>
          </div>
          <div class="flex justify-between gap-4">
            <button @click="step = 6" class="px-6 py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors">{{ t('onboarding.step1.back') }}</button>
            <button @click="step = 8" :disabled="!selectedCoping"
              class="flex-1 px-6 py-4 bg-ink text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed">{{ t('onboarding.step1.continue') }}</button>
          </div>
        </div>

        <!-- Step 8: Time Preference -->
        <div v-else-if="step === 8" key="time" v-motion>
          <div class="text-center mb-8 md:mb-10">
            <div class="w-16 h-16 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PhTimer :size="32" class="text-cyan-500" weight="fill" />
            </div>
            <p class="text-teal-600/70 font-body text-[10px] uppercase tracking-[0.25em] mb-3">TIME COMMITMENT</p>
            <h2 class="font-heading text-2xl md:text-3xl font-bold text-ink mb-3">How much time can you spare?</h2>
            <p class="text-gray-400 font-body text-sm">We'll match your daily mission length</p>
          </div>
          <div class="space-y-3 mb-8">
            <button v-for="ti in timeOptions" :key="ti.value" @click="selectedTime = ti.value"
              class="w-full flex items-center gap-4 p-5 rounded-2xl text-left font-body transition-all"
              :class="selectedTime === ti.value
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white hover:bg-gray-50 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'">
              <span class="text-xl">{{ ti.emoji }}</span>
              <div>
                <p class="font-heading font-bold text-sm">{{ ti.label }}</p>
                <p class="text-xs mt-1" :class="selectedTime === ti.value ? 'text-white/70' : 'text-gray-400'">{{ ti.desc }}</p>
              </div>
            </button>
          </div>
          <div class="flex justify-between gap-4">
            <button @click="step = 7" class="px-6 py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors">{{ t('onboarding.step1.back') }}</button>
            <button @click="step = 9" :disabled="!selectedTime"
              class="flex-1 px-6 py-4 bg-ink text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed">{{ t('onboarding.step1.continue') }}</button>
          </div>
        </div>

        <!-- Step 9: Confidence Level -->
        <div v-else-if="step === 9" key="confidence" v-motion>
          <div class="text-center mb-8 md:mb-10">
            <div class="w-16 h-16 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PhShieldCheck :size="32" class="text-emerald-500" weight="fill" />
            </div>
            <p class="text-teal-600/70 font-body text-[10px] uppercase tracking-[0.25em] mb-3">READINESS LEVEL</p>
            <h2 class="font-heading text-2xl md:text-3xl font-bold text-ink mb-3">How confident are you?</h2>
            <p class="text-gray-400 font-body text-sm">About handling disaster situations</p>
          </div>
          <div class="space-y-3 mb-8">
            <button v-for="cf in confidenceOptions" :key="cf.value" @click="selectedConfidence = cf.value"
              class="w-full flex items-center gap-4 p-5 rounded-2xl text-left font-body transition-all"
              :class="selectedConfidence === cf.value
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'bg-white hover:bg-gray-50 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'">
              <span class="text-xl">{{ cf.emoji }}</span>
              <div>
                <p class="font-heading font-bold text-sm">{{ cf.label }}</p>
                <p class="text-xs mt-1" :class="selectedConfidence === cf.value ? 'text-white/70' : 'text-gray-400'">{{ cf.desc }}</p>
              </div>
            </button>
          </div>
          <div class="flex justify-between gap-4">
            <button @click="step = 8" class="px-6 py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors">{{ t('onboarding.step1.back') }}</button>
            <button @click="step = 10" :disabled="!selectedConfidence"
              class="flex-1 px-6 py-4 bg-ink text-white rounded-2xl font-heading font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed">{{ t('onboarding.step1.continue') }}</button>
          </div>
        </div>

        <!-- Step 10: Name + Profile Preview -->
        <div v-else-if="step === 10" key="name" v-motion>
          <div class="text-center mb-8 md:mb-10">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PhSparkle :size="32" class="text-orange-500" weight="fill" />
            </div>
            <p class="text-teal-600/70 font-body text-[10px] uppercase tracking-[0.25em] mb-3">{{ t('onboarding.step5.callsign') }}</p>
            <h2 class="font-heading text-2xl md:text-3xl font-bold text-ink mb-3">{{ t('onboarding.step5.title') }}</h2>
            <p class="text-gray-400 font-body text-sm">{{ t('onboarding.step5.desc') }}</p>
          </div>

          <div class="mb-6">
            <input
              v-model="name"
              type="text"
              :placeholder="t('onboarding.step5.placeholder')"
              class="w-full px-6 py-5 bg-white rounded-2xl font-body text-base text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-teal-400/50 placeholder:text-gray-300 transition-all"
              :class="nameError ? 'ring-2 ring-red-400/50' : ''"
              @input="checkName"
              @keyup.enter="finish"
              autofocus
            />
            <p v-if="nameError" class="text-xs text-red-500 font-body mt-2 flex items-center gap-1.5">
              <span class="flex items-center"><PhWarning :size="16" weight="fill" class="mr-1" /></span> {{ nameError }}
            </p>
          </div>

          <div v-if="name.trim() && !nameError" v-motion class="bg-white rounded-2xl p-6 mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p class="text-[10px] font-heading font-bold text-gray-300 uppercase tracking-wider mb-4">{{ t('onboarding.step5.profilePreview') }}</p>
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-heading font-bold text-lg">
                {{ name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) }}
              </div>
              <div>
                <p class="font-heading font-bold text-ink text-base">{{ name.trim() }}</p>
                <p class="text-xs text-gray-400 font-body mt-1 flex items-center gap-1"><PhShieldChevron :size="12" weight="fill" class="text-teal-500" /> {{ t('onboarding.step5.cadet') }} · {{ selectedFlag }} · {{ selectedAge === 'adult' ? t('onboarding.step5.adultLabel') : t('onboarding.step5.minorLabel') }}</p>
              </div>
            </div>
          </div>

          <div class="flex justify-between gap-4">
            <button @click="step = 9" class="px-6 py-4 bg-white text-ink rounded-2xl font-heading font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors">{{ t('onboarding.step1.back') }}</button>
            <button @click="finish" :disabled="!name.trim() || !!nameError"
              class="flex-1 px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-heading font-bold text-sm hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              {{ t('onboarding.step5.begin') }}
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
import { PhBroadcast, PhGlobeHemisphereEast, PhCake, PhCheckCircle, PhShieldChevron, PhShieldCheck, PhUsers, PhGenderMale, PhGenderFemale, PhHandshake, PhDrop, PhCloudRain, PhSun, PhSparkle, PhWarning, PhTarget, PhHeartBreak, PhPuzzlePiece, PhTimer } from '@phosphor-icons/vue'
import { validateDisplayName } from '../utils/profanityFilter'
import { useI18n } from '../i18n'

const store = useResiliaStore()
const router = useRouter()
const { t } = useI18n()

const step = ref(0)
const selectedCountry = ref('')
const selectedAge = ref('')
const selectedGender = ref('')
const disasterExp = ref(null)
const selectedGoal = ref('')
const selectedStressor = ref('')
const selectedCoping = ref('')
const selectedTime = ref('')
const selectedConfidence = ref('')
const name = ref('')
const nameError = ref('')

const genderOptions = computed(() => [
  { value: 'male', label: t('onboarding.step3.male'), icon: PhGenderMale },
  { value: 'female', label: t('onboarding.step3.female'), icon: PhGenderFemale },
  { value: 'prefer_not_to_say', label: t('onboarding.step3.preferNotToSay'), icon: PhHandshake },
])

const goalOptions = [
  { value: 'calm', emoji: '🧘', label: 'Find Calm', desc: 'I want breathing exercises and soothing tools' },
  { value: 'learn', emoji: '📚', label: 'Learn About Disasters', desc: 'I want to understand disaster preparedness' },
  { value: 'practice', emoji: '🎮', label: 'Practice Scenarios', desc: 'I want to run through RPG drills' },
  { value: 'community', emoji: '🤝', label: 'Help My Community', desc: 'I want to contribute and donate' },
  { value: 'track', emoji: '📊', label: 'Track ASEAN Data', desc: 'I want to monitor live disaster feeds' },
]

const stressorOptions = [
  { value: 'anxiety', emoji: '😰', label: 'General anxiety or nervousness' },
  { value: 'overwhelm', emoji: '🤯', label: 'Feeling overwhelmed by responsibilities' },
  { value: 'fear', emoji: '😨', label: 'Fear of natural disasters' },
  { value: 'isolation', emoji: '🏠', label: 'Feeling isolated or alone' },
  { value: 'uncertainty', emoji: '❓', label: 'Uncertainty about the future' },
]

const copingOptions = [
  { value: 'reflect', emoji: '📓', label: 'Self-Reflection', desc: 'Journaling and introspection' },
  { value: 'action', emoji: '🏃', label: 'Take Action', desc: 'Staying busy and productive' },
  { value: 'social', emoji: '👥', label: 'Social Support', desc: 'Talking to friends and family' },
  { value: 'data', emoji: '📈', label: 'Research & Data', desc: 'Understanding facts and statistics' },
]

const timeOptions = [
  { value: 'quick', emoji: '⚡', label: '5 minutes', desc: 'Quick daily check-ins' },
  { value: 'medium', emoji: '⏱️', label: '15 minutes', desc: 'A lesson or short RPG' },
  { value: 'deep', emoji: '🕐', label: '30+ minutes', desc: 'Deep learning sessions' },
]

const confidenceOptions = [
  { value: 'low', emoji: '🌱', label: 'Not very confident', desc: 'I\'m a total beginner' },
  { value: 'medium', emoji: '🌿', label: 'Somewhat confident', desc: 'I know the basics' },
  { value: 'high', emoji: '🌳', label: 'Very confident', desc: 'I have training or experience' },
]

const selectedFlag = computed(() => {
  const country = store.countries.find(c => c.code === selectedCountry.value)
  return country ? `${country.name}` : ''
})

function checkName() {
  nameError.value = validateDisplayName(name.value) || ''
}

function finish() {
  const err = validateDisplayName(name.value)
  if (err) { nameError.value = err; return }
  if (name.value.trim() && selectedCountry.value) {
    store.completeOnboarding({
      name: name.value.trim(),
      country: selectedCountry.value,
      age: selectedAge.value,
      gender: selectedGender.value,
      disasterExp: disasterExp.value,
      goal: selectedGoal.value,
      stressor: selectedStressor.value,
      coping: selectedCoping.value,
      time: selectedTime.value,
      confidence: selectedConfidence.value,
    })
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
