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
//
// HP model, single source of truth: five hearts, one heart equals one unit.
// Each wrong answer costs one heart (damage: 1). This matches questHP in the
// store (MAX_QUEST_HP = 5). Never mix the 100 point simulationHP into a heart UI.
//
// Copy for all three chapters is taken verbatim from the provided reference
// frames in docs/rpg-references. Chapter art is mapped in docs/RPG-ASSET-MAPPING.md.

import bgVillage from '../assets/rpg/bg-village.jpg'
import bgMerapi from '../assets/rpg/bg-merapi.jpg'
import bgGotong from '../assets/rpg/bg-gotong.jpg'
import bgEvac from '../assets/rpg/bg-evac.jpg'
import liaHappy from '../assets/rpg/lia-happy.png'
import liaSad from '../assets/rpg/lia-sad.png'
import liaMentorHappy from '../assets/rpg/lia-mentor-happy.png'
import liaMentorUnsure from '../assets/rpg/lia-mentor-unsure.png'
import npcWorried from '../assets/rpg/npc-girl-worried.png'
import npcHappy from '../assets/rpg/npc-girl-happy.png'
import dewiWorried from '../assets/rpg/dewi-worried.png'
import dewiNeutral from '../assets/rpg/dewi-neutral.png'
import youthCrying from '../assets/rpg/youth-crying.png'
import youthConfident from '../assets/rpg/youth-confident.png'

export const sprites = {
  liaHappy, liaSad, liaMentorHappy, liaMentorUnsure,
  npcWorried, npcHappy, dewiWorried, dewiNeutral,
  youthCrying, youthConfident,
}
export const backgrounds = { bgVillage, bgMerapi, bgGotong, bgEvac }

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
      bg: bgMerapi,
      speaker: { name: 'Lia', sprite: liaHappy, side: 'left', mood: 'bright' },
      text: "We made it, {name}! That's Mount Merapi. One of the most active volcanoes on Earth, and the reason this soil is so alive.",
    },
    {
      bg: bgMerapi,
      speaker: { name: 'Lia', sprite: liaSad, side: 'left', mood: 'tense' },
      partner: { sprite: npcWorried, side: 'right', dim: true },
      text: "It's exactly the kind of place you learned about in Chapter 1. The warung owner keeps glancing at the mountain. More smoke than usual, and the sky has turned amber.",
    },
    {
      bg: bgMerapi,
      speaker: { name: 'Warung Owner', sprite: npcWorried, side: 'right', mood: 'tense' },
      partner: { sprite: liaSad, side: 'left', dim: true },
      text: "More smoke than usual today. The village upslope already started packing. Is this what your textbooks were talking about?",
    },
    {
      bg: bgMerapi,
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
      bg: bgMerapi,
      speaker: { name: 'Lia', sprite: liaHappy, side: 'left', mood: 'bright' },
      partner: { sprite: npcWorried, side: 'right', dim: true },
      text: "PVMBG just raised Merapi to Level III, Siaga. That means heightened activity. The official guidance is a 5 kilometer exclusion zone from the summit.",
    },
    {
      bg: bgMerapi,
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
      bg: bgMerapi,
      speaker: { name: 'Lia', sprite: liaHappy, side: 'left', mood: 'bright' },
      partner: { sprite: npcHappy, side: 'right' },
      text: "Data-first approach, and a calm heart. Exactly what the Disasters in ASEAN module taught you. You're ready for the field, {name}.",
    },
  ],
  reward: { xp: 120, coins: 25 },
}

// Chapter 2, Gotong Royong. Community mutual aid during the Siaga alert.
// Copy verbatim from docs/rpg-references/Gotong Royong Ref.
const gotong = {
  id: 'gotong',
  title: 'Gotong Royong',
  subtitle: 'Community Cooperation in Action',
  module: 2,
  tag: 'Field Drill',
  intro: {
    location: 'Village slopes, Central Java',
    blurb: 'The alert is now Level III, Siaga. The village chief, Mbak Dewi, calls the community together. What you read about in Chapter 1 is happening in front of you.',
  },
  scenes: [
    {
      bg: bgGotong,
      speaker: { name: 'Lia', sprite: liaMentorHappy, side: 'left', mood: 'bright' },
      partner: { sprite: youthConfident, side: 'right' },
      text: 'PVMBG confirms Alert Level III (Siaga). The village chief, Mbak Dewi, activates gotong royong, the Indonesian tradition of communal mutual aid that you studied in class.',
    },
    {
      bg: bgGotong,
      speaker: { name: 'Lia', sprite: liaMentorHappy, side: 'left', mood: 'bright' },
      partner: { sprite: youthConfident, side: 'right' },
      text: 'Neighbors help neighbors. The whole village moves as one organism.',
    },
    {
      bg: bgGotong,
      speaker: { name: 'You', sprite: youthConfident, side: 'right', mood: 'bright' },
      partner: { sprite: liaMentorHappy, side: 'left', dim: true },
      text: 'This is REAL, {name}! Mbak Dewi is doing gotong royong, remember?',
    },
    {
      bg: bgGotong,
      speaker: { name: 'You', sprite: youthConfident, side: 'right', mood: 'bright' },
      partner: { sprite: liaMentorHappy, side: 'left', dim: true },
      text: "That's the Indonesian community cooperation tradition from our Chapter 1 module!",
    },
    {
      bg: bgGotong,
      speaker: { name: 'Lia', sprite: liaMentorHappy, side: 'left', mood: 'tense' },
      partner: { sprite: youthConfident, side: 'right' },
      text: "The WHOLE village is helping each other evacuate. It's exactly like what we studied! But she needs more hands.",
      choice: {
        prompt: 'What do you do?',
        options: [
          {
            text: "Let's split up and help. You take east side, I take west. We meet at the village hall every 30 minutes. Keep your phone charged and your tone calm.",
            correct: true,
            feedback: 'Organized, delegated, systematic. Gotong royong in action.',
          },
          {
            text: 'Maybe let the professional responders handle it.',
            correct: false,
            damage: 1,
            feedback: 'BNPB responders may take hours. In ASEAN, community response is often the FIRST response. (-1 HP)',
          },
          {
            text: "I don't remember any protocols.",
            correct: false,
            damage: 1,
            feedback: 'Should have paid more attention in the Institutions and Organizations module. (-1 HP)',
          },
        ],
      },
    },
    {
      bg: bgGotong,
      speaker: { name: 'Lia', sprite: liaMentorHappy, side: 'left', mood: 'bright' },
      partner: { sprite: youthConfident, side: 'right' },
      text: 'Organized, delegated, systematic. Gotong royong in action. You showed up for the whole village, {name}.',
    },
  ],
  reward: { xp: 130, coins: 30 },
}

// Chapter 3, Evacuation Center. Psychological first aid with a grieving farmer.
// Copy verbatim from docs/rpg-references/Evacuation Center Ref.
const evac = {
  id: 'evac',
  title: 'The Evacuation Center',
  subtitle: 'Psychological First Aid',
  module: 3,
  tag: 'Field Drill',
  intro: {
    location: 'Evacuation center, lower slopes',
    blurb: 'The village is safe inside the exclusion zone. Inside the shelter, not every wound is physical.',
  },
  scenes: [
    {
      bg: bgEvac,
      speaker: { name: 'Narrator', sprite: youthCrying, side: 'right', mood: 'tense' },
      text: 'At the evacuation center, an old farmer named Pak Suryo sits apart from everyone, weeping silently.',
    },
    {
      bg: bgEvac,
      speaker: { name: 'Narrator', sprite: youthCrying, side: 'right', mood: 'tense' },
      text: 'He left his water buffalo behind, three years of income, and in Indonesian rural culture, almost like a family member.',
    },
    {
      bg: bgEvac,
      speaker: { name: 'Lia', sprite: liaMentorUnsure, side: 'left', mood: 'unsure' },
      partner: { sprite: youthCrying, side: 'right', dim: true },
      text: 'Lia looks at you, unsure how to help.',
    },
    {
      bg: bgEvac,
      speaker: { name: 'Lia', sprite: liaMentorUnsure, side: 'left', mood: 'unsure' },
      partner: { sprite: youthCrying, side: 'right', dim: true },
      text: "He won't stop crying, {name}. The buffalo is worth three years of income. In Indonesian rural culture, losing livestock is like losing everything!",
    },
    {
      bg: bgEvac,
      speaker: { name: 'Lia', sprite: liaMentorUnsure, side: 'left', mood: 'unsure' },
      partner: { sprite: youthCrying, side: 'right', dim: true },
      text: "This isn't a problem I can Google. I studied disasters in ASEAN but nobody taught me what to SAY to this man.",
      choice: {
        prompt: 'What do you tell Lia?',
        options: [
          {
            text: "Don't try to fix it, Lia. Just sit with him. Tell him you understand his loss is real. Being present IS helping. Sometimes the most powerful thing is just being there.",
            correct: true,
            feedback: "This is the foundation of what you'll learn in Chapter 2, Psychological First Aid. Being present IS the aid.",
          },
          {
            text: "Tell him to stop crying, it's just an animal!",
            correct: false,
            damage: 1,
            feedback: 'Dismissing someone\'s grief is cruel. That buffalo IS three years of income and a part of his family. (-1 HP)',
          },
          {
            text: "Promise him we'll buy a new one.",
            correct: false,
            damage: 1,
            feedback: "Empty promises in disaster zones destroy trust. Be honest about what you can and can't do. (-1 HP)",
          },
        ],
      },
    },
    {
      bg: bgEvac,
      speaker: { name: 'Lia', sprite: liaMentorHappy, side: 'left', mood: 'bright' },
      partner: { sprite: youthCrying, side: 'right', dim: true },
      text: "This is the foundation of what you'll learn in Chapter 2, Psychological First Aid. Being present IS the aid. You stayed human, {name}.",
    },
  ],
  reward: { xp: 140, coins: 35 },
}

export const scenarios = {
  merapi,
  gotong,
  evac,
  // map academy module ids to scenarios
  1: merapi,
  2: gotong,
  3: evac,
}

export function getScenario(id) {
  if (!id) return merapi
  return scenarios[id] || scenarios[String(id)] || merapi
}

export default scenarios
