import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../api/client'
import type { Invoice } from '../../api/types'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'
import { formatBRL, reaisToCents } from '../../lib/money'

export function FinanceInvoiceDetailPage() {
  const { id = '' } = useParams()
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [invoice, setInvoice] = useState<Invoice | null>(null)

  const reload = useCallback(async () => {
    setInvoice(await api.finance.invoices.get(id))
  }, [id])

  useEffect(() => {
    reload().catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
  }, [reload, toast])

  async function onAddItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await api.finance.invoices.addItem(id, {
        description: String(fd.get('description')),
        amountCents: reaisToCents(Number(fd.get('amount'))),
        date: String(fd.get('date')),
        category: String(fd.get('category') || 'other'),
        installment: String(fd.get('installment') || ''),
      })
      e.currentTarget.reset()
      await reload()
      toast('Item added.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function removeItem(itemId: string) {
    if (!(await confirm('Delete this line item?'))) return
    try {
      await api.finance.invoices.deleteItem(id, itemId)
      await reload()
      toast('Item removed.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function markPaid() {
    if (!invoice) return
    try {
      await api.finance.invoices.update(id, {
        status: 'paid',
        paidCents: invoice.totalCents,
      })
      await reload()
      toast('Invoice marked as paid.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  if (!invoice) return <p className="muted">Loading…</p>

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/finance/invoices" className="back-link">← Invoices</Link>
          <h1>{invoice.name}</h1>
          <p className="muted">
            Due {new Date(invoice.dueDate).toLocaleDateString('pt-BR')} · {invoice.status} ·{' '}
            {formatBRL(invoice.totalCents)}
          </p>
        </div>
        {invoice.status !== 'paid' && (
          <button type="button" className="btn primary" onClick={markPaid}>
            Mark paid
          </button>
        )}
      </header>

      <form className="card form-grid" onSubmit={onAddItem}>
        <h2 className="full">Add line item</h2>
        <label className="full">
          Description
          <input name="description" required />
        </label>
        <label>
          Amount (R$)
          <input name="amount" type="number" step="0.01" min="0" required />
        </label>
        <label>
          Date
          <input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
        </label>
        <label>
          Category
          <input name="category" placeholder="subscription" />
        </label>
        <label>
          Installment
          <input name="installment" placeholder="2/12" />
        </label>
        <div className="form-actions full">
          <button type="submit" className="btn primary">Add item</button>
        </div>
      </form>

      <section className="card">
        <h2>Items</h2>
        {!invoice.items?.length ? (
          <p className="muted">No items yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                  <td>
                    {item.description}
                    {item.installment && <span className="muted small"> · {item.installment}</span>}
                  </td>
                  <td>{item.category}</td>
                  <td>{formatBRL(item.amountCents)}</td>
                  <td className="row-actions">
                    <button type="button" className="btn ghost danger" onClick={() => removeItem(item.id)}>
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
