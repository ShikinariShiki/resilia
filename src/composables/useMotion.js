import { onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

export function useMotion() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const reveal = (target, options = {}) => {
    if (prefersReducedMotion) {
      gsap.set(target, { opacity: 1, y: 0 })
      return
    }
    gsap.fromTo(target, 
      { opacity: 0, y: 15 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', ...options }
    )
  }

  const stagger = (targets, options = {}) => {
    if (prefersReducedMotion) {
      gsap.set(targets, { opacity: 1, y: 0 })
      return
    }
    gsap.fromTo(targets, 
      { opacity: 0, y: 15 }, 
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', ...options }
    )
  }

  const press = (target) => {
    if (prefersReducedMotion) return () => {}
    
    const el = typeof target === 'string' ? document.querySelector(target) : target
    if (!el) return () => {}
    
    const onDown = () => gsap.to(el, { scale: 0.95, duration: 0.1, ease: 'power1.inOut' })
    const onUp = () => gsap.to(el, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' })
    
    el.addEventListener('mousedown', onDown)
    el.addEventListener('touchstart', onDown, { passive: true })
    el.addEventListener('mouseup', onUp)
    el.addEventListener('mouseleave', onUp)
    el.addEventListener('touchend', onUp)

    return () => {
      el.removeEventListener('mousedown', onDown)
      el.removeEventListener('touchstart', onDown)
      el.removeEventListener('mouseup', onUp)
      el.removeEventListener('mouseleave', onUp)
      el.removeEventListener('touchend', onUp)
    }
  }

  return { reveal, stagger, press, prefersReducedMotion }
}
