import { ArrowRight, CheckCircle2, RadioTower, Sparkles, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { Link, useLocation } from 'react-router-dom'

export function SessionCompletePage() {
  const { state } = useLocation() as { state: { total?: number; correct?: number; unitId?: string; energyEarned?: number } | null }
  const total = state?.total ?? 0; const correct = state?.correct ?? 0
  return <div className="page complete-page"><motion.div className="complete-card" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }}>
    <span className="complete-icon"><Sparkles /></span><p className="kicker">SESSION COMPLETE</p><h1>Signal improved.</h1><p>You restored {correct} of {total} codes in this run.</p>
    <div className="summary-grid"><article><CheckCircle2 /><strong>{correct}</strong><span>codes stabilised</span></article><article><RadioTower /><strong>{Math.round((correct / Math.max(1, total)) * 100)}%</strong><span>decode accuracy</span></article><article><Zap /><strong>+{state?.energyEarned ?? 0}</strong><span>Spirit Energy</span></article></div>
    <Link to={`/unit/${state?.unitId ?? 'hello'}`} className="primary-button">Back to unit <ArrowRight /></Link>
  </motion.div></div>
}
