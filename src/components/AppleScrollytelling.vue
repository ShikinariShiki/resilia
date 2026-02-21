<template>
  <section ref="containerRef" class="relative w-full h-screen bg-sand-50 dark:bg-[#0A0A0A] overflow-hidden will-change-transform z-10 border-y border-gray-100 dark:border-slate-800">
    <!-- Viewport container -->
    <div class="absolute inset-0 flex flex-col items-center justify-center w-full h-full">
      
      <!-- Top Title Sequence -->
      <div ref="titleRef" class="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none mt-[-10vh] px-4">
        <h2 class="text-5xl md:text-7xl lg:text-8xl font-heading font-black text-ink dark:text-white tracking-tighter mb-4 text-center">
          Uncompromised.
        </h2>
        <p class="text-xl md:text-2xl font-body text-gray-500 font-medium tracking-tight text-center">
          Next-generation simulation engine.
        </p>
      </div>

      <!-- Exploded View Product Container -->
      <div ref="productRef" class="relative w-[85vw] max-w-[340px] h-[480px] flex flex-col items-center justify-center z-10 perspective-1000">
        
        <!-- Bottom Layer (Layer I) -->
        <div ref="layerIRef" class="absolute inset-0 bg-gradient-to-tr from-orange-100 to-white dark:from-slate-800 dark:to-slate-900 border border-orange-200 dark:border-slate-700/50 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 will-change-transform">
          <div class="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400">
            <PhMapPin :size="32" weight="duotone" />
          </div>
          <h3 class="font-heading font-bold text-ink dark:text-white text-xl text-center">Field Ready</h3>
          <p class="text-sm font-body text-gray-500 text-center mt-2">Real-world localized scenarios tailored for ASEAN topographies.</p>
        </div>

        <!-- Middle Layer (Layer II) -->
        <div ref="layerIIRef" class="absolute inset-0 bg-gradient-to-tr from-teal-50 to-white dark:from-slate-800 dark:to-slate-900 border border-teal-200 dark:border-slate-700/50 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 will-change-transform">
          <div class="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mb-4 text-teal-600 dark:text-teal-400">
            <PhBrain :size="32" weight="duotone" />
          </div>
          <h3 class="font-heading font-bold text-ink dark:text-white text-xl text-center">Psychological Engine</h3>
          <p class="text-sm font-body text-gray-500 text-center mt-2">Stress-testing cognitive resilience under critical stress conditions.</p>
        </div>

        <!-- Top Layer (Layer III) -->
        <div ref="layerIIIRef" class="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 border border-indigo-200 dark:border-slate-700/50 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 will-change-transform">
          <div class="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
            <PhChartBarHorizontal :size="32" weight="duotone" />
          </div>
          <h3 class="font-heading font-bold text-ink dark:text-white text-xl text-center">Interactive UI</h3>
          <p class="text-sm font-body text-gray-500 text-center mt-2">Gamified UX and learning arcs mirroring modern mobile mechanics.</p>
        </div>

      </div>

      <div ref="revealTextWrapper" class="absolute top-1/2 left-0 -translate-y-1/2 w-full z-30 px-4 md:px-6">
        <h3 class="text-3xl md:text-5xl lg:text-6xl font-heading font-bold max-w-4xl mx-auto text-center leading-[1.2] tracking-tight">
          <span v-for="(word, i) in textArray" :key="i" class="reveal-word opacity-20 text-ink dark:text-white transition-opacity duration-300">{{ word }}{{ i < textArray.length - 1 ? ' ' : '' }}</span>
        </h3>
      </div>
      
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { PhMapPin, PhBrain, PhChartBarHorizontal } from '@phosphor-icons/vue'

gsap.registerPlugin(ScrollTrigger)

const text = "Readiness is not an option. It is a necessity. Master crisis response organically."
const textArray = text.split(" ")

const containerRef = ref(null)
const titleRef = ref(null)
const productRef = ref(null)
const layerIRef = ref(null)
const layerIIRef = ref(null)
const layerIIIRef = ref(null)
const revealTextWrapper = ref(null)

let st = null

onMounted(() => {
  nextTick(() => {
    // Initial setup configurations
    gsap.set(productRef.value, { scale: 0.8, opacity: 0, y: 150 })
    gsap.set(revealTextWrapper.value, { opacity: 0, scale: 0.9 })
    
    // Stack Cards into a back-to-front deck
    gsap.set(layerIRef.value, { zIndex: 3, scale: 1, y: 0, opacity: 1 })
    gsap.set(layerIIRef.value, { zIndex: 2, scale: 0.95, y: -30, opacity: 0.7 })
    gsap.set(layerIIIRef.value, { zIndex: 1, scale: 0.9, y: -60, opacity: 0.4 })

    // Build the master timelline connected to scroll progress
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.value,
        start: 'top top',
        end: '+=400%', // increase scroll distance to account for multiple shuffles
        scrub: true, // Changed from 1.2 to true so the pin releases perfectly in sync with the mouse scroll, preventing rough glitchy hand-off
        pin: true,  // Use GSAP pinning instead of CSS sticky
      }
    })

    // Phase 1: Initial Scale Up & Intro
    tl.to(titleRef.value, { opacity: 0, y: -80, scale: 0.95, duration: 1 })
      .to(productRef.value, { scale: 1, opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }, "-=0.8")

    // Phase 2: Card 1 Shuffles out and to the back (revealing Card 2)
    tl.to(layerIRef.value, { x: -200, rotateZ: -15, scale: 0.95, duration: 0.6, ease: "power2.inOut" }, "shuffle1")
      .to(layerIIRef.value, { scale: 1, y: 0, opacity: 1, duration: 1.2, ease: "power2.inOut" }, "shuffle1")
      .to(layerIIIRef.value, { scale: 0.95, y: -30, opacity: 0.7, duration: 1.2, ease: "power2.inOut" }, "shuffle1")
      .set(layerIRef.value, { zIndex: 0 }, "shuffle1+=0.6")
      .to(layerIRef.value, { x: 0, y: -60, rotateZ: 0, scale: 0.9, opacity: 0.4, duration: 0.6, ease: "power2.inOut" }, "shuffle1+=0.6")

    // Phase 3: Card 2 Shuffles out and to the back (revealing Card 3)
    tl.to(layerIIRef.value, { x: 200, rotateZ: 15, scale: 0.95, duration: 0.6, ease: "power2.inOut" }, "shuffle2")
      .to(layerIIIRef.value, { scale: 1, y: 0, opacity: 1, zIndex: 3, duration: 1.2, ease: "power2.inOut" }, "shuffle2")
      .to(layerIRef.value, { scale: 0.95, y: -30, opacity: 0.7, zIndex: 2, duration: 1.2, ease: "power2.inOut" }, "shuffle2")
      .set(layerIIRef.value, { zIndex: 1 }, "shuffle2+=0.6")
      .to(layerIIRef.value, { x: 0, y: -60, rotateZ: 0, scale: 0.9, opacity: 0.4, duration: 0.6, ease: "power2.inOut" }, "shuffle2+=0.6")

    // Add a holding pause so Card 3 can be read
    tl.to({}, { duration: 0.8 })

    // Phase 4: Text Reveal effect
    // Fade out layers to background
    tl.to([layerIRef.value, layerIIRef.value, layerIIIRef.value], { 
        opacity: 0.1, 
        filter: 'blur(12px)',
        scale: 0.8,
        duration: 1 
      })
      .to(revealTextWrapper.value, { 
        opacity: 1, 
        scale: 1, 
        duration: 0.5 
      }, "-=0.8")
      // GSAP animate opacity back to 1 staggered across the words
      .to('.reveal-word', { 
        opacity: 1, 
        stagger: 0.08, 
        duration: 2,
        ease: "power1.out"
      }, "-=0.2")
      // Pad out the ending to leave it on screen before unpinning cleanly
      .to({}, { duration: 1.5 })
      
    // Store reference to kill on unmount
    st = tl.scrollTrigger
  })
})

onUnmounted(() => {
  if (st) st.kill()
  ScrollTrigger.getAll().forEach(t => t.kill())
})
</script>
<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
</style>
