import { useState, useEffect } from 'react'
import api from '../services/api'

export default function ProductsTab() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '' })
    const [image, setImage] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function fetchAll() {
        try {
            const [p, c] = await Promise.all([
                api.get('/api/admin/products'),
                api.get('/api/admin/categories'),
            ])
            setProducts(p.data)
            setCategories(c.data)
        } catch {
            setError('Erro ao carregar dados')
        }
    }

    useEffect(() => { fetchAll() }, [])

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleCreate(e) {
        e.preventDefault()
        setLoading(true)
        try {
            const formData = new FormData()
            Object.entries(form).forEach(([k, v]) => formData.append(k, v))
            if (image) formData.append('image', image)
            await api.post('/api/admin/products', formData)
            setForm({ name: '', description: '', price: '', category_id: '' })
            setImage(null)
            fetchAll()
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao criar produto')
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id) {
        if (!confirm('Remover produto?')) return
        try {
            await api.delete(`/api/admin/products/${id}`)
            fetchAll()
        } catch {
            setError('Erro ao remover produto')
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Produtos</h2>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <form onSubmit={handleCreate} className="space-y-3 mb-6">
                <input
                    type="text" name="name" placeholder="Nome do produto"
                    value={form.name} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <textarea
                    name="description" placeholder="Descrição (opcional)"
                    value={form.description} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    rows={2}
                />
                <div className="flex gap-2">
                    <input
                        type="number" name="price" placeholder="Preço"
                        value={form.price} onChange={handleChange} required step="0.01"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <select
                        name="category_id" value={form.category_id} onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                        <option value="">Categoria</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <input
                    type="file" accept="image/*"
                    onChange={e => setImage(e.target.files[0])}
                    className="w-full text-sm text-gray-500"
                />
                <button
                    type="submit" disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                >
                    {loading ? 'Salvando...' : 'Adicionar produto'}
                </button>
            </form>

            <ul className="space-y-3">
                {products.map(p => (
                    <li key={p.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3 gap-3">
                        {p.image_url && (
                            <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                        )}
                        <div className="flex-1">
                            <p className="font-medium text-gray-800">{p.name}</p>
                            <p className="text-sm text-gray-500">R$ {Number(p.price).toFixed(2)} · {p.category_name}</p>
                        </div>
                        <button
                            onClick={() => handleDelete(p.id)}
                            className="text-red-400 hover:text-red-600 text-sm transition"
                        >
                            Remover
                        </button>
                    </li>
                ))}
                {products.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">Nenhum produto ainda</p>
                )}
            </ul>
        </div>
    )
}