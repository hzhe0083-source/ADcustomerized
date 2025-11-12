import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getProducts, getProductById } from '@/services/api'

interface Product {
  id: string
  name: string
  category: string
  description: string
  basePrice: number
  isActive: boolean
  images: string[]
  configs: ProductConfig[]
  stock?: number
  details?: string
  features?: string[]
}

interface ProductConfig {
  id: string
  configType: string
  configName: string
  options: ConfigOption[]
}

interface ConfigOption {
  id: string
  name: string
  price: number
  isDefault?: boolean
}

interface ProductState {
  products: Product[]
  currentProduct: Product | null
  categories: string[]
  isLoading: boolean
  error: string | null
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  categories: ['UV卷材', '喷绘布', '车贴', '灯箱片', 'KT板'],
  isLoading: false,
  error: null,
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ category }: { category?: string }) => {
    const response = await getProducts({ category })
    return response
  }
)

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: string) => {
    const response = await getProductById(id)
    return response
  }
)

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload.data || action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || '获取产品列表失败'
      })
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentProduct = action.payload.data || action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || '获取产品详情失败'
      })
  },
})

export const { clearCurrentProduct } = productSlice.actions
export default productSlice.reducer