import { openDB, type DBSchema } from 'idb'
import { taskTypes, type TargetProgress } from '../domain/types'
import { currentTaskTypes, hasMasteryVariety } from '../domain/mastery'
import { defaultRewardState, effectiveStability, rewardLevel, accessoryDefinitions, type RewardState, type TrainingSessionRecord } from '../domain/rewards'
import { defaultStudentProfile, type StudentAccountSecret, type StudentProfile } from '../domain/account'
import type { SyncEvent, SyncEventPayload, SyncEventType } from '../domain/sync'
import type { BattleCheckpointId, BattleProgressRecord } from '../features/battle/types'
import { normaliseBattleProgress } from '../features/battle/engine'

interface WordCodeDB extends DBSchema {
  progress: { key: string; value: TargetProgress }
  taskHistory: { key: string; value: { signature: string; seenAt: string } }
  customContent: { key: string; value: unknown }
  rewardState: { key: string; value: RewardState }
  trainingSessions: { key: string; value: TrainingSessionRecord }
  studentProfile: { key: string; value: StudentProfile }
  studentAccount: { key: string; value: StudentAccountSecret }
  syncQueue: { key: string; value: SyncEvent }
  battleProgress: { key: BattleCheckpointId; value: BattleProgressRecord }
}

const dbPromise = typeof indexedDB === 'undefined' ? null : openDB<WordCodeDB>('word-code', 5, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('progress')) db.createObjectStore('progress', { keyPath: 'targetId' })
    if (!db.objectStoreNames.contains('taskHistory')) db.createObjectStore('taskHistory', { keyPath: 'signature' })
    if (!db.objectStoreNames.contains('customContent')) db.createObjectStore('customContent')
    if (!db.objectStoreNames.contains('rewardState')) db.createObjectStore('rewardState', { keyPath: 'id' })
    if (!db.objectStoreNames.contains('trainingSessions')) db.createObjectStore('trainingSessions', { keyPath: 'id' })
    if (!db.objectStoreNames.contains('studentProfile')) db.createObjectStore('studentProfile', { keyPath: 'id' })
    if (!db.objectStoreNames.contains('studentAccount')) db.createObjectStore('studentAccount', { keyPath: 'id' })
    if (!db.objectStoreNames.contains('syncQueue')) db.createObjectStore('syncQueue', { keyPath: 'id' })
    if (!db.objectStoreNames.contains('battleProgress')) db.createObjectStore('battleProgress', { keyPath: 'id' })
  },
})

const cloudQueueEnabled = Boolean((import.meta.env.VITE_YANDEX_API_URL as string | undefined)?.trim())

async function enqueueSyncEvent(db: Awaited<NonNullable<typeof dbPromise>>, type: SyncEventType, entityId: string, payload: SyncEventPayload, studentId?: string) {
  if (!cloudQueueEnabled) return
  const profile = studentId ? null : await db.get('studentProfile', 'current')
  const now = new Date().toISOString()
  const event: SyncEvent = {
    id: crypto.randomUUID(),
    studentId: studentId ?? profile?.studentId ?? defaultStudentProfile.studentId,
    type,
    entityId,
    occurredAt: now,
    payload,
    attempts: 0,
    nextAttemptAt: now,
  }
  if (type !== 'session.completed') {
    const queued = await db.getAll('syncQueue')
    await Promise.all(queued.filter((item) => item.studentId === event.studentId && item.type === type && item.entityId === entityId).map((item) => db.delete('syncQueue', item.id)))
  }
  await db.put('syncQueue', event)
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('word-code:sync-ready'))
}

export async function getPendingSyncEvents(limit = 50) {
  if (!dbPromise) return []
  const now = new Date().toISOString()
  const events = await (await dbPromise).getAll('syncQueue')
  return events.filter((event) => event.nextAttemptAt <= now).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)).slice(0, limit)
}

export async function acknowledgeSyncEvents(ids: string[]) {
  if (!dbPromise || ids.length === 0) return
  const db = await dbPromise
  const transaction = db.transaction('syncQueue', 'readwrite')
  await Promise.all([...ids.map((id) => transaction.store.delete(id)), transaction.done])
}

export async function delaySyncEvents(ids: string[], message: string) {
  if (!dbPromise || ids.length === 0) return
  const db = await dbPromise
  const transaction = db.transaction('syncQueue', 'readwrite')
  for (const id of ids) {
    const event = await transaction.store.get(id)
    if (!event) continue
    const attempts = event.attempts + 1
    const delayMs = Math.min(15 * 60_000, 5_000 * 2 ** Math.min(attempts, 8))
    await transaction.store.put({ ...event, attempts, nextAttemptAt: new Date(Date.now() + delayMs).toISOString(), lastError: message.slice(0, 180) })
  }
  await transaction.done
}

function normaliseProgress(value: TargetProgress): TargetProgress {
  return {
    ...value,
    mastery: Number.isFinite(value.mastery) ? Math.max(0, Math.min(100, value.mastery)) : 0,
    attempts: Number.isFinite(value.attempts) ? Math.max(0, value.attempts) : 0,
    correct: Number.isFinite(value.correct) ? Math.max(0, value.correct) : 0,
    independentCorrect: Number.isFinite(value.independentCorrect) ? Math.max(0, value.independentCorrect) : 0,
    taskTypesSeen: currentTaskTypes(value.taskTypesSeen ?? []),
    sessionDays: Array.isArray(value.sessionDays) ? value.sessionDays.filter((day): day is string => typeof day === 'string') : [],
  }
}

export async function getProgress() {
  if (!dbPromise) return []
  const db = await dbPromise
  const values = await db.getAll('progress')
  const normalised = values.map(normaliseProgress)
  await Promise.all(normalised.filter((value, index) => JSON.stringify(value) !== JSON.stringify(values[index])).map((value) => db.put('progress', value)))
  return normalised
}

export async function getBattleProgress(id: BattleCheckpointId) {
  const value = await (await dbPromise)?.get('battleProgress', id)
  return value ? normaliseBattleProgress(value) : undefined
}

export async function getAllBattleProgress() {
  if (!dbPromise) return []
  const values = await (await dbPromise).getAll('battleProgress')
  return values.map(normaliseBattleProgress)
}

export async function saveBattleProgress(record: BattleProgressRecord) {
  if (dbPromise) await (await dbPromise).put('battleProgress', record)
}

export async function getRecentSignatures(limit = 80) {
  if (!dbPromise) return []
  const all = await (await dbPromise).getAll('taskHistory')
  return all.sort((a, b) => b.seenAt.localeCompare(a.seenAt)).slice(0, limit).map((item) => item.signature)
}

const masteryWeights: Record<TargetProgress['taskTypesSeen'][number], number> = {
  repair: .45,
  unscramble: .75,
  'error-hunt': .85,
  memory: 1.15,
  audio: 1.4,
}

function currentModeCounts(counts: RewardState['modeCounts']) {
  return Object.fromEntries(taskTypes.flatMap((type) => counts[type] ? [[type, counts[type]]] : [])) as RewardState['modeCounts']
}

export async function recordAttempt(targetId: string, taskType: TargetProgress['taskTypesSeen'][number], correct: boolean, independent: boolean) {
  if (!dbPromise) return
  const db = await dbPromise
  const current = await db.get('progress', targetId)
  const today = new Date().toISOString().slice(0, 10)
  const gain = correct ? masteryWeights[taskType] * (independent ? 10 : 5) : 0
  const score = Math.min(100, (current?.mastery ?? 0) + gain)
  const attempts = (current?.attempts ?? 0) + 1
  const correctCount = (current?.correct ?? 0) + Number(correct)
  const types = currentTaskTypes([...(current?.taskTypesSeen ?? []), taskType])
  const days = Array.from(new Set([...(current?.sessionDays ?? []), today]))
  const independentCorrect = (current?.independentCorrect ?? 0) + Number(correct && independent)
  const masteryReady = hasMasteryVariety(types) && independentCorrect >= 3
  const state: TargetProgress['state'] = !correct && attempts > 1 ? 'unstable' : score >= 88 && masteryReady && days.length >= 2 ? 'mastered' : score >= 65 ? 'stable' : score > 25 ? 'practising' : 'learning'
  const progress: TargetProgress = { targetId, mastery: score, state, attempts, correct: correctCount, independentCorrect, taskTypesSeen: types, sessionDays: days, lastSeenAt: new Date().toISOString() }
  await db.put('progress', progress)
  const reward = await db.get('rewardState', 'current') ?? defaultRewardState
  const energyGain = correct ? independent ? 14 : 9 : 3
  const levelAfter = rewardLevel(reward.lifetimeEnergy + energyGain)
  const unlockedAccessories = accessoryDefinitions.filter((item) => levelAfter >= item.minimumLevel).map((item) => item.key)
  const nextReward: RewardState = {
    ...reward,
    lifetimeEnergy: reward.lifetimeEnergy + energyGain,
    stability: effectiveStability(reward),
    lastActivityAt: new Date().toISOString(),
    activeDays: Array.from(new Set([...reward.activeDays, today])).slice(-120),
    modeCounts: { ...currentModeCounts(reward.modeCounts), [taskType]: (reward.modeCounts[taskType] ?? 0) + 1 },
    unlockedAccessories,
  }
  await db.put('rewardState', nextReward)
  await enqueueSyncEvent(db, 'progress.upsert', targetId, progress)
  await enqueueSyncEvent(db, 'rewards.upsert', 'current', nextReward)
}

export async function getRewardState() {
  if (!dbPromise) return defaultRewardState
  const db = await dbPromise
  const state = await db.get('rewardState', 'current') ?? defaultRewardState
  return { ...state, stability: effectiveStability(state), modeCounts: currentModeCounts(state.modeCounts) }
}

export async function completeTrainingSession(session: Omit<TrainingSessionRecord, 'id' | 'completedAt'>) {
  if (!dbPromise) return
  const db = await dbPromise
  const now = new Date().toISOString()
  const state = await db.get('rewardState', 'current') ?? defaultRewardState
  const restored = Math.min(100, effectiveStability(state) + 30)
  const fullSignalBonus = state.stability < 100 && restored === 100 ? 20 : 0
  const nextReward: RewardState = { ...state, stability: restored, lifetimeEnergy: state.lifetimeEnergy + fullSignalBonus, lastActivityAt: now }
  const completedSession: TrainingSessionRecord = { ...session, id: `session-${crypto.randomUUID()}`, completedAt: now }
  await db.put('rewardState', nextReward)
  await db.put('trainingSessions', completedSession)
  await enqueueSyncEvent(db, 'rewards.upsert', 'current', nextReward)
  await enqueueSyncEvent(db, 'session.completed', completedSession.id, completedSession)
}

export async function getTrainingSessions(limit = 30) {
  if (!dbPromise) return []
  const sessions = await (await dbPromise).getAll('trainingSessions')
  return sessions.sort((a, b) => b.completedAt.localeCompare(a.completedAt)).slice(0, limit)
}

export async function getStudentProfile() {
  if (!dbPromise) return defaultStudentProfile
  const db = await dbPromise
  return await db.get('studentProfile', 'current') ?? defaultStudentProfile
}

export async function saveStudentProfile(profile: StudentProfile) {
  if (!dbPromise) return
  const db = await dbPromise
  await db.put('studentProfile', profile)
  await enqueueSyncEvent(db, 'profile.upsert', profile.studentId, profile, profile.studentId)
}

function bytesToBase64(bytes: Uint8Array) {
  let value = ''
  bytes.forEach((byte) => { value += String.fromCharCode(byte) })
  return btoa(value)
}

function base64ToBytes(value: string) {
  const decoded = atob(value)
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0))
}

async function pinDigest(pin: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits'])
  const result = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: 120_000 }, material, 256)
  return bytesToBase64(new Uint8Array(result))
}

export async function saveStudentPin(pin: string, mustChangePin = false) {
  if (!/^\d{6}$/.test(pin)) throw new Error('PIN must contain exactly 6 digits.')
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const secret: StudentAccountSecret = { id: 'current', pinSalt: bytesToBase64(salt), pinHash: await pinDigest(pin, salt), mustChangePin }
  if (dbPromise) await (await dbPromise).put('studentAccount', secret)
}

export async function verifyStudentPin(pin: string) {
  if (!dbPromise) return false
  const secret = await (await dbPromise).get('studentAccount', 'current')
  if (!secret || !/^\d{6}$/.test(pin)) return false
  return await pinDigest(pin, base64ToBytes(secret.pinSalt)) === secret.pinHash
}

export async function rememberSignature(signature: string) {
  if (!dbPromise) return
  const db = await dbPromise
  await db.put('taskHistory', { signature, seenAt: new Date().toISOString() })
  const all = (await db.getAll('taskHistory')).sort((a, b) => b.seenAt.localeCompare(a.seenAt))
  await Promise.all(all.slice(150).map((item) => db.delete('taskHistory', item.signature)))
}

export async function resetProgress() {
  if (!dbPromise) return
  const db = await dbPromise
  const transaction = db.transaction(['progress', 'battleProgress'], 'readwrite')
  await Promise.all([transaction.objectStore('progress').clear(), transaction.objectStore('battleProgress').clear(), transaction.done])
}
