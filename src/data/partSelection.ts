import { normalisePartSelection } from '../domain/parts'
import type { UnitId, UnitPart } from '../domain/types'

const key = (unitId: UnitId) => `word-code:parts:${unitId}`

export function loadPartSelection(unitId: UnitId, parts: readonly UnitPart[]) {
  try {
    const stored = JSON.parse(localStorage.getItem(key(unitId)) ?? '[]') as unknown
    return normalisePartSelection(Array.isArray(stored) ? stored.filter((value): value is string => typeof value === 'string') : [], parts)
  } catch {
    return parts.map((part) => part.id)
  }
}

export function savePartSelection(unitId: UnitId, partIds: readonly string[], parts: readonly UnitPart[]) {
  const valid = normalisePartSelection(partIds, parts)
  localStorage.setItem(key(unitId), JSON.stringify(valid))
  return valid
}
