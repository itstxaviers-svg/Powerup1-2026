import { ArrowRight, Gem, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cloudSyncEnabled, loginTeacherCloud } from '../data/cloudSync'

export function TeacherAuthPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const login = async () => {
    if (!cloudSyncEnabled) { setMessage('Teacher cloud access is not configured on this installation.'); return }
    setBusy(true); setMessage('')
    try {
      await loginTeacherCloud(email.trim().toLowerCase(), password, remember)
      navigate('/teacher')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Login failed.') }
    finally { setBusy(false) }
  }

  return <div className="auth-page">
    <section className="auth-visual"><Link to="/" className="auth-brand"><Gem /> WORD<span>//</span>CODE</Link><ShieldCheck size={130} /><h1>Teacher access.</h1><p>See group progress and learning signals in the protected teacher area.</p></section>
    <section className="auth-form"><p className="kicker">TEACHER LOGIN</p><h2>Open dashboard</h2>
      <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="username" /></label>
      <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" /></label>
      <label className="remember-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me</label>
      <button className="auth-submit" onClick={login} disabled={busy}>{busy ? 'Connecting…' : 'Enter teacher mode'} <ArrowRight /></button>
      {message && <div className="auth-message" role="alert"><ShieldCheck />{message}</div>}
      <p className="auth-switch"><Link to="/">Back to student app</Link></p>
    </section>
  </div>
}
