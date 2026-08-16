# WORD//CODE — automatic synchronisation

The selected production architecture is:

```text
Student phone / teacher browser
        ↓ HTTPS
Yandex API Gateway
        ↓
Yandex Cloud Function
        ↓
YDB Serverless
```

The PWA remains usable without internet. IndexedDB is the immediate local source of truth, and the `syncQueue` store uploads changes automatically when connectivity returns.

## What is already implemented

- student cloud registration by teacher Join Code;
- student ID + six-digit PIN login;
- protected teacher email/password login at `/#/teacher/login`;
- student profile, progress, rewards and completed-session sync;
- idempotent event handling (safe retries);
- offline retry queue with exponential delay;
- local-only fallback whenever `VITE_YANDEX_API_URL` is empty;
- PIN/password hashing only on trusted server code.

## Local development

Without cloud:

```bash
npm run dev
```

The demo Join Code remains `PU1-DEMO` and the app stores everything on the current device.

With an activated Yandex backend, create `.env.local`:

```text
VITE_APP_ROLE=student
VITE_REQUIRE_LOGIN=false
VITE_YANDEX_API_URL=https://<your-api-gateway-domain>
```

Then restart `npm run dev`. Variables beginning with `VITE_` are public, so only the public gateway URL belongs there—never `AUTH_SECRET`, passwords, service-account keys, or bootstrap secrets.

## Cloud deployment

Use the files and step-by-step instructions in `cloud/yandex/README.md`.

For production, change the API Gateway CORS origin from `*` to the exact PWA host. Configure API Gateway request limits and monitor Function/YDB usage in Yandex Cloud. Cloud resources are not created merely by committing these files: the project owner must create them in their Yandex Cloud account and supply the resulting public Gateway URL.

## Teacher and student separation

- A student session token has role `student` and may sync only the student ID signed into that browser.
- A teacher session token has role `teacher` and is required for `/#/teacher` and `/teacher/dashboard`.
- The Cloud Function checks roles again; hiding the route in React is not treated as security.
- Students never receive password hashes, PIN hashes, another student's progress, or the bootstrap secret.
