# WORD//CODE — Codex Implementation Guide

> This file is the project-level source of truth for Codex.
> Build the application described here. If the repository already contains code, inspect it first and adapt it instead of replacing working code without reason.

## 1. Product Vision

Build **WORD//CODE** (working title), a mobile-first English spelling and sentence-decoding game for learners in Grades 5–6 who are approximately A0+ in written English.

The learners already understand and can say much of the target language orally. Their main weakness is **remembering, reconstructing, and writing English words and short phrases accurately**. The app must therefore make writing feel like decoding, repairing, and restoring a code rather than completing a childish worksheet.

The product will eventually contain:

1. **Hello!** — introductory unit
2. **Unit 1**
3. **Unit 2**
4. **Unit 3**
5. **Unit 4**
6. **Unit 5**
7. **Unit 6**
8. **Unit 7**
9. **Unit 8**
10. **Unit 9**

### Current implementation scope

The existing Power Up 1 content for **Hello! and Units 1–9** is wired into the shared content model. Every Unit has serialisable Parts, and all learning sessions continue to use the same five data-driven games.

Mandatory cumulative fighting checkpoints appear after Units 3, 7 and 9. Unit 4 is gated by Checkpoint 03, Unit 8 by both Checkpoint 07 fights, and final completion by both Checkpoint 09 fights. Do not invent additional curriculum to fill gaps in the existing content.

---

## 2. Core Learning Goal

The app is not primarily a vocabulary-teaching app. It is a **written-recall trainer**.

The learning progression for each target is:

1. **Exposure** — see the correct form
2. **Recognition** — identify the correct form
3. **Reconstruction** — repair or rebuild it
4. **Supported Recall** — write with partial support
5. **Free Recall** — write from meaning, visual cue, or audio
6. **Mastery** — recall correctly across different task types and sessions

Do not equate course units with difficulty. A word from Hello! can later appear in a difficult free-recall task, while a newly added word from Unit 7 must initially receive support.

---

## 3. Audience and Tone

Target learners:

- Grades 5–6
- weak or hesitant writers
- approximately A0+ in written English
- familiar with basic spoken numbers, colours, greetings, names, and age questions
- may become demotivated by conventional spelling drills

The application must feel:

- intelligent
- modern
- game-like
- calm
- slightly mysterious
- age-appropriate for 10–13 year olds
- rewarding without feeling babyish

It must **not** look like a preschool app.

Avoid:

- cartoon farms
- balloons as the dominant UI metaphor
- childish mascots
- rainbow overload
- loud arcade visuals
- dark hacker/cyberpunk clichés
- punishment-heavy red error screens
- public student leaderboards

---

## 4. Language Rules

All user-facing UI must be in **English**.

This includes:

- student mode
- teacher mode
- buttons
- hints
- instructions
- feedback
- settings
- content labels
- progress labels

Use **British English** as the course target.

Examples:

- `colour`, not `color`
- `favourite`, not `favorite`
- `grey` is the displayed course spelling

Valid American variants may be recognised as legitimate English where appropriate, but they must not silently replace the British course target. For example:

- `gray` may receive: `Correct English. Course spelling: grey.`
- `favorite color` may be recognised as a variant, but mastery for the course target should require `favourite colour` when that exact spelling is being tested.

Do not use Russian translations in Phase 1.

---

## 5. Technology Baseline

Use a modern client-side web stack suitable for a polished installable PWA.

### Required stack

- **React 19.2+**
- **TypeScript 6.0+**, strict mode
- **Vite 8.1+**
- **Tailwind CSS 4.x** using the official Vite plugin
- **Motion for React 12.x+** for purposeful interaction animation
- **React Router** using a static-host-friendly routing strategy
- **Zod** for imported/exported content validation
- **IndexedDB** for progress and editable content; use a small typed wrapper such as `idb`
- **localStorage** only for tiny preferences such as theme, reduced-sound preference, teacher lock state, and last selected unit
- **vite-plugin-pwa** or an equivalent well-maintained Vite PWA solution
- **Vitest** + React Testing Library
- **Playwright** for end-to-end and mobile viewport tests

### Do not add a backend in Phase 1

No:

- authentication
- cloud database
- remote AI generation
- server API
- student accounts
- analytics service

The app must work fully locally after initial installation/caching.

### Do not use runtime AI to generate exercises

Exercise quality must be deterministic and controlled.

Use:

- curated content
- reusable exercise templates
- validated slot substitution
- safe deterministic generators
- spaced retrieval logic

Do not send learner answers or content to an LLM.

---

## 6. Why Vite / SPA Instead of a Static One-Page Script

This project should use Vite + React rather than a single static HTML file because the app requires:

- multiple units
- local progress
- mastery state
- an exercise-generation engine
- Teacher Mode
- editable libraries
- import/export
- PWA installation
- responsive mobile/desktop layouts
- reusable animation states
- future expansion

The resulting production build must still deploy as static assets.

---

## 7. Mobile-First Responsive Requirement

The application must work on **any common device**, with special attention to phones.

### Phone behaviour

Phones are the primary design constraint.

- Portrait orientation is the default and must be excellent.
- Never force landscape orientation.
- Gameplay must scroll naturally in a **vertical layout**.
- A user must never need horizontal scrolling.
- The software keyboard must not cover the answer field or primary action.
- When an input receives focus, ensure it is scrolled into a comfortable visible position.
- Use `100dvh`/dynamic viewport units where useful.
- Respect safe-area insets.
- No interaction may depend on hover.
- Tap targets should be at least approximately 44–48 px.
- Disable browser spellcheck/autocorrect/autocomplete for spelling answers so the phone does not solve the task for the learner.

Recommended answer input attributes where supported:

- `autocomplete="off"`
- `autocorrect="off"`
- `spellcheck={false}`
- `autocapitalize="none"` for word spelling tasks

Sentence tasks can visually teach capitalisation, but browser auto-capitalisation must still not solve the task automatically.

### Tablet and desktop behaviour

On wider screens the same content may become more horizontal:

- centered gameplay area
- optional side progress panel
- wider task cards
- richer spatial transitions

Do not create a separate desktop application. Use one responsive component system.

Suggested layout:

- `< 768px`: single-column vertical flow
- `768–1023px`: wide single-column / adaptive two-zone layout
- `>= 1024px`: centered game workspace with optional secondary side panel

---

## 8. Visual Direction

### Overall style

Use a **light digital intelligence / decoding laboratory** aesthetic.

Default visual language:

- warm white / very light cool-grey background
- deep navy or charcoal typography
- electric cyan / blue accents
- restrained emerald success accent
- restrained violet secondary accent
- subtle borders
- soft elevation
- crisp typography
- generous spacing
- small code-like details
- subtle grid, scanline, or signal motifs only as decoration

The interface should feel premium and contemporary, not like a black terminal.

### Background

Use a **mostly static background**.

This is intentional.

Continuous animated backgrounds would distract weak writers, consume battery, and reduce mobile performance. Prefer a static CSS-built background using soft gradients, a faint technical grid, and minimal texture.

Animation should happen primarily **in response to learner actions**.

### Typography

Use a highly readable modern sans-serif. Prefer a self-hosted variable font such as Inter Variable, with a robust system-font fallback.

Spelling targets must use fonts that clearly distinguish:

- `I` / `l`
- `a` / `o`
- `rn` / `m`

Never use decorative fonts for answer text.

---

## 9. Animation Direction

Use **Motion for React** for high-quality micro-interactions.

Animation must support the learning action, not compete with it.

### Good animation uses

- letters scanning into view
- target word briefly stabilising before memory mode
- letters separating and shuffling for Unscramble
- missing positions pulsing once when Repair starts
- typed letters snapping softly into a decoded state
- successful code restoration
- progress ring filling
- a card transitioning from `UNSTABLE` to `STABLE`
- unit tile unlock / reveal in future releases
- restrained page transitions

### Do not use

- constant parallax
- permanent particle storms
- rapid flashing
- large screen shakes
- repeated bouncing while the learner is typing
- time-pressure animation by default

### Performance rule

Prefer animation of:

- `transform`
- `opacity`

Avoid expensive layout animation during typing.

### Reduced motion

Respect `prefers-reduced-motion` and Motion's reduced-motion support.

When reduced motion is enabled:

- replace large transforms with fades
- remove decorative movement
- preserve essential state transitions

---

## 10. Intellectual Property / Assets

Do **not** copy or embed textbook screenshots, Friendly Farm artwork, characters, or page layouts into the application.

The learning targets listed in this specification may be implemented, but visuals must be original and generic unless the project owner later supplies licensed assets.

For Hello! use original cues such as:

- colour swatches
- number glyphs
- neutral profile/avatar icons
- simple birthday/age iconography
- abstract speech bubbles
- original code/lab graphics

---

## 11. Application Information Architecture

Recommended top-level screens/routes:

1. **Home / Unit Select**
2. **Hello! Unit Dashboard**
3. **Training Session**
4. **Progress / Code Archive**
5. **Teacher Mode**
6. **Settings**

A static-host-friendly hash router is acceptable and preferred if deployment does not guarantee SPA rewrite rules.

### Home / Unit Select

Display all ten course blocks and the checkpoint nodes after Units 3, 7 and 9. Existing Unit content is active, subject to checkpoint gates. A newly activated checkpoint must show a corrupted-signal message and an explicit `ENTER BATTLE` action; never force the learner directly into combat.

### Hello! dashboard

Show sections such as:

- Words
- Phrases
- Quick Training
- Mixed Decode
- Code Archive / Progress

The exact wording may be polished during implementation, but keep it age-appropriate and concise.

---

## 12. Main Game Loop

A normal session should be approximately 5–15 challenges depending on selected session length.

Suggested flow:

1. learner selects Hello!
2. learner selects or receives a session type
3. unseen targets receive a short exposure step when necessary
4. challenges are generated
5. learner submits answer
6. app gives immediate, precise feedback
7. weak targets are scheduled to return later, not immediately every time
8. session ends with improvement-focused summary

### End screen

Prefer:

- `3 codes stabilised`
- `2 words improved`
- `8 / 10 decoded independently`
- `Purple is ready for one more review`

Avoid:

- class rank
- humiliation
- harsh failure messaging

---

## 13. Core Game Modes

The application has exactly five reusable, data-driven game modes. Each mode supports both individual words and controlled phrase/grammar examples where appropriate.

### 13.1 REPAIR

The learner restores a partially damaged word or phrase. Some correct letters must always remain visible, so Repair never becomes full recall.

Examples:

- `Y _ L L O W` → `YELLOW`
- `What’s your n _ me?` → `What’s your name?`

### 13.2 AUDIO CODE

The learner hears the complete target and writes it without seeing its spelling. Replay is free. Prefer an `en-GB` browser voice, never serve an audio-only task when speech synthesis is unavailable, and keep the architecture ready for recorded audio.

### 13.3 MEMORY

Show the complete target for a configurable short time, hide it completely, then ask the learner to write it. No partial-letter clue remains after the memorisation stage.

### 13.4 UNSCRAMBLE

Scramble letters for individual words, preserving every letter and duplicate exactly. Scramble words or meaningful chunks for phrases and grammar examples.

Examples:

- `W O L L E Y` → `YELLOW`
- `you? / old / How / are` → `How old are you?`

Tapping must work comfortably on phones; precise drag-and-drop is never required. Keyboard typing remains available.

### 13.5 ERROR HUNT

Show a realistic curated mistake and ask the learner to correct it. Prefer each target’s `commonErrors` library and do not generate meaningless random corruption.

Examples:

- `YELOW` → `YELLOW`
- `EIGTH` → `EIGHT`
- `Whats your name?` → `What’s your name?`

Do not expose the complete answer immediately after the first incorrect attempt.

---

## 14. Feedback and Hint Ladder

Wrong answers must trigger **scaffolding**, not a binary fail state.

Example target: `green`

Learner enters:

`gren`

Possible feedback sequence:

1. `Almost. One letter is missing.`
2. if needed, reveal position: `g r e _ n`
3. if needed, show the full answer briefly
4. schedule the target again later in the session

### Hint levels

Suggested scoring weights:

- independent correct answer: full mastery credit
- correct after one light hint: medium mastery credit
- correct after strong support: low mastery credit
- incorrect after full reveal: exposure credit only

Never subtract XP or progress as punishment.

---

## 15. Progress and Mastery Model

Each vocabulary item, phrase, and grammar target needs independent local progress.

Suggested states:

- `unseen`
- `learning`
- `practising`
- `unstable`
- `stable`
- `mastered`

A simple numeric internal mastery score may also be used, but student-facing labels should remain understandable.

### Mastery should require variety

Do not mark an item mastered because it was typed correctly three times in the same mode within one minute.

A target should normally require:

- correct recall in multiple task types
- at least one unsupported recall
- correct recall across more than one session/time window

### Incorrect answers

When incorrect:

- mark target as requiring reinforcement
- return it after approximately 2–5 other challenges
- change the task form when reasonable
- do not repeat the identical screen immediately unless the learner explicitly chooses `Try again`

### Unstable Codes

Provide a learner-friendly view of frequently missed targets.

Working label:

`UNSTABLE CODES`

When a target becomes reliable:

`CODE STABLE`

Use this as motivating language, not as a warning or stigma.

---

## 16. Session Scheduling

The scheduler must mix new learning with retrieval.

When multiple units eventually exist, a typical mixed session should be configurable around this idea:

- ~50–60% selected/current unit
- ~20–30% due unstable targets
- ~10–20% older mastered review

Do not hardcode these percentages into content. Put them in scheduler configuration.

For Phase 1, all content comes from Hello!, but the scheduler architecture must already support cross-unit review.

### Anti-repetition rules

A learner should feel that each session is fresh.

Create a stable **task signature** from values such as:

- target ID
- grammar ID if applicable
- task template ID
- seed/example ID
- slot values
- difficulty
- prompt variant

Persist a capped history of recent task signatures.

Rules:

- do not show the exact same task signature again until alternatives are exhausted, except remediation
- avoid the same target more than twice in five consecutive challenges unless remediation requires it
- avoid the same task type more than twice consecutively
- when an old target returns, prefer a different task type from its previous encounter
- keep history bounded; do not create unbounded storage

---

## 17. Content Architecture

Content and game logic must be separate.

Use three primary content systems:

1. **Vocabulary / Phrase Library**
2. **Grammar Library**
3. **Exercise Template Library**

The engine combines them into tasks.

Do not create hundreds of hardcoded React screens.

---

## 18. Unit Model

Suggested serialisable model:

```ts
export type UnitId =
  | 'hello'
  | 'unit-1'
  | 'unit-2'
  | 'unit-3'
  | 'unit-4'
  | 'unit-5'
  | 'unit-6'
  | 'unit-7'
  | 'unit-8'
  | 'unit-9'

export interface UnitPart {
  id: string
  unitId: UnitId
  order: number
  title: string
  description: string
}

export interface CourseUnit {
  id: UnitId
  order: number
  title: string
  status: 'active' | 'coming-soon' | 'hidden'
  parts: UnitPart[]
  vocabularyIds: string[]
  phraseIds: string[]
  grammarIds: string[]
}
```

Every playable Unit is divided into serialisable Parts. Every lexical item and grammar point has a `partId`. The learner may select one Part, several Parts, or `All Parts`; the most recent valid selection is remembered per Unit. Missing or obsolete saved Part IDs fall back safely to `All Parts`.

Part filtering happens before generation:

`Unit → selected Part(s) → eligible content → mastery weighting → compatible mode → variation → anti-repetition → session`

When multiple Parts are selected, interleave them with soft balancing so a larger Part does not dominate the session.

Current status:

- `hello`: active
- `unit-1` ... `unit-9`: active where existing approved content is present
- Unit 4 and Unit 8 may be locally sealed by checkpoint progress

---

## 19. Vocabulary / Phrase Library Model

Use serialisable data.

Suggested structure:

```ts
export interface LexicalItem {
  id: string
  unitId: UnitId
  partId: string
  kind: 'word' | 'phrase'
  text: string
  category:
    | 'number'
    | 'colour'
    | 'greeting'
    | 'question'
    | 'answer'
    | 'introduction'
    | 'other'
  acceptedAnswers: string[]
  acceptedVariants?: Array<{
    value: string
    note: string
    grantsFullCourseMastery: boolean
  }>
  commonErrors: string[]
  allowedTaskTypes: TaskType[]
  cue?: CueDefinition
  audio?: AudioDefinition
  difficulty: 1 | 2 | 3 | 4 | 5
  tags: string[]
  enabled: boolean
}
```

### Cue types

Support serialisable cues such as:

- colour swatch
- number glyph
- icon key
- text situation
- image asset path

Do not store React nodes inside content data.

---

## 20. Grammar Library — Mandatory Requirement

**Every grammar point must have its own exercise reference/library.**

This is a core product requirement.

A grammar point is not just a rule name. It must contain enough controlled data for the engine to produce many distinct exercises.

Suggested model:

```ts
export interface GrammarPoint {
  id: string
  unitId: UnitId
  partId: string
  title: string
  learningGoal: string
  canonicalPatterns: string[]
  slots: GrammarSlot[]
  examplePool: GrammarExample[]
  commonErrors: GrammarErrorExample[]
  distractorPool: string[]
  exerciseBlueprints: GrammarExerciseBlueprint[]
  allowedTaskTypes: TaskType[]
  difficulty: 1 | 2 | 3 | 4 | 5
  enabled: boolean
}
```

Each grammar point must have:

- a canonical form
- a meaning/use description for Teacher Mode
- a pool of valid examples
- slot data where appropriate
- a pool of curated common errors
- distractors where appropriate
- multiple exercise blueprints
- supported difficulty levels

### Exercise Blueprint

Suggested serialisable structure:

```ts
export interface GrammarExerciseBlueprint {
  id: string
  grammarId: string
  taskType: TaskType
  promptPattern: string
  answerPattern: string
  slotRules?: Record<string, string>
  difficulty: 1 | 2 | 3 | 4 | 5
  hintStrategy: 'letters' | 'words' | 'none'
  enabled: boolean
}
```

The engine interprets blueprints. Do not store executable functions in Teacher Mode data.

### Freshness requirement

For each grammar point, generate enough permutations that a learner does not repeatedly see the same sentence.

A useful Phase-1 target is:

- at least 5 task types per active grammar point where pedagogically appropriate
- at least 8 curated error/distractor variants for important sentence patterns
- enough slot combinations and examples to produce at least 20–30 meaningfully different task signatures for core grammar

Do not inflate variation with meaningless punctuation-only changes. Variants should remain pedagogically useful.

---

## 21. Hello! — Phase-1 Content

### 21.1 Numbers

Active target number words:

1. `one`
2. `two`
3. `three`
4. `four`
5. `five`
6. `six`
7. `seven`
8. `eight`
9. `nine`
10. `ten`

Each number must support:

- Repair
- Audio Code
- Memory
- Unscramble
- Error Hunt

The main goal is spelling the English word, not arithmetic.

### 21.2 Colours

Active target colours:

- `red`
- `blue`
- `yellow`
- `green`
- `orange`
- `purple`
- `pink`
- `grey`
- `black`
- `white`
- `brown`

Use a colour swatch as the primary semantic cue.

Course spelling:

- `grey`

Recognise `gray` as valid American English with a note, but display and teach `grey`.

### 21.3 Core phrases and patterns

Implement these active targets/patterns:

- `Hello!`
- `Hi!`
- `What’s your name?`
- `I’m {name}.`
- `How old are you?`
- `I’m {number}.`
- `This is {name}.`
- `Look, {name}.`
- `This is our barn.`
- `Hello, I’m {name}.`
- `Hello, I’m {name} and this is {name}.`
- `I don’t know.`
- `My favourite colour is {colour}.`

Also support short dialogue combinations built only from approved Hello! patterns.

Do not invent unrelated grammar.

### 21.4 Character/name slot pool

Use neutral original names for generated grammar examples. Names are context slots, not vocabulary targets.

Suggested seed pool:

- Alex
- Anna
- Ben
- Emma
- Jack
- Kate
- Leo
- Mia
- Max
- Sam
- Tom
- Zoe

Teacher Mode must allow editing the name pool later.

Never score a learner on memorising a generated character name unless the task specifically displays the name as a copyable slot.

### 21.5 Hello! Parts

Hello! contains exactly these Parts:

- Numbers — number words one–ten
- Colours — the eleven approved British colour targets
- Introductions — the approved greeting, name, age and favourite-colour patterns

The learner can choose any one Part, any combination, or `All Parts`.

---

## 22. Hello! Grammar Libraries

Create these grammar/reference entries in Phase 1.

### G-H-01 — Greeting

Canonical patterns:

- `Hello!`
- `Hi!`

Exercise types:

- Memory
- Repair
- Error Hunt
- Audio Code
- context -> type greeting

Curated errors can include:

- `Helo!`
- `Helllo!`
- `Hi.` when writing accuracy is the current focus

Do not over-test punctuation if the goal of the current task is only spelling.

### G-H-02 — Asking a name

Canonical pattern:

- `What’s your name?`

Exercise library must support:

- Repair
- Audio Code
- Memory
- Unscramble
- Error Hunt

Curated error examples:

- `Whats your name?`
- `What’s you name?`
- `What your name?`
- `What’s your name.`
- `what’s your name?`
- `What’s your names?`
- `What is your name` when punctuation/contraction is the target
- token-order errors

### G-H-03 — Introducing yourself

Canonical patterns:

- `I’m {name}.`
- `Hello, I’m {name}.`

Exercise types:

- Repair
- Audio Code
- Memory
- Unscramble
- Error Hunt

Curated errors:

- `Im Alex.`
- `I m Alex.`
- `i’m Alex.`
- `I’m Alex`
- `I’am Alex.`
- `I Alex.`

### G-H-04 — Asking age

Canonical pattern:

- `How old are you?`

Exercise types:

- Repair
- Audio Code
- Memory
- Unscramble
- Error Hunt

Curated errors:

- `How old is you?`
- `How are old you?`
- `How old you are?`
- `How old are you.`
- `how old are you?`
- `How old you?`

### G-H-05 — Giving age

Canonical pattern:

- `I’m {number}.`

Allowed number slot values in Hello!:

- one–ten

Exercise types:

- Repair
- Audio Code
- Memory
- Unscramble
- Error Hunt

### G-H-06 — Introducing another person

Canonical pattern:

- `This is {name}.`

Exercise types:

- Repair
- Audio Code
- Memory
- Unscramble
- Error Hunt

Curated errors:

- `This {name}.`
- `This are {name}.`
- `this is {name}.`
- missing full stop

### G-H-07 — Look + name

Canonical pattern:

- `Look, {name}.`

Use this as a small phrase/chunk library, not as a major grammar lesson.

Teach the comma visually when writing accuracy is the selected focus.

### G-H-08 — Fixed phrase: our barn

Canonical phrase:

- `This is our barn.`

Use mainly for:

- Repair
- Audio Code
- Memory
- Unscramble
- Error Hunt

Do not introduce a large farm vocabulary set.

### G-H-09 — Combined introduction

Canonical pattern:

- `Hello, I’m {name} and this is {name}.`

This is a higher Hello! difficulty target.

Do not show it too early to weak learners. It should normally follow successful work with G-H-03 and G-H-06.

### G-H-10 — I don’t know

Canonical phrase:

- `I don’t know.`

Focus on:

- `don’t`
- apostrophe
- full stop

### G-H-11 — Favourite colour extension

Canonical pattern:

- `My favourite colour is {colour}.`

This is an intentional course-extension phrase approved for this app.

Use British spelling as the mastery target:

- `favourite`
- `colour`

Exercise types:

- Repair
- Audio Code
- Memory
- Unscramble
- Error Hunt

---

## 23. Common Error Libraries for Hello! Words

Seed Error Hunt with curated realistic errors. Expand carefully over time.

Examples:

### Numbers

- `one`: `on`
- `two`: `to`, `tow`
- `three`: `tree`, `thre`
- `four`: `for`, `foure`
- `five`: `fiv`
- `six`: `siks`
- `seven`: `sevn`, `sevan`
- `eight`: `eigth`, `eght`
- `nine`: `nin`
- `ten`: `tan`

### Colours

- `red`: `redd`
- `blue`: `blu`
- `yellow`: `yelow`, `yello`
- `green`: `gren`, `grean`
- `orange`: `orenge`, `orang`
- `purple`: `purpel`, `perple`, `purpl`
- `pink`: `pinc`
- `grey`: `gry`; treat `gray` as a valid variant with note, not a spelling failure
- `black`: `blak`
- `white`: `wite`
- `brown`: `broun`

The generator may create additional safe one-edit variants, but curated errors must be preferred.

Never generate malformed variants that are impossible to interpret or that accidentally teach a misleading pattern repeatedly.

---

## 24. Answer Checking

Implement checking as a reusable service.

### Word spelling tasks

Normally:

- trim surrounding whitespace
- case-insensitive unless capitalisation is the explicit target
- do not ignore missing/extra internal letters
- do not ignore internal spaces

### Sentence tasks

Support two validation modes:

1. **content-focused**
   - normalise repeated spaces
   - normalise straight/curly apostrophes
   - optionally be lenient about final punctuation if punctuation is not being tested

2. **writing-accuracy-focused**
   - capitalisation matters
   - apostrophe matters
   - final punctuation matters
   - word order matters

The task must declare which mode it uses.

### Apostrophes

Treat these as equivalent input characters:

- `'`
- `’`

Display typographically polished text, but never reject a learner because the phone keyboard supplied a different apostrophe glyph.

---

## 25. Difficulty System

Difficulty is separate from unit.

Suggested 1–5 scale:

### Difficulty 1 — high support

- most letters visible
- small option set
- immediate gentle cue

### Difficulty 2

- fewer letters visible
- simple unscramble
- sentence tokens mostly ordered

### Difficulty 3

- memory after short exposure
- moderate repair
- error correction

### Difficulty 4

- minimal support
- audio or semantic cue
- full sentence ordering

### Difficulty 5 — free recall

- no answer letters
- type full word/phrase
- punctuation may be assessed

Adaptive selection should depend on the target’s current progress, not only a global learner level.

---

## 26. Motivation System

Use progress as personal achievement, not competition.

Possible student-facing concepts:

- Codes Discovered
- Codes Stable
- Codes Mastered
- Unstable Codes
- Decode Accuracy
- Independent Decodes

Optional lightweight XP may be used, but mastery is more important than points.

If XP exists, suggested response:

- independent correct: `+100 XP`
- correct after light hint: `+70 XP`
- correct after strong hint: `+40 XP`

Never award negative XP.

Do not implement a global leaderboard in Phase 1.

---

## 27. Teacher Mode — Required in Phase 1

Teacher Mode is a first-class feature, not a developer-only screen.

Because Phase 1 has no accounts/backend, Teacher Mode edits apply to the current browser/device unless exported/imported.

### Teacher Mode sections

#### Units

Teacher can:

- view all units
- view and edit Parts for Units that contain local content
- enable/disable local custom content
- see unit status
- change a locally imported unit between hidden/available where content exists

Do not allow empty Units 1–9 to appear playable by default.

All Teacher Mode task-type selectors and exercise blueprints are limited to Repair, Audio Code, Memory, Unscramble and Error Hunt.

#### Vocabulary & Phrases

Teacher can:

- add item
- edit item
- disable item
- assign unit
- choose category
- set accepted answers
- add common errors
- choose allowed task types
- preview generated tasks

#### Grammar Library

Teacher can:

- create grammar point
- edit grammar point
- add canonical patterns
- edit slot pools
- add examples
- add common errors
- add distractors
- enable/disable exercise blueprints
- preview generated tasks

Every grammar detail screen should visibly show its **exercise library health**, for example:

- `12 examples`
- `8 error variants`
- `5 task types`
- `42 possible task signatures`

This helps the teacher see whether a grammar point will become repetitive.

#### Session Settings

Teacher can configure locally:

- session length
- enabled task types
- memory display duration
- audio mode enabled/disabled
- writing-accuracy strictness
- hint generosity
- review mix

#### Data

Teacher can:

- export custom content pack as JSON
- import content pack JSON
- export progress backup
- import progress backup
- reset learner progress
- reset only custom content
- reset all local application data with a confirmation step

### Teacher lock

Use an optional local 4-digit Teacher Mode PIN to prevent accidental student editing.

This is a classroom convenience lock, not real security. Do not present it as secure authentication.

---

## 28. Content Pack Format

Create a versioned JSON format.

Example top-level structure:

```ts
export interface ContentPack {
  schemaVersion: number
  name: string
  createdAt: string
  units: CourseUnit[]
  lexicalItems: LexicalItem[]
  grammarPoints: GrammarPoint[]
}
```

Import requirements:

- validate with Zod before writing to IndexedDB
- reject invalid schema safely
- show understandable error report
- never partially import corrupt data
- use stable IDs
- merge deliberately; do not silently duplicate IDs

Built-in Hello! content should remain recoverable even after custom edits.

---

## 29. Persistence Architecture

Use IndexedDB stores such as:

- `progress`
- `taskHistory`
- `customLexicalItems`
- `customGrammarPoints`
- `customUnits`
- `contentPacks`

Use localStorage only for very small settings.

Built-in course content lives in version-controlled source files and is read-only at runtime.

Custom content overlays/extends built-in content.

On future app upgrades:

- preserve local progress
- preserve teacher-created content
- merge new built-in content by stable IDs
- use explicit data migrations when schema changes

---

## 30. Offline / PWA Requirement

The app must be installable as a PWA and usable offline after first successful load.

Cache:

- application shell
- built-in Hello! data
- fonts used by the app
- icons
- required static assets

Teacher-created IndexedDB content is already local and must continue to work offline.

Do not make core play depend on external fonts, remote images, analytics, or API calls.

---

## 31. Accessibility

Required:

- semantic HTML
- keyboard navigation
- visible focus states
- screen-reader labels for icon-only controls
- sufficient colour contrast
- no colour-only correctness signal
- reduced-motion support
- all drag interactions also available through tap/click controls
- audio controls have text alternatives / labels
- large touch targets

Colour tasks must include enough information that the control is still usable if a learner has colour-vision difficulty. For example, after answer submission, display the colour name in text; Teacher Mode should be navigable without relying on colour swatches alone.

---

## 32. Sound

Sound should be subtle and optional.

Allowed:

- soft success tone
- gentle error/try-again cue
- short code-restored sound
- TTS target audio in Audio Code

Requirements:

- global sound toggle
- no loud sounds
- no continuous background music in Phase 1
- never make sound the only feedback channel

---

## 33. Recommended Project Structure

Use feature-oriented organisation similar to:

```text
/
├─ AGENTS.md
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ public/
│  ├─ icons/
│  └─ audio/
└─ src/
   ├─ app/
   │  ├─ App.tsx
   │  ├─ router.tsx
   │  └─ config.ts
   ├─ components/
   │  ├─ ui/
   │  └─ feedback/
   ├─ features/
   │  ├─ home/
   │  ├─ game/
   │  ├─ progress/
   │  ├─ teacher/
   │  └─ settings/
   ├─ content/
   │  ├─ units/
   │  │  ├─ hello.ts
   │  │  ├─ unit-1.ts
   │  │  ├─ unit-2.ts
   │  │  ├─ unit-3.ts
   │  │  ├─ unit-4.ts
   │  │  ├─ unit-5.ts
   │  │  ├─ unit-6.ts
   │  │  ├─ unit-7.ts
   │  │  ├─ unit-8.ts
   │  │  └─ unit-9.ts
   │  ├─ lexical/
   │  ├─ grammar/
   │  └─ names.ts
   ├─ engine/
   │  ├─ task-generation/
   │  ├─ checking/
   │  ├─ hints/
   │  ├─ mastery/
   │  ├─ scheduling/
   │  └─ random/
   ├─ storage/
   │  ├─ db.ts
   │  ├─ migrations.ts
   │  └─ content-pack.ts
   ├─ styles/
   │  ├─ index.css
   │  └─ tokens.css
   ├─ types/
   └─ test/
```

Exact filenames may change if a better structure emerges, but preserve the separation between:

- content
- engine
- UI
- storage

---

## 34. Component Principles

Create reusable components such as:

- `UnitCard`
- `TaskShell`
- `CodePrompt`
- `AnswerInput`
- `LetterTiles`
- `HintPanel`
- `FeedbackPanel`
- `MasteryMeter`
- `ProgressRing`
- `AudioButton`
- `TeacherLibraryTable`
- `GrammarEditor`
- `TaskPreview`

Do not create a unique answer component for each word.

---

## 35. State Management

Do not put all state in one giant component.

Separate:

- transient session state
- persistent learner progress
- teacher-editable content
- application settings

React context/reducers are acceptable. Add a lightweight store library only if it materially simplifies shared state; do not add dependencies merely for fashion.

The game engine itself should be framework-agnostic TypeScript where practical so it can be unit tested without React.

---

## 36. Randomness and Reproducibility

Task variation should feel random to the learner but be testable.

Create a small random abstraction that supports:

- normal production randomness
- seeded deterministic randomness in tests

Exercise generation must never depend directly on `Math.random()` scattered throughout components.

---

## 37. Performance Targets

The app must feel immediate on a normal phone.

Priorities:

- fast first interactive render
- smooth 60 fps interactions where device permits
- no jank while the keyboard opens
- no heavy 3D engine in Phase 1
- no WebGL dependency for decorative effects
- lazy-load Teacher Mode if it materially reduces initial bundle size
- lazy-load optional audio/large assets
- use SVG/CSS/DOM for most graphics

Prefer excellent typography, motion, and composition over visual complexity.

---

## 38. Testing Requirements

### Unit tests

Must cover:

- answer normalisation
- apostrophe normalisation
- British variant behaviour
- task signature generation
- no invalid slot substitution
- safe Repair generation
- safe Unscramble generation
- hint escalation
- mastery changes
- remediation scheduling
- anti-repetition rules
- content pack validation

### Component tests

Must cover:

- answer submission
- correct feedback
- incorrect feedback
- hint interaction
- keyboard interaction
- letter tile interaction
- Teacher Mode editors

### E2E tests

At minimum:

1. open Hello! on desktop
2. complete a short spelling session
3. make an error and receive a hint
4. verify the weak word returns later
5. complete a phrase Unscramble task
6. use a phone-sized viewport in portrait
7. open the software-keyboard-relevant input flow without layout overflow
8. add a custom word in Teacher Mode
9. export and re-import a content pack
10. reload and verify progress persists
11. verify app shell can load offline after caching

Use Playwright mobile device profiles for representative iOS and Android viewport testing.

---

## 39. Development Quality Gates

Provide npm scripts similar to:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  }
}
```

Exact commands may adapt to final configuration.

Before considering a feature complete:

- typecheck passes
- lint passes
- relevant unit/component tests pass
- production build passes
- mobile layout has been checked

---

## 40. Suggested Phase-1 Implementation Order

### Milestone 1 — Foundation

- scaffold React + TypeScript + Vite
- configure Tailwind
- configure Motion
- add routing
- add design tokens
- create responsive shell
- create PWA manifest/base setup

### Milestone 2 — Content Models

- define Unit model
- define LexicalItem model
- define GrammarPoint model
- define exercise blueprint model
- create Hello! built-in content
- create empty Unit 1–9 records

### Milestone 3 — Core Engine

- answer checker
- task generator abstraction
- Repair
- Unscramble
- Memory
- Error Hunt
- Audio Code
- task signatures

### Milestone 4 — Game UX

- session flow
- hints
- feedback
- mastery display
- responsive phone interaction
- event-driven animations

### Milestone 5 — Progress

- IndexedDB persistence
- mastery model
- unstable targets
- remediation scheduling
- anti-repetition history
- session summary

### Milestone 6 — Audio

- speech-synthesis abstraction
- en-GB preference
- audio challenge availability checks
- Audio Code

### Milestone 7 — Teacher Mode

- vocabulary editor
- grammar library editor
- blueprint management
- generated-task preview
- session settings
- local Teacher PIN

### Milestone 8 — Import / Export

- Zod schemas
- content pack export/import
- progress backup export/import
- reset actions
- schema versioning

### Milestone 9 — PWA / Offline / Polish

- reliable service-worker caching
- installability
- offline smoke test
- reduced motion
- accessibility review
- phone keyboard review
- performance polish

### Milestone 10 — Testing

- complete unit tests
- component tests
- Playwright desktop + phone flows
- final build validation

---

## 41. Phase-1 Acceptance Criteria

Phase 1 is complete only when all of the following are true:

### Content

- Hello! is playable.
- Numbers one–ten are present.
- All 11 specified colours are present.
- All specified Hello! phrases/patterns are present.
- All active Hello! grammar points have their own exercise libraries.
- Hello! and the existing approved Unit 1–9 content are available through serialisable Parts.

### Gameplay

- learner can train spelling through multiple task types
- learner receives scaffolded feedback
- weak items reappear later
- exact tasks do not repeat unnecessarily
- progress persists locally
- mastery depends on varied recall

### Teacher Mode

- teacher can add/edit vocabulary
- teacher can add/edit grammar
- teacher can manage grammar examples/errors/blueprints
- teacher can preview generated tasks
- teacher can import/export content packs
- teacher can reset progress separately from content

### Devices

- phone portrait is excellent
- desktop is polished
- no horizontal overflow
- inputs remain usable with phone keyboard
- no hover-only controls

### Visual quality

- mature light digital-lab aesthetic
- no childish farm styling
- static/subtle background
- high-quality purposeful animations
- reduced-motion support

### Technical

- TypeScript strict mode
- production build passes
- tests cover core generation/scheduling/checking
- PWA works offline after initial cache
- no backend required
- no runtime AI required

---

## 42. Non-Goals for Phase 1

Do not spend Phase-1 time on:

- speculative vocabulary, grammar, or image assets not present in the approved Unit libraries
- real user authentication
- classroom cloud sync
- public leaderboards
- social features
- AI-generated live exercises
- 3D scenes
- complex avatars
- textbook character reproduction
- payment systems
- multilingual UI

Design the architecture so cloud sync and learner profiles could be added later, but do not implement them now.

---

## 43. Codex Working Rules

1. Read this file before making architecture decisions.
2. Treat the learning engine and content libraries as core product features, not placeholders.
3. Do not hardcode Hello! directly into React screens.
4. Do not invent Unit 1–9 content.
5. Do not remove Teacher Mode to simplify the MVP.
6. Do not replace scaffolded feedback with simple right/wrong alerts.
7. Do not enable browser spelling assistance on answer inputs.
8. Keep all user-facing text in English.
9. Preserve British course spelling.
10. Prioritise phone portrait usability in every screen.
11. Use animation intentionally and keep the background mostly static.
12. Keep built-in content recoverable and custom content serialisable.
13. Never use runtime AI to generate learner exercises.
14. Add tests when modifying generation, checking, mastery, scheduling, or import/export logic.
15. If a requirement is genuinely ambiguous and the choice would materially affect pedagogy or data architecture, ask the project owner rather than silently inventing course content.

---

## 44. Product Principle

The learner should gradually stop thinking:

> “I have to memorise English spelling.”

and start thinking:

> “I know this code. I can restore it.”

Every design, animation, feedback message, and exercise generator should support that feeling.

---

## 45. Current Fighting Checkpoints

These rules are current and override older phase notes.

- Regular learning contains exactly five games, displayed in this order: Repair, Unscramble, Memory, Error Hunt and Audio Code.
- Mastery evidence ranks as Repair (low), Unscramble and Error Hunt (medium), Memory (high), and Audio Code (strongest). Repair alone can never produce mastery; mastery also requires varied modes, several independent recalls and more than one session day.
- Part filtering always precedes mastery weighting, compatible-game selection, variation and anti-repetition. `All Parts` is selection state, not a curriculum Part. Invalid saved Part IDs safely fall back to all current Parts.
- Battles use cumulative, unique, enabled vocabulary `word` targets only. Hello!, phrases and grammar are excluded.
- Each fight uses `Math.ceil(eligibleUniqueWords / 3)` after the eligible cumulative pool is built. Image availability assigns presentation only and never filters the vocabulary pool before selection.
- Paired fights after Units 7 and 9 are allocated together from one shuffle into non-overlapping one-third sets. Failed retries keep the same persisted word set and only reshuffle its order; only `either` items may change prompt form.
- The only battle prompts are Audio → Type and Image → Type. There are no battle hints, answer choices, translation prompts or regular-game mechanics.
- Checkpoint 03 uses GLITCH KITSUNE, Units 1–3, 10 seconds per answer and an 85% pass threshold.
- Checkpoint 07-A uses NULLWEAVER and Checkpoint 07-B uses AETHER GOLEM, Units 1–7, 8 seconds per answer and 85% in each fight.
- Super Battle 09-A uses SIGNAL SERPENT and the Final Super Battle uses THE CORRUPTED ARCHIVIST, Units 1–9, 6 seconds per answer and 85% in each fight.
- The Corrupted Archivist is the original humanoid techno-magical archive guardian: ivory/navy robe-armour, gold details, broken archive halo and cyan/gold versus violet-magenta corruption. Never use the bird/drill/propeller concept.
- Battles are first-person. No player avatar is visible. Correct answers send a cyan strike from the camera; wrong answers and timeouts bring the boss towards the camera with a restrained coral edge vignette and no gore.
- Every boss reveals its name and corrupted line before `START BATTLE`. Timers cannot start before that learner action. Audio timers start only after the initial playback ends, and replay never pauses or resets a running timer.
- Passing enters a persisted purification state before progression unlocks. The purified opponent remains visible, says its configured thank-you line followed by `You restored every code.`, and waits for `CONTINUE`. Failure never shows purification.
- The Unit 1–3 battle image metadata maps approved local files under `assets/Power_Up_1_Units_1_3_Assets/Unit_1`, `Unit_2` and `Unit_3`. Mapped unambiguous words use `either`; unmapped or ambiguous words use Audio. The Unit 1 `crayon` target intentionally uses `17_crayons.png`, and British `rubber` remains canonical.
- Local battle persistence retains activation, paired allocations, completed fights, best accuracy, retry weaknesses, pending purification and final course completion. Load-time normalisation supplies safe defaults without discarding older progress or obsolete regular-mode history.

---

## 46. Current Login Session Lifetime

- Student and teacher authentication is scoped to the current browser tab or standalone app page through `sessionStorage`.
- Reloading the page, navigating inside WORD//CODE, locking the screen or briefly backgrounding the browser must not sign the user out.
- Closing the tab or standalone app page ends the login session. Persistent `Remember me` login is not offered.
- Older valid sessions previously stored in `localStorage` are moved once into `sessionStorage` and removed from persistent storage, preventing a surprise sign-out during this migration.
- Learning progress, rewards and content remain in IndexedDB/cloud storage and are never cleared when a login session ends.
