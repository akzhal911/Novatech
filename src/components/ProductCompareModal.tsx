import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, SlidersHorizontal, ShoppingBag, Trash2, Check, Star } from 'lucide-react';

export const ProductCompareModal: React.FC = () => {
  const {
    isCompareOpen,
    setIsCompareOpen,
    compareList,
    removeFromCompare,
    clearCompare,
    formatPrice,
    addToCart,
    t
  } = useShop();

  if (!isCompareOpen) return null;

  // Gather unique spec keys
  const allSpecKeys = Array.from(
    new Set(compareList.flatMap((p) => Object.keys(p.specs || {})))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0F121B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#12151E]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-display">
              {t('navCompare')} ({compareList.length}/4)
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {compareList.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsCompareOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {compareList.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <SlidersHorizontal className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm">No flagship devices selected for comparison.</p>
              <p className="text-xs text-slate-500">
                Click the compare icon on product cards to view technical parameters side-by-side.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-300 min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 w-40 text-slate-400 uppercase font-semibold text-[11px]">
                      Parameter
                    </th>
                    {compareList.map((prod) => (
                      <th key={prod.id} className="p-3 w-56 align-top">
                        <div className="relative group p-2 rounded-xl bg-white/5 border border-white/5 space-y-2">
                          <button
                            onClick={() => removeFromCompare(prod.id)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-rose-400 p-1 rounded"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <img
                            src={prod.images?.[0] || '/src/assets/images/hero_flagship_device_1793628017947.jpg'}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-28 object-cover rounded-lg bg-black"
                          />
                          <div className="font-semibold text-white truncate">{prod.name}</div>
                          <div className="text-cyan-400 font-bold text-sm tabular-nums">
                            {formatPrice(prod.price)}
                          </div>
                          <button
                            onClick={() => addToCart(prod, 1)}
                            className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded transition-colors flex items-center justify-center gap-1"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3 text-slate-400 font-medium">Brand</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 font-semibold text-white">
                        {p.brand}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-medium">Category</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3">
                        {p.category}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-medium">Rating</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 text-amber-400 font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{p.rating.toFixed(1)}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-medium">Inventory Stock</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 text-emerald-400 font-semibold">
                        {p.stock > 0 ? `${p.stock} units` : 'Out of Stock'}
                      </td>
                    ))}
                  </tr>
                  {/* Detailed Specs Rows */}
                  {allSpecKeys.map((key) => (
                    <tr key={key}>
                      <td className="p-3 text-slate-400 font-medium">{key}</td>
                      {compareList.map((p) => (
                        <td key={p.id} className="p-3 text-slate-200">
                          {p.specs?.[key] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
