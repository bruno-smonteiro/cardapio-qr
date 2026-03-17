import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import CategoriesTab from '../components/CategoriesTab'
import ProductsTab from '../components/ProductsTab'
import QRCodeTab from '../components/QRCodeTab'

export default function AdminPage() {
    const { logout } = useAuth()
    const [activeTab, setActiveTab] = useState('categories')

    const tabs = [
        { key: 'categories', label: 'Categorias' },
        { key: 'products', label: 'Produtos' },
        { key: 'qrcode', label: 'QR Code' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-orange-500">CardápioQR</h1>
                <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 transition">
                    Sair
                </button>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="flex gap-2 mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === tab.key
                                ? 'bg-orange-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'categories' && <CategoriesTab />}
                {activeTab === 'products' && <ProductsTab />}
                {activeTab === 'qrcode' && <QRCodeTab />}
            </div>
        </div>
    )
}