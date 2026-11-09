import { Activity, AlertTriangle, BookOpenCheck, CheckCircle2, FileJson, HardDrive, LibraryBig, Trash2, Upload, UserRound, UsersRound } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { grammarPoints, lexicalItems, units } from '../content/course'
import { loadTeacherReports, readTeacherReport, removeTeacherReport, saveTeacherReport, type TeacherReport } from '../data/localTransfer'
import { daysSince, defaultRewardState, type RewardState } from '../domain/rewards'
import { defaultStudentProfile, type StudentProfile } from '../domain/account'
import type { TargetProgress } from '../domain/types'

export function TeacherPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [reports, setReports] = useState<TeacherReport[]>(() => loadTeacherReports())
  const [selectedStudentId, setSelectedStudentId] = useState(() => reports[0]?.student.profile.studentId ?? '')
  const [message, setMessage] = useState('')
  const students = reports.map((report) => report.student)
  const selectedReport = reports.find((report) => report.student.profile.studentId === selectedStudentId) ?? reports[0]
  const profile: StudentProfile = selectedReport?.student.profile ?? defaultStudentProfile
  const progress: TargetProgress[] = selectedReport?.student.progress ?? []
  const reward: RewardState = selectedReport?.student.reward ?? defaultRewardState

  const targetName = (targetId: string) => lexicalItems.find((item) => item.id === targetId)?.text ?? grammarPoints.find((item) => item.id === targetId)?.title ?? targetId
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
  const inactiveStudents = students.filter((student) => daysSince(student.reward.lastActivityAt) >= 3)
  const totalReviewWords = students.reduce((total, student) => total + wordErrorsFor(student.progress).length, 0)

  const importReport = async (file?: File) => {
    if (!file) return
    try {
      const report = readTeacherReport(await file.text())
      saveTeacherReport(report)
      const next = loadTeacherReports()
      setReports(next); setSelectedStudentId(report.student.profile.studentId)
      setMessage(`${report.student.profile.displayName}'s report was imported.`)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'The report could not be imported.') }
    finally { if (inputRef.current) inputRef.current.value = '' }
  }
  const removeReport = (report: TeacherReport) => {
    if (!window.confirm(`Remove ${report.student.profile.displayName}'s report from this device? The student's own progress will not be affected.`)) return
    removeTeacherReport(report.student.profile.studentId)
    const next = loadTeacherReports()
    setReports(next); setSelectedStudentId(next[0]?.student.profile.studentId ?? '')
  }
  const signatures = grammarPoints.reduce((total, item) => total + item.examplePool.length * item.allowedTaskTypes.length, 0)
  const exportBuiltIn = () => {
    const pack = { schemaVersion: 1, name: 'WORD//CODE built-in reference', createdAt: new Date().toISOString(), units, lexicalItems, grammarPoints }
    const url = URL.createObjectURL(new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = 'word-code-content.json'; link.click(); URL.revokeObjectURL(url)
  }

  return <div className="page teacher-page teacher-dashboard">
    <div className="page-title"><p className="kicker">TEACHER REPORT INBOX</p><h1>Teacher Dashboard</h1><p>Import result files sent by students. Reports stay on this device and are never uploaded automatically.</p></div>
    <div className="teacher-notice"><HardDrive /><div><strong>Local teacher view</strong><span>Ask a student to open My Account → Send results, then import the received WORD//CODE report file here.</span></div></div>

    <section className="teacher-import-panel">
      <div><Upload /><span><strong>Import student report</strong><small>Choose a <code>word-code-report-*.json</code> file received by email, AirDrop or another share app.</small></span></div>
      <button type="button" onClick={() => inputRef.current?.click()}>Choose report</button>
      <input ref={inputRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => void importReport(event.target.files?.[0])} />
      {message && <p role="status">{message}</p>}
    </section>

    <div className="teacher-overview">
      <article><span><UsersRound /></span><div><strong>{students.length}</strong><small>Students</small></div><em>Saved reports</em></article>
      <article><span><FileJson /></span><div><strong>{reports.length}</strong><small>Reports</small></div><em>Newest report kept per student</em></article>
      <article><span><AlertTriangle /></span><div><strong>{totalReviewWords}</strong><small>Words to review</small></div><em>Across imported reports</em></article>
      <article><span><Activity /></span><div><strong>{inactiveStudents.length}</strong><small>Need attention</small></div><em>No activity for 3+ days</em></article>
    </div>

    <div className="teacher-dashboard-grid">
      <section className="teacher-data-card students-card"><header><div><p className="kicker">IMPORTED REPORTS</p><h2>Student overview</h2></div><span>LOCAL DEVICE</span></header>
        <div className="teacher-table"><div className="teacher-table-head"><span>Student</span><span>Received</span><span>Words to review</span><span>Last activity</span><span>Report</span></div>{reports.length ? reports.map((report) => {
          const student = report.student
          const wordErrors = wordErrorsFor(student.progress).slice(0, 3)
          return <article key={student.profile.studentId} className={student.profile.studentId === profile.studentId ? 'selected' : ''} role="button" tabIndex={0} onClick={() => setSelectedStudentId(student.profile.studentId)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedStudentId(student.profile.studentId) }}><div><b>{student.profile.displayName}</b><small>{student.profile.wordcodeId}</small></div><time>{new Date(report.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</time><div className="teacher-word-errors">{wordErrors.length ? wordErrors.map((item) => <span key={item.targetId}>{targetName(item.targetId)} · {item.attempts - item.correct}</span>) : <small>No word errors</small>}</div><em>{student.reward.lastActivityAt ? new Date(student.reward.lastActivityAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'No activity'}</em><div className="teacher-account-actions"><button type="button" className="teacher-delete" onClick={(event) => { event.stopPropagation(); removeReport(report) }} aria-label={`Remove ${student.profile.displayName}'s report`}><Trash2 size={14} />Remove</button></div></article>
        }) : <div className="mini-empty"><Upload /><span>No reports imported yet.</span></div>}</div>
      </section>
    </div>

    {selectedReport && <>
      <div className="teacher-dashboard-grid">
        <section className="teacher-data-card"><header><div><p className="kicker">SELECTED STUDENT / UNITS</p><h2>{profile.displayName}'s learning map</h2></div><BookOpenCheck /></header>{studiedUnits.length ? <div className="student-unit-list">{studiedUnits.map(({ unit, targets, independent }) => <article key={unit.id}><span>{unit.order}</span><div><strong>{unit.title}</strong><small>{targets.length} targets practised · {independent} independent decodes</small></div><em>{targets.filter((item) => item.state === 'mastered').length} mastered</em></article>)}</div> : <div className="mini-empty"><BookOpenCheck /><span>No unit activity has been recorded yet.</span></div>}</section>
        <section className="teacher-data-card practice-frequency-card"><header><div><p className="kicker">ACTIVITY FREQUENCY</p><h2>Study rhythm</h2></div><Activity /></header><div><span><strong>{activeDaysLastWeek}</strong>active days in the last 7 days</span><span><strong>{activityDays.length}</strong>active days recorded in total</span><span><strong>{activityDays.at(-1) ? new Date(`${activityDays.at(-1)}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</strong>last recorded activity</span></div></section>
      </div>
      <div className="teacher-dashboard-grid">
        <section className="teacher-data-card"><header><div><p className="kicker">FREQUENT WORD ERRORS</p><h2>Words to review</h2></div><AlertTriangle /></header>{frequentWordErrors.length ? <div className="problem-list">{frequentWordErrors.map((item, index) => <article key={item.targetId}><b>{index + 1}</b><span><strong>{targetName(item.targetId)}</strong><small>{item.attempts - item.correct} errors · {item.mastery}% mastery</small></span><em>{item.state}</em></article>)}</div> : <div className="mini-empty"><CheckCircle2 /><span>No word errors have been recorded yet.</span></div>}</section>
      </div>
    </>}

    <section className="library-health"><div className="section-head"><div><p className="kicker">CONTENT & DATA</p><h2>System health</h2></div></div>
      <div className="health-row"><article><strong>{units.filter((unit) => unit.status === 'active').length}</strong><span>playable units</span></article><article><strong>{units.reduce((total, unit) => total + unit.parts.length, 0)}</strong><span>Unit Parts</span></article><article><strong>5</strong><span>game modes</span></article><article><strong>{lexicalItems.length}</strong><span>lexical targets</span></article><article><strong>{signatures}+</strong><span>grammar signatures</span></article></div>
      <div className="teacher-actions"><button className="outline-button" onClick={exportBuiltIn}><FileJson /> Export content pack</button><button className="outline-button" onClick={() => inputRef.current?.click()}><Upload /> Import student report</button><button className="outline-button"><HardDrive /> Local storage</button><button className="outline-button"><LibraryBig /> Grammar library</button></div>
    </section>
  </div>
}
