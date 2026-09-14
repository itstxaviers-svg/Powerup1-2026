import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { bosses } from './bosses'
import type { BossId, BossState } from './types'

export function BossVisual({ bossId, state, reducedMotion = false }: { bossId: BossId; state: BossState; reducedMotion?: boolean }) {
  const boss = bosses[bossId]
  const [source, setSource] = useState(boss.assets[state])
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    setSource(boss.assets[state])
    setFallback(false)
  }, [boss, state])

  const handleError = () => {
    if (source !== boss.assets.base) setSource(boss.assets.base)
    else setFallback(true)
  }

  return <div className={`battle-boss boss-state-${state}${reducedMotion ? ' reduced' : ''}`} style={{ '--boss-accent': boss.accent } as React.CSSProperties}>
    <span className="boss-scan-ring" aria-hidden="true" />
    {!fallback ? <img src={source} alt={`${boss.name}, ${state.replace('-', ' ')}`} onError={handleError} draggable={false} /> : <div className="boss-art-fallback" role="img" aria-label={`${boss.name}, signal silhouette`}><ShieldAlert /><span>{boss.name.split(' ').map((word) => word[0]).join('')}</span></div>}
  </div>
}
