import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../../api/client'
import type { LeetcodeVideo } from '../../../api/types'
import { useConfirm } from '../../../context/ConfirmContext'
import { useToast } from '../../../context/ToastContext'

export function LeetcodeVideosPage() {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [rows, setRows] = useState<LeetcodeVideo[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const data = await api.content.leetcode.videos.list()
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
      await api.content.leetcode.videos.create({
        title: String(fd.get('title')),
        leetcodeProblemNumber: Number(fd.get('problemNumber') || 0) || undefined,
        leetcodeSlug: String(fd.get('slug') || '') || undefined,
        difficulty: String(fd.get('difficulty') || '') || undefined,
        status: 'draft',
      })
      e.currentTarget.reset()
      await reload()
      toast('Video created.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function remove(id: string) {
    if (!(await confirm('Delete this video and its thumbnails?'))) return
    try {
      await api.content.leetcode.videos.delete(id)
      await reload()
      toast('Deleted.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  if (loading) return <p className="muted">Loading…</p>

  return (
    <div className="stack">
      <section className="card">
        <h2>New video</h2>
        <form className="form-grid" onSubmit={onCreate}>
          <label>
            Title
            <input name="title" required />
          </label>
          <label>
            Problem #
            <input name="problemNumber" type="number" min={1} />
          </label>
          <label>
            Slug
            <input name="slug" placeholder="two-sum" />
          </label>
          <label>
            Difficulty
            <select name="difficulty" defaultValue="">
              <option value="">—</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <div className="form-actions">
            <button type="submit" className="btn primary">
              Create
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Videos</h2>
        {rows.length === 0 ? (
          <p className="muted">No videos yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Problem</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link to={`/content/leetcode/${row.id}`}>{row.title}</Link>
                  </td>
                  <td>{row.leetcodeProblemNumber ?? '—'}</td>
                  <td>{row.status}</td>
                  <td className="row-actions">
                    <button type="button" className="btn small ghost" onClick={() => remove(row.id)}>
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
