import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ApplicationsProvider } from './context/ApplicationsContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { isSupabaseConfigured } from './lib/supabase'
import { ApplicationDetailPage } from './pages/ApplicationDetailPage'
import { EditApplicationPage, NewApplicationPage } from './pages/ApplicationFormPages'
import { ApplicationsPage } from './pages/ApplicationsPage'
import { ConfigurationNeeded } from './pages/ConfigurationNeeded'
import { DashboardPage } from './pages/DashboardPage'
import { ImportPage } from './pages/ImportPage'
import { LoginPage } from './pages/LoginPage'

function AuthenticatedRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="app-loading">
        <div className="brand-mark">J</div>
        <span>Opening your tracker…</span>
      </main>
    )
  }

  if (!user) return <LoginPage />

  return (
    <ApplicationsProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="applications/new" element={<NewApplicationPage />} />
          <Route path="applications/:id" element={<ApplicationDetailPage />} />
          <Route path="applications/:id/edit" element={<EditApplicationPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="*" element={<ApplicationsPage />} />
        </Route>
      </Routes>
    </ApplicationsProvider>
  )
}

export default function App() {
  if (!isSupabaseConfigured) return <ConfigurationNeeded />

  return (
    <HashRouter>
      <AuthProvider>
        <AuthenticatedRoutes />
      </AuthProvider>
    </HashRouter>
  )
}
