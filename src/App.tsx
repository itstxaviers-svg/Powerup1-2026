import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { ArchivePage } from './pages/ArchivePage'
import { HomePage } from './pages/HomePage'
import { SessionCompletePage } from './pages/SessionCompletePage'
import { SettingsPage } from './pages/SettingsPage'
import { TeacherPage } from './pages/TeacherPage'
import { TeacherCoursePage } from './pages/TeacherCoursePage'
import { TrainingPage } from './pages/TrainingPage'
import { UnitPage } from './pages/UnitPage'
import { RewardsPage } from './pages/RewardsPage'
import { AccountPage } from './pages/AccountPage'
import { AuthPage } from './pages/AuthPage'
import { appRole } from './config/appRole'
import { requiresLogin } from './config/appRole'
import { TeacherAuthPage } from './pages/TeacherAuthPage'
import { getCloudSession } from './data/cloudSession'
import type { ReactNode } from 'react'
import { cloudSyncEnabled } from './data/cloudSync'
import { BattlePage } from './pages/BattlePage'

function ProtectedTeacherPage() {
  const session = getCloudSession()
  return session?.role === 'teacher' ? <Shell><TeacherPage /></Shell> : <Navigate to="/teacher/login" replace />
}

function ProtectedTeacherCoursePage() {
  const session = getCloudSession()
  return session?.role === 'teacher' ? <Shell><TeacherCoursePage /></Shell> : <Navigate to="/teacher/login" replace />
}

function ProtectedStudentPage({ children }: { children: ReactNode }) {
  if (!requiresLogin) return children
  const legacySession = localStorage.getItem('word-code:session') ?? sessionStorage.getItem('word-code:session')
  const cloudSession = getCloudSession()
  const signedIn = cloudSyncEnabled ? cloudSession?.role === 'student' : Boolean(legacySession)
  return signedIn ? children : <Navigate to="/login" replace />
}

export default function App() {
  if (appRole === 'teacher') return <HashRouter><Routes><Route path="/teacher/login" element={<TeacherAuthPage />} /><Route path="*" element={<ProtectedTeacherPage />} /></Routes></HashRouter>
  return <HashRouter><Routes>
    <Route path="/train/:unitId/:parts/:category" element={<ProtectedStudentPage><TrainingPage /></ProtectedStudentPage>} />
    <Route path="/train/:unitId/:parts/:category/:taskType" element={<ProtectedStudentPage><TrainingPage /></ProtectedStudentPage>} />
    <Route path="/battle/:fightId" element={<ProtectedStudentPage><BattlePage /></ProtectedStudentPage>} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route path="/teacher/login" element={<TeacherAuthPage />} />
    <Route path="/teacher" element={<ProtectedTeacherPage />} />
    <Route path="/teacher/course" element={<ProtectedTeacherCoursePage />} />
    <Route path="*" element={<ProtectedStudentPage><Shell><Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/unit/:unitId" element={<UnitPage />} />
      <Route path="/rewards" element={<RewardsPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/archive" element={<ArchivePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/session-complete" element={<SessionCompletePage />} />
    </Routes></Shell></ProtectedStudentPage>} />
  </Routes></HashRouter>
}
