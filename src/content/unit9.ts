import type { CourseUnit, LexicalItem, TaskType } from '../domain/types'

const wordTasks: TaskType[] = ['repair', 'audio', 'memory', 'unscramble', 'error-hunt']

export const unit9Groups = [
  { id: 'holidays-vocabulary-1', title: 'Happy holidays', subtitle: 'Vocabulary 1 · Clothes' },
  { id: 'holiday-cartoon', title: 'Happy holidays', subtitle: 'Cartoon · Actions and clothes' },
  { id: 'holidays-vocabulary-2', title: 'Happy holidays', subtitle: 'Vocabulary 2 · At the beach' },
  { id: 'holiday-sights', title: 'What can we see on holiday?', subtitle: 'Nature and holiday places' },
] as const

type WordSeed = { text: string; group: typeof unit9Groups[number]['id']; cue: string; difficulty?: 1 | 2 | 3 | 4 | 5 }

const seeds: WordSeed[] = [
  { text: 'trousers', group: 'holidays-vocabulary-1', cue: 'Clothes covering both legs separately from the waist down.' },
  { text: 'dress', group: 'holidays-vocabulary-1', cue: 'One piece of clothing covering the body and legs.' },
  { text: 'baseball cap', group: 'holidays-vocabulary-1', cue: 'A soft hat with a curved part over the eyes.' },
  { text: 'T-shirt', group: 'holidays-vocabulary-1', cue: 'A casual top with short sleeves shaped like the letter T.' },
  { text: 'skirt', group: 'holidays-vocabulary-1', cue: 'Clothing worn from the waist that does not separate the legs.' },
  { text: 'shorts', group: 'holidays-vocabulary-1', cue: 'Short trousers ending above the knees.' },
  { text: 'hat', group: 'holidays-vocabulary-1', cue: 'Something worn on the head.' },
  { text: 'shirt', group: 'holidays-vocabulary-1', cue: 'An upper-body garment usually with a collar and buttons.' },
  { text: 'sunglasses', group: 'holidays-vocabulary-1', cue: 'Dark glasses that protect your eyes from bright sunlight.' },
  { text: 'boots', group: 'holidays-vocabulary-1', cue: 'Footwear that covers the feet and ankles or lower legs.' },
  { text: 'jacket', group: 'holidays-vocabulary-1', cue: 'A short coat worn over other clothes.' },
  { text: 'jeans', group: 'holidays-vocabulary-1', cue: 'Trousers made from strong blue denim.' },
  { text: 'shoes', group: 'holidays-vocabulary-1', cue: 'Things worn to protect your feet.' },

  { text: 'come', group: 'holiday-cartoon', cue: 'Move towards the speaker or a place.' },
  { text: 'take', group: 'holiday-cartoon', cue: 'Carry or move something with you.' },
  { text: 'put', group: 'holiday-cartoon', cue: 'Move something into a particular place.' },
  { text: 'look at', group: 'holiday-cartoon', cue: 'Direct your eyes towards something.' },
  { text: 'pick up', group: 'holiday-cartoon', cue: 'Lift something from a surface or the ground.' },
  { text: 'point to', group: 'holiday-cartoon', cue: 'Show where something is using a finger.' },
  { text: 'clean', group: 'holiday-cartoon', cue: 'Remove dirt from something.' },
  { text: 'wear', group: 'holiday-cartoon', cue: 'Have clothes, shoes or glasses on your body.' },
  { text: 'dirty', group: 'holiday-cartoon', cue: 'Not clean.' },
  { text: 'put on', group: 'holiday-cartoon', cue: 'Place clothes or shoes on your body.' },
  { text: 'take off', group: 'holiday-cartoon', cue: 'Remove clothes or shoes from your body.' },
  { text: 'barn', group: 'holiday-cartoon', cue: 'A farm building used for animals or storage.' },

  { text: 'fishing', group: 'holidays-vocabulary-2', cue: 'The activity of trying to catch fish.' },
  { text: 'jellyfish', group: 'holidays-vocabulary-2', cue: 'A soft sea animal with a clear body and tentacles.' },
  { text: 'fish', group: 'holidays-vocabulary-2', cue: 'An animal that lives and swims in water.' },
  { text: 'the sun', group: 'holidays-vocabulary-2', cue: 'The bright star that gives Earth light and heat.' },
  { text: 'the sea', group: 'holidays-vocabulary-2', cue: 'A large area of salt water.' },
  { text: 'boat', group: 'holidays-vocabulary-2', cue: 'A small vehicle used for travelling on water.' },
  { text: 'at the beach', group: 'holidays-vocabulary-2', cue: 'A place phrase: on the sandy or stony shore by the sea.' },
  { text: 'camera', group: 'holidays-vocabulary-2', cue: 'A device used to take photographs.' },
  { text: 'sand', group: 'holidays-vocabulary-2', cue: 'Very small grains of rock found on a beach.' },
  { text: 'shell', group: 'holidays-vocabulary-2', cue: 'The hard outer covering of some sea animals.' },
  { text: 'take photos', group: 'holidays-vocabulary-2', cue: 'Use a camera to make pictures.' },
  { text: 'enjoy', group: 'holidays-vocabulary-2', cue: 'Like something and take pleasure in it.' },

  { text: 'shells', group: 'holiday-sights', cue: 'Hard outer coverings found by the sea; more than one shell.' },
  { text: 'snow', group: 'holiday-sights', cue: 'Soft white ice crystals that fall from the sky.' },
  { text: 'flowers', group: 'holiday-sights', cue: 'The colourful parts of plants; more than one flower.' },
  { text: 'mountain', group: 'holiday-sights', cue: 'A very high area of land with steep sides.' },
  { text: 'tree', group: 'holiday-sights', cue: 'A tall plant with a wooden trunk and branches.' },
  { text: 'waterfall', group: 'holiday-sights', cue: 'Water falling over the edge of a high place.' },
  { text: 'frog', group: 'holiday-sights', cue: 'A small animal that jumps and lives on land and in water.' },
  { text: 'rocks', group: 'holiday-sights', cue: 'Hard natural pieces of stone.' },
  { text: 'jellyfish', group: 'holiday-sights', cue: 'A soft sea animal with a clear body and tentacles.' },
  { text: 'river', group: 'holiday-sights', cue: 'A natural stream of water flowing across land.' },
  { text: 'beach', group: 'holiday-sights', cue: 'A sandy or stony shore beside the sea.' },
  { text: 'forest', group: 'holiday-sights', cue: 'A large area covered with many trees.' },
  { text: 'fantastic', group: 'holiday-sights', cue: 'Extremely good, exciting or impressive.', difficulty: 2 },
  { text: 'stay in', group: 'holiday-sights', cue: 'Remain inside a place instead of going out.' },
  { text: 'volcano', group: 'holiday-sights', cue: 'A mountain that can send out hot rock, ash and gas.' },
  { text: 'see you soon', group: 'holiday-sights', cue: 'A friendly phrase said when you expect to meet again.' },
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

export const unit9LexicalItems: LexicalItem[] = seeds.map((seed, index) => ({
  id: `u9-${seed.group}-${index + 1}`, unitId: 'unit-9', partId: seed.group, kind: seed.text.includes(' ') ? 'phrase' : 'word', text: seed.text,
  category: 'other', acceptedAnswers: [seed.text], commonErrors: commonErrors(seed.text), allowedTaskTypes: wordTasks,
  cue: { type: 'situation', value: seed.cue, label: seed.cue }, difficulty: seed.difficulty ?? 1,
  tags: ['unit-9', seed.group], enabled: true,
}))

export const unit9: CourseUnit = {
  id: 'unit-9', order: 9, title: 'Unit 9', status: 'coming-soon', parts: [], vocabularyIds: [], phraseIds: [], grammarIds: [],
}
