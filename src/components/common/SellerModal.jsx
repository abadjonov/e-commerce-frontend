import { useState } from 'react'
import { X, Store, CheckCircle, ShieldCheck, TrendingUp, Truck, AlertCircle } from 'lucide-react'
import { catalogAPI } from '../../api/catalog'

export function SellerModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    store_name: '',
    phone_number: '+998 ',
    legal_name: '',
    tax_id: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await catalogAPI.applySeller(formData)
      setSuccess(true)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Arizani yuborishda xatolik yuz berdi. Iltimos barcha maydonlarni to\'g\'ri to\'ldiring.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSuccess(false)
    setError('')
    setFormData({
      store_name: '',
      phone_number: '+998 ',
      legal_name: '',
      tax_id: '',
      description: '',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-teal-950 p-6 text-white relative">
          <button
            onClick={handleReset}
            className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">E-Commerce da sotuvchi bo'ling</h2>
              <p className="text-xs text-slate-300 mt-0.5">O'z do'koningizni oching va butun O'zbekiston bo'ylab soting</p>
            </div>
          </div>

          {/* Quick Perks */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-200">
              <TrendingUp className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>1M+ xaridorlar</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-200">
              <Truck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>1 kunda yetkazish</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>0% start to'lovi</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Arizangiz muvaffaqiyatli qabul qilindi!</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed max-w-sm mx-auto">
                Moderatorlarimiz arizangizni ko'rib chiqib, 24 soat ichida ko'rsatilgan telefon raqami orqali siz bilan bog'lanishadi.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl shadow-lg shadow-teal-600/20 transition"
              >
                Tushunarli, rahmat
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Do'kon / Brend nomi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: TechZone Store yoki Brand Wear"
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bog'lanish telefoni <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    STIR / INN (ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    placeholder="9 xonali STIR raqami"
                    value={formData.tax_id}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yuridik tashkilot nomi (YaTT yoki MChJ)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: OOO 'Tech Retail' yoki YaTT Karimov A."
                  value={formData.legal_name}
                  onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mahsulotlar toifasi va faoliyat haqida qisqacha
                </label>
                <textarea
                  rows="2"
                  placeholder="Elektronika, erkaklar kiyimi, kosmetika va h.k."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium text-sm rounded-xl shadow-lg shadow-teal-600/20 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Yuborilmoqda...</span>
                    </>
                  ) : (
                    <span>Hamkorlik arizasini yuborish</span>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Arizani yuborish orqali E-Commerce sotuvchilar shartnomasi qoidalariga rozilik bildirasiz.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
