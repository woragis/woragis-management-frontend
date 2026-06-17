import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { api } from '../../../api/client'
import type { ContentPromptTemplate } from '../../../api/types'
import { useConfirm } from '../../../context/ConfirmContext'
import { useToast } from '../../../context/ToastContext'

export function LeetcodeTemplatesPage() {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [rows, setRows] = useState<ContentPromptTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const data = await api.content.leetcode.templates.list()
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
      await api.content.leetcode.templates.create({
        name: String(fd.get('name')),
        slug: String(fd.get('slug')),
        promptTemplate: String(fd.get('promptTemplate')),
        isDefault: fd.get('isDefault') === 'on',
      })
      e.currentTarget.reset()
      await reload()
      toast('Template created.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function remove(id: string) {
    if (!(await confirm('Delete this template?'))) return
    try {
      await api.content.leetcode.templates.delete(id)
      await reload()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  if (loading) return <p className="muted">Loading…</p>

  return (
    <div className="stack">
      <section className="card">
        <h2>New template</h2>
        <form className="stack" onSubmit={onCreate}>
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Slug
            <input name="slug" required placeholder="leetcode-default" />
          </label>
          <label>
            Prompt template
            <textarea
              name="promptTemplate"
              rows={8}
              required
              placeholder="YouTube thumbnail for {{title}} (LeetCode #{{problemNumber}})..."
            />
          </label>
          <label className="checkbox">
            <input type="checkbox" name="isDefault" /> Default template
          </label>
          <button type="submit" className="btn primary">
            Save
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Templates</h2>
        {rows.length === 0 ? (
          <p className="muted">No templates yet.</p>
        ) : (
          <div className="stack">
            {rows.map((row) => (
              <article key={row.id} className="card compact">
                <h3>
                  {row.name} {row.isDefault ? <span className="badge">default</span> : null}
                </h3>
                <pre className="code-block small">{row.promptTemplate}</pre>
                <button type="button" className="btn small ghost" onClick={() => remove(row.id)}>
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
