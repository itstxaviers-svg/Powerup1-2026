import { describe, expect, it } from 'vitest'
import { lexicalItems } from '../../content/course'
import type { LexicalItem } from '../../domain/types'
import { getBattleCheckpoint, getBattleFight } from './config'
import { accuracyPassed, battlePassed, buildBattleQuestions, completePurification, emptyBattleProgress, ensureCheckpointAllocations, getEligibleBattleWords, isCheckpointUnlocked, isUnitGateOpen, recordBattleResult } from './engine'

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

  it('uses only explicit image/audio prompt eligibility and accepted battle answers', () => {
    const base = lexicalItems.find((item) => item.unitId === 'unit-1' && item.kind === 'word')!
    const image: LexicalItem = { ...base, id: 'image', text: 'image-code', acceptedAnswers: ['image-code'], battlePrompt: 'image', battleImage: '/image.png', battleAcceptedAnswers: ['image code'] }
    const audio: LexicalItem = { ...base, id: 'audio', text: 'audio-code', acceptedAnswers: ['audio-code'], battlePrompt: 'audio', battleImage: '/ignored.png' }
    const questions = buildBattleQuestions([image, audio], ['image', 'audio'], 'fixed', true)
    expect(questions.find((question) => question.vocabularyId === 'image')?.promptType).toBe('image')
    expect(questions.find((question) => question.vocabularyId === 'image')?.acceptedAnswers).toContain('image code')
    expect(questions.find((question) => question.vocabularyId === 'audio')?.promptType).toBe('audio')
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

  it('maps approved Unit 1-3 images while leaving ambiguous vocabulary on Audio', () => {
    const bag = lexicalItems.find((item) => item.unitId === 'unit-1' && item.text === 'bag')!
    const mother = lexicalItems.find((item) => item.unitId === 'unit-2' && item.text === 'mother')!
    const dog = lexicalItems.find((item) => item.unitId === 'unit-3' && item.text === 'dog')!
    const angry = lexicalItems.find((item) => item.unitId === 'unit-3' && item.text === 'angry')!
    expect(bag.battlePrompt).toBe('either')
    expect(bag.battleImage).toMatch(/01_bag/)
    expect(dog.battleImage).toMatch(/02_dog/)
    expect(mother.battlePrompt).toBe('audio')
    expect(angry.battlePrompt).toBe('audio')
  })
})
