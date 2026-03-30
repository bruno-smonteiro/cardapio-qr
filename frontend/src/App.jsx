import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import MenuPage from './pages/MenuPage'
import SuperAdminLoginPage from './pages/SuperAdminLoginPage'
import SuperAdminPage from './pages/SuperAdminPage'
import { useAuth } from './hooks/useAuth'

function RoleRoute({ children, allowedRoles, fallbackPath = '/login' }) {
    const { isAuthenticated, isLoading, role } = useAuth()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-sm text-gray-500">Validando sessao...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to={fallbackPath} replace />
    }

    if (!allowedRoles.includes(role)) {
        return <Navigate to={role === 'super_admin' ? '/super-admin' : '/admin'} replace />
    }

    return children
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
                <Route
                    path="/register"
                    element={
                        <RoleRoute allowedRoles={['super_admin']} fallbackPath="/super-admin/login">
                            <SuperAdminPage />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/super-admin"
                    element={
                        <RoleRoute allowedRoles={['super_admin']} fallbackPath="/super-admin/login">
                            <SuperAdminPage />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <RoleRoute allowedRoles={['restaurant_admin']}>
                            <AdminPage />
                        </RoleRoute>
                    }
                />
                <Route path="/menu/:slug" element={<MenuPage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
