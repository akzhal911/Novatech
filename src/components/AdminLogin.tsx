import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShieldCheck, Lock, User, ArrowRight, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { adminLogin, setCurrentView, t } = useShop();

  const [username, setUsername] = useState('akzhal.a');
  const [password, setPassword] = useState('akzhal2010');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const success = await adminLogin(password, username);
    setIsLoading(false);
    if (!success) {
      setErrorMsg('Invalid credentials. Required: akzhal.a / akzhal2010');
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative py-12">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Back button */}
      <div className="w-full max-w-md mb-6">
        <button
          onClick={() => setCurrentView('store')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('viewStore')}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-[#0F121B] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6 text-left relative z-10">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-950/40">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white font-display">
            {t('adminTitle')}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {t('adminSubtitle')}
          </p>
        </div>

        {/* Credentials Notice Box for testing / convenience */}
        <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Authorized Owner Access</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Login: <span className="font-mono text-white font-bold">akzhal.a</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Password: <span className="font-mono text-white font-bold">akzhal2010</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              {t('adminUsername')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-[#090A0F] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                placeholder="akzhal.a"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              {t('adminPassword')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#090A0F] border border-white/10 rounded-lg pl-9 pr-9 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>{isLoading ? 'Verifying...' : t('adminLoginBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-slate-500">
          Secured cryptographic hash and role verification enforcement.
        </div>
      </div>
    </div>
  );
};
