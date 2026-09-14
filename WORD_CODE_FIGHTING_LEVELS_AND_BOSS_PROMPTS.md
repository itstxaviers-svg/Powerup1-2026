# WORD//CODE — FIRST-PERSON FIGHTING CHECKPOINTS
## Implementation directive for Codex

Continue development of the EXISTING WORD//CODE project from its current repository state.

This document defines exactly how the fighting checkpoints must work.

Do NOT restart the project.
Do NOT redesign unrelated systems.
Do NOT recreate functionality that already exists.
Do NOT add character-generation prompts to this file.
The boss artwork will be created separately.

Read the root `AGENTS.md` once, inspect only the relevant implementation files, then implement this feature as an extension of the current WORD//CODE architecture.

---

# 1. PURPOSE OF THE FIGHTING LEVELS

Fighting checkpoints are cumulative vocabulary tests presented as first-person boss encounters.

They are not normal WORD//CODE training modes.

The learner is tested through independent written production.

During a battle the learner sees or hears a word prompt and TYPES the English answer.

Only two task types are used:

1. `Audio → Type`
2. `Image → Type`

Do NOT use these regular training modes inside battles:

- Repair
- Memory
- Unscramble
- Error Hunt

Do NOT use:

- multiple choice
- first-letter hints
- visible spelling hints
- translation prompts
- grammar questions
- phrase questions

Fighting checkpoints test vocabulary WORDS only.

`Hello!` vocabulary is NOT included in cumulative battle pools.

---

# 2. FIRST-PERSON BATTLE CONCEPT

The learner/player character NEVER appears on the arena.

Do NOT build a traditional side-view fighter with:

- player on the left;
- opponent on the right.

Instead:

- the boss is centred in front of the learner;
- the boss looks directly at the camera;
- camera = learner's point of view;
- enemy attacks move directly toward the camera;
- learner attacks remain invisible except for reusable first-person energy effects.

The learner should feel that the corrupted opponent is attacking THEM directly.

No visible player body is required.

No hands.
No weapon.
No player avatar.

---

# 3. STORY / VISUAL LOGIC

The bosses are corrupted guardians/entities.

The learner is not killing them.

Correct English answers gradually remove corrupted code.

Wrong answers allow the boss to attack the learner.

Correct-answer visual narrative:

```text
correct answer
→ first-person player energy strike
→ boss HIT
→ corrupted particles break away
→ boss becomes gradually cleaner/stabler
```

Wrong-answer visual narrative:

```text
wrong answer / timeout
→ boss attacks camera
→ screen impact
→ red/coral damage vignette
→ short digital distortion
→ return to battle
```

No blood.
No gore.
No realistic injury.

---

# 4. CHECKPOINT STRUCTURE

There are exactly THREE cumulative checkpoints:

1. after Unit 3;
2. after Unit 7;
3. after Unit 9.

The Unit Parts selected during normal training do NOT limit battle vocabulary.

Battles always use ALL enabled eligible vocabulary words from the required cumulative Unit range.

---

# 5. CHECKPOINT AFTER UNIT 3

After Unit 3 is completed:

unlock a mandatory boss checkpoint.

Opponent:

`GLITCH KITSUNE`

Vocabulary pool:

```text
Unit 1
+
Unit 2
+
Unit 3
```

Use approximately ONE THIRD of all unique eligible words in that cumulative pool.

Recommended:

```ts
battleSize = Math.ceil(eligiblePool.length / 3)
```

Number of fights:

`1`

Answer time:

`10 seconds`

Required accuracy:

`85%`

Progression rule:

Unit 4 must remain locked until this battle is passed.

---

# 6. CHECKPOINT AFTER UNIT 7

After Unit 7 is completed:

unlock a TWO-FIGHT mandatory checkpoint sequence.

## Fight 1

Opponent:

`NULLWEAVER`

## Fight 2

Opponent:

`AETHER GOLEM`

Vocabulary pool for the whole checkpoint:

```text
Units 1–7
```

Each fight uses approximately ONE THIRD of the complete unique eligible Unit 1–7 vocabulary pool.

Important:

Fight 1 and Fight 2 MUST use different words.

No word may appear in both fights.

Answer time:

`8 seconds`

Required accuracy:

`85%` in each fight.

Progression rule:

Unit 8 remains locked until BOTH bosses are defeated.

Passing Fight 1 unlocks Fight 2.

If Fight 2 is failed:

replay Fight 2 only.

Do NOT force the learner to replay an already passed Fight 1.

---

# 7. FINAL CHECKPOINT AFTER UNIT 9

After Unit 9 is completed:

unlock the final TWO-FIGHT Super Battle sequence.

## Super Battle 1

Opponent:

`SIGNAL SERPENT`

## Final Super Battle

Opponent:

`THE CORRUPTED ARCHIVIST`

Vocabulary pool:

```text
Units 1–9
```

Each fight uses approximately ONE THIRD of the complete unique eligible Unit 1–9 vocabulary pool.

Important:

Super Battle 1 and Final Super Battle MUST use different words.

No word may appear in both fights.

Answer time:

`6 seconds`

Required accuracy:

`85%` in each battle.

The final course-completion state is unlocked only after BOTH battles are passed.

---

# 8. PAIRED-BATTLE WORD ALLOCATION

For Unit 7 and Unit 9 checkpoints, select BOTH battle word sets before Fight 1 begins.

Required algorithm:

```text
eligible cumulative vocabulary
↓
deduplicate
↓
shuffle
↓
take first one-third for Fight 1
↓
take next non-overlapping one-third for Fight 2
↓
remaining words are unused in this checkpoint attempt
```

Conceptually:

```ts
const shuffled = shuffle(uniqueEligibleWords)

const battleSize = Math.ceil(shuffled.length / 3)

const fight1Words = shuffled.slice(0, battleSize)
const fight2Words = shuffled.slice(battleSize, battleSize * 2)
```

Persist both allocations locally until that checkpoint sequence is completed.

Do NOT independently randomise Fight 2 from the full pool later.

That could cause duplicate words.

---

# 9. RETRY VOCABULARY RULE

If the learner gets less than 85%:

the battle is failed.

Retry MUST use the SAME selected battle vocabulary set.

Do NOT generate another random one-third set.

On retry:

- keep the same words;
- reshuffle their order;
- prompt type may change between Audio and Image when the word supports both;
- all previously incorrect words remain because the whole set repeats.

The learner should not escape difficult words by repeatedly generating a new battle pool.

---

# 10. ACCURACY

Official result:

```ts
accuracy = correctAnswers / totalBattleWords
```

Passed:

```ts
accuracy >= 0.85
```

Failed:

```ts
accuracy < 0.85
```

Do not round before comparison.

Example:

```text
17 / 20 = 85% → PASS
16 / 20 = 80% → FAIL
```

---

# 11. DO NOT END THE FIGHT EARLY

All selected words must be answered.

Do NOT make the battle end early because:

- decorative boss HP reaches zero;
- learner has already mathematically secured 85%;
- learner can no longer mathematically reach 85%.

The complete selected word set should normally be completed.

Official result is calculated after the last selected word.

The boss bar is visual battle feedback, not the authoritative scoring mechanism.

---

# 12. BATTLE QUESTION TYPES

The battle engine supports exactly:

```ts
type BattlePromptType =
  | "audio"
  | "image"
```

No other prompt type belongs in this battle system.

---

# 13. AUDIO → TYPE

Reuse the existing WORD//CODE Audio Code playback logic.

Do NOT create a separate duplicate audio system unless technically necessary.

Required sequence:

```text
question becomes active
↓
audio target is ready
↓
audio automatically plays
↓
learner hears complete word
↓
countdown starts
↓
learner types
↓
submit
```

The learner must also have a replay button.

Replay is allowed after autoplay.

Replay does NOT restart the timer.

Replay does NOT pause the timer.

No spelling should be visible.

---

# 14. AUDIO AUTOPLAY

Browsers can block audio autoplay before user interaction.

Therefore the battle must have an explicit start interaction.

Recommended flow:

```text
ENTER BATTLE
↓
boss intro
↓
START BATTLE
↓
establish audio permission / AudioContext
↓
Question 1
```

After `START BATTLE`, Audio questions should autoplay whenever technically allowed.

If browser autoplay unexpectedly fails:

do not silently fail.

Show the Replay/Play Audio button clearly.

---

# 15. AUDIO TIMER START

This is important.

For Audio → Type:

the answer timer must NOT start while the target audio is still speaking.

Timer starts only when initial autoplay finishes.

Required:

```text
audio starts
↓
audio ends
↓
timer begins
```

This gives the learner the full 10 / 8 / 6 seconds AFTER hearing the complete word.

Replay after that point does not reset the countdown.

---

# 16. IMAGE → TYPE

Image questions are required.

They are technically possible and should be implemented.

Required sequence:

```text
question loads
↓
approved image is fully loaded
↓
image becomes visible
↓
timer begins
↓
learner identifies object/concept
↓
learner types English word
```

Example:

```text
[bicycle image]

Answer:
bicycle
```

Do NOT show:

- word;
- translation;
- first letter;
- number of missing letters;
- multiple-choice options.

---

# 17. IMAGE ELIGIBILITY

Do NOT force every vocabulary item into Image → Type.

Each vocabulary item should support image metadata equivalent to:

```ts
imageAsset?: string
imagePromptEligible?: boolean
```

Use Image → Type only if:

- an approved local image exists;
- it clearly represents ONE intended target;
- the answer is not ambiguous;
- the image is pedagogically suitable.

Examples suitable for image tasks:

- animals;
- objects;
- clothes;
- food;
- transport;
- concrete places;
- clear actions;
- colours;
- numbers if visually appropriate.

Abstract or ambiguous vocabulary:

use Audio → Type.

Do NOT dynamically generate battle images at runtime.

---

# 18. QUESTION TYPE DISTRIBUTION

Aim for approximately:

```text
50% Audio
50% Image
```

BUT:

image eligibility has priority over numerical balance.

If only 20% of selected words have valid images:

those words may use Image and the rest use Audio.

Never force an unclear image just to reach 50%.

A word appears ONCE in each battle attempt.

Do not ask the same word once as Audio and again as Image in the same attempt.

---

# 19. PROMPT-TYPE SELECTION

Recommended algorithm:

1. determine which selected words are image-eligible;
2. choose up to approximately half the battle slots for Image;
3. fill the remaining slots with Audio;
4. shuffle final question order.

On retries:

a word supporting both prompt types may switch prompt type.

This adds variation without changing vocabulary.

---

# 20. PRELOAD REQUIRED ASSETS

Do not penalise learners for network/file loading time.

Before each question becomes active:

preload or confirm readiness of:

- boss state assets needed immediately;
- audio file / TTS result;
- vocabulary image where applicable.

For Image:

timer begins only after image successfully loads.

For Audio:

timer begins only after initial audio playback ends.

Consider preloading the next question asset while the current question is being answered.

---

# 21. TIMER VALUES

Timers are checkpoint-specific.

```ts
const BATTLE_TIMERS = {
  afterUnit3: 10,
  afterUnit7: 8,
  afterUnit9: 6,
}
```

Unit 3:

`10 sec`

Unit 7:

`8 sec`

Unit 9:

`6 sec`

Do not dynamically reduce time inside the same battle for now.

These are the initial fixed values we are testing.

---

# 22. TIMER VISUAL

Use a clear battle timer.

Recommended:

- circular energy ring;
- segmented ring;
- shrinking horizontal energy strip.

Colour progression:

## normal

cyan / blue

## warning

gold

## critical

coral / red

Possible critical threshold:

last 20–25%.

The last three seconds may pulse subtly.

Do NOT flash the entire screen.

---

# 23. TIMEOUT

When timer reaches zero:

1. lock question;
2. count it incorrect;
3. display short:

```text
TIME EXPIRED
```

4. boss attacks;
5. first-person red damage effect;
6. record result;
7. transition to next question.

Do not leave timed-out questions active.

---

# 24. ANSWER VALIDATION

For normal vocabulary:

- trim whitespace;
- compare case-insensitively;
- do not autocorrect spelling.

Accept:

```text
Purple
purple
```

as equivalent if canonical target is `purple`.

Do NOT accept:

```text
purpel
```

Do not use fuzzy matching for battle victory scoring.

A spelling error is incorrect.

---

# 25. INPUT SETTINGS

Battle text fields should disable browser assistance that can reveal correct spelling.

Where appropriate:

```tsx
spellCheck={false}
autoCorrect="off"
autoCapitalize="none"
autoComplete="off"
```

Mobile keyboard should still be comfortable to use.

---

# 26. SUBMISSION

Desktop:

Enter key submits.

Mobile:

- keyboard submit where supported;
- visible large submit button.

Once submitted:

- input becomes disabled;
- timer freezes;
- result resolves once.

---

# 27. QUESTION STATE MACHINE

Implement explicit state to avoid double scoring.

Conceptually:

```ts
type QuestionPhase =
  | "loading"
  | "presenting"
  | "active"
  | "submitted"
  | "resolved"
  | "transitioning"
```

Only `active` questions may accept an answer or timeout.

If submission and timeout occur at nearly the same moment:

resolve only once.

---

# 28. BATTLE PHASE STATE MACHINE

Recommended:

```ts
type BattlePhase =
  | "intro"
  | "ready"
  | "question"
  | "feedback"
  | "results"
  | "passed"
  | "failed"
```

For paired checkpoints also track:

```ts
fightIndex
fight1Passed
fight2Unlocked
fight2Passed
```

Keep battle state explicit rather than spreading unrelated booleans across components.

---

# 29. BATTLE INTRO

Do not immediately show Question 1.

Each fight starts with a short boss reveal.

Recommended sequence:

```text
arena appears
↓
corruption effect
↓
boss appears
↓
boss name
↓
checkpoint label
↓
START BATTLE
```

Suggested intro length:

2–4 seconds.

Example:

```text
CORRUPTED SIGNAL

CHECKPOINT 07-A

NULLWEAVER
```

Button:

```text
START BATTLE
```

After the learner has seen the intro once:

allow a shorter/skippable reveal where practical.

---

# 30. BOSS POSITION

Boss remains approximately central throughout battle.

Use responsive sizing.

Desktop:

boss occupies substantial visual area but leaves room for question/input.

Mobile:

boss remains large enough to feel threatening but must not push the input below the keyboard.

Do not place the boss in a side panel.

---

# 31. FIRST-PERSON WRONG-ANSWER ATTACK

Wrong answer triggers boss attack animation.

Recommended sequence:

```text
answer marked incorrect
↓
boss enters quick-attack
↓
boss moves/scales toward camera
↓
impact frame
↓
viewport red/coral vignette
↓
small camera shake
↓
short digital distortion
↓
boss returns to idle
```

Normal wrong answer:

use `quick-attack`.

Timeout or stronger dramatic moment:

use `heavy-attack`.

Recommended total feedback time:

roughly 500–900 ms.

Do not make the learner wait several seconds after every mistake.

---

# 32. RED SCREEN DAMAGE EFFECT

The learner is hit in first person.

Implement a reusable viewport overlay.

Suggested properties:

- transparent centre;
- stronger red/coral around edges;
- very brief opacity rise/fall;
- optional cyan shield crack underneath;
- short chromatic aberration/glitch;
- subtle transform shake of arena layer.

Do NOT cover the whole screen with opaque red.

Do NOT use blood textures.

---

# 33. CORRECT-ANSWER ATTACK

Correct answer triggers an invisible player strike.

Sequence:

```text
correct
↓
cyan first-person projectile / pulse
↓
boss enters HIT state
↓
purification particles
↓
boss returns idle
↓
next question
```

Player projectile may originate from:

- bottom centre;
- lower screen edge;
- camera centre.

No visible player avatar is needed.

---

# 34. BOSS CORRUPTION PROGRESSION

Boss should look progressively more stable during a successful fight.

Do not require a separate full sprite for every corruption percentage.

Use shared overlays/effects where possible:

- reduce purple glitch particle density;
- reduce corruption overlay;
- increase clean cyan/gold glow;
- increase Code Core stability.

Boss state art + reusable effects should create progression.

---

# 35. BOSS HUD

Keep HUD simple.

Top area may show:

```text
GLITCH KITSUNE
CORRUPTION
[bar]
```

or:

```text
CODE INTEGRITY
```

Also show battle progress such as:

```text
12 / 20
```

Accuracy may be visible or hidden during battle.

Do not make the learner manage RPG stats.

---

# 36. BOSS BAR LOGIC

Boss bar should broadly track successful progress through questions.

However:

it must NOT control official pass/fail.

Official pass/fail = final accuracy.

Do not end battle based on bar reaching zero.

---

# 37. COMMON BOSS STATES

All five boss asset sets use the same ten-state convention:

1. `base`
2. `idle`
3. `quick-attack`
4. `heavy-attack`
5. `block`
6. `counter`
7. `hit`
8. `ultimate`
9. `victory`
10. `defeat`

`defeat` means purified/restored, NOT dead.

---

# 38. BOSS STATE USAGE

## base

Canonical static reference / fallback.

## idle

Default state while learner answers.

## quick-attack

Normal wrong answer.

## heavy-attack

Timeout or major attack.

## block

Optional defensive transition.

## counter

Optional special response.

## hit

Correct learner answer.

## ultimate

Rare dramatic attack.

Use sparingly.

Do NOT attach extra scoring penalties to ultimate for now.

## victory

Learner failed battle.

Boss remains corrupted.

## defeat

Learner passed battle.

Boss is purified/restored.

---

# 39. OPTIONAL ULTIMATE TRIGGERS

Ultimate is primarily a visual event.

Possible triggers:

- learner makes several mistakes;
- boss reaches a late battle phase;
- special scripted moment near battle end.

Do not trigger constantly.

One ultimate per battle is enough for the initial implementation.

---

# 40. RESULT — PASS

If final accuracy is at least 85%:

1. finish final question feedback;
2. boss corruption begins dissolving;
3. boss enters `defeat`;
4. arena lighting becomes cleaner;
5. display:

```text
CODE STABILIZED
```

6. show final accuracy;
7. mark checkpoint fight passed;
8. unlock next required progression.

Example:

```text
CODE STABILIZED

ACCURACY: 90%
```

---

# 41. RESULT — FAIL

If final accuracy is below 85%:

1. boss enters `victory`;
2. corruption remains;
3. brief red/corrupted pulse;
4. display:

```text
CODE UNSTABLE
```

5. show:

```text
ACCURACY: 78%
REQUIRED: 85%
```

6. button:

```text
RETRY BATTLE
```

Do NOT unlock progression.

---

# 42. WRONG-WORD REVIEW

Failed result screen should include a compact review.

Suggested:

```text
REVIEW THESE CODES
```

Then show incorrectly answered words.

Keep it compact.

Do not create a large statistics dashboard.

Retry still uses the full original battle set.

---

# 43. MAP PROGRESSION

Battle checkpoints must be visible on the course journey.

After Unit completion:

```text
Unit complete
↓
checkpoint reveal animation
↓
battle node activates
↓
next normal Unit remains locked
```

When checkpoint is passed:

```text
boss purification
↓
checkpoint node becomes stable/completed
↓
next Unit unlocks
```

For Unit 7 / Unit 9:

Fight 2 node remains locked until Fight 1 is passed.

---

# 44. MAP REVEAL EFFECT

When checkpoint first appears:

- send a small corrupted signal through the map;
- activate boss node;
- show boss silhouette or emblem;
- brief text:

```text
CORRUPTED SIGNAL DETECTED
```

Do not automatically start the fight.

Learner presses:

```text
ENTER BATTLE
```

---

# 45. OPPONENTS

Approved WORD//CODE boss sequence:

## after Unit 3

`GLITCH KITSUNE`

## after Unit 7 — Fight 1

`NULLWEAVER`

## after Unit 7 — Fight 2

`AETHER GOLEM`

## after Unit 9 — Super Battle 1

`SIGNAL SERPENT`

## after Unit 9 — Final Super Battle

`THE CORRUPTED ARCHIVIST`

Do NOT reuse Chronofang or any other Power Up 2 opponent.

---

# 46. BOSS ASSET FILE CONVENTION

Boss artwork will be created separately.

Do NOT generate it in Codex.

Codex should only expect/load the asset files.

Use the existing fighter convention:

```text
base
idle
quick-attack
heavy-attack
block
counter
hit
ultimate
victory
defeat
```

Recommended folders following the existing project naming style:

```text
Assets/05-games/code-fighter/opponents/unit-03-glitch-kitsune/

Assets/05-games/code-fighter/opponents/unit-07-nullweaver/

Assets/05-games/code-fighter/opponents/unit-07-aether-golem/

Assets/05-games/code-fighter/opponents/unit-09-signal-serpent/

Assets/05-games/code-fighter/opponents/unit-09-corrupted-archivist/
```

Expected filenames:

## Glitch Kitsune

```text
unit-03-glitch-kitsune-base.png
unit-03-glitch-kitsune-idle.png
unit-03-glitch-kitsune-quick-attack.png
unit-03-glitch-kitsune-heavy-attack.png
unit-03-glitch-kitsune-block.png
unit-03-glitch-kitsune-counter.png
unit-03-glitch-kitsune-hit.png
unit-03-glitch-kitsune-ultimate.png
unit-03-glitch-kitsune-victory.png
unit-03-glitch-kitsune-defeat.png
```

## Nullweaver

```text
unit-07-nullweaver-base.png
unit-07-nullweaver-idle.png
unit-07-nullweaver-quick-attack.png
unit-07-nullweaver-heavy-attack.png
unit-07-nullweaver-block.png
unit-07-nullweaver-counter.png
unit-07-nullweaver-hit.png
unit-07-nullweaver-ultimate.png
unit-07-nullweaver-victory.png
unit-07-nullweaver-defeat.png
```

## Aether Golem

```text
unit-07-aether-golem-base.png
unit-07-aether-golem-idle.png
unit-07-aether-golem-quick-attack.png
unit-07-aether-golem-heavy-attack.png
unit-07-aether-golem-block.png
unit-07-aether-golem-counter.png
unit-07-aether-golem-hit.png
unit-07-aether-golem-ultimate.png
unit-07-aether-golem-victory.png
unit-07-aether-golem-defeat.png
```

## Signal Serpent

```text
unit-09-signal-serpent-base.png
unit-09-signal-serpent-idle.png
unit-09-signal-serpent-quick-attack.png
unit-09-signal-serpent-heavy-attack.png
unit-09-signal-serpent-block.png
unit-09-signal-serpent-counter.png
unit-09-signal-serpent-hit.png
unit-09-signal-serpent-ultimate.png
unit-09-signal-serpent-victory.png
unit-09-signal-serpent-defeat.png
```

## Corrupted Archivist

```text
unit-09-corrupted-archivist-base.png
unit-09-corrupted-archivist-idle.png
unit-09-corrupted-archivist-quick-attack.png
unit-09-corrupted-archivist-heavy-attack.png
unit-09-corrupted-archivist-block.png
unit-09-corrupted-archivist-counter.png
unit-09-corrupted-archivist-hit.png
unit-09-corrupted-archivist-ultimate.png
unit-09-corrupted-archivist-victory.png
unit-09-corrupted-archivist-defeat.png
```

If assets are temporarily absent during implementation:

use a neutral placeholder/fallback without breaking the battle engine.

Do NOT invent or generate replacement art inside Codex.

---

# 47. SHARED FX

Create reusable code/CSS/SVG/image FX instead of requiring boss-specific art for every impact.

Recommended shared FX:

```text
player-code-projectile
player-code-impact
red-damage-vignette
screen-digital-crack
camera-impact
corruption-particles
purification-particles
boss-shield
counter-flash
ultimate-charge
ultimate-impact
timeout-pulse
battle-victory-burst
map-corruption-signal
```

Reuse them across all five bosses.

---

# 48. BATTLE DATA CONFIG

Prefer data-driven checkpoint configuration.

Conceptually:

```ts
type BattleCheckpointConfig = {
  id: string
  afterUnit: number
  fightIndex: number
  bossId: string
  unitRange: [number, number]
  poolFraction: number
  timeLimitSeconds: number
  requiredAccuracy: number
  nextFightId?: string
  unlocksUnit?: number
}
```

Example concept:

```ts
{
  id: "checkpoint-u3",
  afterUnit: 3,
  fightIndex: 1,
  bossId: "glitch-kitsune",
  unitRange: [1, 3],
  poolFraction: 1 / 3,
  timeLimitSeconds: 10,
  requiredAccuracy: 0.85,
  unlocksUnit: 4
}
```

Do not hard-code battle rules across multiple components.

Keep central configuration.

---

# 49. BOSS ASSET CONFIG

Use a shared structure.

Conceptually:

```ts
type BossState =
  | "base"
  | "idle"
  | "quick-attack"
  | "heavy-attack"
  | "block"
  | "counter"
  | "hit"
  | "ultimate"
  | "victory"
  | "defeat"
```

Boss definition:

```ts
type BossDefinition = {
  id: string
  name: string
  assetBasePath: string
  assets: Record<BossState, string>
}
```

Do not scatter raw asset filenames throughout UI components.

---

# 50. BATTLE QUESTION DATA

Conceptually:

```ts
type BattleQuestion = {
  id: string
  vocabularyId: string
  answer: string
  promptType: "audio" | "image"
  audioSrc?: string
  imageSrc?: string
}
```

Battle question generation happens AFTER battle vocabulary allocation.

---

# 51. PERSISTENCE

Persist enough state to survive refresh/reload.

At minimum:

```text
checkpoint unlocked
fight completed
best accuracy
paired fight allocations
current selected vocabulary set
Fight 1 passed
Fight 2 unlocked
Fight 2 passed
```

If the learner refreshes during an unfinished battle:

either:

A. safely resume the same battle allocation from the beginning,

or

B. restart the current battle using the same selected word set.

Do NOT silently generate a new vocabulary set.

---

# 52. CURRENT UNIT PARTS DO NOT AFFECT BATTLES

This is critical.

Normal WORD//CODE practice allows learners to select Unit Parts.

Battle checkpoints do NOT use current Part selection.

Example:

If learner previously trained only:

`Colours`

that does NOT mean the battle only tests Colours.

Battle cumulative pool always includes ALL eligible vocabulary words from the required completed Units.

The checkpoint is cumulative review.

---

# 53. VOCABULARY ELIGIBILITY

Battle pool includes only items that are:

- enabled;
- vocabulary words;
- assigned to required Units;
- have valid canonical answer;
- have at least one usable battle prompt.

Because Audio is fallback:

prefer vocabulary with playable audio.

If item has no usable audio but has an approved image:

it can still be included as Image-only.

If it has neither:

exclude it from the battle pool and surface a development/Teacher warning.

Do not create broken questions.

---

# 54. MOBILE-FIRST BATTLE UX

Phone is a primary target.

Use portrait layout.

Battle must work comfortably around:

`390 × 844`

Important:

- boss must remain visible;
- timer must remain visible;
- input must remain visible;
- submit control must remain reachable;
- keyboard must not hide critical controls;
- no horizontal scrolling;
- no tiny buttons.

Use responsive viewport units carefully because mobile browser chrome and keyboards change usable height.

Prefer modern dynamic viewport handling such as:

`dvh`

where appropriate.

---

# 55. DESKTOP UX

Representative:

`1440 × 900`

Use the extra width for:

- larger arena;
- larger boss;
- atmospheric background;
- clean input/question panel.

Do not turn desktop battle into a stretched mobile card.

---

# 56. PERFORMANCE

Avoid expensive battle rendering.

Prefer:

- normal DOM;
- CSS;
- Motion for React;
- transform/opacity animations;
- preloaded transparent boss assets;
- lightweight reusable overlays.

Avoid:

- unnecessary continuous canvas;
- WebGL unless already justified in project;
- huge uncompressed images;
- excessive blur filters;
- large uncontrolled particle simulations.

---

# 57. ACCESSIBILITY / REDUCED MOTION

Respect:

```css
prefers-reduced-motion
```

Reduced-motion mode should:

- remove major camera shake;
- reduce boss lunge scale;
- replace strong attack motion with short opacity/edge feedback;
- keep timer and scoring unchanged.

---

# 58. BATTLE BACKGROUND

Use an arena/background consistent with the approved WORD//CODE techno-fantasy visual direction.

Do not use the normal training-card layout as the battle environment.

Battle should feel like a special event.

However:

do NOT require separate arena artwork per boss for the first implementation unless assets already exist.

A reusable arena that changes accent/corruption colour per boss is acceptable.

---

# 59. AUDIO / SOUND FX

Optional reusable sounds:

- correct code hit;
- wrong-answer impact;
- boss attack;
- timer warning;
- timeout;
- battle passed;
- battle failed;
- purification.

Keep sounds:

- short;
- crystalline;
- digital;
- not loud;
- not arcade-like.

Provide mute/settings compatibility if the project already has audio settings.

---

# 60. TEACHER / DEVELOPMENT DIAGNOSTICS

Provide a lightweight way to detect battle-ineligible content during development or Teacher Mode.

Useful diagnostics:

```text
word has no audio
word has no image
word has neither audio nor image
imagePromptEligible=true but image missing
duplicate canonical answer
invalid Unit assignment
```

Do not build a huge diagnostics system.

Basic warnings are sufficient.

---

# 61. DO NOT MODIFY NORMAL FIVE TRAINING MODES

This task adds checkpoint battles.

It must NOT replace or redesign the normal WORD//CODE modes:

- Repair
- Audio Code
- Memory
- Unscramble
- Error Hunt

Normal training continues to function.

Battles are a separate cumulative checkpoint system.

---

# 62. DO NOT GENERATE BOSS PROMPTS OR ART

This implementation file contains NO image-generation prompts.

Boss assets are being created separately.

Codex must:

- implement the asset loader;
- use expected filenames;
- support placeholders if files are not yet present.

Codex must NOT:

- create prompts;
- generate boss artwork;
- redesign boss appearance.

---

# 63. IMPLEMENTATION ORDER

Use this order:

1. inspect current Unit unlock/progress architecture;
2. inspect existing Audio Code implementation;
3. inspect vocabulary data model;
4. add central battle checkpoint config;
5. add battle progress persistence;
6. implement cumulative word-pool allocator;
7. implement paired non-overlapping allocation;
8. implement prompt-type allocator;
9. implement Audio → Type;
10. implement Image → Type;
11. implement timer logic;
12. implement question state machine;
13. implement battle state machine;
14. implement boss asset config/loader;
15. implement first-person battle screen;
16. implement correct/wrong visual feedback;
17. implement result/retry flow;
18. connect progression gates;
19. connect battle nodes to course map;
20. verify mobile;
21. verify desktop;
22. final build;
23. STOP.

---

# 64. CONTEXT / LIMIT BUDGET

Do not repeat the previous context-window problem.

Inspect narrowly.

Do NOT:

- read entire repository recursively;
- repeatedly reopen AGENTS.md;
- inspect unrelated assets;
- inspect all future Unit curriculum;
- rewrite unrelated systems;
- run build after each tiny edit;
- generate repeated screenshots;
- write large progress reports.

Batch coherent edits.

Normally verify only:

- targeted battle allocation/state tests;
- final type/build check;
- one desktop battle visual check;
- one mobile portrait battle visual check.

If a check succeeds:

do not rerun it for reassurance.

---

# 65. REQUIRED LOGIC TESTS

At minimum verify battle logic for:

## Unit 3

- only Units 1–3 words selected;
- battle size approximately 1/3;
- no duplicate vocabulary IDs;
- timer config = 10;
- threshold = 0.85.

## Unit 7

- only Units 1–7 words;
- two sets generated;
- each approximately 1/3;
- sets do not intersect;
- timer = 8;
- Fight 2 locked until Fight 1 passes.

## Unit 9

- only Units 1–9 words;
- two sets generated;
- sets do not intersect;
- timer = 6;
- final completion locked until both pass.

## Retry

- same selected vocabulary set;
- different order allowed;
- failed Fight 2 does not reset passed Fight 1.

## Accuracy

- exactly 85% passes;
- below 85% fails.

## Timer

- Audio timer begins after initial audio playback;
- Image timer begins after image ready;
- replay does not reset timer;
- timeout resolves exactly once.

---

# 66. FINAL ACCEPTANCE CRITERIA

This feature is complete only when ALL of the following are true.

## Checkpoints

- Unit 3 checkpoint exists.
- Unit 7 two-fight checkpoint exists.
- Unit 9 two-fight Super Battle exists.

## Progression

- Unit 4 locked until Unit 3 boss passes.
- Unit 8 locked until both Unit 7 bosses pass.
- final completion locked until both Unit 9 bosses pass.

## Vocabulary

- Hello! excluded.
- Unit 3 uses cumulative Units 1–3.
- Unit 7 uses cumulative Units 1–7.
- Unit 9 uses cumulative Units 1–9.
- Unit Part selection does not reduce battle pool.
- each battle uses about one-third of eligible vocabulary.
- paired fights have zero word overlap.
- retry keeps same word set.

## Questions

- only Audio → Type and Image → Type.
- audio autoplays after battle audio permission is established.
- replay exists.
- audio countdown starts AFTER initial playback.
- image countdown starts AFTER image ready.
- ambiguous images are never forced.
- Audio is fallback.
- no spelling hints.

## Timers

- after Unit 3 = 10 seconds.
- after Unit 7 = 8 seconds.
- after Unit 9 = 6 seconds.

## Result

- accuracy >= 85% passes.
- accuracy < 85% fails.
- failed battle requires retry.
- no early official victory from decorative HP.

## First-person combat

- no player avatar appears.
- boss is centred and faces camera.
- wrong answer = boss attacks viewer.
- timeout = boss attacks viewer.
- screen edges flash red/coral.
- correct answer = first-person code strike + boss hit.
- no blood/gore.
- boss defeat means purification.

## Assets

- five boss definitions exist.
- ten states per boss supported.
- existing fighter naming convention is followed.
- missing art does not crash development build.
- Codex does not generate character art.

## Persistence

- checkpoint allocations persist.
- paired-fight state persists.
- refresh does not silently generate a new battle word set.

## Responsive

- desktop works.
- phone portrait works.
- phone keyboard does not make battle unusable.

## Stability

- normal WORD//CODE training modes continue working.
- current progress system remains intact.
- production build succeeds.

Once all acceptance criteria are satisfied:

STOP.

Do not continue unrelated refactoring, polishing or repeated verification.
