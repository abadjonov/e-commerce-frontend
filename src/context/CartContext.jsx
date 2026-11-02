import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartAPI } from '../api/cart'
import { useToast } from './ToastContext'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { success, error } = useToast()

  const fetchCart = useCallback(async () => {
    try {
      const res = await cartAPI.getCart()
      setCart(res.data)
    } catch (err) {
      console.warn('Cart load error:', err)
    }
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addItem = async (variantId, quantity = 1) => {
    setLoading(true)
    try {
      const res = await cartAPI.addItem({ variant_id: variantId, quantity })
      await fetchCart()
      success('Mahsulot savatchaga qo\'shildi!')
      return res.data
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Savatchaga qo\'shishda xatolik'
      error(typeof msg === 'string' ? msg : JSON.stringify(msg))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      return removeItem(itemId)
    }
    setLoading(true)
    try {
      await cartAPI.updateItem(itemId, { quantity })
      await fetchCart()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Miqdorni o\'zgartirishda xatolik'
      error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId) => {
    setLoading(true)
    try {
      await cartAPI.removeItem(itemId)
      await fetchCart()
      success('Mahsulot savatdan olib tashlandi')
    } catch (err) {
      const msg = err.response?.data?.detail || 'O\'chirishda xatolik'
      error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    setLoading(true)
    try {
      await cartAPI.clearCart()
      await fetchCart()
      success('Savatcha tozalandi')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Tozalashda xatolik'
      error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  const itemCount =
    cart?.total_items ||
    cart?.items?.reduce((acc, item) => acc + item.quantity, 0) ||
    0

  const subtotal = cart?.subtotal || cart?.total_amount || 0

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        loading,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        fetchCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
