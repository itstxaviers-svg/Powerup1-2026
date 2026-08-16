import { describe, expect, it } from 'vitest'
import { generateRemediation, generateSession } from './generator'

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
