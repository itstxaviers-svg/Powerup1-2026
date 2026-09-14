export function canSpeakEnglish() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

export function speakEnglish(value: string) {
  return new Promise<boolean>((resolve) => {
    if (!canSpeakEnglish()) { resolve(false); return }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(value)
    utterance.lang = 'en-GB'
    utterance.rate = .82
    let settled = false
    const finish = (played: boolean) => { if (!settled) { settled = true; resolve(played) } }
    utterance.onend = () => finish(true)
    utterance.onerror = () => finish(false)
    window.speechSynthesis.speak(utterance)
  })
}
