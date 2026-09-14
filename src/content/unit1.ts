import type { CourseUnit, GrammarPoint, LexicalItem, TaskType } from '../domain/types'

const wordTasks: TaskType[] = ['repair', 'audio', 'memory', 'unscramble', 'error-hunt']
const sentenceTasks: TaskType[] = ['repair', 'audio', 'memory', 'unscramble', 'error-hunt']

export const unit1Groups = [
  { id: 'school-vocabulary-1', title: 'Our school', subtitle: 'Vocabulary 1' },
  { id: 'prepositions', title: 'Prepositions', subtitle: 'Position words' },
  { id: 'school-vocabulary-2', title: 'Our new school', subtitle: 'Vocabulary 2 and questions' },
  { id: 'be-kind', title: 'Be kind at school', subtitle: 'Kind actions' },
] as const

type WordSeed = { text: string; group: typeof unit1Groups[number]['id']; cue: string; difficulty?: 1 | 2 | 3 | 4 | 5 }

const seeds: WordSeed[] = [
  { text: 'classroom', group: 'school-vocabulary-1', cue: 'A room where a class learns.' },
  { text: 'bag', group: 'school-vocabulary-1', cue: 'Something you carry school things in.' },
  { text: 'teacher', group: 'school-vocabulary-1', cue: 'A person who helps a class learn.' },
  { text: 'desk', group: 'school-vocabulary-1', cue: 'A school table for one learner.' },
  { text: 'chair', group: 'school-vocabulary-1', cue: 'Something you sit on.' },
  { text: 'book', group: 'school-vocabulary-1', cue: 'Pages with words and pictures.' },
  { text: 'pencil', group: 'school-vocabulary-1', cue: 'You write with it and can erase it.' },
  { text: 'rubber', group: 'school-vocabulary-1', cue: 'A British school word: it removes pencil marks.' },
  { text: 'pen', group: 'school-vocabulary-1', cue: 'You write with it using ink.' },
  { text: 'crayon', group: 'school-vocabulary-1', cue: 'A coloured stick used for drawing.' },
  { text: 'pencil case', group: 'school-vocabulary-1', cue: 'A small case that holds pens and pencils.', difficulty: 2 },

  { text: 'on', group: 'prepositions', cue: 'Position: touching the top of something.' },
  { text: 'in', group: 'prepositions', cue: 'Position: inside something.' },
  { text: 'under', group: 'prepositions', cue: 'Position: lower than something.' },
  { text: 'between', group: 'prepositions', cue: 'Position: in the middle of two things.', difficulty: 2 },
  { text: 'in front of', group: 'prepositions', cue: 'Position: before something, not behind it.', difficulty: 3 },
  { text: 'next to', group: 'prepositions', cue: 'Position: directly beside something.', difficulty: 2 },
  { text: 'near', group: 'prepositions', cue: 'Position: close to something.' },

  { text: 'bookcase', group: 'school-vocabulary-2', cue: 'A piece of furniture that holds books.' },
  { text: 'paper', group: 'school-vocabulary-2', cue: 'A thin sheet used for writing or drawing.' },
  { text: 'cupboard', group: 'school-vocabulary-2', cue: 'Storage furniture with doors.', difficulty: 2 },
  { text: 'ruler', group: 'school-vocabulary-2', cue: 'A school tool for measuring and straight lines.' },
  { text: 'playground', group: 'school-vocabulary-2', cue: 'A place outside where pupils play.', difficulty: 2 },
  { text: 'window', group: 'school-vocabulary-2', cue: 'You can see outside through it.' },
  { text: 'wall', group: 'school-vocabulary-2', cue: 'One vertical side of a room.' },
  { text: 'board', group: 'school-vocabulary-2', cue: 'A teacher writes on it for the class.' },
  { text: 'door', group: 'school-vocabulary-2', cue: 'You open it to enter a room.' },

  { text: 'kind', group: 'be-kind', cue: 'Friendly, caring and helpful.' },
  { text: 'work together', group: 'be-kind', cue: 'Do a task with other people.', difficulty: 2 },
  { text: 'share', group: 'be-kind', cue: 'Let another person use something too.' },
  { text: 'help', group: 'be-kind', cue: 'Make something easier for another person.' },
  { text: 'listen to', group: 'be-kind', cue: 'Pay attention to what someone says.', difficulty: 2 },
]

function commonErrors(text: string) {
  const letters = [...text]
  if (letters.length < 3) return [[...letters].reverse().join(''), letters[0]!]
  const editable = letters.map((letter, index) => /[a-z]/i.test(letter) ? index : -1).filter((index) => index > 0 && index < letters.length - 1)
  const first = editable[Math.floor(editable.length / 2)] ?? 1
  const omitted = letters.filter((_, index) => index !== first).join('')
  const swapAt = editable.find((index) => /[a-z]/i.test(letters[index + 1] ?? '')) ?? first
  const swapped = [...letters]
  ;[swapped[swapAt], swapped[swapAt + 1]] = [swapped[swapAt + 1]!, swapped[swapAt]!]
  return [...new Set([omitted, swapped.join('')])].filter((value) => value !== text)
}

export const unit1LexicalItems: LexicalItem[] = seeds.map((seed, index) => ({
  id: `u1-${seed.group}-${index + 1}`,
  unitId: 'unit-1',
  partId: seed.group,
  kind: seed.text.includes(' ') ? 'phrase' : 'word',
  text: seed.text,
  category: 'other',
  acceptedAnswers: [seed.text],
  commonErrors: commonErrors(seed.text),
  allowedTaskTypes: wordTasks,
  cue: { type: 'situation', value: seed.cue, label: seed.cue },
  difficulty: seed.difficulty ?? 1,
  tags: ['unit-1', seed.group],
  enabled: true,
}))

const objects = ['window', 'wall', 'board', 'door', 'bookcase', 'cupboard', 'desk', 'chair', 'book', 'bag', 'pencil', 'ruler']
const plurals: Record<string, string> = { bookcase: 'bookcases' }
const plural = (word: string) => plurals[word] ?? `${word}s`

function grammarPoint(id: string, title: string, question: string, answerPattern: string, pluralMode = false): GrammarPoint {
  const examples = objects.map((object, index) => ({ id: `${id}-ex-${index + 1}`, text: `${question} ${answerPattern.replace('{object}', pluralMode ? plural(object) : object)}` }))
  const taskTypes = sentenceTasks
  return {
    id, unitId: 'unit-1', partId: 'school-vocabulary-2', title, learningGoal: pluralMode ? 'Ask about and name more than one school object.' : 'Ask about and name one school object.',
    canonicalPatterns: [question, answerPattern], slots: [{ id: 'object', values: pluralMode ? objects.map(plural) : objects }], examplePool: examples,
    commonErrors: objects.slice(0, 8).map((object) => {
      const target = pluralMode ? plural(object) : object
      return pluralMode
        ? { value: `What is these? They is ${target}.`, correction: `What are these? They are ${target}.`, feedback: 'Check are and they.' }
        : { value: `What are this? It are a ${target}.`, correction: `What is this? It is a ${target}.`, feedback: 'Check is and it.' }
    }),
    distractorPool: pluralMode ? ['What is these?', 'They is windows.', 'It is windows.'] : ['What are this?', 'It are a window.', 'They are a window.'],
    exerciseBlueprints: taskTypes.map((taskType) => ({ id: `${id}-bp-${taskType}`, grammarId: id, taskType, promptPattern: question, answerPattern, difficulty: 2, hintStrategy: taskType === 'unscramble' ? 'words' : 'letters', enabled: true })),
    allowedTaskTypes: taskTypes, difficulty: 2, tags: ['unit-1', 'school-vocabulary-2'], enabled: true,
  }
}

export const unit1GrammarPoints: GrammarPoint[] = [
  grammarPoint('G-1-01', 'What is this?', 'What is this?', 'It is a {object}.'),
  grammarPoint('G-1-02', 'What are these?', 'What are these?', 'They are {object}.', true),
]

export const unit1: CourseUnit = {
  id: 'unit-1', order: 1, title: 'Unit 1', status: 'coming-soon', parts: [],
  vocabularyIds: [], phraseIds: [], grammarIds: [],
}
