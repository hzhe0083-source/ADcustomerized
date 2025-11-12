import { create } from 'zustand'
import { Employee } from '../types'

interface EmployeeState {
  employees: Employee[]
  loading: boolean
  addEmployee: (employee: Employee) => void
  updateEmployee: (id: string, employee: Partial<Employee>) => void
  deleteEmployee: (id: string) => void
  setEmployees: (employees: Employee[]) => void
  setLoading: (loading: boolean) => void
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: [],
  loading: false,
  
  addEmployee: (employee) => set((state) => ({
    employees: [...state.employees, employee]
  })),
  
  updateEmployee: (id, updatedEmployee) => set((state) => ({
    employees: state.employees.map(employee =>
      employee.id === id ? { ...employee, ...updatedEmployee } : employee
    )
  })),
  
  deleteEmployee: (id) => set((state) => ({
    employees: state.employees.filter(employee => employee.id !== id)
  })),
  
  setEmployees: (employees) => set({ employees }),
  
  setLoading: (loading) => set({ loading })
}))