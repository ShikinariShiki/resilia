<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <button @click="$router.push('/academy')" class="text-sm text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 font-heading font-bold transition-colors mb-6 sm:mb-8 inline-flex items-center gap-1.5">
        <span>←</span> Back to Academy
      </button>

      <!-- Scenario header -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden mb-6 sm:mb-8 animate-slide-up">
        <div class="bg-gradient-to-br from-gray-800 to-gray-950 p-6 sm:p-8 lg:p-10 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-4">
              <span class="px-3 py-1 rounded-full text-xs font-heading font-bold backdrop-blur-md" :class="scenario.tagClass">{{ scenario.tag }}</span>
              <span class="text-xs text-gray-400 font-body">Module {{ moduleId }}</span>
            </div>
            <h3 class="font-heading text-2xl lg:text-3xl font-bold text-white mb-3">{{ scenario.title }}</h3>
            <p class="text-sm text-gray-400 font-body leading-relaxed max-w-lg">{{ scenario.description }}</p>
          </div>
        </div>

        <!-- Chat -->
        <div class="h-[50vh] sm:h-[60vh] p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-50/50 dark:bg-slate-900/50 scroll-smooth" ref="chatContainer">
          <div v-for="(msg, i) in messages" :key="i" class="mb-5 animate-slide-up">
            
            <!-- Narrative / Flavor Text -->
            <div v-if="msg.from === 'narrative'" class="text-center my-6 opacity-75">
              <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-body italic max-w-lg mx-auto leading-relaxed">
                {{ msg.text }}
              </p>
            </div>

            <!-- Mentor Feedback -->
            <div v-else-if="msg.from === 'mentor'" class="flex justify-center my-4">
              <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3 sm:p-4 max-w-md flex gap-3">
                <span class="text-lg">💡</span>
                <div>
                  <p class="text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Mentor Note</p>
                  <p class="text-xs sm:text-sm text-blue-800 dark:text-blue-200 leading-relaxed">{{ msg.text }}</p>
                </div>
              </div>
            </div>

            <!-- NPC Message -->
            <div v-else-if="msg.from === 'npc'" class="flex gap-3 sm:gap-4 max-w-[85%]">
              <div class="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-sm sm:text-base flex-shrink-0 border-2 border-white dark:border-slate-600 shadow-sm">
                {{ scenario.npcAvatar || '👤' }}
              </div>
              <div class="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-3xl rounded-tl-none shadow-sm dark:shadow-none dark:border dark:border-slate-700 text-ink dark:text-gray-200 text-sm leading-relaxed">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[10px] font-heading font-bold text-gray-400 uppercase tracking-wider">{{ scenario.npcName }}</span>
                  <span v-if="msg.emotion" class="text-xs" :title="msg.emotionLabel">{{ msg.emotion }}</span>
                </div>
                {{ msg.text }}
              </div>
            </div>

            <!-- Player Message -->
            <div v-else class="flex justify-end">
              <div class="bg-teal-500 text-white px-5 py-3 sm:py-4 rounded-3xl rounded-tr-none shadow-md shadow-teal-500/10 text-sm leading-relaxed max-w-[85%]">
                {{ msg.text }}
              </div>
            </div>
          </div>

          <div v-if="typing" class="flex gap-3 sm:gap-4 max-w-[85%] animate-pulse-soft mt-4">
             <div class="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">...</div>
             <div class="bg-white dark:bg-slate-800 px-5 py-4 rounded-3xl rounded-tl-none shadow-sm dark:shadow-none dark:border dark:border-slate-700 text-gray-400 text-xs">
               {{ scenario.npcName }} is typing...
             </div>
          </div>
        </div>

        <!-- Choices -->
        <div v-if="!completed && choices.length > 0" class="p-4 sm:p-6 lg:p-8 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <p class="text-[10px] sm:text-[11px] font-heading font-bold text-gray-300 dark:text-gray-500 uppercase tracking-wider mb-4">Choose your response</p>
          <div class="space-y-3">
            <button v-for="(c, i) in choices" :key="i" @click="chooseResponse(c)"
              class="w-full text-left px-5 sm:px-6 py-4 bg-gray-50 dark:bg-slate-700/50 rounded-2xl text-sm font-body text-ink dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400 hover:scale-[1.01] hover:shadow-sm transition-all duration-200 leading-relaxed border border-transparent hover:border-teal-100 dark:hover:border-teal-800/50">
              {{ c.text }}
            </button>
          </div>
        </div>

        <!-- Completion State -->
        <div v-if="completed" class="p-8 border-t border-gray-100 dark:border-slate-700 bg-teal-50 dark:bg-teal-900/20 text-center animate-slide-up">
          <div class="w-16 h-16 bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">✓</div>
          <h4 class="font-heading text-xl font-bold text-teal-800 dark:text-teal-300 mb-2">Simulation Complete!</h4>
          <p class="text-sm text-teal-600/80 dark:text-teal-400/80 mb-6 font-body">You earned <span class="font-bold">+100 XP</span> and <span class="font-bold">+20 RC</span>.</p>
          <button @click="goBack" class="px-8 py-3 bg-teal-500 text-white rounded-2xl font-heading font-bold text-sm hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20">
            Return to Lesson
          </button>
        </div>
      </div>
    </div>

    <!-- Celebration Effect -->
    <CoinAnimation :trigger="coinTrigger" :amount="20" />
    <ConfettiAnimation :trigger="confettiTrigger" />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import CoinAnimation from '../components/CoinAnimation.vue'
import ConfettiAnimation from '../components/ConfettiAnimation.vue'

const store = useResiliaStore()
const route = useRoute()
const useRouterObj = useRouter()
const moduleId = computed(() => parseInt(route.params.id) || 1)

const messages = ref([])
const choices = ref([])
const typing = ref(false)
const completed = ref(false)
const coinTrigger = ref(0)
const confettiTrigger = ref(0)
const chatContainer = ref(null)
let currentStepIndex = 0

// 12 Scenarios for 12 Modules
const scenarios = {
  // 1. Intro to PFA
  1: {
    title: 'Earthquake in Bandung',
    description: 'A 6.1 magnitude earthquake has struck West Java. You are deployed to a collapsed residential area.',
    tag: '🌍 Response', tagClass: 'bg-red-500/20 text-red-100', npcName: 'Ibu Rina', npcAvatar: '👩🏻',
    steps: [
      {
        narrative: "Dust fills the air. The sound of sirens is distant. You see a woman pacing frantically near a pile of rubble used to be an apartment lobby.",
        npc: "Pak! Tolong! help me! My children... they are inside! I heard them crying but now it's silent!",
        emotion: '😰', emotionLabel: 'Panic',
        options: [
          { text: "Ma'am, please calm down! Crying won't help them right now.", score: 0, feedback: "Direct commands to 'calm down' typically escalate panic. Acknowledge her distress first." },
          { text: "My name is [Name], I'm with the response team. Can you tell me your name?", score: 3, feedback: "Excellent. Introducing yourself and asking for her name helps ground her in the present moment." },
          { text: "I'm going in! Stay here.", score: 0, feedback: "Unsafe. Ensure scene safety and gather intel before rushing into unstable structures." }
        ]
      },
      {
        npc: "I... I am Rina. My boys, Diki and Budi... they are on the first floor. Please, the building is groaning, it might fall!",
        emotion: '😢', emotionLabel: 'Terrified',
        options: [
          { text: "Rina, I can see you're terrified. I'm here with you. Look at me. We need to let the rescue team know exactly where they are.", score: 3, feedback: "Validating her fear ('I see you're terrified') establishes trust and empathy." },
          { text: "Don't worry, Rina. I promise they are fine.", score: 1, feedback: "Avoid false promises. You don't know the outcome, and breaking a promise breaks trust." },
          { text: "First floor? Okay, noted.", score: 1, feedback: "Too clinical. She needs emotional support alongside the tactical response." }
        ]
      },
      {
        narrative: "A small aftershock rumbles. Rina gasps and grabs your arm.",
        npc: "It's shaking again! Oh God, they're going to be crushed!",
        emotion: '😱', emotionLabel: 'High Distress',
        options: [
          { text: "Let's move away from the overhang, Rina. Come with me to the safe zone, and we'll radio the SAR team together.", score: 3, feedback: "Safety first. Guiding her to action empowers her and keeps both of you safe." },
          { text: "Let go of me, I need to work.", score: 0, feedback: "Rejection increases isolation and panic." },
          { text: "It's just a small one, ignore it.", score: 1, feedback: "Never ignore safety threats in a disaster zone." }
        ]
      }
    ]
  },
  // 2. Active Listening
  2: {
    title: 'Typhoon Evacuation Center',
    description: 'Typhoon Haiyan aftermath in Tacloban. A teenager is sitting alone in the evacuation center, looking blankly at the wall.',
    tag: '👂 Listening', tagClass: 'bg-blue-500/20 text-blue-100', npcName: 'Marco', npcAvatar: '🧑🏽',
    steps: [
      {
        narrative: "The gymnasium is loud and chaotic. Marco (16) sits hugging his knees, shivering despite the heat.",
        npc: "...",
        emotion: '😶', emotionLabel: 'Shutdown',
        options: [
          { text: "Hey kid, why so quiet? You need to eat something.", score: 1, feedback: "Pushing physical needs too early can be overwhelming if they are in shock." },
          { text: "(Sit nearby quietly) ... It's really loud in here, isn't it?", score: 3, feedback: "Presence is powerful. Sitting nearby without forcing eye contact is non-intrusive." },
          { text: "Where are your parents? Are they alive?", score: 0, feedback: "Too direct and potentially traumatizing. Avoid 'why' or intrusive questions initially." }
        ]
      },
      {
        npc: "... Whatever. It doesn't matter.",
        emotion: '😒', emotionLabel: 'Defensive',
        options: [
          { text: "It does matter. Tell me.", score: 1, feedback: "Don't force them to talk before they are ready." },
          { text: "You're right, it's a lot to take in. (Offer water bottle) I'm just going to leave this water here in case you get thirsty.", score: 3, feedback: "Addressing basic needs without pressure builds a bridge of care." },
          { text: "You shouldn't have that attitude, we're trying to help.", score: 0, feedback: "Judgmental. Trauma often looks like apathy or anger." }
        ]
      },
      {
        narrative: "Marco slowly takes the water bottle. He looks at you for the first time.",
        npc: "Our house... the roof just flew off. Like it was paper. I couldn't find my dog.",
        emotion: '😟', emotionLabel: 'Opening Up',
        options: [
          { text: "It sounds terrifying to see your home destroyed like that. And losing a pet is losing family.", score: 3, feedback: "Reflective listening validates his experience and labels the emotion." },
          { text: "It's just a dog, at least you're safe.", score: 0, feedback: "Minimizing loss is a major PFA error." },
          { text: "Lots of roofs blew off today.", score: 1, feedback: "Generalizing dismisses his personal pain." }
        ]
      }
    ]
  },
  // 3. Crisis De-escalation
  3: {
    title: 'Supply Distribution Conflict',
    description: 'A food distribution line in Manila is stalled. A father becomes aggressive, shouting that the system is corrupt.',
    tag: '🔥 De-escalation', tagClass: 'bg-orange-500/20 text-orange-100', npcName: 'Pak Budi', npcAvatar: '👨🏾',
    steps: [
      {
        narrative: "Budi pushes to the front of the line, face red and sweating. He is shouting at a volunteer.",
        npc: "We've been waiting for four hours! You're keeping the good stuff for your friends! Liars!",
        emotion: '😡', emotionLabel: 'Aggressive',
        options: [
          { text: "Sir, step back or I'll call security!", score: 0, feedback: "Threats usually escalate anger. Safety is key, but try de-escalation first." },
          { text: "Please calm down, sir.", score: 1, feedback: " 'Calm down' often has the opposite effect." },
          { text: "Sir, I can hear you're frustrated. Four hours is a long time to wait in this heat.", score: 3, feedback: "Validate the frustration. Acknowledging the wait time shows you are listening, not fighting." }
        ]
      },
      {
        npc: "Frustrated?! My daughter has had nothing but rice for two days! She needs milk!",
        emotion: '😤', emotionLabel: 'Desperate',
        options: [
          { text: "I understand your daughter needs milk. That is a priority. Let's step out of the sun for a second so you can tell me exactly what she needs.", score: 3, feedback: "Isolating the angry person away from the crowd (safety) + focusing on the solution (milk)." },
          { text: "Everyone here is hungry, wait your turn.", score: 0, feedback: "Dismissive and shaming. Will likely provoke violence." },
          { text: "We don't have milk anyway.", score: 1, feedback: "Negative phrasing shuts down hope." }
        ]
      },
      {
        narrative: "Budi stops shouting, but still looks tense. He steps slightly aside with you.",
        npc: "Do you really have milk? She's only 2 years old.",
        emotion: '😰', emotionLabel: 'Anxious',
        options: [
          { text: "Let me check our specialized supplies. What is your name, sir? I'm [Name].", score: 3, feedback: "Humanizing the interaction de-escalates tension effectively." },
          { text: "I'll see what I can do.", score: 2, feedback: "Okay, but a bit vague." },
          { text: "Next time don't shout.", score: 0, feedback: "Lecturing destroys the rapport you just built." }
        ]
      }
    ]
  },
  // 4. Cultural Sensitivity
  4: {
    title: 'Medical Aid in Rohingya Camp',
    description: 'A refugee mother refuses to let a male doctor examine her sick child due to cultural and religious modesty norms.',
    tag: '🕌 Culture', tagClass: 'bg-purple-500/20 text-purple-100', npcName: 'Ayesha', npcAvatar: '🧕🏽',
    steps: [
      {
        narrative: "Ayesha holds her feverish daughter (3) tight. The male doctor tries to approach, but she backs away.",
        npc: "No. No man doctor. Haram. My husband say no.",
        emotion: '🙅🏽‍♀️', emotionLabel: 'Refusal',
        options: [
          { text: "Your daughter is sick, religion doesn't matter right now!", score: 0, feedback: "Disrespecting cultural values induces shame and resistance." },
          { text: "I understand this is difficult without your husband here. What is your daughter's name?", score: 3, feedback: "Respect the barrier, then build rapport." },
          { text: "It's standard procedure, just let him check.", score: 1, feedback: "Procedure does not trump cultural safety." }
        ]
      },
      {
        npc: "Her name is Fatima. She is burning up... but I cannot let a strange man touch her.",
        emotion: '😥', emotionLabel: 'Conflicted',
        options: [
          { text: "We have a female nurse, Siti, in the next tent. Would you be comfortable if Siti examines Fatima?", score: 3, feedback: "Finding a culturally acceptable alternative is the best PFA approach." },
          { text: "The doctor is a professional, he sees everyone.", score: 1, feedback: "Still missing the point of her discomfort." },
          { text: "Okay, then we can't help you.", score: 0, feedback: "Abandonment is unethical." }
        ]
      },
      {
        narrative: "Ayesha looks relieved at the mention of a female nurse.",
        npc: "A woman? Yes... yes, please. Can you stay with me?",
        emotion: '🙏', emotionLabel: 'Relieved',
        options: [
          { text: "Of course. I will walk you to Nurse Siti and stay as long as you need.", score: 3, feedback: "Accompanying the survivor ensures the warm handover is completed." },
          { text: "Go to tent B.", score: 1, feedback: "Cold referalls often result in 'lost' patients." },
          { text: "Maybe you should learn that doctors just want to help.", score: 0, feedback: "Judgmental." }
        ]
      }
    ]
  },
  // 5. Triage
  5: {
    title: 'Bus Crash Triage',
    description: 'A bus has skidded off a rain-slicked road in Vietnam. Multiple casualties. You must prioritize care.',
    tag: '🚑 Triage', tagClass: 'bg-emerald-500/20 text-emerald-100', npcName: 'Driver', npcAvatar: '🤕',
    steps: [
      {
        narrative: "Chaos. People screaming. You see a man walking around bleeding from his head, and a woman silent and motionless on the ground.",
        npc: "Help me! My head is bleeding! It hurts!",
        emotion: '🩸', emotionLabel: 'Bleeding',
        options: [
          { text: "Sit down here, sir. I need to check the silent woman first.", score: 3, feedback: "Correct triage. 'Walking wounded' are lower priority than unconscious/silent victims." },
          { text: "Oh my god, lots of blood! Let me bandage that.", score: 0, feedback: "Distracted by blood. The quiet victims are often the most critical." },
          { text: "Everyone stay calm!", score: 1, feedback: "Ineffective shouting." }
        ]
      },
      {
        narrative: "You check the silent woman. She is breathing but unconscious. The bleeding man grabs your shoulder.",
        npc: "Why are you ignoring me?! I'm injured!",
        emotion: '😠', emotionLabel: 'Panicked',
        options: [
          { text: "Sir, hold this cloth to your head. I am helping her because she cannot breathe. I will come to you next.", score: 3, feedback: "Give the 'walking wounded' a task (hold cloth) to keep them occupied and useful." },
          { text: "Go away, I'm busy!", score: 0, feedback: "Aggression escalates the scene." },
          { text: "Just wait a minute.", score: 1, feedback: "Vague instructions increase anxiety." }
        ]
      }
    ]
  },
  // 6. Community Mobilization
  6: {
    title: 'Flood Cleanup Coordination',
    description: 'Post-flood cleanup in Thailand. Villagers are overwhelmed by mud. You need to organize a response.',
    tag: '🤝 Community', tagClass: 'bg-indigo-500/20 text-indigo-100', npcName: 'Village Head', npcAvatar: '👴🏼',
    steps: [
      {
        narrative: "The Village Head looks exhausted, trying to clear his own home while others watch helplessly.",
        npc: "There is too much mud. We cannot do this alone.",
        emotion: '😓', emotionLabel: 'Overwhelmed',
        options: [
          { text: "I'll call the army to do it for you.", score: 1, feedback: "External aid is good, but empowering the community is better for resilience." },
          { text: "Let's gather the young men and form a bucket chain. We can clear the temple first to use as a shelter.", score: 3, feedback: "Mobilizing local resources and setting a communal goal (the temple) builds agency." },
          { text: "You should have built barriers.", score: 0, feedback: "Blaming the victim." }
        ]
      }
    ]
  },
  // 7. Child PFA
  7: {
    title: 'School Aftermath',
    description: 'A flash flood hit a primary school. Children are safe but scared. One girl, Maya (7), is mute and rocking.',
    tag: '🧸 Child PFA', tagClass: 'bg-pink-500/20 text-pink-100', npcName: 'Maya', npcAvatar: '👧🏻',
    steps: [
      {
        narrative: "Maya sits hugging a dirty backpack. She rocks back and forth.",
        npc: "...",
        emotion: '😶', emotionLabel: 'Rocking',
        options: [
          { text: "Hi Maya. I like your backpack. Is there something special inside?", score: 3, feedback: "Connecting via a comfort object (backpack) is a gentle entry point." },
          { text: "Don't be sad, you're safe now.", score: 1, feedback: "Directing feelings ('don't be sad') invalidates her experience." },
          { text: "(Hug her)", score: 0, feedback: "Never touch a traumatized child without permission/rapport." }
        ]
      },
      {
        narrative: "Maya stops rocking. She opens the bag slightly to show a wet teddy bear.",
        npc: "(Whispers) He's cold.",
        emotion: '🧸', emotionLabel: 'Whispering',
        options: [
          { text: "Oh, he does look cold. Should we wrap him in this dry blanket? You can hold him while he warms up.", score: 3, feedback: "Parallel play – treating the doll allows her to process her own feelings of being cold/scared." },
          { text: "It's just a toy.", score: 0, feedback: " Dismissive." },
          { text: "Let's dry you off first.", score: 1, feedback: "Logical, but misses the emotional bridge." }
        ]
      }
    ]
  },
  // 8. Self Care
  8: {
    title: 'Burnout Check',
    description: 'You have been working 16 hours straight looking for survivors. Your colleague, Sarah, is shaking and making mistakes.',
    tag: '🔋 Self Care', tagClass: 'bg-teal-500/20 text-teal-100', npcName: 'Sarah', npcAvatar: '👩🏼‍⚕️',
    steps: [
      {
        narrative: "Sarah drops a water bottle. Her hands are trembling uncontrollably.",
        npc: "I'm fine, I'm fine! I just need coffee. There are still people out there!",
        emotion: '🥴', emotionLabel: 'Exhausted',
        options: [
          { text: "Sarah, stop. Look at your hands. You're exhausted.", score: 2, feedback: "Direct confrontation might make her defensive." },
          { text: "Sarah, you've done incredible work today. But if you collapse, who helps them? Take a 15-min break with me.", score: 3, feedback: "Validates her effort ('incredible work') then reframes rest as a duty (to help others)." },
          { text: "Keep pushing, we're almost done.", score: 0, feedback: "Encouraging burnout leads to errors and injury." }
        ]
      }
    ]
  },
  // 9. Disaster Communication
  9: {
    title: 'Rumor Control',
    description: 'Rumors are spreading in a shelter that a second tsunami is coming. Panic is rising.',
    tag: '📢 Comms', tagClass: 'bg-yellow-500/20 text-yellow-100', npcName: 'Panicked Man', npcAvatar: '👱🏽‍♂️',
    steps: [
      {
        narrative: "A man runs into the shelter screaming.",
        npc: "The water is receding! Another wave is coming! Run!",
        emotion: '🗣️', emotionLabel: 'Shouting',
        options: [
          { text: "Everyone, listen to me! That is false!", score: 1, feedback: "Shouting over him adds to the chaos." },
          { text: "(To the room) Everyone, stay calm. (To the man) Sir, where did you hear this? Let's check the official radio together.", score: 3, feedback: "Address the source, verify with official data, and model calmness." },
          { text: "Ignore him, he's crazy.", score: 0, feedback: "Discrediting him causes conflict." }
        ]
      }
    ]
  },
  // 10. Shelter Management
  10: {
    title: 'Privacy in Chaos',
    description: 'An evacuation centers in Cambodia is overcrowded. Women are sleeping in the open and feel unsafe.',
    tag: '⛺ Shelter', tagClass: 'bg-slate-500/20 text-slate-100', npcName: 'Somaly', npcAvatar: '👩🏽',
    steps: [
      {
        narrative: "Somaly pulls you aside. She looks tired and glances around nervously.",
        npc: "We cannot sleep. The men walk by all night. We need a separate place.",
        emotion: '🫣', emotionLabel: 'Unsafe',
        options: [
          { text: "It's an emergency, we just have to deal with it.", score: 0, feedback: "Safety and dignity are core PFA principles, not luxuries." },
          { text: "I will hang some tarps to create a women-only section immediately. Show me the best spot.", score: 3, feedback: "Immediate action to restore safety and dignity." },
          { text: "I'll tell the men to stop walking.", score: 1, feedback: "Unenforceable and ineffective." }
        ]
      }
    ]
  },
  // 11. Grief
  11: {
    title: 'Identifying a Loved One',
    description: 'A father in Laos needs to identify his son\'s body at a temporary morgue.',
    tag: '🕯️ Grief', tagClass: 'bg-gray-700/50 text-gray-200', npcName: 'Mr. Phom', npcAvatar: '👴🏻',
    steps: [
      {
        narrative: "Mr. Phom stands outside the tent, shaking. He cannot make his feet move.",
        npc: "I... I cannot go in. If it is him, then... then it is real.",
        emotion: '💔', emotionLabel: 'Denial',
        options: [
          { text: "You have to do this to get closure.", score: 0, feedback: "'Closure' is a myth in acute grief. Don't force him." },
          { text: "Take your time, Mr. Phom. I will stand right here with you. We don't have to go in until you are ready.", score: 3, feedback: "Patience and presence. Give him control over the pace." },
          { text: "I'll go check for you.", score: 2, feedback: "Kind, but denies him the agency he might need." }
        ]
      }
    ]
  },
  // 12. Recovery
  12: {
    title: 'Rebuilding Hope',
    description: 'Six months after a quake. A shopkeeper feels guilty for reopening her store while others are still grieving.',
    tag: '🏗️ Recovery', tagClass: 'bg-green-600/20 text-green-100', npcName: 'Wei', npcAvatar: '👩🏻',
    steps: [
      {
        narrative: "Wei is sweeping glass from her storefront. She stops when she sees neighbors watching.",
        npc: "Is it wrong? To start business again? Survivors are still in tents...",
        emotion: '🥡', emotionLabel: 'Guilt',
        options: [
          { text: "Yes, maybe wait a bit longer.", score: 0, feedback: "Stifles recovery." },
          { text: "Wei, your shop provides normalcy. Seeing you open gives others hope that life can return. It's a service to the community.", score: 3, feedback: "Validates her action as a contribution to community resilience." },
          { text: "You need money, right? Just open.", score: 1, feedback: "Misses the emotional weight of survivors' guilt." }
        ]
      }
    ]
  }
}

const scenario = computed(() => {
  return scenarios[moduleId.value] || scenarios[1] // Fallback to 1 if not found
})

function startScenario() {
  const s = scenario.value
  if (s.steps && s.steps.length > 0) {
    processStep(s.steps[0])
  }
}

function processStep(step) {
  typing.value = true
  choices.value = [] // Clear choices
  
  setTimeout(() => {
    typing.value = false
    
    // 1. Add Narrative if exists
    if (step.narrative) {
      messages.value.push({ from: 'narrative', text: step.narrative })
    }

    // 2. Add NPC message
    messages.value.push({ 
      from: 'npc', 
      text: step.npc, 
      emotion: step.emotion, 
      emotionLabel: step.emotionLabel 
    })
    
    // 3. Set choices
    choices.value = step.options
    
    nextTick(() => scrollChat())
  }, 1000)
}

function chooseResponse(choice) {
  // 1. Show Player Message
  messages.value.push({ from: 'player', text: choice.text })
  choices.value = [] // Hide choices immediately
  
  nextTick(() => scrollChat())

  // 2. Show Mentor Feedback after slight delay
  setTimeout(() => {
    messages.value.push({ from: 'mentor', text: choice.feedback })
    nextTick(() => scrollChat())

    // 3. Move to next step or finish
    currentStepIndex++
    const s = scenario.value
    if (currentStepIndex < s.steps.length) {
      setTimeout(() => processStep(s.steps[currentStepIndex]), 1500)
    } else {
      finishScenario()
    }
  }, 600)
}

function finishScenario() {
  setTimeout(() => {
    completed.value = true
    store.completeRPG(moduleId.value)
    coinTrigger.value++
    confettiTrigger.value++
    nextTick(() => scrollChat())
  }, 1000)
}

function goBack() {
  useRouterObj.push(`/academy/module/${moduleId.value}`)
}

function scrollChat() {
  if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
}

onMounted(() => {
  startScenario()
})
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.4s ease-out forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-pulse-soft {
  animation: pulse-soft 2s infinite ease-in-out;
}

@keyframes pulse-soft {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>
