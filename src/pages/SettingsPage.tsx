import { useState } from 'react'
import { applyDisplaySettings, loadSettings, saveSettings } from '../data/settings'
import type { AppSettings } from '../domain/types'

export function SettingsPage() {
  const [settings, setSettings] = useState(loadSettings)
  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => { const next = { ...settings, [key]: value }; setSettings(next); saveSettings(next); applyDisplaySettings(next) }
  const testVoice = () => { if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); const voice = new SpeechSynthesisUtterance('Your British voice is ready.'); voice.lang = 'en-GB'; window.speechSynthesis.speak(voice) } }
  return <div className="page settings-page">
    <div className="page-title"><p className="kicker">DEVICE PREFERENCES</p><h1>Settings</h1><p>Keep training comfortable and focused.</p></div>
    <section className="settings-card">
      <label><div><strong>Session length</strong><span>Challenges in a normal session</span></div><select value={settings.sessionLength} onChange={(event) => update('sessionLength', Number(event.target.value))}>{[5, 8, 10, 15].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label><div><strong>Memory scan</strong><span>How long a target stays visible</span></div><select value={settings.memoryDuration} onChange={(event) => update('memoryDuration', Number(event.target.value))}><option value={2000}>2 seconds</option><option value={3000}>3 seconds</option><option value={5000}>5 seconds</option></select></label>
      <Toggle label="Audio codes" detail="Use a British English device voice when available" value={settings.audioEnabled} onChange={(value) => update('audioEnabled', value)} />
      <Toggle label="Generous hints" detail="Offer support earlier after a near miss" value={settings.generousHints} onChange={(value) => update('generousHints', value)} />
      <Toggle label="Interface sounds" detail="Soft success and interaction sounds" value={settings.soundEnabled} onChange={(value) => update('soundEnabled', value)} />
      <Toggle label="Music" detail="Calm background music when available" value={settings.musicEnabled} onChange={(value) => update('musicEnabled', value)} />
      <Toggle label="Animations" detail={settings.reducedMotion ? 'Reduced movement' : 'Full learning animations'} value={!settings.reducedMotion} onChange={(value) => update('reducedMotion', !value)} />
      <Toggle label="Large text" detail="Increase interface text size" value={settings.largeText} onChange={(value) => update('largeText', value)} />
      {'vibrate' in navigator && <Toggle label="Vibration" detail="Gentle supported-device feedback" value={settings.vibrationEnabled} onChange={(value) => update('vibrationEnabled', value)} />}
      <label><div><strong>British voice</strong><span>Test the en-GB voice used by Audio Code</span></div><button type="button" className="outline-button settings-test" onClick={testVoice}>Test voice</button></label>
    </section>
  </div>
}

function Toggle({ label, detail, value, onChange }: { label: string; detail: string; value: boolean; onChange: (value: boolean) => void }) {
  return <label><div><strong>{label}</strong><span>{detail}</span></div><button type="button" role="switch" aria-checked={value} className={`toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)}><i /></button></label>
}
