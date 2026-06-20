<template>
  <RpgDialogueQuest
    :scenario="scenario"
    :player-name="playerName"
    @complete="onComplete"
    @exit="onExit"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import RpgDialogueQuest from '../components/RpgDialogueQuest.vue'
import { getScenario } from '../data/rpgScenarios'

const route = useRoute()
const router = useRouter()
const store = useResiliaStore()

const scenario = computed(() => getScenario(route.params.id))
const playerName = computed(() => store.userName || 'Recruit')

function onComplete(result) {
  // Award rewards through the store
  store.earnXP(result.xp)
  store.earnCoins(result.coins, 'RPG Scenario: ' + scenario.value.title)
  store.completeDailyMission('rpg')
  if (typeof store.checkAchievements === 'function') store.checkAchievements()
  const back = route.query.return || '/academy'
  router.push(back)
}

function onExit() {
  const back = route.query.return || '/academy'
  router.push(back)
}
</script>
