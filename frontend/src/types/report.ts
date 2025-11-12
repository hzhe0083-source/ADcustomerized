export interface Report {
  id: string
  reportNumber: string
  title: string
  type: 'production' | 'quality' | 'inventory' | 'sales' | 'financial' | 'employee' | 'equipment'
  description: string
  startDate: string
  endDate: string
  data: Record<string, any>
  summary: {
    totalRecords: number
    totalAmount?: number
    averageValue?: number
    maxValue?: number
    minValue?: number
    successRate?: number
    failureRate?: number
  }
  status: 'draft' | 'generated' | 'approved' | 'published'
  generatedBy: string
  approvedBy?: string
  generatedAt: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ReportFormData {
  title: string
  type: Report['type']
  description: string
  startDate: string
  endDate: string
  generatedBy: string
}

export interface ReportFilter {
  type?: Report['type']
  status?: Report['status']
  startDate?: string
  endDate?: string
  generatedBy?: string
}