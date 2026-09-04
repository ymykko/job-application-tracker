import {
  BriefcaseBusiness,
  FileUp,
  LayoutDashboard,
  LogOut,
  Plus,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/applications', label: 'Applications', icon: BriefcaseBusiness },
  { to: '/import', label: 'Import', icon: FileUp },
]

export function AppShell() {
  const { user, signOut } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">J</div>
          <div>
            <strong>Jobfolio</strong>
            <span>Application tracker</span>
          </div>
        </div>

        <nav aria-label="Primary navigation">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink to="/applications/new" className="button button-primary button-wide">
            <Plus size={16} />
            New application
          </NavLink>
          <div className="account">
            <div className="account-avatar">{user?.email?.charAt(0).toUpperCase()}</div>
            <div className="account-copy">
              <span>Signed in as</span>
              <strong title={user?.email}>{user?.email}</strong>
            </div>
            <button className="icon-button" onClick={() => void signOut()} title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="mobile-nav">
        <div className="brand">
          <div className="brand-mark">J</div>
          <strong>Jobfolio</strong>
        </div>
        <NavLink to="/applications/new" className="button button-primary button-compact">
          <Plus size={16} /> New
        </NavLink>
      </div>

      <main className="main-content">
        <Outlet />
      </main>

      <nav className="mobile-tabs" aria-label="Mobile navigation">
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
