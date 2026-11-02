import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: (appliedDiscount: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartTotal,
    formatPrice,
    t,
    addToast
  } = useShop();

  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (clean === 'NOVATECH10' || clean === 'VIP10' || clean === 'NOVATECH') {
      const disc = Math.round(cartTotal * 0.1);
      setDiscountAmount(disc);
      setPromoApplied(true);
      addToast('VIP Promo applied: 10% discount activated', 'success');
    } else {
      addToast('Invalid promo code. Try "NOVATECH10"', 'error');
    }
  };

  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    onProceedToCheckout(discountAmount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0F121B] border-l border-white/10 shadow-2xl flex flex-col text-left">
          
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#12151E]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white font-display">
                {t('shoppingCart')} ({cart.length})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 rounded-xl bg-white/5 border border-white/5 items-center justify-between"
                >
                  <img
                    src={item.product.images?.[0] || '/src/assets/images/hero_flagship_device_1793628017947.jpg'}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-lg object-cover bg-black shrink-0"
                  />

                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {item.product.name}
                    </h4>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {item.selectedColor} · {item.selectedConfig}
                    </div>
                    <div className="text-xs font-bold text-cyan-400 mt-1 tabular-nums">
                      {formatPrice(item.pricePerUnit)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center border border-white/10 rounded-md bg-[#090A0F] text-xs">
                      <button
                        onClick={() => updateCartQty(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-slate-400 hover:text-white"
                      >
                        -
                      </button>
                      <span className="px-2 font-bold text-white tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-slate-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-white">{t('cartEmpty')}</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {t('cartEmptyDesc')}
                </p>
              </div>
            )}
          </div>

          {/* Footer Calculation & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-[#12151E] space-y-4">
              
              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder={t('promoCode') + ' (e.g. NOVATECH10)'}
                    className="w-full bg-[#090A0F] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg transition-colors"
                >
                  {t('apply')}
                </button>
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('subtotal')}</span>
                  <span className="font-semibold tabular-nums">{formatPrice(cartTotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>{t('discount')} (10% VIP)</span>
                    <span className="font-semibold tabular-nums">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-slate-400">{t('shipping')}</span>
                  <span className="text-cyan-400 font-semibold">{t('free')}</span>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between text-sm sm:text-base font-bold text-white">
                  <span>{t('total')}</span>
                  <span className="text-cyan-400 tabular-nums">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm rounded-lg shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>{t('checkout')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>256-Bit Encrypted International Transaction</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
