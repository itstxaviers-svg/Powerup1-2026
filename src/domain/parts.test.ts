import { describe, expect, it } from 'vitest'
import { helloParts } from '../content/hello'
import { normalisePartSelection, parsePartRoute, partRoute } from './parts'

describe('Unit Part selection', () => {
  it('supports one Part, several Parts and All Parts', () => {
    expect(parsePartRoute('numbers', helloParts)).toEqual(['numbers'])
    expect(parsePartRoute('numbers,colours', helloParts)).toEqual(['numbers', 'colours'])
    expect(parsePartRoute('all', helloParts)).toEqual(['numbers', 'colours', 'introductions'])
  })

  it('falls back to All Parts when saved IDs are no longer valid', () => {
    expect(normalisePartSelection(['removed-part'], helloParts)).toEqual(['numbers', 'colours', 'introductions'])
    expect(partRoute(['removed-part'], helloParts)).toBe('all')
  })
})
