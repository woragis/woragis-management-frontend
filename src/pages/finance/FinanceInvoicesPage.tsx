import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import type { Invoice } from '../../api/types'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'
import { formatBRL } from '../../lib/money'

export function FinanceInvoicesPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [rows, setRows] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setRows(await api.finance.invoices.list())
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
      const inv = await api.finance.invoices.create({
        name: String(fd.get('name')),
        cardLastFour: String(fd.get('cardLastFour') || ''),
        dueDate: String(fd.get('dueDate')),
        status: 'open',
        notes: String(fd.get('notes') || ''),
      })
      e.currentTarget.reset()
      await reload()
      toast('Invoice created.', 'success')
      navigate(`/finance/invoices/${inv.id}`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function remove(id: string) {
    if (!(await confirm('Delete this invoice and all items?'))) return
    try {
      await api.finance.invoices.delete(id)
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
        <h2 className="full">New invoice</h2>
        <label>
          Name
          <input name="name" placeholder="Nubank Mar 2026" required />
        </label>
        <label>
          Card last 4
          <input name="cardLastFour" maxLength={4} />
        </label>
        <label>
          Due date
          <input name="dueDate" type="date" required />
        </label>
        <label className="full">
          Notes
          <input name="notes" />
        </label>
        <div className="form-actions full">
          <button type="submit" className="btn primary">Create</button>
        </div>
      </form>

      <section className="card">
        <h2>Invoices</h2>
        {rows.length === 0 ? (
          <p className="muted">None yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Due</th>
                <th>Total</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link to={`/finance/invoices/${r.id}`}>{r.name}</Link>
                  </td>
                  <td>{new Date(r.dueDate).toLocaleDateString('pt-BR')}</td>
                  <td>{formatBRL(r.totalCents)}</td>
                  <td>{r.status}</td>
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
