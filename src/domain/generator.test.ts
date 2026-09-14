import { describe, expect, it } from 'vitest'
import { generateRemediation, generateSession } from './generator'
import { grammarPoints, lexicalItems } from '../content/course'

describe('session generation', () => {
  it('is deterministic for a seed and produces unique signatures', () => {
    const first = generateSession({ length: 10, seed: 'fixed-seed' })
    const second = generateSession({ length: 10, seed: 'fixed-seed' })
    expect(first).toEqual(second)
    expect(new Set(first.map((task) => task.signature)).size).toBe(first.length)
  })
  it('does not leave grammar slot placeholders in answers', () => {
    const tasks = generateSession({ length: 15, seed: 'grammar', category: 'phrases' })
    expect(tasks.every((task) => !task.answer.match(/{\w+}/))).toBe(true)
  })
  it('keeps repair prompts useful and unscramble tiles complete', () => {
    const repair = generateSession({ length: 10, seed: 'repairs', category: 'words', allowedTypes: ['repair'] })
    expect(repair.every((task) => task.prompt.includes('_') && task.prompt.replaceAll(' ', '').replaceAll('_', '').length > 0)).toBe(true)
    const scramble = generateSession({ length: 10, seed: 'tiles', category: 'words', allowedTypes: ['unscramble'] })
    expect(scramble.every((task) => [...(task.tiles ?? [])].sort().join('').toLowerCase() === [...task.answer].sort().join('').toLowerCase())).toBe(true)
  })
  it('unscrambles grammar with complete touch-friendly word chunks', () => {
    const tasks = generateSession({ length: 8, seed: 'grammar-tiles', category: 'phrases', allowedTypes: ['unscramble'], selectedPartIds: ['introductions'] })
    expect(tasks).toHaveLength(8)
    expect(tasks.every((task) => task.tileMode === 'chunks' && (task.tiles?.length ?? 0) > 1)).toBe(true)
    expect(tasks.every((task) => [...(task.tiles ?? []).join('').replaceAll(' ', '')].sort().join('') === [...task.answer.replaceAll(' ', '')].sort().join(''))).toBe(true)
  })
  it('filters by Parts before generating and softly balances multiple Parts', () => {
    const tasks = generateSession({ length: 8, seed: 'two-parts', category: 'words', selectedPartIds: ['numbers', 'colours'] })
    const partFor = (targetId: string) => lexicalItems.find((item) => item.id === targetId)?.partId ?? grammarPoints.find((item) => item.id === targetId)?.partId
    const parts = tasks.map((task) => partFor(task.targetId))
    expect(new Set(parts)).toEqual(new Set(['numbers', 'colours']))
    expect(Math.abs(parts.filter((part) => part === 'numbers').length - parts.filter((part) => part === 'colours').length)).toBeLessThanOrEqual(2)
    const introductions = generateSession({ length: 6, seed: 'intro-only', selectedPartIds: ['introductions'] })
    expect(introductions.every((task) => partFor(task.targetId) === 'introductions')).toBe(true)
  })
  it('does not serve one task type three times consecutively when alternatives exist', () => {
    const tasks = generateSession({ length: 15, seed: 'variety' })
    expect(tasks.every((task, index) => index < 2 || !(tasks[index - 1]?.type === task.type && tasks[index - 2]?.type === task.type))).toBe(true)
  })
  it('changes task form for remediation', () => {
    const task = generateSession({ length: 1, seed: 'weak-code', category: 'words' })[0]!
    const remediation = generateRemediation(task.targetId, task.type, 42)
    expect(remediation?.targetId).toBe(task.targetId)
    expect(remediation?.type).not.toBe(task.type)
    expect(remediation?.signature).not.toBe(task.signature)
  })
})
