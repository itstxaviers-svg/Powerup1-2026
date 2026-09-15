import ancientCode from '../../assets/artifact-ancient-code.webp'
import audioOrb from '../../assets/artifact-audio-orb.webp'
import decoderLens from '../../assets/artifact-decoder-lens.webp'
import masterKey from '../../assets/artifact-master-key.webp'
import memoryCrystal from '../../assets/artifact-memory-crystal.webp'
import prismFragment from '../../assets/artifact-prism-fragment.webp'
import repairGear from '../../assets/artifact-repair-gear.webp'
import sentenceCore from '../../assets/artifact-sentence-core.webp'
import rewardsBackground from '../../assets/rewards-sanctuary-bg.webp'
import crystalCore from '../../assets/spirit-crystal-core.webp'
import decoderHalo from '../../assets/spirit-decoder-halo.webp'
import guardian from '../../assets/spirit-guardian.webp'
import master from '../../assets/spirit-master.webp'
import neonWings from '../../assets/spirit-neon-wings.webp'
import prismTrail from '../../assets/spirit-prism-trail.webp'
import spark from '../../assets/spirit-spark.webp'
import spirit from '../../assets/spirit-spirit.webp'
import sprite from '../../assets/spirit-sprite.webp'
import starAura from '../../assets/spirit-star-aura.webp'
import crystalAcademy from '../../assets/world-crystal-academy.webp'
import floatingCafe from '../../assets/world-floating-cafe.webp'
import gateway from '../../assets/world-gateway.webp'
import mirrorGarden from '../../assets/world-mirror-garden.webp'
import skyFarm from '../../assets/world-sky-farm.webp'
import starlightLibrary from '../../assets/world-unit-5.webp'
import sunPyramidOasis from '../../assets/world-unit-6.webp'
import cosmicHarbor from '../../assets/world-unit-7.webp'
import tropicalCodingCove from '../../assets/world-unit-8.webp'
import auroraPeaks from '../../assets/world-unit-9.webp'

export const rewardsAssets = {
  background: rewardsBackground,
  spirit: { spark, sprite, spirit, guardian, master },
  accessories: { crystalCore, neonWings, starAura, decoderHalo, prismTrail },
  artifacts: { memoryCrystal, audioOrb, repairGear, decoderLens, sentenceCore, masterKey, prismFragment, ancientCode },
  worlds: { gateway, crystalAcademy, mirrorGarden, skyFarm, floatingCafe, starlightLibrary, sunPyramidOasis, cosmicHarbor, tropicalCodingCove, auroraPeaks },
} as const

export type SpiritAssetKey = keyof typeof rewardsAssets.spirit
export type AccessoryAssetKey = keyof typeof rewardsAssets.accessories
export type ArtifactAssetKey = keyof typeof rewardsAssets.artifacts
export type WorldAssetKey = keyof typeof rewardsAssets.worlds
