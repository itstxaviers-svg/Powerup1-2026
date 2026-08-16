# WORD//CODE

A mobile-first, offline-capable written-recall trainer for beginner English learners. The student application synchronises accounts, progress and rewards through the WORD//CODE API hosted in Yandex Cloud.

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

The app uses a hash router, keeps an offline copy of learner progress in IndexedDB and synchronises authorised profiles with Yandex Cloud when a connection is available. Runtime credentials and local environment files must never be committed.
