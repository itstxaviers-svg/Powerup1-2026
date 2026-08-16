import { grammarPoints as helloGrammarPoints, lexicalItems as helloLexicalItems, units as baseUnits } from './hello'
import type { UnitId } from '../domain/types'
import { unit1, unit1GrammarPoints, unit1Groups, unit1LexicalItems } from './unit1'
import { unit2, unit2Groups, unit2LexicalItems } from './unit2'
import { unit3, unit3Groups, unit3LexicalItems } from './unit3'
import { unit4, unit4GrammarPoints, unit4Groups, unit4LexicalItems } from './unit4'
import { unit5, unit5Groups, unit5LexicalItems } from './unit5'
import { unit6, unit6Groups, unit6LexicalItems } from './unit6'
import { unit7, unit7Groups, unit7LexicalItems } from './unit7'
import { unit8, unit8Groups, unit8LexicalItems } from './unit8'
import { unit9, unit9Groups, unit9LexicalItems } from './unit9'

export const lexicalItems = [...helloLexicalItems, ...unit1LexicalItems, ...unit2LexicalItems, ...unit3LexicalItems, ...unit4LexicalItems, ...unit5LexicalItems, ...unit6LexicalItems, ...unit7LexicalItems, ...unit8LexicalItems, ...unit9LexicalItems]
export const grammarPoints = [...helloGrammarPoints, ...unit1GrammarPoints, ...unit4GrammarPoints]
export const units = baseUnits.map((unit) => unit.id === 'unit-1' ? unit1 : unit.id === 'unit-2' ? unit2 : unit.id === 'unit-3' ? unit3 : unit.id === 'unit-4' ? unit4 : unit.id === 'unit-5' ? unit5 : unit.id === 'unit-6' ? unit6 : unit.id === 'unit-7' ? unit7 : unit.id === 'unit-8' ? unit8 : unit.id === 'unit-9' ? unit9 : unit)

export const learningGroupsByUnit: Partial<Record<UnitId, readonly { id: string; title: string; subtitle: string }[]>> = {
  'unit-1': unit1Groups,
  'unit-2': unit2Groups,
  'unit-3': unit3Groups,
  'unit-4': unit4Groups,
  'unit-5': unit5Groups,
  'unit-6': unit6Groups,
  'unit-7': unit7Groups,
  'unit-8': unit8Groups,
  'unit-9': unit9Groups,
}

export { unit1Groups, unit2Groups, unit3Groups, unit4Groups, unit5Groups, unit6Groups, unit7Groups, unit8Groups, unit9Groups }
