import React, { useState, useEffect } from 'react'
import { User, ShieldCheck, CreditCard, Save, LogOut, Trash2, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api/auth'
import { paymentsAPI } from '../api/payments'
import { useToast } from '../context/ToastContext'

export const ProfilePage = () => {
  const { user, loadUserProfile, logout } = useAuth()
  const { success, error } = useToast()

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
  })
  const [saving, setSaving] = useState(false)

  // Saved Cards
  const [cards, setCards] = useState([])
  const [loadingCards, setLoadingCards] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
      })
    }
  }, [user])

  const fetchCards = async () => {
    setLoadingCards(true)
    try {
      const res = await paymentsAPI.getSavedCards()
      setCards(res.data?.results || res.data || [])
    } catch (err) {
      console.warn('Cards load notice:', err)
    } finally {
      setLoadingCards(false)
    }
  }

  useEffect(() => {
    fetchCards()
  }, [])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authAPI.updateProfile(formData)
      await loadUserProfile()
      success('Profil ma\'lumotlari muvaffaqiyatli saqlandi!')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Profilni yangilashda xatolik yuz berdi'
      error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCard = async (pk) => {
    try {
      await paymentsAPI.deleteSavedCard(pk)
      success('Karta o\'chirildi')
      setCards(cards.filter((c) => c.id !== pk))
    } catch {
      error('Kartani o\'chirishda xatolik')
    }
  }

  const handleSetDefaultCard = async (pk) => {
    try {
      await paymentsAPI.setDefaultSavedCard(pk)
      success('Asosiy to\'lov kartasi belgilandi')
      await fetchCards()
    } catch {
      error('Xatolik yuz berdi')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shaxsiy kabinet</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold">Foydalanuvchi ma'lumotlari va to'lov sozlamalari</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* User Card */}
        <div className="md:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-teal-700/20">
            {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              {user?.first_name} {user?.last_name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">{user?.email}</p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              {user?.role === 'admin' ? 'Administrator' : 'Tasdiqlangan Mijoz'}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={logout}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Hisobdan chiqish
            </button>
          </div>
        </div>

        {/* Profile Update Form & Saved Cards */}
        <div className="md:col-span-8 space-y-6">
          {/* Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              Profil ma'lumotlarini tahrirlash
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Ism
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Familiya
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email (O'zgartirilmaydi)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-500 cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Telefon raqam
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+998901234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-600/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash'}
              </button>
            </form>
          </div>

          {/* Saved Bank Cards */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-600" />
                Saqlangan bank kartalari (1-click to'lov)
              </h2>
            </div>

            {loadingCards ? (
              <p className="text-xs text-slate-400">Yuklanmoqda...</p>
            ) : cards.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-400 font-medium">
                Hozircha saqlangan bank kartalari mavjud emas. Buyurtma berishda kartangizni saqlab qo'yishingiz mumkin.
              </div>
            ) : (
              <div className="space-y-2.5">
                {cards.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between bg-slate-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 rounded-md bg-teal-800 text-white text-[10px] font-bold flex items-center justify-center">
                        UZCARD
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900">
                          •••• {c.card_mask || c.pan_mask || '1234'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          Amal qilish muddati: {c.expire_date || '12/28'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {c.is_default ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3" /> Asosiy
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefaultCard(c.id)}
                          className="text-[11px] text-teal-700 hover:underline font-bold"
                        >
                          Asosiy qilish
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCard(c.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
