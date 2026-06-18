import { type FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { status, isAuthenticated, isEnvConfigured, bootstrapError, login } = useAuth()
  const [adminKey, setAdminKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (status === 'loading') {
    return (
      <div className="login-page">
        <div className="card login-card">
          <h1>Woragis Management</h1>
          <p className="muted">Conectando à API…</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login('', adminKey)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chave inválida')
      setLoading(false)
    }
  }

  if (isEnvConfigured) {
    return (
      <div className="login-page">
        <div className="card login-card">
          <h1>Woragis Management</h1>
          <p className="error">
            {bootstrapError ?? 'Não foi possível autenticar com as variáveis de ambiente configuradas.'}
          </p>
          <p className="muted">
            Verifique <code>VITE_API_URL</code> e <code>VITE_ADMIN_API_KEY</code> no Vercel e se o backend está
            acessível.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h1>Woragis Management</h1>
        <p className="muted">Ambiente local — informe a chave de admin do backend.</p>
        <label>
          Admin API key
          <input
            type="password"
            required
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            autoComplete="current-password"
            placeholder="Mesma chave do ADMIN_API_KEY do backend"
          />
        </label>
        {(error || bootstrapError) && <p className="error">{error || bootstrapError}</p>}
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
