import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { Expense } from '../../api/types'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'
import { formatBRL, reaisToCents } from '../../lib/money'

export function FinanceExpensesPage() {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [rows, setRows] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setRows(await api.finance.expenses.list())
  }, [])

  useEffect(() => {
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [reload, toast])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const frequency = String(fd.get('frequency'))
    try {
      await api.finance.expenses.create({
        name: String(fd.get('name')),
        category: String(fd.get('category')),
        amountCents: reaisToCents(Number(fd.get('amount'))),
        frequency,
        dayOfMonth: Number(fd.get('dayOfMonth') || 1),
        dueDate: frequency === 'one_time' && fd.get('dueDate') ? String(fd.get('dueDate')) : null,
        autoPay: fd.get('autoPay') === 'on',
        active: true,
        notes: String(fd.get('notes') || ''),
      })
      e.currentTarget.reset()
      await reload()
      toast('Expense added.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function remove(id: string) {
    if (!(await confirm('Delete this expense?'))) return
    try {
      await api.finance.expenses.delete(id)
      await reload()
      toast('Deleted.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  if (loading) return <p className="muted">Loading…</p>

  return (
    <div className="finance-section">
      <form className="card form-grid" onSubmit={onCreate}>
        <h2 className="full">Add expense</h2>
        <label>
          Name
          <input name="name" required />
        </label>
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
          Amount (R$)
          <input name="amount" type="number" step="0.01" min="0" required />
        </label>
        <label>
          Frequency
          <select name="frequency" defaultValue="monthly">
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="yearly">Yearly</option>
            <option value="one_time">One-time</option>
          </select>
        </label>
        <label>
          Day of month
          <input name="dayOfMonth" type="number" min="1" max="31" defaultValue={5} />
        </label>
        <label>
          Due date (one-time)
          <input name="dueDate" type="date" />
        </label>
        <label className="checkbox">
          <input name="autoPay" type="checkbox" />
          Auto-pay
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
        <h2>Expenses</h2>
        {rows.length === 0 ? (
          <p className="muted">None yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Schedule</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.category}</td>
                  <td>{formatBRL(r.amountCents)}</td>
                  <td className="muted small">
                    {r.frequency}
                    {r.frequency === 'monthly' && ` · day ${r.dayOfMonth}`}
                    {r.dueDate && ` · ${new Date(r.dueDate).toLocaleDateString('pt-BR')}`}
                  </td>
                  <td className="row-actions">
                    <button type="button" className="btn ghost danger" onClick={() => remove(r.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
