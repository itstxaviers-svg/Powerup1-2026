import { Activity, CheckCircle2, CircleDot, RadioTower } from 'lucide-react'
import { useEffect, useState } from 'react'
import { lexicalItems } from '../content/course'
import { getProgress } from '../data/db'
import type { TargetProgress } from '../domain/types'

export function ArchivePage() {
  const [progress, setProgress] = useState<TargetProgress[]>([])
  useEffect(() => { getProgress().then(setProgress) }, [])
  const attempted = progress.filter((item) => item.attempts > 0)
  const stable = progress.filter((item) => item.state === 'stable' || item.state === 'mastered')
  const unstable = progress.filter((item) => item.state === 'unstable')
  return <div className="page archive-page">
    <div className="page-title"><p className="kicker">PERSONAL SIGNAL LOG</p><h1>Code Archive</h1><p>Your recall grows stronger every time a code returns.</p></div>
    <div className="stat-grid">
      <article><RadioTower /><strong>{attempted.length}</strong><span>Discovered</span></article>
      <article><CheckCircle2 /><strong>{stable.length}</strong><span>Stable</span></article>
      <article><Activity /><strong>{unstable.length}</strong><span>Unstable</span></article>
    </div>
    <section className="archive-section"><div className="section-head"><div><p className="kicker">REVIEW QUEUE</p><h2>Unstable codes</h2></div></div>
      {unstable.length ? <div className="code-list">{unstable.map((item) => <article key={item.targetId}><CircleDot /><div><strong>{lexicalItems.find((word) => word.id === item.targetId)?.text ?? item.targetId}</strong><span>{item.correct} of {item.attempts} restored</span></div><em>{item.mastery}%</em></article>)}</div> : <div className="empty-state"><RadioTower /><h3>No unstable signals yet</h3><p>Complete a training session and your archive will start mapping recall.</p></div>}
    </section>
  </div>
}
