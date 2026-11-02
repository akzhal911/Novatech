import React from 'react';
import { useShop } from '../context/ShopContext';
import {
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Gamepad2,
  Tablet,
  Camera,
  Layers,
  Sparkles
} from 'lucide-react';
import { ProductCategory } from '../types';

interface CategoryItem {
  id: ProductCategory;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  imagePath: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'Smartphones', labelKey: 'catSmartphones', icon: Smartphone, imagePath: '/src/assets/images/hero_flagship_device_1793628017947.jpg' },
  { id: 'Laptops', labelKey: 'catLaptops', icon: Laptop, imagePath: '/src/assets/images/laptop_titan_pro_1793627891214.jpg' },
  { id: 'Headphones', labelKey: 'catHeadphones', icon: Headphones, imagePath: '/src/assets/images/headphones_studio_anc_1793627892404.jpg' },
  { id: 'Smart Watches', labelKey: 'catSmartWatches', icon: Watch, imagePath: '/src/assets/images/smartwatch_chronos_titanium_1793627892590.jpg' },
  { id: 'Gaming', labelKey: 'catGaming', icon: Gamepad2, imagePath: '/src/assets/images/gaming_rig_vortex_1793628039167.jpg' },
  { id: 'Tablets', labelKey: 'catTablets', icon: Tablet, imagePath: '/src/assets/images/tablet_liquid_pro_1793628039684.jpg' },
  { id: 'Cameras', labelKey: 'catCameras', icon: Camera, imagePath: '/src/assets/images/camera_cinema_8k_1793628041923.jpg' },
  { id: 'Accessories', labelKey: 'catAccessories', icon: Layers, imagePath: '/src/assets/images/accessories_gan_dock_1793628040358.jpg' },
];

export const CategoryBar: React.FC = () => {
  const { t, selectedCategory, setSelectedCategory, products } = useShop();

  const handleSelect = (category: ProductCategory | 'All') => {
    setSelectedCategory(category);
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCount = (cat: ProductCategory) => {
    return products.filter((p) => p.category === cat).length;
  };

  return (
    <section id="categories-section" className="py-12 border-b border-white/5 bg-[#090A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Engineered Domains</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
              {t('categoriesHeading')}
            </h2>
          </div>

          <button
            onClick={() => handleSelect('All')}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'All'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white bg-white/5 border border-white/10'
            }`}
          >
            {t('allCategories')} ({products.length})
          </button>
        </div>

        {/* 8 Category Tiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count = getCount(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className={`group flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-cyan-950/30 border-cyan-500/50 text-white shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/30'
                    : 'bg-[#12151E] border-white/5 hover:border-white/15 text-slate-300 hover:text-white hover:bg-[#181C28]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2.5 transition-colors ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                      : 'bg-white/5 text-slate-300 group-hover:text-cyan-400 group-hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold line-clamp-1">{t(cat.labelKey)}</span>
                <span className="text-[10px] text-slate-500 mt-0.5 tabular-nums">
                  {count} {t('itemsCount')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
