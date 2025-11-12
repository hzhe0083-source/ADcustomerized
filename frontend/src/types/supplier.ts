export interface Supplier {
  id: string
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  website?: string
  taxNumber?: string
  bankAccount?: string
  bankName?: string
  type: 'material' | 'equipment' | 'service'
  status: 'active' | 'inactive'
  rating: 1 | 2 | 3 | 4 | 5
  createdAt: string
  updatedAt: string
  notes?: string
  paymentTerms?: string
  deliveryTime?: number // 交货周期（天）
}

export interface SupplierFormData {
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  website?: string
  taxNumber?: string
  bankAccount?: string
  bankName?: string
  type: 'material' | 'equipment' | 'service'
  notes?: string
  paymentTerms?: string
  deliveryTime?: number
}