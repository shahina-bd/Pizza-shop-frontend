import { defineStore } from 'pinia'
import api from '@/utils/axios'

const getStoredAdminUser = () => {
    try {
        const raw = localStorage.getItem('admin_user')
        return raw ? JSON.parse(raw) : null
    } catch {
        localStorage.removeItem('admin_user')
        return null
    }
}

const extractRoles = (user) => {
    if (!user) return []

    const roleSet = new Set()

    if (Array.isArray(user.roles) && user.roles.length) {
        user.roles.forEach((role) => {
            const name = (typeof role === 'string' ? role : role?.name)?.toLowerCase()
            if (name) roleSet.add(name)
        })
    }

    if (user.role_name) {
        roleSet.add(String(user.role_name).toLowerCase())
    }

    if (user.role && String(user.role).toLowerCase() !== 'customer') {
        roleSet.add(String(user.role).toLowerCase())
    }

    // Fallback for seeded default admin account if roles array was not previously cached
    if (roleSet.size === 0 && (user.mobile === '01700000000' || user.email === 'admin@example.com')) {
        roleSet.add('admin')
    }

    if (roleSet.size === 0 && user.role) {
        roleSet.add(String(user.role).toLowerCase())
    }

    return Array.from(roleSet)
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: getStoredAdminUser(),
        token: localStorage.getItem('admin_token') || null,
        isAuthenticated: !!localStorage.getItem('admin_token')
    }),
    
    actions: {
        async login(credentials) {
            try {
                const response = await api.post('v1/verify-otp', credentials)

                if (response.data.token) {
                    this.token = response.data.token
                    this.user = response.data.user
                    this.isAuthenticated = true

                    localStorage.setItem('admin_token', response.data.token)
                    localStorage.setItem('admin_user', JSON.stringify(response.data.user))

                    return true
                }

                return false
            } catch (error) {
                console.error('Login error:', error)
                throw error
            }
        },

        async logout() {
            try {
                if (this.token) {
                    await api.post('v1/customer/logout')
                }
            } catch (error) {
                console.error('Logout error:', error)
            } finally {
                this.clearSession()
            }
        },

        clearSession() {
            this.token = null
            this.user = null
            this.isAuthenticated = false
            localStorage.removeItem('admin_token')
            localStorage.removeItem('admin_user')
        },

        loadUser() {
            this.user = getStoredAdminUser()
            this.token = localStorage.getItem('admin_token') || null
            this.isAuthenticated = !!this.token
        }
    },

    getters: {
        getUser: (state) => state.user,
        isLoggedIn: (state) => state.isAuthenticated,
        userRoles: (state) => extractRoles(state.user),
        isAdmin: (state) => extractRoles(state.user).includes('admin'),
        isManager: (state) => {
            const roles = extractRoles(state.user)
            return roles.includes('manager') || roles.includes('vendor') || roles.includes('moderator')
        },
        canManageProductsOrders: (state) => {
            const roles = extractRoles(state.user)
            return (
                roles.includes('admin') ||
                roles.includes('manager') ||
                roles.includes('vendor') ||
                roles.includes('moderator')
            )
        }
    }
})
