import { describe, expect, it } from 'vitest'
import { lexicalItems } from '../../content/course'
import type { LexicalItem } from '../../domain/types'
import { getBattleCheckpoint, getBattleFight } from './config'
import { accuracyPassed, battleAnswersMatch, battlePassed, buildBattleQuestions, completePurification, emptyBattleProgress, ensureCheckpointAllocations, getEligibleBattleWords, isCheckpointUnlocked, isUnitGateOpen, recordBattleResult } from './engine'

describe('cumulative battle engine', () => {
  it('labels each checkpoint with its required course range', () => {
    expect(getBattleCheckpoint('checkpoint-03')?.prerequisiteLabel).toBe('Hello! and Units 1–3')
    expect(getBattleCheckpoint('checkpoint-07')?.prerequisiteLabel).toBe('Units 4–7')
    expect(getBattleCheckpoint('checkpoint-09')?.prerequisiteLabel).toBe('Units 8–9')
  })

  it('opens checkpoints in sequence without requiring Unit mastery', () => {
    const checkpoint03 = getBattleCheckpoint('checkpoint-03')!
    const checkpoint07 = getBattleCheckpoint('checkpoint-07')!
    const checkpoint09 = getBattleCheckpoint('checkpoint-09')!
    expect(isCheckpointUnlocked(checkpoint03, [])).toBe(true)
    expect(isCheckpointUnlocked(checkpoint07, [])).toBe(false)

    const after03 = { ...emptyBattleProgress('checkpoint-03'), completedFightIds: ['checkpoint-03' as const] }
    expect(isCheckpointUnlocked(checkpoint07, [after03])).toBe(true)
    expect(isCheckpointUnlocked(checkpoint09, [after03])).toBe(false)

    const after07 = { ...emptyBattleProgress('checkpoint-07'), completedFightIds: ['checkpoint-07-a' as const, 'checkpoint-07-b' as const] }
    expect(isCheckpointUnlocked(checkpoint09, [after03, after07])).toBe(true)
  })

  it('opens Unit ranges only after the preceding checkpoint victory', () => {
    expect(isUnitGateOpen('hello', [])).toBe(true)
    expect(isUnitGateOpen('unit-3', [])).toBe(true)
    expect(isUnitGateOpen('unit-4', [])).toBe(false)
    expect(isUnitGateOpen('unit-7', [])).toBe(false)
    expect(isUnitGateOpen('unit-8', [])).toBe(false)
    expect(isUnitGateOpen('unit-9', [])).toBe(false)

    const after03 = { ...emptyBattleProgress('checkpoint-03'), completedFightIds: ['checkpoint-03' as const] }
    expect(isUnitGateOpen('unit-4', [after03])).toBe(true)
    expect(isUnitGateOpen('unit-7', [after03])).toBe(true)
    expect(isUnitGateOpen('unit-8', [after03])).toBe(false)

    const after07 = { ...emptyBattleProgress('checkpoint-07'), completedFightIds: ['checkpoint-07-a' as const, 'checkpoint-07-b' as const] }
    expect(isUnitGateOpen('unit-8', [after03, after07])).toBe(true)
    expect(isUnitGateOpen('unit-9', [after03, after07])).toBe(true)
  })

  it('excludes Hello, phrases and duplicate spellings before selecting one third', () => {
    const pool = getEligibleBattleWords(lexicalItems, [1, 3], true)
    expect(pool.length).toBeGreaterThan(0)
    expect(pool.every((item) => item.unitId !== 'hello' && item.kind === 'word')).toBe(true)
    expect(new Set(pool.map((item) => item.text.toLowerCase())).size).toBe(pool.length)
    const checkpoint = getBattleCheckpoint('checkpoint-03')!
    const record = ensureCheckpointAllocations(checkpoint, undefined, lexicalItems, 'fixed', true)
    expect(record.allocations['checkpoint-03']).toHaveLength(Math.ceil(pool.length / 3))
  })

  it('preallocates paired non-overlapping sets and preserves them for retry', () => {
    const checkpoint = getBattleCheckpoint('checkpoint-07')!
    const first = ensureCheckpointAllocations(checkpoint, undefined, lexicalItems, 'fixed', true)
    const second = ensureCheckpointAllocations(checkpoint, first, lexicalItems, 'different-retry-seed', true)
    const a = first.allocations['checkpoint-07-a'] ?? []
    const b = first.allocations['checkpoint-07-b'] ?? []
    expect(a.length).toBeGreaterThan(0)
    expect(b.length).toBeGreaterThan(0)
    expect(a.filter((id) => b.includes(id))).toEqual([])
    expect(second.allocations).toEqual(first.allocations)
  })

  it('repairs invalid saved IDs without changing checkpoint completion', () => {
    const checkpoint = getBattleCheckpoint('checkpoint-07')!
    const initial = ensureCheckpointAllocations(checkpoint, undefined, lexicalItems, 'fixed', true)
    const firstA = initial.allocations['checkpoint-07-a'] ?? []
    const damaged = {
      ...initial,
      allocations: {
        ...initial.allocations,
        'checkpoint-07-a': [...firstA.slice(0, -1), 'deleted-vocabulary-id'],
        'checkpoint-07-b': [firstA[0]!, ...(initial.allocations['checkpoint-07-b'] ?? []).slice(1)],
      },
      completedFightIds: ['checkpoint-07-a' as const],
    }
    const repaired = ensureCheckpointAllocations(checkpoint, damaged, lexicalItems, 'repair', true)
    const repairedA = repaired.allocations['checkpoint-07-a'] ?? []
    const repairedB = repaired.allocations['checkpoint-07-b'] ?? []
    expect(repairedA).not.toContain('deleted-vocabulary-id')
    expect(repairedA.filter((id) => repairedB.includes(id))).toEqual([])
    expect(repaired.completedFightIds).toEqual(damaged.completedFightIds)
  })

  it('uses only explicit image/audio prompt eligibility and accepted battle answers', () => {
    const base = lexicalItems.find((item) => item.unitId === 'unit-1' && item.kind === 'word')!
    const image: LexicalItem = { ...base, id: 'image', text: 'image-code', acceptedAnswers: ['image-code'], battlePrompt: 'image', battleImage: '/image.png', battleAcceptedAnswers: ['image code'] }
    const audio: LexicalItem = { ...base, id: 'audio', text: 'audio-code', acceptedAnswers: ['audio-code'], battlePrompt: 'audio', battleImage: '/ignored.png' }
    const questions = buildBattleQuestions([image, audio], ['image', 'audio'], 'fixed', true)
    expect(questions.find((question) => question.vocabularyId === 'image')?.promptType).toBe('image')
    expect(questions.find((question) => question.vocabularyId === 'image')?.acceptedAnswers).toContain('image code')
    expect(questions.find((question) => question.vocabularyId === 'audio')?.promptType).toBe('audio')
    expect(battleAnswersMatch(' BLUE ', ['blue'])).toBe(true)
    expect(battleAnswersMatch("Let's", ['Let’s'])).toBe(true)
    expect(battleAnswersMatch('Tshirt', ['T-shirt'])).toBe(false)
    expect(battleAnswersMatch('shoe', ['shoes'])).toBe(false)
  })

  it('requires 85 percent, enforces the mistake cap and unlocks only after purification', () => {
    expect(accuracyPassed(17, 20)).toBe(true)
    expect(accuracyPassed(16, 20)).toBe(false)
    expect(battlePassed(17, 20, getBattleFight('checkpoint-03')!)).toBe(true)
    expect(battlePassed(34, 40, getBattleFight('checkpoint-03')!)).toBe(false)
    expect(battlePassed(17, 20, getBattleFight('checkpoint-07-a')!)).toBe(true)
    expect(battlePassed(46, 54, getBattleFight('checkpoint-07-a')!)).toBe(false)
    const fight = getBattleFight('checkpoint-09-b')!
    const won = recordBattleResult(emptyBattleProgress('checkpoint-09'), fight, 17, 20, [])
    expect(won.pendingPurificationFightId).toBe(fight.id)
    expect(won.completedFightIds).not.toContain(fight.id)
    const restored = completePurification(won, fight)
    expect(restored.completedFightIds).toContain(fight.id)
    expect(restored.courseCompleted).toBe(true)
  })

  it('maps approved Unit 1-9 images while leaving ambiguous vocabulary on Audio', () => {
    const bag = lexicalItems.find((item) => item.unitId === 'unit-1' && item.text === 'bag')!
    const pencilCase = lexicalItems.find((item) => item.unitId === 'unit-1' && item.text === 'pencil case')!
    const mother = lexicalItems.find((item) => item.unitId === 'unit-2' && item.text === 'mother')!
    const dog = lexicalItems.find((item) => item.unitId === 'unit-3' && item.text === 'dog')!
    const angry = lexicalItems.find((item) => item.unitId === 'unit-3' && item.text === 'angry')!
    const pasta = lexicalItems.find((item) => item.unitId === 'unit-4' && item.text === 'pasta')!
    const sausage = lexicalItems.find((item) => item.unitId === 'unit-4' && item.text === 'sausage')!
    const mouse = lexicalItems.find((item) => item.unitId === 'unit-5' && item.text === 'mouse')!
    const teddy = lexicalItems.find((item) => item.unitId === 'unit-5' && item.text === 'teddy')!
    const lorry = lexicalItems.find((item) => item.unitId === 'unit-6' && item.text === 'lorry')!
    const swim = lexicalItems.find((item) => item.unitId === 'unit-7' && item.text === 'swim')!
    const painting = lexicalItems.find((item) => item.unitId === 'unit-8' && item.text === 'painting')!
    const floor = lexicalItems.find((item) => item.unitId === 'unit-8' && item.text === 'floor')!
    const tShirt = lexicalItems.find((item) => item.unitId === 'unit-9' && item.text === 'T-shirt')!
    const fishing = lexicalItems.find((item) => item.unitId === 'unit-9' && item.text === 'fishing')!
    expect(bag.battlePrompt).toBe('image')
    expect(bag.battleImage).toMatch(/01_bag/)
    expect(dog.battleImage).toMatch(/02_dog/)
    expect(mother.battlePrompt).toBe('audio')
    expect(angry.battlePrompt).toBe('audio')
    expect(pencilCase.kind).toBe('phrase')
    expect(pencilCase.battlePrompt).toBeUndefined()
    expect(pasta.battleImage).toMatch(/22_spaghetti/)
    expect(sausage.battlePrompt).toBe('audio')
    expect(mouse.battleImage).toMatch(/14_mouse/)
    expect(teddy.battlePrompt).toBe('audio')
    expect(lorry.battleImage).toMatch(/07_truck/)
    expect(swim.battlePrompt).toBe('audio')
    expect(painting.battleImage).toMatch(/10_picture/)
    expect(floor.battlePrompt).toBe('audio')
    expect(tShirt.battleImage).toMatch(/13_t_shirt/)
    expect(fishing.battleImage).toMatch(/19_fisherman/)
    expect(getEligibleBattleWords(lexicalItems, [1, 9], true).every((item) => item.battlePrompt === 'audio' || (item.battlePrompt === 'image' && Boolean(item.battleImage)))).toBe(true)
  })

  it('keeps cumulative ranges, battle sizes, timers and thresholds configured', () => {
    const checkpoints = ['checkpoint-03', 'checkpoint-07', 'checkpoint-09'].map((id) => getBattleCheckpoint(id)!)
    expect(checkpoints.map((checkpoint) => checkpoint.fights[0]?.unitRange)).toEqual([[1, 3], [1, 7], [1, 9]])
    expect(checkpoints.flatMap((checkpoint) => checkpoint.fights).map((fight) => fight.timeLimitSeconds)).toEqual([10, 8, 8, 6, 6])
    expect(checkpoints.flatMap((checkpoint) => checkpoint.fights).every((fight) => fight.requiredAccuracy === .85)).toBe(true)
    checkpoints.forEach((checkpoint) => {
      const pool = getEligibleBattleWords(lexicalItems, checkpoint.fights[0]!.unitRange, true)
      const record = ensureCheckpointAllocations(checkpoint, undefined, lexicalItems, 'counts', true)
      expect(record.allocations[checkpoint.fights[0]!.id]).toHaveLength(Math.ceil(pool.length / 3))
    })
  })

  it('keeps the calculated Unit and checkpoint vocabulary inventory stable', () => {
    const perUnit = Array.from({ length: 9 }, (_, index) => {
      const unit = index + 1
      const pool = getEligibleBattleWords(lexicalItems, [unit, unit], true)
      return { unit, eligible: pool.length, image: pool.filter((item) => item.battlePrompt === 'image').length, audio: pool.filter((item) => item.battlePrompt === 'audio').length }
    })
    const checkpointPools = [3, 7, 9].map((maximum) => {
      const pool = getEligibleBattleWords(lexicalItems, [1, maximum], true)
      return { maximum, total: pool.length, fightSize: Math.ceil(pool.length / 3) }
    })
    expect(perUnit).toEqual([
      { unit: 1, eligible: 27, image: 19, audio: 8 },
      { unit: 2, eligible: 34, image: 10, audio: 24 },
      { unit: 3, eligible: 36, image: 9, audio: 27 },
      { unit: 4, eligible: 35, image: 14, audio: 21 },
      { unit: 5, eligible: 31, image: 15, audio: 16 },
      { unit: 6, eligible: 41, image: 15, audio: 26 },
      { unit: 7, eligible: 17, image: 0, audio: 17 },
      { unit: 8, eligible: 17, image: 12, audio: 5 },
      { unit: 9, eligible: 40, image: 18, audio: 22 },
    ])
    expect(checkpointPools).toEqual([
      { maximum: 3, total: 96, fightSize: 32 },
      { maximum: 7, total: 216, fightSize: 72 },
      { maximum: 9, total: 267, fightSize: 89 },
    ])
  })
})
