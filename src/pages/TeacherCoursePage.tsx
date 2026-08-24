import { BookOpenCheck, LockKeyhole } from 'lucide-react'
import { units } from '../content/course'

export function TeacherCoursePage() {
  return <div className="page teacher-page teacher-course-page">
    <div className="page-title"><p className="kicker">TEACHER VIEW / READ ONLY</p><h1>Course map</h1><p>Review the course structure without leaving the protected teacher area.</p></div>
    <section className="teacher-notice"><BookOpenCheck /><div><strong>You are still in teacher mode</strong><span>This page is a course preview. Student learning sessions and student accounts stay separate.</span></div></section>
    <section className="teacher-data-card teacher-course-card"><header><div><p className="kicker">COURSE BLOCKS</p><h2>WORD//CODE curriculum</h2></div></header><div className="teacher-course-list">{units.map((unit) => <article key={unit.id}><span>{unit.order}</span><div><strong>{unit.title}</strong><small>{unit.vocabularyIds.length} vocabulary targets · {unit.phraseIds.length} phrases · {unit.grammarIds.length} grammar references</small></div><em>{unit.status === 'active' ? 'Available' : 'Coming soon'}</em>{unit.status === 'active' ? <BookOpenCheck aria-label="Available course block" /> : <LockKeyhole aria-label="Coming soon course block" />}</article>)}</div></section>
  </div>
}
