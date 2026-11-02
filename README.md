# E-Commerce Marketplace - Frontend Application

Zamonaviy va yuqori unumdorlikka ega **Multi-Vendor Marketplace** veb-ilovasi (Single Page Application).

Ushbu frontend O'zbekiston elektron tijorat bozori uchun moslashtirilgan bo'lib, o'ziga xos Nordic Slate & Emerald Teal ranglar palitrasi, rasmiy do'konlar (Multi-vendor sellers), Payme, Click, Bank kartalari (Uzcard, Humo, Visa, Mastercard) va Naqd to'lov tizimlarini to'liq qo'llab-quvvatlaydi.

---

## 🛠 Texnologiyalar steki

- **Asos:** React 19 + Vite 8
- **Dizayn & CSS:** Tailwind CSS v4 (zamonaviy `@tailwindcss/vite` bilan)
- **Routing:** React Router v7
- **Ikonkalar:** Lucide React
- **API Klient:** Axios (avtomatik JWT token yangilash va mehmon sessiyasini saqlash bilan)
- **Linter:** Oxlint

---

## 🚀 O'rnatish va ishga tushirish

### 1. Loyihani klonlash
```bash
git clone https://github.com/USERNAME/ecommerce-marketplace-frontend.git
cd ecommerce-marketplace-frontend
```

### 2. Bog'liqliklarni (dependencies) o'rnatish
```bash
npm install
```

### 3. Muhit o'zgaruvchilari (.env)
Mahalliy ishlab chiqishda (local dev) Vite backend so'rovlarini avtomatik `http://127.0.0.1:8000` ga proxy qiladi.

Production muhitda yoki alohida serverda ishlatish uchun `.env` fayl yarating:
```bash
cp .env.example .env
```
Fayl ichida backend URL manzilini ko'rsating:
```env
VITE_API_BASE_URL=https://api.sizningdomen.uz
```

### 4. Dasturchi rejimida ishga tushirish
```bash
npm run dev
```
Sayt `http://localhost:5173` manzilida ishga tushadi.

### 5. Production uchun yig'ish (Build)
```bash
npm run build
```
Yig'ilgan statik fayllar `dist/` papkasida hosil bo'ladi.

---

## 📁 Loyiha tuzilmasi

```
frontend/
├── public/              # Statik fayllar
├── src/
│   ├── api/             # Backend API endpointlari (auth, catalog, cart, orders, reviews)
│   ├── components/      # Qayta ishlatiluvchi UI komponentlar
│   │   ├── auth/        # Kirish va ro'yxatdan o'tish modallari (OTP bilan)
│   │   ├── cart/        # Savatcha drayveri (Cart Drawer)
│   │   ├── catalog/     # Mahsulot kartasi (ProductCard), sotuvchi nishoni, filtrlash
│   │   └── common/      # Navbar, Footer, Sotuvchi bo'lish (SellerModal)
│   ├── context/         # React Context (AuthContext, CartContext, NotificationContext, ToastContext)
│   ├── pages/           # Asosiy sahifalar
│   │   ├── HomePage.jsx          # Bosh sahifa (Deal of the Day, Chegirmalar, Toifalar, Sotuvchilar)
│   │   ├── CatalogPage.jsx       # Mahsulotlar katalogi va fasetli filtrlar
│   │   ├── ProductDetailPage.jsx # Mahsulot sahifasi, do'kon kartasi, sharhlar
│   │   ├── CartPage.jsx          # Kengaytirilgan savatcha
│   │   ├── CheckoutPage.jsx      # Buyurtma rasmiylashtirish, Bank kartasi kiritish
│   │   ├── OrderSuccessPage.jsx  # Buyurtma tasdiqlash
│   │   ├── OrdersPage.jsx        # Buyurtmalar tarixi
│   │   ├── OrderDetailPage.jsx   # Buyurtma holati va kurer trekingi
│   │   └── ProfilePage.jsx       # Foydalanuvchi profili
│   ├── App.jsx          # Asosiy marshrutlash (Routes)
│   ├── main.jsx         # Ilovaning kirish nuqtasi
│   └── index.css        # Global Tailwind stillari
├── .env.example
├── package.json
└── vite.config.js
```

---

## 💳 Qo'llab-quvvatlanadigan to'lov usullari

1. **Payme** (Onlayn to'lov)
2. **Click** (Onlayn to'lov)
3. **Bank kartasi** (Uzcard, Humo, Visa, Mastercard) — avtomatik 16 xonali karta turini aniqlash bilan
4. **Naqd pul** (Kuryerdan qabul qilib olganda to'lash)
