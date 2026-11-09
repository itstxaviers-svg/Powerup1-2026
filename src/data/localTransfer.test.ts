import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultStudentProfile } from '../domain/account'
import { defaultRewardState } from '../domain/rewards'
import { loadTeacherReports, readProgressBackup, readTeacherReport, saveTeacherReport, teacherReportText } from './localTransfer'

const now = '2026-11-09T08:00:00.000Z'
const progress = {
  targetId: 'hello-yellow', mastery: 64, state: 'practising' as const, attempts: 5, correct: 3,
  independentCorrect: 2, taskTypesSeen: ['repair', 'audio'] as const, sessionDays: ['2026-11-08'], lastSeenAt: now,
}
const student = {
  profile: { ...defaultStudentProfile, createdAt: now }, progress: [progress],
  reward: { ...defaultRewardState, lifetimeEnergy: 120, lastActivityAt: now },
  trainingSessions: [{ id: 'session-1', unitId: 'hello' as const, completedAt: now, challengeCount: 5, correctCount: 4, energyEarned: 50 }],
  battleProgress: [],
}

describe('local progress transfer', () => {
  beforeEach(() => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      get length() { return values.size },
      clear: () => values.clear(),
      getItem: (key: string) => values.get(key) ?? null,
      key: (index: number) => [...values.keys()][index] ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, String(value)),
    })
  })

  it('validates a complete local backup', () => {
    const backup = readProgressBackup(JSON.stringify({
      kind: 'word-code-backup', version: 1, exportedAt: now,
      snapshot: { ...student, taskHistory: [], customContent: [] }, preferences: { 'word-code:settings': '{}' },
    }))
    expect(backup.snapshot.profile.displayName).toBe(defaultStudentProfile.displayName)
    expect(backup.snapshot.progress[0]?.targetId).toBe('hello-yellow')
  })

  it('rejects unrelated or malformed files', () => {
    expect(() => readProgressBackup('{"hello":"world"}')).toThrow('valid WORD//CODE progress backup')
    expect(() => readTeacherReport('not json')).toThrow('not valid JSON')
  })

  it('stores only the newest teacher report for each student', () => {
    const first = readTeacherReport(JSON.stringify({ kind: 'word-code-teacher-report', version: 1, generatedAt: now, student }))
    const second = { ...first, generatedAt: '2026-11-10T08:00:00.000Z' }
    saveTeacherReport(first); saveTeacherReport(second)
    expect(loadTeacherReports()).toHaveLength(1)
    expect(loadTeacherReports()[0]?.generatedAt).toBe(second.generatedAt)
    expect(teacherReportText(second)).toContain('Accuracy: 60% (3/5)')
  })
})
