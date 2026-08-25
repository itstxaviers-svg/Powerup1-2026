import { Check, Copy, Edit3, KeyRound, LockKeyhole, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { rewardsAssets, type SpiritAssetKey } from '../config/rewardsAssets'
import { getRewardState, getStudentProfile, saveStudentPin, saveStudentProfile } from '../data/db'
import { defaultStudentProfile, type StudentProfile } from '../domain/account'
import { defaultRewardState, rewardLevel, spiritStages, type RewardState } from '../domain/rewards'
import { changeStudentPinCloud, cloudSyncEnabled } from '../data/cloudSync'
import { clearCloudSession, getCloudSession } from '../data/cloudSession'

const avatarKeys: SpiritAssetKey[] = ['spark', 'sprite', 'spirit', 'guardian', 'master']

export function AccountPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<StudentProfile>(defaultStudentProfile)
  const [name, setName] = useState(defaultStudentProfile.displayName)
  const [editingName, setEditingName] = useState(false)
  const [pin, setPin] = useState('')
  const [repeatPin, setRepeatPin] = useState('')
  const [message, setMessage] = useState('')
  const [reward, setReward] = useState<RewardState>(defaultRewardState)
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
    await updateProfile({ ...profile, displayName: clean }); setEditingName(false); setMessage('Display name updated.')
  }
  const changePin = async () => {
    if (!/^\d{6}$/.test(pin)) { setMessage('PIN must contain exactly 6 digits.'); return }
    if (pin !== repeatPin) { setMessage('PINs do not match.'); return }
    try {
      if (cloudSyncEnabled && getCloudSession()) await changeStudentPinCloud(pin)
      await saveStudentPin(pin); setPin(''); setRepeatPin(''); setMessage('PIN changed safely.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'PIN could not be changed.') }
  }
  const logOut = () => {
    clearCloudSession()
    localStorage.removeItem('word-code:session')
    sessionStorage.removeItem('word-code:session')
    navigate('/login', { replace: true })
  }

  return <div className="page account-page">
    <div className="page-title"><p className="kicker">STUDENT PROFILE</p><h1>My Account</h1><p>Change how your profile looks. Your ID and group always stay protected.</p></div>
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

    <section className="account-panel"><header><div><p className="kicker">ACCOUNT</p><h2>Protected details</h2></div><ShieldCheck /></header>
      <div className="account-row locked"><div><strong>WORD//CODE ID</strong><span>Your permanent login ID</span></div><button onClick={() => navigator.clipboard?.writeText(profile.wordcodeId)}>{profile.wordcodeId}<Copy /></button><i><LockKeyhole /> Locked</i></div>
      <div className="account-row locked"><div><strong>Group</strong><span>Ask your teacher to change your group</span></div><b>{profile.groupDisplayName}<small>{profile.joinCode}</small></b><i><LockKeyhole /> Locked</i></div>
    </section>

    <section className="account-panel pin-panel"><header><div><p className="kicker">SECURITY</p><h2>Change PIN</h2></div><KeyRound /></header>
      <p>Your PIN is converted to a secure hash. The six digits are never saved as readable text.</p>
      <div className="pin-fields"><label>NEW 6-DIGIT PIN<input inputMode="numeric" type="password" maxLength={6} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))} autoComplete="new-password" /></label><label>REPEAT PIN<input inputMode="numeric" type="password" maxLength={6} value={repeatPin} onChange={(event) => setRepeatPin(event.target.value.replace(/\D/g, ''))} autoComplete="new-password" /></label><button onClick={changePin}>Change PIN</button></div>
      {message && <div className="account-message" role="status">{message}</div>}
      <div className="account-auth-links"><Link to="/register">Register another profile</Link><button type="button" className="account-logout" onClick={logOut}><LogOut />Log out</button></div>
    </section>
  </div>
}
