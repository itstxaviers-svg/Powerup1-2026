# WORD//CODE on Yandex Cloud

This folder is the deployable cloud part of WORD//CODE. The browser remains offline-first; the cloud stores accounts and synchronised progress.

## Components

- `index.py` — one Python Cloud Function with student/teacher authentication and sync endpoints.
- `schema.yql` — YDB Serverless tables.
- `openapi.yaml` — API Gateway template.
- `requirements.txt` — the YDB Python SDK.

No PIN or teacher password is stored as readable text. They are hashed with PBKDF2-SHA256 and a unique random salt. Browser sync events never contain a PIN.

## Function settings

Create a service account for the function and API Gateway and grant only the permissions needed to invoke the function and access the selected YDB database. Configure these environment variables on the function:

```text
YDB_ENDPOINT=grpcs://ydb.serverless.yandexcloud.net:2135
YDB_DATABASE=/ru-central1/.../...
AUTH_SECRET=<at least 32 random bytes>
BOOTSTRAP_SECRET=<a different long random value>
ALLOWED_ORIGIN=https://your-app-host.example
```

Do not put either secret in `.env`, Vite variables, GitHub, or frontend code.

## First deployment

1. Create a Serverless YDB database in the same Yandex Cloud folder as the function.
2. Open the YDB query editor and run `schema.yql` once.
3. Create a Python 3.12 Cloud Function from this folder. Entry point: `index.handler`.
4. Attach the service account and add the environment variables above.
5. Replace both placeholders in `openapi.yaml`, then create an API Gateway from that file.
6. Test `GET <gateway-domain>/health`; it must return `{"ok": true, ...}`.
7. Create the first teacher and group once using `POST /setup/teacher` and the `X-Bootstrap-Secret` header. After successful setup, replace `BOOTSTRAP_SECRET` in the function with a new disabled random value.
8. Put the gateway URL in the frontend build environment as `VITE_YANDEX_API_URL` and rebuild the PWA.

Example bootstrap body:

```json
{
  "email": "teacher@example.ru",
  "password": "use-a-long-unique-password",
  "displayName": "Teacher",
  "groupName": "Power Up 1",
  "joinCode": "PU1-2026"
}
```

## Sync behaviour

The app writes every answer locally first. It then sends queued events in batches of at most 50. The server records event IDs, so a retry does not duplicate a completed session. Failed events receive an increasing retry delay and remain on the device.

The teacher dashboard reads every student in the teacher's group. Select a student in the list to inspect that learner's detailed progress and rewards.
