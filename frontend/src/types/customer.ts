export interface Customer {
  id: string
  name: string
  company: string
  phone: string
  email: string
  address: string
  type: 'individual' | 'company'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  notes?: string
  creditLimit?: number
  paymentTerms?: string
}

export interface CustomerFormData {
  name: string
  company: string
  phone: string
  email: string
  address: string
  type: 'individual' | 'company'
  notes?: string
  creditLimit?: number
  paymentTerms?: string
}