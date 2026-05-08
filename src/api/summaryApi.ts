import axios from 'axios'
import type { ForecastSummary } from '../types/summary'

const USER_ID = '11111111-1111-1111-1111-111111111111'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': USER_ID,
  },
})

export const summaryApi = {
  getForecast: async (targetDate: string): Promise<ForecastSummary> => {
    const response = await api.get('/summary/forecast', {
      params: { targetDate },
    })
    return response.data
  },

  // 現在の残高を取得（今日の日付でforecastを取得）
  getCurrentBalance: async (): Promise<ForecastSummary> => {
    const today = new Date().toISOString().split('T')[0]
    const response = await api.get('/summary/forecast', {
      params: { targetDate: today },
    })
    return response.data
  },
}