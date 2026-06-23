import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { ChannelDestination, ScheduledJob } from '../../api/types'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'

function formatWhen(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

export function MessagingJobsPage() {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [rows, setRows] = useState<ScheduledJob[]>([])
  const [destinations, setDestinations] = useState<ChannelDestination[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const [jobs, dests] = await Promise.all([
      api.messaging.jobs.list(),
      api.messaging.destinations.list(),
    ])
    setRows(jobs)
    setDestinations(dests)
  }, [])

  useEffect(() => {
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [reload, toast])

  function destinationName(id: string) {
    return destinations.find((d) => d.id === id)?.name ?? id.slice(0, 8)
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const templateSlug = String(fd.get('templateSlug') || '').trim()
    const programAction = String(fd.get('programAction') || '').trim()
    try {
      await api.messaging.jobs.create({
        name: String(fd.get('name')),
        destinationId: String(fd.get('destinationId')),
        templateSlug,
        programAction,
        cronExpr: String(fd.get('cronExpr')),
        timezone: String(fd.get('timezone') || 'America/Sao_Paulo'),
        enabled: fd.get('enabled') === 'on',
      })
      e.currentTarget.reset()
      await reload()
      toast('Job created.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function toggleEnabled(row: ScheduledJob) {
    try {
      await api.messaging.jobs.update(row.id, { enabled: !row.enabled })
      await reload()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function remove(id: string) {
    if (!(await confirm('Delete this scheduled job?'))) return
    try {
      await api.messaging.jobs.delete(id)
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
        <h2 className="full">Add scheduled job</h2>
        <label>
          Name
          <input name="name" required placeholder="Daily problem post" />
        </label>
        <label>
          Destination
          <select name="destinationId" required defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.channel})
              </option>
            ))}
          </select>
        </label>
        <label>
          Template slug
          <input name="templateSlug" placeholder="custom template slug" />
        </label>
        <label>
          Program action
          <select name="programAction" defaultValue="">
            <option value="">—</option>
            <option value="problem">leetcode: problem</option>
            <option value="discussion">leetcode: discussion</option>
            <option value="solution">leetcode: solution</option>
            <option value="weekly">leetcode: weekly</option>
          </select>
        </label>
        <label>
          Cron expression
          <input name="cronExpr" required placeholder="0 9 * * *" />
        </label>
        <label>
          Timezone
          <input name="timezone" defaultValue="America/Sao_Paulo" />
        </label>
        <label className="checkbox-row">
          <input name="enabled" type="checkbox" defaultChecked />
          Enabled
        </label>
        <p className="muted small full">
          Use either a template slug or a program action (e.g. LeetCode dispatch). Cron uses standard 5-field syntax.
        </p>
        <div className="form-actions full">
          <button type="submit" className="btn primary" disabled={destinations.length === 0}>
            Add
          </button>
        </div>
      </form>

      <section className="card">
        <h2>Scheduled jobs</h2>
        {destinations.length === 0 ? (
          <p className="muted">Create a destination first.</p>
        ) : rows.length === 0 ? (
          <p className="muted">No jobs yet. The scheduler-worker polls the API and runs due jobs.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Destination</th>
                <th>Trigger</th>
                <th>Schedule</th>
                <th>Next run</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{destinationName(r.destinationId)}</td>
                  <td className="muted small">
                    {r.programAction || r.templateSlug || '—'}
                  </td>
                  <td className="muted small">
                    <code>{r.cronExpr}</code>
                    <div>{r.timezone}</div>
                  </td>
                  <td className="muted small">{formatWhen(r.nextRunAt)}</td>
                  <td>{r.enabled ? 'Enabled' : 'Disabled'}</td>
                  <td className="row-actions">
                    <button type="button" className="btn ghost" onClick={() => toggleEnabled(r)}>
                      {r.enabled ? 'Disable' : 'Enable'}
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
