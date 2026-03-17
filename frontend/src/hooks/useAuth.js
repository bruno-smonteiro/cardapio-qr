export function useAuth() {
    const token = localStorage.getItem('token')

    function login(token) {
        localStorage.setItem('token', token)
        window.location.href = '/admin'
    }

    function logout() {
        localStorage.removeItem('token')
        window.location.href = '/login'
    }

    return {
        isAuthenticated: !!token,
        token,
        login,
        logout,
    }
}