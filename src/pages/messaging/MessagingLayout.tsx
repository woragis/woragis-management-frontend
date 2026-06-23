import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/messaging', end: true, label: 'Destinations' },
  { to: '/messaging/templates', label: 'Templates' },
  { to: '/messaging/jobs', label: 'Jobs' },
  { to: '/messaging/deliveries', label: 'Deliveries' },
  { to: '/messaging/channels', label: 'Channels' },
]

export function MessagingLayout() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Messaging</h1>
          <p className="muted">Channel destinations, templates, scheduled jobs, and delivery log.</p>
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
