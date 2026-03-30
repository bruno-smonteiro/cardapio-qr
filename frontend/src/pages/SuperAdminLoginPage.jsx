import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function SuperAdminLoginPage() {
    const { login } = useAuth()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function handleChange(event) {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { data } = await api.post('/api/auth/login', form)
            login(data.role)
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao fazer login como super admin')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow p-8 w-full max-w-sm border border-stone-200">
                <p className="text-xs uppercase tracking-[0.2em] text-orange-500 text-center">Super Admin</p>
                <h1 className="text-2xl font-bold text-stone-900 mt-3 mb-6 text-center">Entrar no painel mestre</h1>

                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="E-mail do super admin"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Senha"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-stone-900 hover:bg-stone-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Entrando...' : 'Entrar como super admin'}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-500 mt-4">
                    Voltar para o login do restaurante?{' '}
                    <Link to="/login" className="text-orange-500 hover:underline">Entrar</Link>
                </p>
            </div>
        </div>
    )
}
