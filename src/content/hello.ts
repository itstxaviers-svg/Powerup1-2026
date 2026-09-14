import type { CourseUnit, GrammarPoint, LexicalItem, TaskType } from '../domain/types'

const fiveTasks: TaskType[] = ['repair', 'audio', 'memory', 'unscramble', 'error-hunt']
export const helloParts: CourseUnit['parts'] = [
  { id: 'numbers', unitId: 'hello', order: 1, title: 'Numbers', description: 'Words from one to ten' },
  { id: 'colours', unitId: 'hello', order: 2, title: 'Colours', description: 'British colour spellings' },
  { id: 'introductions', unitId: 'hello', order: 3, title: 'Introductions', description: 'Greetings, names and age' },
]
const numberData = [
  ['one', '1', ['on', 'onne']], ['two', '2', ['to', 'tow']], ['three', '3', ['tree', 'thre', 'threee']],
  ['four', '4', ['for', 'foure']], ['five', '5', ['fiv', 'fiev']], ['six', '6', ['siks', 'sixx']],
  ['seven', '7', ['sevn', 'sevan']], ['eight', '8', ['eigth', 'eght', 'eigt', 'ight']], ['nine', '9', ['nin', 'nien']], ['ten', '10', ['tan', 'tenn']],
] as const

const colours = [
  ['red', '#ef4444', ['redd', 'erd']], ['blue', '#2563eb', ['blu', 'bule']], ['yellow', '#facc15', ['yelow', 'yello', 'yeloww', 'yellou']],
  ['green', '#16a36a', ['gren', 'grean', 'greeen', 'grene']], ['orange', '#f97316', ['orenge', 'orang', 'ornage']],
  ['purple', '#8b5cf6', ['purpel', 'perple', 'purpl', 'puprle']], ['pink', '#ec4899', ['pinc', 'pnik']],
  ['grey', '#64748b', ['gry', 'greey']], ['black', '#111827', ['blak', 'balck']], ['white', '#f8fafc', ['wite', 'whiet']],
  ['brown', '#8b5e3c', ['broun', 'borwn']],
] as const

export const lexicalItems: LexicalItem[] = [
  ...numberData.map(([word, glyph, errors], index): LexicalItem => ({
    id: `h-num-${word}`, unitId: 'hello', partId: 'numbers', kind: 'word', text: word, category: 'number', acceptedAnswers: [word],
    commonErrors: [...errors], allowedTaskTypes: fiveTasks, cue: { type: 'number', value: glyph, label: `Number ${glyph}` },
    difficulty: index < 3 ? 1 : 2, tags: ['hello', 'number'], enabled: true,
  })),
  ...colours.map(([word, colour, errors], index): LexicalItem => ({
    id: `h-col-${word}`, unitId: 'hello', partId: 'colours', kind: 'word', text: word, category: 'colour', acceptedAnswers: [word],
    acceptedVariants: word === 'grey' ? [{ value: 'gray', note: 'Correct English. Course spelling: grey.', grantsFullCourseMastery: false }] : undefined,
    commonErrors: [...errors], allowedTaskTypes: fiveTasks, cue: { type: 'colour', value: colour, label: 'Colour signal' },
    difficulty: index < 4 ? 1 : 2, tags: ['hello', 'colour'], enabled: true,
  })),
]

const names = ['Alex', 'Anna', 'Ben', 'Emma', 'Jack', 'Kate', 'Leo', 'Mia', 'Max', 'Sam', 'Tom', 'Zoe']
type GrammarSeed = {
  id: string; title: string; goal: string; patterns: string[]; errors: string[]; difficulty?: 1 | 2 | 3 | 4 | 5;
  tasks?: TaskType[]; slots?: Array<{ id: string; values: string[] }>
}

const grammarSeeds: GrammarSeed[] = [
  { id: 'G-H-01', title: 'Greeting', goal: 'Write a short greeting accurately.', patterns: ['Hello!', 'Hi!'], errors: ['Helo!', 'Helllo!', 'Hi.'] },
  { id: 'G-H-02', title: 'Asking a name', goal: 'Ask someone their name.', patterns: ['What’s your name?'], errors: ['Whats your name?', 'What’s you name?', 'What your name?', 'What’s your name.', 'what’s your name?', 'What’s your names?'] },
  { id: 'G-H-03', title: 'Introducing yourself', goal: 'Introduce yourself using I’m.', patterns: ['I’m {name}.', 'Hello, I’m {name}.'], errors: ['Im {name}.', 'I m {name}.', 'i’m {name}.', 'I’m {name}', 'I’am {name}.', 'I {name}.'], slots: [{ id: 'name', values: names }] },
  { id: 'G-H-04', title: 'Asking age', goal: 'Ask someone how old they are.', patterns: ['How old are you?'], errors: ['How old is you?', 'How are old you?', 'How old you are?', 'How old are you.', 'how old are you?', 'How old you?'] },
  { id: 'G-H-05', title: 'Giving age', goal: 'Say your age using I’m.', patterns: ['I’m {number}.'], errors: ['Im {number}.', 'I’m {number}', 'i’m {number}.'], slots: [{ id: 'number', values: numberData.map(([word]) => word) }] },
  { id: 'G-H-06', title: 'Introducing another person', goal: 'Introduce someone using This is.', patterns: ['This is {name}.'], errors: ['This {name}.', 'This are {name}.', 'this is {name}.', 'This is {name}'], slots: [{ id: 'name', values: names }] },
  { id: 'G-H-07', title: 'Look + name', goal: 'Use a comma when calling to someone.', patterns: ['Look, {name}.'], errors: ['Look {name}.', 'look, {name}.'], slots: [{ id: 'name', values: names }], difficulty: 2 },
  { id: 'G-H-08', title: 'Our barn', goal: 'Recall the fixed phrase accurately.', patterns: ['This is our barn.'], errors: ['This our barn.', 'This is are barn.'] },
  { id: 'G-H-09', title: 'Combined introduction', goal: 'Join two introductions with and.', patterns: ['Hello, I’m {name} and this is {name2}.'], errors: ['Hello I’m {name} this is {name2}.', 'Hello, I’m {name} and this {name2}.'], slots: [{ id: 'name', values: names }, { id: 'name2', values: [...names].reverse() }], difficulty: 4 },
  { id: 'G-H-10', title: 'I don’t know', goal: 'Use the apostrophe in don’t.', patterns: ['I don’t know.'], errors: ['I dont know.', 'i don’t know.', 'I don’t no.'], difficulty: 2 },
  { id: 'G-H-11', title: 'Favourite colour', goal: 'Write a favourite-colour sentence in British English.', patterns: ['My favourite colour is {colour}.'], errors: ['My favorite color is {colour}.', 'My favourite colour {colour}.', 'my favourite colour is {colour}.'], slots: [{ id: 'colour', values: colours.map(([word]) => word) }], difficulty: 4 },
]

function fill(pattern: string, slots: GrammarSeed['slots'], offset: number) {
  let result = pattern
  for (const slot of slots ?? []) result = result.replace(`{${slot.id}}`, slot.values[offset % slot.values.length] ?? '')
  return result
}

function editDistance(left: string, right: string) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let previous = row[0]!
    row[0] = leftIndex
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const current = row[rightIndex]!
      row[rightIndex] = Math.min(row[rightIndex]! + 1, row[rightIndex - 1]! + 1, previous + Number(left[leftIndex - 1] !== right[rightIndex - 1]))
      previous = current
    }
  }
  return row[right.length]!
}

export const grammarPoints: GrammarPoint[] = grammarSeeds.map((seed) => {
  const taskTypes = seed.tasks ?? fiveTasks
  const examples = Array.from({ length: Math.max(8, seed.slots?.[0]?.values.length ?? seed.patterns.length) }, (_, index) => {
    const pattern = seed.patterns[index % seed.patterns.length] ?? seed.patterns[0]!
    return { id: `${seed.id}-ex-${index + 1}`, text: fill(pattern, seed.slots, index) }
  })
  return {
    id: seed.id, unitId: 'hello', partId: 'introductions', title: seed.title, learningGoal: seed.goal, canonicalPatterns: seed.patterns,
    slots: seed.slots ?? [], examplePool: examples,
    commonErrors: seed.errors.flatMap((error, index) => examples.slice(0, seed.slots?.length ? 2 : 1).map((_, exampleIndex) => {
      const offset = index + exampleIndex
      const value = fill(error, seed.slots, offset)
      const corrections = seed.patterns.map((pattern) => fill(pattern, seed.slots, offset))
      const correction = [...corrections].sort((left, right) => editDistance(value, left) - editDistance(value, right))[0]!
      return { value, correction, feedback: error.replace(/[{}\w\s,.?]/g, '').includes("'") ? 'Check the apostrophe.' : 'One part of the code is unstable.' }
    })),
    distractorPool: seed.errors.map((error, index) => fill(error, seed.slots, index)),
    exerciseBlueprints: taskTypes.map((taskType, index) => ({
      id: `${seed.id}-bp-${taskType}`, grammarId: seed.id, taskType,
      promptPattern: seed.patterns[index % seed.patterns.length] ?? seed.patterns[0]!, answerPattern: seed.patterns[index % seed.patterns.length] ?? seed.patterns[0]!,
      difficulty: seed.difficulty ?? (index < 2 ? 1 : 2), hintStrategy: taskType === 'unscramble' ? 'words' : 'letters', enabled: true,
    })),
    allowedTaskTypes: taskTypes, difficulty: seed.difficulty ?? 2, enabled: true,
  }
})

const lexicalIds = lexicalItems.map((item) => item.id)
export const units: CourseUnit[] = [
  { id: 'hello', order: 0, title: 'Hello!', status: 'active', parts: helloParts, vocabularyIds: lexicalIds, phraseIds: [], grammarIds: grammarPoints.map((item) => item.id) },
  ...Array.from({ length: 9 }, (_, index): CourseUnit => ({
    id: `unit-${index + 1}` as CourseUnit['id'], order: index + 1, title: `Unit ${index + 1}`, status: 'coming-soon', parts: [], vocabularyIds: [], phraseIds: [], grammarIds: [],
  })),
]

export const namePool = names
