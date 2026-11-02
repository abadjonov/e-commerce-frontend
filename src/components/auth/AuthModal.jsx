import React, { useState } from 'react'
import { X, Mail, Lock, CheckCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const AuthModal = () => {
  const { authModal, closeAuthModal, setAuthModal, login, register, verifyOtp, resendOtp } = useAuth()
  const [loading, setLoading] = useState(false)

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [registerData, setRegisterData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '+998',
    password: '',
    password_confirm: '',
  })

  // OTP form
  const [otpCode, setOtpCode] = useState('')

  if (!authModal.isOpen) return null

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(loginEmail, loginPassword)
    } catch {
      // Toast handles error
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (email, pass) => {
    setLoading(true)
    try {
      await login(email, pass)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(registerData)
    } catch {
      // Toast handles error
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await verifyOtp(authModal.email, otpCode)
    } catch {
      // Toast handles error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative border border-slate-200">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* VIEW: LOGIN */}
        {authModal.view === 'login' && (
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 border border-teal-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Xush kelibsiz</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Hisobingizga kirish uchun elektron pochta va parolni kiriting
              </p>
            </div>

            {/* Quick Demo Login Pills */}
            <div className="mb-6 p-3.5 bg-teal-50/70 rounded-2xl border border-teal-200/60">
              <span className="text-xs font-bold text-teal-900 block mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-700" /> Sinov uchun tayyor hisoblar:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('john.doe@example.com', 'password123')}
                  className="text-xs bg-white text-teal-950 hover:bg-teal-700 hover:text-white px-2.5 py-1.5 rounded-xl font-bold shadow-xs border border-teal-200 transition cursor-pointer"
                >
                  Mijoz: john.doe@example.com
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@ecommerce.uz', 'admin123')}
                  className="text-xs bg-white text-teal-950 hover:bg-teal-700 hover:text-white px-2.5 py-1.5 rounded-xl font-bold shadow-xs border border-teal-200 transition cursor-pointer"
                >
                  Admin: admin@ecommerce.uz
                </button>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="namuna@domain.uz"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-xs font-medium transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Parol
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-xs font-medium transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
              >
                {loading ? 'Tekshirilmoqda...' : 'Kirish'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-600 font-medium">
              Hisobingiz yo'qmi?{' '}
              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, view: 'register', email: '' })}
                className="font-bold text-teal-700 hover:underline cursor-pointer"
              >
                Ro'yxatdan o'tish
              </button>
            </div>
          </div>
        )}

        {/* VIEW: REGISTER */}
        {authModal.view === 'register' && (
          <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
            <div className="mb-5">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ro'yxatdan o'tish</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Yangi akkaunt yarating va qulay xaridlardan foydalaning
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ism</label>
                  <input
                    type="text"
                    required
                    value={registerData.first_name}
                    onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                    placeholder="Ali"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Familiya</label>
                  <input
                    type="text"
                    required
                    value={registerData.last_name}
                    onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                    placeholder="Valiyev"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  placeholder="ali.valiyev@mail.uz"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefon raqam</label>
                <input
                  type="tel"
                  required
                  value={registerData.phone_number}
                  onChange={(e) => setRegisterData({ ...registerData, phone_number: e.target.value })}
                  placeholder="+998901234567"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parol</label>
                <input
                  type="password"
                  required
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="Kamida 8 ta belgi"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parolni tasdiqlang</label>
                <input
                  type="password"
                  required
                  value={registerData.password_confirm}
                  onChange={(e) => setRegisterData({ ...registerData, password_confirm: e.target.value })}
                  placeholder="Parolni qayta kiriting"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 text-xs"
              >
                {loading ? 'Yuborilmoqda...' : 'Ro\'yxatdan o\'tish'}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-600 font-medium">
              Akkauntingiz bormi?{' '}
              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, view: 'login', email: '' })}
                className="font-bold text-teal-700 hover:underline cursor-pointer"
              >
                Kirish
              </button>
            </div>
          </div>
        )}

        {/* VIEW: OTP VERIFY */}
        {authModal.view === 'otp' && (
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-teal-100">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">OTP Kodni Tasdiqlash</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                <span className="font-bold text-slate-800">{authModal.email}</span> manziliga 6 xonali tasdiqlash kodi yuborildi.
              </p>
              <div className="mt-3 text-xs bg-amber-50 text-amber-900 border border-amber-200 p-2.5 rounded-xl font-medium">
                💡 Localhost rivojlanish rejimida OTP kod terminalda (Django konsolida) chop etiladi.
              </div>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 rounded-xl border-2 border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
              >
                {loading ? 'Tasdiqlanmoqda...' : 'Tasdiqlash va Kirish'}
                <CheckCircle className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs text-slate-500 font-medium">
              <button
                type="button"
                onClick={() => resendOtp(authModal.email)}
                className="text-teal-700 hover:underline font-bold cursor-pointer"
              >
                Kodni qayta yuborish
              </button>
              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, view: 'login', email: '' })}
                className="hover:underline cursor-pointer"
              >
                Kirishga qaytish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
