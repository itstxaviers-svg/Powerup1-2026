import type { CourseUnit, LexicalItem, TaskType } from '../domain/types'

const wordTasks: TaskType[] = ['memory', 'repair', 'unscramble', 'error-hunt', 'audio', 'final-decode']

export const unit2Groups = [
  { id: 'family', title: 'All about us', subtitle: 'Vocabulary 1 · Family' },
  { id: 'body', title: 'All about us', subtitle: 'Vocabulary 2 · Body' },
  { id: 'senses', title: 'Using our senses', subtitle: 'See, hear, smell, taste and touch' },
] as const

type WordSeed = { text: string; group: typeof unit2Groups[number]['id']; cue: string; difficulty?: 1 | 2 | 3 | 4 | 5 }

const seeds: WordSeed[] = [
  { text: 'family', group: 'family', cue: 'Parents, children and relatives together.' },
  { text: 'mother', group: 'family', cue: 'A female parent.' },
  { text: 'mum', group: 'family', cue: 'A short British word for mother.' },
  { text: 'dad', group: 'family', cue: 'A short word for father.' },
  { text: 'father', group: 'family', cue: 'A male parent.' },
  { text: 'grandfather', group: 'family', cue: 'The father of your mother or father.', difficulty: 2 },
  { text: 'grandpa', group: 'family', cue: 'A short friendly word for grandfather.' },
  { text: 'grandmother', group: 'family', cue: 'The mother of your mother or father.', difficulty: 2 },
  { text: 'grandma', group: 'family', cue: 'A short friendly word for grandmother.' },
  { text: 'sister', group: 'family', cue: 'A girl or woman with the same parents as you.' },
  { text: 'brother', group: 'family', cue: 'A boy or man with the same parents as you.' },
  { text: 'boy', group: 'family', cue: 'A male child.' },
  { text: 'girl', group: 'family', cue: 'A female child.' },
  { text: 'twins', group: 'family', cue: 'Two children born to the same mother at the same time.' },

  { text: 'arm', group: 'body', cue: 'The body part from your shoulder to your hand.' },
  { text: 'body', group: 'body', cue: 'All the physical parts of a person or animal.' },
  { text: 'ear', group: 'body', cue: 'The body part you hear with.' },
  { text: 'eye', group: 'body', cue: 'The body part you see with.' },
  { text: 'face', group: 'body', cue: 'The front of your head with your eyes, nose and mouth.' },
  { text: 'feet', group: 'body', cue: 'More than one foot.' },
  { text: 'foot', group: 'body', cue: 'The body part at the end of your leg.' },
  { text: 'hair', group: 'body', cue: 'It grows on your head.' },
  { text: 'hand', group: 'body', cue: 'The body part at the end of your arm.' },
  { text: 'head', group: 'body', cue: 'The top part of your body.' },
  { text: 'leg', group: 'body', cue: 'A body part used for standing and walking.' },
  { text: 'mouth', group: 'body', cue: 'You speak and eat with it.' },
  { text: 'nose', group: 'body', cue: 'You smell and breathe with it.' },
  { text: 'tail', group: 'body', cue: 'A body part at the back of many animals.' },
  { text: 'move', group: 'body', cue: 'Change position; do not stay still.' },

  { text: 'see', group: 'senses', cue: 'I can s___ with my eyes.' },
  { text: 'hear', group: 'senses', cue: 'I can h___ with my ears.' },
  { text: 'smell', group: 'senses', cue: 'I can s___ with my nose.' },
  { text: 'taste', group: 'senses', cue: 'I can t____ with my tongue.' },
  { text: 'touch', group: 'senses', cue: 'I can t___ with my hands.' },
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

export const unit2LexicalItems: LexicalItem[] = seeds.map((seed, index) => ({
  id: `u2-${seed.group}-${index + 1}`,
  unitId: 'unit-2',
  kind: 'word',
  text: seed.text,
  category: 'other',
  acceptedAnswers: [seed.text],
  commonErrors: commonErrors(seed.text),
  allowedTaskTypes: wordTasks,
  cue: { type: 'situation', value: seed.cue, label: seed.cue },
  difficulty: seed.difficulty ?? 1,
  tags: ['unit-2', seed.group],
  enabled: true,
}))

export const unit2: CourseUnit = {
  id: 'unit-2', order: 2, title: 'Unit 2', status: 'active',
  vocabularyIds: unit2LexicalItems.map((item) => item.id), phraseIds: [], grammarIds: [],
}
