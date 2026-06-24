import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api/client'
import type { Contact, ContactFinance, ContactInteraction } from '../../api/types'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'
import { formatBRL } from '../../lib/money'

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null
  return new Date(value).toISOString()
}

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [contact, setContact] = useState<Contact | null>(null)
  const [interactions, setInteractions] = useState<ContactInteraction[]>([])
  const [finance, setFinance] = useState<ContactFinance | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    if (!id) return
    const [c, ints, fin] = await Promise.all([
      api.contacts.get(id),
      api.contacts.listInteractions(id),
      api.contacts.finance(id).catch(() => null),
    ])
    setContact(c)
    setInteractions(
      [...ints].sort(
        (a, b) => new Date(b.happenedAt).getTime() - new Date(a.happenedAt).getTime(),
      ),
    )
    setFinance(fin)
  }, [id])

  useEffect(() => {
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [reload, toast])

  async function onSaveContact(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!id || !contact) return
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const followUpRaw = String(fd.get('nextFollowUpAt') || '')
    try {
      const updated = await api.contacts.update(id, {
        name: String(fd.get('name')),
        displayName: String(fd.get('displayName') || ''),
        email: String(fd.get('email') || ''),
        phone: String(fd.get('phone') || ''),
        telegram: String(fd.get('telegram') || ''),
        whatsapp: String(fd.get('whatsapp') || ''),
        organization: String(fd.get('organization') || ''),
        roleTitle: String(fd.get('roleTitle') || ''),
        relationship: String(fd.get('relationship')) as Contact['relationship'],
        stage: String(fd.get('stage')) as Contact['stage'],
        source: String(fd.get('source') || ''),
        notes: String(fd.get('notes') || ''),
        tags: parseTags(String(fd.get('tags') || '')),
        nextFollowUpAt: fromDatetimeLocal(followUpRaw),
        active: fd.get('active') === 'on',
      })
      setContact(updated)
      toast('Contact saved.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function onAddInteraction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!id) return
    const fd = new FormData(e.currentTarget)
    const happenedRaw = String(fd.get('happenedAt') || '')
    try {
      await api.contacts.createInteraction(id, {
        type: String(fd.get('type')),
        channel: String(fd.get('channel')),
        summary: String(fd.get('summary') || ''),
        happenedAt: fromDatetimeLocal(happenedRaw) ?? new Date().toISOString(),
      })
      e.currentTarget.reset()
      await reload()
      toast('Interaction logged.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function onDelete() {
    if (!id) return
    if (!(await confirm('Delete this contact?'))) return
    try {
      await api.contacts.delete(id)
      toast('Contact deleted.', 'success')
      navigate('/contacts')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  if (loading) return <p className="muted">Loading…</p>
  if (!contact) return <p className="muted">Contact not found.</p>

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="muted">
            <Link to="/contacts">← Contacts</Link>
          </p>
          <h1>{contact.displayName || contact.name}</h1>
          {contact.lastContactedAt ? (
            <p className="muted">
              Last contacted {new Date(contact.lastContactedAt).toLocaleString('pt-BR')}
            </p>
          ) : null}
        </div>
        <button type="button" className="btn ghost danger" onClick={onDelete}>
          Delete
        </button>
      </header>

      <form
        className="card form-grid finance-section"
        onSubmit={onSaveContact}
        key={contact.updatedAt}
      >
        <h2 className="full">Contact details</h2>
        <label>
          Name
          <input name="name" defaultValue={contact.name} required />
        </label>
        <label>
          Display name
          <input name="displayName" defaultValue={contact.displayName} />
        </label>
        <label>
          Email
          <input name="email" type="email" defaultValue={contact.email} />
        </label>
        <label>
          Phone
          <input name="phone" defaultValue={contact.phone} />
        </label>
        <label>
          Telegram
          <input name="telegram" defaultValue={contact.telegram} />
        </label>
        <label>
          WhatsApp
          <input name="whatsapp" defaultValue={contact.whatsapp} />
        </label>
        <label>
          Organization
          <input name="organization" defaultValue={contact.organization} />
        </label>
        <label>
          Role
          <input name="roleTitle" defaultValue={contact.roleTitle} />
        </label>
        <label>
          Relationship
          <select name="relationship" defaultValue={contact.relationship}>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="client">Client</option>
            <option value="investor">Investor</option>
            <option value="partner">Partner</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Stage
          <select name="stage" defaultValue={contact.stage}>
            <option value="cold">Cold</option>
            <option value="warm">Warm</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="churned">Churned</option>
          </select>
        </label>
        <label>
          Source
          <input name="source" defaultValue={contact.source} />
        </label>
        <label>
          Next follow-up
          <input
            name="nextFollowUpAt"
            type="datetime-local"
            defaultValue={toDatetimeLocal(contact.nextFollowUpAt)}
          />
        </label>
        <label className="full">
          Tags (comma-separated)
          <input name="tags" defaultValue={(contact.tags ?? []).join(', ')} />
        </label>
        <label className="full">
          Notes
          <textarea name="notes" rows={3} defaultValue={contact.notes} />
        </label>
        <label className="checkbox full">
          <input type="checkbox" name="active" defaultChecked={contact.active} />
          Active
        </label>
        <div className="form-actions full">
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>

      <div className="finance-section">
        <form className="card form-grid" onSubmit={onAddInteraction}>
          <h2 className="full">Log interaction</h2>
          <label>
            Type
            <select name="type" defaultValue="message">
              <option value="call">Call</option>
              <option value="meeting">Meeting</option>
              <option value="message">Message</option>
              <option value="email">Email</option>
              <option value="note">Note</option>
            </select>
          </label>
          <label>
            Channel
            <select name="channel" defaultValue="whatsapp">
              <option value="telegram">Telegram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Phone</option>
              <option value="in_person">In person</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            When
            <input
              name="happenedAt"
              type="datetime-local"
              defaultValue={toDatetimeLocal(new Date().toISOString())}
            />
          </label>
          <label className="full">
            Summary
            <textarea name="summary" rows={2} placeholder="What was discussed?" />
          </label>
          <div className="form-actions full">
            <button type="submit" className="btn primary">
              Add interaction
            </button>
          </div>
        </form>

        <section className="card">
          <h2>Interactions</h2>
          {interactions.length === 0 ? (
            <p className="muted">No interactions yet.</p>
          ) : (
            <ul className="item-list">
              {interactions.map((i) => (
                <li key={i.id}>
                  <div className="timeline-meta muted small">
                    {new Date(i.happenedAt).toLocaleString('pt-BR')} · {i.type} · {i.channel}
                  </div>
                  <div>{i.summary || <span className="muted">—</span>}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {finance ? (
        <section className="card finance-section">
          <h2>Finance</h2>
          <div className="stat-grid">
            <div className="card stat-card">
              <span className="stat-value success">{formatBRL(finance.incomeCents)}</span>
              <span className="muted">Income</span>
            </div>
            <div className="card stat-card">
              <span className="stat-value">{formatBRL(finance.expenseCents)}</span>
              <span className="muted">Expenses</span>
            </div>
            <div className="card stat-card">
              <span
                className={`stat-value ${finance.incomeCents - finance.expenseCents >= 0 ? 'success' : 'error'}`}
              >
                {formatBRL(finance.incomeCents - finance.expenseCents)}
              </span>
              <span className="muted">Net</span>
            </div>
          </div>

          {finance.incomeSources.length > 0 ? (
            <>
              <h3>Income sources</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {finance.incomeSources.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td className="muted small">{s.type}</td>
                      <td>{formatBRL(s.amountCents)}</td>
                      <td>{s.active ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}

          {finance.transactions.length > 0 ? (
            <>
              <h3>Transactions</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {finance.transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="muted small">
                        {new Date(t.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td>{t.description}</td>
                      <td>{t.type}</td>
                      <td className={t.type === 'income' ? 'success' : ''}>
                        {formatBRL(t.amountCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : finance.incomeSources.length === 0 ? (
            <p className="muted">No linked finance records.</p>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
