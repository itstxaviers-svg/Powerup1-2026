import type { TaskType, UnitId } from './types'
import type { AccessoryAssetKey, ArtifactAssetKey, SpiritAssetKey, WorldAssetKey } from '../config/rewardsAssets'

export interface RewardState {
  id: 'current'
  lifetimeEnergy: number
  bonusEnergy: number
  stability: number
  lastActivityAt: string | null
  activeDays: string[]
  modeCounts: Partial<Record<TaskType, number>>
  unlockedAccessories: AccessoryAssetKey[]
}

export interface TrainingSessionRecord {
  id: string
  unitId: UnitId
  completedAt: string
  challengeCount: number
  correctCount: number
  energyEarned: number
}

export interface SpiritStage {
  key: SpiritAssetKey
  name: string
  minimumLevel: number
}

export interface RewardDefinition {
  key: ArtifactAssetKey
  name: string
  taskType?: TaskType
  requirement: number
  description: string
  rarity: 'Core' | 'Rare' | 'Epic'
}

export interface WorldDefinition {
  unitId: UnitId
  key: WorldAssetKey
  name: string
}

export const defaultRewardState: RewardState = {
  id: 'current', lifetimeEnergy: 0, bonusEnergy: 0, stability: 100, lastActivityAt: null,
  activeDays: [], modeCounts: {}, unlockedAccessories: [],
}

export const spiritStages: SpiritStage[] = [
  { key: 'spark', name: 'Spark', minimumLevel: 0 },
  { key: 'sprite', name: 'Sprite', minimumLevel: 2 },
  { key: 'spirit', name: 'Spirit', minimumLevel: 3 },
  { key: 'guardian', name: 'Guardian', minimumLevel: 4 },
  { key: 'master', name: 'Master Spirit', minimumLevel: 7 },
]

export const accessoryDefinitions: Array<{ key: AccessoryAssetKey; name: string; minimumLevel: number }> = [
  { key: 'crystalCore', name: 'Crystal Core', minimumLevel: 2 },
  { key: 'neonWings', name: 'Neon Wings', minimumLevel: 2 },
  { key: 'starAura', name: 'Star Aura', minimumLevel: 3 },
  { key: 'decoderHalo', name: 'Decoder Halo', minimumLevel: 5 },
  { key: 'prismTrail', name: 'Prism Trail', minimumLevel: 7 },
]

export const artifactDefinitions: RewardDefinition[] = [
  { key: 'memoryCrystal', name: 'Memory Crystal', taskType: 'memory', requirement: 3, description: 'Complete memory codes.', rarity: 'Core' },
  { key: 'audioOrb', name: 'Audio Orb', taskType: 'audio', requirement: 3, description: 'Decode audio signals.', rarity: 'Core' },
  { key: 'repairGear', name: 'Repair Gear', taskType: 'repair', requirement: 3, description: 'Restore broken codes.', rarity: 'Core' },
  { key: 'decoderLens', name: 'Decoder Lens', taskType: 'error-hunt', requirement: 3, description: 'Find unstable patterns.', rarity: 'Rare' },
  { key: 'sentenceCore', name: 'Sentence Core', taskType: 'sentence-build', requirement: 3, description: 'Rebuild full sentences.', rarity: 'Rare' },
  { key: 'masterKey', name: 'Master Key', requirement: 6, description: 'Use six decoding modes.', rarity: 'Epic' },
  { key: 'prismFragment', name: 'Prism Fragment', requirement: 25, description: 'Stabilise 25 codes.', rarity: 'Rare' },
  { key: 'ancientCode', name: 'Ancient Code', requirement: 1, description: 'Master a complete unit.', rarity: 'Epic' },
]

export const worldDefinitions: WorldDefinition[] = [
  { unitId: 'hello', key: 'gateway', name: 'Gateway' },
  { unitId: 'unit-1', key: 'crystalAcademy', name: 'Crystal Academy' },
  { unitId: 'unit-2', key: 'mirrorGarden', name: 'Mirror Garden' },
  { unitId: 'unit-3', key: 'skyFarm', name: 'Sky Farm' },
  { unitId: 'unit-4', key: 'floatingCafe', name: 'Floating Café' },
  { unitId: 'unit-5', key: 'starlightLibrary', name: 'Starlight Library' },
  { unitId: 'unit-6', key: 'sunPyramidOasis', name: 'Sun Pyramid Oasis' },
  { unitId: 'unit-7', key: 'cosmicHarbor', name: 'Cosmic Harbor' },
  { unitId: 'unit-8', key: 'tropicalCodingCove', name: 'Tropical Coding Cove' },
  { unitId: 'unit-9', key: 'auroraPeaks', name: 'Aurora Peaks' },
]

export function rewardLevel(lifetimeEnergy: number) { return Math.max(0, Math.floor(lifetimeEnergy / 1000)) }
export function energyInLevel(lifetimeEnergy: number) { return lifetimeEnergy % 1000 }

export function spiritStageForLevel(level: number) {
  return [...spiritStages].reverse().find((stage) => level >= stage.minimumLevel) ?? spiritStages[0]!
}

export function daysSince(value: string | null, now = new Date()) {
  if (!value) return 0
  return Math.max(0, Math.floor((now.getTime() - new Date(value).getTime()) / 86_400_000))
}

export function effectiveStability(state: RewardState, now = new Date()) {
  const inactiveDays = daysSince(state.lastActivityAt, now)
  if (inactiveDays < 3) return state.stability
  return Math.max(20, state.stability - (inactiveDays - 2) * 10)
}
