import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export default function MenuPage() {
    const { slug } = useParams()
    const [restaurant, setRestaurant] = useState(null)
    const [categories, setCategories] = useState([])
    const [activeCategory, setActiveCategory] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        api.get(`/api/menu/${slug}`)
            .then(({ data }) => {
                setRestaurant(data.restaurant)
                setCategories(data.categories)
                if (data.categories.length > 0) {
                    setActiveCategory(data.categories[0].id)
                }
            })
            .catch(() => setError('Cardápio não encontrado'))
    }, [slug])

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">{error}</p>
            </div>
        )
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-400">Carregando cardápio...</p>
            </div>
        )
    }

    const activeProducts = categories.find(c => c.id === activeCategory)?.products || []

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-orange-500 text-white px-6 py-8 text-center">
                {restaurant.logo_url && (
                    <img src={restaurant.logo_url} alt={restaurant.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
                )}
                <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            </div>

            {/* Abas de categorias */}
            <div className="sticky top-0 bg-white shadow z-10 px-4 py-3 flex gap-2 overflow-x-auto">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === cat.id
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Lista de produtos */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {activeProducts.length === 0 && (
                    <p className="text-gray-400 text-center py-8">Nenhum produto nessa categoria</p>
                )}
                {activeProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-2xl shadow flex gap-4 p-4">
                        {product.image_url && (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                            />
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{product.name}</h3>
                            {product.description && (
                                <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                            )}
                            <p className="text-orange-500 font-bold mt-2">
                                R$ {Number(product.price).toFixed(2)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}