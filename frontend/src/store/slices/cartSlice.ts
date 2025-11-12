import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CartItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  configData: Record<string, any>
  image?: string
}

interface CartState {
  items: CartItem[]
  totalAmount: number
  totalQuantity: number
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  totalQuantity: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{
      productId: string
      productName: string
      quantity: number
      price: number
      configData: Record<string, any>
      image?: string
    }>) => {
      const { productId, productName, quantity, price, configData, image } = action.payload
      
      // 检查是否已存在相同配置的商品
      const existingItem = state.items.find(item => 
        item.productId === productId && 
        JSON.stringify(item.configData) === JSON.stringify(configData)
      )
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        state.items.push({
          id: Date.now().toString(),
          productId,
          productName,
          quantity,
          price,
          configData,
          image,
        })
      }
      
      // 更新总计
      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0)
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0)
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    },
    
    updateQuantity: (state, action: PayloadAction<{id: string, quantity: number}>) => {
      const { id, quantity } = action.payload
      const item = state.items.find(item => item.id === id)
      
      if (item && quantity > 0) {
        item.quantity = quantity
        state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0)
        state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    },
    
    clearCart: (state) => {
      state.items = []
      state.totalAmount = 0
      state.totalQuantity = 0
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer