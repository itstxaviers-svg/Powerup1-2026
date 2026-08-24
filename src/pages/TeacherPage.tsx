import { Activity, AlertTriangle, BookOpenCheck, CheckCircle2, Database, FileJson, GraduationCap, LibraryBig, ShieldCheck, Trash2, UserRound, UsersRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { grammarPoints, lexicalItems, units } from '../content/course'
import { getProgress, getRewardState, getStudentProfile, getTrainingSessions } from '../data/db'
import { daysSince, defaultRewardState, type RewardState } from '../domain/rewards'
import { defaultStudentProfile, type StudentProfile } from '../domain/account'
import type { TargetProgress } from '../domain/types'
import { cloudSyncEnabled, deleteTeacherStudentCloud, getTeacherDashboardCloud, type TeacherDashboardSnapshot, type TeacherStudentSnapshot } from '../data/cloudSync'
import { getCloudSession } from '../data/cloudSession'

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

function daysBeforeToday(isoDate: string) {
  const date = new Date(isoDate)
  const localDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  return Math.round((startOfToday() - localDay) / 86_400_000)
}

function formatRegistrationDate(isoDate: string) {
  const difference = daysBeforeToday(isoDate)
  if (difference === 0) return 'Today'
  if (difference === 1) return 'Yesterday'
  if (difference === 2) return '2 days ago'
  return new Date(isoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function TeacherPage() {
  const [group, setGroup] = useState<TeacherDashboardSnapshot['group']>({ joinCode: '', displayName: '' })
  const [students, setStudents] = useState<TeacherStudentSnapshot[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deletingStudentId, setDeletingStudentId] = useState('')
  useEffect(() => {
    const session = getCloudSession()
    if (cloudSyncEnabled && session?.role === 'teacher') {
      const load = async () => {
        setIsRefreshing(true)
        try {
          const snapshot = await getTeacherDashboardCloud()
          setGroup(snapshot.group)
          setStudents(snapshot.students)
          setSelectedStudentId((current) => snapshot.students.some((student) => student.profile.studentId === current) ? current : (snapshot.students[0]?.profile.studentId ?? ''))
        } catch { /* keep the latest successfully loaded list */ }
        finally { setIsRefreshing(false) }
      }
      void load()
      const timer = window.setInterval(() => { void load() }, 30_000)
      return () => window.clearInterval(timer)
    }
    Promise.all([getStudentProfile(), getProgress(), getRewardState(), getTrainingSessions()]).then(([profile, progress, reward, sessions]) => {
      setGroup({ joinCode: profile.joinCode, displayName: profile.groupDisplayName })
      setStudents([{ profile, progress, reward, sessions }])
      setSelectedStudentId(profile.studentId)
    })
  }, [])
  const selectedStudent = students.find((student) => student.profile.studentId === selectedStudentId) ?? students[0]
  const profile: StudentProfile = selectedStudent?.profile ?? defaultStudentProfile
  const progress: TargetProgress[] = selectedStudent?.progress ?? []
  const reward: RewardState = selectedStudent?.reward ?? defaultRewardState
  const wordErrorsFor = (items: TargetProgress[]) => [...items]
    .filter((item) => lexicalItems.some((lexical) => lexical.id === item.targetId) && item.attempts - item.correct > 0)
    .sort((a, b) => (b.attempts - b.correct) - (a.attempts - a.correct))
  const frequentWordErrors = useMemo(() => wordErrorsFor(progress).slice(0, 5), [progress])
  const studiedUnits = useMemo(() => units.map((unit) => {
    const targets = progress.filter((item) => item.attempts > 0 && (lexicalItems.some((lexical) => lexical.id === item.targetId && lexical.unitId === unit.id) || grammarPoints.some((grammar) => grammar.id === item.targetId && grammar.unitId === unit.id)))
    return { unit, targets, independent: targets.reduce((total, item) => total + item.independentCorrect, 0) }
  }).filter((item) => item.targets.length > 0), [progress])
  const activityDays = useMemo(() => [...new Set([...reward.activeDays, ...progress.flatMap((item) => item.sessionDays)])].sort(), [progress, reward.activeDays])
  const activeDaysLastWeek = useMemo(() => {
    const weekAgo = Date.now() - 6 * 24 * 60 * 60 * 1000
    return activityDays.filter((day) => new Date(`${day}T12:00:00`).getTime() >= weekAgo).length
  }, [activityDays])
  const studentSummary = (student: TeacherStudentSnapshot) => {
    return {
      inactiveDays: daysSince(student.reward.lastActivityAt),
    }
  }
  const inactiveStudents = students.filter((student) => studentSummary(student).inactiveDays >= 3)
  const registrationCounts = useMemo(() => students.reduce((counts, student) => {
    const difference = daysBeforeToday(student.profile.createdAt)
    if (difference === 0) counts.today += 1
    else if (difference === 1) counts.yesterday += 1
    else if (difference === 2) counts.twoDaysAgo += 1
    return counts
  }, { today: 0, yesterday: 0, twoDaysAgo: 0 }), [students])
  const refreshStudents = async () => {
    if (isRefreshing || !cloudSyncEnabled) return
    setIsRefreshing(true)
    try {
      const snapshot = await getTeacherDashboardCloud()
      setGroup(snapshot.group)
      setStudents(snapshot.students)
      setSelectedStudentId((current) => snapshot.students.some((student) => student.profile.studentId === current) ? current : (snapshot.students[0]?.profile.studentId ?? ''))
    } finally { setIsRefreshing(false) }
  }
  const deleteStudent = async (student: TeacherStudentSnapshot) => {
    const name = student.profile.displayName
    const confirmed = window.confirm(`Delete ${name}'s account? Their cloud progress, rewards and session history will be permanently removed.`)
    if (!confirmed) return
    setDeletingStudentId(student.profile.studentId)
    try {
      await deleteTeacherStudentCloud(student.profile.wordcodeId)
      setStudents((current) => current.filter((item) => item.profile.studentId !== student.profile.studentId))
      if (selectedStudentId === student.profile.studentId) setSelectedStudentId('')
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'The account could not be deleted. Please try again.')
    } finally { setDeletingStudentId('') }
  }
  const signatures = grammarPoints.reduce((total, item) => total + item.examplePool.length * item.allowedTaskTypes.length, 0)
  const targetName = (targetId: string) => lexicalItems.find((item) => item.id === targetId)?.text ?? grammarPoints.find((item) => item.id === targetId)?.title ?? targetId
  const exportBuiltIn = () => {
    const pack = { schemaVersion: 1, name: 'WORD//CODE built-in reference', createdAt: new Date().toISOString(), units, lexicalItems, grammarPoints }
    const url = URL.createObjectURL(new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = 'word-code-content.json'; link.click(); URL.revokeObjectURL(url)
  }

  return <div className="page teacher-page teacher-dashboard">
    <div className="page-title"><p className="kicker">TEACHER HOST / PROTECTED ROLE</p><h1>Teacher Dashboard</h1><p>See who has joined, when they practised, and which words need another review.</p></div>
    <div className="teacher-notice"><ShieldCheck /><div><strong>Protected teacher interface</strong><span>Cloud access uses a separate teacher session. Students cannot open group data with a student account.</span></div></div>
    <div className="teacher-overview">
      <article><span><UsersRound /></span><div><strong>1</strong><small>Group</small></div><em>{group.joinCode || '—'}</em></article>
      <article><span><UserRound /></span><div><strong>{students.length}</strong><small>Students</small></div><em>{inactiveStudents.length ? `${inactiveStudents.length} need attention` : 'All registrations'}</em></article>
      <article><span><UserRound /></span><div><strong>{registrationCounts.today}</strong><small>Joined today</small></div><em>New registrations</em></article>
      <article><span><UserRound /></span><div><strong>{registrationCounts.yesterday}</strong><small>Joined yesterday</small></div><em>{registrationCounts.twoDaysAgo} joined 2 days ago</em></article>
    </div>
    {inactiveStudents.length > 0 && <section className="attention-panel"><header><AlertTriangle /><div><strong>NEEDS ATTENTION — {inactiveStudents.length}</strong><span>Linked to student CODE DECAY</span></div></header>{inactiveStudents.map((student) => { const days = studentSummary(student).inactiveDays; return <div key={student.profile.studentId}><b>{student.profile.displayName}</b><span>{student.profile.groupDisplayName}</span><em>{days} days ago</em></div> })}</section>}
    <div className="teacher-dashboard-grid">
      <section className="teacher-data-card students-card"><header><div><p className="kicker">STUDENTS</p><h2>Student overview</h2></div><span>GROUP: {group.joinCode || '—'} · <button type="button" className="teacher-refresh" onClick={() => { void refreshStudents() }} disabled={isRefreshing}>{isRefreshing ? 'Updating…' : 'Refresh'}</button></span></header>
        <div className="registration-summary"><span><strong>{registrationCounts.today}</strong>joined today</span><span><strong>{registrationCounts.yesterday}</strong>joined yesterday</span><span><strong>{registrationCounts.twoDaysAgo}</strong>joined 2 days ago</span></div>
        <div className="teacher-table"><div className="teacher-table-head"><span>Student</span><span>Joined</span><span>Words to review</span><span>Last activity</span><span>Account</span></div>{students.length ? students.map((student) => { const summary = studentSummary(student); const deleting = deletingStudentId === student.profile.studentId; const wordErrors = wordErrorsFor(student.progress).slice(0, 3); const hasWordPractice = student.progress.some((item) => lexicalItems.some((lexical) => lexical.id === item.targetId) && item.attempts > 0); return <article key={student.profile.studentId} className={student.profile.studentId === profile.studentId ? 'selected' : ''} role="button" tabIndex={0} onClick={() => setSelectedStudentId(student.profile.studentId)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedStudentId(student.profile.studentId) }}><div><b>{student.profile.displayName}</b><small>{student.profile.wordcodeId}</small></div><time>{formatRegistrationDate(student.profile.createdAt)}</time><div className="teacher-word-errors">{wordErrors.length ? wordErrors.map((item) => <span key={item.targetId}>{targetName(item.targetId)} · {item.attempts - item.correct}</span>) : <small>{hasWordPractice ? 'No word errors' : 'No word practice yet'}</small>}</div><em>{summary.inactiveDays === 0 ? 'Today' : `${summary.inactiveDays} days ago`}</em><button type="button" className="teacher-delete" disabled={deleting} onClick={(event) => { event.stopPropagation(); void deleteStudent(student) }} aria-label={`Delete ${student.profile.displayName}'s account`}><Trash2 size={14} />{deleting ? 'Deleting…' : 'Delete'}</button></article> }) : <div className="mini-empty"><UserRound /><span>No students have joined this group yet.</span></div>}</div>
      </section>
    </div>
    <div className="teacher-dashboard-grid">
      <section className="teacher-data-card"><header><div><p className="kicker">SELECTED STUDENT / UNITS</p><h2>{profile.displayName ? `${profile.displayName}'s learning map` : 'Learning map'}</h2></div><BookOpenCheck /></header>{studiedUnits.length ? <div className="student-unit-list">{studiedUnits.map(({ unit, targets, independent }) => <article key={unit.id}><span>{unit.order}</span><div><strong>{unit.title}</strong><small>{targets.length} targets practised · {independent} independent decodes</small></div><em>{targets.filter((item) => item.state === 'mastered').length} mastered</em></article>)}</div> : <div className="mini-empty"><BookOpenCheck /><span>No unit activity has been recorded yet.</span></div>}</section>
      <section className="teacher-data-card practice-frequency-card"><header><div><p className="kicker">ACTIVITY FREQUENCY</p><h2>Study rhythm</h2></div><Activity /></header><div><span><strong>{activeDaysLastWeek}</strong>active days in the last 7 days</span><span><strong>{activityDays.length}</strong>active days recorded in total</span><span><strong>{activityDays.at(-1) ? new Date(`${activityDays.at(-1)}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</strong>last recorded activity</span></div></section>
    </div>
    <div className="teacher-dashboard-grid">
      <section className="teacher-data-card"><header><div><p className="kicker">FREQUENT WORD ERRORS</p><h2>Words to review</h2></div><AlertTriangle /></header>{frequentWordErrors.length ? <div className="problem-list">{frequentWordErrors.map((item, index) => <article key={item.targetId}><b>{index + 1}</b><span><strong>{targetName(item.targetId)}</strong><small>{item.attempts - item.correct} errors · {item.mastery}% mastery</small></span><em>{item.state}</em></article>)}</div> : <div className="mini-empty"><CheckCircle2 /><span>No word errors have been recorded yet.</span></div>}</section>
    </div>
    <section className="library-health"><div className="section-head"><div><p className="kicker">CONTENT & DATA</p><h2>System health</h2></div></div>
      <div className="health-row"><article><strong>{units.filter((unit) => unit.status === 'active').length}</strong><span>playable units</span></article><article><strong>{lexicalItems.length}</strong><span>lexical targets</span></article><article><strong>{signatures}+</strong><span>grammar signatures</span></article></div>
      <div className="teacher-actions"><button className="outline-button" onClick={exportBuiltIn}><FileJson /> Export content pack</button><button className="outline-button"><Database /> Cloud sync ready</button><button className="outline-button"><GraduationCap /> Account management</button><button className="outline-button"><LibraryBig /> Grammar library</button></div>
    </section>
  </div>
}
