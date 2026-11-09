import { Check, Copy, Download, Edit3, HardDrive, LockKeyhole, Mail, Share2, ShieldCheck, Upload, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { rewardsAssets, type SpiritAssetKey } from '../config/rewardsAssets'
import { getRewardState, getStudentProfile, saveStudentProfile } from '../data/db'
import {
  createJsonFile, createProgressBackup, createTeacherReport, loadSharingPreferences, restoreProgressBackup,
  saveSharingPreferences, shareFile, teacherReportText, type SharingPreferences,
} from '../data/localTransfer'
import { defaultStudentProfile, type StudentProfile } from '../domain/account'
import { defaultRewardState, rewardLevel, spiritStages, type RewardState } from '../domain/rewards'

const avatarKeys: SpiritAssetKey[] = ['spark', 'sprite', 'spirit', 'guardian', 'master']
const emailLooksValid = (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export function AccountPage() {
  const importRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<StudentProfile>(defaultStudentProfile)
  const [name, setName] = useState(defaultStudentProfile.displayName)
  const [editingName, setEditingName] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [reward, setReward] = useState<RewardState>(defaultRewardState)
  const [sharing, setSharing] = useState<SharingPreferences>(() => loadSharingPreferences())

  useEffect(() => {
    Promise.all([getStudentProfile(), getRewardState()]).then(([nextProfile, nextReward]) => {
      setProfile(nextProfile); setName(nextProfile.displayName); setReward(nextReward)
    })
  }, [])
  const level = rewardLevel(reward.lifetimeEnergy)
  const unlockedAvatarCount = spiritStages.filter((stage) => level >= stage.minimumLevel).length

  const updateProfile = async (next: StudentProfile) => { setProfile(next); await saveStudentProfile(next) }
  const saveName = async () => {
    const clean = name.trim().slice(0, 24)
    if (!clean) return
    await updateProfile({ ...profile, displayName: clean }); setEditingName(false); setMessage('Display name updated on this device.')
  }
  const saveEmails = () => {
    const next = { ...sharing, studentEmail: sharing.studentEmail.trim(), teacherEmail: sharing.teacherEmail.trim() }
    if (!emailLooksValid(next.studentEmail) || !emailLooksValid(next.teacherEmail)) { setMessage('Check the email address and try again.'); return }
    saveSharingPreferences(next); setSharing(next); setMessage('Email details saved on this device only.')
  }
  const exportBackup = async () => {
    setBusy(true); setMessage('')
    try {
      const date = new Date().toISOString().slice(0, 10)
      const file = createJsonFile(await createProgressBackup(), `word-code-progress-${date}.json`)
      const shared = await shareFile(file, 'WORD//CODE progress backup', 'Move this file to another device and import it from My Account.')
      const next = { ...sharing, lastBackupAt: new Date().toISOString() }
      saveSharingPreferences(next); setSharing(next)
      setMessage(shared ? 'Choose where to send or save the progress file.' : 'Progress backup downloaded. Keep the file somewhere safe.')
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') setMessage('The progress backup could not be created.')
    } finally { setBusy(false) }
  }
  const importBackup = async (file?: File) => {
    if (!file) return
    setBusy(true); setMessage('')
    try {
      const confirmed = window.confirm('Merge this backup with the progress already saved on this device? Existing progress will be kept.')
      if (!confirmed) return
      const restored = await restoreProgressBackup(await file.text())
      setMessage(`${restored.displayName}'s progress was restored. Reloading…`)
      window.setTimeout(() => window.location.reload(), 500)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'The backup could not be opened.') }
    finally { setBusy(false); if (importRef.current) importRef.current.value = '' }
  }
  const sendTeacherReport = async () => {
    setBusy(true); setMessage('')
    try {
      const report = await createTeacherReport()
      const text = teacherReportText(report)
      const safeId = profile.wordcodeId.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      const file = createJsonFile(JSON.stringify(report, null, 2), `word-code-report-${safeId}.json`)
      const shared = await shareFile(file, `${profile.displayName}'s WORD//CODE results`, text)
      if (shared) setMessage('Choose your teacher or email app in the share menu.')
      else if (sharing.teacherEmail) {
        const subject = encodeURIComponent(`WORD//CODE results — ${profile.displayName}`)
        const body = encodeURIComponent(`${text}\n\nThe detailed report file was downloaded by WORD//CODE. Attach it if your teacher imports reports into the dashboard.`)
        window.location.href = `mailto:${encodeURIComponent(sharing.teacherEmail)}?subject=${subject}&body=${body}`
        setMessage('The report was downloaded and an email draft was opened.')
      } else setMessage('The teacher report was downloaded. Add a teacher email to open a ready-to-send message.')
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') setMessage('The teacher report could not be prepared.')
    } finally { setBusy(false) }
  }

  return <div className="page account-page">
    <div className="page-title"><p className="kicker">LOCAL STUDENT PROFILE</p><h1>My Account</h1><p>Your learning progress stays on this device unless you choose to export or share it.</p></div>
    <section className="account-hero">
      <div className="account-avatar"><img src={rewardsAssets.spirit[profile.avatar]} alt={`${profile.avatar} avatar`} /><span><UserRound /></span></div>
      <div><p>CODE EXPLORER</p><h2>{profile.displayName}</h2><span>{profile.wordcodeId}</span></div>
      <Link to="/rewards">View my Code Spirit</Link>
    </section>

    <section className="account-panel"><header><div><p className="kicker">PROFILE</p><h2>Choose your avatar</h2><small>Reach new Code Spirit levels to unlock more forms.</small></div><span>{unlockedAvatarCount} / {avatarKeys.length} UNLOCKED</span></header>
      <div className="avatar-picker">{avatarKeys.map((key) => {
        const stage = spiritStages.find((item) => item.key === key)!
        const unlocked = level >= stage.minimumLevel
        return <button className={`${profile.avatar === key ? 'selected' : ''} ${unlocked ? 'unlocked' : 'locked'}`} disabled={!unlocked} aria-label={unlocked ? `${stage.name} avatar` : `${stage.name} avatar unlocks at level ${stage.minimumLevel}`} key={key} onClick={() => updateProfile({ ...profile, avatar: key })}>
          <img src={rewardsAssets.spirit[key]} alt={stage.name} />
          {unlocked ? profile.avatar === key && <Check /> : <span className="avatar-lock"><LockKeyhole /><small>Level {stage.minimumLevel}</small></span>}
        </button>
      })}</div>
      <div className="account-row"><div><strong>Display name</strong><span>Shown on your personal profile</span></div>{editingName ? <div className="account-inline-edit"><input value={name} maxLength={24} onChange={(event) => setName(event.target.value)} /><button onClick={saveName}>Save</button></div> : <button className="account-value" onClick={() => setEditingName(true)}>{profile.displayName}<Edit3 /></button>}</div>
    </section>

    <section className="account-panel"><header><div><p className="kicker">LOCAL STORAGE</p><h2>Saved on this device</h2><small>No automatic cloud upload and no student login are required.</small></div><HardDrive /></header>
      <div className="local-storage-status"><ShieldCheck /><div><strong>Your progress is private and available offline</strong><span>App updates keep IndexedDB progress, rewards, battles and session history.</span></div></div>
      <div className="email-fields"><label>YOUR EMAIL <input type="email" value={sharing.studentEmail} onChange={(event) => setSharing({ ...sharing, studentEmail: event.target.value })} placeholder="student@example.com" autoComplete="email" /><small>Optional contact label stored only on this device.</small></label><label>TEACHER EMAIL <input type="email" value={sharing.teacherEmail} onChange={(event) => setSharing({ ...sharing, teacherEmail: event.target.value })} placeholder="teacher@example.com" autoComplete="off" /><small>Used only when you press Send results.</small></label><button type="button" onClick={saveEmails}><Mail /> Save email details</button></div>
    </section>

    <section className="account-panel transfer-panel"><header><div><p className="kicker">TRANSFER & REPORTS</p><h2>Move or share progress</h2><small>Use the same safe file-based flow as Focus Tool.</small></div><Share2 /></header>
      <div className="transfer-grid">
        <article><Download /><div><strong>Transfer to another device</strong><span>Create one complete progress file. On the new phone or tablet, open WORD//CODE and import it.</span></div><button type="button" onClick={() => void exportBackup()} disabled={busy}>Export progress</button></article>
        <article><Upload /><div><strong>Restore progress</strong><span>Imported progress is merged. Existing mastery and completed battles are not reset.</span></div><button type="button" onClick={() => importRef.current?.click()} disabled={busy}>Import progress</button><input ref={importRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => void importBackup(event.target.files?.[0])} /></article>
        <article><Mail /><div><strong>Send results to teacher</strong><span>Share a dashboard-ready report through the phone share menu or a prepared email.</span></div><button type="button" onClick={() => void sendTeacherReport()} disabled={busy}>Send results</button></article>
      </div>
      {sharing.lastBackupAt && <p className="backup-date">Last progress file: {new Date(sharing.lastBackupAt).toLocaleDateString('en-GB')}</p>}
      {message && <div className="account-message" role="status">{message}</div>}
    </section>

    <section className="account-panel"><header><div><p className="kicker">PROFILE DETAILS</p><h2>Local identifiers</h2></div><ShieldCheck /></header>
      <div className="account-row locked"><div><strong>WORD//CODE ID</strong><span>Included in backups and teacher reports</span></div><button onClick={() => navigator.clipboard?.writeText(profile.wordcodeId)}>{profile.wordcodeId}<Copy /></button><i><LockKeyhole /> Local</i></div>
      <div className="account-row locked"><div><strong>Group label</strong><span>Kept for compatibility with existing progress</span></div><b>{profile.groupDisplayName}<small>{profile.joinCode}</small></b><i><LockKeyhole /> Local</i></div>
    </section>
  </div>
}
