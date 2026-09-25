'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, X, Trash2, ArrowRight, Ticket, Percent } from 'lucide-react';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { ADMIN_FEE_IDR } from '@/lib/vouchers';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalWeightGram } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const estimatedGrandTotal = subtotal + ADMIN_FEE_IDR;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] transition-opacity animate-fade-in" onClick={() => setIsCartOpen(false)}>
        <div
          className="fixed top-0 right-0 w-full max-w-md h-full bg-slate-900 border-l border-slate-800 text-white shadow-2xl flex flex-col z-[101] animate-slide-left font-sans"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-lg text-slate-100">Keranjang Belanja</h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                <ShoppingCart className="w-16 h-16 opacity-30 mb-3 text-slate-500" />
                <p className="font-medium text-slate-300">Keranjang Anda masih kosong</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[220px]">Tambahkan produk dari katalog untuk mulai belanja.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.cartItemId} className="p-3 bg-slate-850/60 border border-slate-800 rounded-xl flex gap-3 items-center">
                  <img
                    src={item.product.thumbnail}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg bg-slate-800 border border-slate-700/50 flex-shrink-0"
                    onError={(e: any) => { e.target.src = 'https://via.placeholder.com/150'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-slate-100 truncate">{item.product.name}</h4>
                    {item.selectedVariant && (
                      <div className="text-[11px] text-purple-400 font-medium truncate mt-0.5">
                        Variasi: {item.selectedVariant.name}
                      </div>
                    )}
                    <div className="text-emerald-400 font-bold text-xs mt-0.5">
                      {formatIDR(item.effectiveUnitPrice)} <span className="text-[10px] text-slate-400 font-normal">/ unit</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-slate-700 rounded-md bg-slate-900">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.cartItemId, item.quantity - 1);
                            } else {
                              removeFromCart(item.cartItemId);
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-l cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 py-1 text-xs font-bold text-slate-200 min-w-[20px] text-center select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-r cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="ml-auto text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
              {/* Promo Voucher Highlight Badge */}
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-purple-300">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold">Voucher Promo & Gratis Ongkir Siap Dipasang!</span>
                </div>
              </div>

              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal Produk</span>
                <span className="font-medium text-slate-200">{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Berat (Est. Biteship)</span>
                <span className="font-medium text-slate-200">{(totalWeightGram / 1000).toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Biaya Admin (Transaksi)</span>
                <span className="font-medium text-slate-200">+{formatIDR(ADMIN_FEE_IDR)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800/80">
                <span>Est. Total Belanja</span>
                <span className="text-emerald-400">{formatIDR(estimatedGrandTotal)}</span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Lanjut ke Checkout & Voucher</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isCheckoutOpen && (
        <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      )}
    </>
  );
};
