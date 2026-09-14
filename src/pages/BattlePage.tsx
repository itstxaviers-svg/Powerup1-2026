import { ArrowLeft, Check, Headphones, Image as ImageIcon, RotateCcw, Shield, Swords, Volume2, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { lexicalItems, units } from '../content/course'
import { getBattleProgress, getProgress, saveBattleProgress } from '../data/db'
import { canSpeakEnglish, speakEnglish } from '../domain/speech'
import { BossVisual } from '../features/battle/BossVisual'
import { bosses } from '../features/battle/bosses'
import { getBattleCheckpoint, getBattleFight } from '../features/battle/config'
import { accuracyPassed, buildBattleQuestions, canResolveQuestion, completePurification, ensureCheckpointAllocations, isFightUnlocked, isUnitComplete, recordBattleResult } from '../features/battle/engine'
import type { BattleProgressRecord, BattleQuestion, BossState, QuestionPhase } from '../features/battle/types'

type AnswerRecord = { vocabularyId: string; answer: string; correct: boolean }

function answersMatch(value: string, answers: readonly string[]) {
  const normalised = value.trim().toLocaleLowerCase('en-GB')
  return answers.some((answer) => normalised === answer.trim().toLocaleLowerCase('en-GB'))
}

async function playAudio(question: BattleQuestion) {
  if (!question.audioSrc) return speakEnglish(question.answer)
  return new Promise<boolean>((resolve) => {
    const audio = new Audio(question.audioSrc)
    audio.onended = () => resolve(true)
    audio.onerror = () => { void speakEnglish(question.answer).then(resolve) }
    void audio.play().catch(() => { void speakEnglish(question.answer).then(resolve) })
  })
}

export function BattlePage() {
  const { fightId } = useParams()
  const fight = getBattleFight(fightId)
  const checkpoint = fight ? getBattleCheckpoint(fight.checkpointId) : undefined
  const boss = fight ? bosses[fight.bossId] : undefined
  const prefersReducedMotion = useReducedMotion()
  const [loading, setLoading] = useState(true)
  const [record, setRecord] = useState<BattleProgressRecord>()
  const [unitComplete, setUnitComplete] = useState(false)
  const [phase, setPhase] = useState<'intro' | 'question' | 'feedback' | 'purification' | 'results'>('intro')
  const [questionPhase, setQuestionPhase] = useState<QuestionPhase>('loading')
  const questionPhaseRef = useRef<QuestionPhase>('loading')
  const [questions, setQuestions] = useState<BattleQuestion[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [value, setValue] = useState('')
  const [remaining, setRemaining] = useState(0)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [bossState, setBossState] = useState<BossState>('base')
  const [purificationReady, setPurificationReady] = useState(false)
  const deadlineRef = useRef<number | null>(null)
  const feedbackTimerRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentQuestion = questions[questionIndex]
  const allocation = fight ? record?.allocations[fight.id] ?? [] : []
  const unlocked = Boolean(fight && isFightUnlocked(unitComplete, record, fight))
  const alreadyPassed = Boolean(fight && record?.completedFightIds.includes(fight.id))

  const setGuardedQuestionPhase = useCallback((next: QuestionPhase) => {
    questionPhaseRef.current = next
    setQuestionPhase(next)
  }, [])

  useEffect(() => {
    if (!fight || !checkpoint) { setLoading(false); return }
    Promise.all([getBattleProgress(checkpoint.id), getProgress()]).then(([saved, progress]) => {
      const complete = isUnitComplete(units.find((unit) => unit.id === checkpoint.afterUnit), progress)
      setUnitComplete(complete)
      if (!complete) { setRecord(saved); setLoading(false); return }
      const next = ensureCheckpointAllocations(checkpoint, saved, lexicalItems, checkpoint.id, canSpeakEnglish())
      setRecord(next)
      if (next.pendingPurificationFightId === fight.id) {
        setBossState('defeat')
        setPhase('purification')
      } else if (next.completedFightIds.includes(fight.id)) {
        setBossState('defeat')
        setPhase('results')
      }
      setLoading(false)
      if (next !== saved) void saveBattleProgress(next)
    })
    return () => {
      if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current)
      window.speechSynthesis?.cancel()
    }
  }, [checkpoint, fight])

  useEffect(() => {
    if (phase !== 'purification') { setPurificationReady(false); return }
    const timer = window.setTimeout(() => setPurificationReady(true), prefersReducedMotion ? 100 : 700)
    return () => window.clearTimeout(timer)
  }, [phase, prefersReducedMotion])

  const beginTimer = useCallback(() => {
    if (!fight) return
    deadlineRef.current = performance.now() + fight.timeLimitSeconds * 1000
    setRemaining(fight.timeLimitSeconds)
    setGuardedQuestionPhase('active')
    window.setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' })
    }, 50)
  }, [fight, setGuardedQuestionPhase])

  const presentQuestion = useCallback(async (question: BattleQuestion) => {
    setGuardedQuestionPhase('presenting')
    setBossState('idle')
    setValue('')
    setLastCorrect(null)
    if (question.promptType === 'audio') {
      await playAudio(question)
      beginTimer()
    }
  }, [beginTimer, setGuardedQuestionPhase])

  useEffect(() => {
    if (phase !== 'question' || !currentQuestion) return
    void presentQuestion(currentQuestion)
  }, [currentQuestion, phase, presentQuestion])

  const finishFight = useCallback(async (finalAnswers: AnswerRecord[]) => {
    if (!fight || !record) return
    const correct = finalAnswers.filter((answer) => answer.correct).length
    const incorrectIds = finalAnswers.filter((answer) => !answer.correct).map((answer) => answer.vocabularyId)
    const next = recordBattleResult(record, fight, correct, finalAnswers.length, incorrectIds)
    setRecord(next)
    await saveBattleProgress(next)
    const won = accuracyPassed(correct, finalAnswers.length, fight.requiredAccuracy)
    setGuardedQuestionPhase('resolved')
    setBossState(won ? 'defeat' : 'victory')
    setPhase(won ? 'purification' : 'results')
  }, [fight, record, setGuardedQuestionPhase])

  const resolveAnswer = useCallback((answerValue: string, reason: 'submit' | 'timeout' = 'submit') => {
    if (!fight || !currentQuestion || !canResolveQuestion(questionPhaseRef.current)) return
    setGuardedQuestionPhase('submitted')
    deadlineRef.current = null
    const correct = answersMatch(answerValue, currentQuestion.acceptedAnswers)
    const nextAnswers = [...answers, { vocabularyId: currentQuestion.vocabularyId, answer: currentQuestion.answer, correct }]
    setAnswers(nextAnswers)
    setLastCorrect(correct)
    setBossState(correct ? 'hit' : reason === 'timeout' ? 'heavy-attack' : 'quick-attack')
    setPhase('feedback')
    feedbackTimerRef.current = window.setTimeout(() => {
      if (questionIndex + 1 >= questions.length) {
        void finishFight(nextAnswers)
      } else {
        setGuardedQuestionPhase('transitioning')
        setQuestionIndex((index) => index + 1)
        setPhase('question')
      }
    }, prefersReducedMotion ? 450 : 850)
  }, [answers, currentQuestion, fight, finishFight, prefersReducedMotion, questionIndex, questions.length, setGuardedQuestionPhase])

  useEffect(() => {
    if (questionPhase !== 'active' || deadlineRef.current === null) return
    const tick = window.setInterval(() => {
      if (deadlineRef.current === null) return
      const next = Math.max(0, (deadlineRef.current - performance.now()) / 1000)
      setRemaining(next)
      if (next <= 0) resolveAnswer('', 'timeout')
    }, 80)
    return () => window.clearInterval(tick)
  }, [questionPhase, resolveAnswer])

  const startFight = () => {
    if (!fight || allocation.length === 0) return
    const seed = `${fight.id}:${Date.now()}`
    const incorrect = new Set(record?.lastIncorrectIds[fight.id] ?? [])
    const nextQuestions = buildBattleQuestions(lexicalItems, allocation, seed, canSpeakEnglish()).sort((left, right) => Number(incorrect.has(right.vocabularyId)) - Number(incorrect.has(left.vocabularyId)))
    setQuestions(nextQuestions)
    setAnswers([])
    setQuestionIndex(0)
    setBossState('idle')
    setGuardedQuestionPhase('loading')
    setPhase('question')
  }

  const continueAfterPurification = async () => {
    if (!fight || !record) return
    const next = completePurification(record, fight)
    setRecord(next)
    await saveBattleProgress(next)
    setPhase('results')
  }

  const correctCount = answers.filter((answer) => answer.correct).length
  const resultAccuracy = answers.length ? correctCount / answers.length : fight ? record?.bestAccuracy[fight.id] ?? 0 : 0
  const displayedCorrect = answers.length ? correctCount : Math.round(resultAccuracy * allocation.length)
  const passed = alreadyPassed || Boolean(fight && accuracyPassed(correctCount, answers.length, fight.requiredAccuracy))
  const nextFight = useMemo(() => checkpoint?.fights.find((item) => item.fightIndex === (fight?.fightIndex ?? 0) + 1), [checkpoint, fight])

  if (loading) return <main className="battle-page battle-loading"><span className="battle-loader" /><p>Opening checkpoint…</p></main>
  if (!fight || !checkpoint || !boss) return <main className="battle-page battle-missing"><Shield /><h1>Checkpoint not found</h1><Link to="/">Return to course map</Link></main>

  if (!unlocked) return <main className="battle-page battle-sealed" style={{ '--boss-accent': boss.accent } as React.CSSProperties}>
    <header className="battle-header"><Link to="/" aria-label="Back to course map"><ArrowLeft /></Link><span>{fight.label}</span><b>SEALED</b></header>
    <section className="battle-stage"><BossVisual bossId={fight.bossId} state="idle" reducedMotion={Boolean(prefersReducedMotion)} /><div className="battle-intro-copy"><p>CODE FIGHTER</p><h1>{boss.name}</h1><span>{!unitComplete ? `${units.find((unit) => unit.id === checkpoint.afterUnit)?.title ?? checkpoint.afterUnit} must be stabilised first.` : `${checkpoint.fights.find((item) => item.id === fight.previousFightId)?.label ?? 'The previous fight'} must be won first.`}</span><Link className="battle-secondary" to="/"><ArrowLeft /> BACK TO COURSE MAP</Link></div></section>
  </main>

  if (allocation.length === 0) return <main className="battle-page battle-sealed" style={{ '--boss-accent': boss.accent } as React.CSSProperties}>
    <header className="battle-header"><Link to="/"><ArrowLeft /></Link><span>{fight.label}</span><b>AWAITING WORDS</b></header>
    <section className="battle-stage"><BossVisual bossId={fight.bossId} state="idle" reducedMotion={Boolean(prefersReducedMotion)} /><div className="battle-intro-copy"><p>CHECKPOINT READY</p><h1>{boss.name}</h1><span>This checkpoint activates when its approved Unit words are available. Hello! words are never used here.</span><Link className="battle-secondary" to="/">BACK TO COURSE MAP</Link></div></section>
  </main>

  return <main className={`battle-page phase-${phase}${lastCorrect === false ? ' battle-damaged' : ''}${phase === 'purification' ? ' battle-purified' : ''}`} style={{ '--boss-accent': boss.accent } as React.CSSProperties}>
    <header className="battle-header"><Link to="/" aria-label="Leave battle"><ArrowLeft /></Link><span>{fight.label}</span><b>{alreadyPassed ? 'CODE STABLE' : `${allocation.length} WORDS`}</b></header>
    <div className="battle-progress" aria-label={`Question ${Math.min(questionIndex + 1, questions.length)} of ${questions.length}`}><i style={{ width: `${phase === 'purification' || phase === 'results' ? 100 : questions.length ? (questionIndex / questions.length) * 100 : 0}%` }} /></div>
    <section className="battle-stage">
      <BossVisual bossId={fight.bossId} state={bossState} reducedMotion={Boolean(prefersReducedMotion)} />
      <AnimatePresence mode="wait">
        {phase === 'intro' && <motion.div className="battle-intro-copy" key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <p>CORRUPTED SIGNAL DETECTED</p><h1>{boss.name}</h1><blockquote>“{boss.corruptedLine}”</blockquote><span>Decode every word. Reach {Math.ceil(fight.requiredAccuracy * 100)}% accuracy to stabilise the checkpoint.</span><div className="battle-rules"><em><Headphones /> AUDIO → TYPE</em><em><ImageIcon /> IMAGE → TYPE</em><em><Shield /> {fight.timeLimitSeconds}s EACH</em></div><button className="battle-primary" onClick={startFight}><Swords /> START BATTLE</button><small>No hints. Replays do not stop the timer.</small>
        </motion.div>}
        {(phase === 'question' || phase === 'feedback') && currentQuestion && <motion.div className="battle-question" key={currentQuestion.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <div className={`battle-timer ${remaining <= 2 && questionPhase === 'active' ? 'critical' : ''}`}><span>{questionPhase === 'presenting' ? 'SIGNAL INCOMING' : `${remaining.toFixed(1)}s`}</span><i style={{ width: `${Math.min(100, (remaining / fight.timeLimitSeconds) * 100)}%` }} /></div>
          <div className="battle-prompt">
            {currentQuestion.promptType === 'audio' ? <button type="button" className="battle-audio" disabled={questionPhase === 'presenting'} onClick={() => { void playAudio(currentQuestion) }} aria-label="Replay word audio"><Volume2 /><span>{questionPhase === 'presenting' ? 'LISTEN…' : 'REPLAY SIGNAL'}</span></button> : <img src={currentQuestion.imageSrc} alt="Word clue" onLoad={() => { if (questionPhaseRef.current === 'presenting') beginTimer() }} onError={() => { if (canSpeakEnglish()) { currentQuestion.promptType = 'audio'; void presentQuestion(currentQuestion) } }} />}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); resolveAnswer(value) }}><label htmlFor="battle-answer">TYPE THE CODE</label><input ref={inputRef} id="battle-answer" value={value} onChange={(event) => setValue(event.target.value)} disabled={questionPhase !== 'active'} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} inputMode="text" /><button type="submit" disabled={questionPhase !== 'active' || !value.trim()} aria-label="Submit answer"><Swords /></button></form>
          {phase === 'feedback' && <div className={`battle-feedback ${lastCorrect ? 'correct' : 'wrong'}`} role="status">{lastCorrect ? <><Check /> CODE HIT</> : <><X /> SIGNAL MISSED</>}</div>}
        </motion.div>}
        {phase === 'purification' && <motion.div className="battle-purification" key="purification" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p>RESTORATION COMPLETE</p><h1>{boss.name}</h1>{purificationReady ? <motion.div className="purified-dialogue" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><blockquote>“{boss.thankYouLine}”</blockquote><strong>You restored every code.</strong><button className="battle-primary" onClick={() => { void continueAfterPurification() }}>CONTINUE</button></motion.div> : <span>Corruption signal clearing…</span>}
        </motion.div>}
        {phase === 'results' && <motion.div className={`battle-results ${passed ? 'passed' : 'failed'}`} key="results" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }}>
          <p>{passed ? 'CODE STABILIZED' : 'CODE UNSTABLE'}</p><h1>{displayedCorrect} / {answers.length || allocation.length}</h1><strong>ACCURACY: {Math.round(resultAccuracy * 100)}%</strong><strong>REQUIRED: {Math.ceil(fight.requiredAccuracy * 100)}%</strong><span>{passed ? fight.unlocksCourseCompletion ? 'COURSE COMPLETE · THE WORD//CODE WORLD IS RESTORED' : `${boss.name} has been restored.` : 'Your word set will stay the same. Its order will change.'}</span>
          {!passed && <div className="battle-missed"><small>WORDS TO RESTORE</small>{answers.filter((answer) => !answer.correct).map((answer) => <b key={answer.vocabularyId}>{answer.answer}</b>)}</div>}
          <div className="battle-result-actions">{!passed && <button className="battle-primary" onClick={startFight}><RotateCcw /> RETRY BATTLE</button>}{passed && nextFight && <Link className="battle-primary" to={`/battle/${nextFight.id}`}><Swords /> NEXT FIGHT</Link>}<Link className="battle-secondary" to="/">RESTORED COURSE MAP</Link></div>
        </motion.div>}
      </AnimatePresence>
    </section>
    <div className="battle-vignette" aria-hidden="true" />
  </main>
}
