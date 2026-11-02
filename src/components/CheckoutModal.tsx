import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  CreditCard,
  CheckCircle,
  Truck,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  appliedDiscount: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  appliedDiscount
}) => {
  const {
    cart,
    cartTotal,
    clearCart,
    currency,
    formatPrice,
    t,
    customerUser,
    addToast,
    fetchProducts
  } = useShop();

  const [fullName, setFullName] = useState(customerUser?.fullName || '');
  const [email, setEmail] = useState(customerUser?.email || '');
  const [phone, setPhone] = useState(customerUser?.phone || '');
  const [country, setCountry] = useState(customerUser?.country || 'United States');
  const [city, setCity] = useState(customerUser?.city || 'New York');
  const [address, setAddress] = useState(customerUser?.address || '742 Evergreen Terrace');
  const [postalCode, setPostalCode] = useState('10001');

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const shippingCost = shippingMethod === 'express' ? 50 : 0;
  const finalTotal = Math.max(0, cartTotal - appliedDiscount + shippingCost);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !address.trim()) {
      addToast('Please complete all shipping address fields', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const orderPayload = {
        customer: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          country: country.trim(),
          city: city.trim(),
          address: address.trim(),
          postalCode: postalCode.trim()
        },
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          image: item.product.images?.[0] || '/src/assets/images/hero_flagship_device_1793628017947.jpg',
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          selectedColor: item.selectedColor,
          selectedConfig: item.selectedConfig
        })),
        subtotal: cartTotal,
        shippingCost,
        discount: appliedDiscount,
        total: finalTotal,
        currency,
        paymentMethod: paymentMethod === 'card' ? 'Credit Card (Demo Mode)' : 'Apple Pay (Demo Mode)'
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to place order');
      }

      const orderData: Order = await res.json();
      setCompletedOrder(orderData);
      clearCart();
      fetchProducts(); // Refresh stock in store
      addToast(`Order ${orderData.orderNumber} successfully registered!`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Error completing checkout', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0F121B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-left">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#12151E]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-display">
              {completedOrder ? t('orderConfirmed') : t('checkoutTitle')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {completedOrder ? (
            /* Order Confirmation View */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white font-display">
                  {t('orderConfirmed')}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{t('estimatedDelivery')}</p>
              </div>

              {/* Order Receipt Box */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-white/5 border border-white/5 text-left text-xs space-y-3">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">{t('orderNumber')}</span>
                  <span className="font-mono text-cyan-400 font-bold">{completedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('fullName')}</span>
                  <span className="text-white font-medium">{completedOrder.customer.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination</span>
                  <span className="text-white font-medium">
                    {completedOrder.customer.city}, {completedOrder.customer.country}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2 text-sm font-bold">
                  <span className="text-white">{t('total')}</span>
                  <span className="text-cyan-400 tabular-nums">
                    {formatPrice(completedOrder.total)}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 max-w-md mx-auto text-[11px] text-cyan-300">
                Notice: Your order has been submitted to the NOVATECH Central Server. The store owner can inspect, process, and track your order in the /admin console.
              </div>

              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs rounded-lg hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20"
              >
                {t('continueShopping')}
              </button>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              
              {/* Demo Mode Notice */}
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-start gap-3 text-xs text-cyan-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                <p className="leading-relaxed">{t('demoPaymentNotice')}</p>
              </div>

              {/* Shipping Information */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  {t('shippingAddress')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">{t('fullName')}</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Alexander Vance"
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">{t('email')}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="alex.vance@company.com"
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">{t('phone')}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">{t('country')}</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">{t('address')}</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      placeholder="742 Evergreen Terrace, Suite 4B"
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">{t('city')}</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">{t('postalCode')}</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white">
                  {t('shippingMethod')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setShippingMethod('standard')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      shippingMethod === 'standard'
                        ? 'bg-cyan-950/40 border-cyan-400 text-white ring-1 ring-cyan-400'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white">{t('standardExpress')}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">2-4 Business Days</div>
                  </div>
                  <div
                    onClick={() => setShippingMethod('express')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      shippingMethod === 'express'
                        ? 'bg-cyan-950/40 border-cyan-400 text-white ring-1 ring-cyan-400'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white">{t('airFreight')}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Priority 24-48 Hours (+ $50)</div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white">
                  {t('paymentDetails')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-cyan-950/40 border-cyan-400 text-white ring-1 ring-cyan-400'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-white">{t('creditCard')}</span>
                  </div>
                  <div
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                      paymentMethod === 'apple_pay'
                        ? 'bg-cyan-950/40 border-cyan-400 text-white ring-1 ring-cyan-400'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-white">{t('appleGooglePay')}</span>
                  </div>
                </div>
              </div>

              {/* Summary and Submit */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>{t('subtotal')}</span>
                  <span className="tabular-nums font-semibold text-slate-200">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>{t('discount')}</span>
                    <span className="tabular-nums font-semibold">
                      -{formatPrice(appliedDiscount)}
                    </span>
                  </div>
                )}
                {shippingCost > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Priority Shipping</span>
                    <span className="tabular-nums font-semibold text-slate-200">
                      +{formatPrice(shippingCost)}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/10 flex justify-between text-base font-bold text-white">
                  <span>{t('total')}</span>
                  <span className="text-cyan-400 tabular-nums">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm rounded-lg shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{t('processingOrder')}</span>
                ) : (
                  <>
                    <span>{t('placeOrder')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
