import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Shield, Truck, RotateCcw, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { ProductCategory } from '../types';

export const Footer: React.FC = () => {
  const { t, setSelectedCategory, setCurrentView, adminUser, addToast } = useShop();
  const [emailInput, setEmailInput] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    addToast(t('subscribedToast'), 'success');
    setEmailInput('');
  };

  const handleCategoryClick = (cat: ProductCategory) => {
    setSelectedCategory(cat);
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#07080C] border-t border-white/5 text-slate-400 text-xs text-left">
      {/* 3 Pillars / Value Propositions Section */}
      <div className="border-b border-white/5 py-12 bg-[#090A0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-cyan-400 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">{t('valInnovationTitle')}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{t('valInnovationDesc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-cyan-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">{t('valGlobalTitle')}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{t('valGlobalDesc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-cyan-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">{t('valWarrantyTitle')}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{t('valWarrantyDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white font-display tracking-tight uppercase">
                NOVATECH
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              International luxury store specializing in flagship consumer electronics, computational workstations, and acoustic precision equipment.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 space-y-1">
              <div>Global Operations: Zurich · Tokyo · New York · Almaty · Dubai</div>
              <div>Concierge: VIP-Concierge@novatech.store</div>
            </div>
          </div>

          {/* Categories Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t('navCategories')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleCategoryClick('Smartphones')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {t('catSmartphones')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Laptops')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {t('catLaptops')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Headphones')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {t('catHeadphones')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Smart Watches')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {t('catSmartWatches')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Gaming')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {t('catGaming')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Cameras')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {t('catCameras')}
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Assurance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-400">Authenticity Guarantee</span>
              </li>
              <li>
                <span className="text-slate-400">International Customs Duty Paid</span>
              </li>
              <li>
                <span className="text-slate-400">2-Year Hardware Warranty</span>
              </li>
              <li>
                <span className="text-slate-400">Direct Express Tracking</span>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => setCurrentView(adminUser ? 'admin' : 'admin-login')}
                  className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('navAdmin')}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t('newsletterTitle')}
            </h4>
            <p className="text-xs text-slate-400">
              {t('newsletterSubtitle')}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter email..."
                  required
                  className="w-full bg-[#12151E] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{t('subscribe')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} NOVATECH Flagship Corporation. {t('rightsReserved')}
          </div>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>Global Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
