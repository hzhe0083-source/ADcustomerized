import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import Orders from '../views/Orders.vue'
import { useAuthStore } from '../stores/auth'
import Customers from '../views/Customers.vue'
import Employees from '../views/Employees.vue'
import Materials from '../views/Materials.vue'
import ProductionPlans from '../views/ProductionPlans.vue'
import Quality from '../views/Quality.vue'
import Reports from '../views/Reports.vue'
import Equipment from '../views/Equipment.vue'
import Products from '../views/Products.vue'

const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/', component: Home },
  { path: '/orders', component: Orders, meta: { requiresAuth: true } },
  { path: '/customers', component: Customers, meta: { requiresAuth: true } },
  { path: '/employees', component: Employees, meta: { requiresAuth: true } },
  { path: '/materials', component: Materials, meta: { requiresAuth: true } },
  { path: '/plans', component: ProductionPlans, meta: { requiresAuth: true } },
  { path: '/quality', component: Quality, meta: { requiresAuth: true } },
  { path: '/reports', component: Reports, meta: { requiresAuth: true } },
  { path: '/equipment', component: Equipment, meta: { requiresAuth: true } },
  { path: '/products', component: Products },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta?.requiresAuth && !auth.isAuthenticated) return '/login'
  return true
})

export default router
