import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { Project, SocialCampaign, SocialGoal } from '../../api/types'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'
import { SOCIAL_GOALS, labelFor } from '../../lib/project-dimensions'

export function PresenceCampaignsPage() {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [rows, setRows] = useState<SocialCampaign[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const [campaigns, projs] = await Promise.all([
      api.presence.campaigns.list(),
      api.projects.list(),
    ])
    setRows(campaigns)
    setProjects(projs)
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
      await api.presence.campaigns.create({
        name: String(fd.get('name')),
        goal: (String(fd.get('goal') || 'visibility')) as SocialGoal,
        description: String(fd.get('description') || ''),
        projectId: String(fd.get('projectId') || '') || null,
        startDate: String(fd.get('startDate') || '') || null,
        endDate: String(fd.get('endDate') || '') || null,
        active: true,
      })
      e.currentTarget.reset()
      await reload()
      toast('Campaign created.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function toggleActive(row: SocialCampaign) {
    try {
      await api.presence.campaigns.update(row.id, { active: !row.active })
      await reload()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function remove(id: string) {
    if (!(await confirm('Delete this campaign?'))) return
    try {
      await api.presence.campaigns.delete(id)
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
        <h2 className="full">New campaign</h2>
        <label>
          Name
          <input name="name" required placeholder="30 days — job hunting" />
        </label>
        <label>
          Goal
          <select name="goal" defaultValue="job_hunting">
            {SOCIAL_GOALS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label>
          Project
          <select name="projectId" defaultValue="">
            <option value="">—</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
        <label>
          Start date
          <input name="startDate" type="date" />
        </label>
        <label>
          End date
          <input name="endDate" type="date" />
        </label>
        <label className="full">
          Description
          <textarea name="description" rows={3} />
        </label>
        <div className="form-actions full">
          <button type="submit" className="btn primary">Add</button>
        </div>
      </form>

      <section className="card">
        <h2>Campaigns</h2>
        {rows.length === 0 ? (
          <p className="muted">No campaigns yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Goal</th>
                <th>Project</th>
                <th>Dates</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{labelFor(SOCIAL_GOALS, r.goal)}</td>
                  <td className="muted small">
                    {r.projectId ? projects.find((p) => p.id === r.projectId)?.name ?? '—' : '—'}
                  </td>
                  <td className="muted small">
                    {r.startDate ?? '—'} → {r.endDate ?? '—'}
                  </td>
                  <td>{r.active ? 'Active' : 'Inactive'}</td>
                  <td className="row-actions">
                    <button type="button" className="btn ghost" onClick={() => toggleActive(r)}>
                      {r.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button type="button" className="btn ghost danger" onClick={() => remove(r.id)}>Delete</button>
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
