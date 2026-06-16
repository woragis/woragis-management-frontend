import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { Transaction } from '../../api/types'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'
import { formatBRL, reaisToCents } from '../../lib/money'

export function FinanceTransactionsPage() {
  const now = new Date()
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [rows, setRows] = useState<Transaction[]>([])
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setRows(await api.finance.transactions.list({ year, month }))
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
      await api.finance.transactions.create({
        type: String(fd.get('type')) as Transaction['type'],
        description: String(fd.get('description')),
        amountCents: reaisToCents(Number(fd.get('amount'))),
        date: String(fd.get('date')),
        notes: String(fd.get('notes') || ''),
      })
      e.currentTarget.reset()
      await reload()
      toast('Transaction recorded.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function remove(id: string) {
    if (!(await confirm('Delete this transaction?'))) return
    try {
      await api.finance.transactions.delete(id)
      await reload()
      toast('Deleted.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  if (loading) return <p className="muted">Loading…</p>

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
        <h2 className="full">Record transaction</h2>
        <label>
          Type
          <select name="type" defaultValue="expense">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label>
          Date
          <input name="date" type="date" defaultValue={now.toISOString().slice(0, 10)} required />
        </label>
        <label>
          Amount (R$)
          <input name="amount" type="number" step="0.01" min="0" required />
        </label>
        <label className="full">
          Description
          <input name="description" required />
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
        <h2>Ledger</h2>
        {rows.length === 0 ? (
          <p className="muted">No transactions this month.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.date).toLocaleDateString('pt-BR')}</td>
                  <td>{r.type}</td>
                  <td>{r.description}</td>
                  <td className={r.type === 'income' ? 'success' : ''}>{formatBRL(r.amountCents)}</td>
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
