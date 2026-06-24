import { type FormEvent, useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { AgentPersonality } from '../../api/types'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'

export function AgentPersonalityPage() {
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [personality, setPersonality] = useState<AgentPersonality | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    api.agent.personality
      .get()
      .then(setPersonality)
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!personality) return
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    try {
      const updated = await api.agent.personality.update({
        assistantName: String(fd.get('assistantName')),
        greetingMorning: String(fd.get('greetingMorning')),
        greetingAfternoon: String(fd.get('greetingAfternoon')),
        greetingEvening: String(fd.get('greetingEvening')),
        greetingEnabled: fd.get('greetingEnabled') === 'on',
        systemPromptExtra: String(fd.get('systemPromptExtra') || ''),
        voiceId: String(fd.get('voiceId')),
        language: String(fd.get('language')),
        timezone: String(fd.get('timezone')),
      })
      setPersonality(updated)
      toast('Personality saved.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function onReset() {
    if (!(await confirm('Reset agent personality to defaults?'))) return
    setResetting(true)
    try {
      const updated = await api.agent.personality.reset()
      setPersonality(updated)
      toast('Personality reset to defaults.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error')
    } finally {
      setResetting(false)
    }
  }

  if (loading) return <p className="muted">Loading…</p>
  if (!personality) return null

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Agent personality</h1>
          <p className="muted">Configure how the assistant introduces itself and responds.</p>
        </div>
        <button
          type="button"
          className="btn ghost"
          disabled={resetting}
          onClick={onReset}
        >
          {resetting ? 'Resetting…' : 'Reset to defaults'}
        </button>
      </header>

      <form
        className="card form-grid finance-section"
        onSubmit={onSubmit}
        key={personality.updatedAt}
      >
        <label>
          Assistant name
          <input name="assistantName" defaultValue={personality.assistantName} required />
        </label>
        <label>
          Voice ID
          <input name="voiceId" defaultValue={personality.voiceId} />
        </label>
        <label>
          Language
          <input name="language" defaultValue={personality.language} />
        </label>
        <label>
          Timezone
          <input name="timezone" defaultValue={personality.timezone} />
        </label>

        <label className="checkbox full">
          <input
            type="checkbox"
            name="greetingEnabled"
            defaultChecked={personality.greetingEnabled}
          />
          Enable time-based greetings
        </label>

        <label>
          Morning greeting
          <input name="greetingMorning" defaultValue={personality.greetingMorning} />
        </label>
        <label>
          Afternoon greeting
          <input name="greetingAfternoon" defaultValue={personality.greetingAfternoon} />
        </label>
        <label>
          Evening greeting
          <input name="greetingEvening" defaultValue={personality.greetingEvening} />
        </label>

        <label className="full">
          Extra system prompt
          <textarea
            name="systemPromptExtra"
            rows={6}
            defaultValue={personality.systemPromptExtra}
            placeholder="Additional instructions appended to the agent system prompt"
          />
        </label>

        <div className="form-actions full">
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
