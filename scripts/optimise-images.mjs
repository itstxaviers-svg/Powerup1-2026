import { readdir, readFile, rename, stat } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

async function importedImages(sourcePath) {
  const absoluteSource = resolve(projectRoot, sourcePath)
  const source = await readFile(absoluteSource, 'utf8')
  return Promise.all([...source.matchAll(/from ['"]([^'"]+\.(?:png|jpe?g|webp))['"]/gi)].map(async (match) => {
    const imported = resolve(dirname(absoluteSource), match[1])
    if (!/\.webp$/i.test(imported)) return imported
    const original = imported.replace(/\.webp$/i, '.png')
    try { await stat(original); return original } catch { return imported }
  }))
}

async function imagesIn(directory) {
  const entries = await readdir(resolve(projectRoot, directory), { withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile() && /\.(?:png|jpe?g)$/i.test(entry.name))
    .map((entry) => resolve(projectRoot, directory, entry.name))
}

async function optimise(source, maximumDimension) {
  const destination = source.replace(new RegExp(`${extname(source)}$`, 'i'), '.webp')
  const output = source === destination ? `${destination}.tmp.webp` : destination
  const before = (await stat(source)).size
  await sharp(source)
    .rotate()
    .resize({ width: maximumDimension, height: maximumDimension, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, alphaQuality: 88, effort: 6, smartSubsample: true })
    .toFile(output)
  if (output !== destination) await rename(output, destination)
  const after = (await stat(destination)).size
  return { source, destination, before, after }
}

const vocabulary = await importedImages('src/features/battle/vocabularyImages.ts')
const importedRewards = await importedImages('src/config/rewardsAssets.ts')
const rewardBackgrounds = importedRewards.filter((source) => source.includes('rewards-sanctuary-bg'))
const rewards = importedRewards.filter((source) => !source.includes('rewards-sanctuary-bg'))
const bossDirectories = [
  'assets/battles/checkpoint-03/glitch-kitsune',
  'assets/battles/checkpoint-07/nullweaver',
  'assets/battles/checkpoint-07/aether-golem',
  'assets/battles/checkpoint-09/signal-serpent',
  'assets/battles/checkpoint-09/corrupted-archivist',
]
const bosses = (await Promise.all(bossDirectories.map(imagesIn))).flat()
const publicArtwork = await imagesIn('public/assets')

const groups = [
  [vocabulary, 640],
  [rewards, 720],
  [rewardBackgrounds, 1440],
  [bosses, 960],
  [publicArtwork, 1280],
]

const results = []
for (const [sources, maximumDimension] of groups) {
  for (const source of new Set(sources)) results.push(await optimise(source, maximumDimension))
}

const before = results.reduce((total, item) => total + item.before, 0)
const after = results.reduce((total, item) => total + item.after, 0)
console.log(`Optimised ${results.length} runtime images: ${(before / 1024 / 1024).toFixed(1)} MB -> ${(after / 1024 / 1024).toFixed(1)} MB`)
