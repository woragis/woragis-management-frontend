import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, getAdminKey, getApiBase, setAdminKey, setApiBase } from '../api/client'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type AuthContextValue = {
  adminKey: string
  apiBase: string
  status: AuthStatus
  isAuthenticated: boolean
  isEnvConfigured: boolean
  bootstrapError: string | null
  login: (apiBase: string, adminKey: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const envAdminKey = import.meta.env.VITE_ADMIN_API_KEY ?? ''

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adminKey, setKey] = useState('')
  const [apiBase, setBase] = useState('')
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const key = envAdminKey || getAdminKey()
      const base = getApiBase()

      if (!key) {
        if (!cancelled) setStatus('unauthenticated')
        return
      }

      setAdminKey(key)
      setApiBase(base)
      setKey(key)
      setBase(base)

      try {
        await api.profile.get()
        if (!cancelled) {
          setBootstrapError(null)
          setStatus('authenticated')
        }
      } catch (err) {
        if (cancelled) return
        if (!envAdminKey) {
          setAdminKey('')
          setKey('')
        }
        setBootstrapError(err instanceof Error ? err.message : 'Falha ao conectar na API')
        setStatus('unauthenticated')
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      adminKey,
      apiBase,
      status,
      isAuthenticated: status === 'authenticated',
      isEnvConfigured: Boolean(envAdminKey),
      bootstrapError,
      login: async (base, key) => {
        setApiBase(base)
        setAdminKey(key)
        setBase(base)
        setKey(key)
        await api.profile.get()
        setBootstrapError(null)
        setStatus('authenticated')
      },
      logout: () => {
        if (envAdminKey) return
        setAdminKey('')
        setKey('')
        setStatus('unauthenticated')
      },
    }),
    [adminKey, apiBase, bootstrapError, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
