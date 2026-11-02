import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, ShoppingBag } from 'lucide-react'
import { ordersAPI } from '../api/orders'
import { useAuth } from '../context/AuthContext'

export const OrdersPage = () => {
  const { isAuthenticated, openAuthModal } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ALL')

  useEffect(() => {
    if (!isAuthenticated) return

    setLoading(true)
    const params = activeTab !== 'ALL' ? { status: activeTab } : {}

    ordersAPI.getOrders(params)
      .then((res) => {
        setOrders(res.data?.results || res.data || [])
      })
      .catch((err) => {
        console.error('Orders load error:', err)
        setOrders([])
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated, activeTab])

  const formatPrice = (val) => {
    return Number(val || 0).toLocaleString('uz-UZ') + ' so\'m'
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {status}</span>
      case 'SHIPPED':
      case 'PROCESSING':
        return <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 font-bold text-[11px] flex items-center gap-1"><Truck className="w-3 h-3" /> {status}</span>
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] flex items-center gap-1"><XCircle className="w-3 h-3" /> {status}</span>
      default:
        return <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px] flex items-center gap-1"><Clock className="w-3 h-3" /> {status}</span>
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
        <Package className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Buyurtmalarni ko'rish uchun kiring</h2>
        <button
          onClick={() => openAuthModal('login')}
          className="w-full py-3 bg-teal-600 text-white rounded-xl text-xs font-bold"
        >
          Kirish
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Buyurtmalar tarixi</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold">Sizning barcha amalga oshirgan buyurtmalaringiz</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold text-slate-600">
        {[
          { key: 'ALL', label: 'Barchasi' },
          { key: 'PENDING', label: 'Kutilmoqda' },
          { key: 'CONFIRMED', label: 'Tasdiqlangan' },
          { key: 'SHIPPED', label: 'Yetkazilmoqda' },
          { key: 'DELIVERED', label: 'Yetkazildi' },
          { key: 'CANCELLED', label: 'Bekor qilingan' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">Buyurtmalar topilmadi</h3>
          <p className="text-xs text-slate-400 mb-6 font-medium">Ushbu holatda birorta ham buyurtma mavjud emas</p>
          <Link to="/catalog" className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-xs">
            Katalogga o'tish
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/orders/${o.order_number}`}
              className="group block bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-900/5 transition duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-sm font-black text-teal-800 font-mono">
                    #{o.order_number}
                  </span>
                  <p className="text-xs text-slate-400 font-medium">
                    Sana: {o.created_at ? new Date(o.created_at).toLocaleString() : ''}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(o.status)}
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 font-bold text-slate-700">
                    {o.payment_method}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block font-medium">
                    Jami tovarlar: <strong>{o.total_items || 1} ta</strong>
                  </span>
                  <span className="text-base font-black text-slate-950 mt-1 block">
                    {formatPrice(o.total_price)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform">
                  <span>Batafsil ko'rish</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
