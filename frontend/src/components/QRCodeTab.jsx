import { useState, useEffect } from 'react'
import api from '../services/api'

export default function QRCodeTab() {
    const [qrCode, setQrCode] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        api.get('/api/admin/qrcode')
            .then(({ data }) => setQrCode(data))
            .catch(() => setError('Erro ao gerar QR Code'))
    }, [])

    return (
        <div className="bg-white rounded-2xl shadow p-6 text-center">
            <h2 className="text-lg font-bold text-gray-800 mb-4">QR Code do Cardápio</h2>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {qrCode ? (
                <div className="space-y-4">
                    <img src={qrCode.qrCode} alt="QR Code" className="mx-auto w-48 h-48" />
                    <p className="text-sm text-gray-500">
                        Link público:{' '}
                        <a href={qrCode.url} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline">
                            {qrCode.url}
                        </a>
                    </p>

                    <a href={qrCode.qrCode}
                        download="qrcode.png"
                        className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition"
                    >
                        Baixar QR Code
                    </a>
                </div>
            ) : (
                !error && <p className="text-gray-400 text-sm">Gerando QR Code...</p>
            )
            }
        </div >
    )
}