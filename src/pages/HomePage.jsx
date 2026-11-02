import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Sparkles,
  Flame,
  Zap,
  Clock,
  Store,
  BadgeCheck,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Smartphone,
  Laptop,
  Tv,
  Shirt,
  Footprints,
  Dumbbell,
  Coffee,
  Car,
  Home,
  Check
} from 'lucide-react'
import { catalogAPI } from '../api/catalog'
import { ProductCard } from '../components/catalog/ProductCard'
import { useCart } from '../context/CartContext'

// Category visual icon mapper
const getCategoryIcon = (slug) => {
  switch (slug) {
    case 'smartfonlar':
      return <Smartphone className="w-6 h-6 text-sky-500" />
    case 'noutbuklar':
      return <Laptop className="w-6 h-6 text-indigo-500" />
    case 'elektronika':
      return <Tv className="w-6 h-6 text-purple-500" />
    case 'maishiy-texnika':
      return <Home className="w-6 h-6 text-teal-500" />
    case 'kiyim-kechak':
      return <Shirt className="w-6 h-6 text-pink-500" />
    case 'poyabzallar':
      return <Footprints className="w-6 h-6 text-amber-500" />
    case 'sport':
      return <Dumbbell className="w-6 h-6 text-emerald-500" />
    case 'gozallik':
      return <Sparkles className="w-6 h-6 text-rose-500" />
    case 'uy-va-oshxona':
      return <Coffee className="w-6 h-6 text-amber-600" />
    case 'avtotovarlar':
      return <Car className="w-6 h-6 text-blue-600" />
    default:
      return <Sparkles className="w-6 h-6 text-teal-500" />
  }
}

export const HomePage = () => {
  const [categories, setCategories] = useState([])
  const [sellers, setSellers] = useState([])
  const [onSaleProducts, setOnSaleProducts] = useState([])
  const [popularProducts, setPopularProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)

  // Deal of the Day state
  const { addItem, loading: cartLoading } = useCart()
  const [dealAdded, setDealAdded] = useState(false)
  
  // Real-time Countdown timer for Deal of the Day (Hours : Minutes : Seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 48, seconds: 23 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return { hours: 12, minutes: 0, seconds: 0 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const loadMarketplaceData = async () => {
      try {
        const [catRes, featRes, sellersRes] = await Promise.all([
          catalogAPI.getCategories().catch(() => ({ data: [] })),
          catalogAPI.getFeatured().catch(() => ({ data: { on_sale: [], new_arrivals: [], popular: [] } })),
          catalogAPI.getSellers().catch(() => ({ data: [] })),
        ])

        setCategories(catRes.data || [])
        setOnSaleProducts(featRes.data?.on_sale || [])
        setNewArrivals(featRes.data?.new_arrivals || [])
        setPopularProducts(featRes.data?.popular || [])
        setSellers(sellersRes.data || [])
      } catch (err) {
        console.error('Home page load error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadMarketplaceData()
  }, [])

  // Deal of the day product (first on-sale item or fallback)
  const dealOfTheDay = onSaleProducts[0] || newArrivals[0]

  const handleBuyDeal = async () => {
    if (!dealOfTheDay) return
    const variantId = dealOfTheDay.default_variant_id || dealOfTheDay.id
    try {
      await addItem(variantId, 1)
      setDealAdded(true)
      setTimeout(() => setDealAdded(false), 2000)
    } catch {
      // handled
    }
  }

  const formatPrice = (val) => {
    return Number(val || 0).toLocaleString('uz-UZ') + ' so\'m'
  }

  return (
    <div className="space-y-10 sm:space-y-12 pb-16">
      
      {/* 1. COMPACT HERO SECTION + DEAL OF THE DAY */}
      <section className="bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 rounded-3xl text-white shadow-xl border border-teal-900/30 overflow-hidden relative">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -bottom-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Marketplace Pitch */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>O'zbekistondagi Ishonchli Multi-Vendor Marketplace</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Sifatli brendlar, <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-amber-200 bg-clip-text text-transparent">
                haqqoniy narxlarda
              </span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed max-w-lg font-medium">
              100+ rasmiy do'konlar, flagman smartfonlar, original kiyim va maishiy texnika. 1 kunda butun respublika bo'ylab kafolatlangan yetkazish.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-teal-700/30 transition text-xs sm:text-sm cursor-pointer"
              >
                Katalogga o'tish
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/catalog?ordering=-created_at"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-xl backdrop-blur-md transition text-xs sm:text-sm cursor-pointer border border-white/10"
              >
                Yangi tovarlar
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-lg sm:text-xl font-black text-teal-400 block">10,000+</span>
                <span className="text-slate-400 text-[11px]">Mahsulotlar</span>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black text-teal-400 block">100+</span>
                <span className="text-slate-400 text-[11px]">Rasmiy sotuvchilar</span>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black text-teal-400 block">24/7</span>
                <span className="text-slate-400 text-[11px]">Qo'llab-quvvatlash</span>
              </div>
            </div>
          </div>

          {/* Right Column: Deal of the Day Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-teal-500/30 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  <span>Kunning super taklifi</span>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-teal-300 font-bold">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span>:</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-teal-300 font-bold">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span>:</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-teal-300 font-bold">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {dealOfTheDay ? (
                <div className="flex gap-4 items-center">
                  <Link to={`/product/${dealOfTheDay.slug}`} className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-950 rounded-xl overflow-hidden shrink-0 border border-slate-800 relative group">
                    <img
                      src={dealOfTheDay.main_image || dealOfTheDay.image || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80'}
                      alt={dealOfTheDay.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <span className="absolute top-1 right-1 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                      -15%
                    </span>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[11px] text-teal-400 font-medium mb-1">
                      <Store className="w-3 h-3 text-teal-400" />
                      <span className="truncate">{dealOfTheDay.seller?.name || 'Rasmiy do\'kon'}</span>
                    </div>

                    <Link
                      to={`/product/${dealOfTheDay.slug}`}
                      className="text-xs sm:text-sm font-bold text-white hover:text-teal-300 transition line-clamp-2 leading-tight"
                    >
                      {dealOfTheDay.name}
                    </Link>

                    <div className="mt-2">
                      <div className="text-[11px] text-slate-400 line-through">
                        {formatPrice(dealOfTheDay.price?.default_price || 16500000)}
                      </div>
                      <div className="text-sm sm:text-base font-black text-teal-300">
                        {formatPrice(dealOfTheDay.price?.default_final_price || 14890000)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  🔥 Omborda faqat <strong className="text-amber-400">7 dona</strong> qoldi
                </span>
                <button
                  onClick={handleBuyDeal}
                  disabled={cartLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    dealAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-teal-600 hover:bg-teal-500 text-white shadow-md'
                  }`}
                >
                  {dealAdded ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{dealAdded ? 'Qo\'shildi!' : 'Xarid qilish'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MARKETPLACE TRUST BAR */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">1 kunda yetkazish</h4>
            <p className="text-[11px] text-slate-500">O'zbekiston bo'ylab tezkor</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">100% original</h4>
            <p className="text-[11px] text-slate-500">Rasmiy kafolat bilan</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">Xavfsiz to'lov</h4>
            <p className="text-[11px] text-slate-500">Payme, Click va nasiya</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">14 kun kafolat</h4>
            <p className="text-[11px] text-slate-500">Muammosiz qaytarish</p>
          </div>
        </div>
      </section>

      {/* 3. VISUAL CATEGORIES (Pure Uzbek with real icons) */}
      <section>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">Ommabop toifalar</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">O'zingizga kerakli mahsulot turini tanlang</p>
          </div>
          <Link
            to="/catalog"
            className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            Barchasi <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              className="group p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-900/5 transition text-center flex flex-col items-center justify-center gap-2.5"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-teal-50 transition-colors flex items-center justify-center border border-slate-100 group-hover:border-teal-200">
                {getCategoryIcon(cat.slug)}
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-teal-700 transition truncate w-full">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FLASH SALES / KATTA CHEGIRMALAR */}
      {onSaleProducts.length > 0 && (
        <section className="bg-gradient-to-r from-teal-50/70 via-emerald-50/40 to-white rounded-3xl p-5 sm:p-7 border border-teal-200/60 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                  <span>⚡ Katta Chegirmalar</span>
                  <span className="text-xs bg-rose-100 text-rose-700 font-extrabold px-2.5 py-0.5 rounded-full">
                    Aksiya
                  </span>
                </h2>
                <p className="text-xs text-slate-600">Eng yuqori chegirmalarga ega brend mahsulotlar</p>
              </div>
            </div>

            <Link
              to="/catalog"
              className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 self-start sm:self-auto"
            >
              Barcha chegirmalar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {onSaleProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. TOP MARKETPLACE SELLERS / RASMIY SOTUVCHILAR */}
      {sellers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  🏪 Rasmiy do'konlar va Sotuvchilar
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  O'zbekistondagi eng yaxshi reytingga ega ishonchli sotuvchilar
                </p>
              </div>
            </div>

            <Link
              to="/catalog"
              className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              Barchasi <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sellers.slice(0, 6).map((seller) => (
              <div
                key={seller.id}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-900/5 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-900 to-teal-900 text-white flex items-center justify-center font-black text-base shadow-sm">
                      {seller.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                          {seller.name}
                        </h3>
                        {seller.is_verified && (
                          <BadgeCheck className="w-4 h-4 text-teal-600 shrink-0 fill-teal-50" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-bold text-amber-500">★ {seller.rating}</span>
                        <span>•</span>
                        <span>{seller.total_sales}+ ta sotuv</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {seller.description || 'Sifatli va kafolatlangan tovarlar rasmiy yetkazib beruvchisi.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md">
                    Rasmiy kafolat
                  </span>
                  <Link
                    to="/catalog"
                    className="text-xs font-bold text-slate-900 hover:text-teal-700 flex items-center gap-1"
                  >
                    Do'konga o'tish <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. POPULAR PRODUCTS / OMMABOP TOVARLAR */}
      {popularProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">Ommabop tovarlar</h2>
                <p className="text-xs text-slate-500">Xaridorlar tomonidan eng ko'p tanlanayotgan mahsulotlar</p>
              </div>
            </div>
            <Link
              to="/catalog"
              className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              Ko'proq <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {popularProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 7. NEW ARRIVALS / YANGI KELGANLAR */}
      <section>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">✨ Yangi kelganlar</h2>
              <p className="text-xs text-slate-500">Platformamizga yangi qo'shilgan original mahsulotlar</p>
            </div>
          </div>
          <Link
            to="/catalog?ordering=-created_at"
            className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            Hammasini ko'rish <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
