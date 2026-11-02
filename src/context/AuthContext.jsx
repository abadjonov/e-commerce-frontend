import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/auth'
import { cartAPI } from '../api/cart'
import { useToast } from './ToastContext'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authModal, setAuthModal] = useState({ isOpen: false, view: 'login', email: '' })
  const { success, error } = useToast()

  const loadUserProfile = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await authAPI.getProfile()
      setUser(res.data)
    } catch (err) {
      console.error('Failed to load user profile:', err)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUserProfile()

    const handleLogoutEvent = () => {
      setUser(null)
      error('Sessiyangiz tugadi. Iltimos, qayta kiring.')
    }

    window.addEventListener('auth:logout', handleLogoutEvent)
    return () => window.removeEventListener('auth:logout', handleLogoutEvent)
  }, [loadUserProfile, error])

  const mergeGuestCart = async () => {
    const guestKey = localStorage.getItem('cart_session_key')
    if (guestKey) {
      try {
        await cartAPI.mergeCart(guestKey)
        localStorage.removeItem('cart_session_key')
      } catch (err) {
        console.warn('Cart merge notice:', err)
      }
    }
  }

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password })
      const { access, refresh, user: userData } = res.data
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      setUser(userData)
      await mergeGuestCart()
      setAuthModal({ isOpen: false, view: 'login', email: '' })
      success(`Xush kelibsiz, ${userData.first_name || userData.email}!`)
      return res.data
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Kirishda xatolik yuz berdi'
      error(typeof detail === 'string' ? detail : JSON.stringify(detail))
      throw err
    }
  }

  const register = async (formData) => {
    try {
      const res = await authAPI.register(formData)
      success(res.data.message || 'Tasdiqlash kodi emailingizga yuborildi!')
      setAuthModal({ isOpen: true, view: 'otp', email: formData.email })
      return res.data
    } catch (err) {
      const errors = err.response?.data
      let msg = 'Ro\'yxatdan o\'tishda xatolik'
      if (errors) {
        if (typeof errors === 'string') msg = errors
        else if (errors.detail) msg = errors.detail
        else {
          const firstKey = Object.keys(errors)[0]
          msg = `${firstKey}: ${Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey]}`
        }
      }
      error(msg)
      throw err
    }
  }

  const verifyOtp = async (email, otp_code) => {
    try {
      const res = await authAPI.verifyOtp({ email, otp_code })
      const { access, refresh, user: userData } = res.data
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      setUser(userData)
      await mergeGuestCart()
      setAuthModal({ isOpen: false, view: 'login', email: '' })
      success('Akkauntingiz muvaffaqiyatli tasdiqlandi!')
      return res.data
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'OTP kod xato yoki muddati o\'tgan'
      error(typeof msg === 'string' ? msg : JSON.stringify(msg))
      throw err
    }
  }

  const resendOtp = async (email) => {
    try {
      const res = await authAPI.resendOtp({ email })
      success(res.data.message || 'Yangi OTP kod yuborildi!')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Kodni qayta yuborishda xatolik'
      error(typeof msg === 'string' ? msg : JSON.stringify(msg))
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    success('Tizimdan muvaffaqiyatli chiqildi.')
  }

  const openAuthModal = (view = 'login', email = '') => {
    setAuthModal({ isOpen: true, view, email })
  }

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, view: 'login', email: '' })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        loadUserProfile,
        authModal,
        openAuthModal,
        closeAuthModal,
        setAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
