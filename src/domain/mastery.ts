import { taskTypes, type TaskType } from './types'

export function currentTaskTypes(values: readonly unknown[]) {
  return [...new Set(values.filter((value): value is TaskType => typeof value === 'string' && taskTypes.includes(value as TaskType)))]
}

export function hasMasteryVariety(values: readonly unknown[]) {
  const types = currentTaskTypes(values)
  const hasIndependentRecall = types.includes('memory') || types.includes('audio')
  const hasMediumRecall = types.includes('unscramble') || types.includes('error-hunt')
  return types.length >= 3 && hasIndependentRecall && hasMediumRecall
}
