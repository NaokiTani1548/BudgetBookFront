export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  isMockMode: import.meta.env.VITE_MOCK_MODE === 'true',
  isProduction: import.meta.env.MODE === 'production',
}
