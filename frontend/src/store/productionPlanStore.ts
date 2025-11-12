import { create } from 'zustand'
import { ProductionPlan } from '../types'

interface ProductionPlanState {
  productionPlans: ProductionPlan[]
  loading: boolean
  setProductionPlans: (plans: ProductionPlan[]) => void
  addProductionPlan: (plan: ProductionPlan) => void
  updateProductionPlan: (id: string, plan: Partial<ProductionPlan>) => void
  deleteProductionPlan: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useProductionPlanStore = create<ProductionPlanState>((set) => ({
  productionPlans: [],
  loading: false,
  setProductionPlans: (plans) => set({ productionPlans: plans }),
  addProductionPlan: (plan) => set((state) => ({ 
    productionPlans: [...state.productionPlans, plan] 
  })),
  updateProductionPlan: (id, plan) => set((state) => ({
    productionPlans: state.productionPlans.map((p) => 
      p.id === id ? { ...p, ...plan } : p
    )
  })),
  deleteProductionPlan: (id) => set((state) => ({
    productionPlans: state.productionPlans.filter((p) => p.id !== id)
  })),
  setLoading: (loading) => set({ loading })
}))