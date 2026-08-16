import { Activity, AlertTriangle, BookOpenCheck, CheckCircle2, Database, FileJson, Gift, GraduationCap, LibraryBig, RadioTower, ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { grammarPoints, lexicalItems, units } from '../content/course'
import { getProgress, getRewardState, getStudentProfile, getTrainingSessions } from '../data/db'
import { daysSince, defaultRewardState, rewardLevel, spiritStageForLevel, type RewardState, type TrainingSessionRecord } from '../domain/rewards'
import { defaultStudentProfile, type StudentProfile } from '../domain/account'
import type { TargetProgress } from '../domain/types'
import { cloudSyncEnabled, getTeacherDashboardCloud } from '../data/cloudSync'
import { getCloudSession } from '../data/cloudSession'

export function TeacherPage() {
  const [profile, setProfile] = useState<StudentProfile>(defaultStudentProfile)
  const [progress, setProgress] = useState<TargetProgress[]>([])
  const [reward, setReward] = useState<RewardState>(defaultRewardState)
  const [sessions, setSessions] = useState<TrainingSessionRecord[]>([])
  useEffect(() => {
    const session = getCloudSession()
    if (cloudSyncEnabled && session?.role === 'teacher') {
      getTeacherDashboardCloud().then((snapshot) => {
        setProfile(snapshot.profile); setProgress(snapshot.progress); setReward(snapshot.reward); setSessions(snapshot.sessions)
      }).catch(() => undefined)
      return
    }
    Promise.all([getStudentProfile(), getProgress(), getRewardState(), getTrainingSessions()]).then(([nextProfile, nextProgress, nextReward, nextSessions]) => { setProfile(nextProfile); setProgress(nextProgress); setReward(nextReward); setSessions(nextSessions) })
  }, [])
  const attempted = progress.filter((item) => item.attempts > 0)
  const mastered = progress.filter((item) => item.state === 'mastered')
  const stable = progress.filter((item) => item.state === 'stable' || item.state === 'mastered')
  const difficult = useMemo(() => [...progress].filter((item) => item.state === 'unstable' || item.attempts - item.correct >= 2).sort((a, b) => (b.attempts - b.correct) - (a.attempts - a.correct)).slice(0, 5), [progress])
  const courseProgress = Math.round((attempted.length / Math.max(1, lexicalItems.length + grammarPoints.length)) * 100)
  const inactiveDays = daysSince(reward.lastActivityAt)
  const level = rewardLevel(reward.lifetimeEnergy)
  const stage = spiritStageForLevel(level)
  const signatures = grammarPoints.reduce((total, item) => total + item.examplePool.length * item.allowedTaskTypes.length, 0)
  const targetName = (targetId: string) => lexicalItems.find((item) => item.id === targetId)?.text ?? grammarPoints.find((item) => item.id === targetId)?.title ?? targetId
  const exportBuiltIn = () => {
    const pack = { schemaVersion: 1, name: 'WORD//CODE built-in reference', createdAt: new Date().toISOString(), units, lexicalItems, grammarPoints }
    const url = URL.createObjectURL(new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = 'word-code-content.json'; link.click(); URL.revokeObjectURL(url)
  }

  return <div className="page teacher-page teacher-dashboard">
    <div className="page-title"><p className="kicker">TEACHER HOST / PROTECTED ROLE</p><h1>Teacher Dashboard</h1><p>Groups, learning progress, activity and reward signals in one calm overview.</p></div>
    <div className="teacher-notice"><ShieldCheck /><div><strong>Protected teacher interface</strong><span>Cloud access uses a separate teacher session. Students cannot open group data with a student account.</span></div></div>
    <div className="teacher-overview">
      <article><span><UsersRound /></span><div><strong>1</strong><small>Group</small></div><em>{profile.joinCode}</em></article>
      <article><span><UserRound /></span><div><strong>1</strong><small>Student</small></div><em>{inactiveDays >= 3 ? 'Needs attention' : 'Active'}</em></article>
      <article><span><BookOpenCheck /></span><div><strong>{courseProgress}%</strong><small>Course progress</small></div><em>{stable.length} stable</em></article>
      <article><span><Gift /></span><div><strong>Lv. {level}</strong><small>{stage.name}</small></div><em>{reward.lifetimeEnergy} energy</em></article>
    </div>
    {inactiveDays >= 3 && <section className="attention-panel"><header><AlertTriangle /><div><strong>NEEDS ATTENTION — 1</strong><span>Linked to student CODE DECAY</span></div></header><div><b>{profile.displayName}</b><span>{profile.groupDisplayName}</span><em>{inactiveDays} days ago</em></div></section>}
    <div className="teacher-dashboard-grid">
      <section className="teacher-data-card students-card"><header><div><p className="kicker">STUDENTS</p><h2>Student overview</h2></div><span>GROUP: {profile.joinCode}</span></header>
        <div className="teacher-table"><div className="teacher-table-head"><span>Student</span><span>Progress</span><span>Mastered</span><span>Last activity</span></div><article><div><b>{profile.displayName}</b><small>{profile.wordcodeId}</small></div><strong>{courseProgress}%</strong><strong>{mastered.length}</strong><em>{inactiveDays === 0 ? 'Today' : `${inactiveDays} days ago`}</em></article></div>
      </section>
      <section className="teacher-data-card reward-state-card"><header><div><p className="kicker">SPIRIT SIGNAL</p><h2>Reward state</h2></div><RadioTower /></header><div><span><strong>Level {level}</strong>{stage.name}</span><span><strong>{reward.stability}%</strong>Stability</span><span><strong>{reward.lifetimeEnergy}</strong>Energy</span><span><strong>{reward.activeDays.length}</strong>Active days</span></div></section>
    </div>
    <div className="teacher-dashboard-grid">
      <section className="teacher-data-card"><header><div><p className="kicker">PROBLEM WORDS</p><h2>Most difficult</h2></div><AlertTriangle /></header>{difficult.length ? <div className="problem-list">{difficult.map((item, index) => <article key={item.targetId}><b>{index + 1}</b><span><strong>{targetName(item.targetId)}</strong><small>{item.attempts - item.correct} errors · {item.mastery}% mastery</small></span><em>{item.state}</em></article>)}</div> : <div className="mini-empty"><CheckCircle2 /><span>No difficult codes yet.</span></div>}</section>
      <section className="teacher-data-card"><header><div><p className="kicker">ACTIVITY</p><h2>Recent sessions</h2></div><Activity /></header>{sessions.length ? <div className="activity-list">{sessions.slice(0, 5).map((session) => <article key={session.id}><span>{new Date(session.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span><strong>{session.correctCount} / {session.challengeCount}</strong><em>+{session.energyEarned} energy</em></article>)}</div> : <div className="mini-empty"><Activity /><span>No completed sessions yet.</span></div>}</section>
    </div>
    <section className="library-health"><div className="section-head"><div><p className="kicker">CONTENT & DATA</p><h2>System health</h2></div></div>
      <div className="health-row"><article><strong>{units.filter((unit) => unit.status === 'active').length}</strong><span>playable units</span></article><article><strong>{lexicalItems.length}</strong><span>lexical targets</span></article><article><strong>{signatures}+</strong><span>grammar signatures</span></article></div>
      <div className="teacher-actions"><button className="outline-button" onClick={exportBuiltIn}><FileJson /> Export content pack</button><button className="outline-button"><Database /> Cloud sync ready</button><button className="outline-button"><GraduationCap /> Account management</button><button className="outline-button"><LibraryBig /> Grammar library</button></div>
    </section>
  </div>
}
