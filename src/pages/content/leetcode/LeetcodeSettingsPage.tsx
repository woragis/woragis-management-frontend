import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { api } from '../../../api/client'
import type { LeetcodeChannelSettings } from '../../../api/types'
import { useToast } from '../../../context/ToastContext'

const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function LeetcodeSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<LeetcodeChannelSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    const row = await api.content.leetcode.settings.get()
    setSettings(row)
  }, [])

  useEffect(() => {
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [reload, toast])

  async function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    try {
      const updated = await api.content.leetcode.settings.update({
        timezone: settings.timezone,
        problemPostTime: settings.problemPostTime,
        discussionPostTime: settings.discussionPostTime,
        solutionPostTime: settings.solutionPostTime,
        weeklySummaryDay: settings.weeklySummaryDay,
        weeklySummaryTime: settings.weeklySummaryTime,
        discussionEnabled: settings.discussionEnabled,
        inviteLink: settings.inviteLink || null,
        defaultStudyPlanSlug: settings.defaultStudyPlanSlug || null,
        nextTheme: settings.nextTheme || null,
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
  if (!settings) return <p className="muted">Settings not found.</p>

  return (
    <section className="card">
      <h2>Channel settings</h2>
      <p className="muted small">Fixed post times used by the WhatsApp worker scheduler.</p>
      <form className="form-grid" onSubmit={onSave}>
        <label>
          Timezone
          <input
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
          />
        </label>
        <label>
          Problem post time
          <input
            type="time"
            value={settings.problemPostTime}
            onChange={(e) => setSettings({ ...settings, problemPostTime: e.target.value })}
          />
        </label>
        <label>
          Discussion post time
          <input
            type="time"
            value={settings.discussionPostTime}
            onChange={(e) => setSettings({ ...settings, discussionPostTime: e.target.value })}
          />
        </label>
        <label>
          Solution post time
          <input
            type="time"
            value={settings.solutionPostTime}
            onChange={(e) => setSettings({ ...settings, solutionPostTime: e.target.value })}
          />
        </label>
        <label>
          Weekly summary day
          <select
            value={settings.weeklySummaryDay}
            onChange={(e) => setSettings({ ...settings, weeklySummaryDay: e.target.value })}
          >
            {weekdays.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label>
          Weekly summary time
          <input
            type="time"
            value={settings.weeklySummaryTime}
            onChange={(e) => setSettings({ ...settings, weeklySummaryTime: e.target.value })}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={settings.discussionEnabled}
            onChange={(e) => setSettings({ ...settings, discussionEnabled: e.target.checked })}
          />
          Discussion nudge enabled
        </label>
        <label>
          Group invite link
          <input
            value={settings.inviteLink ?? ''}
            onChange={(e) => setSettings({ ...settings, inviteLink: e.target.value })}
            placeholder="https://chat.whatsapp.com/..."
          />
        </label>
        <label>
          Default study plan slug
          <input
            value={settings.defaultStudyPlanSlug ?? ''}
            onChange={(e) => setSettings({ ...settings, defaultStudyPlanSlug: e.target.value })}
          />
        </label>
        <label>
          Next week theme
          <input
            value={settings.nextTheme ?? ''}
            onChange={(e) => setSettings({ ...settings, nextTheme: e.target.value })}
          />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </section>
  )
}
