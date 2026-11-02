import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Truck,
  MapPin,
  CreditCard,
  FileText,
  AlertTriangle,
  ChevronLeft
} from 'lucide-react'
import { ordersAPI } from '../api/orders'
import { useToast } from '../context/ToastContext'

export const OrderDetailPage = () => {
  const { orderNumber } = useParams()
  const { success, error } = useToast()

  const [order, setOrder] = useState(null)
  const [tracking, setTracking] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const loadOrder = async () => {
    try {
      const [ordRes, trkRes] = await Promise.all([
        ordersAPI.getOrderDetail(orderNumber),
        ordersAPI.getOrderTracking(orderNumber).catch(() => ({ data: null })),
      ])
      setOrder(ordRes.data)
      setTracking(trkRes.data)
    } catch (err) {
      console.error('Order load error:', err)
      error('Buyurtma ma\'lumotlarini yuklab bo\'lmadi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrder()
  }, [orderNumber])

  const formatPrice = (val) => {
    return Number(val || 0).toLocaleString('uz-UZ') + ' so\'m'
  }

  const handleCancelOrder = async (e) => {
    e.preventDefault()
    setCancelling(true)
    try {
      await ordersAPI.cancelOrder(orderNumber, { reason: cancelReason || 'Mijoz talabi' })
      success('Buyurtma muvaffaqiyatli bekor qilindi')
      setCancelModalOpen(false)
      await loadOrder()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Bekor qilishda xatolik yuz berdi'
      error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setCancelling(false)
    }
  }

  const handleFetchInvoice = async () => {
    try {
      const res = await ordersAPI.getInvoice(orderNumber)
      setInvoice(res.data)
      success('Invoys ma\'lumotlari yuklandi')
    } catch {
      error('Invoysni yuklab bo\'lmadi')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-20 bg-white rounded-3xl border border-slate-200"></div>
        <div className="h-64 bg-white rounded-3xl border border-slate-200"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl max-w-md mx-auto my-12 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Buyurtma topilmadi</h2>
        <Link to="/orders" className="text-xs font-bold text-teal-700 hover:underline">
          Buyurtmalar ro'yxatiga qaytish
        </Link>
      </div>
    )
  }

  const canCancel = ['PENDING', 'AWAITING_PAYMENT'].includes(order.status)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Barcha buyurtmalarga qaytish
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>Buyurtma #{order.order_number}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Qabul qilingan vaqt: {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canCancel && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
            >
              Buyurtmani bekor qilish
            </button>
          )}

          <button
            onClick={handleFetchInvoice}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Invoys / Chek
          </button>
        </div>
      </div>

      {/* Invoice Modal / Box */}
      {invoice && (
        <div className="p-6 bg-slate-50 border-2 border-teal-200 rounded-3xl text-xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="font-bold text-sm text-slate-900">Elektron Invoys</span>
            <span className="font-mono text-slate-500">{invoice.invoice_number || invoice.order_number}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-slate-600">
            <div>
              <p>Mijoz: <strong>{invoice.customer_name || invoice.user?.email}</strong></p>
              <p>To'lov usuli: <strong>{invoice.payment_method}</strong></p>
            </div>
            <div className="text-right">
              <p>Jami to'lov: <strong className="text-teal-800">{formatPrice(invoice.total_price)}</strong></p>
              <p>Sana: <strong>{new Date(invoice.issued_at || invoice.created_at || Date.now()).toLocaleDateString()}</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Timeline */}
      {tracking?.history && tracking.history.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Truck className="w-4 h-4 text-teal-600" />
            Buyurtma harakati va bosqichlari
          </h2>

          <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-100">
            {tracking.history.map((step, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-teal-600 ring-4 ring-teal-50"></span>
                <div>
                  <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">{step.status}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {new Date(step.created_at).toLocaleString()}
                  </span>
                  {step.notes && <p className="text-xs text-slate-600 mt-1">{step.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ordered Items Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Mahsulotlar tarkibi
        </h2>

        <div className="divide-y divide-slate-100">
          {order.items?.map((item) => (
            <div key={item.id} className="py-3.5 flex justify-between items-center gap-4">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.product_name}</h4>
                {item.variant_sku && (
                  <span className="text-[11px] text-slate-400 font-mono">SKU: {item.variant_sku}</span>
                )}
                <div className="text-xs text-slate-500 mt-0.5 font-medium">
                  {formatPrice(item.unit_price)} × {item.quantity} dona
                </div>
              </div>

              <span className="text-sm font-bold text-slate-900">
                {formatPrice(item.total_price)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Details: Address & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            Yetkazib berish manzili
          </h3>
          {order.shipping_address ? (
            <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed font-medium">
              <p>Qabul qiluvchi: <strong className="text-slate-900">{order.shipping_address.recipient_name}</strong></p>
              <p>Telefon: <strong className="text-slate-900">{order.shipping_address.phone_number}</strong></p>
              <p>Shahar/Viloyat: {order.shipping_address.region}, {order.shipping_address.district}</p>
              <p>Manzil: {order.shipping_address.street_address}</p>
              {order.shipping_address.delivery_instructions && (
                <p className="text-slate-400">Ko'rsatma: {order.shipping_address.delivery_instructions}</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Manzil ma'lumotlari kiritilmagan</p>
          )}
        </div>

        {/* Payment and Financial Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <CreditCard className="w-4 h-4 text-teal-600" />
            To'lov ma'lumotlari
          </h3>
          <div className="space-y-2 text-xs text-slate-600 font-medium">
            <div className="flex justify-between">
              <span>To'lov usuli:</span>
              <span className="font-bold text-slate-900">{order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span>To'lov holati:</span>
              <span className="font-bold text-emerald-600 uppercase">{order.payment_status}</span>
            </div>
            <div className="flex justify-between">
              <span>Yetkazish narxi:</span>
              <span className="font-bold text-slate-900">
                {order.shipping_fee > 0 ? formatPrice(order.shipping_fee) : 'Bepul'}
              </span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Chegirma:</span>
                <span>-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-800">Jami summa:</span>
              <span className="text-lg font-black text-slate-950">{formatPrice(order.total_price)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">
              Buyurtmani bekor qilmoqchimisiz?
            </h3>
            <p className="text-xs text-slate-500 text-center">
              Bekor qilingach buyurtma tiklanmaydi va zaxiradagi tovarlar ozod qilinadi.
            </p>
            <textarea
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Bekor qilish sababi (ixtiyoriy)..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Orqaga
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
              >
                {cancelling ? 'Bekor qilinmoqda...' : 'Ha, bekor qilish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
