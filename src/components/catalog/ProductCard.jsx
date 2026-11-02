import React from 'react'
import { Link } from 'react-router-dom'
import { Star, ShoppingBag, Check, Store, BadgeCheck } from 'lucide-react'
import { useCart } from '../../context/CartContext'

export const ProductCard = ({ product }) => {
  const { addItem, loading } = useCart()
  const [added, setAdded] = React.useState(false)

  const formatPrice = (val) => {
    return Number(val || 0).toLocaleString('uz-UZ') + ' so\'m'
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const variantId =
      product.default_variant_id ||
      product.variants?.[0]?.id ||
      product.variant_id ||
      product.id

    try {
      await addItem(variantId, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      // Toast handles error
    }
  }

  // Calculate prices
  const defaultPrice = product.price?.default_price || product.min_price || product.price || 0
  const finalPrice = product.price?.default_final_price || product.price?.default_discount_price || defaultPrice
  const hasDiscount = product.price?.is_on_sale || (product.price?.default_discount_price && Number(product.price.default_discount_price) < Number(defaultPrice))
  
  const discountPercent = hasDiscount && Number(defaultPrice) > 0
    ? Math.round((1 - Number(finalPrice) / Number(defaultPrice)) * 100)
    : 0

  const monthlyInstallment = Math.round(Number(finalPrice) / 12)

  const imgUrl =
    product.main_image ||
    product.primary_image ||
    product.image ||
    product.media?.[0]?.file_url ||
    product.media?.[0]?.image_url ||
    ''

  const sellerName = product.seller?.name || (product.brand?.name ? `${product.brand.name} Rasmiy` : 'E-Commerce Rasmiy')
  const ratingScore = product.rating?.average || product.average_rating || '4.9'
  const reviewsCount = product.rating?.total_reviews || product.reviews_count || 48
  const inStock = product.is_in_stock !== false && product.in_stock !== false

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-950/5 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Product Image Link */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-square bg-slate-50 overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
            <ShoppingBag className="w-12 h-12 stroke-[1.2]" />
            <span className="text-[11px] text-slate-400 mt-2 font-medium">Rasm mavjud emas</span>
          </div>
        )}

        {/* Brand pill */}
        {product.brand?.name && (
          <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-slate-100">
            {product.brand.name}
          </span>
        )}

        {/* Discount badge */}
        {hasDiscount && discountPercent > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse">
            -{discountPercent}%
          </span>
        )}

        {/* Out of stock pill */}
        {!inStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              Hozirda tugagan
            </span>
          </div>
        )}
      </Link>

      {/* Product Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller / Store info */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-teal-800 mb-1.5 truncate">
            <Store className="w-3.5 h-3.5 shrink-0 text-teal-600" />
            <span className="truncate hover:underline">{sellerName}</span>
            <BadgeCheck className="w-3.5 h-3.5 text-teal-600 shrink-0 fill-teal-100" />
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.slug}`}
            className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-teal-700 transition line-clamp-2 leading-snug min-h-[2.4rem]"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-slate-700">
              {Number(ratingScore).toFixed(1)}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400">
              ({reviewsCount} baho)
            </span>
          </div>

          {/* Installment pill */}
          <div className="mt-2 inline-block bg-teal-50 border border-teal-100/60 rounded-md px-2 py-0.5 text-[10px] font-semibold text-teal-900">
            {monthlyInstallment.toLocaleString('uz-UZ')} so'm/oy
          </div>
        </div>

        {/* Price and Cart Button */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <div>
            {hasDiscount && (
              <span className="text-[11px] text-slate-400 line-through block leading-tight font-medium">
                {formatPrice(defaultPrice)}
              </span>
            )}
            <span className="text-sm sm:text-base font-black text-slate-950 block leading-tight">
              {formatPrice(finalPrice)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={loading || !inStock}
            className={`p-2 sm:p-2.5 rounded-xl font-bold transition flex items-center justify-center cursor-pointer shrink-0 ${
              added
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={added ? 'Savatga qo\'shildi' : 'Savatga qo\'shish'}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
