import { create } from 'zustand'

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
  type: 'size' | 'material' | 'process' | 'color'
  name: string
  options: ConfigOption[]
}

interface ConfigOption {
  id: string
  name: string
  value: string
  price: number
  image?: string
}

interface ProductState {
  products: Product[]
  categories: string[]
  loading: boolean
  error: string | null
  selectedProduct: Product | null
  selectedConfig: Record<string, string>
  calculatedPrice: number
  
  setProducts: (products: Product[]) => void
  setCategories: (categories: string[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  selectProduct: (product: Product) => void
  setConfig: (configType: string, optionId: string) => void
  calculatePrice: () => void
  clearSelection: () => void
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  categories: [],
  loading: false,
  error: null,
  selectedProduct: null,
  selectedConfig: {},
  calculatedPrice: 0,
  
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  selectProduct: (product) => {
    set({ 
      selectedProduct: product, 
      selectedConfig: {},
      calculatedPrice: product.basePrice 
    })
  },
  
  setConfig: (configType, optionId) => {
    const { selectedConfig } = get()
    const newConfig = { ...selectedConfig, [configType]: optionId }
    set({ selectedConfig: newConfig })
    get().calculatePrice()
  },
  
  calculatePrice: () => {
    const { selectedProduct, selectedConfig } = get()
    if (!selectedProduct) return
    
    let totalPrice = selectedProduct.basePrice
    
    // 根据选择的配置计算价格
    Object.entries(selectedConfig).forEach(([configType, optionId]) => {
      const config = selectedProduct.configs.find(c => c.type === configType)
      const option = config?.options.find(o => o.id === optionId)
      if (option) {
        totalPrice += option.price
      }
    })
    
    set({ calculatedPrice: totalPrice })
  },
  
  clearSelection: () => {
    set({ 
      selectedProduct: null, 
      selectedConfig: {}, 
      calculatedPrice: 0 
    })
  },
}))