<template>
  <div class="min-h-screen bg-white dark:bg-[#141210]" style="padding: 2rem clamp(2rem, 5vw, 6rem);">
    <div class="max-w-3xl mx-auto pt-20 pb-16">
      <RouterLink to="/" class="text-sm text-gray-400 font-body hover:text-ink dark:hover:text-white transition-colors mb-8 inline-block">← Back to Home</RouterLink>

      <h1 class="font-heading text-3xl md:text-4xl font-bold text-ink dark:text-white mb-3">Terms of Service</h1>
      <p class="text-xs text-gray-400 font-body mb-10">Last updated: February 20, 2026</p>

      <div class="prose-sm space-y-8 text-gray-600 dark:text-gray-400 font-body leading-relaxed">
        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using RESILIA ("Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service. RESILIA is operated by ISF Post-Stress ("we", "us", "our") and is intended for educational and informational purposes only.</p>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">2. Description of Service</h2>
          <p>RESILIA is a free, gamified e-learning platform that teaches Psychological First Aid (PFA) and disaster preparedness skills to ASEAN youth. The Service includes educational modules, interactive RPG scenarios, wellness tools, and community engagement features. ResiCoins are a virtual, non-monetary reward system used exclusively within the platform.</p>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">3. Eligibility</h2>
          <p>You must be at least 15 years of age to use RESILIA. By creating an account, you represent that you meet this age requirement. Users under 18 should have parental or guardian consent.</p>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">4. User Accounts</h2>
          <p>In this MVP version, user data is stored locally in your browser using localStorage. You are responsible for maintaining the security of your device. We do not store any personal data on external servers.</p>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">5. Acceptable Use</h2>
          <p>You agree not to: (a) misuse the Service for any unlawful purpose; (b) attempt to reverse engineer, decompile, or disassemble the Service; (c) share or distribute any ResiCoins or virtual rewards outside the platform; (d) impersonate another person or entity.</p>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">6. Intellectual Property</h2>
          <p>All content, including but not limited to text, graphics, logos, educational materials, RPG scenarios, and software, is the property of ISF Post-Stress and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without prior written consent.</p>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">7. Disclaimer</h2>
          <p>RESILIA is an educational platform and does not provide professional medical, psychological, or emergency services. If you are experiencing a mental health crisis, please contact your local emergency services or a qualified professional. The PFA training offered is supplementary and does not replace formal certification programs.</p>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, ISF Post-Stress shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.</p>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">9. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated date. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">10. Contact</h2>
          <p>For questions about these Terms, contact us at <span class="text-teal-600 dark:text-teal-400">support@resilia.app</span>.</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
