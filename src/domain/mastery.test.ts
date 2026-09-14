import { describe, expect, it } from 'vitest'
import { currentTaskTypes, hasMasteryVariety } from './mastery'

describe('mastery mode variety', () => {
  it('does not allow supported Repair practice alone to satisfy mastery variety', () => {
    expect(hasMasteryVariety(['repair'])).toBe(false)
    expect(hasMasteryVariety(['repair', 'unscramble', 'error-hunt'])).toBe(false)
  })

  it('requires a high-recall mode, a medium-recall mode and three current modes', () => {
    expect(hasMasteryVariety(['repair', 'unscramble', 'memory'])).toBe(true)
    expect(hasMasteryVariety(['repair', 'error-hunt', 'audio'])).toBe(true)
  })

  it('ignores mode names stored by older app versions', () => {
    expect(currentTaskTypes(['repair', 'retired-mode-a', 'retired-mode-b', 'audio'])).toEqual(['repair', 'audio'])
  })
})
