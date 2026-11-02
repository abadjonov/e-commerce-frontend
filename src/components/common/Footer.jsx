import React, { useState } from 'react'
import { Sparkles, ShieldCheck, Truck, Clock, CreditCard, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SellerModal } from './SellerModal'

export const Footer = () => {
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false)

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Value Propositions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Tezkor yetkazish</h4>
              <p className="text-xs text-slate-400">Butun O'zbekiston bo'yicha</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Kafolat</h4>
              <p className="text-xs text-slate-400">Asl va rasmiy brend tovarlar</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Xavfsiz to'lov</h4>
              <p className="text-xs text-slate-400">Payme, Click, Karta, Naqd</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 Yordam</h4>
              <p className="text-xs text-slate-400">Har doim mijoz xizmatidamiz</p>
            </div>
          </div>
        </div>

        {/* Links section: 5 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 py-10">
          
          {/* Col 1: Brand & Info */}
          <div className="lg:col-span-1 sm:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold shadow-md shadow-teal-600/30">
                <Sparkles className="w-4 h-4 text-teal-100" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                E-<span className="text-teal-400">COMMERCE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4 font-medium">
              O'zbekistondagi zamonaviy, shaffof va ishonchli multi-vendor savdo maydoni. Rasmiy do'konlar va sifatli tovarlar.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-teal-300">
              <Store className="w-3.5 h-3.5 text-teal-400" />
              <span>Multi-vendor Marketplace</span>
            </div>
          </div>

          {/* Col 2: Katalog */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Katalog</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><Link to="/catalog" className="hover:text-teal-300 transition">Barcha tovarlar</Link></li>
              <li><Link to="/catalog?category=elektronika" className="hover:text-teal-300 transition">Elektronika</Link></li>
              <li><Link to="/catalog?category=smartfonlar" className="hover:text-teal-300 transition">Smartfonlar</Link></li>
              <li><Link to="/catalog?category=noutbuklar" className="hover:text-teal-300 transition">Noutbuklar</Link></li>
              <li><Link to="/catalog?category=maishiy-texnika" className="hover:text-teal-300 transition">Maishiy texnika</Link></li>
              <li><Link to="/catalog?category=kiyim-kechak" className="hover:text-teal-300 transition">Kiyim-kechak</Link></li>
            </ul>
          </div>

          {/* Col 3: Xaridorlar & Hamkorlar (Active interactive links) */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Xaridorlar & Hamkorlar</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link to="/orders" className="hover:text-teal-300 transition block">
                  Buyurtmalar tarixi
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-teal-300 transition block">
                  Shaxsiy kabinet
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsSellerModalOpen(true)}
                  className="text-teal-400 hover:text-teal-300 font-bold transition text-left cursor-pointer flex items-center gap-1.5"
                >
                  <span>Sotuvchi bo'lish</span>
                </button>
              </li>
              <li>
                <Link to="/catalog?ordering=-created_at" className="hover:text-teal-300 transition block">
                  Yangi mahsulotlar
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Bog'lanish */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Bog'lanish</h4>
            <p className="text-xs text-slate-400 mb-2 font-medium">Samarqand shahar, Bog'ishamol</p>
            <p className="text-xs text-slate-400 mb-2 font-medium">Telefon: +998 71 200-00-00</p>
            <p className="text-xs text-slate-400 mb-2 font-medium">Email: support@ecommerce.uz</p>
            <p className="text-[11px] text-slate-500 mt-2">Dushanba - Yakshanba: 09:00 - 21:00</p>
          </div>

          {/* Col 5: Alohida To'lov Usullari bo'limi */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">To'lov usullari</h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Platformamizda xavfsiz va rasmiy to'lov tizimlari qo'llab-quvvatlanadi:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
                Payme
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
                Click
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-bold text-emerald-400">
                Uzcard
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400">
                Humo
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-bold text-sky-400">
                Visa
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-bold text-rose-400">
                Mastercard
              </span>
            </div>
            <p className="text-[11px] text-teal-400/80 mt-3 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>256-bit SSL xavfsizlik</span>
            </p>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-900 text-center text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} E-Commerce Marketplace. Barcha huquqlar himoyalangan.
        </div>
      </div>

      {/* Seller Modal Trigger from Footer */}
      <SellerModal isOpen={isSellerModalOpen} onClose={() => setIsSellerModalOpen(false)} />
    </footer>
  )
}
