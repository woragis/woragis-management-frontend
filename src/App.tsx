import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Layout } from './components/Layout'
import { useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { MediaPage } from './pages/MediaPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { ProjectNewPage } from './pages/ProjectNewPage'
import { ProjectsPage } from './pages/ProjectsPage'

function Protected({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<ProjectNewPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  )
}
