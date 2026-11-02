import React, { useState } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryBar } from './components/CategoryBar';
import { Catalog } from './components/Catalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerCabinetModal } from './components/CustomerCabinetModal';
import { ProductCompareModal } from './components/ProductCompareModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';
import {
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Cpu,
  Layers,
  Search
} from 'lucide-react';

const StoreContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    adminUser,
    products,
    setSelectedProduct,
    formatPrice,
    setSelectedCategory,
    t
  } = useShop();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // Admin route routing
  if (currentView === 'admin-login') {
    return (
      <>
        <AdminLogin />
        <ToastContainer />
      </>
    );
  }

  if (currentView === 'admin') {
    if (!adminUser) {
      return (
        <>
          <AdminLogin />
          <ToastContainer />
        </>
      );
    }
    return (
      <>
        <AdminPanel />
        <ToastContainer />
      </>
    );
  }

  // Filter special offers
  const specialOffers = products.filter((p) => p.isSpecialOffer || (p.oldPrice && p.oldPrice > p.price));

  const handleProceedToCheckout = (discount: number) => {
    setAppliedDiscount(discount);
    setIsCheckoutOpen(true);
  };

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  const handleAboutClick = () => {
    setIsAboutOpen(true);
  };

  const handleSpecialsClick = () => {
    document.getElementById('specials-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredSearchModalProducts = modalSearchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(modalSearchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      
      {/* Primary Header conforming to Top Bar Contract */}
      <Header
        onSearchClick={handleSearchClick}
        onAboutClick={handleAboutClick}
        onSpecialsClick={handleSpecialsClick}
      />

      <main className="flex-1">
        {/* Hero Flagship Presentation */}
        <Hero />

        {/* 8 Curated Categories */}
        <CategoryBar />

        {/* Main Catalog with Filters & Search */}
        <Catalog />

        {/* Special Offers Carousel / Highlight Section */}
        {specialOffers.length > 0 && (
          <section id="specials-section" className="py-16 border-b border-white/5 bg-gradient-to-b from-[#090A0F] to-[#0D1017]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Exclusive Opportunities</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                    {t('navSpecials')}
                  </h2>
                </div>

                <button
                  onClick={() => {
                    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
                >
                  <span>View All in Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {specialOffers.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedProduct(item)}
                    className="p-5 rounded-2xl bg-[#12151E] border border-white/5 hover:border-amber-400/40 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black">
                        <img
                          src={item.images?.[0] || '/src/assets/images/hero_flagship_device_1793628017947.jpg'}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {item.oldPrice && (
                          <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            Save {formatPrice(item.oldPrice - item.price)}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                          {item.brand} · {item.category}
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors mt-0.5">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-white tabular-nums">
                          {formatPrice(item.price)}
                        </span>
                        {item.oldPrice && (
                          <span className="text-xs text-slate-500 line-through tabular-nums">
                            {formatPrice(item.oldPrice)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Explore <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Global Technology Partners & Engineering Standards */}
        <section className="py-12 border-b border-white/5 bg-[#090A0F]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              International Engineering Collaborators
            </span>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-50 grayscale hover:grayscale-0 transition-all text-sm font-bold tracking-wider text-slate-400 font-display">
              <span>NOVASILICON</span>
              <span>QUALCOMM</span>
              <span>HASSELBLAD OPTICS</span>
              <span>BERYLLIUM ACOUSTICS</span>
              <span>AMD RDNA</span>
              <span>CORNING CERAMIC</span>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <ProductDetailModal />
      
      <CartDrawer onProceedToCheckout={handleProceedToCheckout} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        appliedDiscount={appliedDiscount}
      />

      <CustomerCabinetModal />

      <ProductCompareModal />

      {/* Instant Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#0F121B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-left">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Search className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
              />
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-4 space-y-2">
              {filteredSearchModalProducts.length > 0 ? (
                filteredSearchModalProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p);
                      setIsSearchModalOpen(false);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <img
                      src={p.images?.[0] || '/src/assets/images/hero_flagship_device_1793628017947.jpg'}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover bg-black shrink-0"
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                      <div className="text-[11px] text-slate-400">{p.brand} · {p.category}</div>
                    </div>
                    <div className="text-xs font-bold text-cyan-400 tabular-nums">
                      {formatPrice(p.price)}
                    </div>
                  </div>
                ))
              ) : modalSearchQuery.trim() ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No matching flagship devices found.
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  Type to instantly search smartphones, laptops, audio systems...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* About NOVATECH Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0F121B] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-left space-y-6 my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white font-display uppercase tracking-tight">
                  About NOVATECH
                </h3>
                <p className="text-xs text-cyan-400 mt-0.5">Technology. Without Limits.</p>
              </div>
              <button
                onClick={() => setIsAboutOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                Founded as an elite international electronics house, NOVATECH represents the convergence of uncompromising industrial precision and cutting-edge silicon architecture.
              </p>
              <p>
                Every device in our curated collections undergoes stringent hardware verification, acoustic benchmarking, and thermal calibration before being dispatched to our private clientele across North America, Europe, Asia, and the CIS region.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="font-bold text-white text-sm">24-Month Assurance</div>
                  <div className="text-[11px] text-slate-400 mt-1">Direct replacement without intermediary delays.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="font-bold text-white text-sm">Insured Air Freight</div>
                  <div className="text-[11px] text-slate-400 mt-1">Door-to-door temperature-controlled delivery.</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsAboutOpen(false)}
                className="px-5 py-2.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-cyan-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <StoreContent />
    </ShopProvider>
  );
}
