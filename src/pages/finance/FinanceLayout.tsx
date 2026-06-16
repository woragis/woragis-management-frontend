import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/finance', end: true, label: 'Dashboard' },
  { to: '/finance/income', label: 'Income' },
  { to: '/finance/expenses', label: 'Expenses' },
  { to: '/finance/transactions', label: 'Transactions' },
  { to: '/finance/invoices', label: 'Invoices' },
  { to: '/finance/budgets', label: 'Budgets' },
]

export function FinanceLayout() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Finance</h1>
          <p className="muted">Income, expenses, invoices, and monthly planning.</p>
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
