export interface QualityControl {
  id: string
  controlNumber: string
  productName: string
  productCode: string
  batchNumber: string
  productionDate: string
  inspector: string
  inspectionDate: string
  inspectionType: 'incoming' | 'in_process' | 'final' | 'random'
  status: 'pending' | 'passed' | 'failed' | 'rework'
  criteria: QualityCriteria[]
  results: InspectionResult[]
  overallResult: 'pass' | 'fail' | 'conditional'
  notes?: string
  correctiveActions?: string[]
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

export interface QualityCriteria {
  id: string
  item: string
  standard: string
  method: string
  tolerance?: string
  weight: number
  isCritical: boolean
}

export interface InspectionResult {
  criteriaId: string
  criteriaName: string
  result: 'pass' | 'fail' | 'conditional'
  measuredValue?: string
  comments?: string
}

export interface QualityControlFormData {
  productName: string
  productCode: string
  batchNumber: string
  productionDate: string
  inspector: string
  inspectionDate: string
  inspectionType: 'incoming' | 'in_process' | 'final' | 'random'
  criteria: QualityCriteria[]
  notes?: string
}