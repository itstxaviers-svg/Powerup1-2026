import type { CourseUnit, LexicalItem, TargetProgress, UnitId } from '../../domain/types'
import type { BattleCheckpointConfig, BattleFightConfig, BattleProgressRecord, BattleQuestion } from './types'

export interface BattleDiagnostics {
  eligibleWords: number
  excludedHelloItems: number
  duplicateWords: string[]
  missingPromptItems: string[]
  invalidUnitItems: string[]
}

function hash(value: string) {
  let result = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

export function seededShuffle<T>(items: readonly T[], seed: string) {
  const result = [...items]
  let state = hash(seed) || 1
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    const swapIndex = state % (index + 1)
    const current = result[index]!
    result[index] = result[swapIndex]!
    result[swapIndex] = current
  }
  return result
}

function unitNumber(unitId: UnitId) {
  if (unitId === 'hello') return 0
  const parsed = Number(unitId.slice(5))
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 9 ? parsed : null
}

function canUseImage(item: LexicalItem) {
  const image = item.battleImage ?? item.imageAsset
  const mode = item.battlePrompt ?? (item.imagePromptEligible ? 'either' : 'audio')
  return (mode === 'image' || mode === 'either') && Boolean(image)
}

function canUseAudio(item: LexicalItem, speechAvailable: boolean) {
  const mode = item.battlePrompt ?? (item.imagePromptEligible ? 'either' : 'audio')
  return mode !== 'image' && (Boolean(item.audioSrc) || speechAvailable)
}

function hasBattlePrompt(item: LexicalItem, speechAvailable: boolean) {
  const mode = item.battlePrompt ?? (item.imagePromptEligible ? 'either' : 'audio')
  if (mode === 'image') return canUseImage(item)
  if (mode === 'audio') return canUseAudio(item, speechAvailable)
  return canUseImage(item) || canUseAudio(item, speechAvailable)
}

export function battleDiagnostics(items: readonly LexicalItem[], maximumUnit = 9, speechAvailable = true): BattleDiagnostics {
  const seen = new Map<string, string>()
  const duplicateWords = new Set<string>()
  const missingPromptItems: string[] = []
  const invalidUnitItems: string[] = []
  let excludedHelloItems = 0
  let eligibleWords = 0

  for (const item of items) {
    if (!item.enabled || item.kind !== 'word') continue
    const number = unitNumber(item.unitId)
    if (number === 0) { excludedHelloItems += 1; continue }
    if (number === null) { invalidUnitItems.push(item.id); continue }
    if (number > maximumUnit) continue
    if (!hasBattlePrompt(item, speechAvailable)) { missingPromptItems.push(item.id); continue }
    const canonical = item.text.trim().toLocaleLowerCase('en-GB')
    if (!canonical) { missingPromptItems.push(item.id); continue }
    if (seen.has(canonical)) { duplicateWords.add(canonical); continue }
    seen.set(canonical, item.id)
    eligibleWords += 1
  }

  return {
    eligibleWords,
    excludedHelloItems,
    duplicateWords: [...duplicateWords].sort(),
    missingPromptItems: missingPromptItems.sort(),
    invalidUnitItems: invalidUnitItems.sort(),
  }
}

export function getEligibleBattleWords(items: readonly LexicalItem[], unitRange: readonly [number, number], speechAvailable = true) {
  const unique = new Set<string>()
  return items.filter((item) => {
    const number = unitNumber(item.unitId)
    if (!item.enabled || item.kind !== 'word' || number === null || number < unitRange[0] || number > unitRange[1]) return false
    if (!hasBattlePrompt(item, speechAvailable)) return false
    const canonical = item.text.trim().toLocaleLowerCase('en-GB')
    if (!canonical || unique.has(canonical)) return false
    unique.add(canonical)
    return true
  })
}

export function emptyBattleProgress(checkpointId: BattleProgressRecord['id']): BattleProgressRecord {
  return {
    id: checkpointId,
    allocations: {},
    completedFightIds: [],
    bestAccuracy: {},
    lastIncorrectIds: {},
    introSeenFightIds: [],
    activated: false,
    courseCompleted: false,
    updatedAt: new Date(0).toISOString(),
  }
}

export function normaliseBattleProgress(value: BattleProgressRecord): BattleProgressRecord {
  return {
    ...emptyBattleProgress(value.id),
    ...value,
    allocations: value.allocations && typeof value.allocations === 'object' ? value.allocations : {},
    completedFightIds: Array.isArray(value.completedFightIds) ? [...new Set(value.completedFightIds)] : [],
    bestAccuracy: value.bestAccuracy && typeof value.bestAccuracy === 'object' ? value.bestAccuracy : {},
    lastIncorrectIds: value.lastIncorrectIds && typeof value.lastIncorrectIds === 'object' ? value.lastIncorrectIds : {},
    introSeenFightIds: Array.isArray(value.introSeenFightIds) ? [...new Set(value.introSeenFightIds)] : [],
    activated: value.activated ?? Object.keys(value.allocations ?? {}).length > 0,
    courseCompleted: value.courseCompleted ?? false,
  }
}

export function ensureCheckpointAllocations(
  checkpoint: BattleCheckpointConfig,
  existing: BattleProgressRecord | undefined,
  items: readonly LexicalItem[],
  seed: string,
  speechAvailable = true,
) {
  const record = existing ? normaliseBattleProgress(existing) : emptyBattleProgress(checkpoint.id)
  if (checkpoint.fights.every((fight) => Array.isArray(record.allocations[fight.id]))) return record

  const firstFight = checkpoint.fights[0]
  if (!firstFight) return record
  const pool = seededShuffle(getEligibleBattleWords(items, firstFight.unitRange, speechAvailable), `${checkpoint.id}:${seed}`)
  const allocationSize = Math.ceil(pool.length * firstFight.poolFraction)
  const allocations = { ...record.allocations }
  checkpoint.fights.forEach((fight, fightIndex) => {
    if (!allocations[fight.id]) allocations[fight.id] = pool.slice(fightIndex * allocationSize, (fightIndex + 1) * allocationSize).map((item) => item.id)
  })
  return { ...record, allocations, activated: true, updatedAt: new Date().toISOString() }
}

export function buildBattleQuestions(
  items: readonly LexicalItem[],
  allocationIds: readonly string[],
  seed: string,
  speechAvailable = true,
) {
  const byId = new Map(items.map((item) => [item.id, item]))
  const selected = allocationIds.flatMap((id) => byId.get(id) ?? [])
  const mandatoryImages = selected.filter((item) => item.battlePrompt === 'image' && canUseImage(item))
  const flexibleImages = seededShuffle(selected.filter((item) => (item.battlePrompt === 'either' || (!item.battlePrompt && item.imagePromptEligible)) && canUseImage(item)), `${seed}:images`)
  const flexibleTarget = Math.max(0, Math.min(flexibleImages.length, Math.ceil(selected.length / 2) - mandatoryImages.length))
  const selectedImages = new Set([...mandatoryImages, ...flexibleImages.slice(0, flexibleTarget)].map((item) => item.id))
  const questions: BattleQuestion[] = selected.flatMap((item, index) => {
    const audioUsable = canUseAudio(item, speechAvailable)
    const useImage = selectedImages.has(item.id) || (!audioUsable && canUseImage(item))
    if (!useImage && !audioUsable) return []
    return [{
      id: `${seed}:${item.id}:${index}`,
      vocabularyId: item.id,
      answer: item.text,
      acceptedAnswers: [...new Set([item.text, ...(item.battleAcceptedAnswers ?? item.acceptedAnswers)])],
      promptType: useImage ? 'image' as const : 'audio' as const,
      audioSrc: item.audioSrc,
      imageSrc: useImage ? item.battleImage ?? item.imageAsset : undefined,
    }]
  })
  return seededShuffle(questions, `${seed}:order`)
}

export function accuracyPassed(correct: number, total: number, requiredAccuracy = .85) {
  return total > 0 && correct / total >= requiredAccuracy
}

export function canResolveQuestion(phase: string) {
  return phase === 'active'
}

export function recordBattleResult(record: BattleProgressRecord, fight: BattleFightConfig, correct: number, total: number, incorrectIds: string[]) {
  const accuracy = total > 0 ? correct / total : 0
  const passed = accuracyPassed(correct, total, fight.requiredAccuracy)
  return {
    ...record,
    pendingPurificationFightId: passed ? fight.id : record.pendingPurificationFightId,
    bestAccuracy: { ...record.bestAccuracy, [fight.id]: Math.max(record.bestAccuracy[fight.id] ?? 0, accuracy) },
    lastIncorrectIds: { ...record.lastIncorrectIds, [fight.id]: [...incorrectIds] },
    updatedAt: new Date().toISOString(),
  }
}

export function completePurification(record: BattleProgressRecord, fight: BattleFightConfig) {
  return {
    ...record,
    completedFightIds: Array.from(new Set([...record.completedFightIds, fight.id])),
    pendingPurificationFightId: record.pendingPurificationFightId === fight.id ? undefined : record.pendingPurificationFightId,
    courseCompleted: record.courseCompleted || Boolean(fight.unlocksCourseCompletion),
    updatedAt: new Date().toISOString(),
  }
}

export function isFightUnlocked(unitComplete: boolean, record: BattleProgressRecord | undefined, fight: BattleFightConfig) {
  if (!unitComplete) return false
  return !fight.previousFightId || Boolean(record?.completedFightIds?.includes(fight.previousFightId))
}

export function isCheckpointComplete(checkpoint: BattleCheckpointConfig, record: BattleProgressRecord | undefined) {
  return checkpoint.fights.every((fight) => record?.completedFightIds?.includes(fight.id))
}

export function isUnitGateOpen(unitId: UnitId, records: readonly BattleProgressRecord[]) {
  if (unitId === 'unit-4') return records.some((record) => record.id === 'checkpoint-03' && record.completedFightIds?.includes('checkpoint-03'))
  if (unitId === 'unit-8') return records.some((record) => record.id === 'checkpoint-07' && record.completedFightIds?.includes('checkpoint-07-b'))
  return true
}

export function isUnitComplete(unit: CourseUnit | undefined, progress: readonly TargetProgress[]) {
  if (!unit || unit.status !== 'active') return false
  const targets = [...unit.vocabularyIds, ...unit.phraseIds, ...unit.grammarIds]
  if (targets.length === 0) return false
  const progressById = new Map(progress.map((item) => [item.targetId, item]))
  return targets.every((id) => {
    const state = progressById.get(id)?.state
    return state === 'stable' || state === 'mastered'
  })
}
