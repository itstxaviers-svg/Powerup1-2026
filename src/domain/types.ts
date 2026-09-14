export type UnitId = 'hello' | `unit-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`

export const taskTypes = ['repair', 'audio', 'memory', 'unscramble', 'error-hunt'] as const
export type TaskType = typeof taskTypes[number]
export type BattlePromptMode = 'image' | 'audio' | 'either'

export interface UnitPart {
  id: string
  unitId: UnitId
  order: number
  title: string
  description: string
}

export interface CourseUnit {
  id: UnitId
  order: number
  title: string
  status: 'active' | 'coming-soon' | 'hidden'
  parts: UnitPart[]
  vocabularyIds: string[]
  phraseIds: string[]
  grammarIds: string[]
}

export interface CueDefinition {
  type: 'colour' | 'number' | 'icon' | 'situation' | 'image'
  value: string
  label?: string
}

export interface LexicalItem {
  id: string
  unitId: UnitId
  partId: string
  kind: 'word' | 'phrase'
  text: string
  category: 'number' | 'colour' | 'greeting' | 'question' | 'answer' | 'introduction' | 'other'
  acceptedAnswers: string[]
  acceptedVariants?: Array<{ value: string; note: string; grantsFullCourseMastery: boolean }>
  commonErrors: string[]
  allowedTaskTypes: TaskType[]
  cue?: CueDefinition
  audioSrc?: string
  battlePrompt?: BattlePromptMode
  battleImage?: string
  battleAcceptedAnswers?: string[]
  /** Legacy battle metadata retained so existing imported packs remain readable. */
  imageAsset?: string
  imagePromptEligible?: boolean
  difficulty: 1 | 2 | 3 | 4 | 5
  tags: string[]
  enabled: boolean
}

export interface GrammarExample { id: string; text: string; slots?: Record<string, string> }
export interface GrammarErrorExample { value: string; correction: string; feedback: string }
export interface GrammarSlot { id: string; values: string[] }
export interface GrammarExerciseBlueprint {
  id: string
  grammarId: string
  taskType: TaskType
  promptPattern: string
  answerPattern: string
  difficulty: 1 | 2 | 3 | 4 | 5
  hintStrategy: 'letters' | 'words' | 'none'
  enabled: boolean
}

export interface GrammarPoint {
  id: string
  unitId: UnitId
  partId: string
  title: string
  learningGoal: string
  canonicalPatterns: string[]
  slots: GrammarSlot[]
  examplePool: GrammarExample[]
  commonErrors: GrammarErrorExample[]
  distractorPool: string[]
  exerciseBlueprints: GrammarExerciseBlueprint[]
  allowedTaskTypes: TaskType[]
  difficulty: 1 | 2 | 3 | 4 | 5
  tags?: string[]
  enabled: boolean
}

export interface Task {
  id: string
  signature: string
  targetId: string
  targetKind: 'lexical' | 'grammar'
  type: TaskType
  label: string
  instruction: string
  prompt: string
  answer: string
  validationMode: 'word' | 'content' | 'accuracy'
  cue?: CueDefinition
  tiles?: string[]
  tileMode?: 'letters' | 'chunks'
  errorFeedback?: string
  exposureMs?: number
}

export type MasteryState = 'unseen' | 'learning' | 'practising' | 'unstable' | 'stable' | 'mastered'

export interface TargetProgress {
  targetId: string
  mastery: number
  state: MasteryState
  attempts: number
  correct: number
  independentCorrect: number
  taskTypesSeen: TaskType[]
  sessionDays: string[]
  lastSeenAt: string
}

export interface AttemptResult {
  correct: boolean
  courseMastery: boolean
  note?: string
  feedback: string
}

export interface AppSettings {
  sessionLength: number
  memoryDuration: number
  audioEnabled: boolean
  generousHints: boolean
  soundEnabled: boolean
  musicEnabled: boolean
  reducedMotion: boolean
  largeText: boolean
  vibrationEnabled: boolean
}
