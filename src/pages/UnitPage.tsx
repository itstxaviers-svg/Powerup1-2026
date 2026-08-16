import { ArrowLeft, ArrowRight, AudioLines, Braces, BrainCircuit, Clock3, Gem, Headphones, HeartHandshake, KeyRound, Layers3, LibraryBig, ListRestart, MapPinned, MessageSquareText, Palette, ScanSearch, School, Shuffle, Sparkles, SpellCheck2, Wrench, Zap } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { lexicalItems, unit1Groups, unit2Groups, unit3Groups, unit4Groups, unit5Groups, unit6Groups, unit7Groups, unit8Groups, unit9Groups } from '../content/course'
import type { UnitId } from '../domain/types'

const paths = [
  { id: 'words', title: 'Words', detail: 'Numbers + colours', icon: Palette, stat: '21 codes' },
  { id: 'phrases', title: 'Phrases', detail: 'Greetings + introductions', icon: Braces, stat: '11 patterns' },
  { id: 'mixed', title: 'Mixed Decode', detail: 'Adaptive recall session', icon: Layers3, stat: 'Fresh mix' },
]

const wordModes = [
  { type: 'repair', title: 'Repair', detail: 'Restore missing letters', icon: Wrench, tone: 'cyan' },
  { type: 'unscramble', title: 'Unscramble', detail: 'Rebuild the letter order', icon: Shuffle, tone: 'violet' },
  { type: 'memory', title: 'Memory', detail: 'Scan, hide and recall', icon: BrainCircuit, tone: 'blue' },
  { type: 'error-hunt', title: 'Error Hunt', detail: 'Find and repair the unstable code', icon: ScanSearch, tone: 'pink' },
  { type: 'audio', title: 'Audio Code', detail: 'Hear and spell', icon: Headphones, tone: 'violet' },
  { type: 'final-decode', title: 'Final Decode', detail: 'See the clue. Spell the word.', icon: KeyRound, tone: 'gold' },
]

const languageModes = [
  { type: 'sentence-build', title: 'Sentence Build', detail: 'Put every word in place', icon: ListRestart, tone: 'cyan' },
  { type: 'dialogue-gap', title: 'Dialogue Gap', detail: 'Complete the exchange', icon: MessageSquareText, tone: 'blue' },
  { type: 'punctuation', title: 'Punctuation', detail: 'Stabilise writing marks', icon: SpellCheck2, tone: 'pink' },
]

function ModeGrid({ modes, start, category, unitId }: { modes: typeof wordModes; start: number; category: 'words' | 'phrases'; unitId: UnitId }) {
  return <div className="mode-grid">{modes.map(({ type, title, detail, icon: Icon, tone }, index) => <Link to={`/train/${unitId}/all/${category}/${type}`} className={`mode-card mode-art-${start + index} mode-tone-${tone}`} key={title}>
    <span className="mode-number">{String(start + index).padStart(2, '0')}</span><span className="mode-visual"><Icon /></span><div><strong>{title}</strong><small>{detail}</small></div>
  </Link>)}</div>
}

export function UnitPage() {
  const { unitId: routeUnitId = 'hello' } = useParams()
  const unitId: UnitId = routeUnitId === 'unit-1' || routeUnitId === 'unit-2' || routeUnitId === 'unit-3' || routeUnitId === 'unit-4' || routeUnitId === 'unit-5' || routeUnitId === 'unit-6' || routeUnitId === 'unit-7' || routeUnitId === 'unit-8' || routeUnitId === 'unit-9' ? routeUnitId : 'hello'
  const isHello = unitId === 'hello'
  const isUnitOne = unitId === 'unit-1'
  const groups = isUnitOne ? unit1Groups : unitId === 'unit-2' ? unit2Groups : unitId === 'unit-3' ? unit3Groups : unitId === 'unit-4' ? unit4Groups : unitId === 'unit-5' ? unit5Groups : unitId === 'unit-6' ? unit6Groups : unitId === 'unit-7' ? unit7Groups : unitId === 'unit-8' ? unit8Groups : unit9Groups
  const groupIcons = [School, MapPinned, LibraryBig, HeartHandshake]
  const unitNumber = isHello ? 0 : Number(unitId.slice(5))
  const unitTitle = isHello ? 'Hello!' : `Unit ${unitNumber}`
  const unitDescription = isHello ? 'Stabilise the code for numbers, colours and first conversations.' : isUnitOne ? 'Decode school words, positions, classroom questions and kind actions.' : unitId === 'unit-2' ? 'Decode family words, body vocabulary and the five senses.' : unitId === 'unit-3' ? 'Decode farm animals, describing words, products and literature vocabulary.' : unitId === 'unit-4' ? 'Decode food words, polite requests, recipes and picnic vocabulary.' : unitId === 'unit-5' ? 'Decode toys, ownership words, shapes and birthday literature.' : unitId === 'unit-6' ? 'Decode transport, places, wild animals, habitats and zoo literature.' : unitId === 'unit-7' ? 'Decode activities, sports, movement, body care and literature vocabulary.' : unitId === 'unit-8' ? 'Decode rooms, furniture and position words around the home.' : 'Decode clothes, holiday actions, beach vocabulary and natural sights.'

  return <div className="page unit-page">
    <Link to="/" className="back-link"><ArrowLeft size={17} /> Course map</Link>
    <div className="unit-heading"><div><p className="kicker">BLOCK {String(unitNumber).padStart(2, '0')} / ACTIVE</p><h1>{unitTitle}</h1><p>{unitDescription}</p></div><div className="unit-ring"><span className="ring-gem"><Gem /></span><strong>0%</strong><span>STABLE</span></div></div>
    <Link to={`/train/${unitId}/all/mixed`} className="quick-card">
      <div className="quick-icon"><Zap size={24} fill="currentColor" /></div>
      <div><span>RECOMMENDED</span><h2>{isHello ? 'Quick training' : `Mix all ${groups.length} parts`}</h2><p><Clock3 size={15} /> 8 challenges · about 5 min</p></div>
      <ArrowRight className="quick-arrow" />
      <span className="quick-orbit" aria-hidden="true"><Gem /><Sparkles /></span>
    </Link>
    {!isHello ? <>
      <div className="section-head"><div><p className="kicker">{unitTitle.toUpperCase()} / {groups.length} PARTS</p><h2>Choose a learning group</h2></div><span>MIX READY</span></div>
      <div className="learning-group-grid">{groups.map((group, index) => {
        const Icon = groupIcons[index]!
        const words = lexicalItems.filter((item) => item.unitId === 'unit-1' && item.tags.includes(group.id)).map((item) => item.text)
        return <Link to={`/train/${unitId}/${group.id}/mixed`} className={`learning-group group-${index + 1}`} key={group.id}>
          <header><span><Icon /></span><div><small>PART {index + 1}</small><h3>{group.title}</h3><p>{group.subtitle}</p></div></header>
          <div className="group-word-list">{words.map((word) => <span key={word}>{word}</span>)}</div>
          {group.id === 'school-vocabulary-2' && <div className="group-patterns"><span>What is this? → It is a window.</span><span>What are these? → They are windows.</span></div>}
          {group.id === 'food-vocabulary-2' && <div className="group-patterns"><span>Can I have …, please?</span><span>Would you like …?</span></div>}
          <footer>TRAIN THIS PART <ArrowRight size={17} /></footer>
        </Link>
      })}</div>
    </> : <>
      <div className="section-head"><div><p className="kicker">CHOOSE A SIGNAL</p><h2>Training paths</h2></div></div>
      <div className="path-grid">{paths.map(({ id, title, detail, icon: Icon, stat }) => <Link key={id} to={`/train/hello/all/${id}`} className="path-card">
        <span className="path-icon"><Icon size={22} /></span><div><h3>{title}</h3><p>{detail}</p><small>{stat}</small></div><ArrowRight size={18} />
      </Link>)}</div>
    </>}
    <section className="training-category"><div className="section-head mode-heading"><div><p className="kicker">DECODING PROTOCOLS / A</p><h2>Word Training</h2><p>Build accurate spelling, then recall each word independently.</p></div><span>6 MODULES</span></div><ModeGrid modes={wordModes} start={1} category="words" unitId={unitId} /></section>
    <section className="training-category language-category"><div className="section-head mode-heading"><div><p className="kicker">DECODING PROTOCOLS / B</p><h2>Language Training</h2><p>Restore approved phrases, dialogue and writing marks.</p></div><span>3 MODULES</span></div><ModeGrid modes={languageModes} start={7} category="phrases" unitId={unitId} /></section>
    <div className="audio-note"><AudioLines size={20} /><div><strong>Audio codes are ready</strong><span>Replay is always free. No time pressure.</span></div></div>
  </div>
}
