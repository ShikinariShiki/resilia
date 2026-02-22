<template>
  <div class="landing-root dark min-h-screen overflow-x-hidden bg-[#050505]" :class="scrollY > 0 ? 'scrolled' : ''">
    <!-- Floating Navbar -->
    <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-apple"
      :class="scrollY > 50 ? 'bg-white/85 dark:bg-[#0A0A0A]/85 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-white/5' : 'bg-transparent border-b border-transparent'">
      <div class="mx-auto h-16 md:h-20 flex items-center justify-between" style="padding-left: clamp(1.5rem, 5vw, 6rem); padding-right: clamp(1.5rem, 5vw, 6rem);">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 transition-transform duration-500 hover:scale-110 hover:rotate-3">
            <span class="text-white font-heading font-bold text-sm">R</span>
          </div>
          <span class="font-heading text-xl font-bold tracking-tight transition-colors duration-500"
            :class="scrollY > 50 ? 'text-ink dark:text-white' : 'text-ink dark:text-white'">RESILIA</span>
        </div>
        <div class="flex items-center gap-2 sm:gap-5">
          <a href="#why-resilia" @click.prevent="scrollTo('why-resilia')" class="text-sm font-heading font-medium text-gray-500 hover:text-teal-600 cursor-pointer transition-colors hidden md:block">Why RESILIA</a>
          <a href="#features" @click.prevent="scrollTo('features')" class="text-sm font-heading font-medium text-gray-500 hover:text-teal-600 cursor-pointer transition-colors hidden md:block">How it Works</a>

          <!-- Language Switcher -->
          <div class="relative" ref="langDropdownRef">
            <button @click="langOpen = !langOpen" class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-heading font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300">
              <span class="text-base">{{ currentLangFlag }}</span>
              <span class="hidden sm:inline">{{ currentLangLabel }}</span>
              <svg class="w-3 h-3 transition-transform duration-300" :class="langOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <Transition name="dropdown">
              <div v-if="langOpen" class="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1A]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-50">
                <div class="py-2 max-h-[320px] overflow-y-auto hide-scrollbar">
                  <button v-for="lang in availableLangs" :key="lang.code"
                    @click="setLandingLocale(lang.code)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-heading transition-all duration-200"
                    :class="landingLocale === lang.code ? 'text-teal-400 bg-teal-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'">
                    <span class="text-base">{{ lang.flag }}</span>
                    <span>{{ lang.label }}</span>
                    <span v-if="landingLocale === lang.code" class="ml-auto text-teal-400">✓</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <RouterLink v-if="store.onboarded" to="/home" class="text-sm font-heading font-bold text-teal-600 hover:text-teal-700 transition-colors hidden sm:block">
            Dashboard →
          </RouterLink>
          <button @click="getStarted" class="nav-cta-btn px-6 py-2.5 rounded-2xl font-heading font-bold text-sm transition-all duration-500">
            {{ store.onboarded ? lt('common.openApp') : lt('common.getStarted') }}
          </button>
        </div>
      </div>
    </header>

    <!-- ━━━ HERO SECTION ━━━ -->
    <section class="relative min-h-screen flex items-center bg-gradient-to-b from-white to-sand-50 dark:from-[#050505] dark:to-[#0A0A0A]" style="padding-left: clamp(1.5rem, 5vw, 6rem); padding-right: clamp(1.5rem, 5vw, 6rem);">
      <!-- Animated background -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <!-- Gradient orbs with parallax -->
        <div class="hero-orb hero-orb-1" :style="{ transform: `translate(${scrollY * 0.08}px, ${scrollY * 0.12}px)` }"></div>
        <div class="hero-orb hero-orb-2" :style="{ transform: `translate(${-scrollY * 0.05}px, ${scrollY * 0.06}px)` }"></div>
        <div class="hero-orb hero-orb-3" :style="{ transform: `translate(${scrollY * 0.03}px, ${-scrollY * 0.08}px)` }"></div>
        <!-- Grid pattern -->
        <div class="absolute inset-0 hero-grid opacity-[0.03]"></div>
      </div>

      <div class="grid md:grid-cols-2 gap-12 lg:gap-20 items-center relative w-full pt-20 md:pt-0">
        <!-- Left: Kinetic Typography -->
        <div class="hero-text-col">
          <div class="hero-badge" :class="heroReady ? 'hero-badge-visible' : ''">
            <span class="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500/8 border border-teal-500/15 rounded-full text-xs font-heading font-bold text-teal-600 backdrop-blur-sm">
              <span class="w-2 h-2 rounded-full bg-teal-500 animate-pulse-soft"></span>
              {{ lt('landing.forAsean') }}
            </span>
          </div>

          <!-- Kinetic headline with word-by-word reveal -->
          <h1 class="font-heading text-[clamp(2.5rem,6vw,5rem)] font-bold text-ink dark:text-white leading-[1.06] mt-6 mb-8">
            <span class="kinetic-word" :class="heroReady ? 'kinetic-visible' : ''" style="--delay: 0.1s">{{ lt('landing.hero1') }}</span><br>
            <span class="kinetic-word kinetic-gradient-teal" :class="heroReady ? 'kinetic-visible' : ''" style="--delay: 0.25s">{{ lt('landing.hero2') }}</span><br>
            <span class="kinetic-word kinetic-gradient-orange" :class="heroReady ? 'kinetic-visible' : ''" style="--delay: 0.4s">{{ lt('landing.hero3') }}</span>
          </h1>

          <p class="hero-desc text-gray-500 dark:text-gray-400 font-body text-lg md:text-xl leading-relaxed mb-10 max-w-lg"
            :class="heroReady ? 'hero-desc-visible' : ''">
            {{ lt('landing.heroDesc') }}
          </p>

          <div class="hero-actions flex flex-wrap gap-4" :class="heroReady ? 'hero-actions-visible' : ''">
            <button @click="getStarted" class="group relative px-8 py-4 bg-ink dark:bg-white text-white dark:text-ink rounded-2xl font-heading font-bold text-base overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-ink/20 hover:-translate-y-1">
              <span class="relative z-10">{{ lt('landing.startTraining') }}</span>
              <div class="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
            <a href="#why-resilia" @click.prevent="scrollTo('why-resilia')" class="px-8 py-4 bg-gray-100/80 dark:bg-slate-800/80 text-ink dark:text-white rounded-2xl font-heading font-bold cursor-pointer text-base hover:bg-gray-200/80 dark:hover:bg-slate-700/80 transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5">
              {{ lt('landing.learnMore') }}
            </a>
          </div>
        </div>

        <!-- Right: Animated Stats + Video Placeholder -->
        <div class="hero-visual" :class="heroReady ? 'hero-visual-visible' : ''">
          <!-- Floating video/app preview placeholder -->
          <div class="video-preview relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-1 shadow-2xl shadow-ink/20 mb-8 overflow-hidden group hover:shadow-3xl transition-all duration-700">
            <div class="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-transparent to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div class="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-[1.25rem] p-8 min-h-[280px] flex flex-col items-center justify-center gap-4">
              <div class="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center backdrop-blur-sm border border-teal-500/30 group-hover:scale-110 transition-transform duration-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-teal-400 ml-1">
                  <path d="M8 5v14l11-7L8 5z" fill="currentColor"/>
                </svg>
              </div>
              <p class="text-gray-400 font-heading font-bold text-sm">Watch RESILIA in Action</p>
              <p class="text-gray-600 font-body text-xs">2 min · See how responders train with gamified simulations</p>
              <!-- Floating UI mockup dots -->
              <div class="absolute top-4 left-4 flex gap-1.5">
                <div class="w-3 h-3 rounded-full bg-red-500/60"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                <div class="w-3 h-3 rounded-full bg-green-500/60"></div>
              </div>
            </div>
          </div>

          <!-- Stats grid with animated counters -->
          <div class="grid grid-cols-2 gap-4">
            <div v-for="(stat, i) in heroStats" :key="i"
              class="stat-card rounded-2xl p-6 group hover:-translate-y-1 transition-all duration-500 relative overflow-hidden" :class="stat.bg">
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" :class="stat.glowBg"></div>
              <p class="font-heading text-3xl lg:text-4xl font-bold transition-transform duration-300 group-hover:scale-105 relative" :class="stat.color">
                <span ref="counterRefs">{{ animatedCounters[i]?.display || stat.value }}</span>
              </p>
              <p class="text-xs mt-2 font-body relative" :class="stat.subColor">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator" :class="heroReady ? 'scroll-indicator-visible' : ''">
        <div class="w-6 h-10 rounded-full border-2 border-gray-300/50 flex justify-center pt-2">
          <div class="w-1 h-3 rounded-full bg-gray-400 animate-scroll-bounce"></div>
        </div>
      </div>
    </section>

    <!-- ━━━ WHY RESILIA ━━━ -->
    <AppleScrollytelling />
    <section id="why-resilia" ref="whySection" class="py-28 md:py-40 relative overflow-hidden bg-white dark:bg-[#0A0A0A]"
      style="padding-left: clamp(1.5rem, 5vw, 6rem); padding-right: clamp(1.5rem, 5vw, 6rem);">
      <!-- Organic background shape -->
      <div class="absolute -left-32 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-100/30 dark:bg-teal-900/10 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-3xl pointer-events-none"
        :style="{ transform: `translateY(${(scrollY - 600) * 0.03}px)` }"></div>

      <div class="text-center mb-20 reveal-base" :class="whyVisible ? 'reveal-visible' : 'reveal-hidden'">
        <p class="text-xs font-heading font-bold text-teal-500 uppercase tracking-[0.2em] mb-4">Why RESILIA</p>
        <h2 class="font-heading text-4xl md:text-6xl font-bold text-ink dark:text-white mb-6 leading-tight">{{ lt('landing.whyTitle') }}</h2>
        <p class="text-gray-400 font-body text-lg max-w-2xl mx-auto leading-relaxed">{{ lt('landing.whyDesc') }}</p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        <div v-for="(usp, i) in usps" :key="i"
          class="usp-card bg-white dark:bg-slate-800/80 rounded-3xl p-8 hover-lift reveal-base border border-gray-100/80 dark:border-slate-700/50 relative overflow-hidden group"
          :class="whyVisible ? 'reveal-visible' : 'reveal-hidden'"
          :style="{ transitionDelay: (i * 0.12) + 's' }">
          <div class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700" :class="usp.hoverGradient"></div>
          <div class="relative">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6" :class="usp.iconBg">
              <component :is="usp.icon" :size="28" weight="duotone" />
            </div>
            <h3 class="font-heading font-bold text-ink dark:text-white text-lg mb-3">{{ usp.title }}</h3>
            <p class="text-sm text-gray-400 font-body leading-relaxed">{{ usp.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ━━━ HOW IT WORKS ━━━ -->
    <section id="features" ref="howSection" class="py-28 md:py-40 bg-gradient-to-b from-sand-50 to-white dark:from-slate-900 dark:to-[#0A0A0A] relative"
      style="padding-left: clamp(1.5rem, 5vw, 6rem); padding-right: clamp(1.5rem, 5vw, 6rem);">
      <div class="text-center mb-20 reveal-base" :class="howVisible ? 'reveal-visible' : 'reveal-hidden'">
        <p class="text-xs font-heading font-bold text-orange-500 uppercase tracking-[0.2em] mb-4">How It Works</p>
        <h2 class="font-heading text-4xl md:text-6xl font-bold text-ink dark:text-white mb-6 leading-tight">{{ lt('landing.howTitle') }}</h2>
        <p class="text-gray-400 font-body text-lg max-w-2xl mx-auto leading-relaxed">{{ lt('landing.howDesc') }}</p>
      </div>

      <div class="max-w-5xl mx-auto">
        <div class="grid md:grid-cols-5 gap-4">
          <div v-for="(step, i) in howItWorks" :key="i"
            class="how-card relative rounded-3xl p-6 bg-white dark:bg-slate-800/80 group reveal-base border border-gray-100/60 dark:border-slate-700/50 overflow-hidden cursor-pointer"
            :class="howVisible ? 'reveal-visible' : 'reveal-hidden'"
            :style="{ transitionDelay: (i * 0.1) + 's' }"
            @click="toggleHow(i)">
            
            <div class="flex items-start justify-between mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-heading font-bold transition-all duration-500 group-hover:shadow-lg"
                :class="step.numBg">
                {{ i + 1 }}
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center text-gray-400 transition-transform duration-300"
                :class="isHowOpen(i) ? 'rotate-180 bg-orange-50 dark:bg-orange-900/40 text-orange-500' : ''">
                ↓
              </div>
            </div>
            
            <div class="text-3xl mb-3 transition-transform duration-500 group-hover:scale-110"><component :is="step.icon" :size="32" weight="duotone" /></div>
            <h3 class="font-heading font-bold text-ink dark:text-white text-base">{{ step.title }}</h3>
            
            <Transition name="accordion">
              <div v-if="isHowOpen(i)" class="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700/50">
                <p class="text-xs text-gray-500 dark:text-gray-400 font-body leading-relaxed">{{ step.desc }}</p>
              </div>
            </Transition>
            
            <!-- Connector arrow -->
            <div v-if="i < howItWorks.length - 1" class="hidden md:flex absolute -right-3 top-10 w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 items-center justify-center z-10 text-gray-400 text-xs">→</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ━━━ GAMIFIED TIERS ROADMAP ━━━ -->
    <section ref="tiersSection" class="py-28 md:py-40 bg-white dark:bg-[#0A0A0A] relative overflow-hidden"
      style="padding-left: clamp(1.5rem, 5vw, 6rem); padding-right: clamp(1.5rem, 5vw, 6rem);">
      <div class="text-center mb-16 reveal-base" :class="tiersVisible ? 'reveal-visible' : 'reveal-hidden'">
        <p class="text-xs font-heading font-bold text-purple-500 uppercase tracking-[0.2em] mb-4">Progression System</p>
        <h2 class="font-heading text-4xl md:text-6xl font-bold text-ink dark:text-white mb-6 leading-tight">{{ lt('landing.roadmapTitle') }}</h2>
        <p class="text-gray-400 font-body text-lg max-w-2xl mx-auto leading-relaxed">{{ lt('landing.roadmapDesc') }}</p>
      </div>

      <div class="w-full relative py-10">
        <!-- Horizontal Scroll Track -->
        <div ref="tierCarousel" class="flex gap-6 overflow-x-auto pb-10 snap-x snap-mandatory hide-scrollbar relative z-20" @scroll="onCarouselScroll">
          <!-- Connecting Line (Horizontal) -->
          <div class="absolute top-[4.5rem] left-0 w-[200%] h-[3px] bg-gradient-to-r from-gray-200 dark:from-slate-800 via-teal-400 via-orange-400 via-purple-400 to-red-400 rounded-full z-0 pointer-events-none"></div>

          <!-- Left spacer so first card can center -->
          <div class="shrink-0 snap-center" style="width: calc(50% - 200px);"></div>

          <div v-for="(tier, i) in tiers" :key="tier.name"
            :ref="(el) => { if (el) tierRefs[i] = el }"
            class="snap-center shrink-0 w-[85vw] md:w-[400px] flex flex-col items-center relative z-10 pt-4 cursor-pointer"
            @click="scrollToTier(i)"
            >
            
            <!-- Timeline dot (Top Center) -->
            <div class="relative w-20 h-20 mb-8 flex items-center justify-center">
              <!-- Glowing Aura -->
              <div class="absolute inset-0 rounded-full transition-all duration-700 pointer-events-none"
                :class="activeTierIndex === i ? 'scale-[2.5] opacity-100' : 'scale-0 opacity-0'"
                :style="{ backgroundColor: tier.color + '60', filter: 'blur(20px)' }"></div>
                
              <div class="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-[600ms] border-2 border-white dark:border-[#0A0A0A] z-10"
                :class="activeTierIndex === i ? 'scale-125 opacity-100 ring-[6px] ring-offset-2 dark:ring-offset-[#0A0A0A]' : 'scale-90 opacity-40 grayscale'"
                :style="{ backgroundColor: activeTierIndex === i ? tier.color + '25' : '#1e293b', ringColor: activeTierIndex === i ? tier.color + '90' : 'transparent', boxShadow: activeTierIndex === i ? `0 0 50px ${tier.color}A0` : 'none' }">
                <component :is="tier.icon" :size="28" weight="duotone" :color="activeTierIndex === i ? tier.color : '#9CA3AF'" />
              </div>
            </div>

            <!-- Card -->
            <div class="tier-card w-full bg-white dark:bg-slate-800/80 rounded-3xl p-7 transition-all duration-[600ms] border group relative"
              :class="activeTierIndex === i ? 'border-transparent dark:border-transparent scale-[1.05] z-20 ring-1' : 'border-gray-100 dark:border-slate-700/50 scale-[0.98] grayscale-[0.5] opacity-50 z-10'"
              :style="{ '--tier-color': tier.color, boxShadow: activeTierIndex === i ? `0 0 80px -10px ${tier.color}70, 0 0 30px -5px ${tier.color}50, inset 0 0 20px -5px ${tier.color}30` : undefined, borderColor: activeTierIndex === i ? `${tier.color}80` : undefined, ringColor: activeTierIndex === i ? `${tier.color}A0` : undefined }">
              <div class="flex items-center gap-4 mb-5">
                <div>
                  <p class="font-heading font-bold text-xl transition-colors duration-500" :style="{ color: activeTierIndex === i ? tier.color : '#9CA3AF' }">{{ tier.name }}</p>
                  <p class="text-[10px] text-gray-400 dark:text-gray-500 font-heading uppercase tracking-wider mt-0.5">{{ tier.minXP }} XP required</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="perk in tier.perks" :key="perk"
                  class="text-[10px] px-3 py-1.5 rounded-full font-heading font-bold transition-all duration-300"
                  :style="{ backgroundColor: tier.color + '10', color: tier.color, border: `1px solid ${tier.color}15` }">
                  {{ perk }}
                </span>
              </div>
            </div>
            
            <!-- Brief Explanation -->
            <div class="mt-8 px-4 w-full text-center transition-all duration-500" :class="activeTierIndex === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'">
              <p class="font-body text-sm text-gray-500 dark:text-gray-400">{{ tier.desc }}</p>
            </div>
          </div>

          <!-- Right spacer so last card can center -->
          <div class="shrink-0 snap-center" style="width: calc(50% - 200px);"></div>
        </div>

        <!-- Scroll Hints (hidden completely in favor of arrows) -->
        <!-- <div class="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-64 bg-gradient-to-l from-white dark:from-[#0A0A0A] to-transparent pointer-events-none z-30 hidden md:block"></div>
        <div class="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-64 bg-gradient-to-r from-white dark:from-[#0A0A0A] to-transparent pointer-events-none z-30 hidden md:block"></div> -->

        <!-- Navigation Arrows -->
        <div class="flex justify-center gap-4 mt-8 relative z-30">
          <button @click="scrollTier('prev')" 
            class="w-14 h-14 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-slate-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
            :disabled="activeTierIndex === 0">
            <PhCaretLeft :size="22" weight="bold" />
          </button>
          <button @click="scrollTier('next')" 
            class="w-14 h-14 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-slate-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
            :disabled="activeTierIndex === tiers.length - 1">
            <PhCaretRight :size="22" weight="bold" />
          </button>
        </div>
      </div>
    </section>

    <!-- ━━━ TESTIMONIALS ━━━ -->
    <section ref="testSection" class="py-28 md:py-40 bg-gradient-to-b from-white to-sand-50 dark:from-[#0A0A0A] dark:to-slate-900 relative"
      style="padding-left: clamp(1.5rem, 5vw, 6rem); padding-right: clamp(1.5rem, 5vw, 6rem);">
      <div class="text-center mb-20 reveal-base" :class="testVisible ? 'reveal-visible' : 'reveal-hidden'">
        <p class="text-xs font-heading font-bold text-teal-500 uppercase tracking-[0.2em] mb-4">Testimonials</p>
        <h2 class="font-heading text-4xl md:text-6xl font-bold text-ink dark:text-white mb-6 leading-tight">{{ lt('landing.voicesTitle') }}</h2>
        <p class="text-gray-400 font-body text-lg max-w-2xl mx-auto leading-relaxed">{{ lt('landing.voicesDesc') }}</p>
      </div>

      <div class="grid md:grid-cols-3 gap-6 lg:gap-8">
        <div v-for="(t, i) in testimonials" :key="i"
          class="testimonial-card bg-white dark:bg-slate-800/80 rounded-3xl p-8 lg:p-10 hover-lift reveal-base border border-gray-100/60 dark:border-slate-700/50 relative overflow-hidden"
          :class="testVisible ? 'reveal-visible' : 'reveal-hidden'"
          :style="{ transitionDelay: (i * 0.15) + 's' }">
          <!-- Decorative quote mark -->
          <div class="absolute top-6 right-6 text-6xl font-heading font-bold leading-none opacity-5" :style="{ color: t.color }">❝</div>
          <div class="relative">
            <div class="flex gap-1 mb-5">
              <PhStar v-for="s in 5" :key="s" :size="16" weight="fill" class="text-amber-400" />
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 font-body leading-relaxed mb-8">"{{ t.quote }}"</p>
            <div class="flex items-center gap-3 pt-5 border-t border-gray-100 dark:border-slate-700/50">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-heading font-bold" :style="{ backgroundColor: t.color + '12', color: t.color }">{{ t.name.charAt(0) }}</div>
              <div>
                <p class="font-heading font-bold text-sm text-ink dark:text-white">{{ t.name }}</p>
                <p class="text-[10px] text-gray-400 dark:text-gray-500 font-body">{{ t.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ━━━ FAQ ━━━ -->
    <section ref="faqSection" class="py-28 md:py-40 bg-sand-50 dark:bg-slate-900"
      style="padding-left: clamp(1.5rem, 5vw, 6rem); padding-right: clamp(1.5rem, 5vw, 6rem);">
      <div class="text-center mb-20 reveal-base" :class="faqVisible ? 'reveal-visible' : 'reveal-hidden'">
        <p class="text-xs font-heading font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">FAQ</p>
        <h2 class="font-heading text-4xl md:text-6xl font-bold text-ink dark:text-white mb-6 leading-tight">{{ lt('landing.faqTitle') }}</h2>
      </div>
      <div class="max-w-2xl mx-auto space-y-3">
        <div v-for="(faq, i) in faqs" :key="i"
          class="bg-white dark:bg-slate-800/80 rounded-2xl overflow-hidden border border-gray-100/60 dark:border-slate-700/50 hover:border-gray-200/80 dark:hover:border-slate-600 transition-all duration-500 reveal-base"
          :class="faqVisible ? 'reveal-visible' : 'reveal-hidden'"
          :style="{ transitionDelay: (i * 0.07) + 's' }">
          <button @click="toggleFaq(i)" class="w-full flex items-center justify-between p-6 text-left group">
            <span class="font-heading font-bold text-sm text-ink dark:text-white pr-4 group-hover:text-teal-600 transition-colors">{{ faq.q }}</span>
            <span class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400 flex-shrink-0 transition-all duration-500 group-hover:bg-teal-50 group-hover:text-teal-500 dark:group-hover:bg-teal-900/40"
              :class="isFaqOpen(i) ? 'rotate-45 bg-teal-50 dark:bg-teal-900/40 text-teal-500' : ''">+</span>
          </button>
          <Transition name="accordion">
            <div v-if="isFaqOpen(i)" class="px-6 pb-6">
              <p class="text-sm text-gray-500 dark:text-gray-400 font-body leading-relaxed">{{ faq.a }}</p>
            </div>
          </Transition>
        </div>
      </div>
    </section>

    <!-- ━━━ CTA ━━━ -->
    <section ref="ctaSection" class="py-32 md:py-44 bg-ink dark:bg-[#050505] relative overflow-hidden">
      <!-- Animated glow orbs -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="cta-orb cta-orb-1"></div>
        <div class="cta-orb cta-orb-2"></div>
        <div class="cta-orb cta-orb-3"></div>
        <!-- Subtle grid -->
        <div class="absolute inset-0 hero-grid opacity-[0.02]"></div>
      </div>
      <div class="text-center relative" style="padding-left: clamp(1.5rem, 5vw, 6rem); padding-right: clamp(1.5rem, 5vw, 6rem);">
        <div class="reveal-base" :class="ctaVisible ? 'reveal-visible' : 'reveal-hidden'">
          <p class="text-xs font-heading font-bold text-teal-400/70 uppercase tracking-[0.2em] mb-6">Ready to Begin?</p>
          <h2 class="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight max-w-3xl mx-auto">{{ lt('landing.ctaTitle') }}</h2>
          <p class="text-gray-500 font-body text-lg mb-14 max-w-lg mx-auto leading-relaxed">{{ lt('landing.ctaDesc') }}</p>
          <button @click="getStarted" class="group relative px-12 py-5 bg-gradient-to-r from-teal-400 to-teal-600 text-white rounded-2xl font-heading font-bold text-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-teal-500/30 hover:-translate-y-1">
            <span class="relative z-10 flex items-center gap-2">
              {{ lt('landing.ctaBtn') }}
              <svg class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <div class="absolute inset-0 bg-gradient-to-r from-teal-300 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>
          <p class="text-gray-600 font-body text-xs mt-6">Free forever · No credit card · All ASEAN languages</p>
        </div>
      </div>
    </section>

    <!-- ━━━ FOOTER ━━━ -->
    <footer class="py-12 bg-ink dark:bg-[#050505] border-t border-white/5" style="padding-left: clamp(1.5rem, 5vw, 6rem); padding-right: clamp(1.5rem, 5vw, 6rem);">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
            <span class="text-white font-heading font-bold text-[10px]">R</span>
          </div>
          <div>
            <span class="font-heading font-bold text-sm text-white">RESILIA</span>
            <p class="text-[10px] text-gray-600 font-body">Digital Reserve Corps for ASEAN</p>
          </div>
        </div>
        <div class="flex items-center gap-6">
          <RouterLink to="/terms" class="text-xs text-gray-500 font-body hover:text-gray-300 transition-colors">{{ lt('landing.footerTerms') }}</RouterLink>
          <RouterLink to="/privacy" class="text-xs text-gray-500 font-body hover:text-gray-300 transition-colors">{{ lt('landing.footerPrivacy') }}</RouterLink>
        </div>
        <p class="text-xs text-gray-600 font-body">{{ lt('landing.footerCopyright') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import { useI18n } from '../i18n'
import AppleScrollytelling from '../components/AppleScrollytelling.vue'

// Locale messages for landing-specific translation
import en from '../locales/en'
import idLocale from '../locales/id'
import th from '../locales/th'
import vi from '../locales/vi'
import ms from '../locales/ms'
import tl from '../locales/tl'
import my from '../locales/my'
import km from '../locales/km'
import lo from '../locales/lo'

// Phosphor Icons
import {
  PhGameController,
  PhGlobeHemisphereWest,
  PhBrain,
  PhHandshake,
  PhClipboardText,
  PhBooks,
  PhChartBar,
  PhTrophy,
  PhShieldCheck,
  PhPlant,
  PhStar,
  PhMedal,
  PhCrown,
  PhFlag,
  PhCaretLeft,
  PhCaretRight
} from '@phosphor-icons/vue'

const store = useResiliaStore()
const router = useRouter()
const { t } = useI18n()

// ── Landing-specific locale (separate from app locale) ──
const landingMessages = { en, id: idLocale, th, vi, ms, tl, my, km, lo }
const landingLocale = ref(localStorage.getItem('resilia_landing_locale') || 'en')
const langOpen = ref(false)
const langDropdownRef = ref(null)

const availableLangs = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'id', flag: '🇮🇩', label: 'Bahasa Indonesia' },
  { code: 'th', flag: '🇹🇭', label: 'ภาษาไทย' },
  { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
  { code: 'ms', flag: '🇲🇾', label: 'Bahasa Melayu' },
  { code: 'tl', flag: '🇵🇭', label: 'Filipino' },
  { code: 'my', flag: '🇲🇲', label: 'မြန်မာဘာသာ' },
  { code: 'km', flag: '🇰🇭', label: 'ភាសាខ្មែរ' },
  { code: 'lo', flag: '🇱🇦', label: 'ພາສາລາວ' },
]

const currentLangFlag = computed(() => availableLangs.find(l => l.code === landingLocale.value)?.flag || '🌏')
const currentLangLabel = computed(() => availableLangs.find(l => l.code === landingLocale.value)?.label || 'English')

function setLandingLocale(code) {
  landingLocale.value = code
  localStorage.setItem('resilia_landing_locale', code)
  langOpen.value = false
}

// Landing translate function (independent from app i18n)
function lt(key) {
  const keys = key.split('.')
  let text = landingMessages[landingLocale.value]
  for (const k of keys) {
    if (text && text[k]) {
      text = text[k]
    } else {
      // Fallback to English
      let fallback = landingMessages.en
      for (const fk of keys) {
        if (fallback && fallback[fk]) {
          fallback = fallback[fk]
        } else {
          return key
        }
      }
      return fallback
    }
  }
  return text
}

// Close dropdown on outside click
function onClickOutside(e) {
  if (langDropdownRef.value && !langDropdownRef.value.contains(e.target)) {
    langOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

// ── Scroll Tracking & Navigation ──
const scrollY = ref(0)
const tierRefs = ref([])
const activeTierIndex = ref(0)
const tierCarousel = ref(null)

function onScroll() { 
  scrollY.value = window.scrollY 
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  // Auto-center the first tier card on mount
  nextTick(() => {
    setTimeout(() => scrollToTier(0), 300)
  })
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))

function onCarouselScroll() {
  if (!tierCarousel.value || tierRefs.value.length === 0) return
  
  const carouselRect = tierCarousel.value.getBoundingClientRect()
  const carouselCenter = carouselRect.left + (carouselRect.width / 2)
  
  let closestIndex = 0
  let minDistance = 99999
  
  tierRefs.value.forEach((el, index) => {
    if (el) {
      const rect = el.getBoundingClientRect()
      const elCenter = rect.left + (rect.width / 2)
      const distance = Math.abs(elCenter - carouselCenter)
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    }
  })
  
  if (activeTierIndex.value !== closestIndex) {
    activeTierIndex.value = closestIndex
  }
}

function scrollToTier(index) {
  if (!tierCarousel.value) return
  
  // Clamp
  if (index < 0) index = 0
  if (index >= tiers.value.length) index = tiers.value.length - 1
  
  // Immediately update active index so UI reacts instantly
  activeTierIndex.value = index
  
  const targetEl = tierRefs.value[index]
  if (targetEl) {
    const parent = tierCarousel.value
    const targetCenter = targetEl.offsetLeft + (targetEl.offsetWidth / 2)
    const viewCenterPos = parent.offsetWidth / 2
    
    parent.scrollTo({
      left: targetCenter - viewCenterPos,
      behavior: 'smooth'
    })
  }
}

function scrollTier(dir) {
  const indexShift = dir === 'next' ? 1 : -1
  scrollToTier(activeTierIndex.value + indexShift)
}


// ── Hero entrance animation ──
const heroReady = ref(false)
onMounted(() => { setTimeout(() => { heroReady.value = true }, 200) })

// ── Animated counters ──
const animatedCounters = reactive([
  { display: '0', target: 3782, suffix: '', prefix: '' },
  { display: '0', target: 10, suffix: '', prefix: '' },
  { display: '0', target: 28900, suffix: '', prefix: '' },
  { display: '0', target: 12400, suffix: '', prefix: '' },
])

function animateCounters() {
  const duration = 2000
  const fps = 60
  const totalFrames = duration / (1000 / fps)
  let frame = 0
  const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4)
  
  const interval = setInterval(() => {
    frame++
    const progress = easeOutQuart(frame / totalFrames)
    animatedCounters[0].display = Math.floor(progress * 3782).toLocaleString()
    animatedCounters[1].display = Math.floor(progress * 10).toString()
    animatedCounters[2].display = (progress * 28.9).toFixed(1) + 'K'
    animatedCounters[3].display = (progress * 12.4).toFixed(1) + 'K'
    if (frame >= totalFrames) {
      clearInterval(interval)
      animatedCounters[0].display = '3,782'
      animatedCounters[1].display = '10'
      animatedCounters[2].display = '28.9K'
      animatedCounters[3].display = '12.4K'
    }
  }, 1000 / fps)
}

onMounted(() => { setTimeout(animateCounters, 800) })

// ── Intersection observers ──
const whySection = ref(null)
const howSection = ref(null)
const tiersSection = ref(null)
const testSection = ref(null)
const faqSection = ref(null)
const ctaSection = ref(null)

const whyVisible = ref(false)
const howVisible = ref(false)
const tiersVisible = ref(false)
const testVisible = ref(false)
const faqVisible = ref(false)
const ctaVisible = ref(false)

let observer = null
onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      if (entry.target === whySection.value) whyVisible.value = true
      if (entry.target === howSection.value) howVisible.value = true
      if (entry.target === tiersSection.value) tiersVisible.value = true
      if (entry.target === testSection.value) testVisible.value = true
      if (entry.target === faqSection.value) faqVisible.value = true
      if (entry.target === ctaSection.value) ctaVisible.value = true
    })
  }, { threshold: 0.1 })
  
  const sections = [whySection, howSection, tiersSection, testSection, faqSection, ctaSection]
  sections.forEach(s => { if (s.value) observer.observe(s.value) })
})
onUnmounted(() => { if (observer) observer.disconnect() })

// ── Data ──
const heroStats = computed(() => [
  { value: '3,782', label: lt('landing.stats.activeResponders'), bg: 'bg-gradient-to-br from-teal-50 to-teal-100/60 dark:from-teal-900/20 dark:to-teal-800/20 dark:border-teal-700/30', color: 'text-teal-600 dark:text-teal-400', subColor: 'text-teal-500/70 dark:text-teal-500/80', glowBg: 'bg-teal-100/40 dark:bg-teal-800/40' },
  { value: '10', label: lt('landing.stats.aseanCountries'), bg: 'bg-gradient-to-br from-orange-50 to-orange-100/60 dark:from-orange-900/20 dark:to-orange-800/20 dark:border-orange-700/30', color: 'text-orange-600 dark:text-orange-400', subColor: 'text-orange-500/70 dark:text-orange-500/80', glowBg: 'bg-orange-100/40 dark:bg-orange-800/40' },
  { value: '28.9K', label: lt('landing.stats.modulesCompleted'), bg: 'bg-gray-50/80 dark:bg-slate-800/80', color: 'text-ink dark:text-white', subColor: 'text-gray-400 dark:text-gray-500', glowBg: 'bg-gray-100/60 dark:bg-slate-700/80' },
  { value: '12.4K', label: lt('landing.stats.resiCoinsDonated'), bg: 'bg-gray-50/80 dark:bg-slate-800/80', color: 'text-ink dark:text-white', subColor: 'text-gray-400 dark:text-gray-500', glowBg: 'bg-gray-100/60 dark:bg-slate-700/80' },
])

const usps = computed(() => [
  { icon: PhGameController, title: lt('landing.usps.gamified'), desc: lt('landing.usps.gamifiedDesc'), iconBg: 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400', hoverGradient: 'from-teal-50/50 to-transparent' },
  { icon: PhGlobeHemisphereWest, title: lt('landing.usps.asean'), desc: lt('landing.usps.aseanDesc'), iconBg: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400', hoverGradient: 'from-orange-50/50 to-transparent' },
  { icon: PhBrain, title: lt('landing.usps.science'), desc: lt('landing.usps.scienceDesc'), iconBg: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', hoverGradient: 'from-purple-50/50 to-transparent' },
  { icon: PhHandshake, title: lt('landing.usps.community'), desc: lt('landing.usps.communityDesc'), iconBg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', hoverGradient: 'from-blue-50/50 to-transparent' },
])

const howItWorks = computed(() => [
  { icon: PhClipboardText, title: lt('landing.steps.checkIn'), desc: lt('landing.steps.checkInDesc'), numBg: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 shadow-sm' },
  { icon: PhBooks, title: lt('landing.steps.learn'), desc: lt('landing.steps.learnDesc'), numBg: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 shadow-sm' },
  { icon: PhGameController, title: lt('landing.steps.practice'), desc: lt('landing.steps.practiceDesc'), numBg: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 shadow-sm' },
  { icon: PhChartBar, title: lt('landing.steps.measure'), desc: lt('landing.steps.measureDesc'), numBg: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm' },
  { icon: PhTrophy, title: lt('landing.steps.levelUp'), desc: lt('landing.steps.levelUpDesc'), numBg: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm' },
])

const tiers = computed(() => [
  { name: 'Cadet', minXP: 0, color: '#9CA3AF', icon: PhFlag, perks: ['Foundations access', 'Toolkit access', 'Daily missions'], desc: 'Your journey begins. Learn the fundamentals of Psychological First Aid and build basic readiness.' },
  { name: 'Trainee', minXP: 100, color: '#0D9488', icon: PhPlant, perks: ['PFA modules', 'Calm Breathing', 'Community challenges'], desc: 'Unlock hands-on modules and essential breathing techniques to build inner resilience and confidence.' },
  { name: 'Responder', minXP: 250, color: '#F97316', icon: PhShieldCheck, perks: ['Advanced RPGs', 'Mood tracking', 'Double rewards'], desc: 'Step into realistic disaster scenarios. Test your skills through interactive RPGs and earn bonus XP.' },
  { name: 'Guardian', minXP: 500, color: '#EAB308', icon: PhStar, perks: ['Mentor badge', 'Double XP weekends', 'Priority access'], desc: 'Achieve veteran status. Access exclusive community channels and wear the distinguished Mentor badge.' },
  { name: 'Commander', minXP: 1000, color: '#8B5CF6', icon: PhMedal, perks: ['Custom frames', 'Exclusive scenarios', 'Community lead'], desc: 'Lead by example. Gain prestige cosmetics and access to ultra-hardcore, zero-mistake disaster drills.' },
  { name: 'Marshal', minXP: 2000, color: '#DC2626', icon: PhCrown, perks: ['Leaderboard crown', 'All cosmetics', 'Legacy status'], desc: 'The peak of the Digital Reserve Corps. You are a master of crisis response, recognized across all of ASEAN.' },
])

const testimonials = computed(() => [
  { quote: 'RESILIA taught me how to stay calm during the Cianjur earthquake. The breathing techniques I learned literally saved my family from panicking.', name: 'Putri Ayu', role: 'Student, Indonesia', avatar: 'PA', color: '#0D9488' },
  { quote: 'The RPG scenarios feel incredibly real. I practiced flood evacuation steps so many times that when it actually happened, I knew exactly what to do.', name: 'Nguyen Thanh', role: 'Volunteer, Vietnam', avatar: 'NT', color: '#F97316' },
  { quote: 'As a teacher, I use RESILIA modules to teach my students about disaster preparedness. The gamification keeps them engaged for hours.', name: 'Maria Santos', role: 'Educator, Philippines', avatar: 'MS', color: '#8B5CF6' },
])

const faqs = computed(() => [
  { q: 'What is Psychological First Aid (PFA)?', a: 'PFA is a framework developed by the WHO for providing emotional and practical support to people affected by crises. It\'s not therapy — it\'s about being a compassionate, informed first responder when disaster strikes.' },
  { q: 'Is RESILIA free to use?', a: 'Yes! RESILIA is completely free. All modules, RPGs, and tools are accessible without payment. ResiCoins are earned through engagement, not purchased.' },
  { q: 'Do I need medical training?', a: 'Not at all. RESILIA is designed for anyone aged 15+. We start from the basics and build up your knowledge gradually through gamified modules.' },
  { q: 'What languages are supported?', a: 'Currently English and Bahasa Indonesia, with Thai, Vietnamese, Malay, Filipino, Burmese, Khmer, and Lao coming soon to serve all ASEAN countries.' },
  { q: 'Is my data safe?', a: 'In this MVP, all data is stored locally in your browser. No data is transmitted to external servers. Your privacy is our priority.' },
])

const openFaqIndices = ref([])

function toggleFaq(i) {
  if (openFaqIndices.value.includes(i)) {
    openFaqIndices.value = openFaqIndices.value.filter(idx => idx !== i)
  } else {
    openFaqIndices.value.push(i)
  }
}

function isFaqOpen(i) {
  return openFaqIndices.value.includes(i)
}

const openHowIndices = ref([0]) // first item open by default

function toggleHow(i) {
  if (openHowIndices.value.includes(i)) {
    openHowIndices.value = openHowIndices.value.filter(idx => idx !== i)
  } else {
    openHowIndices.value.push(i)
  }
}

function isHowOpen(i) {
  return openHowIndices.value.includes(i)
}

function getStarted() {
  if (store.onboarded) router.push('/home')
  else if (store.isAuthenticated) router.push('/onboarding')
  else router.push('/auth')
}

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 80 // 80px offset for the fixed navbar
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}
</script>

<style scoped>
/* ━━━ NAVBAR ━━━ */
.nav-cta-btn {
  background: white;
  color: #1a1a1a;
}
.nav-cta-btn:hover {
  background: #0D9488;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.3);
}

/* ━━━ DROPDOWN ANIMATION ━━━ */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

/* ━━━ HERO ━━━ */

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
  transition: transform 0.15s linear;
}
.hero-orb-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(13, 148, 136, 0.08) 0%, transparent 70%);
  top: -15%; right: -10%;
  animation: float-slow 20s ease-in-out infinite;
}
.hero-orb-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.06) 0%, transparent 70%);
  bottom: 10%; left: -5%;
  animation: float-slow 15s ease-in-out infinite reverse;
}
.hero-orb-3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.04) 0%, transparent 70%);
  top: 30%; left: 40%;
  animation: float-slow 25s ease-in-out infinite;
}

.hero-grid {
  background-image: linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* ━━━ KINETIC TYPOGRAPHY ━━━ */
.hero-badge {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: 0s;
}
.hero-badge-visible {
  opacity: 1;
  transform: translateY(0);
}

.kinetic-word {
  display: inline-block;
  opacity: 0;
  transform: translateY(40px) skewY(2deg);
  filter: blur(10px);
  transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--delay);
}
.kinetic-visible {
  opacity: 1;
  transform: translateY(0) skewY(0);
  filter: blur(0);
}
.kinetic-gradient-teal {
  background: linear-gradient(135deg, #0D9488 0%, #2DD4BF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.kinetic-gradient-orange {
  background: linear-gradient(135deg, #EA580C 0%, #FB923C 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-desc {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: 0.55s;
}
.hero-desc-visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-actions {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: 0.7s;
}
.hero-actions-visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-visual {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
  transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: 0.4s;
}
.hero-visual-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ━━━ STATS CARDS ━━━ */
.stat-card {
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

/* ━━━ SCROLL INDICATOR ━━━ */
.scroll-indicator {
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: 1.2s;
}
.scroll-indicator-visible {
  opacity: 1;
  transform: translateY(0);
}
@keyframes scroll-bounce {
  0%, 100% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(6px); opacity: 0.3; }
}
.animate-scroll-bounce {
  animation: scroll-bounce 2s ease-in-out infinite;
}

/* ━━━ CTA SECTION ━━━ */
.cta-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
}
.cta-orb-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(13, 148, 136, 0.15) 0%, transparent 70%);
  top: -20%; right: -5%;
  animation: float-slow 18s ease-in-out infinite;
}
.cta-orb-2 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.10) 0%, transparent 70%);
  bottom: -15%; left: -5%;
  animation: float-slow 22s ease-in-out infinite reverse;
}
.cta-orb-3 {
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
  top: 40%; left: 30%;
  animation: float-slow 15s ease-in-out infinite;
}

/* ━━━ ANIMATIONS ━━━ */
@keyframes float-slow {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -20px) scale(1.05); }
  50% { transform: translate(-20px, 15px) scale(0.95); }
  75% { transform: translate(15px, 25px) scale(1.02); }
}

/* ━━━ ACCORDION ━━━ */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 200px;
  overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* ━━━ VIDEO PREVIEW ━━━ */
.video-preview {
  transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.video-preview:hover {
  transform: translateY(-4px) scale(1.01);
}

/* Hide scrollbar for carousel but keep functionality */
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
</style>
