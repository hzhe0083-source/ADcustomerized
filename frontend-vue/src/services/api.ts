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

// 商贩后台-商品管理
export const listMerchantProducts = (params?: any) => api.get('/merchant/products', { params })
export const createMerchantProduct = (payload: any) => api.post('/merchant/products', payload)
export const updateMerchantProduct = (id: string, payload: any) => api.put(`/merchant/products/${id}`, payload)
export const deleteMerchantProduct = (id: string) => api.delete(`/merchant/products/${id}`)

export const listProductConfigs = (params?: any) => api.get('/merchant/product-configs', { params })
export const createProductConfig = (payload: any) => api.post('/merchant/product-configs', payload)
export const deleteProductConfig = (id: string) => api.delete(`/merchant/product-configs/${id}`)

export const listConfigOptions = (params?: any) => api.get('/merchant/config-options', { params })
export const createConfigOption = (payload: any) => api.post('/merchant/config-options', payload)
export const deleteConfigOption = (id: string) => api.delete(`/merchant/config-options/${id}`)

// 购物车
export const getCart = () => api.get('/cart')
export const addCartItem = (payload: any) => api.post('/cart/items', payload)
export const updateCartItem = (id: string, payload: any) => api.put(`/cart/items/${id}`, payload)
export const deleteCartItem = (id: string) => api.delete(`/cart/items/${id}`)
export const clearCart = () => api.delete('/cart/clear')

// 材料库存
export const getMaterials = (params?: any) => api.get('/materials', { params })

// 员工考勤
export const getAttendance = (params?: any) => api.get('/auth/attendance/', { params })
export const checkIn = (payload?: any) => api.post('/auth/attendance/checkin', payload || {})
export const checkOut = (payload?: any) => api.post('/auth/attendance/checkout', payload || {})

// 拼版与矢量化
export const packNesting = (payload: any) => api.post('/nesting/pack', payload)
export const vectorizeFiles = (formData: FormData) => api.post('/nesting/vectorize', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export default api
