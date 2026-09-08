import { describe, expect, it } from 'vitest'
import { sanitiseLearningInput } from './learningInput'

describe('learning input', () => {
  it('keeps English letters, digits and course punctuation', () => {
    expect(sanitiseLearningInput("Hello, I’m eight!")).toBe("Hello, I’m eight!")
  })

  it('removes characters from an accidentally selected foreign keyboard', () => {
    expect(sanitiseLearningInput('greenпривет🙂')).toBe('green')
  })
})
