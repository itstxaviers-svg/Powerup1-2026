import type { BossDefinition, BossId, BossState } from './types'

export const bossStates: readonly BossState[] = ['base', 'idle', 'quick-attack', 'heavy-attack', 'block', 'counter', 'hit', 'ultimate', 'victory', 'defeat']

const assetModules = import.meta.glob('../../../assets/battles/**/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

function asset(path: string, fallback: string) {
  return assetModules[`../../../assets/battles/${path}`] ?? assetModules[`../../../assets/battles/${fallback}`] ?? ''
}

function expectedAssets(checkpoint: string, folder: string, filename: string) {
  const base = `${checkpoint}/${folder}/${filename}-base.png`
  return Object.fromEntries(bossStates.map((state) => {
    let path = `${checkpoint}/${folder}/${filename}-${state}.png`
    if (folder === 'nullweaver' && state === 'block') path = `${checkpoint}/${folder}/${filename}-heavy-block.png`
    if (folder === 'corrupted-archivist' && state === 'hit') path = `${checkpoint}/${folder}/orrupted-archivist-hit.png`
    if (folder === 'corrupted-archivist' && state === 'quick-attack') path = `${checkpoint}/${folder}/orrupted-archivist-quick-attack..png`
    return [state, asset(path, base)]
  })) as Record<BossState, string>
}

export const bosses: Record<BossId, BossDefinition> = {
  'glitch-kitsune': { id: 'glitch-kitsune', name: 'GLITCH KITSUNE', accent: '#b879ff', corruptedLine: 'You cannot clear this signal.', thankYouLine: 'Thank you. The signal is clear again.', assets: expectedAssets('checkpoint-03', 'glitch-kitsune', 'glitch-kitsune') },
  nullweaver: { id: 'nullweaver', name: 'NULLWEAVER', accent: '#ef75d2', corruptedLine: 'Your words will disappear in my web.', thankYouLine: 'Thank you. I can see the true code again.', assets: expectedAssets('checkpoint-07', 'nullweaver', 'nullweaver') },
  'aether-golem': { id: 'aether-golem', name: 'AETHER GOLEM', accent: '#ffb85c', corruptedLine: 'Your code will not pass.', thankYouLine: 'Thank you. My core is stable again.', assets: expectedAssets('checkpoint-07', 'aether-golem', 'aether-golem') },
  'signal-serpent': { id: 'signal-serpent', name: 'SIGNAL SERPENT', accent: '#66e8ff', corruptedLine: 'The signal belongs to me now.', thankYouLine: 'Thank you. The signal is free again.', assets: expectedAssets('checkpoint-09', 'signal-serpent', 'signal-serpent') },
  'corrupted-archivist': { id: 'corrupted-archivist', name: 'THE CORRUPTED ARCHIVIST', accent: '#9b83ff', corruptedLine: 'The Archive is closed to you.', thankYouLine: 'Thank you. The Archive is safe again.', assets: expectedAssets('checkpoint-09', 'corrupted-archivist', 'corrupted-archivist') },
}
