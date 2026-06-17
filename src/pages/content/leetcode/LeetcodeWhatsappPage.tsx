import { useCallback, useEffect, useState } from 'react'
import { api } from '../../../api/client'
import type { WhatsappWorkerStatus } from '../../../api/types'
import { useToast } from '../../../context/ToastContext'

export function LeetcodeWhatsappPage() {
  const { toast } = useToast()
  const [status, setStatus] = useState<WhatsappWorkerStatus | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const st = await api.content.leetcode.whatsapp.status()
    setStatus(st)
    if (!st.connected && st.configured) {
      try {
        const res = await api.content.leetcode.whatsapp.qr()
        setQr(res.qr)
      } catch {
        setQr(null)
      }
    } else {
      setQr(null)
    }
  }, [])

  useEffect(() => {
    reload()
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load', 'error'))
      .finally(() => setLoading(false))
    const timer = window.setInterval(() => {
      reload().catch(() => {})
    }, 5000)
    return () => window.clearInterval(timer)
  }, [reload, toast])

  if (loading) return <p className="muted">Loading…</p>

  return (
    <section className="card">
      <h2>WhatsApp connection</h2>
      {!status?.configured ? (
        <p className="muted">Worker not configured. Set WHATSAPP_WORKER_URL on the API.</p>
      ) : (
        <>
          <p>
            Status:{' '}
            <strong className={status.connected ? 'success' : 'warning'}>
              {status.connected ? 'Connected' : 'Disconnected'}
            </strong>
          </p>
          {!status.connected && qr ? (
            <div className="stack">
              <p className="muted small">Scan with WhatsApp → Linked devices</p>
              <img src={qr} alt="WhatsApp QR code" className="qr-preview" style={{ maxWidth: 280 }} />
            </div>
          ) : !status.connected ? (
            <p className="muted">Waiting for QR code from worker…</p>
          ) : (
            <p className="muted">Session active. Messages will be sent on schedule.</p>
          )}
        </>
      )}
    </section>
  )
}
