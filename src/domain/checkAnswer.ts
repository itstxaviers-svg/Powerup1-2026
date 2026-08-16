import type { AttemptResult, LexicalItem, Task } from './types'

const apostrophes = /[’‘`]/g
const normaliseApostrophes = (value: string) => value.replace(apostrophes, "'")
const normaliseSpaces = (value: string) => value.trim().replace(/\s+/g, ' ')

export function normaliseForContent(value: string) {
  return normaliseSpaces(normaliseApostrophes(value)).replace(/[.!?]+$/, '').toLocaleLowerCase('en-GB')
}

export function checkAnswer(task: Task, input: string, lexicalItem?: LexicalItem): AttemptResult {
  const raw = normaliseSpaces(normaliseApostrophes(input))
  const answer = normaliseSpaces(normaliseApostrophes(task.answer))
  let correct = false

  if (task.validationMode === 'word') {
    correct = raw.toLocaleLowerCase('en-GB') === answer.toLocaleLowerCase('en-GB')
  } else if (task.validationMode === 'content') {
    correct = normaliseForContent(raw) === normaliseForContent(answer)
  } else {
    correct = raw === answer
  }

  if (correct) return { correct: true, courseMastery: true, feedback: 'Code restored.' }

  const variant = lexicalItem?.acceptedVariants?.find(
    (item) => normaliseForContent(item.value) === normaliseForContent(raw),
  )
  if (variant) return { correct: true, courseMastery: variant.grantsFullCourseMastery, note: variant.note, feedback: variant.note }

  const rawLetters = raw.toLocaleLowerCase('en-GB')
  const answerLetters = answer.toLocaleLowerCase('en-GB')
  if (Math.abs(rawLetters.length - answerLetters.length) === 1) {
    return { correct: false, courseMastery: false, feedback: rawLetters.length < answerLetters.length ? 'Almost. One letter is missing.' : 'Almost. Check one extra letter.' }
  }
  if (normaliseForContent(raw) === normaliseForContent(answer)) {
    return { correct: false, courseMastery: false, feedback: 'The words are right. Check capital letters and punctuation.' }
  }
  return { correct: false, courseMastery: false, feedback: task.errorFeedback ?? 'Not stable yet. Check the code and try again.' }
}
