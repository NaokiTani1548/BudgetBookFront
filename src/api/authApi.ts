import axios from 'axios'
import type { GoogleAuthUrlResponse, AuthResponse } from '../types/auth'
import { config } from '../config'

// モック用のダミーユーザー
const MOCK_USER = {
  token: 'mock-jwt-token-12345',
  userId: 'mock-user-001',
  email: 'mock@example.com',
  name: 'モックユーザー',
}

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const authApi = {
  // Google認証URLを取得
  getGoogleAuthUrl: async (): Promise<GoogleAuthUrlResponse> => {
    if (config.isMockMode) {
        return {
        url: '/auth/callback?mock=true',
        state: 'mock-state',
        }
    }
    const response = await api.get('/auth/google/url')
    return response.data
  },

  // コールバック処理（code と state を送信してJWTを取得）
  handleCallback: async (code: string, state: string): Promise<AuthResponse> => {
    const response = await api.get('/auth/google/callback', {
      params: { code, state },
    })
    return response.data
  },
  mockLogin: () => {
    return MOCK_USER
  },
}