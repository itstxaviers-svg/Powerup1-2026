import type { StudentProfile } from './account'
import type { RewardState, TrainingSessionRecord } from './rewards'
import type { TargetProgress } from './types'

export type SyncEventType =
  | 'profile.upsert'
  | 'progress.upsert'
  | 'rewards.upsert'
  | 'session.completed'

export type SyncEventPayload = StudentProfile | TargetProgress | RewardState | TrainingSessionRecord

export interface SyncEvent {
  id: string
  studentId: string
  type: SyncEventType
  entityId: string
  occurredAt: string
  payload: SyncEventPayload
  attempts: number
  nextAttemptAt: string
  lastError?: string
}

export interface CloudSession {
  token: string
  role: 'student' | 'teacher'
  subjectId: string
  expiresAt: string
}

export interface StudentAuthResponse {
  session: CloudSession
  profile: StudentProfile
}
