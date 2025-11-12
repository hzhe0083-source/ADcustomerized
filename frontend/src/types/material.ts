export interface Material {
  id: string
  name: string
  code: string
  category: string
  unit: string
  quantity: number
  minQuantity: number
  maxQuantity: number
  unitPrice: number
  totalValue: number
  supplier: string
  location: string
  shelfLife?: number
  expirationDate?: string
  specifications?: string
  description?: string
  status: 'active' | 'inactive' | 'discontinued'
  createdAt: string
  updatedAt: string
}

export interface MaterialFormData {
  name: string
  code: string
  category: string
  unit: string
  quantity: number
  minQuantity: number
  maxQuantity: number
  unitPrice: number
  supplier: string
  location: string
  shelfLife?: number
  expirationDate?: string
  specifications?: string
  description?: string
  status: 'active' | 'inactive' | 'discontinued'
}