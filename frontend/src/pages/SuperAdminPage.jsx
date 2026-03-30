import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function SuperAdminPage() {
    const { logout, email } = useAuth()
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [form, setForm] = useState({
        restaurantName: '',
        slug: '',
        email: '',
        password: '',
    })

    async function loadRestaurants() {
        setLoading(true)
        try {
            const { data } = await api.get('/api/super-admin/restaurants')
            setRestaurants(data)
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao carregar restaurantes')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadRestaurants()
    }, [])

    useEffect(() => {
        if (!success) return undefined
        const timeout = window.setTimeout(() => setSuccess(''), 3000)
        return () => window.clearTimeout(timeout)
    }, [success])

    function handleChange(event) {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setSubmitting(true)
        setError('')
        setSuccess('')

        try {
            const { data } = await api.post('/api/super-admin/restaurants', form)
            setSuccess(`Restaurante ${data.restaurantName} criado com sucesso`)
            setForm({ restaurantName: '', slug: '', email: '', password: '' })
            loadRestaurants()
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao criar restaurante')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-stone-100">
            <header className="bg-white border-b border-stone-200 px-6 py-4 flex justify-between items-center">
                <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Super Admin</p>
                    <h1 className="text-2xl font-bold text-stone-900">Gestao de restaurantes</h1>
                    {email && <p className="text-sm text-stone-500 mt-1">{email}</p>}
                </div>
                <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 transition">
                    Sair
                </button>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[420px,1fr]">
                <section className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Cadastrar restaurante</h2>
                    <p className="text-sm text-stone-500 mb-4">
                        Apenas o super admin pode criar novas contas. O cadastro publico foi bloqueado.
                    </p>

                    {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                    {success && <p className="text-emerald-600 text-sm mb-3">{success}</p>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="restaurantName"
                            placeholder="Nome do restaurante"
                            value={form.restaurantName}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <input
                            type="text"
                            name="slug"
                            placeholder="Slug publico"
                            value={form.slug}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="E-mail do restaurante"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Senha inicial"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                        >
                            {submitting ? 'Criando...' : 'Criar restaurante'}
                        </button>
                    </form>
                </section>

                <section className="bg-white rounded-2xl shadow p-6">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Restaurantes cadastrados</h2>
                            <p className="text-sm text-stone-500">Visao rapida das contas administradas pelo super admin.</p>
                        </div>
                        <button
                            type="button"
                            onClick={loadRestaurants}
                            className="text-sm font-medium text-orange-500 hover:text-orange-600"
                        >
                            Atualizar
                        </button>
                    </div>

                    {loading ? (
                        <p className="text-sm text-stone-400">Carregando restaurantes...</p>
                    ) : restaurants.length === 0 ? (
                        <p className="text-sm text-stone-400">Nenhum restaurante cadastrado ainda.</p>
                    ) : (
                        <div className="space-y-3">
                            {restaurants.map((restaurant) => (
                                <div key={restaurant.id} className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-stone-900">{restaurant.name}</p>
                                            <p className="text-sm text-stone-500">/{restaurant.slug}</p>
                                        </div>
                                        <p className="text-sm text-stone-500">{restaurant.email || 'Sem usuario principal'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
