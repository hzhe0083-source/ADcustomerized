import { create } from 'zustand'
import { Customer } from '../types'

interface CustomerState {
  customers: Customer[]
  loading: boolean
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, customer: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  setCustomers: (customers: Customer[]) => void
  setLoading: (loading: boolean) => void
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  loading: false,
  
  addCustomer: (customer) => set((state) => ({
    customers: [...state.customers, customer]
  })),
  
  updateCustomer: (id, updatedCustomer) => set((state) => ({
    customers: state.customers.map(customer =>
      customer.id === id ? { ...customer, ...updatedCustomer } : customer
    )
  })),
  
  deleteCustomer: (id) => set((state) => ({
    customers: state.customers.filter(customer => customer.id !== id)
  })),
  
  setCustomers: (customers) => set({ customers }),
  
  setLoading: (loading) => set({ loading })
}))