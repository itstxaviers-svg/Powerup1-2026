import { describe, expect, it } from 'vitest'
import { lexicalItems } from '../content/hello'
import { checkAnswer, normaliseForContent } from './checkAnswer'
import type { Task } from './types'

const task: Task = { id: 't', signature: 's', targetId: 'x', targetKind: 'grammar', type: 'repair', label: 'REPAIR', instruction: '', prompt: '', answer: 'I’m eight.', validationMode: 'content' }

describe('answer checking', () => {
  it('normalises repeated spaces and final punctuation in content mode', () => {
    expect(checkAnswer(task, "  I'm   eight ").correct).toBe(true)
  })
  it('treats straight and curly apostrophes as equivalent', () => {
    expect(normaliseForContent("What’s your name?")).toBe(normaliseForContent("What's your name?"))
  })
  it('accepts gray but withholds full British course mastery', () => {
    const grey = lexicalItems.find((item) => item.text === 'grey')!
    const wordTask = { ...task, targetId: grey.id, targetKind: 'lexical' as const, answer: 'grey', validationMode: 'word' as const }
    expect(checkAnswer(wordTask, 'gray', grey)).toMatchObject({ correct: true, courseMastery: false, note: 'Correct English. Course spelling: grey.' })
  })
  it('keeps accuracy mode strict about punctuation and capitalisation', () => {
    expect(checkAnswer({ ...task, validationMode: 'accuracy' }, "i'm eight").correct).toBe(false)
  })
})
