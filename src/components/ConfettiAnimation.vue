<template>
  <div class="fixed inset-0 pointer-events-none z-50 overflow-hidden" v-if="particles.length > 0">
    <div
      v-for="p in particles"
      :key="p.id"
      class="absolute w-2 h-2 rounded-sm"
      :style="{
        left: p.x + 'vw',
        top: p.y + 'vh',
        backgroundColor: p.color,
        transform: `translate3d(${p.dx}px, ${p.dy}px, 0) rotate(${p.rotation}deg) scale(${p.scale})`,
        opacity: p.opacity,
        transition: 'none'
      }"
    ></div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  trigger: Number
})

const particles = ref([])
let animationFrame

watch(() => props.trigger, (val) => {
  if (val > 0) fireConfetti()
})

function fireConfetti() {
  const colors = ['#0D9488', '#F97316', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6']
  const count = 100
  
  // Clear existing to restart
  particles.value = []
  if (animationFrame) cancelAnimationFrame(animationFrame)

  // Spawn new particles
  for (let i = 0; i < count; i++) {
    particles.value.push({
      id: i,
      x: 50, // Start center
      y: 50,
      dx: 0,
      dy: 0,
      vx: (Math.random() - 0.5) * 25, // Velocity X
      vy: (Math.random() - 0.5) * 25 - 10, // Velocity Y (upward bias)
      gravity: 0.5 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 20,
      scale: 0.5 + Math.random(),
      opacity: 1
    })
  }

  animate()
}

function animate() {
  let active = false
  
  particles.value.forEach(p => {
    p.x += p.vx / 10 // Convert velocity to position change roughly
    p.y += p.vy / 10
    
    // Physics
    p.vy += p.gravity
    p.rotation += p.rotationSpeed
    p.opacity -= 0.005

    // Update dom position via transform in template, but here we update reactive state?
    // Doing it via reactive state for 100 particles might be slow in Vue, but for "Gen Z overhaul" validation it's fine.
    // Ideally we'd use canvas, but I want to avoid deps.
    // Let's optimize by just updating `dx` and `dy` which are transform values
    
    // Actually, let's use the `dx/dy` approach for smoother JS animation interacting with CSS props
    p.dx = p.dx + p.vx
    p.dy = p.dy + p.vy
    
    if (p.opacity > 0) active = true
  })

  if (active) {
    animationFrame = requestAnimationFrame(animate)
  } else {
    particles.value = []
  }
}
</script>
