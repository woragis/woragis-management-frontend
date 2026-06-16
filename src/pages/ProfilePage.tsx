import { type FormEvent, useEffect, useState } from 'react'
import { ImagePicker } from '../components/ImagePicker'
import { MarkdownField } from '../components/MarkdownPreview'
import { api } from '../api/client'
import type { Profile, SocialLink } from '../api/types'
import { useToast } from '../context/ToastContext'

export function ProfilePage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const [socialType, setSocialType] = useState('github')
  const [socialUrl, setSocialUrl] = useState('')
  const [bio, setBio] = useState('')
  const [avatarId, setAvatarId] = useState<string | null>(null)
  const [resumeAssetId, setResumeAssetId] = useState<string | null>(null)

  useEffect(() => {
    api.profile
      .get()
      .then((p) => {
        setProfile(p)
        setBio(p.bio)
        setAvatarId(p.avatarId)
        setResumeAssetId(p.resumeAssetId)
      })
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
  }, [toast])

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    try {
      const updated = await api.profile.update({
        displayName: String(fd.get('displayName')),
        headline: String(fd.get('headline')),
        bio,
        location: String(fd.get('location')),
        availability: String(fd.get('availability')),
        avatarId,
        resumeAssetId,
        socialLinks: profile.socialLinks ?? [],
      })
      setProfile(updated)
      toast('Profile saved.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  function addSocial(e: FormEvent) {
    e.preventDefault()
    if (!profile || !socialUrl.trim()) return
    const links: SocialLink[] = [
      ...(profile.socialLinks ?? []),
      { type: socialType, url: socialUrl.trim() },
    ]
    setProfile({ ...profile, socialLinks: links })
    setSocialUrl('')
  }

  if (!profile) return <div className="page"><p className="muted">Loading…</p></div>

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Profile</h1>
          <p className="muted">Landing page hero and about section.</p>
        </div>
      </header>

      <form className="card form-grid" onSubmit={save}>
        <label>
          Display name
          <input name="displayName" defaultValue={profile.displayName} required />
        </label>
        <label>
          Availability
          <select name="availability" defaultValue={profile.availability}>
            <option value="open_to_work">open_to_work</option>
            <option value="freelancing">freelancing</option>
            <option value="not_available">not_available</option>
          </select>
        </label>
        <label className="full">
          Headline
          <input name="headline" defaultValue={profile.headline} />
        </label>
        <MarkdownField label="Bio (markdown)" value={bio} onChange={setBio} rows={6} />
        <label>
          Location
          <input name="location" defaultValue={profile.location} />
        </label>
        <ImagePicker label="Avatar" value={avatarId} onChange={setAvatarId} />
        <ImagePicker label="Resume (PDF)" value={resumeAssetId} onChange={setResumeAssetId} />
        <div className="form-actions full">
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>

      <section className="card stack-section">
        <h2>Social links</h2>
        <form className="form-grid inline-add" onSubmit={addSocial}>
          <label>
            Type
            <select value={socialType} onChange={(e) => setSocialType(e.target.value)}>
              <option value="github">github</option>
              <option value="linkedin">linkedin</option>
              <option value="twitter">twitter</option>
              <option value="email">email</option>
              <option value="website">website</option>
            </select>
          </label>
          <label className="span-2">
            URL
            <input value={socialUrl} onChange={(e) => setSocialUrl(e.target.value)} />
          </label>
          <button type="submit" className="btn">Add</button>
        </form>
        <ul className="item-list">
          {(profile.socialLinks ?? []).map((s, i) => (
            <li key={`${s.type}-${i}`}>
              <span><strong>{s.type}</strong> — {s.url}</span>
              <button
                type="button"
                className="btn small danger"
                onClick={() => {
                  const links = [...(profile.socialLinks ?? [])]
                  links.splice(i, 1)
                  setProfile({ ...profile, socialLinks: links })
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <p className="muted small">Save profile after editing social links.</p>
      </section>
    </div>
  )
}
