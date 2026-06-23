import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { ChannelDestination, MessageDelivery } from '../../api/types'
import { useToast } from '../../context/ToastContext'

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString()
}

function previewBody(body: string) {
  const trimmed = body.trim()
  if (trimmed.length <= 120) return trimmed
  return `${trimmed.slice(0, 120)}…`
}

export function MessagingDeliveriesPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<MessageDelivery[]>([])
  const [destinations, setDestinations] = useState<ChannelDestination[]>([])
  const [destinationFilter, setDestinationFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const [deliveries, dests] = await Promise.all([
      api.messaging.deliveries.list({
        destinationId: destinationFilter || undefined,
        limit: 100,
      }),
      api.messaging.destinations.list(),
    ])
    setRows(deliveries)
    setDestinations(dests)
  }, [destinationFilter])

  useEffect(() => {
    setLoading(true)
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [reload, toast])

  function destinationName(id: string) {
    return destinations.find((d) => d.id === id)?.name ?? id.slice(0, 8)
  }

  if (loading) return <p className="muted">Loading…</p>

  return (
    <section className="card">
      <div className="row-actions" style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, flex: 1 }}>Recent deliveries</h2>
        <label className="inline-filter">
          Destination
          <select value={destinationFilter} onChange={(e) => setDestinationFilter(e.target.value)}>
            <option value="">All</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {rows.length === 0 ? (
        <p className="muted">No deliveries logged yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Sent</th>
              <th>Destination</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Template / ref</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="muted small">{formatWhen(r.sentAt)}</td>
                <td>{destinationName(r.destinationId)}</td>
                <td>{r.channel}</td>
                <td>
                  <span className={r.status === 'sent' ? 'success' : 'warning'}>{r.status}</span>
                  {r.errorMessage ? (
                    <div className="muted small">{r.errorMessage}</div>
                  ) : null}
                </td>
                <td className="muted small">
                  {r.templateSlug || '—'}
                  {r.externalRef ? <div>ref: {r.externalRef}</div> : null}
                </td>
                <td className="muted small">{previewBody(r.body)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
