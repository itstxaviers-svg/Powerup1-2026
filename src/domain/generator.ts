import { grammarPoints, lexicalItems } from '../content/course'
import type { GrammarPoint, LexicalItem, TargetProgress, Task, TaskType, UnitId } from './types'

function hash(value: string) {
  let result = 2166136261
  for (let index = 0; index < value.length; index += 1) result = Math.imul(result ^ value.charCodeAt(index), 16777619)
  return result >>> 0
}

function seededShuffle<T>(values: readonly T[], seed: number) {
  const result = [...values]
  let state = seed || 1
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0
    const swapIndex = state % (index + 1)
    ;[result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!]
  }
  return result
}

function taskShuffle<T>(values: readonly T[], seed: number) {
  const shuffled = seededShuffle(values, seed)
  return shuffled.length > 1 && shuffled.every((value, index) => value === values[index]) ? [...shuffled.slice(1), shuffled[0]!] : shuffled
}

const spellingFocus: Record<string, number[]> = {
  yellow: [2, 3, 1], green: [2, 3, 1], three: [0, 1, 3, 4], eight: [2, 3, 4], white: [1, 4], purple: [2, 3, 5],
}

function repair(value: string, mastery: number, seed: number, spaced = true) {
  const letters = [...value]
  const positions = letters.map((char, index) => /[A-Za-z]/.test(char) ? index : -1).filter((index) => index >= 0)
  const ratio = mastery < 25 ? .25 : mastery < 60 ? .4 : .55
  const blankCount = Math.max(1, Math.min(Math.round(positions.length * ratio), positions.length - 1))
  const focus = spellingFocus[value.toLocaleLowerCase('en-GB')] ?? []
  const ordered = [...focus.filter((index) => positions.includes(index)), ...taskShuffle(positions.filter((index) => !focus.includes(index)), seed)]
  ordered.slice(0, blankCount).forEach((index) => { letters[index] = '_' })
  if (!letters.includes('_') && positions.length > 1) letters[positions[Math.floor(positions.length / 2)]!] = '_'
  return spaced ? letters.join(' ').replace(/\s([,.!?])/g, '$1') : letters.join('')
}

function taskLabel(type: TaskType) {
  return ({ repair: 'REPAIR', audio: 'AUDIO CODE', memory: 'MEMORY', unscramble: 'UNSCRAMBLE', 'error-hunt': 'ERROR HUNT' } as const)[type]
}

function phraseChunks(value: string) {
  return value.match(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)?|[,.!?]/gu) ?? []
}

function lexicalTask(item: LexicalItem, type: TaskType, seed: number, mastery = 0): Task {
  const answer = item.text
  const base = (signature: string): Task => ({ id: signature, signature, targetId: item.id, targetKind: 'lexical', type, label: taskLabel(type), instruction: 'Restore the code.', prompt: answer, answer, validationMode: 'word', cue: item.cue })
  if (type === 'memory') return { ...base(`${item.id}:memory`), instruction: 'Restore the code from memory.', prompt: '', exposureMs: mastery > 60 ? 2500 : mastery > 25 ? 3000 : 4000 }
  if (type === 'repair') {
    const prompt = repair(answer.toUpperCase(), mastery, seed)
    return { ...base(`${item.id}:repair:${prompt}`), instruction: 'Restore the missing letters.', prompt }
  }
  if (type === 'unscramble') {
    const tileMode = item.kind === 'word' && !answer.includes(' ') ? 'letters' : 'chunks'
    const source = tileMode === 'letters' ? [...answer.toUpperCase()] : phraseChunks(answer)
    const tiles = taskShuffle(source, seed)
    return { ...base(`${item.id}:unscramble:${tiles.join('|')}`), instruction: tileMode === 'letters' ? 'Rebuild the letter order.' : 'Rebuild the word order.', prompt: '', tiles, tileMode }
  }
  if (type === 'error-hunt') {
    const prompt = item.commonErrors[seed % item.commonErrors.length]!
    return { ...base(`${item.id}:error-hunt:${prompt}`), instruction: 'Find and repair the unstable code.', prompt: prompt.toUpperCase(), errorFeedback: 'One realistic spelling error remains.' }
  }
  if (type === 'audio') return { ...base(`${item.id}:audio`), instruction: 'Listen. Then spell the word.', prompt: '' }
  return base(`${item.id}:${type}`)
}

function grammarTask(point: GrammarPoint, type: TaskType, seed: number): Task {
  const example = point.examplePool[seed % point.examplePool.length] ?? point.examplePool[0]!
  const error = point.commonErrors[seed % point.commonErrors.length]
  const answer = type === 'error-hunt' && error ? error.correction : example.text
  const variation = type === 'error-hunt' ? error?.value ?? example.id : example.id
  const signature = `${point.id}:${type}:${variation}`
  const base: Task = { id: signature, signature, targetId: point.id, targetKind: 'grammar', type, label: taskLabel(type), instruction: 'Restore the sentence.', prompt: answer, answer, validationMode: type === 'error-hunt' ? 'accuracy' : 'content' }
  if (type === 'memory') return { ...base, instruction: 'Type the sentence from memory.', prompt: '', exposureMs: 4000 }
  if (type === 'repair') return { ...base, instruction: 'Type the complete sentence.', prompt: repair(answer, point.difficulty * 15, seed, false) }
  if (type === 'error-hunt') return { ...base, instruction: 'Correct the sentence.', prompt: error!.value, errorFeedback: error!.feedback }
  if (type === 'unscramble') {
    const tiles = taskShuffle(phraseChunks(answer), seed)
    return { ...base, instruction: 'Rebuild the word order.', prompt: '', tiles, tileMode: 'chunks' }
  }
  if (type === 'audio') return { ...base, instruction: 'Listen, then type the sentence.', prompt: '' }
  return base
}

export interface GenerateOptions {
  length: number
  seed?: string
  progress?: TargetProgress[]
  allowedTypes?: TaskType[]
  category?: 'words' | 'phrases' | 'mixed'
  unitId?: UnitId
  selectedPartIds?: string[]
  recentSignatures?: string[]
}

export function generateRemediation(targetId: string, previousType: TaskType, seed = Date.now()): Task | null {
  const lexical = lexicalItems.find((item) => item.id === targetId)
  if (lexical) {
    const alternatives = lexical.allowedTaskTypes.filter((type) => type !== previousType && type !== 'memory' && type !== 'audio' && (type !== 'error-hunt' || lexical.commonErrors.length > 0))
    const type = alternatives[seed % alternatives.length]
    return type ? lexicalTask(lexical, type, seed + 101) : null
  }
  const grammar = grammarPoints.find((item) => item.id === targetId)
  if (!grammar) return null
  const alternatives = grammar.allowedTaskTypes.filter((type) => type !== previousType && type !== 'memory' && type !== 'audio' && (type !== 'error-hunt' || grammar.commonErrors.length > 0))
  const type = alternatives[seed % alternatives.length]
  return type ? grammarTask(grammar, type, seed + 101) : null
}

function progressiveWordTypes(mastery: number): TaskType[] {
  if (mastery < 20) return ['repair', 'unscramble']
  if (mastery < 45) return ['repair', 'unscramble', 'error-hunt', 'memory']
  if (mastery < 70) return ['repair', 'unscramble', 'error-hunt', 'memory', 'audio']
  return ['repair', 'unscramble', 'error-hunt', 'memory', 'audio']
}

function balancedTargets<T extends LexicalItem | GrammarPoint>(targets: T[], selectedPartIds: string[], unstableIds: Set<string>, seed: number) {
  const buckets = taskShuffle(selectedPartIds, seed).map((partId, index) => taskShuffle(targets.filter((target) => target.partId === partId), seed + index + 1)
    .sort((left, right) => Number(unstableIds.has(right.id)) - Number(unstableIds.has(left.id))))
  const balanced: T[] = []
  for (let round = 0; buckets.some((bucket) => round < bucket.length); round += 1) {
    for (const bucket of buckets) if (bucket[round]) balanced.push(bucket[round]!)
  }
  return balanced
}

export function generateSession({ length, seed = new Date().toISOString().slice(0, 10), progress = [], allowedTypes, category = 'mixed', unitId = 'hello', selectedPartIds, recentSignatures = [] }: GenerateOptions): Task[] {
  const baseSeed = hash(seed)
  const progressById = new Map(progress.map((item) => [item.targetId, item]))
  const recent = new Set(recentSignatures)
  const forcedMode = allowedTypes?.length === 1
  const unstableIds = new Set(progress.filter((item) => item.state === 'unstable' || item.state === 'learning').map((item) => item.targetId))
  const unitPartIds = [...new Set([...lexicalItems, ...grammarPoints].filter((item) => item.unitId === unitId).map((item) => item.partId))]
  const activePartIds = selectedPartIds?.length ? selectedPartIds.filter((id) => unitPartIds.includes(id)) : unitPartIds
  const selected = new Set(activePartIds.length ? activePartIds : unitPartIds)
  const lexical = lexicalItems.filter((item) => item.enabled && item.unitId === unitId && selected.has(item.partId))
  const grammar = grammarPoints.filter((item) => item.enabled && item.unitId === unitId && selected.has(item.partId) && (item.difficulty < 4 || progress.length > 4))
  const eligible: Array<LexicalItem | GrammarPoint> = category === 'words'
    ? lexical.filter((item) => item.kind === 'word')
    : category === 'phrases'
      ? [...lexical.filter((item) => item.kind === 'phrase'), ...grammar]
      : [...lexical, ...grammar]
  const pool = balancedTargets(eligible, activePartIds.length ? activePartIds : unitPartIds, unstableIds, baseSeed + 23)
  if (!pool.length) return []
  const tasks: Task[] = []
  const targetCounts = new Map<string, number>()
  let previousTypes: TaskType[] = []

  for (let index = 0; tasks.length < length && index < pool.length * 6; index += 1) {
    const target = pool[index % pool.length]!
    if ((targetCounts.get(target.id) ?? 0) >= 2 || tasks.slice(-5).filter((item) => item.targetId === target.id).length >= 2) continue
    let types = target.allowedTaskTypes.filter((type) => !allowedTypes || allowedTypes.includes(type))
    types = types.filter((type) => type !== 'error-hunt' || target.commonErrors.length > 0)
    if ('text' in target && !forcedMode) {
      const stageTypes = progressiveWordTypes(progressById.get(target.id)?.mastery ?? 0)
      types = types.filter((type) => stageTypes.includes(type))
    }
    const last = previousTypes.at(-1)
    if (!forcedMode && previousTypes.length >= 2 && previousTypes.slice(-2).every((item) => item === last)) types = types.filter((type) => type !== last)
    const type = types[(baseSeed + index) % types.length] ?? types[0]
    if (!type) continue
    const task = 'text' in target ? lexicalTask(target, type, baseSeed + index, progressById.get(target.id)?.mastery ?? 0) : grammarTask(target, type, baseSeed + index)
    if (tasks.some((existing) => existing.signature === task.signature)) continue
    if (recent.has(task.signature) && index < pool.length * 3) continue
    tasks.push(task)
    previousTypes = [...previousTypes, type].slice(-3)
    targetCounts.set(target.id, (targetCounts.get(target.id) ?? 0) + 1)
  }
  return tasks
}
