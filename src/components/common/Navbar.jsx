import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Store,
  ShoppingBag,
  Search,
  User,
  Bell,
  Package,
  Layers,
  LogOut,
  ChevronDown,
  Sparkles,
  Compass
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useNotifications } from '../../context/NotificationContext'
import { catalogAPI } from '../../api/catalog'
import { SellerModal } from './SellerModal'

export const Navbar = () => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth()
  const { itemCount, subtotal, openDrawer } = useCart()
  const { unreadCount, notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotifications()
  const navigate = useNavigate()

  // State
  const [categories, setCategories] = useState([])
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Search autocomplete
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)

  const searchRef = useRef(null)
  const notifRef = useRef(null)
  const userMenuRef = useRef(null)
  const categoryMenuRef = useRef(null)

  // Load root categories on mount
  useEffect(() => {
    catalogAPI.getCategories()
      .then((res) => {
        setCategories(res.data || [])
      })
      .catch((err) => console.warn('Categories load error:', err))
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSuggestionsOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false)
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setIsCategoryMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search suggestion
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([])
      setIsSuggestionsOpen(false)
      return
    }

    const timer = setTimeout(() => {
      catalogAPI.getSuggestions(searchQuery.trim())
        .then((res) => {
          setSuggestions(res.data?.suggestions || res.data || [])
          setIsSuggestionsOpen(true)
        })
        .catch(() => setSuggestions([]))
    }, 250)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setIsSuggestionsOpen(false)
    navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleSuggestionClick = (item) => {
    setIsSuggestionsOpen(false)
    setSearchQuery('')
    if (item.slug) {
      navigate(`/product/${item.slug}`)
    } else {
      navigate(`/catalog?search=${encodeURIComponent(item.name || item)}`)
    }
  }

  const handleNotifToggle = () => {
    if (!isNotifOpen) {
      fetchNotifications()
    }
    setIsNotifOpen(!isNotifOpen)
  }

  const formatPrice = (val) => {
    return Number(val || 0).toLocaleString('uz-UZ') + ' so\'m'
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Banner Bar - Distinct Midnight Slate & Teal Accent */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 sm:px-8 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-teal-400 font-semibold">
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            Rasmiy Onlayn Platforma
          </span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span className="hidden sm:inline text-slate-400">📞 Yordam markazi: +998 71 200-00-00</span>
          <span className="hidden md:inline text-slate-700">|</span>
          <span className="hidden md:inline text-slate-400">Tez va kafolatli yetkazib berish</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSellerModalOpen(true)}
            className="flex items-center gap-1.5 text-xs text-teal-300 hover:text-white font-semibold transition bg-teal-900/60 hover:bg-teal-800/80 px-2.5 py-1 rounded-lg border border-teal-700/50 cursor-pointer shadow-xs"
          >
            <Store className="w-3.5 h-3.5 text-teal-400" />
            <span>Sotuvchi bo'lish</span>
          </button>
          <span className="text-slate-700">|</span>
          {isAuthenticated ? (
            <span className="text-teal-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 inline-block animate-pulse"></span>
              {user?.email}
            </span>
          ) : (
            <span className="text-slate-400">Mehmon rejimida</span>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo - Distinct Emerald-Teal Diamond Emblem */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition duration-300">
            <Sparkles className="w-5 h-5 text-teal-100" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-black tracking-tight text-slate-950">
                E-
              </span>
              <span className="text-xl font-bold tracking-tight text-teal-600">
                COMMERCE
              </span>
            </div>
            <span className="text-[10px] block font-bold text-teal-600 uppercase tracking-widest -mt-1">
              Marketplace
            </span>
          </div>
        </Link>

        {/* Catalog Menu Button */}
        <div className="relative" ref={categoryMenuRef}>
          <button
            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
            className="hidden md:flex items-center gap-2 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold px-4 py-2.5 rounded-xl transition text-sm cursor-pointer border border-teal-200/60"
          >
            <Layers className="w-4 h-4 text-teal-700" />
            <span>Katalog</span>
            <ChevronDown className={`w-3.5 h-3.5 text-teal-600 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Categories Dropdown */}
          {isCategoryMenuOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Barcha Bo'limlar
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/catalog?category=${cat.slug}`}
                    onClick={() => setIsCategoryMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-teal-50/70 text-sm font-semibold text-slate-700 hover:text-teal-800 transition"
                  >
                    <span>{cat.name}</span>
                    {cat.children?.length > 0 && (
                      <span className="text-xs bg-slate-100 text-slate-500 rounded-md px-1.5 py-0.5 font-bold">
                        {cat.children.length}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Input with Autocomplete */}
        <div className="flex-1 max-w-xl relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mahsulotlar, modellar va brendlar bo'yicha qidirish..."
              className="w-full bg-slate-100 hover:bg-slate-200/60 focus:bg-white pl-10 pr-24 py-2.5 rounded-xl border border-transparent focus:border-teal-600 focus:outline-none text-sm transition font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-xs"
            >
              Topish
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {isSuggestionsOpen && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tezkor qidiruv takliflari
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(item)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 text-slate-800 flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="w-3.5 h-3.5 text-teal-600" />
                    <span className="font-medium">{item.name || item}</span>
                  </div>
                  {item.category && (
                    <span className="text-xs text-slate-400">{item.category}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          {isAuthenticated && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleNotifToggle}
                className="relative p-2.5 rounded-xl text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition cursor-pointer"
                title="Bildirishnomalar"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-fade-in">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800">Xabarlar</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-teal-700 hover:underline font-semibold"
                      >
                        Barchasini o'qilgan qilish
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        Bildirishnomalar mavjud emas
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition ${
                            !n.is_read ? 'bg-teal-50/50 font-medium' : 'text-slate-600'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-900">{n.title || 'Bildirishnoma'}</span>
                            <span className="text-[10px] text-slate-400">
                              {n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}
                            </span>
                          </div>
                          <p className="text-slate-600 line-clamp-2">{n.message || n.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders Quick Link */}
          <Link
            to={isAuthenticated ? '/orders' : '#'}
            onClick={(e) => {
              if (!isAuthenticated) {
                e.preventDefault()
                openAuthModal('login')
              }
            }}
            className="hidden sm:flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition text-sm font-semibold"
            title="Buyurtmalarim"
          >
            <Package className="w-5 h-5 text-slate-500" />
            <span className="hidden lg:inline">Buyurtmalar</span>
          </Link>

          {/* Cart Trigger */}
          <button
            onClick={openDrawer}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2.5 rounded-xl font-bold shadow-sm transition text-sm cursor-pointer shadow-teal-600/20"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">
              {itemCount > 0 ? formatPrice(subtotal) : 'Savatcha'}
            </span>
          </button>

          {/* User Profile / Auth Button */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-slate-200 hover:border-slate-300 transition text-sm font-semibold text-slate-700 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 font-extrabold text-xs flex items-center justify-center">
                  {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden md:inline max-w-[90px] truncate">
                  {user?.first_name || user?.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in text-sm font-medium">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition"
                  >
                    <User className="w-4 h-4 text-teal-600" />
                    Profil sozlamalari
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition"
                  >
                    <Package className="w-4 h-4 text-teal-600" />
                    Buyurtmalar tarixi
                  </Link>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      logout()
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition border-t border-slate-100 cursor-pointer font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    Chiqish
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold transition cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>Kirish</span>
            </button>
          )}
        </div>
      </div>

      {/* Subcategory quick bar */}
      <div className="border-t border-slate-100 bg-white hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-6 overflow-x-auto no-scrollbar text-xs font-bold text-slate-600">
          <Link
            to="/catalog"
            className="hover:text-teal-600 transition whitespace-nowrap text-teal-700 font-extrabold flex items-center gap-1.5"
          >
            <span>Barcha toifalar</span>
          </Link>
          {categories.slice(0, 7).map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              className="hover:text-teal-700 transition whitespace-nowrap text-slate-600"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
      <SellerModal isOpen={isSellerModalOpen} onClose={() => setIsSellerModalOpen(false)} />
    </header>
  )
}
