import React from 'react'
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

export const CartDrawer = () => {
  const { cart, itemCount, subtotal, isDrawerOpen, closeDrawer, updateQuantity, removeItem, clearCart, loading } = useCart()
  const navigate = useNavigate()

  if (!isDrawerOpen) return null

  const formatPrice = (val) => {
    return Number(val || 0).toLocaleString('uz-UZ') + ' so\'m'
  }

  const handleCheckoutClick = () => {
    closeDrawer()
    navigate('/checkout')
  }

  const handleViewCartClick = () => {
    closeDrawer()
    navigate('/cart')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-0" onClick={closeDrawer} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">Xarid savatchasi</h2>
                <span className="text-xs text-slate-500 font-semibold">{itemCount} ta tovar</span>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {(!cart?.items || cart.items.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-20 h-20 rounded-2xl bg-teal-50/60 flex items-center justify-center mb-4 text-teal-600/40">
                  <ShoppingBag className="w-10 h-10 stroke-[1.2]" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Savatchangiz bo'sh</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-6 font-medium">
                  Siz hali birorta ham tovar qo'shmadingiz. Katalog orqali mos mahsulotlarni tanlang!
                </p>
                <button
                  onClick={() => {
                    closeDrawer()
                    navigate('/catalog')
                  }}
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition shadow-xs"
                >
                  Katalogga o'tish
                </button>
              </div>
            ) : (
              cart.items.map((item) => {
                const prod = item.variant?.product || item.product || {}
                const media = item.variant?.media?.[0]?.image || prod.primary_image || prod.image || ''
                return (
                  <div key={item.id} className="py-4 flex gap-4 items-start first:pt-0 last:pb-0">
                    <div className="w-18 h-18 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60 flex items-center justify-center">
                      {media ? (
                        <img src={media} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {prod.name || 'Mahsulot'}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-300 hover:text-rose-600 transition p-1"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.variant?.sku && (
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">SKU: {item.variant.sku}</p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                          <button
                            disabled={loading}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-white text-slate-600 transition disabled:opacity-40"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            disabled={loading}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-white text-slate-600 transition disabled:opacity-40"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-xs sm:text-sm font-black text-slate-950">
                          {formatPrice(item.total_price || (item.unit_price * item.quantity))}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Summary */}
          {cart?.items?.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Oraliq hisob:</span>
                <span className="text-base font-black text-slate-950">{formatPrice(subtotal)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleViewCartClick}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition"
                >
                  Savatchani ko'rish
                </button>
                <button
                  onClick={clearCart}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50 text-xs font-bold transition"
                >
                  Tozalash
                </button>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition cursor-pointer"
              >
                Buyurtma rasmiylashtirish
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
