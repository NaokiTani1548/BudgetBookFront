import { useState, useCallback, type ReactNode } from 'react'
import { AuthContext, TOKEN_KEY, USER_KEY } from './AuthContext'
import type { AuthUser } from '../types/auth'
import { isTokenExpired } from '../utils/authUtils'

// 初期状態を取得する関数（コンポーネント外で実行）
function getInitialAuthState(): { token: string | null; user: AuthUser | null } {
  const storedToken = localStorage.getItem(TOKEN_KEY)
  const storedUser = localStorage.getItem(USER_KEY)

  if (storedToken && storedUser) {
    if (isTokenExpired(storedToken)) {
      // トークン期限切れ
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
  // useState の初期値として関数を渡す（遅延初期化）
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
        isLoading: false, // 同期的に初期化するのでloadingは不要
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}