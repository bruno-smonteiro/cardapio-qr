import { useState, useEffect } from 'react'
import api from '../services/api'

export default function CategoriesTab() {
    const [categories, setCategories] = useState([])
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function fetchCategories() {
        try {
            const { data } = await api.get('/api/admin/categories')
            setCategories(data)
        } catch {
            setError('Erro ao carregar categorias')
        }
    }

    useEffect(() => { fetchCategories() }, [])

    async function handleCreate(e) {
        e.preventDefault()
        if (!name.trim()) return
        setLoading(true)
        try {
            await api.post('/api/admin/categories', { name })
            setName('')
            fetchCategories()
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao criar categoria')
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id) {
        if (!confirm('Remover categoria?')) return
        try {
            await api.delete(`/api/admin/categories/${id}`)
            fetchCategories()
        } catch {
            setError('Erro ao remover categoria')
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Categorias</h2>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <form onSubmit={handleCreate} className="flex gap-2 mb-6">
                <input
                    type="text"
                    placeholder="Nome da categoria"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                    Adicionar
                </button>
            </form>

            <ul className="space-y-2">
                {categories.map(cat => (
                    <li key={cat.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
                        <span className="text-gray-700">{cat.name}</span>
                        <button
                            onClick={() => handleDelete(cat.id)}
                            className="text-red-400 hover:text-red-600 text-sm transition"
                        >
                            Remover
                        </button>
                    </li>
                ))}
                {categories.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">Nenhuma categoria ainda</p>
                )}
            </ul>
        </div>
    )
}