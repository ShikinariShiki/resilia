// RPG Dialogue Quest scenarios v2 - node-graph schema with branching.
// Each scenario uses id-keyed nodes instead of a flat scenes array.
// See RESILIA-MASTER-PROMPT.md Appendix A for the authoritative spec.

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

// Grade helper: computes ending from tallies
// gold = 0 poor and at most 1 ok
// silver = no fail, mixed choices
// bronze = survived but multiple poor
export function computeGrade(best, ok, poor) {
  if (poor === 0 && ok <= 1) return 'gold'
  if (poor === 0) return 'silver'
  return 'bronze'
}

// Ending definitions per grade, reusable
const GOTONG_ENDINGS = {
  gold:   { outcome: 'gold',   title: 'The Village Moves as One',  line: 'You did not carry the flood alone. You gave everyone a place to push. That is gotong royong.', rewardMult: 1.0 },
  silver: { outcome: 'silver', title: 'Order from the Mud',        line: 'It was messy, but the work got done and no one was left behind.', rewardMult: 0.75 },
  bronze: { outcome: 'bronze', title: 'Barely Holding',            line: 'The village got through it, but good people nearly broke doing too much. Next time, structure first.', rewardMult: 0.5 },
  fail:   { outcome: 'fail',   title: 'Spread Too Thin',           line: 'Without a plan the effort scattered and trust frayed. Every responder learns this the hard way once. Try again.', rewardMult: 0 },
}

const EVAC_ENDINGS = {
  gold:   { outcome: 'gold',   title: 'Present and Steady',   line: 'You did not fix his grief. You stayed inside it with him. That is psychological first aid.', rewardMult: 1.0 },
  silver: { outcome: 'silver', title: 'A Door Reopened',      line: 'You stumbled, then recovered, and he let you back in. PFA is repair, not perfection.', rewardMult: 0.75 },
  bronze: { outcome: 'bronze', title: 'He Is Still Alone',    line: 'He is safe, but he carried most of it by himself. Presence was the lesson, and it is worth another try.', rewardMult: 0.5 },
  fail:   { outcome: 'fail',   title: 'The Door Closed',      line: 'Every well-meant fix pushed him further away. PFA is counter-intuitive at first. Try again and lead with presence.', rewardMult: 0 },
}

const MERAPI_ENDINGS = {
  gold:   { outcome: 'gold',   title: 'Clear Head Under Pressure',  line: 'Data first and a calm heart. You are ready for the field.', rewardMult: 1.0 },
  silver: { outcome: 'silver', title: 'Lessons Learned',            line: 'You made it through, with a few stumbles. The field teaches fast.', rewardMult: 0.75 },
  bronze: { outcome: 'bronze', title: 'Barely Through',             line: 'You survived, but panic nearly won. Review what you learned and try again.', rewardMult: 0.5 },
  fail:   { outcome: 'fail',   title: 'Overwhelmed',                line: 'The pressure got to you this time. Every responder learns by trying again.', rewardMult: 0 },
}

// ─── MERAPI (migrated to node graph, prose preserved) ──────────────
const merapi = {
  id: 'merapi',
  title: 'Standing Before Merapi',
  subtitle: 'Disasters in ASEAN, Field Application',
  module: 1,
  tag: 'CHAPTER 1 · FIELD DRILL',
  length: 9,
  intro: {
    location: 'Yogyakarta, Indonesia',
    blurb: 'Three months after joining the Disaster Preparedness Club, Lia convinced you to visit Yogyakarta, home to Mount Merapi, one of the most active volcanoes in the world.',
  },
  reward: { xp: 120, coins: 25 },
  endings: MERAPI_ENDINGS,
  start: 'n1',
  nodes: {
    n1: {
      bg: bgMerapi,
      speaker: { name: 'Lia', sprite: liaHappy, side: 'left', mood: 'bright' },
      text: "We made it, {name}! That's Mount Merapi. One of the most active volcanoes on Earth, and the reason this soil is so alive.",
      next: 'n2',
    },
    n2: {
      bg: bgMerapi,
      speaker: { name: 'Lia', sprite: liaSad, side: 'left', mood: 'tense' },
      partner: { sprite: npcWorried, side: 'right', dim: true },
      text: "It's exactly the kind of place you learned about in Chapter 1. The warung owner keeps glancing at the mountain. More smoke than usual, and the sky has turned amber.",
      next: 'n3',
    },
    n3: {
      bg: bgMerapi,
      speaker: { name: 'Warung Owner', sprite: npcWorried, side: 'right', mood: 'tense' },
      partner: { sprite: liaSad, side: 'left', dim: true },
      text: 'More smoke than usual today. The village upslope already started packing. Is this what your textbooks were talking about?',
      next: 'n4',
    },
    n4: {
      bg: bgMerapi,
      speaker: { name: 'Lia', sprite: liaSad, side: 'left', mood: 'tense' },
      partner: { sprite: npcWorried, side: 'right', dim: true },
      text: 'Look at Merapi, {name}. Remember what we learned. Indonesia has 127 active volcanoes, the most in the world. What do we do right now?',
      choice: {
        prompt: 'How do you respond?',
        options: [
          {
            text: "Let's check the PVMBG alert level. Indonesia has the best volcanic monitoring in ASEAN. Don't panic, stay informed.",
            tone: 'best', heart: 0, next: 'n4_good',
          },
          {
            text: "It's probably nothing. Let's go see Borobudur instead!",
            tone: 'poor', heart: -1, next: 'n4_bad',
          },
          {
            text: "We're all going to die! Run!",
            tone: 'poor', heart: -1, next: 'n4_bad2',
          },
        ],
      },
    },
    n4_good: {
      bg: bgMerapi,
      speaker: { name: 'Lia', sprite: liaHappy, side: 'left', mood: 'bright' },
      partner: { sprite: npcWorried, side: 'right', dim: true },
      text: "Data-first approach. Exactly what the Disasters in ASEAN module taught you. Let's check the official status.",
      next: 'n5',
    },
    n4_bad: {
      bg: bgMerapi,
      speaker: { name: 'Lia', sprite: liaSad, side: 'left', mood: 'tense' },
      partner: { sprite: npcWorried, side: 'right', dim: true },
      text: "Ignoring volcanic warning signs for tourism is exactly what Chapter 1 warned against, {name}. We need to pay attention when nature is speaking.",
      next: 'n5',
    },
    n4_bad2: {
      bg: bgMerapi,
      speaker: { name: 'Lia', sprite: liaSad, side: 'left', mood: 'tense' },
      partner: { sprite: npcWorried, side: 'right', dim: true },
      text: "Panic helps nobody. Remember, preparation beats panic. Let's take a breath and check the facts first.",
      next: 'n5',
    },
    n5: {
      bg: bgMerapi,
      speaker: { name: 'Lia', sprite: liaHappy, side: 'left', mood: 'bright' },
      partner: { sprite: npcWorried, side: 'right', dim: true },
      text: 'PVMBG just raised Merapi to Level III, Siaga. That means heightened activity. The official guidance is a 5 kilometer exclusion zone from the summit.',
      next: 'n6',
    },
    n6: {
      bg: bgMerapi,
      speaker: { name: 'Warung Owner', sprite: npcWorried, side: 'right', mood: 'tense' },
      partner: { sprite: liaSad, side: 'left', dim: true },
      text: 'My niece refuses to leave. She says every year they warn us and nothing happens. How do I convince her without scaring the children?',
      choice: {
        prompt: 'What is the most resilient response?',
        options: [
          {
            text: 'Share the official PVMBG status calmly, name the exact safe distance, and offer to help her pack the essentials together.',
            tone: 'best', heart: 0, next: 'n6_good',
          },
          {
            text: 'Tell her she is being irresponsible and that her children could die.',
            tone: 'poor', heart: -1, next: 'n6_bad',
          },
          {
            text: 'Say nothing. It is not your village, not your business.',
            tone: 'poor', heart: -1, next: 'n6_bad2',
          },
        ],
      },
    },
    n6_good: {
      bg: bgMerapi,
      speaker: { name: 'Lia', sprite: liaHappy, side: 'left', mood: 'bright' },
      partner: { sprite: npcHappy, side: 'right' },
      text: "Calm, factual, and practical. You lower fear while raising action. That is psychological first aid in motion, {name}.",
      next: 'converge',
    },
    n6_bad: {
      bg: bgMerapi,
      speaker: { name: 'Lia', sprite: liaSad, side: 'left', mood: 'tense' },
      partner: { sprite: npcWorried, side: 'right', dim: true },
      text: "Fear and blame make people freeze or resist. Connection comes before correction, {name}. Let's try a calmer approach.",
      next: 'converge',
    },
    n6_bad2: {
      bg: bgMerapi,
      speaker: { name: 'Lia', sprite: liaSad, side: 'left', mood: 'tense' },
      partner: { sprite: npcWorried, side: 'right', dim: true },
      text: "Bystander silence costs lives. Resilience means showing up for the community, even when it is not your village.",
      next: 'converge',
    },
    converge: {
      bg: bgMerapi,
      speaker: { name: 'Lia', sprite: liaHappy, side: 'left', mood: 'bright' },
      partner: { sprite: npcHappy, side: 'right' },
      text: "Data-first approach, and a calm heart. Exactly what the Disasters in ASEAN module taught you. You're ready for the field, {name}.",
      next: 'grade_ending',
    },
    grade_ending: {
      ending: 'computed',
    },
  },
}

// ─── GOTONG ROYONG v2 (expanded branching per Appendix A §6.1) ─────
const gotong = {
  id: 'gotong',
  title: 'Many Hands',
  subtitle: 'Community Mobilization',
  module: 2,
  tag: 'CHAPTER 1 · COMMUNITY COOPERATION',
  length: 12,
  intro: {
    location: 'Village slopes, Central Java',
    blurb: 'The day after a flash flood. Mud is waist-deep in the lanes. Neighbors are already helping each other. Dewi, a tired neighbor, is trying to coordinate alone and is about to burn out.',
  },
  reward: { xp: 130, coins: 30 },
  endings: GOTONG_ENDINGS,
  start: 'n1',
  nodes: {
    n1: {
      bg: bgGotong,
      speaker: { name: 'Lia', sprite: liaMentorUnsure, side: 'left', mood: 'unsure' },
      text: 'The water dropped overnight, {name}, but look. Every house has mud to the knee and the road out is gone.',
      next: 'n2',
    },
    n2: {
      bg: bgGotong,
      speaker: { name: 'Dewi', sprite: dewiWorried, side: 'right', mood: 'worried' },
      partner: { sprite: liaMentorUnsure, side: 'left', dim: true },
      text: 'I have a list of who is still missing and who needs medicine. I am doing it all myself and I cannot keep up.',
      next: 'n3',
    },
    n3: {
      bg: bgGotong,
      speaker: { name: 'Lia', sprite: liaMentorUnsure, side: 'left', mood: 'unsure' },
      partner: { sprite: dewiWorried, side: 'right' },
      text: 'Dewi is drowning in tasks, {name}. What do we do?',
      choice: {
        prompt: 'Dewi is drowning in tasks. What do you do?',
        options: [
          {
            text: "Let's turn your list into stations. You take medicine, I take the missing-persons check, and we meet at the hall every thirty minutes.",
            tone: 'best', heart: 0, next: 'n4_good',
          },
          {
            text: 'Just wait for BNPB. The professionals should handle a flood, not us.',
            tone: 'poor', heart: -1, next: 'n4_bad',
          },
          {
            text: 'Tell everyone to bring their problems to you so nothing is missed.',
            tone: 'ok', heart: -1, next: 'n4_mid',
          },
        ],
      },
    },
    n4_good: {
      bg: bgGotong,
      speaker: { name: 'Lia', sprite: liaMentorHappy, side: 'left', mood: 'bright' },
      partner: { sprite: dewiNeutral, side: 'right' },
      text: 'Stations. That is gotong royong on purpose, not by accident. People want to help, they just need a place to stand.',
      next: 'n5',
    },
    n4_bad: {
      bg: bgGotong,
      speaker: { name: 'Dewi', sprite: dewiWorried, side: 'right', mood: 'worried' },
      partner: { sprite: liaMentorUnsure, side: 'left', dim: true },
      text: 'BNPB responders may take hours to reach a cut-off village. In ASEAN the community is almost always the first response. We cannot sit and wait.',
      next: 'n4_bad2',
    },
    n4_bad2: {
      bg: bgGotong,
      speaker: { name: 'Lia', sprite: liaMentorUnsure, side: 'left', mood: 'unsure' },
      partner: { sprite: dewiWorried, side: 'right' },
      text: "She is right, {name}. Waiting is a choice too, and here it costs time we do not have. Let's still organize what we have.",
      next: 'n5',
    },
    n4_mid: {
      bg: bgGotong,
      speaker: { name: 'Dewi', sprite: dewiWorried, side: 'right', mood: 'worried' },
      partner: { sprite: liaMentorUnsure, side: 'left', dim: true },
      text: 'If everything routes through me, I become the bottleneck. The moment I sleep, it all stops.',
      next: 'n5',
    },
    n5: {
      bg: bgGotong,
      speaker: { name: 'Narrator', sprite: youthConfident, side: 'right', mood: 'bright' },
      partner: { sprite: liaMentorHappy, side: 'left', dim: true },
      text: "A teenager runs up. 'I rounded up six friends. Tell us where to dig and we will not stop.'",
      next: 'n6',
    },
    n6: {
      bg: bgGotong,
      speaker: { name: 'Lia', sprite: liaMentorUnsure, side: 'left', mood: 'unsure' },
      partner: { sprite: youthConfident, side: 'right' },
      text: 'Six eager helpers, no plan. What is your call, {name}?',
      choice: {
        prompt: 'Six eager helpers, no plan. What is your call?',
        options: [
          {
            text: 'Pair each newcomer with someone who knows the lanes, work in twos, and rotate rest every hour so no one collapses.',
            tone: 'best', heart: 0, next: 'n7_good',
          },
          {
            text: 'Send them straight to the worst-hit house alone to move fast.',
            tone: 'poor', heart: -1, next: 'n7_bad',
          },
          {
            text: 'Let them choose their own tasks, they are motivated enough.',
            tone: 'ok', heart: -1, next: 'n7_mid',
          },
        ],
      },
    },
    n7_good: {
      bg: bgGotong,
      speaker: { name: 'Lia', sprite: liaMentorHappy, side: 'left', mood: 'bright' },
      partner: { sprite: youthConfident, side: 'right' },
      text: 'Buddy system and rotation. That is how mutual aid lasts past the first adrenaline hour.',
      next: 'converge_end',
    },
    n7_bad: {
      bg: bgGotong,
      speaker: { name: 'Dewi', sprite: dewiWorried, side: 'right', mood: 'worried' },
      partner: { sprite: liaMentorUnsure, side: 'left', dim: true },
      text: 'Two of them slipped in a flooded room with no one watching. Speed without safety just makes more casualties.',
      next: 'n7_bad2',
    },
    n7_bad2: {
      bg: bgGotong,
      speaker: { name: 'Lia', sprite: liaMentorUnsure, side: 'left', mood: 'unsure' },
      partner: { sprite: dewiWorried, side: 'right' },
      text: "Enthusiasm needs structure, {name}. Let's pull them back and pair them up before someone gets hurt.",
      next: 'converge_end',
    },
    n7_mid: {
      bg: bgGotong,
      speaker: { name: 'Dewi', sprite: dewiNeutral, side: 'right', mood: 'neutral' },
      partner: { sprite: liaMentorUnsure, side: 'left', dim: true },
      text: 'They scattered to the easy jobs and the heavy house is still untouched. Motivation needs direction.',
      next: 'converge_end',
    },
    converge_end: {
      bg: bgGotong,
      speaker: { name: 'Dewi', sprite: dewiNeutral, side: 'right', mood: 'neutral' },
      partner: { sprite: liaMentorHappy, side: 'left' },
      text: 'The hall has stations now. People know where to stand. For the first time today I can breathe.',
      next: 'grade_ending',
    },
    grade_ending: {
      ending: 'computed',
    },
  },
}

// ─── EVACUATION CENTER v2 (expanded branching per Appendix A §6.2) ─
const evac = {
  id: 'evac',
  title: 'Just Sit With Him',
  subtitle: 'Psychological First Aid',
  module: 3,
  tag: 'CHAPTER 2 · PSYCHOLOGICAL FIRST AID',
  length: 12,
  intro: {
    location: 'Evacuation Center, Day 2',
    blurb: 'Day two in a crowded shelter. Pak Suryo, an old farmer, sits apart and weeps. He left his water buffalo behind, three years of income and, in rural culture, almost family.',
  },
  reward: { xp: 140, coins: 35 },
  endings: EVAC_ENDINGS,
  start: 'n1',
  nodes: {
    n1: {
      bg: bgEvac,
      speaker: { name: 'Narrator', sprite: youthCrying, side: 'right', mood: 'tense' },
      partner: { sprite: liaMentorUnsure, side: 'left', dim: true },
      text: 'At the evacuation center, an old farmer named Pak Suryo sits apart from everyone, weeping silently.',
      next: 'n2',
    },
    n2: {
      bg: bgEvac,
      speaker: { name: 'Lia', sprite: liaMentorUnsure, side: 'left', mood: 'unsure' },
      partner: { sprite: youthCrying, side: 'right', dim: true },
      text: 'He left his water buffalo behind. Three years of income, and in our villages a buffalo is almost family. I do not know what to say to him.',
      next: 'n3',
    },
    n3: {
      bg: bgEvac,
      speaker: { name: 'Lia', sprite: liaMentorUnsure, side: 'left', mood: 'unsure' },
      partner: { sprite: youthCrying, side: 'right', dim: true },
      text: 'He will not stop crying, {name}. What do we even say to him?',
      choice: {
        prompt: 'What do you tell Lia?',
        options: [
          {
            text: "Don't try to fix it. Sit with him. Tell him you understand his loss is real. Being present is helping.",
            tone: 'best', heart: 0, next: 'good_a',
          },
          {
            text: 'Tell him to stop crying, it is just an animal.',
            tone: 'poor', heart: -1, next: 'bad_a',
          },
          {
            text: 'Promise him we will buy him a new buffalo.',
            tone: 'ok', heart: -1, next: 'mid_a',
          },
        ],
      },
    },
    good_a: {
      bg: bgEvac,
      speaker: { name: 'Lia', sprite: liaMentorHappy, side: 'left', mood: 'happy' },
      partner: { sprite: youthCrying, side: 'right', dim: true },
      text: "So I do not need the perfect words. I just need to not leave. That is the foundation of Chapter 2, {name}. Being present IS the aid.",
      next: 'n4',
    },
    bad_a: {
      bg: bgEvac,
      speaker: { name: 'Pak Suryo', sprite: youthCrying, side: 'right', mood: 'hurt' },
      partner: { sprite: liaMentorUnsure, side: 'left', dim: true },
      text: "'Just an animal.' He turns his back. 'You young people study disasters but you never learned what a loss is.'",
      next: 'bad_a2',
    },
    bad_a2: {
      bg: bgEvac,
      speaker: { name: 'Lia', sprite: liaMentorUnsure, side: 'left', mood: 'unsure' },
      partner: { sprite: youthCrying, side: 'right', dim: true },
      text: "Minimizing his loss closed the door, {name}. In PFA we never measure someone's grief against our own scale. Let's try to reopen it gently.",
      next: 'n4',
    },
    mid_a: {
      bg: bgEvac,
      speaker: { name: 'Lia', sprite: liaMentorUnsure, side: 'left', mood: 'unsure' },
      partner: { sprite: youthCrying, side: 'right', dim: true },
      text: 'A new buffalo someday is a promise we cannot keep, and it tells him his feeling now does not matter. Reassurance that is false breaks trust.',
      next: 'n4',
    },
    n4: {
      bg: bgEvac,
      speaker: { name: 'Pak Suryo', sprite: youthCrying, side: 'right', mood: 'quiet' },
      partner: { sprite: liaMentorHappy, side: 'left', dim: true },
      text: "He wipes his face. 'You actually sat down. Nobody else did. They all told me to be grateful I am alive.'",
      next: 'n5',
    },
    n5: {
      bg: bgEvac,
      speaker: { name: 'Lia', sprite: liaMentorUnsure, side: 'left', mood: 'unsure' },
      partner: { sprite: youthCrying, side: 'right' },
      text: 'He is talking now, {name}. How do you respond?',
      choice: {
        prompt: 'He is talking now. How do you respond?',
        options: [
          {
            text: "Stay quiet and let him speak. Nod, and only ask 'what was he like' if he wants to keep going.",
            tone: 'best', heart: 0, next: 'good_b',
          },
          {
            text: 'Tell him to focus on the future and start planning his recovery now.',
            tone: 'poor', heart: -1, next: 'bad_b',
          },
          {
            text: 'List the aid programs he can apply to so he feels productive.',
            tone: 'ok', heart: -1, next: 'mid_b',
          },
        ],
      },
    },
    good_b: {
      bg: bgEvac,
      speaker: { name: 'Lia', sprite: liaMentorHappy, side: 'left', mood: 'happy' },
      partner: { sprite: youthCrying, side: 'right' },
      text: 'You gave him room and he filled it himself. Listening without steering is the hardest skill and you just did it.',
      next: 'end_resolve',
    },
    bad_b: {
      bg: bgEvac,
      speaker: { name: 'Pak Suryo', sprite: youthCrying, side: 'right', mood: 'hurt' },
      partner: { sprite: liaMentorUnsure, side: 'left', dim: true },
      text: "'The future.' He goes silent again. Rushing him to recover told him his grief was in the way.",
      next: 'end_resolve',
    },
    mid_b: {
      bg: bgEvac,
      speaker: { name: 'Pak Suryo', sprite: youthCrying, side: 'right', mood: 'flat' },
      partner: { sprite: liaMentorUnsure, side: 'left', dim: true },
      text: 'He takes the list and nods politely. Paperwork is not what he needed in this minute, but it is not nothing.',
      next: 'end_resolve',
    },
    end_resolve: {
      bg: bgEvac,
      speaker: { name: 'Lia', sprite: liaMentorHappy, side: 'left', mood: 'warm' },
      partner: { sprite: youthCrying, side: 'right' },
      text: 'He asked for your name, {name}. Tomorrow he will look for the person who stayed.',
      next: 'grade_ending',
    },
    grade_ending: {
      ending: 'computed',
    },
  },
}

export const scenarios = {
  merapi,
  gotong,
  evac,
  1: merapi,
  2: gotong,
  3: evac,
}

export function getScenario(id) {
  if (!id) return merapi
  return scenarios[id] || scenarios[String(id)] || merapi
}

export default scenarios
