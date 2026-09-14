import { z } from 'zod'

const taskType = z.enum(['repair', 'audio', 'memory', 'unscramble', 'error-hunt'])
const unitId = z.string().regex(/^(hello|unit-[1-9]|custom-[a-z0-9-]+)$/)
const part = z.object({ id: z.string().min(1), unitId, order: z.number().int().positive(), title: z.string().min(1), description: z.string() })
const unit = z.object({ id: unitId, order: z.number().int().nonnegative(), title: z.string().min(1), status: z.enum(['active', 'coming-soon', 'hidden']), parts: z.array(part), vocabularyIds: z.array(z.string()), phraseIds: z.array(z.string()), grammarIds: z.array(z.string()) })
const lexical = z.object({ id: z.string().min(1), unitId, partId: z.string().min(1), kind: z.enum(['word', 'phrase']), text: z.string().min(1), category: z.enum(['number', 'colour', 'greeting', 'question', 'answer', 'introduction', 'other']), acceptedAnswers: z.array(z.string()).min(1), acceptedVariants: z.array(z.object({ value: z.string(), note: z.string(), grantsFullCourseMastery: z.boolean() })).optional(), commonErrors: z.array(z.string()), allowedTaskTypes: z.array(taskType).min(1), cue: z.object({ type: z.enum(['colour', 'number', 'icon', 'situation', 'image']), value: z.string(), label: z.string().optional() }).optional(), audioSrc: z.string().optional(), battlePrompt: z.enum(['image', 'audio', 'either']).optional(), battleImage: z.string().optional(), battleAcceptedAnswers: z.array(z.string().min(1)).optional(), imageAsset: z.string().optional(), imagePromptEligible: z.boolean().optional(), difficulty: z.number().int().min(1).max(5), tags: z.array(z.string()), enabled: z.boolean() })
const blueprint = z.object({ id: z.string().min(1), grammarId: z.string().min(1), taskType, promptPattern: z.string(), answerPattern: z.string(), difficulty: z.number().int().min(1).max(5), hintStrategy: z.enum(['letters', 'words', 'none']), enabled: z.boolean() })
const grammar = z.object({ id: z.string().min(1), unitId, partId: z.string().min(1), title: z.string().min(1), learningGoal: z.string(), canonicalPatterns: z.array(z.string()).min(1), slots: z.array(z.object({ id: z.string().min(1), values: z.array(z.string()) })), examplePool: z.array(z.object({ id: z.string().min(1), text: z.string().min(1), slots: z.record(z.string(), z.string()).optional() })).min(1), commonErrors: z.array(z.object({ value: z.string().min(1), correction: z.string().min(1), feedback: z.string() })), distractorPool: z.array(z.string()), exerciseBlueprints: z.array(blueprint), allowedTaskTypes: z.array(taskType).min(1), difficulty: z.number().int().min(1).max(5), tags: z.array(z.string()).optional(), enabled: z.boolean() })

export const contentPackSchema = z.object({
  schemaVersion: z.literal(1), name: z.string().min(1), createdAt: z.iso.datetime(), units: z.array(unit), lexicalItems: z.array(lexical), grammarPoints: z.array(grammar),
})

export type ContentPackInput = z.input<typeof contentPackSchema>
