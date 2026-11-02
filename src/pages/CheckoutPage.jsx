import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  CreditCard,
  Truck,
  MapPin,
  ArrowRight,
  User,
  ShoppingBag,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { ordersAPI } from '../api/orders'
import { useToast } from '../context/ToastContext'

export const CheckoutPage = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth()
  const { cart, itemCount, subtotal, fetchCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const { success, error } = useToast()

  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  // Form State
  const [shippingAddress, setShippingAddress] = useState({
    recipient_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    phone_number: user?.phone_number || '+998',
    region: 'Toshkent shahri',
    district: 'Yunusobod tumani',
    street_address: '',
    apartment_office: '',
    postal_code: '100000',
    delivery_instructions: '',
  })

  const [shippingMethod, setShippingMethod] = useState('STANDARD')
  const [paymentMethod, setPaymentMethod] = useState('PAYME')
  const [couponCode, setCouponCode] = useState(location.state?.couponCode || '')
  const [customerNotes, setCustomerNotes] = useState('')

  // Bank Card Form State
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cardholder: '',
    cvv: '',
  })

  const getCardType = (number) => {
    const clean = (number || '').replace(/\s+/g, '')
    if (clean.startsWith('8600') || clean.startsWith('5614')) return { name: 'Uzcard', color: 'bg-emerald-600', text: 'UZCARD' }
    if (clean.startsWith('9860')) return { name: 'Humo', color: 'bg-amber-600', text: 'HUMO' }
    if (clean.startsWith('4')) return { name: 'Visa', color: 'bg-blue-600', text: 'VISA' }
    if (clean.startsWith('5')) return { name: 'Mastercard', color: 'bg-rose-600', text: 'MASTERCARD' }
    return { name: 'Bank Card', color: 'bg-slate-700', text: 'UZCARD / HUMO / VISA' }
  }

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardData((prev) => ({ ...prev, cardNumber: formatted }))
  }

  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    let formatted = raw
    if (raw.length >= 2) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`
    }
    setCardData((prev) => ({ ...prev, expiry: formatted }))
  }

  const handleCvvChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    setCardData((prev) => ({ ...prev, cvv: raw }))
  }

  const handleCardholderChange = (e) => {
    setCardData((prev) => ({ ...prev, cardholder: e.target.value.toUpperCase() }))
  }

  useEffect(() => {
    if (user && !shippingAddress.recipient_name) {
      setShippingAddress((prev) => ({
        ...prev,
        recipient_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        phone_number: user.phone_number || prev.phone_number,
      }))
    }
  }, [user])

  useEffect(() => {
    if (!isAuthenticated) return

    setPreviewLoading(true)
    ordersAPI.previewCheckout({
      shipping_method: shippingMethod,
      coupon_code: couponCode || undefined,
      region: shippingAddress.region,
    })
      .then((res) => {
        setPreviewData(res.data)
      })
      .catch((err) => {
        console.warn('Checkout preview notice:', err)
      })
      .finally(() => setPreviewLoading(false))
  }, [isAuthenticated, shippingMethod, couponCode, shippingAddress.region])

  const formatPrice = (val) => {
    return Number(val || 0).toLocaleString('uz-UZ') + ' so\'m'
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      openAuthModal('login')
      return
    }

    if (!shippingAddress.street_address.trim()) {
      error('Iltimos, ko\'cha va uy manzilini to\'liq kiriting!')
      return
    }

    setLoading(true)
    try {
      const payload = {
        shipping_address: shippingAddress,
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        coupon_code: couponCode.trim() || null,
        customer_notes: customerNotes.trim(),
      }

      const res = await ordersAPI.createOrder(payload)
      const order = res.data
      success(`Buyurtma #${order.order_number} muvaffaqiyatli qabul qilindi!`)
      await fetchCart()

      navigate(`/order-success/${order.order_number}`, {
        state: { order, paymentMethod },
      })
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Buyurtma rasmiylashtirishda xatolik'
      error(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-slate-200 shadow-xs text-center space-y-4">
        <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto border border-teal-100">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Buyurtma berish uchun kiring</h2>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          Xaridni xavfsiz amalga oshirish va buyurtmalar holatini kuzatish uchun profilingizga kiring yoki ro'yxatdan o'ting.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="w-full py-3 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition"
        >
          Kirish / Ro'yxatdan o'tish
        </button>
      </div>
    )
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-slate-200 shadow-xs text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-black text-slate-900">Savatchangiz bo'sh</h2>
        <p className="text-xs text-slate-500">Buyurtma berishdan oldin mahsulotlarni savatga qo'shing.</p>
        <Link to="/catalog" className="inline-block px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold">
          Katalogga o'tish
        </Link>
      </div>
    )
  }

  const calculatedSubtotal = previewData?.subtotal || subtotal
  const shippingFee = previewData?.shipping_fee || (shippingMethod === 'EXPRESS' ? 30000 : 0)
  const discount = previewData?.discount_amount || 0
  const grandTotal = previewData?.total_amount || (Number(calculatedSubtotal) + Number(shippingFee) - Number(discount))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Buyurtmani rasmiylashtirish
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold">
          Yetkazib berish ma'lumotlari va to'lov usulini tasdiqlang
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-4 h-4 text-teal-600" />
              1. Yetkazib berish manzili
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Qabul qiluvchi ismi va familiyasi *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.recipient_name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, recipient_name: e.target.value })}
                  placeholder="Ali Valiyev"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Telefon raqam *
                </label>
                <input
                  type="tel"
                  required
                  value={shippingAddress.phone_number}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone_number: e.target.value })}
                  placeholder="+998901234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Viloyat / Shahar *
                </label>
                <select
                  value={shippingAddress.region}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, region: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white cursor-pointer font-medium"
                >
                  <option value="Toshkent shahri">Toshkent shahri</option>
                  <option value="Toshkent viloyati">Toshkent viloyati</option>
                  <option value="Samarqand">Samarqand viloyati</option>
                  <option value="Buxoro">Buxoro viloyati</option>
                  <option value="Farg'ona">Farg'ona viloyati</option>
                  <option value="Andijon">Andijon viloyati</option>
                  <option value="Namangan">Namangan viloyati</option>
                  <option value="Xorazm">Xorazm viloyati</option>
                  <option value="Qashqadaryo">Qashqadaryo viloyati</option>
                  <option value="Surxondaryo">Surxondaryo viloyati</option>
                  <option value="Navoiy">Navoiy viloyati</option>
                  <option value="Jizzax">Jizzax viloyati</option>
                  <option value="Sirdaryo">Sirdaryo viloyati</option>
                  <option value="Qoraqalpog'iston">Qoraqalpog'iston Respublikasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Tuman / Shaharcha *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.district}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, district: e.target.value })}
                  placeholder="Yunusobod tumani"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Ko'cha, uy va xonadon manzili *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.street_address}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street_address: e.target.value })}
                  placeholder="Amir Temur shoh ko'chasi, 25-uy, 42-xonadon"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Kuryer uchun qo'shimcha eslatma (ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={shippingAddress.delivery_instructions}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, delivery_instructions: e.target.value })}
                  placeholder="Domofon kodi, mo'ljal va h.k."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Shipping Method */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Truck className="w-4 h-4 text-teal-600" />
              2. Yetkazib berish tezligi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition ${
                  shippingMethod === 'STANDARD'
                    ? 'border-teal-600 bg-teal-50/50 text-teal-950 shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value="STANDARD"
                  checked={shippingMethod === 'STANDARD'}
                  onChange={() => setShippingMethod('STANDARD')}
                  className="mt-0.5 text-teal-600"
                />
                <div>
                  <span className="font-bold text-xs block">Standart yetkazib berish</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">1-2 ish kunida yetkaziladi</span>
                  <span className="text-xs font-bold text-emerald-600 block mt-1">Bepul</span>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition ${
                  shippingMethod === 'EXPRESS'
                    ? 'border-teal-600 bg-teal-50/50 text-teal-950 shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value="EXPRESS"
                  checked={shippingMethod === 'EXPRESS'}
                  onChange={() => setShippingMethod('EXPRESS')}
                  className="mt-0.5 text-teal-600"
                />
                <div>
                  <span className="font-bold text-xs block">Tezkor (Express) yetkazish</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Shu kunning o'zida bir necha soatda</span>
                  <span className="text-xs font-bold text-slate-900 block mt-1">30 000 so'm</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-4 h-4 text-teal-600" />
              3. To'lov usuli
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === 'PAYME'
                    ? 'border-teal-600 bg-teal-50/50 text-teal-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PAYME"
                    checked={paymentMethod === 'PAYME'}
                    onChange={() => setPaymentMethod('PAYME')}
                    className="text-teal-600"
                  />
                  <div>
                    <span className="font-bold text-xs block">Payme</span>
                    <span className="text-[10px] text-slate-400">Onlayn to'lov kartasi</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[11px] font-bold border border-teal-100">Payme</span>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === 'CLICK'
                    ? 'border-teal-600 bg-teal-50/50 text-teal-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CLICK"
                    checked={paymentMethod === 'CLICK'}
                    onChange={() => setPaymentMethod('CLICK')}
                    className="text-teal-600"
                  />
                  <div>
                    <span className="font-bold text-xs block">Click</span>
                    <span className="text-[10px] text-slate-400">Onlayn to'lov tizimi</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100">Click</span>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === 'CARD'
                    ? 'border-teal-600 bg-teal-50/50 text-teal-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="text-teal-600"
                  />
                  <div>
                    <span className="font-bold text-xs block">Bank kartasi</span>
                    <span className="text-[10px] text-slate-400">Uzcard, Humo, Visa, Mastercard</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">Uzcard</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">Humo</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">Visa</span>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-teal-600 bg-teal-50/50 text-teal-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH_ON_DELIVERY"
                    checked={paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                    className="text-teal-600"
                  />
                  <div>
                    <span className="font-bold text-xs block">Naqd pul</span>
                    <span className="text-[10px] text-slate-400">Qabul qilganda to'lash</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-bold">Naqd</span>
              </label>
            </div>

            {/* Expandable Bank Card Details when CARD is selected */}
            {paymentMethod === 'CARD' && (
              <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950 text-white border border-teal-500/30 shadow-lg space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-teal-400" />
                    <span className="text-sm font-bold tracking-tight">Karta ma\'lumotlarini kiriting</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {getCardType(cardData.cardNumber).text}
                  </span>
                </div>

                {/* Visual Mini Card Preview */}
                <div className="bg-gradient-to-tr from-slate-800 via-slate-900 to-teal-900 rounded-xl p-4 border border-teal-500/40 shadow-inner space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="w-9 h-6 bg-amber-400/80 rounded-md border border-amber-300/40 shadow-xs flex items-center justify-center">
                      <div className="w-6 h-4 border border-amber-600/40 rounded-xs"></div>
                    </div>
                    <span className="text-xs font-black tracking-widest text-teal-300">
                      {getCardType(cardData.cardNumber).name.toUpperCase()}
                    </span>
                  </div>

                  <div className="font-mono text-base sm:text-lg tracking-widest font-black text-white/95 text-center py-1">
                    {cardData.cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between items-end text-[11px] text-slate-300 font-mono">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400">Karta egasi</span>
                      <span className="font-bold text-white uppercase">{cardData.cardholder || 'KARTA EGASI'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400">Muddati</span>
                      <span className="font-bold text-white">{cardData.expiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Input Fields */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Karta raqami (16 xona) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="8600 0000 0000 0000"
                      value={cardData.cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                      className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Amal qilish muddati <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY (masalan 12/28)"
                        value={cardData.expiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                        className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        CVV / CVC (ixtiyoriy)
                      </label>
                      <input
                        type="password"
                        placeholder="•••"
                        value={cardData.cvv}
                        onChange={handleCvvChange}
                        maxLength={4}
                        className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Karta egasining ismi familiyasi (lotin harflarida)
                    </label>
                    <input
                      type="text"
                      placeholder="ANVAR KARIMOV"
                      value={cardData.cardholder}
                      onChange={handleCardholderChange}
                      className="w-full px-3.5 py-2.5 text-sm uppercase rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 text-[11px] text-teal-300 border-t border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>256-bit xavfsiz shifrlangan to\'lov. Karta ma\'lumotlari xavfsiz himoyalangan.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Summary Panel */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5 sticky top-24">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Buyurtma tarkibi ({itemCount} ta tovar)
          </h3>

          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
            {cart.items.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between items-center gap-2">
                <span className="truncate text-slate-700 font-bold max-w-[180px]">
                  {item.variant?.product?.name || item.product?.name || 'Mahsulot'} × {item.quantity}
                </span>
                <span className="font-black text-slate-950 shrink-0">
                  {formatPrice(item.total_price || (item.unit_price * item.quantity))}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600 font-medium">
            <div className="flex justify-between">
              <span>Tovarlar summasi:</span>
              <span className="font-bold text-slate-900">{formatPrice(calculatedSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Yetkazib berish:</span>
              <span className="font-bold text-slate-900">
                {shippingFee > 0 ? formatPrice(shippingFee) : 'Bepul'}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Chegirma (Kupon):</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-800">To'lov uchun:</span>
            <span className="text-xl font-black text-slate-950">
              {formatPrice(grandTotal)}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Buyurtma rasmiylashtirilmoqda...' : 'Buyurtmani tasdiqlash'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-slate-400 text-center leading-normal">
            "Buyurtmani tasdiqlash" tugmasini bosish orqali siz ommaviy oferta shartlariga rozilik bildirasiz.
          </p>
        </div>
      </form>
    </div>
  )
}
