// Client-side inference for the Resilia mission-personalization model.
// Runs the trained softmax weights (missionModel.js) fully offline to turn a
// user's onboarding answers into (1) a weight per daily-mission category and
// (2) a concrete, personalized set of daily missions drawn from a mission pool.

import { missionModel as M } from './missionModel'

const { categories: CATS, schema } = M

// Build the feature vector. MUST mirror encode() in train_mission_model.py.
export function buildFeatures(ans = {}) {
  const x = []
  x.push(ans.age === 'adult' ? 1 : 0)
  x.push(ans.disasterExp === true || ans.exp === true ? 1 : 0)
  for (const g of schema.goals) x.push(ans.goal === g ? 1 : 0)
  for (const s of schema.stressors) x.push(ans.stressor === s ? 1 : 0)
  for (const c of schema.coping) x.push(ans.coping === c ? 1 : 0)
  for (const t of schema.time) x.push(ans.time === t ? 1 : 0)
  for (const c of schema.conf) x.push(ans.confidence === c || ans.conf === c ? 1 : 0)
  return x
}

function softmax(z) {
  const mx = Math.max(...z)
  const e = z.map((v) => Math.exp(v - mx))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / s)
}

// Returns { lesson: p, checkin: p, ... } summing to 1.
export function predictMissionWeights(ans = {}) {
  const x = buildFeatures(ans)
  const logits = CATS.map((_, j) => {
    let acc = M.b[j]
    for (let i = 0; i < x.length; i++) acc += x[i] * M.W[i][j]
    return acc
  })
  const p = softmax(logits)
  const out = {}
  CATS.forEach((c, j) => (out[c] = p[j]))
  return out
}

// Mission pool: several variants per category. Generated missions match the
// shape used everywhere in the store: { id, title, description, icon,
// xpReward, coinReward, completed, type }.
export const MISSION_POOL = {
  lesson: [
    { title: 'Complete a Lesson', description: 'Finish any academy module today', icon: '\uD83D\uDCD6', xpReward: 25, coinReward: 5 },
    { title: 'Foundations Review', description: 'Revisit a foundation lesson you have unlocked', icon: '\uD83D\uDCDA', xpReward: 20, coinReward: 4 },
  ],
  checkin: [
    { title: 'Daily Journal', description: 'Write a short reflection in your journal', icon: '\uD83D\uDC9A', xpReward: 15, coinReward: 3 },
    { title: 'Mood Check-In', description: 'Log how you are feeling today', icon: '\uD83D\uDCDD', xpReward: 15, coinReward: 3 },
  ],
  rpg: [
    { title: 'Play an RPG Scenario', description: 'Practice a disaster response scenario', icon: '\uD83C\uDFAE', xpReward: 30, coinReward: 8 },
    { title: 'Field Drill', description: 'Run a crisis decision scenario to the end', icon: '\uD83D\uDD79\uFE0F', xpReward: 30, coinReward: 8 },
  ],
  donate: [
    { title: 'Donate ResiCoins', description: 'Contribute any amount to the community fund', icon: '\uD83E\uDD1D', xpReward: 20, coinReward: 5 },
    { title: 'Pay It Forward', description: 'Support a fellow responder with a donation', icon: '\uD83D\uDC9B', xpReward: 20, coinReward: 5 },
  ],
  dashboard: [
    { title: 'Review ASEAN Data', description: 'Check the analytics dashboard', icon: '\uD83D\uDCCA', xpReward: 10, coinReward: 2 },
    { title: 'Scan the Region', description: 'Explore disaster risk data for your country', icon: '\uD83D\uDDFA\uFE0F', xpReward: 12, coinReward: 3 },
  ],
  toolkit: [
    { title: 'Calm Breathing', description: 'Complete one guided breathing session', icon: '\uD83E\uDEC1', xpReward: 10, coinReward: 2 },
    { title: 'Grounding Exercise', description: 'Finish a 5-senses grounding exercise', icon: '\uD83C\uDF3F', xpReward: 12, coinReward: 3 },
  ],
}

// Largest-remainder allocation of `slots` missions across categories by weight,
// capped by how many distinct variants each category has.
function allocate(weights, slots) {
  const entries = CATS.map((c) => [c, Math.max(0, weights[c] || 0)])
  const total = entries.reduce((a, [, w]) => a + w, 0) || 1
  const caps = {}
  CATS.forEach((c) => (caps[c] = (MISSION_POOL[c] || []).length))
  const raw = entries.map(([c, w]) => [c, (w / total) * slots])
  const counts = {}
  let used = 0
  raw.forEach(([c, r]) => {
    counts[c] = Math.min(caps[c], Math.floor(r))
    used += counts[c]
  })
  // distribute leftovers by largest fractional remainder
  const rema = raw
    .map(([c, r]) => [c, r - Math.floor(r)])
    .sort((a, b) => b[1] - a[1])
  let i = 0
  while (used < slots && i < 1000) {
    const [c] = rema[i % rema.length]
    if (counts[c] < caps[c]) {
      counts[c]++
      used++
    }
    i++
    if (i > rema.length && used < slots) {
      // all caps reached
      const room = CATS.some((c2) => counts[c2] < caps[c2])
      if (!room) break
    }
  }
  return counts
}

// Build a personalized list of daily missions.
// `weights` is the output of predictMissionWeights(). `count` defaults to 5.
export function generatePersonalizedMissions(weights, count = 5) {
  const counts = allocate(weights, count)
  // Order categories by weight so highest-priority missions appear first.
  const ordered = CATS.slice().sort((a, b) => (weights[b] || 0) - (weights[a] || 0))
  const missions = []
  let id = 1
  ordered.forEach((cat) => {
    const n = counts[cat] || 0
    for (let k = 0; k < n; k++) {
      const variant = MISSION_POOL[cat][k]
      if (!variant) continue
      missions.push({
        id: id++,
        title: variant.title,
        description: variant.description,
        icon: variant.icon,
        xpReward: variant.xpReward,
        coinReward: variant.coinReward,
        completed: false,
        type: cat,
        weight: Math.round((weights[cat] || 0) * 100),
      })
    }
  })
  return missions
}

// Convenience: answers -> personalized missions in one call.
export function recommendMissions(ans, count = 5) {
  return generatePersonalizedMissions(predictMissionWeights(ans), count)
}
