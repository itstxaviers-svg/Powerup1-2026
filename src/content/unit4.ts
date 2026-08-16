import type { CourseUnit, GrammarPoint, LexicalItem, TaskType } from '../domain/types'

const wordTasks: TaskType[] = ['memory', 'repair', 'unscramble', 'error-hunt', 'audio', 'final-decode']
const sentenceTasks: TaskType[] = ['memory', 'repair', 'error-hunt', 'audio', 'sentence-build', 'dialogue-gap', 'punctuation']

export const unit4Groups = [
  { id: 'food-vocabulary-1', title: 'Food with friends', subtitle: 'Vocabulary 1' },
  { id: 'food-vocabulary-2', title: 'Food with friends', subtitle: 'Vocabulary 2 and questions' },
  { id: 'making-a-recipe', title: 'Making a recipe', subtitle: 'Ingredients and actions' },
  { id: 'food-literature', title: 'Food with friends', subtitle: 'Literature' },
] as const

type WordSeed = { text: string; group: typeof unit4Groups[number]['id']; cue: string; difficulty?: 1 | 2 | 3 | 4 | 5 }

const seeds: WordSeed[] = [
  { text: 'banana', group: 'food-vocabulary-1', cue: 'A long curved yellow fruit.' },
  { text: 'burger', group: 'food-vocabulary-1', cue: 'Food in a round bread bun with a filling.' },
  { text: 'chicken', group: 'food-vocabulary-1', cue: 'A farm bird; also meat from this bird.' },
  { text: 'cake', group: 'food-vocabulary-1', cue: 'A sweet baked food often eaten at celebrations.' },
  { text: 'chocolate', group: 'food-vocabulary-1', cue: 'A sweet brown food made from cocoa.' },
  { text: 'bread', group: 'food-vocabulary-1', cue: 'A baked food used for toast and sandwiches.' },
  { text: 'lemonade', group: 'food-vocabulary-1', cue: 'A sweet lemon drink.' },
  { text: 'water', group: 'food-vocabulary-1', cue: 'A clear drink with no colour.' },
  { text: 'mango', group: 'food-vocabulary-1', cue: 'A sweet tropical fruit with orange flesh.' },
  { text: 'salad', group: 'food-vocabulary-1', cue: 'A cold dish made with vegetables or fruit.' },

  { text: 'fruit', group: 'food-vocabulary-2', cue: 'Food such as apples, oranges and grapes.' },
  { text: 'apple', group: 'food-vocabulary-2', cue: 'A round fruit that can be red or green.' },
  { text: 'grapes', group: 'food-vocabulary-2', cue: 'Small round fruits that grow in bunches.' },
  { text: 'orange', group: 'food-vocabulary-2', cue: 'A round citrus fruit; also a colour.' },
  { text: 'juice', group: 'food-vocabulary-2', cue: 'A drink made from fruit or vegetables.' },
  { text: 'meatballs', group: 'food-vocabulary-2', cue: 'Small round balls made from meat.', difficulty: 2 },
  { text: 'beans', group: 'food-vocabulary-2', cue: 'Small seeds eaten as food.' },
  { text: 'meat', group: 'food-vocabulary-2', cue: 'Food that comes from animals.' },
  { text: 'sausage', group: 'food-vocabulary-2', cue: 'Meat shaped like a short tube.' },

  { text: 'recipe', group: 'making-a-recipe', cue: 'Instructions that explain how to make food.' },
  { text: 'meat', group: 'making-a-recipe', cue: 'Food that comes from animals.' },
  { text: 'pasta', group: 'making-a-recipe', cue: 'Italian food made from flour, such as spaghetti.' },
  { text: 'onions', group: 'making-a-recipe', cue: 'Round vegetables with many layers.' },
  { text: 'potatoes', group: 'making-a-recipe', cue: 'Vegetables used to make chips and crisps.', difficulty: 2 },
  { text: 'cheese', group: 'making-a-recipe', cue: 'Food made from milk.' },
  { text: 'tomatoes', group: 'making-a-recipe', cue: 'Soft red fruits often used in salads and sauces.', difficulty: 2 },
  { text: 'carrots', group: 'making-a-recipe', cue: 'Long orange vegetables.' },
  { text: 'rice', group: 'making-a-recipe', cue: 'Small white or brown grains cooked as food.' },
  { text: 'need', group: 'making-a-recipe', cue: 'Must have something because it is necessary.' },
  { text: 'mix', group: 'making-a-recipe', cue: 'Combine ingredients together.' },
  { text: 'cut', group: 'making-a-recipe', cue: 'Divide food using something sharp.' },
  { text: 'put', group: 'making-a-recipe', cue: 'Move something into a particular place.' },
  { text: 'fold', group: 'making-a-recipe', cue: 'Bend one part over another part.' },

  { text: 'go on a picnic', group: 'food-literature', cue: 'Take food outside and eat it together.' },
  { text: 'in the woods', group: 'food-literature', cue: 'A place phrase: among many trees.' },
  { text: 'take', group: 'food-literature', cue: 'Carry or move something with you.' },
  { text: 'watermelon', group: 'food-literature', cue: 'A very large fruit, green outside and red inside.', difficulty: 2 },
  { text: 'crumbs', group: 'food-literature', cue: 'Very small pieces that fall from bread or cake.' },
]

function commonErrors(text: string) {
  const letters = [...text]
  if (letters.length < 3) return [[...letters].reverse().join(''), letters[0]!]
  const editable = letters.map((letter, index) => /[a-z]/i.test(letter) ? index : -1).filter((index) => index > 0 && index < letters.length - 1)
  const middle = editable[Math.floor(editable.length / 2)] ?? 1
  const omitted = letters.filter((_, index) => index !== middle).join('')
  const swapAt = editable.find((index) => /[a-z]/i.test(letters[index + 1] ?? '')) ?? middle
  const swapped = [...letters]
  ;[swapped[swapAt], swapped[swapAt + 1]] = [swapped[swapAt + 1]!, swapped[swapAt]!]
  return [...new Set([omitted, swapped.join('')])].filter((value) => value !== text)
}

export const unit4LexicalItems: LexicalItem[] = seeds.map((seed, index) => ({
  id: `u4-${seed.group}-${index + 1}`, unitId: 'unit-4', kind: seed.text.includes(' ') ? 'phrase' : 'word', text: seed.text,
  category: 'other', acceptedAnswers: [seed.text], commonErrors: commonErrors(seed.text), allowedTaskTypes: wordTasks,
  cue: { type: 'situation', value: seed.cue, label: seed.cue }, difficulty: seed.difficulty ?? 1,
  tags: ['unit-4', seed.group], enabled: true,
}))

const foods = ['a banana', 'a burger', 'some chicken', 'some cake', 'some bread', 'some water', 'some salad', 'an apple', 'some grapes', 'some juice']

function phrasePoint(id: string, title: string, pattern: string): GrammarPoint {
  const examples = foods.map((food, index) => ({ id: `${id}-ex-${index + 1}`, text: pattern.replace('{food}', food) }))
  const isRequest = id === 'G-4-01'
  return {
    id, unitId: 'unit-4', title, learningGoal: isRequest ? 'Ask politely for food or drink.' : 'Offer food or drink politely.',
    canonicalPatterns: [pattern], slots: [{ id: 'food', values: foods }], examplePool: examples,
    commonErrors: examples.slice(0, 8).map((example) => ({
      value: isRequest ? example.text.replace(', please', ' please').replace('Can I have', 'Can I has') : example.text.replace('Would you like', 'Would you likes').replace('?', '.'),
      correction: example.text, feedback: isRequest ? 'Check have, the comma and the question mark.' : 'Check like and the question mark.',
    })),
    distractorPool: isRequest ? ['Can I has cake please?', 'I can have cake?', 'Can have I cake?'] : ['Would you likes juice.', 'You would like juice?', 'Would like you juice?'],
    exerciseBlueprints: sentenceTasks.map((taskType) => ({ id: `${id}-bp-${taskType}`, grammarId: id, taskType, promptPattern: pattern, answerPattern: pattern, difficulty: taskType === 'punctuation' ? 3 : 2, hintStrategy: taskType === 'sentence-build' ? 'words' : taskType === 'punctuation' ? 'punctuation' : 'letters', enabled: true })),
    allowedTaskTypes: sentenceTasks, difficulty: 2, tags: ['unit-4', 'food-vocabulary-2'], enabled: true,
  }
}

export const unit4GrammarPoints: GrammarPoint[] = [
  phrasePoint('G-4-01', 'Polite request', 'Can I have {food}, please?'),
  phrasePoint('G-4-02', 'Offering food', 'Would you like {food}?'),
]

export const unit4: CourseUnit = {
  id: 'unit-4', order: 4, title: 'Unit 4', status: 'active', vocabularyIds: unit4LexicalItems.map((item) => item.id), phraseIds: [], grammarIds: unit4GrammarPoints.map((item) => item.id),
}
