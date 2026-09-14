import { describe, expect, it } from 'vitest'
import { selectEnglishVoice } from './speech'

function voice(name: string, lang: string, localService = true) {
  return { name, lang, localService, default: false, voiceURI: name } as SpeechSynthesisVoice
}

describe('clear English speech voice selection', () => {
  it('prefers a British English voice over other English voices', () => {
    const selected = selectEnglishVoice([
      voice('Samantha', 'en-US'),
      voice('Daniel', 'en-GB'),
      voice('Amelie', 'fr-FR'),
    ])
    expect(selected?.name).toBe('Daniel')
  })

  it('prefers an offline British voice when otherwise equivalent', () => {
    const selected = selectEnglishVoice([
      voice('British Online', 'en-GB', false),
      voice('British Local', 'en-GB', true),
    ])
    expect(selected?.name).toBe('British Local')
  })
})
