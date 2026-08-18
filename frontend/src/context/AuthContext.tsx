import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '@/lib/api'
import type { User } from '@/lib/types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { full_name: string; email: string; password: string; role_id: number }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('edrp_user') || 'null') } catch { return null }
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('edrp_token')
    if (!token) { setIsLoading(false); return }
    api.get('/auth/me')
      .then(({ data }) => { localStorage.setItem('edrp_user', JSON.stringify(data)); setUser(data) })
      .catch(() => { localStorage.removeItem('edrp_token'); localStorage.removeItem('edrp_user'); setUser(null) })
      .finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('edrp_token', data.access_token)
    const me = await api.get('/auth/me')
    localStorage.setItem('edrp_user', JSON.stringify(me.data))
    setUser(me.data)
  }

  async function register(data: { full_name: string; email: string; password: string; role_id: number }) {
    await api.post('/auth/register', data)
  }

  function logout() {
    localStorage.removeItem('edrp_token')
    localStorage.removeItem('edrp_user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
