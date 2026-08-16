import type { CourseUnit, LexicalItem, TaskType } from '../domain/types'

const wordTasks: TaskType[] = ['memory', 'repair', 'unscramble', 'error-hunt', 'audio', 'final-decode']

export const unit7Groups = [
  { id: 'play-vocabulary-1', title: 'Let’s play', subtitle: 'Vocabulary 1 · Activities' },
  { id: 'play-vocabulary-2', title: 'Let’s play', subtitle: 'Vocabulary 2 · Sports and actions' },
  { id: 'look-after-your-body', title: 'Look after your body', subtitle: 'Movement and health' },
  { id: 'play-literature', title: 'Let’s play', subtitle: 'Literature' },
] as const

type WordSeed = { text: string; group: typeof unit7Groups[number]['id']; cue: string; difficulty?: 1 | 2 | 3 | 4 | 5; errors?: string[] }

const seeds: WordSeed[] = [
  { text: 'play tennis', group: 'play-vocabulary-1', cue: 'Use a racket to send a ball over a net.' },
  { text: 'play football', group: 'play-vocabulary-1', cue: 'Play a team game where players kick a ball.' },
  { text: 'ride a bike', group: 'play-vocabulary-1', cue: 'Travel on a two-wheeled vehicle with pedals.' },
  { text: 'play the guitar', group: 'play-vocabulary-1', cue: 'Make music with a string instrument held in your hands.' },
  { text: 'play the piano', group: 'play-vocabulary-1', cue: 'Make music by pressing black and white keys.' },
  { text: 'play basketball', group: 'play-vocabulary-1', cue: 'Play a team game where players throw a ball through a hoop.' },
  { text: 'swim', group: 'play-vocabulary-1', cue: 'Move through water using your arms and legs.' },
  { text: 'watch television', group: 'play-vocabulary-1', cue: 'Look at programmes on a television screen.' },

  { text: 'throw', group: 'play-vocabulary-2', cue: 'Send something through the air with your hand.' },
  { text: 'catch', group: 'play-vocabulary-2', cue: 'Stop and hold something moving through the air.' },
  { text: 'baseball', group: 'play-vocabulary-2', cue: 'A game where players hit a ball with a bat.' },
  { text: 'badminton', group: 'play-vocabulary-2', cue: 'A racket game played with a shuttlecock.', difficulty: 2 },
  { text: 'ride a skateboard', group: 'play-vocabulary-2', cue: 'Travel standing on a small board with wheels.' },
  { text: 'hockey', group: 'play-vocabulary-2', cue: 'A team game played with sticks and a ball or puck.' },
  { text: 'hit a ball', group: 'play-vocabulary-2', cue: 'Strike a ball with a hand, bat or racket.' },
  { text: 'run', group: 'play-vocabulary-2', cue: 'Move quickly on your feet.' },
  { text: 'kick', group: 'play-vocabulary-2', cue: 'Hit something with your foot.' },

  { text: 'stretch', group: 'look-after-your-body', cue: 'Make your arms, legs or body straight and long.' },
  { text: 'jump', group: 'look-after-your-body', cue: 'Push yourself off the ground into the air.' },
  { text: 'exercise', group: 'look-after-your-body', cue: 'Physical activity that keeps your body healthy.' },
  { text: 'body power', group: 'look-after-your-body', cue: 'The strength and energy your body can use.' },
  { text: 'muscle', group: 'look-after-your-body', cue: 'Body tissue that makes movement possible.', errors: ['musle', 'mucle'] },
  { text: 'play outside', group: 'look-after-your-body', cue: 'Have fun outdoors, not inside a building.' },
  { text: 'bone', group: 'look-after-your-body', cue: 'A hard part inside the body that forms the skeleton.' },
  { text: 'sun cream', group: 'look-after-your-body', cue: 'Cream put on the skin for protection from the sun.' },
  { text: 'important', group: 'look-after-your-body', cue: 'Something that matters and should not be forgotten.', difficulty: 2 },

  { text: 'hold', group: 'play-literature', cue: 'Keep something in your hand or arms.' },
  { text: 'around', group: 'play-literature', cue: 'On every side of something, or moving in a circle.' },
  { text: 'pond', group: 'play-literature', cue: 'A small area of still water.' },
]

function generatedErrors(text: string) {
  const letters = [...text]
  const editable = letters.map((letter, index) => /[a-z]/i.test(letter) ? index : -1).filter((index) => index > 0)
  const middle = editable[Math.floor(editable.length / 2)] ?? 1
  const omitted = letters.filter((_, index) => index !== middle).join('')
  const swapAt = editable.find((index) => /[a-z]/i.test(letters[index + 1] ?? '')) ?? middle
  const swapped = [...letters]
  if (swapAt + 1 < swapped.length) [swapped[swapAt], swapped[swapAt + 1]] = [swapped[swapAt + 1]!, swapped[swapAt]!]
  return [...new Set([omitted, swapped.join('')])].filter((value) => value !== text)
}

export const unit7LexicalItems: LexicalItem[] = seeds.map((seed, index) => ({
  id: `u7-${seed.group}-${index + 1}`, unitId: 'unit-7', kind: seed.text.includes(' ') ? 'phrase' : 'word', text: seed.text,
  category: 'other', acceptedAnswers: [seed.text], commonErrors: seed.errors ?? generatedErrors(seed.text), allowedTaskTypes: wordTasks,
  cue: { type: 'situation', value: seed.cue, label: seed.cue }, difficulty: seed.difficulty ?? 1,
  tags: ['unit-7', seed.group], enabled: true,
}))

export const unit7: CourseUnit = {
  id: 'unit-7', order: 7, title: 'Unit 7', status: 'active', vocabularyIds: unit7LexicalItems.map((item) => item.id), phraseIds: [], grammarIds: [],
}
