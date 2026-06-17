import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../../api/client'
import type { ContentPromptTemplate, ContentThumbnail, LeetcodeVideo } from '../../../api/types'
import { ImagePicker } from '../../../components/ImagePicker'
import { useConfirm } from '../../../context/ConfirmContext'
import { useToast } from '../../../context/ToastContext'

export function LeetcodeVideoDetailPage() {
  const { id = '' } = useParams()
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [video, setVideo] = useState<LeetcodeVideo | null>(null)
  const [templates, setTemplates] = useState<ContentPromptTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [draftPrompt, setDraftPrompt] = useState('')
  const [refId, setRefId] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)

  const reload = useCallback(async () => {
    const [v, t] = await Promise.all([
      api.content.leetcode.videos.get(id),
      api.content.leetcode.templates.list(),
    ])
    setVideo(v)
    setTemplates(t)
    const defaultTpl = t.find((x) => x.isDefault) ?? t[0]
    if (!draftPrompt && defaultTpl) {
      setDraftPrompt(applyTemplate(defaultTpl.promptTemplate, v))
    }
  }, [id, draftPrompt])

  useEffect(() => {
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [reload, toast])

  useEffect(() => {
    if (!video?.thumbnails?.some((t) => t.status === 'generating')) {
      setPolling(false)
      return
    }
    setPolling(true)
    const timer = window.setInterval(() => {
      reload().catch(() => {})
    }, 4000)
    return () => window.clearInterval(timer)
  }, [video, reload])

  async function onCreateThumbnail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      const thumb = await api.content.leetcode.thumbnails.create(id, {
        prompt: draftPrompt,
        size: '1280x720',
        quality: 'high',
        model: 'gpt-image-2',
        mode: refId ? 'edit' : 'generate',
        referenceMediaIds: refId ? [refId] : [],
      })
      await api.content.leetcode.thumbnails.generate(id, thumb.id)
      await reload()
      toast('Thumbnail generation started.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function approveThumbnail(thumb: ContentThumbnail) {
    try {
      await api.content.leetcode.thumbnails.approve(id, thumb.id)
      await reload()
      toast('Thumbnail approved.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  async function removeThumbnail(thumbId: string) {
    if (!(await confirm('Delete this thumbnail?'))) return
    try {
      await api.content.leetcode.thumbnails.delete(id, thumbId)
      await reload()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    }
  }

  function applyTemplateFrom(tpl: ContentPromptTemplate) {
    if (!video) return
    setDraftPrompt(applyTemplate(tpl.promptTemplate, video))
  }

  if (loading) return <p className="muted">Loading…</p>
  if (!video) return <p className="muted">Video not found.</p>

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="muted small">
            <Link to="/content/leetcode">← LeetCode videos</Link>
          </p>
          <h1>{video.title}</h1>
          <p className="muted">
            #{video.leetcodeProblemNumber ?? '—'} · {video.difficulty ?? '—'} · {video.status}
            {polling ? ' · syncing…' : ''}
          </p>
        </div>
      </header>

      <div className="stack">
        <section className="card">
          <h2>New thumbnail</h2>
          {templates.length > 0 && (
            <div className="form-row">
              {templates.map((tpl) => (
                <button key={tpl.id} type="button" className="btn small" onClick={() => applyTemplateFrom(tpl)}>
                  {tpl.name}
                </button>
              ))}
            </div>
          )}
          <form className="stack" onSubmit={onCreateThumbnail}>
            <label>
              Prompt
              <textarea rows={6} value={draftPrompt} onChange={(e) => setDraftPrompt(e.target.value)} required />
            </label>
            <ImagePicker label="Reference image (optional)" value={refId} onChange={setRefId} />
            <div className="form-actions">
              <button type="submit" className="btn primary">
                Generate 1280×720
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <h2>Thumbnails</h2>
          {!video.thumbnails?.length ? (
            <p className="muted">No thumbnails yet.</p>
          ) : (
            <div className="media-grid">
              {video.thumbnails.map((thumb) => (
                <ThumbnailCard
                  key={thumb.id}
                  thumb={thumb}
                  onApprove={() => approveThumbnail(thumb)}
                  onDelete={() => removeThumbnail(thumb.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function ThumbnailCard({
  thumb,
  onApprove,
  onDelete,
}: {
  thumb: ContentThumbnail
  onApprove: () => void
  onDelete: () => void
}) {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!thumb.outputMediaId) {
      setPreview(null)
      return
    }
    api.media
      .get(thumb.outputMediaId)
      .then((m: { publicUrl: string }) => setPreview(m.publicUrl))
      .catch(() => setPreview(null))
  }, [thumb.outputMediaId])

  return (
    <article className="card compact">
      {preview ? (
        <img src={preview} alt="" className="thumb-preview" />
      ) : (
        <div className="thumb-preview placeholder muted">No preview</div>
      )}
      <p className="small">
        <strong>{thumb.status}</strong>
      </p>
      {thumb.errorMessage && <p className="small error">{thumb.errorMessage}</p>}
      <p className="small muted">{thumb.size}</p>
      <div className="row-actions">
        {thumb.status === 'ready' && (
          <button type="button" className="btn small primary" onClick={onApprove}>
            Approve
          </button>
        )}
        <button type="button" className="btn small ghost" onClick={onDelete}>
          Delete
        </button>
      </div>
    </article>
  )
}

function applyTemplate(tpl: string, video: LeetcodeVideo) {
  return tpl
    .replaceAll('{{title}}', video.title)
    .replaceAll('{{problemNumber}}', String(video.leetcodeProblemNumber ?? ''))
    .replaceAll('{{slug}}', video.leetcodeSlug ?? '')
    .replaceAll('{{difficulty}}', video.difficulty ?? '')
}
