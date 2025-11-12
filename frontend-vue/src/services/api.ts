import axios from 'axios'

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers = { ...config.headers, Authorization: `Token ${token}` }
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err)
)

export const login = (payload: { username: string; password: string }) => api.post('/auth/login', payload)
export const register = (payload: { username: string; password: string; email?: string; first_name?: string; last_name?: string; phone?: string }) => api.post('/auth/register', payload)

export const getOrders = (params?: any) => api.get('/orders/', { params })
export const getOrderById = (id: string) => api.get(`/orders/${id}/`)

export default api
