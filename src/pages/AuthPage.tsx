import { ArrowRight, CheckCircle2, Gem, KeyRound, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { rewardsAssets, type SpiritAssetKey } from '../config/rewardsAssets'
import { getStudentProfile, saveStudentPin, saveStudentProfile, verifyStudentPin } from '../data/db'
import type { StudentProfile } from '../domain/account'
import { cloudSyncEnabled, loginStudentCloud, registerStudentCloud } from '../data/cloudSync'
import { saveCloudSession } from '../data/cloudSession'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [wordcodeId, setWordcodeId] = useState('')
  const avatar: SpiritAssetKey = 'spark'
  const [pin, setPin] = useState('')
  const [repeatPin, setRepeatPin] = useState('')
  const [remember, setRemember] = useState(true)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const messageRef = useRef<HTMLDivElement>(null)
  const cleanPin = (value: string) => value.replace(/\D/g, '').slice(0, 6)

  useEffect(() => {
    if (message) messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [message])

  const register = async () => {
    if (!name.trim()) { setMessage('Enter your name.'); return }
    if (!joinCode.trim()) { setMessage('Enter the group code from your teacher.'); return }
    if (!/^\d{6}$/.test(pin) || pin !== repeatPin) { setMessage('Create two matching 6-digit PINs.'); return }
    if (cloudSyncEnabled) {
      setBusy(true); setMessage('')
      try {
        const result = await registerStudentCloud({ displayName: name.trim().slice(0, 24), joinCode: joinCode.trim().toUpperCase(), avatar, pin })
        saveCloudSession(result.session, true)
        await saveStudentProfile(result.profile)
        await saveStudentPin(pin)
        localStorage.setItem('word-code:session', result.profile.studentId)
        navigate('/account')
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Registration failed.') }
      finally { setBusy(false) }
      return
    }
    if (joinCode.trim().toUpperCase() !== 'PU1-DEMO') { setMessage('Group not found. Check the group code with your teacher.'); return }
    const stem = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7) || 'CODE'
    const generatedId = `${stem}-${String(Math.floor(100 + Math.random() * 900))}`
    const profile: StudentProfile = { id: 'current', studentId: crypto.randomUUID(), wordcodeId: generatedId, displayName: name.trim().slice(0, 24), groupId: 'local-demo-group', groupDisplayName: 'Power Up 1 — Local', joinCode: 'PU1-DEMO', avatar, createdAt: new Date().toISOString() }
    await saveStudentProfile(profile); await saveStudentPin(pin); localStorage.setItem('word-code:session', profile.studentId); navigate('/account')
  }
  const login = async () => {
    if (cloudSyncEnabled && navigator.onLine) {
      setBusy(true); setMessage('')
      try {
        const result = await loginStudentCloud(wordcodeId.trim().toUpperCase(), pin, remember)
        await saveStudentProfile(result.profile)
        await saveStudentPin(pin)
        if (remember) localStorage.setItem('word-code:session', result.profile.studentId)
        else sessionStorage.setItem('word-code:session', result.profile.studentId)
        navigate('/')
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Login failed.') }
      finally { setBusy(false) }
      return
    }
    const profile = await getStudentProfile()
    if (profile.wordcodeId.toUpperCase() !== wordcodeId.trim().toUpperCase() || !await verifyStudentPin(pin)) { setMessage('ID or PIN is not correct.'); return }
    if (remember) localStorage.setItem('word-code:session', profile.studentId)
    else sessionStorage.setItem('word-code:session', profile.studentId)
    navigate('/')
  }

  return <div className="auth-page">
    <section className="auth-visual"><Link to="/" className="auth-brand"><Gem /> WORD<span>//</span>CODE</Link><img src={rewardsAssets.spirit[avatar]} alt="Code Spirit" /><h1>{mode === 'register' ? 'Create your Code Spirit.' : 'Welcome back.'}</h1><p>{mode === 'register' ? 'Join your group, choose an avatar and start restoring the world.' : 'Your worlds, crystals and learning progress are ready.'}</p></section>
    <section className="auth-form"><p className="kicker">{mode === 'register' ? 'NEW EXPLORER' : 'STUDENT LOGIN'}</p><h2>{mode === 'register' ? 'Create account' : 'Enter WORD//CODE'}</h2>
      {message && <div ref={messageRef} className="auth-message" role="alert"><ShieldCheck />{message}</div>}
      {mode === 'register' ? <>
        <label>Your name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Sasha" autoComplete="nickname" /></label>
        <label>Your group<input value={joinCode} onChange={(event) => setJoinCode(event.target.value)} placeholder={cloudSyncEnabled ? 'Enter group code' : 'PU1-DEMO'} autoCapitalize="characters" /><small>{cloudSyncEnabled ? 'Enter the Join Code exactly as your teacher gave it to you.' : 'Enter the Join Code exactly as your teacher gave it to you. Demo code: PU1-DEMO'}</small></label>
        <fieldset className="starter-avatar"><legend>Starter Avatar</legend><div><button type="button" className="selected" aria-label="Spark starter avatar"><img src={rewardsAssets.spirit.spark} alt="Spark" /><CheckCircle2 /></button><p>New Code Spirit forms unlock as you learn and reach new levels.</p></div></fieldset>
        <label>Create your PIN<input value={pin} onChange={(event) => setPin(cleanPin(event.target.value))} inputMode="numeric" type="password" maxLength={6} autoComplete="new-password" placeholder="••••••" /></label>
        <label>Repeat PIN<input value={repeatPin} onChange={(event) => setRepeatPin(cleanPin(event.target.value))} inputMode="numeric" type="password" maxLength={6} autoComplete="new-password" placeholder="••••••" /></label>
        <button type="button" className="auth-submit" onClick={() => void register()} disabled={busy}>{busy ? 'Creating… Please wait' : 'Create my ID'} <ArrowRight /></button><p className="auth-switch">Already registered? <Link to="/login">Student login</Link></p>
      </> : <>
        <label>WORD//CODE ID<input value={wordcodeId} onChange={(event) => setWordcodeId(event.target.value)} placeholder="SASHA-482" autoCapitalize="characters" /></label>
        <label>PIN<input value={pin} onChange={(event) => setPin(cleanPin(event.target.value))} inputMode="numeric" type="password" maxLength={6} autoComplete="current-password" placeholder="••••••" /></label>
        <label className="remember-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me</label>
        <button type="button" className="auth-submit" onClick={() => void login()} disabled={busy}>{busy ? 'Connecting…' : 'Enter'} <ArrowRight /></button><div className="forgot-pin"><KeyRound /><span><strong>Forgot your PIN?</strong> Ask your teacher to reset it.</span></div><p className="auth-switch">New explorer? <Link to="/register">Create account</Link></p>
      </>}
    </section>
  </div>
}
