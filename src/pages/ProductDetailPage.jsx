import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Star,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Check,
  Plus,
  Minus,
  ChevronRight,
  ThumbsUp,
  MessageSquare,
  Zap,
  Store,
  BadgeCheck
} from 'lucide-react'
import { catalogAPI } from '../api/catalog'
import { reviewsAPI } from '../api/reviews'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export const ProductDetailPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem, loading: cartLoading } = useCart()
  const { user, isAuthenticated, openAuthModal } = useAuth()
  const { success, error } = useToast()

  const [product, setProduct] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedImage, setSelectedImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  // Reviews state
  const [reviews, setReviews] = useState([])
  const [reviewSummary, setReviewSummary] = useState(null)
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' })
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  // Load product and reviews
  useEffect(() => {
    setLoading(true)
    catalogAPI.getProductDetail(slug)
      .then(async (res) => {
        const prod = res.data
        setProduct(prod)

        const firstVariant = prod.variants?.[0] || null
        setSelectedVariant(firstVariant)

        const img =
          prod.main_image ||
          prod.media?.[0]?.file_url ||
          prod.media?.[0]?.image_url ||
          firstVariant?.media?.[0]?.file_url ||
          prod.primary_image ||
          prod.image ||
          ''
        setSelectedImage(img)

        if (prod.id) {
          try {
            const [revRes, sumRes] = await Promise.all([
              reviewsAPI.getReviews(prod.id),
              reviewsAPI.getSummary(prod.id).catch(() => ({ data: null })),
            ])
            setReviews(revRes.data?.results || revRes.data || [])
            setReviewSummary(sumRes.data)
          } catch (err) {
            console.warn('Reviews load notice:', err)
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load product detail:', err)
        error('Mahsulot ma\'lumotlarini yuklashda xatolik yuz berdi')
      })
      .finally(() => setLoading(false))
  }, [slug, error])

  const formatPrice = (val) => {
    return Number(val || 0).toLocaleString('uz-UZ') + ' so\'m'
  }

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant)
    const variantImg = variant.media?.[0]?.image
    if (variantImg) {
      setSelectedImage(variantImg)
    }
  }

  const handleAddToCart = async () => {
    if (!selectedVariant && !product) return
    const vId = selectedVariant?.id || product.default_variant_id || product.id

    try {
      await addItem(vId, quantity)
    } catch {
      // toast in cart context
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    navigate('/checkout')
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      openAuthModal('login')
      return
    }

    setReviewSubmitting(true)
    try {
      const res = await reviewsAPI.createReview(product.id, newReview)
      success('Sharhingiz muvaffaqiyatli qabul qilindi!')
      setReviews([res.data, ...reviews])
      setNewReview({ rating: 5, title: '', comment: '' })
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Sharh yuborishda xatolik'
      error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setReviewSubmitting(false)
    }
  }

  const handleVote = async (reviewId) => {
    if (!isAuthenticated) {
      openAuthModal('login')
      return
    }

    try {
      await reviewsAPI.voteReview(reviewId, { vote_type: 'helpful' })
      success('Ovozingiz qabul qilindi')
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpful_votes: (r.helpful_votes || 0) + 1 } : r
        )
      )
    } catch (err) {
      const msg = err.response?.data?.detail || 'Ovoz berishda xatolik'
      error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
        <div className="h-96 bg-slate-100 rounded-3xl"></div>
        <div className="space-y-4">
          <div className="h-8 bg-slate-100 rounded-xl w-3/4"></div>
          <div className="h-6 bg-slate-100 rounded-xl w-1/3"></div>
          <div className="h-24 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl max-w-lg mx-auto my-12 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Mahsulot topilmadi</h2>
        <p className="text-xs text-slate-400 mb-6">Ushbu mahsulot mavjud emas yoki o'chirilgan bo'lishi mumkin</p>
        <Link to="/catalog" className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold">
          Katalogga qaytish
        </Link>
      </div>
    )
  }

  const currentPrice = selectedVariant?.price || product.min_price
  const availableQty = selectedVariant?.inventory?.available_quantity ?? 10
  const isOutOfStock = availableQty <= 0

  return (
    <div className="space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-teal-700 transition">Bosh sahifa</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link to="/catalog" className="hover:text-teal-700 transition">Katalog</Link>
        {product.categories?.[0] && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <Link to={`/catalog?category=${product.categories[0].slug}`} className="hover:text-teal-700 transition">
              {product.categories[0].name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-800 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Info (Images + Purchase Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Left: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center relative">
            {selectedImage ? (
              <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <ShoppingBag className="w-20 h-20 text-slate-200 stroke-[1]" />
            )}

            {product.brand?.name && (
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-bold px-3 py-1 rounded-lg shadow-xs border border-slate-100">
                {product.brand.name}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.media?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.media.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(m.file_url || m.image_url || m.image)}
                  className={`w-18 h-18 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                    selectedImage === (m.file_url || m.image_url || m.image) ? 'border-teal-600 ring-2 ring-teal-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={m.file_url || m.image_url || m.image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Variant Picker */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Rating & Review Count */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-amber-500 gap-1 bg-amber-50 px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold text-amber-900">
                  {product.average_rating ? Number(product.average_rating).toFixed(1) : '5.0'}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                ({reviews.length} ta xaridor sharhi)
              </span>
              <span className="text-xs text-teal-800 font-bold flex items-center gap-1 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                <Check className="w-3 h-3 text-teal-600" /> Rasmiy kafolat
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Short description */}
            {product.short_description && (
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {product.short_description}
              </p>
            )}

            {/* Price Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-950">
                {formatPrice(currentPrice)}
              </span>
              {selectedVariant?.sku && (
                <span className="text-xs text-slate-400 font-mono">
                  SKU: {selectedVariant.sku}
                </span>
              )}
            </div>

            {/* Marketplace Seller Card */}
            <div className="p-3.5 sm:p-4 bg-teal-50/70 rounded-2xl border border-teal-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-950 to-teal-900 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  {product.seller?.name ? product.seller.name.slice(0, 2).toUpperCase() : 'EC'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 font-medium">Sotuvchi:</span>
                    <strong className="text-sm font-bold text-slate-900">
                      {product.seller?.name || "E-Commerce Rasmiy Do'kon"}
                    </strong>
                    <BadgeCheck className="w-4 h-4 text-teal-600 fill-teal-100" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-bold text-amber-500">★ {product.seller?.rating || '4.9'}</span>
                    <span>•</span>
                    <span>{product.seller?.total_sales || 150}+ ta sotuv</span>
                    {product.seller?.phone_number && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline font-mono">{product.seller.phone_number}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-teal-800 bg-white px-2.5 py-1 rounded-lg border border-teal-200 shadow-xs shrink-0">
                Rasmiy do'kon
              </span>
            </div>

            {/* Variant Selector */}
            {product.variants?.length > 1 && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Variantni tanlang:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id
                    const attrLabel =
                      v.attribute_values?.map((a) => `${a.value}`).join(' / ') ||
                      v.title ||
                      v.sku
                    return (
                      <button
                        key={v.id}
                        onClick={() => handleVariantSelect(v)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/70 text-teal-900 shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
                        <span>{attrLabel}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="pt-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                Miqdori:
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-slate-200 rounded-xl bg-white overflow-hidden">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 hover:bg-slate-50 text-slate-600 transition disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= availableQty}
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2.5 hover:bg-slate-50 text-slate-600 transition disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Zaxirada mavjud: <strong className="text-slate-800">{availableQty} dona</strong>
                </span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                disabled={cartLoading || isOutOfStock}
                onClick={handleAddToCart}
                className="py-3.5 px-6 rounded-xl border-2 border-teal-600 text-teal-800 hover:bg-teal-50 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 text-teal-600" />
                Savatga qo'shish
              </button>
              <button
                disabled={cartLoading || isOutOfStock}
                onClick={handleBuyNow}
                className="py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shadow-md shadow-teal-600/20"
              >
                <Zap className="w-4 h-4" />
                Hozir xarid qilish
              </button>
            </div>

            {/* Delivery & Warranty info */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
                <Truck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Tezkor kuryer xizmati</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1 yil to'liq rasmiy kafolat</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specs Tabs */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4">
          Mahsulot tavsifi
        </h2>
        <div className="text-sm text-slate-700 leading-relaxed space-y-4 max-w-4xl">
          {product.description ? (
            <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />
          ) : (
            <p>Ushbu mahsulot haqida to'liq texnik tavsif tez orada qo'shiladi.</p>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-600" />
              Xaridorlar fikrlari ({reviews.length})
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Mahsulotni xarid qilgan mijozlarning haqqoniy baholari
            </p>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
            <Star className="w-5 h-5 text-amber-500 fill-current" />
            <span className="text-lg font-black text-amber-900">
              {product.average_rating ? Number(product.average_rating).toFixed(1) : '5.0'}
            </span>
            <span className="text-xs text-amber-800 font-medium">/ 5.0</span>
          </div>
        </div>

        {/* Write a review form */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            O'z sharhingizni qoldiring
          </h3>
          <form onSubmit={handleReviewSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Baholang (1 dan 5 gacha)
              </label>
              <div className="flex gap-2 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="p-1 cursor-pointer hover:scale-110 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= newReview.rating ? 'fill-current text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Sarlavha</label>
              <input
                type="text"
                required
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                placeholder="Sharh sarlavhasi (masalan: Juda sifatli va tezkor ishlayapti!)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Izoh</label>
              <textarea
                required
                rows={3}
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Mahsulot haqida shaxsiy fikringiz va foydalanish tajribangiz..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={reviewSubmitting}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 cursor-pointer shadow-xs"
            >
              {reviewSubmitting ? 'Yuborilmoqda...' : 'Sharhni yuborish'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="divide-y divide-slate-100">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 font-medium">
              Hozircha sharhlar mavjud emas. Birinchi bo'lib fikr bildiring!
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="py-4 space-y-2 first:pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      {rev.user?.first_name || rev.user?.email || 'Xaridor'}
                    </span>
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ''}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-800">{rev.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{rev.comment}</p>

                <div className="flex items-center gap-4 pt-1">
                  <button
                    onClick={() => handleVote(rev.id)}
                    className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-teal-700 transition cursor-pointer font-semibold"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Foydali ({rev.helpful_votes || 0})</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
