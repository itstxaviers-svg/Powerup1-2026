import type { CourseUnit, LexicalItem, TaskType } from '../domain/types'

const wordTasks: TaskType[] = ['memory', 'repair', 'unscramble', 'error-hunt', 'audio', 'final-decode']

export const unit3Groups = [
  { id: 'farm-vocabulary-1', title: 'Fun on the farm', subtitle: 'Vocabulary 1 · Animals' },
  { id: 'farm-vocabulary-2', title: 'Fun on the farm', subtitle: 'Vocabulary 2 · Describing words' },
  { id: 'animal-products', title: 'What do animals give us?', subtitle: 'Animals, products and actions' },
  { id: 'farm-literature', title: 'Fun on the farm', subtitle: 'Literature' },
] as const

type WordSeed = { text: string; group: typeof unit3Groups[number]['id']; cue: string; difficulty?: 1 | 2 | 3 | 4 | 5 }

const seeds: WordSeed[] = [
  { text: 'sheep', group: 'farm-vocabulary-1', cue: 'A farm animal with a thick woolly coat.' },
  { text: 'goat', group: 'farm-vocabulary-1', cue: 'A farm animal with horns that can climb well.' },
  { text: 'cow', group: 'farm-vocabulary-1', cue: 'A large farm animal that gives milk.' },
  { text: 'dog', group: 'farm-vocabulary-1', cue: 'An animal that can help a farmer move sheep.' },
  { text: 'chicken', group: 'farm-vocabulary-1', cue: 'A farm bird that lays eggs.' },
  { text: 'duck', group: 'farm-vocabulary-1', cue: 'A bird with a flat beak that swims.' },
  { text: 'donkey', group: 'farm-vocabulary-1', cue: 'An animal like a small horse with long ears.' },
  { text: 'horse', group: 'farm-vocabulary-1', cue: 'A large animal that people can ride.' },
  { text: 'spider', group: 'farm-vocabulary-1', cue: 'A small creature with eight legs.' },
  { text: 'rooster', group: 'farm-vocabulary-1', cue: 'An adult male chicken.' },

  { text: 'funny', group: 'farm-vocabulary-2', cue: 'Something that makes you laugh.' },
  { text: 'nice', group: 'farm-vocabulary-2', cue: 'Pleasant, friendly or good.' },
  { text: 'old', group: 'farm-vocabulary-2', cue: 'Not young; having lived for many years.' },
  { text: 'young', group: 'farm-vocabulary-2', cue: 'Not old; having lived for only a short time.' },
  { text: 'short', group: 'farm-vocabulary-2', cue: 'Not long or not tall.' },
  { text: 'long', group: 'farm-vocabulary-2', cue: 'Having a large distance from one end to the other.' },
  { text: 'sad', group: 'farm-vocabulary-2', cue: 'Feeling unhappy.' },
  { text: 'ugly', group: 'farm-vocabulary-2', cue: 'Not beautiful to look at.' },
  { text: 'angry', group: 'farm-vocabulary-2', cue: 'Feeling very cross.' },
  { text: 'tail', group: 'farm-vocabulary-2', cue: 'A body part at the back of many animals.' },
  { text: 'happy', group: 'farm-vocabulary-2', cue: 'Feeling pleased and cheerful.' },
  { text: 'beautiful', group: 'farm-vocabulary-2', cue: 'Very attractive or lovely.', difficulty: 2 },

  { text: 'give', group: 'animal-products', cue: 'Let another person have something.' },
  { text: 'sheep', group: 'animal-products', cue: 'This animal gives us wool.' },
  { text: 'bee', group: 'animal-products', cue: 'This insect makes honey.' },
  { text: 'cow', group: 'animal-products', cue: 'This animal gives us milk.' },
  { text: 'chicken', group: 'animal-products', cue: 'This farm bird gives us eggs.' },
  { text: 'wool', group: 'animal-products', cue: 'Soft material that comes from sheep.' },
  { text: 'milk', group: 'animal-products', cue: 'A white drink that can come from cows.' },
  { text: 'honey', group: 'animal-products', cue: 'A sweet food made by bees.' },
  { text: 'eggs', group: 'animal-products', cue: 'Food laid by chickens and other birds.' },
  { text: 'crisps', group: 'animal-products', cue: 'Thin, crunchy slices of potato.' },
  { text: 'alpaca', group: 'animal-products', cue: 'A woolly South American animal like a small llama.' },
  { text: 'cut', group: 'animal-products', cue: 'Use something sharp to divide or shorten something.' },
  { text: 'live', group: 'animal-products', cue: 'Have your home in a place.' },

  { text: 'flies', group: 'farm-literature', cue: 'Small flying insects; more than one fly.' },
  { text: 'mud', group: 'farm-literature', cue: 'Soft, wet earth.' },
  { text: 'bite', group: 'farm-literature', cue: 'Use teeth to cut or hurt something.' },
  { text: 'spot', group: 'farm-literature', cue: 'A small round mark or patch.' },
]

function commonErrors(text: string) {
  const letters = [...text]
  if (letters.length < 3) return [[...letters].reverse().join(''), letters[0]!]
  const middle = Math.max(1, Math.min(letters.length - 2, Math.floor(letters.length / 2)))
  const omitted = letters.filter((_, index) => index !== middle).join('')
  const swapped = [...letters]
  ;[swapped[middle], swapped[middle + 1]] = [swapped[middle + 1]!, swapped[middle]!]
  return [...new Set([omitted, swapped.join('')])].filter((value) => value !== text)
}

export const unit3LexicalItems: LexicalItem[] = seeds.map((seed, index) => ({
  id: `u3-${seed.group}-${index + 1}`,
  unitId: 'unit-3',
  kind: 'word',
  text: seed.text,
  category: 'other',
  acceptedAnswers: [seed.text],
  commonErrors: commonErrors(seed.text),
  allowedTaskTypes: wordTasks,
  cue: { type: 'situation', value: seed.cue, label: seed.cue },
  difficulty: seed.difficulty ?? 1,
  tags: ['unit-3', seed.group],
  enabled: true,
}))

export const unit3: CourseUnit = {
  id: 'unit-3', order: 3, title: 'Unit 3', status: 'active',
  vocabularyIds: unit3LexicalItems.map((item) => item.id), phraseIds: [], grammarIds: [],
}
