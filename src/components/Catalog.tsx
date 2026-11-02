import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, ArrowUpDown, X, Sparkles } from 'lucide-react';
import { ProductCategory } from '../types';

export const Catalog: React.FC = () => {
  const {
    t,
    products,
    selectedCategory,
    setSelectedCategory,
    isLoadingProducts
  } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(5000);

  // Extract unique brands
  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }
      // Brand filter
      if (selectedBrand !== 'All' && product.brand !== selectedBrand) {
        return false;
      }
      // In-stock filter
      if (inStockOnly && product.stock <= 0) {
        return false;
      }
      // Max price filter
      if (product.price > maxPriceFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          product.name.toLowerCase().includes(q) ||
          product.brand.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, selectedCategory, selectedBrand, inStockOnly, maxPriceFilter, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setInStockOnly(false);
    setMaxPriceFilter(5000);
    setSortBy('newest');
  };

  return (
    <section id="catalog-section" className="py-16 bg-[#090A0F] border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>International Inventory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-display">
              {t('catalogHeading')}
            </h2>
          </div>

          <div className="text-xs text-slate-400">
            <span>Showing </span>
            <span className="text-white font-bold tabular-nums">{filteredProducts.length}</span>
            <span> of </span>
            <span className="text-white font-bold tabular-nums">{products.length}</span>
            <span> flagship devices</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#12151E] p-4 rounded-xl border border-white/5 mb-8 space-y-4 shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-[#090A0F] border border-white/10 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Brand Dropdown */}
            <div>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                aria-label="Filter by brand"
              >
                <option value="All">{t('allBrands')}</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Max Slider */}
            <div className="flex flex-col justify-center px-1">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>{t('priceRange')}</span>
                <span className="text-white font-semibold tabular-nums">Up to ${maxPriceFilter}</span>
              </div>
              <input
                type="range"
                min="200"
                max="5000"
                step="50"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Sort & In-Stock */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                aria-label="Sort products"
              >
                <option value="newest">{t('sortNewest')}</option>
                <option value="price-asc">{t('sortPriceAsc')}</option>
                <option value="price-desc">{t('sortPriceDesc')}</option>
                <option value="rating">{t('sortRating')}</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-white/20 bg-[#090A0F] text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span className="hidden sm:inline">{t('inStockOnly')}</span>
              </label>
            </div>

          </div>
        </div>

        {/* Loading State */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-[#12151E] rounded-xl border border-white/5 p-4 animate-pulse space-y-4">
                <div className="aspect-[4/3] bg-white/5 rounded-lg" />
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
                <div className="h-8 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-[#12151E] rounded-2xl border border-white/5 p-8 max-w-lg mx-auto">
            <SlidersHorizontal className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">{t('noProductsFound')}</h3>
            <p className="text-xs text-slate-400 mb-5">
              Try adjusting your search criteria, price range, or category filter.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-cyan-500 text-slate-950 font-semibold text-xs rounded-lg hover:bg-cyan-400 transition-colors"
            >
              {t('resetFilters')}
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
