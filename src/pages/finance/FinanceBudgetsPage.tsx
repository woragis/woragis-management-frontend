import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { BudgetPlan, MonthlySummary } from '../../api/types'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'
import { formatBRL, reaisToCents } from '../../lib/money'

export function FinanceBudgetsPage() {
  const now = new Date()
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [rows, setRows] = useState<BudgetPlan[]>([])
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const [budgets, sum] = await Promise.all([
      api.finance.budgets.list(year, month),
      api.finance.summary(year, month),
    ])
    setRows(budgets)
    setSummary(sum)
  }, [year, month])

  useEffect(() => {
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [reload, toast])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await api.finance.budgets.create({
        year,
        month,
        category: String(fd.get('category')),
        plannedCents: reaisToCents(Number(fd.get('amount'))),
        notes: String(fd.get('notes') || ''),
      })
      e.currentTarget.reset()
      await reload()
      toast('Budget line added.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function remove(id: string) {
    if (!(await confirm('Delete this budget line?'))) return
    try {
      await api.finance.budgets.delete(id)
      await reload()
      toast('Deleted.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  if (loading) return <p className="muted">Loading…</p>

  const spent = summary?.byCategory ?? {}

  return (
    <div className="finance-section">
      <div className="filter-bar card">
        <label>
          Year
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
        </label>
        <label>
          Month
          <input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} />
        </label>
      </div>

      <form className="card form-grid" onSubmit={onCreate}>
        <h2 className="full">Plan budget ({month}/{year})</h2>
        <label>
          Category
          <select name="category" defaultValue="subscription">
            <option value="subscription">Subscription</option>
            <option value="utilities">Utilities</option>
            <option value="rent">Rent</option>
            <option value="food">Food</option>
            <option value="transport">Transport</option>
            <option value="health">Health</option>
            <option value="investment">Investment</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Planned (R$)
          <input name="amount" type="number" step="0.01" min="0" required />
        </label>
        <label className="full">
          Notes
          <input name="notes" />
        </label>
        <div className="form-actions full">
          <button type="submit" className="btn primary">Add</button>
        </div>
      </form>

      <section className="card">
        <h2>Budget vs actual</h2>
        {rows.length === 0 ? (
          <p className="muted">No budget lines for this month.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Planned</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const actual = spent[r.category] ?? 0
                const remaining = r.plannedCents - actual
                return (
                  <tr key={r.id}>
                    <td>{r.category}</td>
                    <td>{formatBRL(r.plannedCents)}</td>
                    <td>{formatBRL(actual)}</td>
                    <td className={remaining < 0 ? 'error' : 'success'}>{formatBRL(remaining)}</td>
                    <td className="row-actions">
                      <button type="button" className="btn ghost danger" onClick={() => remove(r.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
