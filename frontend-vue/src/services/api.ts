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

// 客户相关
export const getCustomers = (params?: any) => api.get('/customers/', { params })
export const getCustomerById = (id: string) => api.get(`/customers/${id}/`)

// 商城相关
export const getProducts = (params?: any) => api.get('/products', { params })
export const getProductById = (id: string) => api.get(`/products/${id}/`)
export const quotePrice = (payload: any) => api.post('/pricing/quote', payload)
export const uploadFile = (file: File, dir: string = 'orders') => {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('dir', dir)
  return api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const createOrder = (payload: any) => api.post('/orders/', payload)

// 商户公开信息
export const getMerchantPublic = (slug: string) => api.get(`/auth/merchant/public/${slug}`)

export default api
