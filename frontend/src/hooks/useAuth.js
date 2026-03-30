import { useEffect, useState } from 'react'
import api from '../services/api'

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [role, setRole] = useState(null)
    const [email, setEmail] = useState(null)

    useEffect(() => {
        let active = true

        api.get('/api/auth/me')
            .then(({ data }) => {
                if (!active) return
                setIsAuthenticated(true)
                setRole(data.role || null)
                setEmail(data.email || null)
            })
            .catch(() => {
                if (!active) return
                setIsAuthenticated(false)
                setRole(null)
                setEmail(null)
            })
            .finally(() => {
                if (!active) return
                setIsLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    function login(nextRole) {
        if (nextRole === 'super_admin') {
            window.location.href = '/super-admin'
            return
        }

        window.location.href = '/admin'
    }

    async function logout() {
        try {
            await api.post('/api/auth/logout')
        } catch (err) {
            console.error('logout error', err)
        } finally {
            window.location.href = '/login'
        }
    }

    return {
        isAuthenticated,
        isLoading,
        role,
        email,
        isSuperAdmin: role === 'super_admin',
        login,
        logout,
    }
}
