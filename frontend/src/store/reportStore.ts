import { create } from 'zustand'
import { Report } from '../types/report'

interface ReportState {
  reports: Report[]
  loading: boolean
  setReports: (reports: Report[]) => void
  addReport: (report: Report) => void
  updateReport: (id: string, report: Partial<Report>) => void
  deleteReport: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  loading: false,
  setReports: (reports) => set({ reports }),
  addReport: (report) => set((state) => ({ reports: [...state.reports, report] })),
  updateReport: (id, report) => set((state) => ({
    reports: state.reports.map((r) => r.id === id ? { ...r, ...report } : r)
  })),
  deleteReport: (id) => set((state) => ({
    reports: state.reports.filter((report) => report.id !== id)
  })),
  setLoading: (loading) => set({ loading })
}))