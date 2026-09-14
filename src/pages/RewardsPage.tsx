import { CheckCircle2, Gem, HeartPulse, Info, LockKeyhole, ShieldCheck, Sparkles, Star, Zap } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { grammarPoints, lexicalItems, units } from '../content/course'
import { rewardsAssets } from '../config/rewardsAssets'
import { getProgress, getRewardState, getStudentProfile } from '../data/db'
import { accessoryDefinitions, artifactDefinitions, daysSince, defaultRewardState, energyInLevel, rewardLevel, spiritStageForLevel, spiritStages, worldDefinitions, type RewardState } from '../domain/rewards'
import { taskTypes, type TargetProgress, type UnitId } from '../domain/types'
import { defaultStudentProfile, type StudentProfile } from '../domain/account'

type UnitReward = { unitId: UnitId; title: string; percent: number; mastered: boolean; attempted: number; total: number }

function unitRewards(progress: TargetProgress[]): UnitReward[] {
  const progressById = new Map(progress.map((item) => [item.targetId, item]))
  return units.map((unit) => {
    const ids = [...unit.vocabularyIds, ...unit.phraseIds, ...unit.grammarIds]
    const records = ids.map((id) => progressById.get(id)).filter((item): item is TargetProgress => Boolean(item))
    const attempted = records.filter((item) => item.attempts > 0).length
    const completedParts = unit.parts.filter((part) => {
      const partIds = [
        ...lexicalItems.filter((item) => item.unitId === unit.id && item.partId === part.id).map((item) => item.id),
        ...grammarPoints.filter((item) => item.unitId === unit.id && item.partId === part.id).map((item) => item.id),
      ]
      return partIds.length > 0 && partIds.every((id) => (progressById.get(id)?.attempts ?? 0) > 0)
    }).length
    const percent = unit.parts.length ? Math.round((completedParts / unit.parts.length) * 100) : ids.length ? Math.round((attempted / ids.length) * 100) : 0
    const mastered = ids.length > 0 && ids.every((id) => progressById.get(id)?.state === 'mastered')
    return { unitId: unit.id, title: unit.title, percent, mastered, attempted, total: ids.length }
  })
}

function artifactUnlocked(key: string, reward: RewardState, progress: TargetProgress[], masteredUnits: number) {
  const definition = artifactDefinitions.find((item) => item.key === key)!
  if (definition.taskType) return (reward.modeCounts[definition.taskType] ?? 0) >= definition.requirement
  if (key === 'masterKey') return taskTypes.filter((type) => (reward.modeCounts[type] ?? 0) > 0).length >= definition.requirement
  if (key === 'prismFragment') return progress.filter((item) => item.state === 'stable' || item.state === 'mastered').length >= definition.requirement
  return masteredUnits >= definition.requirement
}

export function RewardsPage() {
  const [progress, setProgress] = useState<TargetProgress[]>([])
  const [reward, setReward] = useState<RewardState>(defaultRewardState)
  const [profile, setProfile] = useState<StudentProfile>(defaultStudentProfile)
  const reduceMotion = useReducedMotion()
  useEffect(() => { Promise.all([getProgress(), getRewardState(), getStudentProfile()]).then(([nextProgress, nextReward, nextProfile]) => { setProgress(nextProgress); setReward(nextReward); setProfile(nextProfile) }) }, [])
  const crystals = useMemo(() => unitRewards(progress), [progress])
  const level = rewardLevel(reward.lifetimeEnergy)
  const levelEnergy = energyInLevel(reward.lifetimeEnergy)
  const stage = spiritStageForLevel(level)
  const restoredCount = crystals.filter((item) => item.percent === 100).length
  const masteredCount = crystals.filter((item) => item.mastered).length
  const inactiveDays = daysSince(reward.lastActivityAt)
  const currentCrystal = crystals.find((item) => item.percent < 100) ?? crystals.at(-1)!
  const activeWeek = reward.activeDays.filter((day) => Date.now() - new Date(`${day}T00:00:00`).getTime() < 7 * 86_400_000).length

  return <div className="rewards-page" style={{ '--rewards-bg': `url(${rewardsAssets.background})` } as React.CSSProperties}>
    <aside className="rewards-sidebar">
      <NavLink to="/" className="reward-brand"><span><Gem /></span><strong>WORD<span>//</span>CODE</strong><small>ENGLISH DECODING SYSTEM</small></NavLink>
      <nav aria-label="Rewards navigation">
        <NavLink to="/"><span>⌂</span>Home</NavLink><NavLink to="/"><span>◈</span>Course</NavLink><NavLink to="/archive"><span>▥</span>Progress</NavLink><NavLink className="active" to="/rewards"><span>✦</span>Rewards</NavLink><NavLink to="/account"><span>●</span>Account</NavLink><NavLink to="/settings"><span>⚙</span>Settings</NavLink>
      </nav>
      <div className="reward-student-card"><img src={rewardsAssets.spirit[profile.avatar]} alt="Code Spirit avatar" /><div><strong>{profile.displayName}</strong><span>Level {level}</span></div><small>{reward.lifetimeEnergy.toLocaleString('en-GB')} XP</small></div>
      <div className="rhythm-card"><strong>🔥 {activeWeek} SIGNAL DAYS</strong><span>{activeWeek ? 'Keep your rhythm!' : 'Start a training today.'}</span></div>
    </aside>

    <main className="rewards-workspace">
      <div className="rewards-left-stack">
        <section className="spirit-sanctum reward-glass">
        <header className="spirit-title"><p>CODE SPIRIT</p><h1>{stage.name}</h1><span><Gem /> LEVEL {level}</span></header>
        <div className="spirit-evolution" aria-label="Code Spirit evolution">
          {spiritStages.map((item) => <div className={level >= item.minimumLevel ? item.key === stage.key ? 'current' : 'unlocked' : 'locked'} key={item.key}>
            <span><img src={rewardsAssets.spirit[item.key]} alt="" />{level < item.minimumLevel && <LockKeyhole />}</span><small>{item.name}</small>
          </div>)}
        </div>
        <motion.div className={`spirit-hero stability-${Math.floor(reward.stability / 25)}`} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
          <i className="spirit-orbit orbit-a" /><i className="spirit-orbit orbit-b" /><img src={rewardsAssets.spirit[stage.key]} alt={`${stage.name} Code Spirit`} />
        </motion.div>
        <div className="accessory-stack" aria-label="Spirit accessories">
          {accessoryDefinitions.map((item) => { const unlocked = level >= item.minimumLevel; return <article className={unlocked ? 'unlocked' : 'locked'} key={item.key}>
            <span><img src={rewardsAssets.accessories[item.key]} alt="" />{!unlocked && <LockKeyhole />}</span><div><strong>{item.name}</strong><small>{unlocked ? 'Unlocked' : `Level ${item.minimumLevel}`}</small></div>
          </article> })}
        </div>
        <div className="energy-zone">
          <div className="energy-bar"><span><Zap fill="currentColor" /></span><div><i style={{ width: `${levelEnergy / 10}%` }} /></div><strong>{levelEnergy} / 1000 <small>ENERGY</small></strong></div>
          <p>{1000 - levelEnergy} Energy until next level <Info /></p>
        </div>
        </section>

        <section className="artifacts-panel reward-glass">
          <header><div><h2>✦ MY ARTIFACTS</h2><p>Every mode can reveal a different piece of the ancient code.</p></div><span>{artifactDefinitions.filter((item) => artifactUnlocked(item.key, reward, progress, masteredCount)).length} / {artifactDefinitions.length}</span></header>
          <div className="artifact-grid">{artifactDefinitions.map((artifact) => { const unlocked = artifactUnlocked(artifact.key, reward, progress, masteredCount); const count = artifact.taskType ? reward.modeCounts[artifact.taskType] ?? 0 : artifact.key === 'masterKey' ? taskTypes.filter((type) => (reward.modeCounts[type] ?? 0) > 0).length : artifact.key === 'prismFragment' ? progress.filter((item) => item.state === 'stable' || item.state === 'mastered').length : masteredCount; return <article className={`${unlocked ? 'unlocked' : 'locked'} rarity-${artifact.rarity.toLowerCase()}`} key={artifact.key}>
            <div><img src={rewardsAssets.artifacts[artifact.key]} alt="" />{!unlocked && <span><LockKeyhole /></span>}</div><h3>{artifact.name}</h3><p>{artifact.description}</p><footer><span>{[1,2,3,4,5].map((star) => <Star key={star} fill={star <= Math.min(5, Math.ceil(count / Math.max(1, artifact.requirement / 5))) ? 'currentColor' : 'none'} />)}</span><strong>{unlocked ? 'FOUND' : `${Math.min(count, artifact.requirement)} / ${artifact.requirement}`}</strong></footer>
          </article> })}</div>
        </section>
      </div>

      <div className="rewards-right-stack">
        <section className="crystal-panel reward-glass">
          <header><h2>✦ CRYSTAL CORES</h2><Info /></header>
          <div className="crystal-grid">{crystals.map((crystal, index) => <article className={crystal.percent === 100 ? crystal.mastered ? 'mastered' : 'restored' : crystal.percent > 0 ? 'current' : 'locked'} key={crystal.unitId}>
            <small>{crystal.title}</small><span><img src={rewardsAssets.accessories.crystalCore} alt="" style={{ filter: `hue-rotate(${index * 22}deg)` }} />{crystal.percent === 0 && <LockKeyhole />}</span>
            <strong>{crystal.percent === 100 ? <CheckCircle2 /> : `${crystal.percent}%`}</strong>
          </article>)}</div>
          <div className="current-crystal"><span>Current: {currentCrystal.title} — {currentCrystal.percent}%</span><div><i style={{ width: `${currentCrystal.percent}%` }} /></div></div>
        </section>

        <section className="world-panel reward-glass">
          <header><h2>WORLD RESTORED</h2><strong>{restoredCount} / 10</strong></header>
          <div className="world-grid">{worldDefinitions.map((world) => { const state = crystals.find((item) => item.unitId === world.unitId)!; const unlocked = state.percent === 100; return <article className={unlocked ? state.mastered ? 'mastered' : 'unlocked' : 'locked'} key={world.key}>
            <img src={rewardsAssets.worlds[world.key]} alt="" /><span>{world.name}</span>{unlocked ? <CheckCircle2 /> : <LockKeyhole />}
          </article> })}</div>
        </section>

        <section className={`signal-panel reward-glass ${reward.stability < 100 ? 'decay' : ''}`}>
          <span className="signal-core"><HeartPulse /></span><div><strong>{reward.stability}%</strong><span>{reward.stability < 100 ? 'CODE DECAY' : inactiveDays === 0 ? 'Active today' : 'Spirit signal stable'}</span></div>
          <p>{reward.stability < 100 ? 'Complete one training to restore +30 Stability.' : 'Your Code Spirit is vibrant. Keep learning to unlock new powers.'}</p><Sparkles />
        </section>

        <section className="reward-message reward-glass"><img src={rewardsAssets.spirit.sprite} alt="Code Spirit" /><div><strong>Study, play, grow!</strong><p>Every lesson gives your Spirit energy. Evolve, collect and restore the world.</p></div><ShieldCheck /></section>
      </div>
    </main>
  </div>
}
