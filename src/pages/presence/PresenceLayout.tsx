import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/presence', end: true, label: 'Posts' },
  { to: '/presence/campaigns', label: 'Campaigns' },
  { to: '/presence/templates', label: 'Templates' },
]

export function PresenceLayout() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Presence</h1>
          <p className="muted">Plan LinkedIn, Reddit, and Twitter posts tied to your projects.</p>
        </div>
      </header>
      <nav className="tabs finance-tabs">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
