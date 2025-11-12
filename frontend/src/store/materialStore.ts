import { create } from 'zustand'
import { Material } from '../types'

interface MaterialState {
  materials: Material[]
  loading: boolean
  setMaterials: (materials: Material[]) => void
  addMaterial: (material: Material) => void
  updateMaterial: (id: string, material: Partial<Material>) => void
  deleteMaterial: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useMaterialStore = create<MaterialState>((set) => ({
  materials: [],
  loading: false,
  setMaterials: (materials) => set({ materials }),
  addMaterial: (material) => set((state) => ({ 
    materials: [...state.materials, material] 
  })),
  updateMaterial: (id, material) => set((state) => ({
    materials: state.materials.map((m) => 
      m.id === id ? { ...m, ...material } : m
    )
  })),
  deleteMaterial: (id) => set((state) => ({
    materials: state.materials.filter((m) => m.id !== id)
  })),
  setLoading: (loading) => set({ loading })
}))