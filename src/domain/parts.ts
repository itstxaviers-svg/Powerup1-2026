import type { UnitPart } from './types'

export function normalisePartSelection(partIds: readonly string[], parts: readonly UnitPart[]) {
  const available = new Set(parts.map((part) => part.id))
  const valid = [...new Set(partIds)].filter((id) => available.has(id))
  return valid.length ? valid : parts.map((part) => part.id)
}

export function parsePartRoute(value: string | undefined, parts: readonly UnitPart[]) {
  if (!value || value === 'all') return parts.map((part) => part.id)
  return normalisePartSelection(value.split(',').filter(Boolean), parts)
}

export function partRoute(partIds: readonly string[], parts: readonly UnitPart[]) {
  const valid = normalisePartSelection(partIds, parts)
  return valid.length === parts.length ? 'all' : valid.join(',')
}
