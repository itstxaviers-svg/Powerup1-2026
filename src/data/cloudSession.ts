import type { CloudSession } from '../domain/sync'

const cloudSessionKey = 'word-code:cloud-session'
const studentSessionKey = 'word-code:session'

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
  const activeSession = readFrom(sessionStorage)
  if (activeSession) {
    localStorage.removeItem(cloudSessionKey)
    return activeSession
  }

  // One-time safe migration for sessions created by older releases. Moving the
  // value keeps an already open session alive after the update, but ensures it
  // is removed by the browser when this tab is closed.
  const persistentSession = readFrom(localStorage)
  if (!persistentSession) return null
  localStorage.removeItem(cloudSessionKey)
  sessionStorage.setItem(cloudSessionKey, JSON.stringify(persistentSession))
  return persistentSession
}

export function saveCloudSession(session: CloudSession) {
  localStorage.removeItem(cloudSessionKey)
  sessionStorage.setItem(cloudSessionKey, JSON.stringify(session))
}

export function clearCloudSession() {
  localStorage.removeItem(cloudSessionKey)
  sessionStorage.removeItem(cloudSessionKey)
}

export function getStudentBrowserSession() {
  if (typeof window === 'undefined') return null
  const activeSession = sessionStorage.getItem(studentSessionKey)
  if (activeSession) {
    localStorage.removeItem(studentSessionKey)
    return activeSession
  }
  const persistentSession = localStorage.getItem(studentSessionKey)
  if (!persistentSession) return null
  localStorage.removeItem(studentSessionKey)
  sessionStorage.setItem(studentSessionKey, persistentSession)
  return persistentSession
}

export function saveStudentBrowserSession(studentId: string) {
  localStorage.removeItem(studentSessionKey)
  sessionStorage.setItem(studentSessionKey, studentId)
}
