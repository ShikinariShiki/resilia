<template>
  <Transition name="coin">
    <div v-if="visible" 
      class="fixed top-20 right-8 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl text-white font-heading font-bold text-base pointer-events-none border border-white/10 transition-all duration-300"
      :class="amount >= 0 ? 'bg-gradient-to-r from-teal-500 to-emerald-600 shadow-teal-500/20' : 'bg-gradient-to-r from-orange-500 to-rose-600 shadow-orange-500/20'">
      <span class="text-lg">🪙</span>
      <span>{{ amount >= 0 ? '+' : '' }}{{ amount }} RC</span>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  trigger: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
})

const visible = ref(false)

watch(() => props.trigger, () => {
  if (props.trigger > 0) {
    visible.value = true
    setTimeout(() => { visible.value = false }, 1800)
  }
})
</script>

<style scoped>
.coin-enter-active {
  animation: coinFly 1.8s ease-out;
}
.coin-leave-active {
  transition: opacity 0.3s;
}
.coin-leave-to {
  opacity: 0;
}

@keyframes coinFly {
  0% { transform: translateY(20px); opacity: 0; }
  15% { transform: translateY(0); opacity: 1; }
  70% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-30px); opacity: 0; }
}
</style>
