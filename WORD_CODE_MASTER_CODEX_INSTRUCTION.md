# WORD//CODE — MASTER IMPLEMENTATION INSTRUCTION FOR CODEX

Continue development of the EXISTING WORD//CODE project from its current repository state.

The previous Codex context may have been lost. Do NOT restart the project from scratch, do NOT recreate already implemented systems, and do NOT ask for the old thread. The current repository and the root `AGENTS.md` are the starting source of truth, but the requirements in this document are newer and override any conflicting older requirements.

Read `AGENTS.md` once, inspect only the files relevant to the requested changes, determine what is already implemented, then continue from the existing code.

Do NOT over-investigate the repository. Do NOT repeatedly reread unchanged files. Do NOT run builds after every small edit. Batch related changes, verify once, fix only real failures, then stop.

---

# 1. CURRENT PRODUCT SCOPE

WORD//CODE contains:

- Hello!
- Unit 1
- Unit 2
- Unit 3
- Unit 4
- Unit 5
- Unit 6
- Unit 7
- Unit 8
- Unit 9

At the current stage, `Hello!` is the only fully implemented learning block.

Units 1–9 may remain locked / Coming Soon until their real curriculum is added.

Do NOT invent vocabulary, grammar, phrases, Parts or exercise libraries for future Units merely to populate placeholders.

The architecture must support all Units without requiring future engine rewrites.

---

# 2. ONLY FIVE REGULAR TRAINING MODES

WORD//CODE now has exactly FIVE permanent regular training modes:

1. Repair
2. Audio Code
3. Memory
4. Unscramble
5. Error Hunt

Remove all other regular training modes from the active product.

Remove:
- Final Decode
- Sentence Build
- Dialogue Gap
- Punctuation
- Punctuation Check
- any other regular learning mode outside the approved five

Remove obsolete modes from:
- student UI
- mode cards
- routing
- task generators
- session generation
- types/enums/config
- Teacher Mode
- mastery requirements
- availability logic
- task-template selectors
- tests
- documentation where needed

Do NOT merely hide them while the application still depends on them.

If old local progress contains obsolete mode IDs:
- do not crash;
- safely ignore or migrate them;
- preserve useful existing learner progress;
- do not destructively reset all data.

---

# 3. EXACT REGULAR MODE LOGIC

## 3.1 Repair

Purpose:
restore damaged written English from a partially visible target.

Examples:
`Y _ L L O W` → `YELLOW`
`What’s your n _ me?` → `What’s your name?`

Rules:
- some correct information must remain visible;
- do not hide the entire target;
- Repair must remain easier than Memory;
- prefer pedagogically useful missing positions;
- difficulty may control hidden percentage.

Suggested progression:
- easy: 20–30% hidden
- medium: 30–45% hidden
- hard: 45–60% hidden

## 3.2 Audio Code

Purpose:
audio → written English.

Examples:
audio `purple` → learner types `purple`
audio `How old are you?` → learner types `How old are you?`

Rules:
- do not show target spelling during normal attempt;
- replay is allowed;
- preserve existing working audio mechanics;
- do not rebuild Audio Code unnecessarily;
- prevent browser autocorrect/spellcheck from solving spelling tasks where appropriate.

Use appropriate input attributes where supported:
- `spellCheck={false}`
- `autoCorrect="off"`
- `autoCapitalize="none"`

## 3.3 Memory

Purpose:
visual memory → written recall.

Required sequence:
1. show complete target;
2. allow short memorisation time;
3. hide target completely;
4. learner types from memory.

Suggested display duration:
approximately 2.5–4 seconds depending on target length/difficulty.

Do NOT leave partial-letter hints after the memorisation stage.

## 3.4 Unscramble

Purpose:
restore correct order.

For `word`:
use individual letters.

Example:
`W O L L E Y` → `YELLOW`

Rules:
- every original letter is present;
- no extra letters;
- no missing letters;
- duplicate letters preserved exactly.

For `phrase` / `grammarPattern`:
use words or meaningful chunks.

Example:
`you? / old / How / are` → `How old are you?`

Mobile interaction must be touch-friendly.
Do not rely on tiny precise drag-and-drop.

## 3.5 Error Hunt

Purpose:
repair a realistic incorrect written form.

Examples:
`YELOW` → `YELLOW`
`EIGTH` → `EIGHT`
`Whats your name?` → `What’s your name?`

Allowed controlled errors:
- missing letter
- extra letter
- wrong letter
- transposition
- duplicated letter
- apostrophe error
- capitalisation error
- punctuation error
- curated learner mistake

Prefer curated `commonMistakes`.

Do NOT generate nonsense corruptions.

---

# 4. CONTENT TYPES AND LIBRARIES

Keep clear content types:
- `word`
- `phrase`
- `grammarPattern`

All five regular modes may train these content types where pedagogically appropriate.

Keep the Vocabulary Library.
Keep the Grammar Library.

Do NOT remove grammar just because Sentence Build / Dialogue Gap / Punctuation were removed.

Grammar exercises must use controlled data, not runtime AI generation.

Each grammar point should support a controlled structure conceptually equivalent to:
- patterns
- example pool
- common mistakes
- allowed modes
- difficulty

Example target:
`What’s your name?`

Possible five-mode practice:

Repair:
`What’s your n_me?`

Audio Code:
hear it, type it

Memory:
show → hide → type

Unscramble:
`your / What’s / name / ?`

Error Hunt:
`Whats your name?`

Maintain anti-repetition logic so the learner does not repeatedly receive the exact same task signature, while still allowing spaced retrieval of the same target later.

---

# 5. UNIT PARTS

Every Unit must support Parts.

Use the same conceptual behaviour as the Power Up 2 Part system.

If Power Up 2 code is available, inspect ONLY the relevant Part implementation if needed:
- Part metadata
- `sourcePart`
- Part selection
- `All Parts`
- multi-select
- filtering by Part

Do not inspect the entire Power Up 2 project and do not blindly copy unrelated architecture.

Required behaviour:
- a Unit can contain several Parts;
- a learning item belongs to a Unit and normally one Part;
- learner can select one Part;
- learner can select several Parts;
- learner can select `All Parts`;
- selected Parts define the content pool before task generation.

Conceptual structure:

```ts
type UnitPart = {
  id: string
  unitId: string
  order: number
  title: string
  shortTitle?: string
  sourceTitle?: string
  sourcePage?: string | number
  enabled: boolean
}
```

Learning content may support:

```ts
type LearningItem = {
  id: string
  unitId: string
  partIds: string[]
  contentType: "word" | "phrase" | "grammarPattern"
}
```

Do not over-engineer.

---

# 6. HELLO! PARTS

For Hello!, use meaningful Parts:

1. Numbers
2. Colours
3. Introductions

Do NOT call them generic Part 1 / Part 2 / Part 3 in the UI.

The learner can choose:
- All Parts
- Numbers
- Colours
- Introductions
- any multi-selection combination

Examples:
- Numbers + Colours
- Colours + Introductions
- Numbers + Colours + Introductions

Remember the learner’s most recent valid Part selection per Unit locally.

If saved Part IDs no longer exist, fall back safely to `All Parts`.

Part filtering must happen BEFORE task generation:

```text
Selected Unit
→ Selected Part(s)
→ Eligible learning items
→ Mastery / weak-item weighting
→ Compatible mode
→ Task variation
→ Anti-repetition
→ Session
```

When multiple Parts are selected, mix them with soft balancing rather than finishing one Part completely before another.

---

# 7. HELLO! CONTENT

## Numbers
- one
- two
- three
- four
- five
- six
- seven
- eight
- nine
- ten

## Colours
- red
- blue
- yellow
- green
- orange
- purple
- pink
- grey
- black
- white
- brown

Use British English canonical spelling:
`grey`

## Introductions
Keep approved patterns including:
- Hello!
- Hi!
- What’s your name?
- I’m {name}.
- How old are you?
- I’m {number}.
- This is {name}.
- My favourite colour is {colour}.

---

# 8. TEACHER MODE

Teacher Mode exposes ONLY the five regular modes:
- Repair
- Audio Code
- Memory
- Unscramble
- Error Hunt

Remove obsolete task-type options.

Teacher Mode/data architecture must understand Unit Parts.

Where reasonably supported, allow:
- viewing Parts
- creating a Part
- renaming a Part
- reordering a Part
- enabling/disabling a Part
- assigning content to a Part
- moving content between Parts

Keep the implementation local-first and simple.
Do not turn Teacher Mode into an unnecessary enterprise CMS.

---

# 9. MASTERY

Update mastery so it no longer depends on removed modes.

Repair alone must NOT be sufficient for full mastery.

Conceptual hierarchy:
Repair = lowest contribution
Unscramble / Error Hunt = medium
Memory = high
Audio Code = strongest independent written recall

Preserve existing mastery architecture where possible.

Weak/unstable targets should reappear more often.
After several independent correct recalls, reduce weak-target priority.

---

# 10. FIGHTING CHECKPOINTS — CORE CONCEPT

Add mandatory cumulative fighting checkpoints after:
- Unit 3
- Unit 7
- Unit 9

Hello! is NOT included in fighting vocabulary.

Fighting checkpoints use vocabulary WORDS only.

Do NOT use grammar phrases or sentence tasks in fights.

The fight is FIRST-PERSON.

The learner/player avatar is NEVER shown.

Do NOT use a left-player/right-enemy side-view layout.

The enemy is centred in front of the camera.

The camera represents the learner’s eyes.

The enemy attacks directly toward the viewer.

The learner does NOT kill the opponent.

The learner purifies/restores a corrupted guardian by stabilising language code.

---

# 11. CHECKPOINT AFTER UNIT 3

Opponent:
GLITCH KITSUNE

Vocabulary pool:
Units 1–3

Number of fights:
1

Use approximately one third of all eligible unique vocabulary from Units 1–3.

Formula:
```ts
battleWordCount = Math.ceil(totalEligibleVocabulary / 3)
```

Timer:
10 seconds per answer

Pass requirement:
at least 85% correct

Progression:
Unit 4 remains locked until this fight is passed.

---

# 12. CHECKPOINT AFTER UNIT 7

Fight A:
NULLWEAVER

Fight B:
AETHER GOLEM

Vocabulary pool:
Units 1–7

Each fight uses approximately one third of the eligible Unit 1–7 vocabulary pool.

Words used in Fight A MUST NOT appear in Fight B.

Preselect both fight allocations before Fight A begins.

Timer:
8 seconds per answer in both fights

Pass requirement:
at least 85% correct in EACH fight

Progression:
Unit 8 remains locked until BOTH fights are passed.

If Fight A is passed and Fight B fails:
replay Fight B only.

Do NOT force replay of already passed Fight A.

---

# 13. CHECKPOINT AFTER UNIT 9

Super Battle A:
SIGNAL SERPENT

Final Super Battle:
THE CORRUPTED ARCHIVIST

Vocabulary pool:
Units 1–9

Each fight uses approximately one third of the eligible Unit 1–9 vocabulary pool.

Words used in Super Battle A MUST NOT appear in the final Archivist battle.

Preselect both allocations before Super Battle A begins.

Timer:
6 seconds per answer in both fights

Pass requirement:
at least 85% correct in EACH fight

Final course completion remains locked until both are passed.

---

# 14. BATTLE WORD ALLOCATION

For every fight:

```ts
battleWordCount = Math.ceil(totalEligibleVocabulary / 3)
```

Rules:
- unique words inside a fight;
- no duplicates;
- paired battles use non-overlapping sets;
- persist selected sets until the checkpoint is resolved.

Paired allocation:

```text
eligible cumulative pool
→ shuffle once
→ first one-third = Fight A
→ second non-overlapping one-third = Fight B
→ remaining vocabulary unused in this checkpoint sequence
```

---

# 15. BATTLE RETRY

Official result:

```ts
accuracy = correctAnswers / totalQuestions
```

Pass:

```ts
accuracy >= 0.85
```

Fail:

```ts
accuracy < 0.85
```

On failure:
- keep the SAME selected vocabulary set;
- reshuffle order;
- allow Audio/Image prompt type to vary where valid;
- do NOT generate a completely new one-third set;
- progression remains locked.

---

# 16. BATTLE QUESTION TYPES

Battles use ONLY:
1. Audio → Type
2. Image → Type

Do NOT use inside fights:
- Repair
- Memory
- Unscramble
- Error Hunt
- multiple choice
- visible spelling
- first-letter hints
- translation prompts

Boss fights test active recall.

---

# 17. AUDIO → TYPE IN BATTLES

Reuse the existing Audio Code mechanics.

Required flow:

```text
question loads
→ audio plays automatically if permission exists
→ audio ends
→ answer timer begins
→ learner types answer
```

Replay button remains available.

Replay does NOT:
- pause timer;
- reset timer;
- restart full answer time.

Browser autoplay:
use `ENTER BATTLE` / `START BATTLE` user interaction to initialise audio permission.

If autoplay is still blocked:
show the audio/replay control clearly rather than failing silently.

Do NOT show target spelling.

---

# 18. IMAGE → TYPE IN BATTLES

Show a clear approved local image representing the vocabulary item.

Learner types the English word.

No:
- spelling hint
- first letter
- translation
- multiple choice

Use image prompts only when the intended answer is visually unambiguous.

If the word is abstract or the image would be ambiguous:
use Audio → Type instead.

Do NOT dynamically generate images during battle.

Target approximately 50/50 Audio/Image when content allows, but image eligibility takes priority.

Do not repeat one word just to show both prompt types.

---

# 19. BATTLE TIMER

Checkpoint after Unit 3:
10 sec

Checkpoint after Unit 7:
8 sec

Checkpoint after Unit 9:
6 sec

Timeout counts as incorrect.

Recommended timer:
- cyan/blue normal
- gold late
- coral/red critical

Last seconds may pulse subtly.

Do not aggressively flash the entire screen.

---

# 20. BATTLE ANSWER HANDLING

Desktop:
- support Enter

Mobile:
- support keyboard submit where available
- provide large explicit submit button

Normalise safe differences:
- trim spaces
- case-insensitive ordinary vocabulary comparison

Do NOT silently correct actual spelling mistakes.

Example:
`Purple` = `purple`
but
`purpel` = incorrect

Prevent double scoring if timeout and submission happen nearly simultaneously.

Use explicit question state such as:
- active
- submitted
- resolved
- transitioning

One question must be scored exactly once.

---

# 21. FIRST-PERSON DAMAGE

On incorrect answer or timeout:

```text
boss attack animation
→ boss moves toward camera
→ impact
→ brief camera shake
→ red/coral edge vignette
→ brief digital/chromatic distortion
→ return to normal
```

Recommended duration:
approximately 350–650 ms.

No blood.
No gore.
No long unreadable screen obstruction.

If `prefers-reduced-motion` is enabled:
use a lighter static red edge pulse instead of strong shake.

---

# 22. CORRECT ANSWER FEEDBACK

On correct answer:

```text
freeze input
→ stop timer
→ invisible player/code strike
→ boss performs hit reaction
→ corruption particles break away
→ update progress
→ next question
```

The learner is never visually shown.

Player-origin strike may come from:
- bottom-centre
- screen edge
- cyan code pulse
- holographic projectile

Do not show hands or weapons unless added later intentionally.

---

# 23. BOSS HUD

Recommended compact HUD:
- boss name
- CORRUPTION or CODE INTEGRITY
- learner ACCURACY optionally

Do NOT add excessive RPG statistics.

The boss bar is visual only.

Do NOT end the fight early because the decorative bar reaches zero.

All selected words should normally be answered.

Official result is always:

```ts
correct / total >= 0.85
```

---

# 24. COURSE MAP BATTLE REVEAL

After completing the relevant Unit:

1. normal Unit completion finishes;
2. map environment briefly reacts;
3. corrupted signal travels through the map;
4. checkpoint node activates;
5. boss silhouette/corrupted marker appears;
6. short message appears;
7. learner manually enters the fight.

Suggested messages:

`CORRUPTED SIGNAL DETECTED`

`CHECKPOINT BREACH`

Button:
`ENTER BATTLE`

Do NOT automatically throw the learner into battle.

---

# 25. BATTLE NODE LABELS

After Unit 3:
`CHECKPOINT 03`
`GLITCH KITSUNE`

After Unit 7:
`CHECKPOINT 07-A`
`NULLWEAVER`

`CHECKPOINT 07-B`
`AETHER GOLEM`

After Unit 9:
`SUPER BATTLE 09-A`
`SIGNAL SERPENT`

`FINAL SUPER BATTLE`
`THE CORRUPTED ARCHIVIST`

---

# 26. PRE-BATTLE BOSS DIALOGUE

Before every battle, the opponent speaks to the learner.

This happens after the boss reveal but BEFORE the learner presses `START BATTLE`.

Keep lines short, atmospheric and understandable for young English learners.

Do NOT write long lore speeches.

The boss is still corrupted at this point.

Recommended flow:

```text
boss reveal
→ boss name
→ short boss line
→ START BATTLE
```

Suggested default lines:

GLITCH KITSUNE:
`You cannot clear this signal.`

NULLWEAVER:
`Your words will disappear in my web.`

AETHER GOLEM:
`Your code will not pass.`

SIGNAL SERPENT:
`The signal belongs to me now.`

THE CORRUPTED ARCHIVIST:
`The Archive is closed to you.`

These lines may be adjusted slightly for tone, but keep them concise and age-appropriate.

---

# 27. BOSS STATE SET

Every boss uses:

1. base
2. idle
3. quick-attack
4. heavy-attack
5. block
6. counter
7. hit
8. ultimate
9. victory
10. defeat / purified

Bosses face the viewer.

Attack states target the camera.

State usage:
- idle = waiting for answer
- quick-attack = normal incorrect answer
- heavy-attack = timeout / stronger failure moment
- block = optional defence/transition
- counter = optional special response
- hit = correct answer
- ultimate = rare visual event
- victory = learner failed (<85%)
- defeat = learner passed and boss is purified

No gore or death.

---

# 28. APPROVED BOSSES

Use:

## Checkpoint 03
GLITCH KITSUNE

## Checkpoint 07
NULLWEAVER
AETHER GOLEM

## Checkpoint 09
SIGNAL SERPENT
THE CORRUPTED ARCHIVIST

Do NOT reuse Chronofang.

Do NOT reuse Power Up 2 opponents.

---

# 29. FINAL BOSS DESIGN — ORIGINAL HUMANOID ARCHIVIST

Use the ORIGINAL humanoid concept for THE CORRUPTED ARCHIVIST.

Do NOT use the bird/drill/propeller version in WORD//CODE.

The bird version belongs to another project.

THE CORRUPTED ARCHIVIST is:
- tall humanoid techno-magical guardian;
- elegant, slender, powerful silhouette;
- long layered coat/robe;
- ivory fabric;
- dark navy technological panels;
- warm gold details;
- refined futuristic mask;
- narrow luminous cyan eyes;
- large broken holographic halo;
- floating translucent archive pages / data shards;
- abstract glyph fragments;
- one side clean cyan / ivory / gold;
- one side invaded by violet-magenta corruption;
- fragmented corrupted armour;
- majestic, intelligent and tragic;
- not evil-looking for the sake of horror;
- not a bird;
- not a drill creature;
- not propeller-winged.

It represents the corrupted guardian of the entire language archive.

---

# 30. BATTLE ASSET PATHS

Use:

```text
src/assets/battles/
  checkpoint-03/
    glitch-kitsune/

  checkpoint-07/
    nullweaver/
    aether-golem/

  checkpoint-09/
    signal-serpent/
    corrupted-archivist/

  shared/
    fx/
    arenas/
```

---

# 31. BOSS FILE NAMES

## Glitch Kitsune

```text
glitch-kitsune-base.png
glitch-kitsune-idle.png
glitch-kitsune-quick-attack.png
glitch-kitsune-heavy-attack.png
glitch-kitsune-block.png
glitch-kitsune-counter.png
glitch-kitsune-hit.png
glitch-kitsune-ultimate.png
glitch-kitsune-victory.png
glitch-kitsune-defeat.png
```

## Nullweaver

```text
nullweaver-base.png
nullweaver-idle.png
nullweaver-quick-attack.png
nullweaver-heavy-attack.png
nullweaver-block.png
nullweaver-counter.png
nullweaver-hit.png
nullweaver-ultimate.png
nullweaver-victory.png
nullweaver-defeat.png
```

## Aether Golem

```text
aether-golem-base.png
aether-golem-idle.png
aether-golem-quick-attack.png
aether-golem-heavy-attack.png
aether-golem-block.png
aether-golem-counter.png
aether-golem-hit.png
aether-golem-ultimate.png
aether-golem-victory.png
aether-golem-defeat.png
```

## Signal Serpent

```text
signal-serpent-base.png
signal-serpent-idle.png
signal-serpent-quick-attack.png
signal-serpent-heavy-attack.png
signal-serpent-block.png
signal-serpent-counter.png
signal-serpent-hit.png
signal-serpent-ultimate.png
signal-serpent-victory.png
signal-serpent-defeat.png
```

## Corrupted Archivist

```text
corrupted-archivist-base.png
corrupted-archivist-idle.png
corrupted-archivist-quick-attack.png
corrupted-archivist-heavy-attack.png
corrupted-archivist-block.png
corrupted-archivist-counter.png
corrupted-archivist-hit.png
corrupted-archivist-ultimate.png
corrupted-archivist-victory.png
corrupted-archivist-defeat-purified.png
```

Shared reusable FX go into:

```text
src/assets/battles/shared/fx/
```

Arena art goes into:

```text
src/assets/battles/shared/arenas/
```

---

# 32. POST-BATTLE PURIFICATION DIALOGUE

This is mandatory for every PASSED fight.

When accuracy is at least 85%, do NOT immediately jump to the result screen.

Required visual flow:

```text
final question resolved
→ hostile combat ends
→ corruption breaks apart
→ purified boss state appears
→ arena lighting shifts to clean cyan/gold
→ short pause approximately 500–900 ms
→ purified opponent speaks to learner
→ learner presses CONTINUE
→ result / CODE STABILIZED screen
→ progression unlock
```

During this scene:
- stop timer;
- remove red damage effects;
- stop attack behaviour;
- fade hostile corruption pulse;
- use calm restored audio/lighting.

The purified boss remains visible while speaking.

Do NOT auto-skip the thank-you dialogue.

Use a clear `CONTINUE` button.

Internally, the victory may be stored before the dialogue to prevent reload data loss, but the normal visual flow must still show the dialogue.

---

# 33. PURIFIED DIALOGUE LINES

## GLITCH KITSUNE

Asset:
`glitch-kitsune-defeat.png`

Dialogue:
`Thank you. The signal is clear again.`

## NULLWEAVER

Asset:
`nullweaver-defeat.png`

Dialogue:
`Thank you. I can see the true code again.`

## AETHER GOLEM

Asset:
`aether-golem-defeat.png`

Dialogue:
`Thank you. My core is stable again.`

## SIGNAL SERPENT

Asset:
`signal-serpent-defeat.png`

Dialogue:
`Thank you. The signal is free again.`

## THE CORRUPTED ARCHIVIST

Asset:
`corrupted-archivist-defeat-purified.png`

Dialogue line 1:
`Thank you. The Archive is safe again.`

Then optionally line 2:
`You restored every code.`

Then:
`CONTINUE`

---

# 34. FAILED BATTLE ENDING

If accuracy is below 85%:

- boss remains corrupted;
- boss uses `victory`;
- do NOT show purification;
- do NOT show thank-you dialogue;
- do NOT unlock progression.

Display:
`CODE UNSTABLE`

Show:
`ACCURACY: XX%`
`REQUIRED: 85%`

Button:
`RETRY BATTLE`

Do not shame the learner.

---

# 35. FINAL ARCHIVIST ENDING

The final Archivist ending must be larger than normal checkpoint endings.

Required flow:

```text
final question resolved
→ corruption collapses
→ purified humanoid Archivist appears
→ broken archive halo reconnects
→ violet fragments become clean cyan/gold archive shards
→ hostile battle audio fades
→ soft restoration chime
→ Archivist says:
   "Thank you. The Archive is safe again."
→ second line:
   "You restored every code."
→ learner presses CONTINUE
→ arena fades into restored WORD//CODE world
→ final CODE STABILIZED
→ final reward / achievement / course completion
→ return to restored course map
```

The Archivist must NOT vanish immediately after purification.

The learner must clearly understand that the enemy was restored rather than destroyed.

---

# 36. BATTLE PERSISTENCE

Persist locally at least:
- checkpoint ID
- locked/unlocked
- completed
- best accuracy
- selected battle word set
- paired Fight A allocation
- paired Fight B allocation
- Fight A passed state
- Fight B passed state
- retry state
- victory stored before purification dialogue where needed
- dialogue/completion state if necessary for safe reload

Do not lose progress on reload.

---

# 37. MOBILE-FIRST BATTLE REQUIREMENTS

Phone use is a priority.

On mobile:
- portrait orientation;
- no required rotation;
- no horizontal scrolling;
- boss remains readable;
- timer readable;
- input large;
- submit button large;
- on-screen keyboard must not cover essential controls;
- active fight should ideally fit in usable viewport.

Use responsive scaling rather than tiny desktop controls.

---

# 38. VISUAL STYLE

Keep WORD//CODE visual identity:
- bright techno-fantasy
- gentle cyberpunk
- warm anime-inspired atmosphere
- cyan / violet / gold energy
- magical digital corruption
- premium rather than preschool
- not horror
- not gritty dystopia

Bosses may be darker and more dramatic than normal lesson screens while still belonging to the same visual universe.

---

# 39. PERFORMANCE

Avoid:
- huge video backgrounds
- unnecessary heavy canvas rendering
- continuous expensive shaders
- excessive particle counts
- giant uncompressed animation assets

Prefer:
- transparent PNG/WebP boss states
- CSS transforms
- Motion
- lightweight overlays
- shared reusable effects

Use shared effects for:
- player strike
- boss hit
- red damage vignette
- screen crack/distortion
- corrupted particles
- purification particles
- shield
- parry/counter flash
- ultimate charge
- ultimate impact
- victory burst
- corrupted map signal

Do NOT bake every effect into every boss asset unnecessarily.

---

# 40. UPDATE AGENTS.md

After implementation, update the root `AGENTS.md` so it reflects the current architecture.

Remove outdated references to:
- removed regular modes
- old mode counts
- obsolete mastery dependencies
- old final-boss bird concept if documented for WORD//CODE

Add/update:
- five permanent regular modes
- Unit Parts
- Hello! Parts
- multi-select / All Parts
- cumulative fighting checkpoints
- 10 / 8 / 6 second timer progression
- Audio → Type / Image → Type battle questions
- 85% pass requirement
- first-person boss design
- boss sequence
- purification dialogue
- original humanoid Corrupted Archivist final boss

Do not rewrite unrelated documentation unnecessarily.

---

# 41. EXECUTION / CONTEXT BUDGET

Work economically.

Do NOT:
- recursively inspect the whole repository;
- dump huge files unnecessarily;
- repeatedly reread AGENTS.md;
- reopen unchanged files;
- run build after each edit;
- run every test suite repeatedly;
- inspect unrelated assets;
- refactor unrelated working code;
- generate lots of screenshots;
- invent future Unit content;
- create speculative cloud systems.

Preferred workflow:

```text
read AGENTS.md once
→ locate relevant files
→ inspect existing implementation
→ apply five-mode cleanup if still required
→ ensure Parts architecture
→ implement battle checkpoint data/state
→ implement cumulative word allocation
→ implement progression gates
→ implement first-person battle UI
→ reuse Audio Code
→ implement Image → Type
→ implement timers
→ connect boss states/assets
→ implement pre-battle dialogue
→ implement pass/fail logic
→ implement purification thank-you dialogue
→ implement final Archivist ending
→ persist progress
→ update AGENTS.md
→ targeted tests/checks
→ one final build/typecheck
→ one desktop visual check
→ one mobile portrait check
→ STOP
```

Once acceptance criteria are satisfied, do not continue polishing unrelated systems.

---

# 42. ACCEPTANCE CRITERIA

Implementation is complete when:

## Regular learning
- only Repair, Audio Code, Memory, Unscramble, Error Hunt remain;
- Unit Parts work;
- Hello! uses Numbers / Colours / Introductions;
- multi-Part selection works;
- `All Parts` works;
- filtering happens before task generation;
- mastery no longer depends on removed modes.

## Checkpoints
- checkpoint appears after Unit 3;
- two fights appear after Unit 7;
- two final fights appear after Unit 9;
- progression is correctly gated.

## Vocabulary
- Unit 3 battle uses approximately one-third of Units 1–3 vocabulary;
- Unit 7 battles each use one-third of Units 1–7;
- Unit 7 paired fights do not repeat words;
- Unit 9 battles each use one-third of Units 1–9;
- Unit 9 paired fights do not repeat words;
- words do not duplicate within one fight.

## Question modes
- only Audio → Type and Image → Type are used in fights;
- audio autoplay is attempted after user permission;
- replay works;
- audio timer starts only after initial playback finishes;
- replay does not reset timer;
- Image → Type is used only with clear approved images.

## Timing
- Unit 3 = 10 seconds;
- Unit 7 = 8 seconds;
- Unit 9 = 6 seconds;
- timeout counts incorrect.

## First-person combat
- player avatar is never shown;
- boss is centred and faces camera;
- wrong answer triggers direct-to-camera attack;
- screen receives short red/coral hit feedback;
- correct answer triggers boss hit/purification feedback.

## Results
- 85% is required;
- failed fight reuses same selected vocabulary set;
- already passed Fight A does not need replay if Fight B fails;
- failed fights do not show purification dialogue;
- passed fights show purified final boss state;
- purified opponent says thank you;
- learner presses CONTINUE before result/completion;
- final Archivist ending is larger and clearly communicates full archive restoration.

## Final boss
- WORD//CODE uses the original HUMANOID Corrupted Archivist;
- bird/drill/propeller Archivist is NOT used in this project.

## Technical
- progress persists;
- existing functionality remains intact;
- desktop works;
- mobile portrait works;
- final build/typecheck succeeds.

After all acceptance criteria are satisfied:

STOP.
