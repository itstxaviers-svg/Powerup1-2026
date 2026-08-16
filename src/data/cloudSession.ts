import type { CloudSession } from '../domain/sync'

const cloudSessionKey = 'word-code:cloud-session'

function readFrom(storage: Storage) {
  const value = storage.getItem(cloudSessionKey)
  if (!value) return null
  try {
    const session = JSON.parse(value) as CloudSession
    if (!session.token || new Date(session.expiresAt).getTime() <= Date.now()) {
      storage.removeItem(cloudSessionKey)
      return null
    }
    return session
  } catch {
    storage.removeItem(cloudSessionKey)
    return null
  }
}

export function getCloudSession() {
  if (typeof window === 'undefined') return null
  return readFrom(localStorage) ?? readFrom(sessionStorage)
}

export function saveCloudSession(session: CloudSession, remember = true) {
  const target = remember ? localStorage : sessionStorage
  const other = remember ? sessionStorage : localStorage
  other.removeItem(cloudSessionKey)
  target.setItem(cloudSessionKey, JSON.stringify(session))
}

export function clearCloudSession() {
  localStorage.removeItem(cloudSessionKey)
  sessionStorage.removeItem(cloudSessionKey)
}
