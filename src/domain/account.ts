import type { SpiritAssetKey } from '../config/rewardsAssets'

export interface StudentProfile {
  id: 'current'
  studentId: string
  wordcodeId: string
  displayName: string
  groupId: string
  groupDisplayName: string
  joinCode: string
  avatar: SpiritAssetKey
  createdAt: string
}

export interface StudentAccountSecret {
  id: 'current'
  pinSalt: string
  pinHash: string
  mustChangePin: boolean
}

export const defaultStudentProfile: StudentProfile = {
  id: 'current', studentId: 'local-student', wordcodeId: 'ALEX-482', displayName: 'Alex',
  groupId: 'local-demo-group', groupDisplayName: 'Power Up 1 — Local', joinCode: 'PU1-DEMO',
  avatar: 'spark', createdAt: new Date('2026-08-14T00:00:00Z').toISOString(),
}
