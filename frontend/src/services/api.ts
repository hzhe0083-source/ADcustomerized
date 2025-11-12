import axios from 'axios'

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 用户认证相关
export const login = async (credentials: { username: string; password: string }) => {
  return api.post('/auth/login', credentials)
}

export const register = async (userData: {
  name: string
  username: string
  email: string
  phone: string
  password: string
}) => {
  return api.post('/auth/register', userData)
}

// 产品相关
export const getProducts = async (params?: {
  category?: string
  page?: number
  pageSize?: number
}) => {
  return api.get('/products', { params })
}

export const getProductById = async (id: string) => {
  return api.get(`/products/${id}`)
}

// 订单相关
export const createOrder = async (orderData: {
  customerName: string
  phone: string
  email: string
  address: string
  deliveryMethod: string
  deliveryDate: string
  notes?: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
    configs: Record<string, any>
  }>
  totalAmount: number
}) => {
  return api.post('/orders', orderData)
}

export const getOrders = async (params?: {
  userId?: string
  status?: string
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
  searchText?: string
}) => {
  return api.get('/orders', { params })
}

export const getOrderById = async (id: string) => {
  return api.get(`/orders/${id}`)
}

export const getWorkOrderById = async (id: string) => {
  return api.get(`/work-orders/${id}`)
}

export const updateOrderStatus = async (id: string, status: string) => {
  return api.patch(`/orders/${id}/status`, { status })
}

// 工作订单相关
export const getWorkOrders = async (params?: {
  status?: string
  page?: number
  pageSize?: number
}) => {
  return api.get('/work-orders', { params })
}

export const updateWorkOrderStatus = async (id: string, status: string) => {
  return api.patch(`/work-orders/${id}/status`, { status })
}

// 设备管理相关API
export const getEquipment = async (params?: any) => {
  return api.get('/equipment', { params })
}

export const getEquipmentById = async (equipmentId: string) => {
  return api.get(`/equipment/${equipmentId}`)
}

export const getEquipmentStatus = async () => {
  return api.get('/equipment/status')
}

export const updateEquipmentStatus = async (equipmentId: string, status: string) => {
  return api.put(`/equipment/${equipmentId}/status`, { status })
}



export default api