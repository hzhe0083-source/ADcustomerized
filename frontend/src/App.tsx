import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import OrderConfirmPage from './pages/OrderConfirmPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import OrderListPage from './pages/OrderListPage'
import OrderDetailPage from './pages/OrderDetailPage'
import WorkOrderListPage from './pages/WorkOrderListPage'
import WorkOrderDetailPage from './pages/WorkOrderDetailPage'
import EquipmentPage from './pages/EquipmentPage'
import EquipmentDetailPage from './pages/EquipmentDetailPage'
import CustomerPage from './pages/CustomerPage'
import EmployeePage from './pages/EmployeePage'
import SupplierPage from './pages/SupplierPage'
import MaterialPage from './pages/MaterialPage'
import ProductionPlanPage from './pages/ProductionPlanPage'
import QualityControlPage from './pages/QualityControlPage'
import ReportPage from './pages/ReportPage'
import './App.css'

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="product/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="order/confirm" element={<OrderConfirmPage />} />
          <Route path="order/success/:orderId" element={<OrderSuccessPage />} />
          <Route path="order/list" element={<OrderListPage />} />
          <Route path="order/detail/:orderId" element={<OrderDetailPage />} />
          <Route path="work-orders" element={<WorkOrderListPage />} />
          <Route path="work-order/detail/:workOrderId" element={<WorkOrderDetailPage />} />
            <Route path="equipment" element={<EquipmentPage />} />
            <Route path="equipment/detail/:equipmentId" element={<EquipmentDetailPage />} />
            <Route path="customers" element={<CustomerPage />} />
            <Route path="employees" element={<EmployeePage />} />
            <Route path="suppliers" element={<SupplierPage />} />
            <Route path="materials" element={<MaterialPage />} />
            <Route path="production-plans" element={<ProductionPlanPage />} />
            <Route path="quality-control" element={<QualityControlPage />} />
            <Route path="reports" element={<ReportPage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App