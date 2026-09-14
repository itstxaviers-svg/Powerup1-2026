export function canSpeakEnglish() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

export function selectEnglishVoice(voices: readonly SpeechSynthesisVoice[]) {
  return [...voices].sort((left, right) => {
    const score = (voice: SpeechSynthesisVoice) => {
      const language = voice.lang.toLocaleLowerCase('en-GB')
      const exactBritish = language === 'en-gb' ? 100 : 0
      const otherEnglish = language.startsWith('en-') ? 20 : 0
      const recognisableBritishName = /british|united kingdom|daniel|serena|kate|oliver/i.test(voice.name) ? 10 : 0
      const worksOffline = voice.localService ? 5 : 0
      return exactBritish + otherEnglish + recognisableBritishName + worksOffline
    }
    return score(right) - score(left)
  }).find((voice) => voice.lang.toLocaleLowerCase('en-GB').startsWith('en'))
}

async function loadEnglishVoice() {
  const synthesis = window.speechSynthesis
  const available = synthesis.getVoices()
  if (available.length) return selectEnglishVoice(available)
  return new Promise<SpeechSynthesisVoice | undefined>((resolve) => {
    const finish = () => {
      window.clearTimeout(timeout)
      synthesis.removeEventListener('voiceschanged', finish)
      resolve(selectEnglishVoice(synthesis.getVoices()))
    }
    const timeout = window.setTimeout(finish, 500)
    synthesis.addEventListener('voiceschanged', finish, { once: true })
  })
}

export async function speakEnglish(value: string) {
  if (!canSpeakEnglish()) return false
  const selectedVoice = await loadEnglishVoice()
  return new Promise<boolean>((resolve) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(value)
    utterance.lang = 'en-GB'
    if (selectedVoice) utterance.voice = selectedVoice
    utterance.rate = .72
    utterance.pitch = 1
    utterance.volume = 1
    let settled = false
    const finish = (played: boolean) => { if (!settled) { settled = true; resolve(played) } }
    utterance.onend = () => finish(true)
    utterance.onerror = () => finish(false)
    window.speechSynthesis.speak(utterance)
  })
}
