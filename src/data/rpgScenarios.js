// RPG Dialogue Quest scenarios - ZZZ-style branching dialogue.
// Each scenario is a list of scenes. A scene can be pure dialogue or a choice.
//
// Scene shape:
// {
//   bg: imported background url,
//   speaker: { name, sprite, side: 'left'|'right', mood },
//   partner: optional second on-screen sprite { sprite, side, dim },
//   text: dialogue line (supports {name} interpolation),
//   choice: optional {
//     prompt,
//     options: [{ text, correct, damage, feedback }]
//   }
// }

import bgVillage from '../assets/rpg/bg-village.jpg'
import liaHappy from '../assets/rpg/lia-happy.png'
import liaSad from '../assets/rpg/lia-sad.png'
import npcWorried from '../assets/rpg/npc-girl-worried.png'
import npcHappy from '../assets/rpg/npc-girl-happy.png'

export const sprites = { liaHappy, liaSad, npcWorried, npcHappy }
export const backgrounds = { bgVillage }

// Flagship scenario, replicates the provided prototype storyboard (Mount Merapi).
const merapi = {
  id: 'merapi',
  title: 'Standing Before Merapi',
  subtitle: 'Disasters in ASEAN, Field Application',
  module: 1,
  tag: 'Field Drill',
  intro: {
    location: 'Yogyakarta, Indonesia',
    blurb: 'Three months after joining the Disaster Preparedness Club, Lia convinced you to visit Yogyakarta, home to Mount Merapi, one of the most active volcanoes in the world.',
  },
  scenes: [
    {
      bg: bgVillage,
      speaker: { name: 'Lia', sprite: liaHappy, side: 'left', mood: 'bright' },
      text: "We made it, {name}! That's Mount Merapi. One of the most active volcanoes on Earth, and the reason this soil is so alive.",
    },
    {
      bg: bgVillage,
      speaker: { name: 'Lia', sprite: liaSad, side: 'left', mood: 'tense' },
      partner: { sprite: npcWorried, side: 'right', dim: true },
      text: "It's exactly the kind of place you learned about in Chapter 1. The warung owner keeps glancing at the mountain. More smoke than usual, and the sky has turned amber.",
    },
    {
      bg: bgVillage,
      speaker: { name: 'Warung Owner', sprite: npcWorried, side: 'right', mood: 'tense' },
      partner: { sprite: liaSad, side: 'left', dim: true },
      text: "More smoke than usual today. The village upslope already started packing. Is this what your textbooks were talking about?",
    },
    {
      bg: bgVillage,
      speaker: { name: 'Lia', sprite: liaSad, side: 'left', mood: 'tense' },
      partner: { sprite: npcWorried, side: 'right', dim: true },
      text: "Look at Merapi, {name}. Remember what we learned. Indonesia has 127 active volcanoes, the most in the world. What do we do right now?",
      choice: {
        prompt: 'How do you respond?',
        options: [
          {
            text: "Let's check the PVMBG alert level. Indonesia has the best volcanic monitoring in ASEAN. Don't panic, stay informed.",
            correct: true,
            feedback: 'Data-first approach. Exactly what the Disasters in ASEAN module taught you.',
          },
          {
            text: "It's probably nothing. Let's go see Borobudur instead!",
            correct: false,
            damage: 1,
            feedback: 'Ignoring volcanic warning signs for tourism is exactly what Chapter 1 warned against. (-1 HP)',
          },
          {
            text: "We're all going to die! Run!",
            correct: false,
            damage: 1,
            feedback: 'Panic helps nobody. Remember: preparation beats panic. (-1 HP)',
          },
        ],
      },
    },
    {
      bg: bgVillage,
      speaker: { name: 'Lia', sprite: liaHappy, side: 'left', mood: 'bright' },
      partner: { sprite: npcWorried, side: 'right', dim: true },
      text: "PVMBG just raised Merapi to Level III, Siaga. That means heightened activity. The official guidance is a 5 kilometer exclusion zone from the summit.",
    },
    {
      bg: bgVillage,
      speaker: { name: 'Warung Owner', sprite: npcWorried, side: 'right', mood: 'tense' },
      partner: { sprite: liaSad, side: 'left', dim: true },
      text: "My niece refuses to leave. She says every year they warn us and nothing happens. How do I convince her without scaring the children?",
      choice: {
        prompt: 'What is the most resilient response?',
        options: [
          {
            text: 'Share the official PVMBG status calmly, name the exact safe distance, and offer to help her pack the essentials together.',
            correct: true,
            feedback: 'Calm, factual, and practical. You lower fear while raising action. That is psychological first aid in motion.',
          },
          {
            text: 'Tell her she is being irresponsible and that her children could die.',
            correct: false,
            damage: 1,
            feedback: 'Fear and blame make people freeze or resist. Connection comes before correction. (-1 HP)',
          },
          {
            text: 'Say nothing. It is not your village, not your business.',
            correct: false,
            damage: 1,
            feedback: 'Bystander silence costs lives. Resilience means showing up for the community. (-1 HP)',
          },
        ],
      },
    },
    {
      bg: bgVillage,
      speaker: { name: 'Lia', sprite: liaHappy, side: 'left', mood: 'bright' },
      partner: { sprite: npcHappy, side: 'right' },
      text: "Data-first approach, and a calm heart. Exactly what the Disasters in ASEAN module taught you. You're ready for the field, {name}.",
    },
  ],
  reward: { xp: 120, coins: 25 },
}

export const scenarios = {
  merapi,
  // map academy module ids to scenarios; default to merapi for now
  1: merapi,
}

export function getScenario(id) {
  if (!id) return merapi
  return scenarios[id] || scenarios[String(id)] || merapi
}

export default scenarios
