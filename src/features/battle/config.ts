import type { BattleCheckpointConfig, BattleFightConfig } from './types'

export const battleCheckpoints: readonly BattleCheckpointConfig[] = [
  {
    id: 'checkpoint-03', afterUnit: 'unit-3', prerequisiteLabel: 'Hello! and Units 1–3', fights: [
      { id: 'checkpoint-03', checkpointId: 'checkpoint-03', label: 'CHECKPOINT 03', fightIndex: 1, bossId: 'glitch-kitsune', unitRange: [1, 3], poolFraction: 1 / 3, timeLimitSeconds: 10, requiredAccuracy: .85, maxMistakes: 2, unlocksUnit: 'unit-4' },
    ],
  },
  {
    id: 'checkpoint-07', afterUnit: 'unit-7', prerequisiteLabel: 'Units 4–7', requiresFightId: 'checkpoint-03', fights: [
      { id: 'checkpoint-07-a', checkpointId: 'checkpoint-07', label: 'CHECKPOINT 07-A', fightIndex: 1, bossId: 'nullweaver', unitRange: [1, 7], poolFraction: 1 / 3, timeLimitSeconds: 8, requiredAccuracy: .85, maxMistakes: 3 },
      { id: 'checkpoint-07-b', checkpointId: 'checkpoint-07', label: 'CHECKPOINT 07-B', fightIndex: 2, bossId: 'aether-golem', unitRange: [1, 7], poolFraction: 1 / 3, timeLimitSeconds: 8, requiredAccuracy: .85, maxMistakes: 3, previousFightId: 'checkpoint-07-a', unlocksUnit: 'unit-8' },
    ],
  },
  {
    id: 'checkpoint-09', afterUnit: 'unit-9', prerequisiteLabel: 'Units 8–9', requiresFightId: 'checkpoint-07-b', fights: [
      { id: 'checkpoint-09-a', checkpointId: 'checkpoint-09', label: 'SUPER BATTLE 09-A', fightIndex: 1, bossId: 'signal-serpent', unitRange: [1, 9], poolFraction: 1 / 3, timeLimitSeconds: 6, requiredAccuracy: .85, maxMistakes: 3 },
      { id: 'checkpoint-09-b', checkpointId: 'checkpoint-09', label: 'FINAL SUPER BATTLE', fightIndex: 2, bossId: 'corrupted-archivist', unitRange: [1, 9], poolFraction: 1 / 3, timeLimitSeconds: 6, requiredAccuracy: .85, maxMistakes: 3, previousFightId: 'checkpoint-09-a', unlocksCourseCompletion: true },
    ],
  },
] as const

export const battleFights = battleCheckpoints.flatMap((checkpoint) => checkpoint.fights) as readonly BattleFightConfig[]

export function getBattleFight(fightId: string | undefined) {
  return battleFights.find((fight) => fight.id === fightId)
}

export function getBattleCheckpoint(checkpointId: string) {
  return battleCheckpoints.find((checkpoint) => checkpoint.id === checkpointId)
}
