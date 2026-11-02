import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  ShieldCheck,
  Globe,
  SlidersHorizontal,
  X,
  Menu
} from 'lucide-react';
import { Currency, Language } from '../types';

interface HeaderProps {
  onSearchClick: () => void;
  onAboutClick: () => void;
  onSpecialsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchClick, onAboutClick, onSpecialsClick }) => {
  const {
    t,
    cartCount,
    setIsCartOpen,
    wishlist,
    compareList,
    setIsCompareOpen,
    currency,
    setCurrency,
    language,
    setLanguage,
    customerUser,
    setIsAuthOpen,
    adminUser,
    setCurrentView,
    currentView,
    setSelectedCategory
  } = useShop();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090A0F]/90 backdrop-blur-xl border-b border-white/5 transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-[#0D1017] border-b border-white/5 px-4 py-1.5 text-center text-[11px] font-medium tracking-wide text-slate-400 flex items-center justify-between max-w-7xl mx-auto">
        <span className="hidden sm:inline-block text-cyan-400 font-semibold tracking-wider">
          NOVATECH PREMIERE
        </span>
        <span className="mx-auto text-slate-300 font-normal">
          {t('announcement')}
        </span>
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentView(adminUser ? 'admin' : 'admin-login')}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
            <span>{adminUser ? 'Admin Panel' : 'Owner Access'}</span>
          </button>
        </div>
      </div>

      {/* Main Top Bar adhering strictly to Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setCurrentView('store');
              setSelectedCategory('All');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-left group flex items-baseline gap-2"
          >
            <span className="text-2xl font-extrabold tracking-tight text-white font-display uppercase group-hover:text-cyan-400 transition-colors">
              NOVATECH
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </button>
        </div>

        {/* Zone 2: Navigation Links (4-5 single-line clean text links) */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button
            onClick={() => {
              setCurrentView('store');
              setSelectedCategory('All');
              document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {t('navCatalog')}
          </button>
          <button
            onClick={() => {
              setCurrentView('store');
              document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {t('navCategories')}
          </button>
          <button
            onClick={onSpecialsClick}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {t('navSpecials')}
          </button>
          {compareList.length > 0 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{t('navCompare')} ({compareList.length})</span>
            </button>
          )}
          <button
            onClick={onAboutClick}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {t('navAbout')}
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls Cluster */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Currency Switcher */}
          <div className="relative group">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              aria-label="Select Currency"
              className="appearance-none bg-white/5 border border-white/10 hover:border-white/20 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            >
              <option value="USD" className="bg-[#12151E] text-white">USD ($)</option>
              <option value="EUR" className="bg-[#12151E] text-white">EUR (€)</option>
              <option value="KZT" className="bg-[#12151E] text-white">KZT (₸)</option>
            </select>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-md p-0.5 text-xs font-medium">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'en'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ru')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'ru'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              RU
            </button>
          </div>

          {/* Search Trigger */}
          <button
            onClick={onSearchClick}
            aria-label="Search catalog"
            className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Wishlist */}
          <button
            onClick={() => {
              setCurrentView('store');
              document.getElementById('wishlist-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label="Wishlist"
            className="relative p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-md transition-colors hidden sm:block"
          >
            <Heart className="w-4 h-4" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 flex items-center justify-center tabular-nums">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Customer Profile / Sign In */}
          <button
            onClick={() => setIsAuthOpen(true)}
            aria-label="Customer Account"
            className="flex items-center gap-2 p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="hidden xl:inline text-xs font-medium truncate max-w-[100px]">
              {customerUser ? customerUser.fullName.split(' ')[0] : t('signIn')}
            </span>
          </button>

          {/* Shopping Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Shopping Bag"
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs rounded-lg shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-slate-950" />
            <span className="hidden sm:inline">{t('shoppingCart')}</span>
            <span className="w-4.5 h-4.5 rounded-full bg-slate-950 text-cyan-300 text-[10px] font-bold flex items-center justify-center tabular-nums">
              {cartCount}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white lg:hidden rounded-md"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/5 bg-[#090A0F]/95 px-6 py-6 space-y-4">
          <div className="flex flex-col gap-3 text-base font-medium text-slate-200">
            <button
              onClick={() =>
                handleNavClick(() => {
                  setCurrentView('store');
                  setSelectedCategory('All');
                  document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                })
              }
              className="text-left py-2 hover:text-cyan-400 transition-colors"
            >
              {t('navCatalog')}
            </button>
            <button
              onClick={() =>
                handleNavClick(() => {
                  setCurrentView('store');
                  document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
                })
              }
              className="text-left py-2 hover:text-cyan-400 transition-colors"
            >
              {t('navCategories')}
            </button>
            <button
              onClick={() => handleNavClick(onSpecialsClick)}
              className="text-left py-2 hover:text-cyan-400 transition-colors"
            >
              {t('navSpecials')}
            </button>
            <button
              onClick={() => handleNavClick(onAboutClick)}
              className="text-left py-2 hover:text-cyan-400 transition-colors"
            >
              {t('navAbout')}
            </button>
            <button
              onClick={() =>
                handleNavClick(() => {
                  setCurrentView(adminUser ? 'admin' : 'admin-login');
                })
              }
              className="text-left py-2 text-cyan-400 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{adminUser ? 'Admin Dashboard' : 'Store Owner Login'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
