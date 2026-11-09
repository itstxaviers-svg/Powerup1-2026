# WORD//CODE

A mobile-first, offline-capable written-recall trainer for beginner English learners. Progress, rewards and battle state are stored locally on the learner's device.

## Published application

The student build is deployed automatically to GitHub Pages from the `main` branch:

<https://itstxaviers-svg.github.io/Powerup1-2026/>

## Run locally

Requires Node.js compatible with Vite 8.

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run build
npm test
npm run test:e2e
```

The app uses a hash router and keeps learner progress in IndexedDB. From **My Account**, learners can export a complete backup, import it on another device, or share a teacher report. The teacher dashboard imports those report files locally; no automatic cloud account or background upload is required.
