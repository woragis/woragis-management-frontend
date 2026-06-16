import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { IncomeSource } from '../../api/types'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'
import { formatBRL, reaisToCents } from '../../lib/money'

export function FinanceIncomePage() {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [rows, setRows] = useState<IncomeSource[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const data = await api.finance.incomeSources.list()
    setRows(data)
  }, [])

  useEffect(() => {
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [reload, toast])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await api.finance.incomeSources.create({
        name: String(fd.get('name')),
        type: String(fd.get('type')),
        amountCents: reaisToCents(Number(fd.get('amount'))),
        frequency: String(fd.get('frequency')),
        dayOfMonth: Number(fd.get('dayOfMonth') || 1),
        active: true,
        notes: String(fd.get('notes') || ''),
      })
      e.currentTarget.reset()
      await reload()
      toast('Income source added.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function toggleActive(row: IncomeSource) {
    try {
      await api.finance.incomeSources.update(row.id, { active: !row.active })
      await reload()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function remove(id: string) {
    if (!(await confirm('Delete this income source?'))) return
    try {
      await api.finance.incomeSources.delete(id)
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
        <h2 className="full">Add income source</h2>
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Type
          <select name="type" defaultValue="salary">
            <option value="salary">Salary</option>
            <option value="freelance">Freelance</option>
            <option value="saas">SaaS</option>
            <option value="business">Business</option>
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
          <input name="dayOfMonth" type="number" min="1" max="31" defaultValue={1} />
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
        <h2>Income sources</h2>
        {rows.length === 0 ? (
          <p className="muted">None yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Schedule</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.type}</td>
                  <td>{formatBRL(r.amountCents)}</td>
                  <td className="muted small">
                    {r.frequency}
                    {r.frequency === 'monthly' && ` · day ${r.dayOfMonth}`}
                  </td>
                  <td>{r.active ? 'Active' : 'Paused'}</td>
                  <td className="row-actions">
                    <button type="button" className="btn ghost" onClick={() => toggleActive(r)}>
                      {r.active ? 'Pause' : 'Activate'}
                    </button>
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
