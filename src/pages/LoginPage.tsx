import { type FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const [apiBase, setApiBase] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/projects" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    login(apiBase, adminKey)
    try {
      await api.profile.get()
      window.location.href = '/projects'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h1>Woragis Management</h1>
        <p className="muted">Connect to your backend API with the admin key.</p>
        <label>
          API URL
          <input
            type="text"
            placeholder="Leave empty for Vite proxy (dev)"
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
          />
        </label>
        <label>
          Admin API key
          <input
            type="password"
            required
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? 'Connecting…' : 'Connect'}
        </button>
      </form>
    </div>
  )
}
