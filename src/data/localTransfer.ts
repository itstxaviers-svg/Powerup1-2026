import { z } from 'zod'
import { grammarPoints, lexicalItems } from '../content/course'
import { exportLocalProgressSnapshot, mergeLocalProgressSnapshot, type LocalProgressSnapshot } from './db'

const taskTypeSchema = z.enum(['repair', 'audio', 'memory', 'unscramble', 'error-hunt'])
const unitIdSchema = z.enum(['hello', 'unit-1', 'unit-2', 'unit-3', 'unit-4', 'unit-5', 'unit-6', 'unit-7', 'unit-8', 'unit-9'])
const profileSchema = z.object({
  id: z.literal('current'), studentId: z.string().min(1), wordcodeId: z.string().min(1), displayName: z.string().min(1),
  groupId: z.string(), groupDisplayName: z.string(), joinCode: z.string(),
  avatar: z.enum(['spark', 'sprite', 'spirit', 'guardian', 'master']), createdAt: z.iso.datetime(),
})
const progressSchema = z.object({
  targetId: z.string().min(1), mastery: z.number().finite(), state: z.enum(['unseen', 'learning', 'practising', 'unstable', 'stable', 'mastered']),
  attempts: z.number().int().nonnegative(), correct: z.number().int().nonnegative(), independentCorrect: z.number().int().nonnegative(),
  taskTypesSeen: z.array(taskTypeSchema), sessionDays: z.array(z.string()), lastSeenAt: z.iso.datetime(),
})
const rewardSchema = z.object({
  id: z.literal('current'), lifetimeEnergy: z.number().nonnegative(), bonusEnergy: z.number().nonnegative(), stability: z.number(),
  lastActivityAt: z.iso.datetime().nullable(), activeDays: z.array(z.string()),
  modeCounts: z.partialRecord(taskTypeSchema, z.number().int().nonnegative()),
  unlockedAccessories: z.array(z.enum(['crystalCore', 'neonWings', 'starAura', 'decoderHalo', 'prismTrail'])),
})
const sessionSchema = z.object({
  id: z.string().min(1), unitId: unitIdSchema, completedAt: z.iso.datetime(), challengeCount: z.number().int().nonnegative(),
  correctCount: z.number().int().nonnegative(), energyEarned: z.number().nonnegative(),
})
const fightIdSchema = z.enum(['checkpoint-03', 'checkpoint-07-a', 'checkpoint-07-b', 'checkpoint-09-a', 'checkpoint-09-b'])
const checkpointIdSchema = z.enum(['checkpoint-03', 'checkpoint-07', 'checkpoint-09'])
const battleSchema = z.object({
  id: checkpointIdSchema,
  allocations: z.partialRecord(fightIdSchema, z.array(z.string())),
  completedFightIds: z.array(fightIdSchema),
  bestAccuracy: z.partialRecord(fightIdSchema, z.number()),
  lastIncorrectIds: z.partialRecord(fightIdSchema, z.array(z.string())),
  introSeenFightIds: z.array(fightIdSchema), activated: z.boolean(), pendingPurificationFightId: fightIdSchema.optional(),
  courseCompleted: z.boolean(), updatedAt: z.iso.datetime(),
})
const snapshotSchema = z.object({
  progress: z.array(progressSchema),
  taskHistory: z.array(z.object({ signature: z.string(), seenAt: z.iso.datetime() })),
  customContent: z.array(z.object({ key: z.string(), value: z.unknown() })),
  reward: rewardSchema,
  trainingSessions: z.array(sessionSchema),
  profile: profileSchema,
  battleProgress: z.array(battleSchema),
})

const backupSchema = z.object({
  kind: z.literal('word-code-backup'),
  version: z.literal(1),
  exportedAt: z.iso.datetime(),
  snapshot: snapshotSchema,
  preferences: z.record(z.string(), z.string()),
})

const teacherReportSchema = z.object({
  kind: z.literal('word-code-teacher-report'),
  version: z.literal(1),
  generatedAt: z.iso.datetime(),
  student: z.object({
    profile: profileSchema,
    progress: z.array(progressSchema),
    reward: rewardSchema,
    trainingSessions: z.array(sessionSchema),
    battleProgress: z.array(battleSchema),
  }),
})

export type TeacherReport = z.infer<typeof teacherReportSchema>
export interface SharingPreferences { studentEmail: string; teacherEmail: string; lastBackupAt?: string }

const sharingKey = 'word-code:sharing'
const reportsKey = 'word-code:teacher-reports'
const excludedPreferenceKeys = new Set(['word-code:session', 'word-code:cloud-session', sharingKey, reportsKey])

export function loadSharingPreferences(): SharingPreferences {
  try {
    const value = JSON.parse(localStorage.getItem(sharingKey) ?? '{}') as Partial<SharingPreferences>
    return { studentEmail: value.studentEmail ?? '', teacherEmail: value.teacherEmail ?? '', lastBackupAt: value.lastBackupAt }
  } catch { return { studentEmail: '', teacherEmail: '' } }
}

export function saveSharingPreferences(value: SharingPreferences) {
  localStorage.setItem(sharingKey, JSON.stringify(value))
}

function localPreferences() {
  return Object.fromEntries(Object.keys(localStorage)
    .filter((key) => key.startsWith('word-code:') && !excludedPreferenceKeys.has(key))
    .flatMap((key) => {
      const value = localStorage.getItem(key)
      return value === null ? [] : [[key, value]]
    }))
}

export async function createProgressBackup() {
  return JSON.stringify({
    kind: 'word-code-backup', version: 1, exportedAt: new Date().toISOString(),
    snapshot: await exportLocalProgressSnapshot(), preferences: localPreferences(),
  }, null, 2)
}

export function readProgressBackup(text: string) {
  let value: unknown
  try { value = JSON.parse(text) } catch { throw new Error('This backup file is not valid JSON.') }
  const parsed = backupSchema.safeParse(value)
  if (!parsed.success) throw new Error('This is not a valid WORD//CODE progress backup.')
  return parsed.data
}

export async function restoreProgressBackup(text: string) {
  const backup = readProgressBackup(text)
  await mergeLocalProgressSnapshot(backup.snapshot as LocalProgressSnapshot)
  Object.entries(backup.preferences).forEach(([key, value]) => {
    if (key.startsWith('word-code:') && !excludedPreferenceKeys.has(key)) localStorage.setItem(key, value)
  })
  sessionStorage.setItem('word-code:session', backup.snapshot.profile.studentId)
  return backup.snapshot.profile
}

export async function createTeacherReport() {
  const snapshot = await exportLocalProgressSnapshot()
  const report: TeacherReport = {
    kind: 'word-code-teacher-report', version: 1, generatedAt: new Date().toISOString(),
    student: {
      profile: snapshot.profile, progress: snapshot.progress, reward: snapshot.reward,
      trainingSessions: snapshot.trainingSessions, battleProgress: snapshot.battleProgress,
    },
  }
  return report
}

export function teacherReportText(report: TeacherReport) {
  const attempts = report.student.progress.reduce((total, item) => total + item.attempts, 0)
  const correct = report.student.progress.reduce((total, item) => total + item.correct, 0)
  const mastered = report.student.progress.filter((item) => item.state === 'mastered').length
  const unstable = [...report.student.progress]
    .filter((item) => item.attempts - item.correct > 0)
    .sort((a, b) => (b.attempts - b.correct) - (a.attempts - a.correct))
    .slice(0, 8)
    .map((item) => lexicalItems.find((target) => target.id === item.targetId)?.text ?? grammarPoints.find((target) => target.id === item.targetId)?.title ?? item.targetId)
  const accuracy = attempts ? Math.round(correct / attempts * 100) : 0
  return [
    `WORD//CODE progress — ${report.student.profile.displayName}`,
    `Generated: ${new Date(report.generatedAt).toLocaleString('en-GB')}`,
    `ID: ${report.student.profile.wordcodeId}`,
    `Sessions: ${report.student.trainingSessions.length}`,
    `Accuracy: ${accuracy}% (${correct}/${attempts})`,
    `Mastered codes: ${mastered}`,
    `Energy: ${report.student.reward.lifetimeEnergy} XP`,
    `Words to review: ${unstable.length ? unstable.join(', ') : 'None recorded'}`,
  ].join('\n')
}

export function readTeacherReport(text: string): TeacherReport {
  let value: unknown
  try { value = JSON.parse(text) } catch { throw new Error('This report file is not valid JSON.') }
  const parsed = teacherReportSchema.safeParse(value)
  if (!parsed.success) throw new Error('This is not a valid WORD//CODE teacher report.')
  return parsed.data
}

export function loadTeacherReports(): TeacherReport[] {
  try {
    const values = JSON.parse(localStorage.getItem(reportsKey) ?? '[]') as unknown[]
    return values.flatMap((value) => {
      const parsed = teacherReportSchema.safeParse(value)
      return parsed.success ? [parsed.data] : []
    }).sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))
  } catch { return [] }
}

export function saveTeacherReport(report: TeacherReport) {
  const reports = loadTeacherReports().filter((item) => item.student.profile.studentId !== report.student.profile.studentId)
  localStorage.setItem(reportsKey, JSON.stringify([report, ...reports].slice(0, 200)))
}

export function removeTeacherReport(studentId: string) {
  localStorage.setItem(reportsKey, JSON.stringify(loadTeacherReports().filter((item) => item.student.profile.studentId !== studentId)))
}

export function createJsonFile(value: string, name: string) {
  return new File([value], name, { type: 'application/json' })
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function shareFile(file: File, title: string, text?: string) {
  const shareNavigator = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
  if (navigator.share && shareNavigator.canShare?.({ files: [file] })) {
    await navigator.share({ title, text, files: [file] })
    return true
  }
  downloadFile(file)
  return false
}
