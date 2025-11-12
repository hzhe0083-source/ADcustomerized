import { create } from 'zustand'
import { Supplier } from '../types'

interface SupplierState {
  suppliers: Supplier[]
  loading: boolean
  addSupplier: (supplier: Supplier) => void
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void
  setSuppliers: (suppliers: Supplier[]) => void
  setLoading: (loading: boolean) => void
}

export const useSupplierStore = create<SupplierState>((set) => ({
  suppliers: [],
  loading: false,
  
  addSupplier: (supplier) => set((state) => ({
    suppliers: [...state.suppliers, supplier]
  })),
  
  updateSupplier: (id, updatedSupplier) => set((state) => ({
    suppliers: state.suppliers.map(supplier =>
      supplier.id === id ? { ...supplier, ...updatedSupplier } : supplier
    )
  })),
  
  deleteSupplier: (id) => set((state) => ({
    suppliers: state.suppliers.filter(supplier => supplier.id !== id)
  })),
  
  setSuppliers: (suppliers) => set({ suppliers }),
  
  setLoading: (loading) => set({ loading })
}))