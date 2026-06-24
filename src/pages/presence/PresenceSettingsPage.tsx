import { type FormEvent, useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { ChannelDestination, PresenceSettings } from '../../api/types'
import { useToast } from '../../context/ToastContext'

export function PresenceSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<PresenceSettings | null>(null)
  const [destinations, setDestinations] = useState<ChannelDestination[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      api.presence.settings.get(),
      api.messaging.destinations.list(),
    ])
      .then(([s, d]) => {
        setSettings(s)
        setDestinations(d)
      })
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const destRaw = String(fd.get('defaultDestinationId') || '')
    try {
      const updated = await api.presence.settings.update({
        remindersEnabled: fd.get('remindersEnabled') === 'on',
        defaultDestinationId: destRaw || null,
      })
      setSettings(updated)
      toast('Settings saved.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="muted">Loading…</p>
  if (!settings) return null

  return (
    <section className="card form-grid finance-section">
      <h2>Reminder settings</h2>
      <p className="muted full">
        When a post is scheduled, the scheduler-worker sends a WhatsApp reminder with the full text at the scheduled time.
      </p>
      <form className="full form-grid" onSubmit={onSubmit}>
        <label className="checkbox full">
          <input
            type="checkbox"
            name="remindersEnabled"
            defaultChecked={settings.remindersEnabled}
            key={`rem-${settings.updatedAt}`}
          />
          Enable scheduled post reminders
        </label>
        <label className="full">
          Default WhatsApp destination
          <select
            name="defaultDestinationId"
            defaultValue={settings.defaultDestinationId ?? ''}
            key={`dest-${settings.updatedAt}`}
          >
            <option value="">— select destination —</option>
            {destinations
              .filter((d) => d.active && d.channel === 'whatsapp')
              .map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
          </select>
        </label>
        <div className="form-actions full">
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </section>
  )
}
