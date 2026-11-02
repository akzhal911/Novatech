import React from 'react';
import { useShop } from '../context/ShopContext';
import { ArrowRight, Cpu, Shield, Sparkles, Eye } from 'lucide-react';

export const Hero: React.FC = () => {
  const { t, products, setSelectedProduct, formatPrice } = useShop();

  // Find flagship device
  const flagship = products.find((p) => p.id === 'nova-phone-ultra-x') || products[0];

  const handleShopNow = () => {
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExploreFlagship = () => {
    if (flagship) {
      setSelectedProduct(flagship);
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 border-b border-white/5 bg-gradient-to-b from-[#090A0F] via-[#0C0F17] to-[#090A0F]">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute -top-12 right-12 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Brand Statement & Actions */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-cyan-300 font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('heroBadge')}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">NovaSilicon M3 Series</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display leading-[1.1] text-balance">
              {t('heroTitle')}
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-xl font-normal leading-relaxed">
              {t('heroSubtitle')}
            </p>

            {/* Price Preview if flagship is ready */}
            {flagship && (
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">From</span>
                <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {formatPrice(flagship.price)}
                </span>
                {flagship.oldPrice && (
                  <span className="text-sm text-slate-500 line-through tabular-nums">
                    {formatPrice(flagship.oldPrice)}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleShopNow}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm rounded-lg shadow-xl shadow-cyan-500/20 transition-all active:scale-95"
              >
                <span>{t('shopNow')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleExploreFlagship}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm rounded-lg border border-white/10 hover:border-white/20 transition-all"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>{t('exploreCollection')}</span>
              </button>
            </div>

            {/* Technical Highlights Strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-left">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Titanium Grade 5</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Aerospace Precision</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Quantum M3</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">3nm Architecture</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>200MP 8K DCI</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Periscope Optics</div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Product Visual Frame */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-[#12151E] group shadow-2xl shadow-cyan-500/10">
              <img
                src="/src/assets/images/hero_flagship_device_1793628017947.jpg"
                alt="NovaPhone Ultra X Titanium Flagship"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-transparent to-transparent opacity-60" />
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono text-cyan-300 tracking-wider">NOVATECH // MODEL: ULTRA-X</span>
                <span className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded text-[11px] text-white">
                  Available for Immediate Dispatch
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
