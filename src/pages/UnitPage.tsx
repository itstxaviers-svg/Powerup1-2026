import { ArrowLeft, ArrowRight, BrainCircuit, Clock3, Gem, Hash, Headphones, Layers3, LockKeyhole, MessageCircle, Palette, ScanSearch, Shuffle, Sparkles, Wrench, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { grammarPoints, lexicalItems, units } from '../content/course'
import { getAllBattleProgress } from '../data/db'
import { loadPartSelection, savePartSelection } from '../data/partSelection'
import { isUnitGateOpen } from '../features/battle/engine'
import { partRoute } from '../domain/parts'
import type { TaskType, UnitId } from '../domain/types'

const modes: Array<{ type: TaskType; title: string; detail: string; icon: typeof Wrench; tone: string; art: number }> = [
  { type: 'repair', title: 'Repair', detail: 'Restore missing letters', icon: Wrench, tone: 'cyan', art: 1 },
  { type: 'unscramble', title: 'Unscramble', detail: 'Rebuild letters or word chunks', icon: Shuffle, tone: 'violet', art: 2 },
  { type: 'memory', title: 'Memory', detail: 'Scan, hide and recall', icon: BrainCircuit, tone: 'blue', art: 3 },
  { type: 'error-hunt', title: 'Error Hunt', detail: 'Correct a realistic mistake', icon: ScanSearch, tone: 'pink', art: 4 },
  { type: 'audio', title: 'Audio Code', detail: 'Hear the code and write it', icon: Headphones, tone: 'violet', art: 5 },
]

function ModeGrid({ unitId, selectedPartsRoute }: { unitId: UnitId; selectedPartsRoute: string }) {
  return <div className="mode-grid">{modes.map(({ type, title, detail, icon: Icon, tone, art }, index) => <Link to={`/train/${unitId}/${selectedPartsRoute}/mixed/${type}`} className={`mode-card mode-art-${art} mode-tone-${tone}`} key={type}>
    <span className="mode-number">{String(index + 1).padStart(2, '0')}</span><span className="mode-visual"><Icon /></span><div><strong>{title}</strong><small>{detail}</small></div>
  </Link>)}</div>
}

export function UnitPage() {
  const { unitId: routeUnitId = 'hello' } = useParams()
  const unitId: UnitId = /^unit-[1-9]$/.test(routeUnitId) ? routeUnitId as UnitId : 'hello'
  const unit = units.find((item) => item.id === unitId) ?? units[0]!
  const [selectedPartIds, setSelectedPartIds] = useState(() => loadPartSelection(unit.id, unit.parts))
  const [gateOpen, setGateOpen] = useState(unit.id !== 'unit-4' && unit.id !== 'unit-8')

  useEffect(() => { setSelectedPartIds(loadPartSelection(unit.id, unit.parts)) }, [unit.id, unit.parts])
  useEffect(() => { void getAllBattleProgress().then((records) => setGateOpen(isUnitGateOpen(unit.id, records))) }, [unit.id])

  const updateSelection = (next: string[]) => setSelectedPartIds(savePartSelection(unit.id, next, unit.parts))
  const togglePart = (partId: string) => {
    const next = selectedPartIds.includes(partId) ? selectedPartIds.filter((id) => id !== partId) : [...selectedPartIds, partId]
    if (next.length) updateSelection(next)
  }
  const selectedRoute = partRoute(selectedPartIds, unit.parts)
  const selected = useMemo(() => new Set(selectedPartIds), [selectedPartIds])
  const wordCount = lexicalItems.filter((item) => item.unitId === unit.id && item.kind === 'word' && selected.has(item.partId)).length
  const phraseCount = lexicalItems.filter((item) => item.unitId === unit.id && item.kind === 'phrase' && selected.has(item.partId)).length + grammarPoints.filter((item) => item.unitId === unit.id && selected.has(item.partId)).length
  const selectedLabel = selectedPartIds.length === unit.parts.length ? 'All Parts' : unit.parts.filter((part) => selected.has(part.id)).map((part) => part.title).join(' + ')

  if (unit.status !== 'active' || !gateOpen) return <div className="page unit-page"><Link to="/" className="back-link"><ArrowLeft size={17} /> Course map</Link><div className="locked-unit-message"><LockKeyhole /><p className="kicker">BLOCK {String(unit.order).padStart(2, '0')} / SEALED</p><h1>{unit.title}</h1><p>{unit.status === 'active' ? 'Pass the previous checkpoint to unlock this Unit.' : 'Coming soon'}</p></div></div>

  return <div className="page unit-page">
    <Link to="/" className="back-link"><ArrowLeft size={17} /> Course map</Link>
    <div className="unit-heading"><div><p className="kicker">BLOCK {String(unit.order).padStart(2, '0')} / ACTIVE</p><h1>{unit.title}</h1><p>{unit.id === 'hello' ? 'Stabilise the code for numbers, colours and first conversations.' : `Train the approved ${unit.title} words and patterns.`}</p></div><div className="unit-ring"><span className="ring-gem"><Gem /></span><strong>0%</strong><span>STABLE</span></div></div>

    <section className="part-selector" aria-labelledby="part-selector-title">
      <div className="section-head"><div><p className="kicker">CONTENT SIGNAL</p><h2 id="part-selector-title">Choose Parts</h2><p>Select one, several, or the complete {unit.title} code set.</p></div><span>{selectedLabel}</span></div>
      <div className="part-options">
        <button type="button" className={selectedPartIds.length === unit.parts.length ? 'selected' : ''} aria-pressed={selectedPartIds.length === unit.parts.length} onClick={() => updateSelection(unit.parts.map((part) => part.id))}><Layers3 /><span><strong>All Parts</strong><small>{wordCount + phraseCount} targets selected</small></span></button>
        {unit.parts.map((part) => {
          const Icon = part.id === 'numbers' ? Hash : part.id === 'colours' ? Palette : part.id === 'introductions' ? MessageCircle : Layers3
          const active = selected.has(part.id)
          return <button type="button" key={part.id} className={active ? 'selected' : ''} aria-pressed={active} onClick={() => togglePart(part.id)}><Icon /><span><strong>{part.title}</strong><small>{part.description}</small></span></button>
        })}
      </div>
    </section>

    <Link to={`/train/${unitId}/${selectedRoute}/mixed`} className="quick-card">
      <div className="quick-icon"><Zap size={24} fill="currentColor" /></div>
      <div><span>RECOMMENDED</span><h2>Quick training</h2><p><Clock3 size={15} /> {selectedLabel} · 8 challenges</p></div>
      <ArrowRight className="quick-arrow" />
      <span className="quick-orbit" aria-hidden="true"><Gem /><Sparkles /></span>
    </Link>

    <section className="training-category"><div className="section-head mode-heading"><div><p className="kicker">DECODING PROTOCOLS</p><h2>Choose a game mode</h2><p>Every mode works with words and approved grammar from your selected Parts.</p></div><span>5 MODES</span></div><ModeGrid unitId={unitId} selectedPartsRoute={selectedRoute} /></section>
  </div>
}
