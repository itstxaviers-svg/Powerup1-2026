# WORD//CODE — CODEX INSTRUCTION
## Populate checkpoint vocabulary and wire Unit 1–9 battle words

Continue the EXISTING WORD//CODE project from the current repository state.

Do NOT start a new project.
Do NOT rebuild the battle system.
Do NOT create a second checkpoint implementation.
This is an incremental task that extends the current checkpoint/battle implementation described in:

`WORD_CODE_CONTINUE_CODEX_BATTLES_AND_GAMES_UPDATE.md`

Read the root `AGENTS.md` once, then inspect only the vocabulary data, battle/checkpoint configuration, persistence schema, and asset-loading files needed for this task.

The goal of this pass is:

> Populate the fighting checkpoints with the real Unit 1–9 vocabulary, mark which words use Image → Type and which use Audio → Type, connect the prepared image assets, and verify that cumulative checkpoint selection works correctly.

Do not invent new vocabulary.
Use the current Unit 1–9 vocabulary already present in the project as the source of truth.

---

# 1. CHECKPOINT POOLS

The checkpoint pools are cumulative.

## Checkpoint after Unit 3

Use vocabulary from:

```text
Unit 1
Unit 2
Unit 3
```

Exclude:
- Hello!
- grammar phrases
- grammar patterns
- sentence-level content
- disabled vocabulary
- non-word task content

Boss:

```text
GLITCH KITSUNE
```

Timer:

```text
10 seconds
```

Pass:

```text
85%
```

Question count:

```ts
Math.ceil(totalEligibleUniqueWords / 3)
```

---

## Checkpoint after Unit 7

Use vocabulary from:

```text
Units 1–7
```

Fight A:

```text
NULLWEAVER
```

Fight B:

```text
AETHER GOLEM
```

Timer:

```text
8 seconds
```

Each fight uses approximately:

```ts
Math.ceil(totalEligibleUniqueWords / 3)
```

The two fight sets MUST NOT overlap.

Allocate both sets before Fight A begins.

---

## Checkpoint after Unit 9

Use vocabulary from:

```text
Units 1–9
```

Fight A:

```text
SIGNAL SERPENT
```

Fight B:

```text
THE CORRUPTED ARCHIVIST
```

Timer:

```text
6 seconds
```

Each fight uses approximately:

```ts
Math.ceil(totalEligibleUniqueWords / 3)
```

The two fight sets MUST NOT overlap.

Allocate both sets before Fight A begins.

---

# 2. IMPORTANT: DO NOT HARD-CODE CHECKPOINT WORD LISTS SEPARATELY

Do not duplicate the vocabulary into three unrelated manual arrays.

Checkpoint vocabulary must come from the existing Unit vocabulary data.

Use one source of truth.

Conceptually:

```ts
const checkpointPool = vocabularyItems.filter(item =>
  item.type === "word" &&
  item.enabled !== false &&
  item.unit >= checkpoint.minUnit &&
  item.unit <= checkpoint.maxUnit
);
```

Use the project’s real data shape instead of introducing this exact structure if unnecessary.

The battle system must remain automatically compatible with future vocabulary corrections.

---

# 3. UNIQUE WORD RULE

Checkpoint selection is based on unique vocabulary targets.

Prevent accidental duplicates caused by:
- the same word appearing in more than one Part;
- duplicated imported curriculum entries;
- alternate task records for the same target.

Use the canonical vocabulary ID when reliable.

Otherwise use a normalized canonical key such as:

```ts
target.trim().toLowerCase()
```

Do NOT merge genuinely different targets such as:

```text
glass
glasses
shoe
shoes
short
shorts
```

---

# 4. BATTLE PROMPT METADATA

Each vocabulary item eligible for battle needs battle prompt metadata.

Use or adapt the existing model:

```ts
type BattlePromptMode = "image" | "audio" | "either";

type VocabularyItem = {
  // existing fields

  battle?: {
    enabled: boolean;
    prompt: BattlePromptMode;
    image?: string;
    acceptedAnswers?: string[];
  };
};
```

If the project already has equivalent fields, extend those instead.

Do not introduce duplicate metadata systems.

---

# 5. DEFAULT RULE FOR ALL WORDS

For every eligible Unit 1–9 vocabulary word:

Default to:

```ts
battle.enabled = true
battle.prompt = "audio"
```

Then override to:

```ts
battle.prompt = "image"
```

only for the approved unambiguous image vocabulary listed below.

This is important.

Every normal vocabulary word may still appear in checkpoint selection even if no picture exists.

Words without an approved image MUST use Audio → Type.

---

# 6. UNIT 1 IMAGE WORDS

Mark these as `image`:

```text
bag
book
pen
pencil
pencil case
rubber
board
bookcase
cupboard
window
door
paper
wall
desk
chair
teacher
crayons
ruler
playground
classroom
```

Use the actual canonical course spelling if the existing Unit 1 data differs slightly.

British English must remain canonical where applicable.

Example:

```text
rubber
```

not automatically changed to:

```text
eraser
```

Recommended image filenames:

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

If the archive currently contains a slightly different clean filename, either:
- rename it once to the canonical filename above, or
- map it explicitly.

Do not retain Russian generator filenames in code.

---

# 7. UNIT 2 IMAGE WORDS

Mark these as `image`:

```text
eye
nose
mouth
ear
face
head
hair
arm
leg
foot
```

All other Unit 2 words remain `audio` unless there is an already-approved explicit image mapping in the repository.

Family words should remain audio unless an unambiguous approved image exists.

Examples:

```text
mum
mother
dad
father
brother
sister
grandma
grandmother
grandpa
grandfather
twins
```

These should not be guessed from generic family pictures.

Recommended filenames:

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

---

# 8. UNIT 3 IMAGE WORDS

Mark these as `image`:

```text
cat
dog
goat
sheep
horse
cow
donkey
duck
chicken
spider
```

Keep adjectives/descriptors as `audio`.

Examples:

```text
big
small
long
short
old
young
nice
happy
sad
angry
funny
beautiful
ugly
```

Recommended filenames:

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

---

# 9. UNIT 4 IMAGE WORDS

Use Image → Type for the approved food/drink vocabulary that has a clear image.

Approved Unit 4 image words currently include:

```text
banana
bread
burger
cake
chocolate
sausages
meatballs
salad
grapes
apple
water
milk
carrot
orange juice
ice cream
orange
tomato
pear
pizza
sandwich
onion
pasta / spaghetti
beans
mango
omelette
kiwi
```

IMPORTANT:

Match the actual vocabulary target in the project.

If the textbook word is:

```text
pasta
```

do not silently replace it with:

```text
spaghetti
```

Use the approved image as the visual prompt but keep the curriculum answer.

If `orange juice` is the canonical target, do not make `juice` the only answer.

If accepted synonyms are pedagogically valid, add them only through explicit `acceptedAnswers`.

Do not broaden accepted answers casually.

---

# 10. UNIT 5 IMAGE WORDS

Mark these as `image` when present in Unit 5:

```text
ball
bike
car
doll
house
kite
robot
plane
balloon
board game
computer
helicopter
keyboard
mouse
radio
ship
teddy bear
```

For:

```text
mouse
```

the image must mean computer mouse.

Do not use an animal mouse image.

---

# 11. UNIT 6 IMAGE WORDS

Mark these as `image`:

```text
tree
flower
bus stop
toy shop
bus
train
lorry
motorbike
bear
crocodile
elephant
giraffe
hippo
lizard
monkey
polar bear
snake
zebra
```

If the current asset uses an American visual filename such as `truck`, the actual answer must still follow the curriculum.

For example:

```text
lorry
```

must remain the answer if Power Up 1 uses `lorry`.

Do not silently convert British curriculum vocabulary into American English.

Keep ambiguous place words such as:

```text
garden
park
```

as Audio → Type unless a clearly approved image mapping exists.

---

# 12. UNIT 7 IMAGE WORDS

Use Image → Type for the approved activity/sport words that have images.

Current approved set:

```text
play tennis
play football
play basketball
play badminton
swim
ride a bike
play the piano
play the guitar
play the violin
watch television
baseball
hockey
```

However, battle content is normally `word` vocabulary only.

Therefore inspect the actual Unit 7 vocabulary data.

If the curriculum stores these as lexical chunks / phrases rather than `word` items:

DO NOT force them into the battle pool if the current battle rule excludes phrases.

In that case:
- preserve the phrase vocabulary for normal games;
- keep it out of battle;
- do not weaken the type system just to make the image usable.

If Unit 7 contains canonical single-word activity vocabulary, use those real targets.

Do not use image prompts for grammatically ambiguous forms such as:

```text
run
running
kick
kicking
throw
throwing
```

unless the exact intended target is unambiguous in the current data.

---

# 13. UNIT 8 IMAGE WORDS

Mark these as `image`:

```text
bath
bed
mirror
armchair
clock
lamp
painting
rug
phone
sofa
bedroom
bathroom
kitchen
dining room
living room
```

Keep ambiguous items such as:

```text
floor
hall
hallway
```

as Audio → Type.

Again, if room names are represented as phrases rather than `word` items, respect the current battle type rule.

Do not change vocabulary type simply to force them into battle.

---

# 14. UNIT 9 IMAGE WORDS

Approved image vocabulary includes:

```text
boots
cap
dress
glasses
hat
jacket
jeans
shoes
shirt
skirt
shorts
trousers
T-shirt
sunglasses
beach
boat
camera
fish
fishing
jellyfish
sand
shell
sun
```

Keep:

```text
sea
```

as Audio → Type because it can visually overlap with `beach`.

Use the exact canonical target spelling/case already in the Unit data.

Example:

```text
T-shirt
```

must preserve its expected spelling normalization.

Do not make `shirt` and `T-shirt` interchangeable.

---

# 15. IMAGE ASSET LOCATION

Use one consistent path:

```text
src/assets/battles/vocabulary/
  unit-01/
  unit-02/
  unit-03/
  unit-04/
  unit-05/
  unit-06/
  unit-07/
  unit-08/
  unit-09/
```

The prepared image archives are named conceptually:

```text
Power_Up_1_Unit_01_Assets.zip
Power_Up_1_Unit_02_Assets.zip
...
Power_Up_1_Unit_09_Assets.zip
```

If they are present in the repo:

1. extract only the image files needed by the app;
2. place them in the matching unit folder;
3. do not ship nested ZIP files inside the production bundle;
4. do not import `README_labels.txt` into runtime code;
5. use clean English filenames.

If the project already uses another battle vocabulary asset folder, preserve that structure instead of creating duplicates.

---

# 16. DO NOT TRUST FILENAME ALONE

Before connecting each image:

- inspect the image;
- inspect the Unit vocabulary target;
- ensure they clearly match.

If an image label and actual curriculum target conflict, the curriculum data wins.

Do not silently rename the vocabulary to match the artwork.

If a picture is ambiguous or wrong:
- leave that word Audio → Type;
- note it in the final report.

---

# 17. IMAGE QUESTION VALIDATION

An image word may use Image → Type only if:

```text
one clear image
→ one clear expected curriculum answer
```

Do not use image mode for a target if:
- two different vocabulary answers are equally reasonable;
- the image primarily depicts a scene instead of the target;
- another Unit word is more visually salient;
- singular/plural cannot be inferred;
- verb form cannot be inferred;
- relation words require unseen context.

Fallback:

```ts
battle.prompt = "audio"
```

---

# 18. ANSWER NORMALIZATION

Battle answer checking should:

- trim leading/trailing whitespace;
- compare case-insensitively where appropriate;
- preserve actual spelling requirements;
- preserve meaningful punctuation/hyphenation rules where required.

Examples:

```text
BLUE / blue
```

may normalize case.

But:

```text
shirt
```

must not pass for:

```text
T-shirt
```

And:

```text
shoe
```

must not automatically pass for:

```text
shoes
```

unless explicitly configured.

---

# 19. SELECTION ORDER

The battle selection order MUST be:

```text
checkpoint cumulative Unit range
→ eligible enabled word vocabulary
→ unique targets
→ select required battle word set
→ assign prompt type from metadata
→ create battle questions
→ shuffle question order
```

Do NOT do:

```text
collect image words
→ choose one third from image words
```

Image availability must not distort vocabulary selection.

---

# 20. PAIRED CHECKPOINT ALLOCATION

For Unit 7 and Unit 9 checkpoints:

Create both fight sets in one allocation step.

Conceptually:

```ts
const shuffled = seededShuffle(uniqueEligibleWords);

const size = Math.ceil(shuffled.length / 3);

const fightA = shuffled.slice(0, size);
const fightB = shuffled.slice(size, size * 2);
```

Adjust safely if the vocabulary pool is unusually small.

No overlap.

Persist the allocation.

Do not reroll Fight B after Fight A is completed.

---

# 21. RETRY

If a learner fails:

Use the same selected vocabulary set.

Do not generate a fresh set.

Allowed:
- reshuffle order;
- move weak/wrong words earlier;
- switch `either` prompt between image/audio.

Not allowed:
- replace failed words with easier/new words;
- reroll the one-third sample.

---

# 22. PERSISTENCE / MIGRATION

If battle metadata or checkpoint allocation schema changed:

Add a safe migration.

Do not wipe:
- learner progress;
- mastery;
- unlocked Units;
- previous checkpoint passes.

Previously saved checkpoint allocations should continue to work if valid.

If an old allocation references deleted/invalid vocabulary IDs:
- repair/reallocate safely;
- do not crash.

---

# 23. OPTIONAL TEACHER MODE DISPLAY

If Teacher Mode already exposes vocabulary editing, add a compact battle section only if easy:

```text
Battle enabled: yes/no
Battle prompt: Audio / Image / Either
Battle image: filename/path
```

Do not build a new admin system.

---

# 24. VALIDATION

Add targeted checks for:

1. Checkpoint 03 contains only Units 1–3.
2. Checkpoint 07 contains only Units 1–7.
3. Checkpoint 09 contains only Units 1–9.
4. Hello! never enters battle.
5. non-word content never enters battle.
6. disabled vocabulary never enters battle.
7. duplicate targets are not double-counted.
8. Image words receive image prompt.
9. non-image words fall back to audio.
10. paired fights do not overlap.
11. retry preserves the same selected vocabulary set.
12. 10 / 8 / 6 second timers remain unchanged.
13. 85% pass threshold remains unchanged.
14. existing boss/purification flow still works.

---

# 25. FINAL REPORT

After implementation, report:

```text
- number of eligible battle words per Unit
- number of Image words per Unit
- number of Audio-only words per Unit
- total eligible pool for Checkpoint 03
- battle size for Checkpoint 03
- total eligible pool for Checkpoint 07
- Fight A / Fight B sizes
- total eligible pool for Checkpoint 09
- Fight A / Fight B sizes
- any image assets rejected as ambiguous
- any vocabulary items missing an expected image
- build/typecheck result
```

Do not guess these counts in advance.
Calculate them from the actual repository data after implementation.

---

# 26. AGENTS.md

Update root `AGENTS.md` only where necessary to document:

- checkpoint vocabulary comes from Unit data;
- battle content is cumulative;
- Image/Audio prompt metadata;
- image eligibility rule;
- Units 1–9 asset folders;
- same-set retry;
- paired no-overlap allocation.

Do not rewrite unrelated sections.

---

# 27. STOP CONDITION

When:
- Unit 1–9 battle vocabulary is wired;
- image/audio metadata is correct;
- checkpoint pools work;
- persistence is safe;
- tests pass;
- typecheck/build succeeds;

STOP.

Do not:
- redesign the battle UI;
- add new bosses;
- add new game modes;
- invent Unit vocabulary;
- generate new images;
- refactor unrelated systems.
