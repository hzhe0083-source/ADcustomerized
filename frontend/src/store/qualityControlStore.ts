import { create } from 'zustand'
import { QualityControl } from '../types'

interface QualityControlState {
  qualityControls: QualityControl[]
  loading: boolean
  setQualityControls: (controls: QualityControl[]) => void
  addQualityControl: (control: QualityControl) => void
  updateQualityControl: (id: string, control: Partial<QualityControl>) => void
  deleteQualityControl: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useQualityControlStore = create<QualityControlState>((set) => ({
  qualityControls: [],
  loading: false,
  setQualityControls: (controls) => set({ qualityControls: controls }),
  addQualityControl: (control) => set((state) => ({ 
    qualityControls: [...state.qualityControls, control] 
  })),
  updateQualityControl: (id, control) => set((state) => ({
    qualityControls: state.qualityControls.map((c) => 
      c.id === id ? { ...c, ...control } : c
    )
  })),
  deleteQualityControl: (id) => set((state) => ({
    qualityControls: state.qualityControls.filter((c) => c.id !== id)
  })),
  setLoading: (loading) => set({ loading })
}))