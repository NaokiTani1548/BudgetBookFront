import client from './client'
import { config } from '../config'
import { mockOcrApi } from './mockApi'

export interface OcrItem {
  description: string
  amount: number
  expenseDate: string
  paymentMethod: string
}

export interface OcrResponse {
  items: OcrItem[]
}

const realApi = {
  analyze: async (image: File): Promise<OcrResponse> => {
    const formData = new FormData()
    formData.append('image', image)

    const response = await client.post<OcrResponse>('/ocr/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    })
    return response.data
  },
}

export const ocrApi = config.isMockMode ? mockOcrApi : realApi
