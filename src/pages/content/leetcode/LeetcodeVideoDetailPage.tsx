import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../../api/client'
import type { ContentPromptTemplate, ContentThumbnail, LeetcodeVideo } from '../../../api/types'
import { ImagePicker } from '../../../components/ImagePicker'
import { useConfirm } from '../../../context/ConfirmContext'
import { useToast } from '../../../context/ToastContext'

const waTypes = [
  { type: 'problem', label: 'Problem' },
  { type: 'discussion', label: 'Discussion' },
  { type: 'solution', label: 'Solution' },
] as const

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
  const [savingMeta, setSavingMeta] = useState(false)
  const [waPreviews, setWaPreviews] = useState<Record<string, string>>({})
  const [waSending, setWaSending] = useState<string | null>(null)

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

  function patchVideo(patch: Partial<LeetcodeVideo>) {
    setVideo((v) => (v ? { ...v, ...patch } : v))
  }

  async function saveMetadata(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!video) return
    setSavingMeta(true)
    try {
      const updated = await api.content.leetcode.videos.update(id, {
        title: video.title,
        status: video.status,
        seriesNumber: video.seriesNumber ?? null,
        seriesNumberSet: true,
        trackName: video.trackName ?? null,
        problemTitle: video.problemTitle ?? null,
        leetcodeProblemNumber: video.leetcodeProblemNumber ?? null,
        leetcodeProblemSet: true,
        leetcodeSlug: video.leetcodeSlug ?? null,
        studyPlanSlug: video.studyPlanSlug ?? null,
        difficulty: video.difficulty ?? null,
        shortDescription: video.shortDescription ?? null,
        leetcodeProblemUrl: video.leetcodeProblemUrl ?? null,
        leetcodeSubmissionUrl: video.leetcodeSubmissionUrl ?? null,
        notes: video.notes ?? null,
        youtubeUrl: video.youtubeUrl ?? null,
        problemDate: video.problemDate ? video.problemDate.slice(0, 10) : null,
        problemDateSet: true,
        whatsappEnabled: video.whatsappEnabled ?? true,
      })
      setVideo(updated)
      toast('Video saved.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    } finally {
      setSavingMeta(false)
    }
  }

  async function loadWaPreview(type: string) {
    try {
      const res = await api.content.leetcode.whatsapp.preview(id, type)
      setWaPreviews((prev) => ({ ...prev, [type]: res.message }))
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Preview failed', 'error')
    }
  }

  async function sendWa(type: string) {
    setWaSending(type)
    try {
      const res = await api.content.leetcode.whatsapp.send(id, type)
      if (res.skip) {
        toast(res.skipReason || 'Skipped', 'error')
      } else {
        toast('Message sent.', 'success')
        await reload()
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Send failed', 'error')
    } finally {
      setWaSending(null)
    }
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
          <h2>Video details</h2>
          <form className="form-grid" onSubmit={saveMetadata}>
            <label>
              Title
              <input value={video.title} onChange={(e) => patchVideo({ title: e.target.value })} required />
            </label>
            <label>
              Status
              <select value={video.status} onChange={(e) => patchVideo({ status: e.target.value as LeetcodeVideo['status'] })}>
                <option value="draft">draft</option>
                <option value="scheduled">scheduled</option>
                <option value="published">published</option>
              </select>
            </label>
            <label>
              Series #
              <input
                type="number"
                min={1}
                value={video.seriesNumber ?? ''}
                onChange={(e) => patchVideo({ seriesNumber: Number(e.target.value) || null })}
              />
            </label>
            <label>
              Track name
              <input value={video.trackName ?? ''} onChange={(e) => patchVideo({ trackName: e.target.value })} />
            </label>
            <label>
              Problem title
              <input value={video.problemTitle ?? ''} onChange={(e) => patchVideo({ problemTitle: e.target.value })} />
            </label>
            <label>
              LeetCode problem #
              <input
                type="number"
                min={1}
                value={video.leetcodeProblemNumber ?? ''}
                onChange={(e) => patchVideo({ leetcodeProblemNumber: Number(e.target.value) || null })}
              />
            </label>
            <label>
              Slug
              <input value={video.leetcodeSlug ?? ''} onChange={(e) => patchVideo({ leetcodeSlug: e.target.value })} />
            </label>
            <label>
              Study plan slug
              <input value={video.studyPlanSlug ?? ''} onChange={(e) => patchVideo({ studyPlanSlug: e.target.value })} />
            </label>
            <label>
              Difficulty
              <select value={video.difficulty ?? ''} onChange={(e) => patchVideo({ difficulty: e.target.value || null })}>
                <option value="">—</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <label>
              Problem date
              <input
                type="date"
                value={video.problemDate ? video.problemDate.slice(0, 10) : ''}
                onChange={(e) => patchVideo({ problemDate: e.target.value || null })}
              />
            </label>
            <label>
              YouTube URL
              <input value={video.youtubeUrl ?? ''} onChange={(e) => patchVideo({ youtubeUrl: e.target.value })} />
            </label>
            <label>
              LeetCode problem URL
              <input
                value={video.leetcodeProblemUrl ?? ''}
                onChange={(e) => patchVideo({ leetcodeProblemUrl: e.target.value })}
              />
            </label>
            <label>
              Submission URL
              <input
                value={video.leetcodeSubmissionUrl ?? ''}
                onChange={(e) => patchVideo({ leetcodeSubmissionUrl: e.target.value })}
              />
            </label>
            <label className="full-width">
              Short description
              <textarea
                rows={3}
                value={video.shortDescription ?? ''}
                onChange={(e) => patchVideo({ shortDescription: e.target.value })}
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={video.whatsappEnabled ?? true}
                onChange={(e) => patchVideo({ whatsappEnabled: e.target.checked })}
              />
              WhatsApp enabled for this video
            </label>
            <div className="form-actions">
              <button type="submit" className="btn primary" disabled={savingMeta}>
                {savingMeta ? 'Saving…' : 'Save video'}
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <h2>WhatsApp</h2>
          <p className="muted small">
            Sent: problem {formatSent(video.whatsappProblemSentAt)} · discussion{' '}
            {formatSent(video.whatsappDiscussionSentAt)} · solution {formatSent(video.whatsappSolutionSentAt)}
          </p>
          <div className="stack">
            {waTypes.map(({ type, label }) => (
              <article key={type} className="card compact">
                <div className="row-actions">
                  <strong>{label}</strong>
                  <button type="button" className="btn small" onClick={() => loadWaPreview(type)}>
                    Preview
                  </button>
                  <button
                    type="button"
                    className="btn small primary"
                    disabled={waSending === type}
                    onClick={() => sendWa(type)}
                  >
                    {waSending === type ? 'Sending…' : 'Send now'}
                  </button>
                </div>
                {waPreviews[type] && (
                  <pre className="wa-preview">{waPreviews[type]}</pre>
                )}
              </article>
            ))}
          </div>
        </section>

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

function formatSent(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
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
