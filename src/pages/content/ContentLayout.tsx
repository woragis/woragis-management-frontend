import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/content/leetcode', end: true, label: 'Videos' },
  { to: '/content/leetcode/templates', label: 'Templates' },
]

export function ContentLayout() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Content</h1>
          <p className="muted">LeetCode videos, thumbnails, and prompt templates.</p>
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
