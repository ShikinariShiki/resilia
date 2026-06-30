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
  const reverseV2Map = {
    'merapi': 'quest_ch1',
    'gotong': 'quest_ch1h',
    'evac': 'quest_ch2'
  }
  const originalQuestId = reverseV2Map[route.params.id] || route.params.id
  
  if (typeof store.completeChapterQuest === 'function') {
    store.completeChapterQuest(originalQuestId, result?.score || 0)
  }
  
  const back = route.query.return || '/academy'
  router.push(back)
}

function onExit() {
  const back = route.query.return || '/academy'
  router.push(back)
}
</script>
