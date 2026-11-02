import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  User,
  ShoppingBag,
  MapPin,
  Lock,
  Mail,
  Phone,
  LogOut,
  Save,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Order } from '../types';

export const CustomerCabinetModal: React.FC = () => {
  const {
    isAuthOpen,
    setIsAuthOpen,
    customerUser,
    setCustomerUser,
    customerLogout,
    formatPrice,
    t,
    addToast
  } = useShop();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('United States');

  // Load customer orders when opened and logged in
  useEffect(() => {
    if (customerUser?.token) {
      setIsLoadingOrders(true);
      fetch(`/api/orders/my?email=${encodeURIComponent(customerUser.email)}`, {
        headers: { Authorization: `Bearer ${customerUser.token}` }
      })
        .then((res) => res.json())
        .then((data) => setMyOrders(data.orders || []))
        .catch(() => setMyOrders([]))
        .finally(() => setIsLoadingOrders(false));
    }
  }, [customerUser]);

  if (!isAuthOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }

      const data = await res.json();
      setCustomerUser(data.user);
      addToast(`Welcome back, ${data.user.fullName}!`, 'success');
      setPassword('');
    } catch (err: any) {
      addToast(err.message || 'Login failed', 'error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          phone,
          address,
          city,
          country
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
      }

      const data = await res.json();
      setCustomerUser(data.user);
      addToast('Customer account created successfully!', 'success');
      setPassword('');
    } catch (err: any) {
      addToast(err.message || 'Registration failed', 'error');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerUser?.token) return;

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerUser.token}`
        },
        body: JSON.stringify({
          fullName,
          phone,
          address,
          city,
          country
        })
      });

      if (!res.ok) throw new Error('Failed to update profile');

      const data = await res.json();
      setCustomerUser({ ...customerUser, ...data.user });
      addToast('Profile and shipping details updated', 'success');
    } catch (err: any) {
      addToast(err.message || 'Update failed', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0F121B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#12151E]">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-display">
              {customerUser ? t('myCabinet') : mode === 'login' ? t('signIn') : t('register')}
            </h2>
          </div>
          <button
            onClick={() => setIsAuthOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {customerUser ? (
            /* Logged in Cabinet */
            <div className="space-y-6">
              {/* Profile summary bar */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{customerUser.fullName}</h3>
                  <div className="text-xs text-slate-400">{customerUser.email}</div>
                </div>
                <button
                  onClick={customerLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('logOut')}</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 border-b border-white/10">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'orders'
                      ? 'text-cyan-400 border-cyan-400'
                      : 'text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{t('myOrders')} ({myOrders.length})</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setFullName(customerUser.fullName || '');
                    setPhone(customerUser.phone || '');
                    setAddress(customerUser.address || '');
                    setCity(customerUser.city || '');
                    setCountry(customerUser.country || 'United States');
                  }}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'profile'
                      ? 'text-cyan-400 border-cyan-400'
                      : 'text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t('myProfile')} & Shipping Address</span>
                </button>
              </div>

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  {isLoadingOrders ? (
                    <div className="text-center py-8 text-xs text-slate-400">Loading orders...</div>
                  ) : myOrders.length > 0 ? (
                    myOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="font-mono text-cyan-400 font-bold">{ord.orderNumber}</span>
                          <span className="text-slate-500 tabular-nums">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-semibold ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : ord.status === 'Shipped'
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-slate-300">
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span className="text-white font-medium tabular-nums">
                                {formatPrice(item.pricePerUnit * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between border-t border-white/5 pt-2 text-sm font-bold text-white">
                          <span>{t('total')}</span>
                          <span className="text-cyan-400 tabular-nums">{formatPrice(ord.total)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-xs text-slate-400 space-y-2">
                      <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
                      <div>{t('noOrdersYet')}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">{t('fullName')}</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">{t('phone')}</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">{t('address')}</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">{t('city')}</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">{t('country')}</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{t('saveChanges')}</span>
                  </button>
                </form>
              )}
            </div>
          ) : mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="alex@company.com"
                  className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">{t('password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="hover:text-cyan-400"
                >
                  {t('forgotPassword')}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-lg transition-all"
              >
                {t('signIn')}
              </button>

              <div className="text-center text-[11px] text-slate-400 pt-2">
                <span>{t('dontHaveAccount')} </span>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  {t('register')}
                </button>
              </div>
            </form>
          ) : mode === 'register' ? (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">{t('fullName')} *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Elena Rostova"
                  className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">{t('email')} *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="elena@novatech.com"
                  className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">{t('password')} *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">{t('phone')}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1..."
                    className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">{t('city')}</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Geneva"
                    className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs rounded-lg transition-all"
              >
                {t('register')}
              </button>

              <div className="text-center text-[11px] text-slate-400 pt-2">
                <span>{t('alreadyHaveAccount')} </span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  {t('signIn')}
                </button>
              </div>
            </form>
          ) : (
            /* Forgot Password */
            <div className="space-y-4 text-xs text-left">
              <p className="text-slate-300">
                Enter your email address and we will dispatch a password recovery link.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-white"
              />
              <button
                onClick={() => {
                  addToast('Reset link dispatched to ' + (email || 'your email'), 'info');
                  setMode('login');
                }}
                className="w-full py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-lg"
              >
                Send Recovery Instructions
              </button>
              <button
                onClick={() => setMode('login')}
                className="w-full text-center text-slate-400 hover:text-white"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
