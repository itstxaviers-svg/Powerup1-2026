import type { AppSettings } from '../domain/types'

export const defaultSettings: AppSettings = { sessionLength: 8, memoryDuration: 3000, audioEnabled: true, generousHints: true, soundEnabled: true, musicEnabled: true, reducedMotion: false, largeText: false, vibrationEnabled: true }
const key = 'word-code:settings'

export function loadSettings(): AppSettings {
  try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(key) ?? '{}') as Partial<AppSettings> } } catch { return defaultSettings }
}
export function saveSettings(settings: AppSettings) { localStorage.setItem(key, JSON.stringify(settings)) }

export function applyDisplaySettings(settings = loadSettings()) {
  document.documentElement.dataset.motion = settings.reducedMotion ? 'reduced' : 'full'
  document.documentElement.dataset.textSize = settings.largeText ? 'large' : 'normal'
}
