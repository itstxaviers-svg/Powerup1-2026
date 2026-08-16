import { ArrowRight, Gem, LockKeyhole, Orbit, Radio, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { units } from '../content/course'

export function HomePage() {
  return <div className="page home-page">
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow"><Radio size={15} /> ENGLISH DECODING SYSTEM</p>
        <h1>Decode English.<br /><span>Make every word stable.</span></h1>
        <p>Scan, repair and restore words you already know.</p>
      </div>
      <div className="hero-crystal" aria-hidden="true">
        <span className="crystal-halo halo-one" /><span className="crystal-halo halo-two" />
        <span className="crystal-core"><Gem /></span>
        <span className="orbit-dot dot-one"><Sparkles /></span><span className="orbit-dot dot-two"><Orbit /></span>
      </div>
      <span className="code-spirit" aria-hidden="true"><i className="spirit-fin left" /><i className="spirit-fin right" /><span className="spirit-body"><b className="spirit-face"><i /><i /></b><em /></span><small>CODE SPIRIT</small></span>
      <span className="drifting-letters" aria-hidden="true"><i>A</i><i>W</i><i>8</i><i>?</i></span>
    </section>
    <section className="section-head"><div><p className="kicker">COURSE MAP / 01</p><h2>Select a code block</h2></div><span>{units.filter((unit) => unit.status === 'active').length} ACTIVE</span></section>
    <div className="unit-grid">
      {units.map((unit, index) => unit.status === 'active' ? <motion.div key={unit.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .035 }}>
        <Link to={`/unit/${unit.id}`} className="unit-card active-unit">
          <span className={`unit-art active-art ${unit.id === 'unit-1' ? 'unit-one-art' : unit.id === 'unit-2' ? 'unit-two-art' : unit.id === 'unit-3' ? 'unit-three-art' : unit.id === 'unit-4' ? 'unit-four-art' : unit.id === 'unit-5' ? 'unit-five-art' : unit.id === 'unit-6' ? 'unit-six-art' : unit.id === 'unit-7' ? 'unit-seven-art' : unit.id === 'unit-8' ? 'unit-eight-art' : unit.id === 'unit-9' ? 'unit-nine-art' : ''}`} aria-hidden="true"><span className="mini-island" /><span className="unit-orb"><Gem /></span><i /><b /></span>
          <div className="unit-top"><span className="unit-index">{String(unit.order).padStart(2, '0')}</span><span className="active-tag"><i /> ACTIVE</span></div>
          <div className="unit-copy"><small>{unit.id === 'hello' ? 'FIRST CODES' : unit.id === 'unit-1' ? 'SCHOOL CODES' : unit.id === 'unit-2' ? 'ABOUT US' : unit.id === 'unit-3' ? 'FARM CODES' : unit.id === 'unit-4' ? 'FOOD CODES' : unit.id === 'unit-5' ? 'BIRTHDAY CODES' : unit.id === 'unit-6' ? 'DAY OUT CODES' : unit.id === 'unit-7' ? 'PLAY CODES' : unit.id === 'unit-8' ? 'HOME CODES' : 'HOLIDAY CODES'}</small><h3>{unit.title}</h3><p>{unit.id === 'hello' ? 'Numbers · Colours · Introductions' : unit.id === 'unit-1' ? 'School · Positions · Kind actions' : unit.id === 'unit-2' ? 'Family · Body · Senses' : unit.id === 'unit-3' ? 'Animals · Descriptions · Products' : unit.id === 'unit-4' ? 'Food · Requests · Recipes' : unit.id === 'unit-5' ? 'Toys · Ownership · Shapes' : unit.id === 'unit-6' ? 'Transport · Wild animals · Habitats' : unit.id === 'unit-7' ? 'Activities · Sports · Body care' : unit.id === 'unit-8' ? 'Rooms · Furniture · Positions' : 'Clothes · Beach · Nature'}</p></div>
          <div className="unit-action"><span>ENTER BLOCK</span><ArrowRight size={19} /></div>
        </Link>
      </motion.div> : <motion.article key={unit.id} className="unit-card locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * .035 }}>
        <span className={`unit-art locked-art art-${unit.order}`} aria-hidden="true"><span /><LockKeyhole /></span>
        <div className="unit-top"><span className="unit-index">0{unit.order}</span></div>
        <div className="unit-copy"><h3>{unit.title}</h3><p>Coming soon</p></div>
        <span className="soon-tag">SEALED</span>
      </motion.article>)}
    </div>
  </div>
}
