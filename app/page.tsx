'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Phone, MapPin, CheckCircle2, ShoppingBag } from 'lucide-react'

export default function Marketplace() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Initialize Telegram Web App
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      tg.ready()
      tg.expand() // Opens the app to full height
    }

    // 2. Fetch Products and Seller info from Supabase
    async function getProducts() {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          sellers (
            name,
            phone_number,
            location,
            is_verified
          )
        `)
      
      if (!error && data) {
        setProducts(data)
      }
      setLoading(false)
    }

    getProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-green-600 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag /> Green Supply Eth
        </h1>
        <p className="text-green-100 text-sm mt-1">Legal packaging for a cleaner Ethiopia 🇪🇹</p>
      </header>

      {/* Product List */}
      <div className="p-4 grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 transition-transform active:scale-95">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">
                  {product.material_type}
                </span>
                <h2 className="text-lg font-bold text-gray-800 mt-1">{product.title}</h2>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-gray-900">{product.price_per_unit} <span className="text-sm font-normal text-gray-500">ETB</span></p>
                <p className="text-xs text-gray-400">Min: {product.min_order_qty} pcs</p>
              </div>
            </div>

            <hr className="my-3 border-gray-50" />

            <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-1 font-medium text-gray-800">
                  {product.sellers.name}
                  {product.sellers.is_verified && <CheckCircle2 size={14} className="text-blue-500 fill-blue-500 text-white" />}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={12} /> {product.sellers.location}
                </div>
              </div>
            </div>

            {/* CALL BUTTON */}
            <a 
              href={`tel:${product.sellers.phone_number}`}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-green-100"
            >
              <Phone size={18} /> Call Seller
            </a>
          </div>
        ))}
      </div>

      {/* Simple Footer Disclaimer */}
      <p className="text-center text-xs text-gray-400 px-10 mt-4">
        Ensure bags meet EPA standards (0.03mm) before purchase.
      </p>
    </main>
  )
}