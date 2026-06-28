import { useMotion } from '../composables/useMotion'

export const motionDirective = {
  mounted(el, binding) {
    const { reveal, press } = useMotion()
    
    if (binding.arg === 'press' || binding.modifiers.press) {
      press(el)
    } else {
      // Default to reveal
      // Extract existing animation-delay if any
      const delayStr = el.style.animationDelay
      let delay = 0
      if (delayStr) {
        delay = parseFloat(delayStr)
        el.style.animationDelay = '' // Clean it up
      }
      
      reveal(el, { delay })
    }
  }
}
