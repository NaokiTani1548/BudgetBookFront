import { useState, useCallback, type ReactNode } from 'react'
import { AuthContext, TOKEN_KEY, USER_KEY } from './AuthContext'
import type { AuthUser } from '../types/auth'
import { isTokenExpired } from '../utils/authUtils'
import { config } from '../config'

const DEV_USER: AuthUser = {
  userId: 'dev-user-001',
  email: 'dev@example.com',
  name: '開発ユーザー',
}
const DEV_TOKEN = 'dev-token'

function getInitialAuthState(): { token: string | null; user: AuthUser | null } {
  // 本番以外は自動ログイン
  if (!config.isProduction) {
    return { token: DEV_TOKEN, user: DEV_USER }
  }

  const storedToken = localStorage.getItem(TOKEN_KEY)
  const storedUser = localStorage.getItem(USER_KEY)

  if (storedToken && storedUser) {
    if (isTokenExpired(storedToken)) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      return { token: null, user: null }
    }
    try {
      return { token: storedToken, user: JSON.parse(storedUser) }
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      return { token: null, user: null }
    }
  }

  return { token: null, user: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getInitialAuthState().token)
  const [user, setUser] = useState<AuthUser | null>(() => getInitialAuthState().user)

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading: false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
