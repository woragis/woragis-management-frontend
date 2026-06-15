import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { getAdminKey, getApiBase, setAdminKey, setApiBase } from '../api/client'

type AuthContextValue = {
  adminKey: string
  apiBase: string
  isAuthenticated: boolean
  login: (apiBase: string, adminKey: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adminKey, setKey] = useState(getAdminKey)
  const [apiBase, setBase] = useState(getApiBase)

  const value = useMemo<AuthContextValue>(
    () => ({
      adminKey,
      apiBase,
      isAuthenticated: adminKey.length > 0,
      login: (base, key) => {
        setApiBase(base)
        setAdminKey(key)
        setBase(base)
        setKey(key)
      },
      logout: () => {
        setAdminKey('')
        setKey('')
      },
    }),
    [adminKey, apiBase],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
