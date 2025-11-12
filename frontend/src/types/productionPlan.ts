export interface ProductionPlan {
  id: string
  planNumber: string
  productName: string
  productCode: string
  quantity: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  startDate: string
  endDate: string
  actualStartDate?: string
  actualEndDate?: string
  productionLine: string
  responsiblePerson: string
  estimatedHours: number
  actualHours?: number
  materials: PlanMaterial[]
  workOrders: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PlanMaterial {
  materialId: string
  materialName: string
  requiredQuantity: number
  availableQuantity: number
  unit: string
  status: 'sufficient' | 'insufficient' | 'ordered'
}

export interface ProductionPlanFormData {
  productName: string
  productCode: string
  quantity: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  startDate: string
  endDate: string
  productionLine: string
  responsiblePerson: string
  estimatedHours: number
  materials: PlanMaterial[]
  notes?: string
}