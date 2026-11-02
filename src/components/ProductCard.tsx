import React from 'react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { Star, Heart, ShoppingBag, Eye, SlidersHorizontal, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    t,
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    compareList,
    setSelectedProduct,
    addRecentlyViewed
  } = useShop();

  const isFavorited = isInWishlist(product.id);
  const isCompared = compareList.some((p) => p.id === product.id);

  const handleOpenDetail = () => {
    addRecentlyViewed(product);
    setSelectedProduct(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompare(product);
  };

  const mainImage = product.images?.[0] || '/src/assets/images/hero_flagship_device_1793628017947.jpg';

  return (
    <div
      onClick={handleOpenDetail}
      className="group relative flex flex-col bg-[#12151E] rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/20 hover:-translate-y-1 cursor-pointer overflow-hidden"
    >
      {/* Top Floating Badges (Subtle unboxed or quiet text) */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
        {product.isNew && (
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-cyan-500 text-slate-950">
            NEW
          </span>
        )}
        {product.oldPrice && product.oldPrice > product.price && (
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
          </span>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleToggleWishlist}
          aria-label={t('addToWishlist')}
          className={`p-2 rounded-lg backdrop-blur-md transition-colors ${
            isFavorited
              ? 'bg-rose-500 text-white'
              : 'bg-[#090A0F]/80 text-slate-300 hover:text-white hover:bg-black'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={handleToggleCompare}
          aria-label={t('compare')}
          className={`p-2 rounded-lg backdrop-blur-md transition-colors ${
            isCompared
              ? 'bg-cyan-500 text-slate-950'
              : 'bg-[#090A0F]/80 text-slate-300 hover:text-white hover:bg-black'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Image Container (65-75% visual weight on neutral backdrop) */}
      <div className="relative aspect-[4/3] w-full bg-[#0D1017] overflow-hidden flex items-center justify-center p-4">
        <img
          src={mainImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Quick View Button Hover Overlay on Desktop */}
        <div className="absolute inset-x-0 bottom-3 px-4 hidden sm:flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetail();
            }}
            className="w-full py-2 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg backdrop-blur-md border border-white/10 flex items-center justify-center gap-1.5 shadow-lg"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('quickView')}</span>
          </button>
        </div>
      </div>

      {/* Product Content Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 text-left">
        <div>
          {/* Brand & Category in unboxed clean metadata */}
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            <span>{product.brand}</span>
            <span>{product.category}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Ratings & Reviews */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="ml-1 text-slate-200 font-bold tabular-nums">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-slate-600">·</span>
            <span className="tabular-nums">
              {product.reviewsCount} {t('reviews')}
            </span>
          </div>
        </div>

        {/* Price & Cart CTA Strip */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-white tabular-nums">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-xs text-slate-500 line-through tabular-nums">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">
              {product.stock > 0 ? `${product.stock} ${t('inStock')}` : t('outOfStock')}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`p-2.5 rounded-lg font-semibold transition-all active:scale-95 ${
              product.stock > 0
                ? 'bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 hover:border-cyan-500'
                : 'bg-white/5 text-slate-600 cursor-not-allowed'
            }`}
            aria-label={t('addToCart')}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
