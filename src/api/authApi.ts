import axios from 'axios'
import type { GoogleAuthUrlResponse, AuthResponse } from '../types/auth'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const authApi = {
  // Google認証URLを取得
  getGoogleAuthUrl: async (): Promise<GoogleAuthUrlResponse> => {
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
}