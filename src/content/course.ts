import { grammarPoints as helloGrammarPoints, lexicalItems as helloLexicalItems, units as helloUnits } from './hello'
import { unit1GrammarPoints, unit1Groups, unit1LexicalItems } from './unit1'
import { unit2Groups, unit2LexicalItems } from './unit2'
import { unit3Groups, unit3LexicalItems } from './unit3'
import { unit4GrammarPoints, unit4Groups, unit4LexicalItems } from './unit4'
import { unit5Groups, unit5LexicalItems } from './unit5'
import { unit6Groups, unit6LexicalItems } from './unit6'
import { unit7Groups, unit7LexicalItems } from './unit7'
import { unit8Groups, unit8LexicalItems } from './unit8'
import { unit9Groups, unit9LexicalItems } from './unit9'
import type { CourseUnit, GrammarPoint, LexicalItem, UnitId } from '../domain/types'
import { battleVocabularyImages } from '../features/battle/vocabularyImages'

type LearningGroup = { id: string; title: string; subtitle: string }

function withBattleMetadata(item: LexicalItem): LexicalItem {
  const battleImage = battleVocabularyImages[item.unitId]?.[item.text.toLocaleLowerCase('en-GB')]
  const kind = battleImage ? 'word' : item.kind
  if (item.unitId === 'hello' || kind !== 'word') return { ...item, kind }
  return { ...item, kind, battlePrompt: battleImage ? 'either' : 'audio', battleImage, battleAcceptedAnswers: item.acceptedAnswers }
}

const unitLexical = [unit1LexicalItems, unit2LexicalItems, unit3LexicalItems, unit4LexicalItems, unit5LexicalItems, unit6LexicalItems, unit7LexicalItems, unit8LexicalItems, unit9LexicalItems]
const unitGrammar = [unit1GrammarPoints, [], [], unit4GrammarPoints, [], [], [], [], []] satisfies GrammarPoint[][]
const unitGroups = [unit1Groups, unit2Groups, unit3Groups, unit4Groups, unit5Groups, unit6Groups, unit7Groups, unit8Groups, unit9Groups] satisfies readonly (readonly LearningGroup[])[]

export const lexicalItems = [...helloLexicalItems, ...unitLexical.flat()].map(withBattleMetadata)
export const grammarPoints = [...helloGrammarPoints, ...unitGrammar.flat()]

function buildUnit(index: number): CourseUnit {
  const unitId = `unit-${index + 1}` as UnitId
  const lexical = unitLexical[index] ?? []
  const grammar = unitGrammar[index] ?? []
  return {
    id: unitId,
    order: index + 1,
    title: `Unit ${index + 1}`,
    status: 'active',
    parts: (unitGroups[index] ?? []).map((group, groupIndex) => ({ id: group.id, unitId, order: groupIndex + 1, title: group.title, description: group.subtitle })),
    vocabularyIds: lexical.filter((item) => item.kind === 'word').map((item) => item.id),
    phraseIds: lexical.filter((item) => item.kind === 'phrase').map((item) => item.id),
    grammarIds: grammar.map((item) => item.id),
  }
}

export const units: CourseUnit[] = [helloUnits[0]!, ...Array.from({ length: 9 }, (_, index) => buildUnit(index))]
export const partsByUnit: Partial<Record<UnitId, CourseUnit['parts']>> = Object.fromEntries(units.map((unit) => [unit.id, unit.parts]))

export { unit1Groups, unit2Groups, unit3Groups, unit4Groups, unit5Groups, unit6Groups, unit7Groups, unit8Groups, unit9Groups }
