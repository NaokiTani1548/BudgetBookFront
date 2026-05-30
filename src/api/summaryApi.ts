import client from './client'
import type { ForecastSummary } from '../types/summary'

export const summaryApi = {
  getForecast: async (targetDate: string): Promise<ForecastSummary> => {
    const response = await client.get('/summary/forecast', {
      params: { targetDate },
    })
    return response.data
  },

  getCurrentBalance: async (): Promise<ForecastSummary> => {
    const today = new Date().toISOString().split('T')[0]
    const response = await client.get('/summary/forecast', {
      params: { targetDate: today },
    })
    return response.data
  },
}