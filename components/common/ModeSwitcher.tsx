'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Building2 } from 'lucide-react';

export const ModeSwitcher: React.FC = () => {
  const { mode, setMode } = useCart();

  return (
    <div className="inline-flex items-center p-1 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-full shadow-inner">
      <button
        onClick={() => setMode('b2c')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${
          mode === 'b2c'
            ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-cyan-500/20'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        <span>E-Commerce (B2C)</span>
      </button>

      <button
        onClick={() => setMode('b2b')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${
          mode === 'b2b'
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Building2 className="w-3.5 h-3.5" />
        <span>Grosir (B2B)</span>
      </button>
    </div>
  );
};
