# WORD//CODE — CONTINUE PREVIOUS CODEX CHAT
## Current master implementation update

Continue the EXISTING WORD//CODE project from the exact repository state left by the previous Codex chat.

Do NOT start again from scratch.
Do NOT create a parallel implementation.
Do NOT revert working systems to older specifications.
Read the root `AGENTS.md` once, inspect only relevant files, identify what is already implemented, then continue.

This instruction is newer than earlier WORD//CODE instructions and overrides conflicting older notes.

Work economically:
- inspect only relevant files;
- batch related edits;
- do not repeatedly reread unchanged files;
- do not run a build after every small change;
- run targeted checks, then one final typecheck/build;
- check desktop and mobile portrait once;
- then STOP.

---

# 1. CURRENT PRODUCT

Project: `WORD//CODE`

Course direction: Power Up 1.

Current learning architecture must support:
- Hello!
- Units 1–9
- Unit Parts
- regular spelling games
- cumulative fighting checkpoints after Units 3, 7 and 9
- local persistence
- desktop + mobile portrait

Do not invent missing future Unit curriculum merely to fill placeholders.

The main learner problem is weak written recall/spelling, while much of the vocabulary is already known orally.

---

# 2. EXACT REGULAR GAME SET

There are now exactly FIVE regular learning games:

1. Repair
2. Audio Code
3. Memory
4. Unscramble
5. Error Hunt

Keep removed:
- Final Decode
- Sentence Build
- Dialogue Gap
- Punctuation / Punctuation Check
- any other obsolete regular mode

Remove obsolete modes from UI, routing, session generation, Teacher Mode, mastery dependencies, config/types and tests where still present.

Old saved progress containing obsolete mode IDs must fail safely and must not reset all learner progress.

---

# 3. REPAIR

Purpose:
restore a partially damaged written target.

Examples:

`Y _ L L O W` → `YELLOW`

`What’s your n_me?` → `What’s your name?`

Rules:
- never hide the whole answer;
- keep meaningful visible letters;
- prefer pedagogically useful gaps;
- Repair remains easier than independent recall.

Suggested hiding:
- easy: 20–30%
- medium: 30–45%
- hard: 45–60%

Repair alone must not create full mastery.

---

# 4. AUDIO CODE

Purpose:
hear English → type English.

Rules:
- no visible spelling hint during attempt;
- replay allowed;
- reuse current audio system;
- prevent browser spelling assistance where appropriate.

Use equivalents of:

```tsx
spellCheck={false}
autoCorrect="off"
autoCapitalize="none"
```

Audio Code is the strongest independent written-recall signal in regular learning.

---

# 5. MEMORY

Required flow:

```text
show full target
→ wait about 2.5–4 sec
→ hide completely
→ learner types from memory
```

After hiding:
- no partial word;
- no first letter;
- no ghost answer.

Memory is a high mastery signal.

---

# 6. UNSCRAMBLE

For words:
- use every original letter exactly;
- preserve duplicates;
- no extra letters;
- no missing letters.

For phrases/grammar:
- scramble words or meaningful chunks.

Mobile:
- large touch targets;
- tapping/selecting must work;
- do not depend on precise drag-and-drop.

---

# 7. ERROR HUNT

Show a realistic incorrect form and require correction.

Allowed errors:
- missing letter
- extra letter
- wrong letter
- transposition
- duplicate letter
- apostrophe
- capitalisation
- punctuation
- curated learner/common mistake

Prefer curated `commonMistakes`.

Avoid nonsense corruptions.

---

# 8. CONTENT TYPES / GRAMMAR

Keep:
- `word`
- `phrase`
- `grammarPattern`

Keep Vocabulary Library and Grammar Library.

Grammar still uses the same five games where appropriate.

Do not use runtime AI to invent student tasks.

---

# 9. UNIT PARTS

Every Unit must support Parts.

Learner can select:
- one Part;
- several Parts;
- `All Parts`.

`All Parts` is a selection state, not a fake curriculum Part.

Filtering order:

```text
Unit
→ selected Parts
→ eligible content
→ mastery/review weighting
→ compatible game
→ task variation
→ anti-repetition
→ session
```

Remember latest valid Part selection locally.

If saved Part IDs become invalid, fall back to `All Parts`.

Multi-selected Parts should be softly balanced so one large Part does not dominate.

Hello! uses:
- Numbers
- Colours
- Introductions

Do not label these generically as Part 1 / Part 2 / Part 3.

---

# 10. MASTERY

Current mastery hierarchy:

```text
Repair = low
Unscramble = medium
Error Hunt = medium
Memory = high
Audio Code = strongest
```

Weak/unstable words should return more often.

After several independent successful recalls, reduce weak-word priority.

Preserve existing scheduler architecture where possible.

---

# 11. FIGHTING CHECKPOINTS — CORE

Add/finish mandatory cumulative fighting checkpoints after:
- Unit 3
- Unit 7
- Unit 9

Hello! is excluded from battle vocabulary.

Battle content:
- vocabulary `word` only;
- no grammar phrases;
- no sentence tasks.

Battle question types are ONLY:

1. Audio → Type
2. Image → Type

Do NOT use in battle:
- Repair
- Memory
- Unscramble
- Error Hunt
- multiple choice
- translation
- spelling hints
- first-letter hints

---

# 12. FIRST-PERSON BATTLE

The learner avatar is NEVER shown.

The boss is centred and faces the camera.

The camera is the learner’s point of view.

Wrong answer/timeout:
- boss attacks toward the camera;
- brief red/coral screen-edge vignette;
- slight shake;
- subtle digital/chromatic distortion;
- no blood/gore.

Correct answer:
- invisible player-origin cyan/code strike;
- boss `hit` state;
- corruption particles break away.

The learner is purifying/restoring corrupted guardians, not killing them.

---

# 13. BATTLE PROMPT METADATA

Vocabulary should support explicit battle prompt eligibility.

Use an equivalent of:

```ts
type BattlePromptMode = "image" | "audio" | "either";

type VocabularyItem = {
  // existing fields...
  battlePrompt?: BattlePromptMode;
  battleImage?: string;
  battleAcceptedAnswers?: string[];
}
```

Rules:

`image`
- use Image → Type;
- valid approved local image required.

`audio`
- always Audio → Type.

`either`
- scheduler may choose image/audio.

Do NOT force ambiguous vocabulary into image prompts just to hit a visual quota.

Aim roughly for a mixed battle when possible, but clarity beats 50/50 balance.

---

# 14. CHECKPOINT AFTER UNIT 3

Boss:

`GLITCH KITSUNE`

Vocabulary pool:

Units 1–3 only.

Selected words:

```ts
Math.ceil(totalEligibleUniqueVocabulary / 3)
```

One battle.

Timer:

10 seconds per answer.

Pass:

```ts
accuracy >= 0.85
```

Unit 4 remains locked until passed.

Map:

```text
CHECKPOINT 03
GLITCH KITSUNE
```

---

# 15. CHECKPOINT AFTER UNIT 7

Fight A:

`NULLWEAVER`

Fight B:

`AETHER GOLEM`

Pool:

Units 1–7.

Each fight:

approximately one third of eligible unique vocabulary.

Fight A and Fight B must NOT overlap.

Allocate both sets before Fight A:

```text
eligible cumulative pool
→ shuffle once
→ first one-third = Fight A
→ second non-overlapping one-third = Fight B
→ remainder unused for this checkpoint sequence
```

Timer:

8 seconds.

Pass:

85% in EACH fight.

Unit 8 remains locked until both pass.

If Fight A passed and Fight B fails:
- replay Fight B only.

Map:

```text
CHECKPOINT 07-A
NULLWEAVER

CHECKPOINT 07-B
AETHER GOLEM
```

---

# 16. CHECKPOINT AFTER UNIT 9

Fight A:

`SIGNAL SERPENT`

Fight B:

`THE CORRUPTED ARCHIVIST`

Pool:

Units 1–9.

Each fight:
- approximately one third;
- non-overlapping paired sets;
- allocate both before Fight A.

Timer:

6 seconds.

Pass:

85% in EACH fight.

Final completion remains locked until both pass.

Map:

```text
SUPER BATTLE 09-A
SIGNAL SERPENT

FINAL SUPER BATTLE
THE CORRUPTED ARCHIVIST
```

---

# 17. RETRY RULE

Failure must NOT reroll a new vocabulary set.

If accuracy <85%:
- keep the SAME selected battle word set;
- reshuffle order;
- prompt may vary only if item is `either`;
- optionally move previously wrong words earlier.

Display:

```text
CODE UNSTABLE
ACCURACY: XX%
REQUIRED: 85%
```

Button:

`RETRY BATTLE`

This prevents learners from escaping weak words through random rerolls.

---

# 18. AUDIO → TYPE BATTLE FLOW

Reuse Audio Code infrastructure.

Required:

```text
question loads
→ initial audio autoplays
→ audio finishes
→ timer starts
→ learner types
```

Replay remains available.

Replay:
- does not reset timer;
- does not pause timer;
- does not restart full answer time.

Use `ENTER BATTLE` / `START BATTLE` user interaction to establish audio permission.

If autoplay is blocked, show the audio control clearly.

---

# 19. IMAGE → TYPE BATTLE FLOW

Required:

```text
show approved image
→ timer starts
→ learner types English word
→ submit
```

Do not show:
- target spelling;
- translation;
- first letter;
- answer choices.

Use only approved local images.

Never generate an image during the battle.

If an image could reasonably mean two different target words, use Audio instead.

---

# 20. TIMER / SCORING SAFETY

Timer:
- after Unit 3: 10 sec
- after Unit 7: 8 sec
- after Unit 9: 6 sec

Timeout:
- incorrect;
- boss attacks;
- continue after feedback.

Prevent timeout/submit race conditions.

Each question can be scored exactly once.

Use a question lifecycle equivalent to:

```ts
"active"
"submitted"
"resolved"
"transitioning"
```

Official accuracy:

```ts
correctAnswers / totalQuestions
```

Decorative boss HP/corruption bar must not end the fight early.

---

# 21. BOSS STATES

Each boss uses 10 states:

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

Suggested state semantics:

- base = reveal
- idle = waiting for answer
- quick-attack = wrong answer
- heavy-attack = timeout / stronger failure
- hit = correct answer
- victory = learner failed battle
- defeat = purified after learner passes

No death/gore interpretation.

---

# 22. CURRENT BOSSES

Use ONLY these WORD//CODE checkpoint opponents:

After Unit 3:
- GLITCH KITSUNE

After Unit 7:
- NULLWEAVER
- AETHER GOLEM

After Unit 9:
- SIGNAL SERPENT
- THE CORRUPTED ARCHIVIST

Do NOT use Chronofang.

---

# 23. FINAL BOSS UPDATE

Use the ORIGINAL HUMANOID Corrupted Archivist.

Do NOT use the bird/drill/propeller version in WORD//CODE.

The bird design is being saved for another game.

Current Corrupted Archivist:
- humanoid techno-magical archive guardian;
- tall elegant silhouette;
- refined futuristic mask;
- cyan glowing eyes;
- ivory + navy layered robe/armour;
- gold details;
- broken archive halo;
- floating data/archive shards;
- one clean cyan/white/gold side;
- one violet-magenta corrupted side;
- majestic/intelligent/tragic;
- not horror;
- not bird-like.

---

# 24. PRE-BATTLE DIALOGUE

Every boss speaks BEFORE the battle starts.

Flow:

```text
arena load
→ boss reveal
→ boss name
→ short corrupted line
→ START BATTLE
```

Current lines:

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

Do not auto-start the timer before `START BATTLE`.

---

# 25. MAP ACTIVATION

After Unit 3 / 7 / 9 completion:

```text
normal Unit completion
→ map reacts
→ corrupted signal travels
→ checkpoint node activates
→ boss silhouette appears
→ system message
→ ENTER BATTLE
```

Suggested system copy:

`CORRUPTED SIGNAL DETECTED`

or

`CHECKPOINT BREACH`

Never automatically throw the learner into combat.

---

# 26. NEW PURIFICATION ENDING

When the learner passes with >=85%, do NOT immediately jump to results.

Required:

```text
last question resolved
→ combat stops
→ corruption breaks apart
→ purified boss image appears
→ hostile violet/red effects fade
→ lighting shifts to cyan/gold
→ short pause about 500–900 ms
→ purified boss speaks
→ learner presses CONTINUE
→ CODE STABILIZED
→ progression unlock
```

The purified opponent must remain visible while speaking.

The learner must understand that the opponent was RESTORED.

---

# 27. THANK-YOU LINES

GLITCH KITSUNE:

`Thank you. The signal is clear again.`

NULLWEAVER:

`Thank you. I can see the true code again.`

AETHER GOLEM:

`Thank you. My core is stable again.`

SIGNAL SERPENT:

`Thank you. The signal is free again.`

THE CORRUPTED ARCHIVIST:

`Thank you. The Archive is safe again.`

Then:

`You restored every code.`

Then:

`CONTINUE`

Do not auto-skip these lines.

Failure must never show the thank-you/purification scene.

---

# 28. FINAL ARCHIVIST ENDING

Final battle must have a larger ending:

```text
final answer
→ corruption collapses
→ purified humanoid Archivist
→ broken halo reconnects
→ violet fragments become cyan/gold archive shards
→ hostile audio fades
→ restoration chime
→ "Thank you. The Archive is safe again."
→ "You restored every code."
→ CONTINUE
→ arena fades into restored WORD//CODE world
→ final CODE STABILIZED
→ final reward / achievement / course completion
→ restored course map
```

---

# 29. BATTLE ASSET STRUCTURE

Use current structure if it already exists.

Preferred:

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

  vocabulary/
    unit-01/
    unit-02/
    unit-03/
    unit-04/
    unit-05/
    unit-06/
    unit-07/
    unit-08/
    unit-09/

  shared/
    fx/
    arenas/
```

Do not reorganise a working equivalent structure purely for aesthetics.

---

# 30. UNIT 1–3 BATTLE IMAGE PACK — NEW

A prepared image pack now exists for Units 1–3.

These are for `Image → Type` in Checkpoint 03.

Use clean English filenames.

## Unit 1

```text
01_bag.png
02_book.png
03_pen.png
04_pencil.png
05_pencil_case.png
06_rubber.png
07_board.png
08_bookcase.png
09_cupboard.png
10_window.png
11_door.png
12_paper.png
13_wall.png
14_desk.png
15_chair.png
16_teacher.png
17_crayons.png
18_ruler.png
19_playground.png
20_classroom.png
```

Map to:
- bag
- book
- pen
- pencil
- pencil case
- rubber
- board
- bookcase
- cupboard
- window
- door
- paper
- wall
- desk
- chair
- teacher
- crayons
- ruler
- playground
- classroom

Use British `rubber`.

Match singular/plural target to actual curriculum data if `crayon` rather than `crayons` is canonical.

## Unit 2

Current generated set:

```text
01_eye.png
02_nose.png
03_mouth.png
04_ear.png
05_face.png
06_head.png
07_hair.png
08_arm.png
09_leg.png
10_foot.png
```

Map to:
- eye
- nose
- mouth
- ear
- face
- head
- hair
- arm
- leg
- foot

Other Unit 2 vocabulary without approved images stays Audio for now.

Family relationship words should stay Audio unless a future unambiguous visual set is added.

## Unit 3

```text
01_cat.png
02_dog.png
03_goat.png
04_sheep.png
05_horse.png
06_cow.png
07_donkey.png
08_duck.png
09_chicken.png
10_spider.png
```

Map to:
- cat
- dog
- goat
- sheep
- horse
- cow
- donkey
- duck
- chicken
- spider

Unit 3 adjectives/descriptors should normally stay Audio:
- big
- small
- long
- short
- old
- young
- nice
- happy
- sad
- angry
- funny
- beautiful
- ugly

Do not make an image prompt if the learner could reasonably type another valid course word.

---

# 31. IMPORTANT BATTLE SELECTION ORDER

Do NOT build battle vocabulary by taking only words that have images.

Correct order:

```text
cumulative vocabulary pool
→ remove ineligible/non-word items
→ choose the required one-third unique word set
→ assign image/audio prompt according to metadata
→ build battle sequence
```

Images are a presentation mode, not a vocabulary-selection filter.

---

# 32. FUTURE UNITS

Units 4–9 images will be added later.

Battle engine must already support them.

Until approved local image exists:
- use Audio.

Do not invent missing image assets now.

---

# 33. SHARED FX

Prefer reusable effects for:
- player cyan strike
- boss hit
- red damage vignette
- corruption particles
- purification particles
- shield impact
- parry/counter flash
- ultimate charge/impact
- victory burst
- map corruption signal

Do not bake every UI effect into boss PNGs unnecessarily.

---

# 34. PERSISTENCE

Persist locally:
- checkpoint unlocked/completed
- selected fight word set
- paired Fight A/B allocation
- Fight A completion
- Fight B completion
- best accuracy
- retry state
- final completion
- enough purification state to avoid losing a valid victory on reload

If victory is saved before the thank-you scene for safety, still show the normal purification dialogue in ordinary flow.

---

# 35. MOBILE

Battle portrait requirements:
- boss visible in upper area;
- prompt visible;
- image prompt must not crowd out typing controls;
- timer readable;
- input large;
- submit large;
- keyboard must not hide essential controls;
- avoid active-fight horizontal scroll.

Use responsive clamp sizing.

---

# 36. TEACHER MODE

Teacher Mode uses only the five regular learning games.

It must understand Parts.

If straightforward, expose battle prompt metadata:
- Audio
- Image
- Either
- associated image

Do not build a large CMS.

---

# 37. BACKWARD COMPATIBILITY

Do not destroy existing local data.

Add safe migrations/defaults for:
- removed game modes;
- Parts;
- battle prompt metadata;
- checkpoints;
- paired battle allocations;
- purification/completion.

Reuse current migration mechanism if one already exists.

---

# 38. IMPLEMENTATION ORDER

Use this sequence:

```text
read AGENTS.md once
→ inspect relevant current WORD//CODE files
→ identify already completed work
→ finish five-game cleanup if needed
→ verify Parts and session filtering
→ verify mastery/scheduler
→ add/finish battle prompt metadata
→ add Unit 1–3 image mappings
→ add/finish checkpoint configs
→ implement one-third cumulative selection
→ implement paired non-overlap allocation
→ implement same-set retry
→ Audio → Type battle
→ Image → Type battle
→ 10/8/6 timers
→ first-person feedback
→ boss state wiring
→ pre-battle dialogue
→ map checkpoint activation
→ pass/fail results
→ purification thank-you scenes
→ final Archivist ending
→ persistence/migrations
→ update AGENTS.md
→ targeted tests
→ one final typecheck/build
→ one desktop check
→ one mobile portrait check
→ STOP
```

---

# 39. ACCEPTANCE CRITERIA

Regular learning:
- exactly five games remain;
- obsolete modes are not selectable;
- Parts work before task generation;
- mastery uses updated hierarchy;
- weak-word review still works.

Checkpoint 03:
- revealed after Unit 3;
- GLITCH KITSUNE;
- Units 1–3 only;
- Hello! excluded;
- one-third unique vocabulary;
- Unit 1–3 image pack works;
- ambiguous/non-image items use Audio;
- 10 sec;
- 85% required;
- retry same set;
- purification thank-you;
- Unit 4 gated.

Checkpoint 07:
- NULLWEAVER + AETHER GOLEM;
- Units 1–7;
- two preallocated non-overlapping sets;
- 8 sec;
- 85% each;
- Fight B fail does not reset passed Fight A;
- Unit 8 gated;
- both purification scenes work.

Checkpoint 09:
- SIGNAL SERPENT + humanoid CORRUPTED ARCHIVIST;
- Units 1–9;
- paired non-overlapping sets;
- 6 sec;
- 85% each;
- bird Archivist NOT used;
- final thank-you dialogue;
- final completion after CONTINUE.

Technical:
- no double scoring;
- progress persists;
- current project functionality remains intact;
- mobile portrait works;
- desktop works;
- final typecheck/build passes.

---

# 40. UPDATE AGENTS.md

At the end, update the root `AGENTS.md` to reflect:
- five current games;
- Parts;
- current mastery hierarchy;
- fighting checkpoints after 3/7/9;
- Audio → Type + Image → Type;
- cumulative one-third selection;
- paired non-overlap;
- same-set retry;
- timers 10/8/6;
- 85% pass;
- current bosses;
- humanoid Corrupted Archivist;
- pre-battle dialogue;
- purification thank-you dialogue;
- Unit 1–3 battle image metadata/paths.

Remove stale contradictory notes only.

---

# 41. STOP CONDITION

When all relevant acceptance criteria pass and final build succeeds:

STOP.

Do not continue with:
- speculative Unit 4–9 content;
- new game modes;
- unrelated redesign;
- backend/accounts/cloud;
- unnecessary refactors;
- extra polishing outside this instruction.
