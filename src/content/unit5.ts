import type { CourseUnit, LexicalItem, TaskType } from '../domain/types'

const wordTasks: TaskType[] = ['repair', 'audio', 'memory', 'unscramble', 'error-hunt']

export const unit5Groups = [
  { id: 'birthday-vocabulary-1', title: 'Happy birthday', subtitle: 'Vocabulary 1' },
  { id: 'birthday-vocabulary-2', title: 'Happy birthday', subtitle: 'Vocabulary 2' },
  { id: 'shapes-around-us', title: 'Shapes around us', subtitle: 'Shape words' },
  { id: 'birthday-literature', title: 'Happy birthday', subtitle: 'Literature' },
] as const

type WordSeed = { text: string; group: typeof unit5Groups[number]['id']; cue: string; difficulty?: 1 | 2 | 3 | 4 | 5 }

const seeds: WordSeed[] = [
  { text: 'plane', group: 'birthday-vocabulary-1', cue: 'A vehicle that flies in the sky.' },
  { text: 'doll', group: 'birthday-vocabulary-1', cue: 'A toy shaped like a person.' },
  { text: 'kite', group: 'birthday-vocabulary-1', cue: 'A light toy that flies at the end of a string.' },
  { text: 'robot', group: 'birthday-vocabulary-1', cue: 'A machine that can move and do tasks.' },
  { text: 'house', group: 'birthday-vocabulary-1', cue: 'A building where people live.' },
  { text: 'ball', group: 'birthday-vocabulary-1', cue: 'A round object used in many games.' },
  { text: 'car', group: 'birthday-vocabulary-1', cue: 'A road vehicle with four wheels.' },
  { text: 'bike', group: 'birthday-vocabulary-1', cue: 'A vehicle with two wheels and pedals.' },
  { text: 'whose', group: 'birthday-vocabulary-1', cue: 'A question word used to ask who owns something.' },
  { text: 'his', group: 'birthday-vocabulary-1', cue: 'Belonging to a boy or man.' },
  { text: 'her', group: 'birthday-vocabulary-1', cue: 'Belonging to a girl or woman.' },
  { text: 'their', group: 'birthday-vocabulary-1', cue: 'Belonging to them.' },

  { text: 'cool', group: 'birthday-vocabulary-2', cue: 'Very good, fashionable or impressive.' },
  { text: 'computer', group: 'birthday-vocabulary-2', cue: 'An electronic machine used for work, games and information.' },
  { text: 'keyboard', group: 'birthday-vocabulary-2', cue: 'Computer keys used for typing.' },
  { text: 'mouse', group: 'birthday-vocabulary-2', cue: 'A small computer control moved by hand.' },
  { text: 'toy box', group: 'birthday-vocabulary-2', cue: 'A container where toys are kept.' },
  { text: 'balloon', group: 'birthday-vocabulary-2', cue: 'A colourful rubber shape filled with air.' },
  { text: 'board game', group: 'birthday-vocabulary-2', cue: 'A game played with pieces on a flat board.' },
  { text: 'helicopter', group: 'birthday-vocabulary-2', cue: 'An aircraft with large turning blades.', difficulty: 2 },
  { text: 'teddy', group: 'birthday-vocabulary-2', cue: 'A soft toy bear.' },
  { text: 'radio', group: 'birthday-vocabulary-2', cue: 'A device used to listen to broadcasts.' },
  { text: 'ship', group: 'birthday-vocabulary-2', cue: 'A large boat that travels on the sea.' },
  { text: 'new', group: 'birthday-vocabulary-2', cue: 'Recently made, bought or received.' },
  { text: 'want', group: 'birthday-vocabulary-2', cue: 'Would like to have or do something.' },

  { text: 'shapes', group: 'shapes-around-us', cue: 'The forms or outlines of things.' },
  { text: 'circle', group: 'shapes-around-us', cue: 'A perfectly round shape.' },
  { text: 'square', group: 'shapes-around-us', cue: 'A shape with four equal sides.' },
  { text: 'triangle', group: 'shapes-around-us', cue: 'A shape with three sides.' },
  { text: 'rectangle', group: 'shapes-around-us', cue: 'A four-sided shape with four right angles.', difficulty: 2 },

  { text: 'twins', group: 'birthday-literature', cue: 'Two children born to the same mother at the same time.' },
  { text: 'monster', group: 'birthday-literature', cue: 'An imaginary frightening creature.' },
  { text: 'alien', group: 'birthday-literature', cue: 'An imaginary living thing from another planet.' },
  { text: 'Here you are!', group: 'birthday-literature', cue: 'Words you say when giving something to someone.', difficulty: 2 },
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

export const unit5LexicalItems: LexicalItem[] = seeds.map((seed, index) => ({
  id: `u5-${seed.group}-${index + 1}`, unitId: 'unit-5', partId: seed.group, kind: seed.text.includes(' ') ? 'phrase' : 'word', text: seed.text,
  category: 'other', acceptedAnswers: [seed.text], commonErrors: commonErrors(seed.text), allowedTaskTypes: wordTasks,
  cue: { type: 'situation', value: seed.cue, label: seed.cue }, difficulty: seed.difficulty ?? 1,
  tags: ['unit-5', seed.group], enabled: true,
}))

export const unit5: CourseUnit = {
  id: 'unit-5', order: 5, title: 'Unit 5', status: 'coming-soon', parts: [], vocabularyIds: [], phraseIds: [], grammarIds: [],
}
