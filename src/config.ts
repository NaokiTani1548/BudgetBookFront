export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  isMockMode: import.meta.env.VITE_MOCK_MODE === 'true',
}