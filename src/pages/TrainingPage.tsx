import { ArrowLeft, ArrowRight, Check, Eye, Lightbulb, RotateCcw, Volume2 } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { lexicalItems } from '../content/course'
import { Cue } from '../components/Cue'
import { completeTrainingSession, getProgress, getRecentSignatures, recordAttempt, rememberSignature } from '../data/db'
import { loadSettings } from '../data/settings'
import { checkAnswer } from '../domain/checkAnswer'
import { generateRemediation, generateSession } from '../domain/generator'
import type { AttemptResult, Task, UnitId } from '../domain/types'

const taskTypes = ['memory', 'repair', 'unscramble', 'error-hunt', 'audio', 'final-decode', 'sentence-build', 'dialogue-gap', 'punctuation'] as const

function speak(value: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(value)
  utterance.lang = 'en-GB'; utterance.rate = .82
  window.speechSynthesis.speak(utterance)
}

function ProgressDots({ count, current }: { count: number; current: number }) {
  return <div className="progress-dots" aria-label={`Challenge ${current + 1} of ${count}`}>{Array.from({ length: count }, (_, index) => <i key={index} className={index < current ? 'done' : index === current ? 'current' : ''} />)}</div>
}

export function TrainingPage() {
  const { unitId = 'hello', group = 'all', category = 'mixed', taskType } = useParams()
  const navigate = useNavigate()
  const settings = useMemo(loadSettings, [])
  const [tasks, setTasks] = useState<Task[]>([])
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<AttemptResult | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [showExposure, setShowExposure] = useState(true)
  const [correctCount, setCorrectCount] = useState(0)
  const [usedTiles, setUsedTiles] = useState<number[]>([])
  const [energyEarned, setEnergyEarned] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const reduceMotion = useReducedMotion()
  const task = tasks[index]

  useEffect(() => {
    const availableTypes = taskTypes.filter((type) => type !== 'audio' || (settings.audioEnabled && 'speechSynthesis' in window))
    const selectedType = taskTypes.find((type) => type === taskType)
    const allowedTypes = selectedType && availableTypes.includes(selectedType) ? [selectedType] : [...availableTypes]
    Promise.all([getProgress(), getRecentSignatures()]).then(([progress, recentSignatures]) => setTasks(generateSession({ length: settings.sessionLength, progress, recentSignatures, allowedTypes, category: category as 'words' | 'phrases' | 'mixed', unitId: unitId as UnitId, groupId: group, seed: `${Date.now()}` })))
  }, [category, group, settings.audioEnabled, settings.sessionLength, taskType, unitId])
  useEffect(() => {
    setInput(''); setResult(null); setAttempts(0); setRevealed(false); setShowExposure(true); setUsedTiles([])
    if (!task) return
    rememberSignature(task.signature)
    if (task.type === 'memory') { const timer = window.setTimeout(() => { setShowExposure(false); inputRef.current?.focus() }, settings.memoryDuration); return () => window.clearTimeout(timer) }
    setShowExposure(false)
  }, [task, settings.memoryDuration])

  if (!task) return <div className="page training-page"><div className="loading-card">Calibrating signals…</div></div>

  const isExposure = task.type === 'memory' && showExposure
  const canSpeak = settings.audioEnabled && 'speechSynthesis' in window
  const submit = () => {
    if (!input.trim()) return
    const lexical = lexicalItems.find((item) => item.id === task.targetId)
    const checked = checkAnswer(task, input, lexical)
    setResult(checked); setAttempts((value) => value + 1); setEnergyEarned((value) => value + (checked.correct ? attempts === 0 && checked.courseMastery ? 14 : 9 : 3))
    if (checked.correct) { setCorrectCount((value) => value + 1); recordAttempt(task.targetId, task.type, true, attempts === 0 && checked.courseMastery) }
    else {
      recordAttempt(task.targetId, task.type, false, false)
      if (attempts === 0) {
        const remediation = generateRemediation(task.targetId, task.type, Date.now())
        if (remediation) setTasks((current) => {
          if (current.slice(index + 1).some((item) => item.targetId === task.targetId)) return current
          const insertAt = Math.min(current.length, index + 4)
          return [...current.slice(0, insertAt), remediation, ...current.slice(insertAt)]
        })
      }
    }
  }
  const next = async () => {
    if (index + 1 >= tasks.length) { await completeTrainingSession({ unitId: unitId as UnitId, challengeCount: tasks.length, correctCount, energyEarned }); navigate('/session-complete', { state: { total: tasks.length, correct: correctCount, unitId, energyEarned } }) }
    else setIndex((value) => value + 1)
  }
  const hint = () => { setAttempts((value) => value + 1); setRevealed(true); setResult({ correct: false, courseMastery: false, feedback: `Signal hint: ${task.answer.split('').map((char, i) => i % 2 ? '_' : char).join(' ')}` }) }
  const addTile = (tile: string, tileIndex: number) => {
    if (result?.correct || usedTiles.includes(tileIndex)) return
    setUsedTiles((value) => [...value, tileIndex])
    setInput((value) => {
      if (task.targetKind === 'lexical') return `${value}${tile}`
      if (/^[,.!?]$/.test(tile)) return `${value.trimEnd()}${tile}`
      return value ? `${value} ${tile}` : tile
    })
    inputRef.current?.focus()
  }

  return <div className="training-page">
    <header className="training-head"><Link to={`/unit/${unitId}`} aria-label="Exit training"><ArrowLeft /></Link><ProgressDots count={tasks.length} current={index} /><span>{index + 1}<small>/{tasks.length}</small></span></header>
    <main className="challenge-wrap">
      <AnimatePresence mode="wait">
        <motion.section key={task.id} className={`challenge-card mode-${task.type}`} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <div className="challenge-meta"><span>{task.label}</span><span>CODE {String(index + 1).padStart(2, '0')}</span></div>
          {isExposure ? <div className="exposure"><p>LOCK THIS CODE IN MEMORY</p><motion.strong initial={{ opacity: .2 }} animate={{ opacity: 1 }}>{task.answer}</motion.strong><div className="scan-line" /><small>The signal will fade…</small></div> : <>
            <h1>{task.instruction}</h1>
            {(task.type === 'final-decode') && <Cue cue={task.cue} />}
            {task.type === 'audio' && <button className="audio-button" onClick={() => speak(task.answer)} disabled={!canSpeak}><Volume2 /> Play code <small>REPLAY FREE</small></button>}
            {task.prompt && <div className={task.prompt.includes('\n') ? 'dialogue-prompt' : 'text-prompt'}>{task.prompt.split('\n').map((line) => <span key={line}>{line}</span>)}</div>}
            {task.tiles && <div className="tile-workspace"><div className="tile-result" aria-live="polite">{input || <span>Build the code here</span>}</div><div className="tiles" aria-label="Letter or word tiles">{task.tiles.map((tile, tileIndex) => <button key={`${tile}-${tileIndex}`} className={usedTiles.includes(tileIndex) ? 'used' : ''} disabled={usedTiles.includes(tileIndex)} onClick={() => addTile(tile, tileIndex)}>{tile}</button>)}</div></div>}
            <form onSubmit={(event) => { event.preventDefault(); result?.correct ? next() : submit() }}>
              <label htmlFor="decode-input">YOUR DECODE</label>
              <div className={`answer-row ${result ? result.correct ? 'correct' : 'incorrect' : ''}`}>
                <input ref={inputRef} id="decode-input" value={input} onFocus={(event) => window.setTimeout(() => event.currentTarget.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' }), 250)} onChange={(event) => { setInput(event.target.value); setUsedTiles([]); if (result && !result.correct) setResult(null) }} placeholder={task.tiles ? 'Or type your answer…' : 'Type here…'} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} disabled={result?.correct} />
                {input && !result?.correct && <button type="button" className="clear-input" onClick={() => { setInput(''); setUsedTiles([]) }} aria-label="Clear answer">×</button>}
                {result?.correct && <Check aria-hidden="true" />}
              </div>
              <AnimatePresence>{result && <motion.div className={`feedback ${result.correct ? 'success' : 'support'}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} role="status">
                <span>{result.correct ? <Check /> : <Lightbulb />}</span><div><strong>{result.correct ? 'CODE STABLE' : 'KEEP DECODING'}</strong><p>{result.feedback}</p></div>
              </motion.div>}</AnimatePresence>
              {result?.correct ? <button className="primary-button" type="button" onClick={next}>Next code <ArrowRight /></button> : <button className="primary-button" type="submit" disabled={!input.trim()}>Check code <ArrowRight /></button>}
            </form>
            {!result?.correct && <div className="challenge-tools"><button onClick={hint}><Lightbulb /> Hint</button>{attempts > 1 && <button onClick={() => { setInput(task.answer); setUsedTiles([]); setRevealed(true) }}><Eye /> Reveal</button>}<button onClick={() => { setInput(''); setUsedTiles([]) }}><RotateCcw /> Reset</button></div>}
            {revealed && <p className="support-note">Support used — this code will return later.</p>}
          </>}
        </motion.section>
      </AnimatePresence>
    </main>
  </div>
}
