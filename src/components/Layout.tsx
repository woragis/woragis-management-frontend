import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Layout() {
  const { logout } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">W</span>
          <div>
            <strong>Woragis</strong>
            <small>Management</small>
          </div>
        </div>
        <nav>
          <NavLink to="/projects" className={({ isActive }) => (isActive ? 'active' : '')}>
            Projects
          </NavLink>
          <NavLink to="/media" className={({ isActive }) => (isActive ? 'active' : '')}>
            Media
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
            Profile
          </NavLink>
        </nav>
        <button type="button" className="btn ghost sidebar-logout" onClick={logout}>
          Log out
        </button>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
