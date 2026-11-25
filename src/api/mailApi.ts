import client from './client'
import { config } from '../config'
import { mockMailApi } from './mockApi'
import type { OcrResponse } from './ocrApi'

export interface MicrosoftAuthUrlResponse {
  url: string
}

const realApi = {
  /** Microsoft連携用の認可URLを取得（stateは10分で失効するため毎回取得する） */
  getMicrosoftAuthUrl: async (): Promise<MicrosoftAuthUrlResponse> => {
    const response = await client.get<MicrosoftAuthUrlResponse>('/microsoft/auth/url')
    return response.data
  },

  /** 三井住友カードご利用通知メールから支出候補を取得（レスポンスはOCRと同形式） */
  getSmbcUsages: async (start: string, end: string): Promise<OcrResponse> => {
    const response = await client.get<OcrResponse>('/mail/smbc-usages', {
      params: { start, end },
      // Renderのスリープ明けで時間がかかることがある
      timeout: 90000,
    })
    return response.data
  },
}

export const mailApi = config.isMockMode ? mockMailApi : realApi
