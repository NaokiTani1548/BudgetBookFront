import client from './client'

export interface OcrItem {
  description: string
  amount: number
  expenseDate: string
  paymentMethod: string
}

export interface OcrResponse {
  items: OcrItem[]
}

export const ocrApi = {
  analyze: async (image: File): Promise<OcrResponse> => {
    const formData = new FormData()
    formData.append('image', image)

    const response = await client.post<OcrResponse>('/api/ocr/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30秒タイムアウト
    })
    return response.data
  },
}