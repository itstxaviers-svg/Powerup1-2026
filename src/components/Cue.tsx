import { CircleUserRound, Hash, MessageCircle } from 'lucide-react'
import type { CueDefinition } from '../domain/types'

export function Cue({ cue }: { cue?: CueDefinition }) {
  if (!cue) return <div className="semantic-cue"><MessageCircle size={38} /><span>Meaning signal</span></div>
  if (cue.type === 'colour') return <div className="colour-cue" aria-label={cue.label}><span style={{ background: cue.value }} /><small>COLOUR SIGNAL</small></div>
  if (cue.type === 'number') return <div className="number-cue" aria-label={cue.label}><Hash size={22} /><strong>{cue.value}</strong></div>
  if (cue.type === 'icon') return <div className="semantic-cue"><CircleUserRound size={40} /><span>{cue.label}</span></div>
  return <div className="semantic-cue"><MessageCircle size={38} /><span>{cue.label ?? cue.value}</span></div>
}
