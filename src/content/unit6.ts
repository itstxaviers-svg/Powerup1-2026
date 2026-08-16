import type { CourseUnit, LexicalItem, TaskType } from '../domain/types'

const wordTasks: TaskType[] = ['memory', 'repair', 'unscramble', 'error-hunt', 'audio', 'final-decode']

export const unit6Groups = [
  { id: 'day-out-vocabulary-1', title: 'A day out', subtitle: 'Vocabulary 1 · Places and transport' },
  { id: 'day-out-vocabulary-2', title: 'A day out', subtitle: 'Vocabulary 2 · Zoo animals' },
  { id: 'animals-in-the-wild', title: 'Animals in the wild', subtitle: 'Habitats, animals and actions' },
  { id: 'day-out-literature', title: 'A day out', subtitle: 'Literature' },
] as const

type WordSeed = { text: string; group: typeof unit6Groups[number]['id']; cue: string; difficulty?: 1 | 2 | 3 | 4 | 5 }

const seeds: WordSeed[] = [
  { text: 'tree', group: 'day-out-vocabulary-1', cue: 'A tall plant with a wooden trunk and branches.' },
  { text: 'train', group: 'day-out-vocabulary-1', cue: 'A long vehicle that travels on railway tracks.' },
  { text: 'garden', group: 'day-out-vocabulary-1', cue: 'A place where flowers and other plants grow.' },
  { text: 'bus stop', group: 'day-out-vocabulary-1', cue: 'A place where people wait for a bus.' },
  { text: 'bus', group: 'day-out-vocabulary-1', cue: 'A large road vehicle that carries many passengers.' },
  { text: 'shop', group: 'day-out-vocabulary-1', cue: 'A place where people buy things.' },
  { text: 'motorbike', group: 'day-out-vocabulary-1', cue: 'A powered road vehicle with two wheels.', difficulty: 2 },
  { text: 'car', group: 'day-out-vocabulary-1', cue: 'A road vehicle with four wheels.' },
  { text: 'lorry', group: 'day-out-vocabulary-1', cue: 'A large road vehicle used to carry goods.' },
  { text: 'park', group: 'day-out-vocabulary-1', cue: 'A green public place where people can walk and play.' },
  { text: 'flower', group: 'day-out-vocabulary-1', cue: 'The colourful part of a plant.' },
  { text: 'there is', group: 'day-out-vocabulary-1', cue: 'Use this to say that one thing exists in a place.', difficulty: 2 },
  { text: 'there are', group: 'day-out-vocabulary-1', cue: 'Use this to say that several things exist in a place.', difficulty: 2 },
  { text: 'there isn’t', group: 'day-out-vocabulary-1', cue: 'Use this to say that one thing does not exist in a place.', difficulty: 2 },
  { text: 'there aren’t', group: 'day-out-vocabulary-1', cue: 'Use this to say that several things do not exist in a place.', difficulty: 2 },

  { text: 'hippo', group: 'day-out-vocabulary-2', cue: 'A very large African animal that spends time in water.' },
  { text: 'giraffe', group: 'day-out-vocabulary-2', cue: 'A tall African animal with a very long neck.' },
  { text: 'polar bear', group: 'day-out-vocabulary-2', cue: 'A large white bear that lives in the Arctic.' },
  { text: 'bear', group: 'day-out-vocabulary-2', cue: 'A large strong animal with thick fur.' },
  { text: 'elephant', group: 'day-out-vocabulary-2', cue: 'A very large animal with a trunk.' },
  { text: 'zebra', group: 'day-out-vocabulary-2', cue: 'An African animal with black and white stripes.' },
  { text: 'crocodile', group: 'day-out-vocabulary-2', cue: 'A large reptile with a long mouth and strong teeth.', difficulty: 2 },
  { text: 'lizard', group: 'day-out-vocabulary-2', cue: 'A small reptile with four legs and a long tail.' },
  { text: 'tiger', group: 'day-out-vocabulary-2', cue: 'A large wild cat with orange and black stripes.' },
  { text: 'monkey', group: 'day-out-vocabulary-2', cue: 'An animal that can climb and swing through trees.' },
  { text: 'snake', group: 'day-out-vocabulary-2', cue: 'A long reptile with no legs.' },
  { text: 'Let’s', group: 'day-out-vocabulary-2', cue: 'Use this to suggest doing something together.', difficulty: 2 },

  { text: 'Antarctica', group: 'animals-in-the-wild', cue: 'The icy continent around the South Pole.' },
  { text: 'rhino', group: 'animals-in-the-wild', cue: 'A large animal with one or two horns on its nose.' },
  { text: 'penguin', group: 'animals-in-the-wild', cue: 'A black-and-white bird that swims but cannot fly.' },
  { text: 'frog', group: 'animals-in-the-wild', cue: 'A small animal that jumps and lives on land and in water.' },
  { text: 'boa', group: 'animals-in-the-wild', cue: 'A large snake that squeezes its prey.' },
  { text: 'jungle', group: 'animals-in-the-wild', cue: 'A hot, wet habitat with thick trees and plants.' },
  { text: 'climb', group: 'animals-in-the-wild', cue: 'Move upwards using hands, feet or paws.' },
  { text: 'domestic', group: 'animals-in-the-wild', cue: 'Living with or cared for by people.' },
  { text: 'wild', group: 'animals-in-the-wild', cue: 'Living freely in nature, not with people.' },
  { text: 'grassland', group: 'animals-in-the-wild', cue: 'A large open habitat covered mainly with grass.' },
  { text: 'tundra', group: 'animals-in-the-wild', cue: 'A cold, treeless habitat with frozen ground.' },
  { text: 'ocean', group: 'animals-in-the-wild', cue: 'A very large area of salt water.' },
  { text: 'chameleon', group: 'animals-in-the-wild', cue: 'A lizard that can change colour.', difficulty: 2 },

  { text: 'zoo', group: 'day-out-literature', cue: 'A place where people can see many animals.' },
  { text: 'tall', group: 'day-out-literature', cue: 'Having a greater height than usual.' },
  { text: 'thin', group: 'day-out-literature', cue: 'Not thick or wide.' },
  { text: 'neck', group: 'day-out-literature', cue: 'The body part between the head and shoulders.' },
  { text: 'sticks of bamboo', group: 'day-out-literature', cue: 'Long pieces of the plant that pandas eat.', difficulty: 2 },
  { text: 'trunk', group: 'day-out-literature', cue: 'The long nose of an elephant.' },
  { text: 'swing', group: 'day-out-literature', cue: 'Move backwards and forwards through the air.' },
  { text: 'roll', group: 'day-out-literature', cue: 'Move by turning over and over.' },
]

function commonErrors(text: string) {
  const letters = [...text]
  const editable = letters.map((letter, index) => /[a-z]/i.test(letter) ? index : -1).filter((index) => index > 0)
  const middle = editable[Math.floor(editable.length / 2)] ?? 1
  const omitted = letters.filter((_, index) => index !== middle).join('')
  const swapAt = editable.find((index) => /[a-z]/i.test(letters[index + 1] ?? '')) ?? middle
  const swapped = [...letters]
  if (swapAt + 1 < swapped.length) [swapped[swapAt], swapped[swapAt + 1]] = [swapped[swapAt + 1]!, swapped[swapAt]!]
  return [...new Set([omitted, swapped.join('')])].filter((value) => value !== text)
}

export const unit6LexicalItems: LexicalItem[] = seeds.map((seed, index) => ({
  id: `u6-${seed.group}-${index + 1}`, unitId: 'unit-6', kind: seed.text.includes(' ') ? 'phrase' : 'word', text: seed.text,
  category: 'other', acceptedAnswers: [seed.text], commonErrors: commonErrors(seed.text), allowedTaskTypes: wordTasks,
  cue: { type: 'situation', value: seed.cue, label: seed.cue }, difficulty: seed.difficulty ?? 1,
  tags: ['unit-6', seed.group], enabled: true,
}))

export const unit6: CourseUnit = {
  id: 'unit-6', order: 6, title: 'Unit 6', status: 'active', vocabularyIds: unit6LexicalItems.map((item) => item.id), phraseIds: [], grammarIds: [],
}
