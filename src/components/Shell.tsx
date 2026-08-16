import { Archive, Gem, Gift, GraduationCap, Home, Settings, Sparkles, UserRound } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'
import { appRole } from '../config/appRole'

const studentLinks = [
  { to: '/', label: 'Course', icon: Home },
  { to: '/archive', label: 'Progress', icon: Archive },
  { to: '/rewards', label: 'Rewards', icon: Gift },
  { to: '/account', label: 'Account', icon: UserRound },
  { to: '/settings', label: 'Settings', icon: Settings },
]
const teacherLinks = [
  { to: '/', label: 'Dashboard', icon: GraduationCap },
  { to: '/groups', label: 'Groups', icon: UserRound },
  { to: '/progress', label: 'Progress', icon: Archive },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Shell({ children }: PropsWithChildren) {
  const links = appRole === 'teacher' ? teacherLinks : studentLinks
  return <div className="app-shell">
    <header className="topbar">
      <NavLink to="/" className="brand" aria-label="WORD CODE home">
        <span className="brand-mark"><Gem size={20} /><i /></span>
        <span className="brand-copy"><strong>WORD<span>//</span>CODE</strong><small>ENGLISH DECODING SYSTEM</small></span>
      </NavLink>
      <span className="signal"><Sparkles size={13} /><i /> SYSTEM ONLINE</span>
    </header>
    <main>{children}</main>
    <nav className="bottom-nav" aria-label="Primary navigation">
      {links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
        <Icon size={20} aria-hidden="true" /><span>{label}</span>
      </NavLink>)}
    </nav>
  </div>
}
