import type { UnitId } from '../../domain/types'

export type BattleCheckpointId = 'checkpoint-03' | 'checkpoint-07' | 'checkpoint-09'
export type BattleFightId = 'checkpoint-03' | 'checkpoint-07-a' | 'checkpoint-07-b' | 'checkpoint-09-a' | 'checkpoint-09-b'
export type BossId = 'glitch-kitsune' | 'nullweaver' | 'aether-golem' | 'signal-serpent' | 'corrupted-archivist'
export type BattlePromptType = 'audio' | 'image'
export type BossState = 'base' | 'idle' | 'quick-attack' | 'heavy-attack' | 'block' | 'counter' | 'hit' | 'ultimate' | 'victory' | 'defeat'
export type QuestionPhase = 'loading' | 'presenting' | 'active' | 'submitted' | 'resolved' | 'transitioning'
export type BattlePhase = 'intro' | 'ready' | 'question' | 'feedback' | 'results' | 'passed' | 'failed'

export interface BattleFightConfig {
  id: BattleFightId
  checkpointId: BattleCheckpointId
  label: string
  fightIndex: number
  bossId: BossId
  unitRange: readonly [number, number]
  poolFraction: number
  timeLimitSeconds: number
  requiredAccuracy: number
  maxMistakes: number
  previousFightId?: BattleFightId
  unlocksUnit?: UnitId
  unlocksCourseCompletion?: boolean
}

export interface BattleCheckpointConfig {
  id: BattleCheckpointId
  afterUnit: UnitId
  prerequisiteLabel: string
  requiresFightId?: BattleFightId
  fights: readonly BattleFightConfig[]
}

export interface BattleQuestion {
  id: string
  vocabularyId: string
  answer: string
  acceptedAnswers: string[]
  promptType: BattlePromptType
  audioSrc?: string
  imageSrc?: string
}

export interface BattleProgressRecord {
  id: BattleCheckpointId
  allocations: Partial<Record<BattleFightId, string[]>>
  completedFightIds: BattleFightId[]
  bestAccuracy: Partial<Record<BattleFightId, number>>
  lastIncorrectIds: Partial<Record<BattleFightId, string[]>>
  introSeenFightIds: BattleFightId[]
  activated: boolean
  pendingPurificationFightId?: BattleFightId
  courseCompleted: boolean
  updatedAt: string
}

export interface BossDefinition {
  id: BossId
  name: string
  accent: string
  corruptedLine: string
  thankYouLine: string
  assets: Record<BossState, string>
}
