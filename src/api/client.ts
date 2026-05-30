import axios from 'axios'
import { TOKEN_KEY } from '../contexts/AuthContext'

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// リクエストインターセプター：トークンを自動付与
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// レスポンスインターセプター：401エラー時の処理
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // トークン無効・期限切れ
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('budgetbook_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client