import type { CourseUnit, LexicalItem, TaskType } from '../domain/types'

const wordTasks: TaskType[] = ['memory', 'repair', 'unscramble', 'error-hunt', 'audio', 'final-decode']

export const unit8Groups = [
  { id: 'at-home-vocabulary-1', title: 'At home', subtitle: 'Vocabulary 1 · Rooms and objects' },
  { id: 'around-the-house', title: 'Around the house', subtitle: 'Vocabulary 2 · Furniture and positions' },
] as const

type WordSeed = { text: string; group: typeof unit8Groups[number]['id']; cue: string; difficulty?: 1 | 2 | 3 | 4 | 5 }

const seeds: WordSeed[] = [
  { text: 'bed', group: 'at-home-vocabulary-1', cue: 'Furniture that you sleep in.' },
  { text: 'radio', group: 'at-home-vocabulary-1', cue: 'A device used to listen to broadcasts.' },
  { text: 'bedroom', group: 'at-home-vocabulary-1', cue: 'A room where people sleep.' },
  { text: 'bath', group: 'at-home-vocabulary-1', cue: 'A large container filled with water for washing.' },
  { text: 'mirror', group: 'at-home-vocabulary-1', cue: 'A surface in which you can see yourself.' },
  { text: 'bathroom', group: 'at-home-vocabulary-1', cue: 'A room with a bath or shower.' },
  { text: 'kitchen', group: 'at-home-vocabulary-1', cue: 'A room where food is prepared.' },
  { text: 'dining room', group: 'at-home-vocabulary-1', cue: 'A room where people eat meals.', difficulty: 2 },
  { text: 'living room', group: 'at-home-vocabulary-1', cue: 'A room where people relax together.', difficulty: 2 },

  { text: 'living room', group: 'around-the-house', cue: 'A room where people sit and relax together.', difficulty: 2 },
  { text: 'sofa', group: 'around-the-house', cue: 'A long comfortable seat for several people.' },
  { text: 'lamp', group: 'around-the-house', cue: 'An object that gives light.' },
  { text: 'painting', group: 'around-the-house', cue: 'A picture made using paint.' },
  { text: 'rug', group: 'around-the-house', cue: 'A small carpet that covers part of a floor.' },
  { text: 'hall', group: 'around-the-house', cue: 'The area just inside the entrance of a home.' },
  { text: 'clock', group: 'around-the-house', cue: 'An object that shows the time.' },
  { text: 'floor', group: 'around-the-house', cue: 'The surface that you walk on inside a room.' },
  { text: 'armchair', group: 'around-the-house', cue: 'A comfortable chair with supports for your arms.' },
  { text: 'between', group: 'around-the-house', cue: 'Position: in the middle of two things.' },
  { text: 'in front of', group: 'around-the-house', cue: 'Position: before something, not behind it.', difficulty: 2 },
  { text: 'behind', group: 'around-the-house', cue: 'Position: at the back of something.' },
  { text: 'dining room', group: 'around-the-house', cue: 'A room where people sit together to eat.', difficulty: 2 },
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

export const unit8LexicalItems: LexicalItem[] = seeds.map((seed, index) => ({
  id: `u8-${seed.group}-${index + 1}`, unitId: 'unit-8', kind: seed.text.includes(' ') ? 'phrase' : 'word', text: seed.text,
  category: 'other', acceptedAnswers: [seed.text], commonErrors: commonErrors(seed.text), allowedTaskTypes: wordTasks,
  cue: { type: 'situation', value: seed.cue, label: seed.cue }, difficulty: seed.difficulty ?? 1,
  tags: ['unit-8', seed.group], enabled: true,
}))

export const unit8: CourseUnit = {
  id: 'unit-8', order: 8, title: 'Unit 8', status: 'active', vocabularyIds: unit8LexicalItems.map((item) => item.id), phraseIds: [], grammarIds: [],
}
