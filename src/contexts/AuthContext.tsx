import { createContext } from 'react'
import type { AuthUser } from '../types/auth'

export interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const TOKEN_KEY = 'budgetbook_token'
export const USER_KEY = 'budgetbook_user'