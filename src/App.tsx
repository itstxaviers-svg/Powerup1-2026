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
import { appRole } from './config/appRole'
import { BattlePage } from './pages/BattlePage'

function TeacherDashboard() { return <Shell><TeacherPage /></Shell> }
function TeacherCourse() { return <Shell><TeacherCoursePage /></Shell> }

export default function App() {
  if (appRole === 'teacher') return <HashRouter><Routes><Route path="/teacher/course" element={<TeacherCourse />} /><Route path="*" element={<TeacherDashboard />} /></Routes></HashRouter>
  return <HashRouter><Routes>
    <Route path="/train/:unitId/:parts/:category" element={<TrainingPage />} />
    <Route path="/train/:unitId/:parts/:category/:taskType" element={<TrainingPage />} />
    <Route path="/battle/:fightId" element={<BattlePage />} />
    <Route path="/login" element={<Navigate to="/" replace />} />
    <Route path="/register" element={<Navigate to="/account" replace />} />
    <Route path="/teacher/login" element={<Navigate to="/teacher" replace />} />
    <Route path="/teacher" element={<TeacherDashboard />} />
    <Route path="/teacher/course" element={<TeacherCourse />} />
    <Route path="*" element={<Shell><Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/unit/:unitId" element={<UnitPage />} />
      <Route path="/rewards" element={<RewardsPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/archive" element={<ArchivePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/session-complete" element={<SessionCompletePage />} />
    </Routes></Shell>} />
  </Routes></HashRouter>
}
