import React, { useState, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { CheckCircle2, ArrowRight, Package, CreditCard, ExternalLink } from 'lucide-react'
import { paymentsAPI } from '../api/payments'
import { ordersAPI } from '../api/orders'
import { useToast } from '../context/ToastContext'

export const OrderSuccessPage = () => {
  const { orderNumber } = useParams()
  const location = useLocation()
  const { success, error } = useToast()

  const [order, setOrder] = useState(location.state?.order || null)
  const [paymentMethod, setPaymentMethod] = useState(
    location.state?.paymentMethod || order?.payment_method || 'PAYME'
  )
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState(null)

  useEffect(() => {
    if (!order) {
      ordersAPI.getOrderDetail(orderNumber)
        .then((res) => {
          setOrder(res.data)
          setPaymentMethod(res.data.payment_method)
        })
        .catch((err) => console.error(err))
    }
  }, [orderNumber, order])

  const handlePayNow = async () => {
    setLoadingPayment(true)
    try {
      const res = await paymentsAPI.initialize({
        order_number: orderNumber,
        provider: paymentMethod.toUpperCase(),
        return_url: `${window.location.origin}/orders/${orderNumber}`,
      })

      setPaymentInfo(res.data)
      success('To\'lov tizimiga so\'rov yuborildi!')

      if (res.data.checkout_url) {
        window.open(res.data.checkout_url, '_blank')
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'To\'lovni boshlashda xatolik yuz berdi'
      error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoadingPayment(false)
    }
  }

  const formatPrice = (val) => {
    return Number(val || 0).toLocaleString('uz-UZ') + ' so\'m'
  }

  return (
    <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6">
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Buyurtmangiz qabul qilindi!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Xaridingiz uchun rahmat. Buyurtmangiz bo'yicha ma'lumotlar profilingizda saqlandi.
        </p>
      </div>

      {/* Order Badge Box */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Buyurtma raqami
          </span>
          <span className="text-base font-black text-teal-800 font-mono">
            #{orderNumber}
          </span>
        </div>

        {order?.total_price && (
          <div className="sm:text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Jami to'lov
            </span>
            <span className="text-base font-extrabold text-slate-950">
              {formatPrice(order.total_price)}
            </span>
          </div>
        )}
      </div>

      {/* Card Payment Success Notice */}
      {paymentMethod === 'CARD' && (
        <div className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 text-left space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Bank kartasi orqali to'lov qabul qilindi!
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Sizning to'lovingiz muvaffaqiyatli tasdiqlandi va yetkazib berishga jo'natilmoqda.
              </p>
            </div>
          </div>
          <div className="p-3 bg-white rounded-xl text-xs border border-teal-100 text-slate-700 flex justify-between items-center">
            <span>To'lov usuli: <strong>Bank kartasi (Uzcard / Humo / Visa / Mastercard)</strong></span>
            <span className="font-mono text-teal-700 font-bold bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
              To'landi ✓
            </span>
          </div>
        </div>
      )}

      {/* Payment Action if online gateway */}
      {['PAYME', 'CLICK'].includes(paymentMethod) && (
        <div className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-100 text-left space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {paymentMethod} orqali to'lovni yakunlang
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                To'lovni hoziroq onlayn amalga oshirishingiz mumkin
              </p>
            </div>
          </div>

          <button
            onClick={handlePayNow}
            disabled={loadingPayment}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-600/20"
          >
            {loadingPayment ? 'To\'lov havolasi olinmoqda...' : `${paymentMethod} orqali to'lash`}
            <ExternalLink className="w-4 h-4" />
          </button>

          {paymentInfo && (
            <div className="p-3 bg-white rounded-xl text-xs border border-teal-100 text-slate-600 space-y-1">
              <p className="font-bold text-emerald-600">✓ To'lov sessiyasi yaratildi!</p>
              <p>Tranzaksiya: <strong className="font-mono">{paymentInfo.payment_number}</strong></p>
              <p>Holati: <strong className="uppercase">{paymentInfo.status}</strong></p>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
        <Link
          to={`/orders/${orderNumber}`}
          className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition"
        >
          <Package className="w-4 h-4 text-teal-600" />
          Buyurtma holatini ko'rish
        </Link>
        <Link
          to="/catalog"
          className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
        >
          Xaridni davom ettirish
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
