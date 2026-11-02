import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, SlidersHorizontal, ArrowUpDown, X, Search, ChevronRight } from 'lucide-react'
import { catalogAPI } from '../api/catalog'
import { ProductCard } from '../components/catalog/ProductCard'

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryParam = searchParams.get('category') || ''
  const searchParam = searchParams.get('search') || searchParams.get('q') || ''
  const brandParam = searchParams.get('brand') || ''
  const orderingParam = searchParams.get('ordering') || '-created_at'

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Local filter states
  const [selectedBrands, setSelectedBrands] = useState(
    brandParam ? brandParam.split(',').filter(Boolean) : []
  )
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '')
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('in_stock') === 'true')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Fetch initial filters (Categories & Brands)
  useEffect(() => {
    Promise.all([
      catalogAPI.getCategories(),
      catalogAPI.getBrands(),
    ])
      .then(([catRes, brandRes]) => {
        setCategories(catRes.data || [])
        setBrands(brandRes.data?.results || brandRes.data || [])
      })
      .catch((err) => console.error(err))
  }, [])

  // Fetch products when search params change
  useEffect(() => {
    setLoading(true)
    const params = {
      category: categoryParam || undefined,
      q: searchParam || undefined,
      brand: brandParam || undefined,
      ordering: orderingParam,
      min_price: searchParams.get('min_price') || undefined,
      max_price: searchParams.get('max_price') || undefined,
      in_stock: searchParams.get('in_stock') || undefined,
    }

    catalogAPI.getProducts(params)
      .then((res) => {
        const results = res.data?.results || res.data || []
        setProducts(results)
        setTotalCount(res.data?.count || results.length)
      })
      .catch((err) => {
        console.error('Products load error:', err)
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [categoryParam, searchParam, brandParam, orderingParam, searchParams])

  const applyFilters = () => {
    const newParams = new URLSearchParams(searchParams)

    if (selectedBrands.length > 0) {
      newParams.set('brand', selectedBrands.join(','))
    } else {
      newParams.delete('brand')
    }

    if (minPrice) newParams.set('min_price', minPrice)
    else newParams.delete('min_price')

    if (maxPrice) newParams.set('max_price', maxPrice)
    else newParams.delete('max_price')

    if (inStockOnly) newParams.set('in_stock', 'true')
    else newParams.delete('in_stock')

    setSearchParams(newParams)
    setMobileFilterOpen(false)
  }

  const handleCategorySelect = (slug) => {
    const newParams = new URLSearchParams(searchParams)
    if (categoryParam === slug) {
      newParams.delete('category')
    } else {
      newParams.set('category', slug)
    }
    setSearchParams(newParams)
  }

  const handleBrandToggle = (slug) => {
    const next = selectedBrands.includes(slug)
      ? selectedBrands.filter((b) => b !== slug)
      : [...selectedBrands, slug]
    setSelectedBrands(next)
  }

  const handleOrderingChange = (val) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('ordering', val)
    setSearchParams(newParams)
  }

  const resetAllFilters = () => {
    setSelectedBrands([])
    setMinPrice('')
    setMaxPrice('')
    setInStockOnly(false)
    setSearchParams({})
  }

  const activeFiltersCount =
    (categoryParam ? 1 : 0) +
    (selectedBrands.length > 0 ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (inStockOnly ? 1 : 0)

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {searchParam ? `"${searchParam}" bo'yicha qidiruv` : 'Mahsulotlar katalogi'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Jami {totalCount} ta mahsulot topildi
          </p>
        </div>

        {/* Sorting & Filter Mobile Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
          >
            <Filter className="w-4 h-4 text-teal-600" />
            <span>Filtrlar {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={orderingParam}
              onChange={(e) => handleOrderingChange(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="-created_at">Yangi qo'shilganlar</option>
              <option value="created_at">Avval qo'shilganlar</option>
              <option value="min_price">Narx: arzonidan qimmatiga</option>
              <option value="-min_price">Narx: qimmatidan arzoniga</option>
              <option value="name">Nomi bo'yicha (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-600" />
              Filtrlar
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
              >
                Tozalash
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
              Kategoriyalar
            </h4>
            <div className="space-y-1 max-h-56 overflow-y-auto text-xs font-semibold">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer flex items-center justify-between ${
                  !categoryParam ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200/60' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Barcha kategoriyalar</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategorySelect(c.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer flex items-center justify-between ${
                    categoryParam === c.slug
                      ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200/60'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          {brands.length > 0 && (
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                Brendlar
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto text-xs font-semibold">
                {brands.map((b) => (
                  <label
                    key={b.id}
                    className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-teal-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b.slug)}
                      onChange={() => handleBrandToggle(b.slug)}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 border-slate-300"
                    />
                    <span>{b.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
              Narx oralig'i (so'm)
            </h4>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input
                type="number"
                placeholder="Dan"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium"
              />
              <input
                type="number"
                placeholder="Gacha"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Stock Filter */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 border-slate-300"
              />
              <span>Faqat mavjud tovarlar</span>
            </label>
          </div>

          <button
            onClick={applyFilters}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shadow-teal-600/20"
          >
            Filtrni qo'llash
          </button>
        </aside>

        {/* Product Cards Grid */}
        <main className="col-span-1 md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Hech qanday mahsulot topilmadi
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                Boshqa parametrlar yoki qidiruv so'zlarini kiritib ko'ring
              </p>
              <button
                onClick={resetAllFilters}
                className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition"
              >
                Barcha filtrlarni tozalash
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Filtrlar</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Kategoriyalar</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto text-xs">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCategorySelect(c.slug)}
                      className={`w-full text-left py-2 px-3 rounded-lg ${
                        categoryParam === c.slug ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Brendlar</h4>
                <div className="space-y-2 max-h-36 overflow-y-auto text-xs">
                  {brands.map((b) => (
                    <label key={b.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b.slug)}
                        onChange={() => handleBrandToggle(b.slug)}
                        className="rounded text-teal-600"
                      />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-2">
              <button
                onClick={resetAllFilters}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Tozalash
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 py-3 bg-teal-600 text-white rounded-xl text-xs font-bold"
              >
                Ko'rish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
