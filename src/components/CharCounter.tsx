import { charStatus } from '../lib/presence-utils'

export function CharCounter({ text, limit }: { text: string; limit: number }) {
  const { length, remaining, over } = charStatus(text.length, limit)
  return (
    <p className={`muted small char-counter${over ? ' over-limit' : ''}`}>
      {length} / {limit}
      {!over ? ` (${remaining} left)` : ` (${Math.abs(remaining)} over)`}
    </p>
  )
}
