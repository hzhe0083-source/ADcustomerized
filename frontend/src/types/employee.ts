export interface Employee {
  id: string
  name: string
  employeeCode: string
  department: string
  position: string
  phone: string
  email: string
  hireDate: string
  status: 'active' | 'inactive' | 'on_leave'
  salary?: number
  emergencyContact?: string
  emergencyPhone?: string
  address?: string
  createdAt: string
  updatedAt: string
  notes?: string
}

export interface EmployeeFormData {
  name: string
  employeeCode: string
  department: string
  position: string
  phone: string
  email: string
  hireDate: string
  status: 'active' | 'inactive' | 'on_leave'
  salary?: number
  emergencyContact?: string
  emergencyPhone?: string
  address?: string
  notes?: string
}