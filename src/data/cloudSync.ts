import type { SpiritAssetKey } from '../config/rewardsAssets'
import type { StudentProfile } from '../domain/account'
import type { RewardState, TrainingSessionRecord } from '../domain/rewards'
import type { StudentAuthResponse } from '../domain/sync'
import type { TargetProgress } from '../domain/types'
import { acknowledgeSyncEvents, delaySyncEvents, getPendingSyncEvents } from './db'
import { clearCloudSession, getCloudSession, saveCloudSession } from './cloudSession'

const apiBaseUrl = (import.meta.env.VITE_YANDEX_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
let flushPromise: Promise<void> | null = null

export const cloudSyncEnabled = apiBaseUrl.length > 0

interface ApiErrorBody { message?: string }

async function apiRequest<T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> {
  if (!cloudSyncEnabled) throw new Error('Cloud sync is not configured yet.')
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (authenticated) {
    const session = getCloudSession()
    if (!session) throw new Error('Please sign in again.')
    headers.set('Authorization', `Bearer ${session.token}`)
  }
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers })
  if (!response.ok) {
    let body: ApiErrorBody = {}
    try { body = await response.json() as ApiErrorBody } catch { /* response has no JSON body */ }
    if (response.status === 401) clearCloudSession()
    throw new Error(body.message ?? `Cloud request failed (${response.status}).`)
  }
  return await response.json() as T
}

export async function registerStudentCloud(input: { displayName: string; joinCode: string; avatar: SpiritAssetKey; pin: string }) {
  return apiRequest<StudentAuthResponse>('/student/register', { method: 'POST', body: JSON.stringify(input) })
}

export async function loginStudentCloud(wordcodeId: string, pin: string, remember: boolean) {
  const result = await apiRequest<StudentAuthResponse>('/student/login', { method: 'POST', body: JSON.stringify({ wordcodeId, pin }) })
  saveCloudSession(result.session, remember)
  return result
}

export async function changeStudentPinCloud(pin: string) {
  return apiRequest<{ ok: true }>('/student/pin', { method: 'POST', body: JSON.stringify({ pin }) }, true)
}

export async function loginTeacherCloud(email: string, password: string, remember: boolean) {
  const result = await apiRequest<{ session: StudentAuthResponse['session'] }>('/teacher/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  saveCloudSession(result.session, remember)
  return result
}

export interface TeacherStudentSnapshot {
  profile: StudentProfile
  progress: TargetProgress[]
  reward: RewardState
  sessions: TrainingSessionRecord[]
}

export interface TeacherDashboardSnapshot {
  group: { joinCode: string; displayName: string }
  students: TeacherStudentSnapshot[]
}

export async function getTeacherDashboardCloud() {
  return apiRequest<TeacherDashboardSnapshot>('/teacher/dashboard', { method: 'GET' }, true)
}

export async function deleteTeacherStudentCloud(wordcodeId: string) {
  return apiRequest<{ ok: true; wordcodeId: string }>('/teacher/students/delete', { method: 'POST', body: JSON.stringify({ wordcodeId }) }, true)
}

export async function resetTeacherStudentPinCloud(wordcodeId: string) {
  return apiRequest<{ ok: true; wordcodeId: string; temporaryPin: string }>('/teacher/students/reset-pin', { method: 'POST', body: JSON.stringify({ wordcodeId }) }, true)
}

export async function flushCloudSync() {
  if (!cloudSyncEnabled || !navigator.onLine || !getCloudSession() || flushPromise) return flushPromise ?? Promise.resolve()
  flushPromise = (async () => {
    const events = await getPendingSyncEvents(50)
    if (events.length === 0) return
    try {
      const result = await apiRequest<{ acknowledgedIds: string[] }>('/sync/events', { method: 'POST', body: JSON.stringify({ events }) }, true)
      await acknowledgeSyncEvents(result.acknowledgedIds)
    } catch (error) {
      await delaySyncEvents(events.map((event) => event.id), error instanceof Error ? error.message : 'Unknown sync error')
    }
  })().finally(() => { flushPromise = null })
  return flushPromise
}

export function registerCloudSync() {
  if (!cloudSyncEnabled || typeof window === 'undefined') return () => undefined
  const flush = () => { void flushCloudSync() }
  window.addEventListener('online', flush)
  window.addEventListener('word-code:sync-ready', flush)
  document.addEventListener('visibilitychange', flush)
  const timer = window.setInterval(flush, 30_000)
  flush()
  return () => {
    window.removeEventListener('online', flush)
    window.removeEventListener('word-code:sync-ready', flush)
    document.removeEventListener('visibilitychange', flush)
    window.clearInterval(timer)
  }
}
