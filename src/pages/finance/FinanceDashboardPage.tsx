import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import type { CalendarEvent, FinanceDashboard, MonthlySummary } from '../../api/types'
import { formatBRL } from '../../lib/money'

export function FinanceDashboardPage() {
  const now = new Date()
  const [dashboard, setDashboard] = useState<FinanceDashboard | null>(null)
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [calendar, setCalendar] = useState<CalendarEvent[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.finance.dashboard(),
      api.finance.summary(now.getFullYear(), now.getMonth() + 1),
      api.finance.calendar(now.getFullYear(), now.getMonth() + 1),
    ])
      .then(([d, s, c]) => {
        setDashboard(d)
        setSummary(s)
        setCalendar(c)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
  }, [])

  if (error) return <p className="error">{error}</p>
  if (!dashboard || !summary) return <p className="muted">Loading…</p>

  return (
    <>
      <div className="stat-grid">
        <div className="card stat-card">
          <span className="stat-value success">{formatBRL(dashboard.monthIncomeCents)}</span>
          <span className="muted">Income this month</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value">{formatBRL(dashboard.monthExpenseCents)}</span>
          <span className="muted">Expenses this month</span>
        </div>
        <div className="card stat-card">
          <span className={`stat-value ${dashboard.monthNetCents >= 0 ? 'success' : 'error'}`}>
            {formatBRL(dashboard.monthNetCents)}
          </span>
          <span className="muted">Net this month</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value">{dashboard.openInvoiceCount}</span>
          <span className="muted">Open invoices</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <h2>Upcoming (30 days)</h2>
          {dashboard.upcomingInvoices.length === 0 ? (
            <p className="muted">No invoices due soon.</p>
          ) : (
            <ul className="item-list">
              {dashboard.upcomingInvoices.map((inv) => (
                <li key={inv.id}>
                  <div>
                    <strong>{inv.name}</strong>
                    <div className="muted small">
                      <Link to={`/finance/invoices/${inv.id}`}>{formatBRL(inv.totalCents - inv.paidCents)}</Link>
                      {' · '}
                      {new Date(inv.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2>Calendar this month</h2>
          {calendar.length === 0 ? (
            <p className="muted">No scheduled items.</p>
          ) : (
            <ul className="item-list">
              {calendar.slice(0, 8).map((ev, i) => (
                <li key={`${ev.refId}-${i}`}>
                  <div>
                    <strong>{ev.title}</strong>
                    <div className="muted small">
                      {new Date(ev.date).toLocaleDateString('pt-BR')} · {ev.type} · {formatBRL(ev.amountCents)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card full-width">
          <h2>Spending by category</h2>
          {Object.keys(summary.byCategory).length === 0 ? (
            <p className="muted">No expense transactions this month.</p>
          ) : (
            <ul className="item-list">
              {Object.entries(summary.byCategory).map(([cat, cents]) => (
                <li key={cat}>
                  <div>
                    <strong>{cat}</strong>
                    <div className="muted small">{formatBRL(cents)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
