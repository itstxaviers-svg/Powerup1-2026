import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './styles.css'
import './reference-theme.css'
import './rewards.css'
import './account.css'
import { applyDisplaySettings } from './data/settings'
import { registerCloudSync } from './data/cloudSync'

registerSW({ immediate: true })
applyDisplaySettings()
registerCloudSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
