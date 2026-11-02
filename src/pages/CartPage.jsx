import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, ShieldCheck } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { ordersAPI } from '../api/orders'
import { useToast } from '../context/ToastContext'

export const CartPage = () => {
  const { cart, itemCount, subtotal, updateQuantity, removeItem, clearCart, loading } = useCart()
  const navigate = useNavigate()
  const { success, error } = useToast()

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)

  const formatPrice = (val) => {
    return Number(val || 0).toLocaleString('uz-UZ') + ' so\'m'
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    if (!couponCode.trim()) return

    setCouponLoading(true)
    try {
      const res = await ordersAPI.validateCoupon({
        code: couponCode.trim(),
        subtotal: subtotal,
      })

      if (res.data.is_valid) {
        setAppliedCoupon(res.data)
        success(res.data.message || 'Kupon muvaffaqiyatli qo\'llandi!')
      } else {
        error(res.data.message || 'Kupon yaroqsiz')
        setAppliedCoupon(null)
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Kuponni tekshirishda xatolik'
      error(typeof msg === 'string' ? msg : JSON.stringify(msg))
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const discountAmount = appliedCoupon ? Number(appliedCoupon.discount_amount || 0) : 0
  const finalTotal = Math.max(0, Number(subtotal || 0) - discountAmount)

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 bg-white rounded-3xl p-8 border border-slate-200 shadow-xs">
        <div className="w-20 h-20 bg-teal-50 text-teal-700 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Savatchangiz bo'sh</h2>
        <p className="text-xs text-slate-500 mb-6 font-medium">
          Siz hali savatchaga mahsulot qo'shmadingiz. Kerakli tovarlarni topish uchun katalogga o'ting!
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition shadow-xs"
        >
          Katalogga o'tish
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Savatcha</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold">{itemCount} ta tanlangan mahsulot</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs divide-y divide-slate-100">
          <div className="flex justify-between items-center pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tovarlar ro'yxati</span>
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
            >
              Savatchani tozalash
            </button>
          </div>

          {cart.items.map((item) => {
            const prod = item.variant?.product || item.product || {}
            const media = item.variant?.media?.[0]?.image || prod.primary_image || prod.image || ''
            return (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 shrink-0 flex items-center justify-center">
                    {media ? (
                      <img src={media} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{prod.name}</h3>
                    {item.variant?.sku && (
                      <span className="text-xs text-slate-400 font-mono">SKU: {item.variant.sku}</span>
                    )}
                    <div className="text-xs font-bold text-slate-600 mt-1">
                      {formatPrice(item.unit_price)} / dona
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                    <button
                      disabled={loading}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-white text-slate-600 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      disabled={loading}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-white text-slate-600 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm sm:text-base font-black text-slate-950 min-w-[100px] text-right">
                    {formatPrice(item.total_price || (item.unit_price * item.quantity))}
                  </span>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 transition"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Code Input */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-teal-600" />
              Promokod yoki Kupon
            </span>

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Masalan: CHEGIRMA10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs uppercase focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium"
              />
              <button
                type="submit"
                disabled={couponLoading || !couponCode.trim()}
                className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl transition disabled:opacity-40 border border-teal-100"
              >
                {couponLoading ? '...' : 'Qo\'llash'}
              </button>
            </form>

            {appliedCoupon && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center justify-between border border-emerald-100">
                <span className="font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Kupon qo'llandi: {appliedCoupon.code}
                </span>
                <span className="font-black">-{formatPrice(discountAmount)}</span>
              </div>
            )}
          </div>

          {/* Checkout Totals Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Buyurtma hisobi
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Tovarlar narxi ({itemCount} dona):</span>
                <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Chegirma:</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Yetkazib berish:</span>
                <span className="text-emerald-600 font-bold">Bepul</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-800">Jami to'lov:</span>
              <span className="text-xl font-black text-slate-950">{formatPrice(finalTotal)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { couponCode: appliedCoupon?.code } })}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              Rasmiylashtirishga o'tish
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Xavfsiz va rasmiy kafolatlangan to'lov</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
