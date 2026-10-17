import client from './client'
import { config } from '../config'
import { mockSummaryApi } from './mockApi'
import type { ForecastSummary } from '../types/summary'

const realApi = {
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

export const summaryApi = config.isMockMode ? mockSummaryApi : realApi
