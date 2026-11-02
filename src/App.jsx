import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Providers
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { NotificationProvider } from './context/NotificationContext'

// Global Components
import { Navbar } from './components/common/Navbar'
import { Footer } from './components/common/Footer'
import { AuthModal } from './components/auth/AuthModal'
import { CartDrawer } from './components/cart/CartDrawer'

// Pages
import { HomePage } from './pages/HomePage'
import { CatalogPage } from './pages/CatalogPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderSuccessPage } from './pages/OrderSuccessPage'
import { OrdersPage } from './pages/OrdersPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { ProfilePage } from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-600 selection:text-white">
                {/* Navbar */}
                <Navbar />

                {/* Main Content Area */}
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/product/:slug" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:orderNumber" element={<OrderDetailPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>

                {/* Footer */}
                <Footer />

                {/* Global Modals & Drawers */}
                <AuthModal />
                <CartDrawer />
              </div>
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
