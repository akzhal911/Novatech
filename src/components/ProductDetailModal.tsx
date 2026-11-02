import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  SlidersHorizontal,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Send
} from 'lucide-react';
import { Product, Review } from '../types';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    compareList,
    t,
    products,
    addToast
  } = useShop();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedConfig, setSelectedConfig] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');

  // Review form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setActiveImageIndex(0);
      setSelectedColor(selectedProduct.colors?.[0] || 'Standard');
      setSelectedConfig(selectedProduct.configurations?.[0]?.name || 'Standard');
      setQuantity(1);

      // Fetch reviews for this product
      fetch(`/api/products/${selectedProduct.id}/reviews`)
        .then((res) => res.json())
        .then((data) => setReviews(Array.isArray(data) ? data : []))
        .catch(() => setReviews([]));
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const isFavorited = isInWishlist(selectedProduct.id);
  const isCompared = compareList.some((p) => p.id === selectedProduct.id);

  // Compute live price with selected configuration
  const currentConfigObj = selectedProduct.configurations?.find((c) => c.name === selectedConfig);
  const finalUnitPrice = selectedProduct.price + (currentConfigObj?.priceDiff || 0);

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity, selectedColor, selectedConfig);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) {
      addToast('Please provide your name and review text', 'error');
      return;
    }

    try {
      setIsSubmittingReview(true);
      const res = await fetch(`/api/products/${selectedProduct.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: reviewerName.trim(),
          rating: reviewerRating,
          comment: reviewerComment.trim()
        })
      });

      if (!res.ok) throw new Error('Failed to submit review');

      const data = await res.json();
      setReviews((prev) => [data.review, ...prev]);
      selectedProduct.rating = data.productRating;
      selectedProduct.reviewsCount = data.reviewsCount;

      setReviewerName('');
      setReviewerComment('');
      setReviewerRating(5);
      addToast('Review submitted successfully', 'success');
    } catch (err: any) {
      addToast(err.message || 'Error submitting review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Related products in the same category
  const relatedProducts = products
    .filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id)
    .slice(0, 3);

  const images = selectedProduct.images && selectedProduct.images.length > 0
    ? selectedProduct.images
    : ['/src/assets/images/hero_flagship_device_1793628017947.jpg'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0F121B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#12151E]">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-white uppercase tracking-wider">
              {selectedProduct.brand}
            </span>
            <span>/</span>
            <span>{selectedProduct.category}</span>
          </div>

          <button
            onClick={() => setSelectedProduct(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Gallery Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#090A0F] border border-white/5 flex items-center justify-center">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border shrink-0 transition-all ${
                        activeImageIndex === idx
                          ? 'border-cyan-400 ring-1 ring-cyan-400'
                          : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt="thumbnail"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{t('valGlobalDesc')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{t('valWarrantyTitle')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>30-Day Hassle-Free Global Return Guarantee</span>
                </div>
              </div>
            </div>

            {/* Contiguous Purchase Module (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-display mb-2">
                  {selectedProduct.name}
                </h1>

                {/* Rating & Stock */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 text-white font-bold tabular-nums">
                      {selectedProduct.rating.toFixed(1)}
                    </span>
                  </div>
                  <span>·</span>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="hover:text-cyan-400 underline transition-colors tabular-nums"
                  >
                    {selectedProduct.reviewsCount} {t('customerReviews')}
                  </button>
                  <span>·</span>
                  <span
                    className={`font-semibold ${
                      selectedProduct.stock > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {selectedProduct.stock > 0
                      ? `${selectedProduct.stock} ${t('inStock')}`
                      : t('outOfStock')}
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-3xl font-extrabold text-white tabular-nums">
                  {formatPrice(finalUnitPrice)}
                </span>
                {selectedProduct.oldPrice && (
                  <span className="text-base text-slate-500 line-through tabular-nums">
                    {formatPrice(selectedProduct.oldPrice)}
                  </span>
                )}
                {selectedProduct.oldPrice && selectedProduct.oldPrice > selectedProduct.price && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Save {formatPrice(selectedProduct.oldPrice - selectedProduct.price)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedProduct.description}
              </p>

              {/* Color Finish Selector */}
              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {t('selectColor')}: <span className="text-cyan-400 font-normal">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          selectedColor === color
                            ? 'bg-cyan-950/40 border-cyan-400 text-white ring-1 ring-cyan-400'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Configuration / Spec Selector */}
              {selectedProduct.configurations && selectedProduct.configurations.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {t('selectConfig')}:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedProduct.configurations.map((cfg) => (
                      <button
                        key={cfg.name}
                        onClick={() => setSelectedConfig(cfg.name)}
                        className={`px-3.5 py-2.5 text-xs rounded-lg border text-left flex items-center justify-between transition-all ${
                          selectedConfig === cfg.name
                            ? 'bg-cyan-950/40 border-cyan-400 text-white ring-1 ring-cyan-400'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="font-medium">{cfg.name}</span>
                        {cfg.priceDiff > 0 && (
                          <span className="text-cyan-400 font-semibold tabular-nums">
                            +{formatPrice(cfg.priceDiff)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Buy CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center border border-white/15 rounded-lg bg-white/5 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white rounded hover:bg-white/10 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-white tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedProduct.stock || 10, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white rounded hover:bg-white/10 text-sm font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={selectedProduct.stock <= 0}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('addToCart')}</span>
                  <span className="text-xs font-semibold opacity-80 tabular-nums">
                    ({formatPrice(finalUnitPrice * quantity)})
                  </span>
                </button>

                <button
                  onClick={() => toggleWishlist(selectedProduct)}
                  className={`p-3 rounded-lg border transition-colors ${
                    isFavorited
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => toggleCompare(selectedProduct)}
                  className={`p-3 rounded-lg border transition-colors ${
                    isCompared
                      ? 'bg-cyan-500 text-slate-950 border-cyan-500'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                  }`}
                  aria-label="Compare"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Tabbed Specifications and Reviews */}
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center gap-4 border-b border-white/5 pb-3">
              <button
                onClick={() => setActiveTab('specs')}
                className={`text-sm font-bold pb-2 transition-all border-b-2 ${
                  activeTab === 'specs'
                    ? 'text-cyan-400 border-cyan-400'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                {t('specifications')}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`text-sm font-bold pb-2 transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'text-cyan-400 border-cyan-400'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                <span>{t('customerReviews')}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-300 tabular-nums">
                  {reviews.length}
                </span>
              </button>
            </div>

            {/* Specifications Tab */}
            {activeTab === 'specs' && (
              <div className="py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(selectedProduct.specs || {}).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-3 rounded-lg bg-white/5 border border-white/5 flex flex-col text-left"
                    >
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        {key}
                      </span>
                      <span className="text-xs font-semibold text-slate-100 mt-0.5">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="py-4 space-y-6 text-left">
                {/* Write Review Form */}
                <form
                  onSubmit={handleReviewSubmit}
                  className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3"
                >
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {t('writeReview')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        {t('yourName')}
                      </label>
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        {t('yourRating')}
                      </label>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setReviewerRating(s)}
                            className="text-amber-400 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                s <= reviewerRating ? 'fill-current' : 'text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {t('yourComment')}
                    </label>
                    <textarea
                      value={reviewerComment}
                      onChange={(e) => setReviewerComment(e.target.value)}
                      rows={3}
                      placeholder="Share your detailed impressions regarding materials, performance, and experience..."
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('submitReview')}</span>
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-3">
                  {reviews.length > 0 ? (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3.5 rounded-lg bg-white/5 border border-white/5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              {rev.userName}
                            </span>
                            {rev.verified && (
                              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                                <Check className="w-3 h-3" />
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 tabular-nums">
                            {rev.date}
                          </span>
                        </div>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.rating ? 'fill-current' : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 text-center py-4">
                      Be the first to review this flagship device.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-white/10 text-left">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                {t('relatedProducts')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      setSelectedProduct(rel);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer flex items-center gap-3"
                  >
                    <img
                      src={rel.images?.[0] || '/src/assets/images/hero_flagship_device_1793628017947.jpg'}
                      alt={rel.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover bg-black"
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-white truncate">{rel.name}</div>
                      <div className="text-xs font-bold text-cyan-400 tabular-nums">
                        {formatPrice(rel.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
