<template>
  <div class="min-h-screen bg-white dark:bg-[#141210]" style="padding: 2rem clamp(2rem, 5vw, 6rem);">
    <div class="max-w-3xl mx-auto pt-20 pb-16">
      <RouterLink to="/" class="text-sm text-gray-400 font-body hover:text-ink dark:hover:text-white transition-colors mb-8 inline-block">← Back to Home</RouterLink>

      <h1 class="font-heading text-3xl md:text-4xl font-bold text-ink dark:text-white mb-3">Privacy Policy</h1>
      <p class="text-xs text-gray-400 font-body mb-10">Last updated: February 20, 2026</p>

      <div class="prose-sm space-y-8 text-gray-600 dark:text-gray-400 font-body leading-relaxed">
        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">1. Introduction</h2>
          <p>ISF Post-Stress ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how RESILIA ("Service") collects, uses, and protects your personal information, in compliance with the General Data Protection Regulation (GDPR) and applicable data protection laws.</p>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">2. Data We Collect</h2>
          <p>In this MVP version, RESILIA stores all data locally in your browser via localStorage. We do <strong class="text-ink dark:text-white">not</strong> collect, transmit, or store personal data on external servers. The following data is stored locally:</p>
          <ul class="list-disc pl-5 space-y-1 mt-2">
            <li>Username and display preferences</li>
            <li>Module progress and test scores</li>
            <li>ResiCoin balance and transaction history</li>
            <li>Mood logs and wellness tool usage</li>
            <li>Journal entries (encrypted locally)</li>
            <li>Application settings (dark mode, language)</li>
          </ul>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">3. How We Use Data</h2>
          <p>Your locally stored data is used exclusively to: (a) track your learning progress; (b) personalize your experience; (c) maintain your ResiCoin balance; (d) provide wellness tool functionality. No data is shared with third parties.</p>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">4. Your Rights (GDPR)</h2>
          <p>Under the GDPR and applicable laws, you have the right to:</p>
          <ul class="list-disc pl-5 space-y-1 mt-2">
            <li><strong class="text-ink dark:text-white">Access</strong> — View all personal data stored locally</li>
            <li><strong class="text-ink dark:text-white">Rectification</strong> — Correct any inaccurate data through the app settings</li>
            <li><strong class="text-ink dark:text-white">Erasure</strong> — Delete all data by clearing your browser's localStorage</li>
            <li><strong class="text-ink dark:text-white">Portability</strong> — Export your data (feature coming in future release)</li>
            <li><strong class="text-ink dark:text-white">Restriction</strong> — Limit how your data is processed</li>
            <li><strong class="text-ink dark:text-white">Objection</strong> — Object to specific processing activities</li>
          </ul>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">5. Cookies</h2>
          <p>RESILIA does not use tracking cookies, advertising cookies, or any third-party analytics services. The only client-side storage used is localStorage for application functionality.</p>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">6. Data Security</h2>
          <p>Since all data is stored locally, security depends on your device and browser security. We recommend keeping your browser updated and using device-level security (password, biometrics) to protect your data.</p>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">7. Children's Privacy</h2>
          <p>RESILIA is intended for users aged 15 and above. We do not knowingly collect data from children under 15. If you are a parent or guardian and believe your child has provided data, please contact us.</p>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">8. Third-Party Services</h2>
          <p>RESILIA uses the following third-party services for application delivery only: Google Fonts (for typography). No personal data is transmitted to these services.</p>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be reflected by an updated "Last updated" date. We encourage you to review this page periodically.</p>
        </section>

        <section>
          <h2 class="font-heading font-bold text-lg text-ink dark:text-white mb-3">10. Contact Us</h2>
          <p>For questions about this Privacy Policy or to exercise your data rights, contact us at <span class="text-teal-600 dark:text-teal-400">privacy@resilia.app</span>.</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
