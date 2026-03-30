import { useEffect, useState } from 'react'
import api from '../services/api'

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let active = true

        api.get('/api/auth/me')
            .then(() => {
                if (!active) return
                setIsAuthenticated(true)
            })
            .catch(() => {
                if (!active) return
                setIsAuthenticated(false)
            })
            .finally(() => {
                if (!active) return
                setIsLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    function login() {
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
        login,
        logout,
    }
}
