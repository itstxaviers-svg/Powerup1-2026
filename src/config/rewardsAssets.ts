import ancientCode from '../../assets/artifact-ancient-code.png'
import audioOrb from '../../assets/artifact-audio-orb.png'
import decoderLens from '../../assets/artifact-decoder-lens.png'
import masterKey from '../../assets/artifact-master-key.png'
import memoryCrystal from '../../assets/artifact-memory-crystal.png'
import prismFragment from '../../assets/artifact-prism-fragment.png'
import repairGear from '../../assets/artifact-repair-gear.png'
import sentenceCore from '../../assets/artifact-sentence-core.png'
import rewardsBackground from '../../assets/rewards-sanctuary-bg.webp'
import crystalCore from '../../assets/spirit-crystal-core.png'
import decoderHalo from '../../assets/spirit-decoder-halo.png'
import guardian from '../../assets/spirit-guardian.png'
import master from '../../assets/spirit-master.png'
import neonWings from '../../assets/spirit-neon-wings.png'
import prismTrail from '../../assets/spirit-prism-trail.png'
import spark from '../../assets/spirit-spark.png'
import spirit from '../../assets/spirit-spirit.png'
import sprite from '../../assets/spirit-sprite.png'
import starAura from '../../assets/spirit-star-aura.png'
import crystalAcademy from '../../assets/world-crystal-academy.png'
import floatingCafe from '../../assets/world-floating-cafe.png'
import gateway from '../../assets/world-gateway.png'
import mirrorGarden from '../../assets/world-mirror-garden.png'
import skyFarm from '../../assets/world-sky-farm.png'
import starlightLibrary from '../../assets/world-unit-5.png'
import sunPyramidOasis from '../../assets/world-unit-6.png'
import cosmicHarbor from '../../assets/world-unit-7.png'
import tropicalCodingCove from '../../assets/world-unit-8.png'
import auroraPeaks from '../../assets/world-unit-9.png'

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
