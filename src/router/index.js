import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import adminRoutes from './admin'
import managerRoutes from './manager'
import customerRoutes from './customer'

const routes = [...customerRoutes, ...adminRoutes, ...managerRoutes]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated && !authStore.user) {
    authStore.loadUser()
  }

  const isAuthenticated = authStore.isAuthenticated
  const hasStaffAccess = authStore.canManageProductsOrders

  if (to.meta.requireGuest && isAuthenticated) {
    if (hasStaffAccess) {
      return '/admin/dashboard'
    }
    // Clear stale or non-staff session so /admin/login can be accessed without a redirect loop
    authStore.clearSession()
    return true
  }

  if (to.meta.requireAuth && !isAuthenticated) {
    return '/admin/login'
  }

  const allowedRoles = to.meta.roles
  if (allowedRoles && allowedRoles.length > 0) {
    if (!authStore.isAuthenticated) {
      return '/admin/login'
    }

    const userRoles = authStore.userRoles || []
    const allowed = allowedRoles.some((role) => userRoles.includes(role.toLowerCase()))

    if (!allowed) {
      if (hasStaffAccess && to.path !== '/admin/dashboard') {
        return '/admin/dashboard'
      }
      authStore.clearSession()
      return '/admin/login'
    }
  }

  return true
})

export default router
