import { Navigate } from 'react-router-dom'

/** @deprecated Use Messaging → Templates with programSlug=leetcode */
export function LeetcodeWhatsappTemplatesPage() {
  return <Navigate to="/messaging/templates?programSlug=leetcode" replace />
}
