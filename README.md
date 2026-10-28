# Resilia

**Resilia** is a gamified e-learning and Psychological First Aid (PFA) platform designed to help users build disaster preparedness and mental resilience through interactive scenarios.

🏆 **Award:** 1st Place Overall & Gold Medal (Health Category) at the International Student Festival (ISF) 2026.

---

## Key Features & Technical Highlights

* **Gamified Psychological First Aid (PFA):** Interactive modules and scenario-based learning modules designed to train users in disaster mitigation and emergency mental health response.
* **Offline-First Fallback:** Built to remain accessible and functional during unstable network conditions, syncing user progress once connectivity is restored.
* **Authentication & Security:** Full user authentication flow backed by Supabase Auth, paired with strict input sanitization and request rate limiting to protect endpoints.
* **Cross-Platform Delivery:** Runs as a responsive web application and packages natively for desktop environments via Tauri.

---

## Tech Stack

* **Frontend:** Vue 3 (`<script setup>` SFCs), Vite, Tailwind CSS
* **Backend & Database:** Supabase (PostgreSQL, Auth, Realtime/Storage)
* **Desktop Runtime:** Tauri
* **Deployment:** Vercel

---

## Getting Started

### Prerequisites
Make sure you have **Node.js** (v18+) and **npm** installed on your machine. (Optional: Rust toolchain if building the Tauri desktop binary).

### 1. Clone the repository
```bash
git clone [https://github.com/ShikinariShiki/resilia.git](https://github.com/ShikinariShiki/resilia.git)
cd resilia
