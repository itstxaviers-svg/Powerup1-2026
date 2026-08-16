import { z } from 'zod'

const taskType = z.enum(['memory', 'repair', 'unscramble', 'error-hunt', 'audio', 'final-decode', 'sentence-build', 'dialogue-gap', 'punctuation'])
const unitId = z.string().regex(/^(hello|unit-[1-9]|custom-[a-z0-9-]+)$/)
const unit = z.object({ id: unitId, order: z.number().int().nonnegative(), title: z.string().min(1), status: z.enum(['active', 'coming-soon', 'hidden']), vocabularyIds: z.array(z.string()), phraseIds: z.array(z.string()), grammarIds: z.array(z.string()) })
const lexical = z.object({ id: z.string().min(1), unitId, kind: z.enum(['word', 'phrase']), text: z.string().min(1), category: z.enum(['number', 'colour', 'greeting', 'question', 'answer', 'introduction', 'other']), acceptedAnswers: z.array(z.string()).min(1), acceptedVariants: z.array(z.object({ value: z.string(), note: z.string(), grantsFullCourseMastery: z.boolean() })).optional(), commonErrors: z.array(z.string()), allowedTaskTypes: z.array(taskType).min(1), cue: z.object({ type: z.enum(['colour', 'number', 'icon', 'situation', 'image']), value: z.string(), label: z.string().optional() }).optional(), difficulty: z.number().int().min(1).max(5), tags: z.array(z.string()), enabled: z.boolean() })

export const contentPackSchema = z.object({
  schemaVersion: z.literal(1), name: z.string().min(1), createdAt: z.iso.datetime(), units: z.array(unit), lexicalItems: z.array(lexical), grammarPoints: z.array(z.unknown()),
})

export type ContentPackInput = z.input<typeof contentPackSchema>
