import { create } from 'zustand'

interface CartItem {
  id: string
  productId: string
  productName: string
  price: number
  quantity: number
  configData: Record<string, any>
  image?: string
}

interface CartState {
  items: CartItem[]
  totalAmount: number
  totalQuantity: number
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  totalAmount: 0,
  totalQuantity: 0,
  
  addItem: (item) => {
    const { items } = get()
    const existingItem = items.find(i => 
      i.productId === item.productId && 
      JSON.stringify(i.configData) === JSON.stringify(item.configData)
    )
    
    if (existingItem) {
      const updatedItems = items.map(i =>
        i.id === existingItem.id 
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      )
      set({ items: updatedItems })
    } else {
      const newItem = { ...item, id: Date.now().toString() }
      set({ items: [...items, newItem] })
    }
    
    const totalAmount = get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const totalQuantity = get().items.reduce((sum, item) => sum + item.quantity, 0)
    set({ totalAmount, totalQuantity })
  },
  
  removeItem: (productId: string, configData?: Record<string, any>) => {
    const { items } = get()
    const updatedItems = items.filter(i => 
      !(i.productId === productId && JSON.stringify(i.configData) === JSON.stringify(configData))
    )
    set({ items: updatedItems })
    const totalAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
    set({ totalAmount, totalQuantity })
  },
  
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id)
      return
    }
    
    const { items } = get()
    const updatedItems = items.map(i =>
      i.id === id ? { ...i, quantity } : i
    )
    set({ items: updatedItems })
    const totalAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
    set({ totalAmount, totalQuantity })
  },
  
  clearCart: () => {
    set({ items: [], totalAmount: 0, totalQuantity: 0 })
  },
  
  updateTotals: () => {
    const { items } = get()
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    set({ totalAmount, totalQuantity })
  },
}))