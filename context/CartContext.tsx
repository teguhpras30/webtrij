'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppMode = 'b2c' | 'b2b';

export interface WholesaleTier {
  minQty: number;
  maxQty?: number | null;
  price: number;
  label?: string | null;
}

export interface CartProductVariant {
  id?: number;
  name: string;
  price: number;
  image?: string;
}

export interface CartProduct {
  id: number;
  name: string;
  slug: string;
  thumbnail: string;
  retailPrice: number;
  moq: number;
  weightGram: number;
  wholesaleTiers?: WholesaleTier[];
  variants?: CartProductVariant[];
}

export interface CartItem {
  cartItemId: string; // unique per product + variant combination
  product: CartProduct;
  selectedVariant?: CartProductVariant;
  quantity: number;
  effectiveUnitPrice: number;
  totalWeightGram: number;
}

interface FlyingItemState {
  id: number;
  src: string;
  startX: number;
  startY: number;
  tx: number;
  ty: number;
}

interface CartContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  cart: CartItem[];
  selectedCartItemIds: string[];
  setSelectedCartItemIds: (ids: string[]) => void;
  checkedCartItems: CartItem[];
  addToCart: (
    product: CartProduct,
    quantity?: number,
    selectedVariant?: CartProductVariant,
    clickEvent?: React.MouseEvent | MouseEvent | any
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  clearCheckedCartItems: () => void;
  totalItems: number;
  subtotal: number;
  totalWeightGram: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCartBouncing: boolean;
  getEffectiveUnitPrice: (product: CartProduct, qty: number, currentMode: AppMode, variant?: CartProductVariant) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setModeState] = useState<AppMode>('b2c');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCartItemIds, setSelectedCartItemIds] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [flyingItem, setFlyingItem] = useState<FlyingItemState | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Load saved cart & mode from LocalStorage on mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('webtrij_mode') as AppMode;
      if (savedMode === 'b2c' || savedMode === 'b2b') {
        setModeState(savedMode);
      }
      const savedCart = localStorage.getItem('webtrij_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setCart(parsed);
        setSelectedCartItemIds(parsed.map((i: CartItem) => i.cartItemId));
      }
    } catch (e) {
      console.warn('Failed to load cart state from localStorage');
    }
  }, []);

  // Save cart & mode to LocalStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('webtrij_mode', mode);
      localStorage.setItem('webtrij_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart state to localStorage');
    }
  }, [cart, mode]);

  // Listen for logout event to clear cart state immediately
  useEffect(() => {
    const handleLogoutEvent = () => {
      setCart([]);
      setSelectedCartItemIds([]);
      setIsCartOpen(false);
      try {
        localStorage.removeItem('webtrij_cart');
      } catch (e) {}
    };

    window.addEventListener('webtrij_logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('webtrij_logout', handleLogoutEvent);
    };
  }, []);

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    setCart(prevCart =>
      prevCart.map(item => {
        const unitPrice = getEffectiveUnitPrice(item.product, item.quantity, newMode, item.selectedVariant);
        return {
          ...item,
          effectiveUnitPrice: unitPrice,
          totalWeightGram: (item.product.weightGram || 1000) * item.quantity
        };
      })
    );
  };

  const getEffectiveUnitPrice = (
    product: CartProduct,
    qty: number,
    currentMode: AppMode,
    variant?: CartProductVariant
  ): number => {
    if (variant && variant.price > 0) {
      return variant.price;
    }
    if (currentMode === 'b2c') {
      return product.retailPrice || 0;
    }
    // Mode B2B: Calculate Volume Discount Tier
    if (product.wholesaleTiers && product.wholesaleTiers.length > 0) {
      const sortedTiers = [...product.wholesaleTiers].sort((a, b) => b.minQty - a.minQty);
      for (const tier of sortedTiers) {
        if (qty >= tier.minQty) {
          return tier.price;
        }
      }
    }
    return product.retailPrice || 0;
  };

  const addToCart = (
    product: CartProduct,
    quantity?: number,
    selectedVariant?: CartProductVariant,
    clickEvent?: React.MouseEvent | MouseEvent | any
  ) => {
    const addQty = Math.max(1, quantity || 1);
    const cartItemId = selectedVariant ? `${product.id}-${selectedVariant.name}` : `${product.id}`;

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const newQty = prevCart[existingIndex].quantity + addQty;
        const newUnitPrice = getEffectiveUnitPrice(product, newQty, mode, selectedVariant);
        const updated = [...prevCart];
        updated[existingIndex] = {
          cartItemId,
          product,
          selectedVariant,
          quantity: newQty,
          effectiveUnitPrice: newUnitPrice,
          totalWeightGram: (product.weightGram || 1000) * newQty
        };
        return updated;
      } else {
        const unitPrice = getEffectiveUnitPrice(product, addQty, mode, selectedVariant);
        return [
          ...prevCart,
          {
            cartItemId,
            product,
            selectedVariant,
            quantity: addQty,
            effectiveUnitPrice: unitPrice,
            totalWeightGram: (product.weightGram || 1000) * addQty
          }
        ];
      }
    });

    // Ensure newly added item is checked
    setSelectedCartItemIds(prev => Array.from(new Set([...prev, cartItemId])));

    // TRIGGER FLYING ITEM TO NAVBAR CART ICON ANIMATION
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;

    if (clickEvent && clickEvent.clientX && clickEvent.clientY) {
      startX = clickEvent.clientX;
      startY = clickEvent.clientY;
    }

    // Locate target navbar cart icon position
    const cartIconElement = document.getElementById('navbar-cart-icon');
    let targetX = window.innerWidth - 80;
    let targetY = 30;

    if (cartIconElement) {
      const rect = cartIconElement.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }

    const deltaX = targetX - startX;
    const deltaY = targetY - startY;

    const imgSrc = selectedVariant?.image || product.thumbnail || 'https://placehold.co/150';

    setFlyingItem({
      id: Date.now(),
      src: imgSrc,
      startX,
      startY,
      tx: deltaX,
      ty: deltaY,
    });

    // Bounce Cart Icon after item arrives
    setTimeout(() => {
      setFlyingItem(null);
      setIsCartBouncing(true);
      setToastNotice(`✓ ${product.name} dimasukkan ke Keranjang`);
      setTimeout(() => {
        setIsCartBouncing(false);
      }, 600);
      setTimeout(() => {
        setToastNotice(null);
      }, 3000);
    }, 600);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
    setSelectedCartItemIds(prev => prev.filter(id => id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.cartItemId === cartItemId) {
          const minOrder = Number(item.product.moq || (item.product as any).minOrder) || 1;
          const validQty = Math.max(minOrder, quantity);
          const unitPrice = getEffectiveUnitPrice(item.product, validQty, mode, item.selectedVariant);
          return {
            ...item,
            quantity: validQty,
            effectiveUnitPrice: unitPrice,
            totalWeightGram: (item.product.weightGram || 1000) * validQty
          };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCartItemIds([]);
    try {
      localStorage.removeItem('webtrij_cart');
    } catch (e) {}
  };

  const clearCheckedCartItems = () => {
    if (selectedCartItemIds.length === 0) return;
    setCart(prev => prev.filter(item => !selectedCartItemIds.includes(item.cartItemId)));
    setSelectedCartItemIds([]);
  };

  // Checked Items Filter
  const checkedCartItems = cart.filter(item =>
    selectedCartItemIds.length === 0 || selectedCartItemIds.includes(item.cartItemId)
  );

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = checkedCartItems.reduce((acc, item) => acc + (item.effectiveUnitPrice * item.quantity), 0);
  const totalWeightGram = checkedCartItems.reduce((acc, item) => acc + item.totalWeightGram, 0);

  return (
    <CartContext.Provider
      value={{
        mode,
        setMode,
        cart,
        selectedCartItemIds,
        setSelectedCartItemIds,
        checkedCartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        clearCheckedCartItems,
        totalItems,
        subtotal,
        totalWeightGram,
        isCartOpen,
        setIsCartOpen,
        isCartBouncing,
        getEffectiveUnitPrice
      }}
    >
      {children}

      {/* FLYING ITEM ANIMATION DOM OVERLAY */}
      {flyingItem && (
        <div
          key={flyingItem.id}
          className="fixed z-[9999] pointer-events-none animate-fly-to-cart"
          style={{
            top: `${flyingItem.startY}px`,
            left: `${flyingItem.startX}px`,
            ['--tx' as any]: `${flyingItem.tx}px`,
            ['--ty' as any]: `${flyingItem.ty}px`,
          }}
        >
          <img
            src={flyingItem.src}
            alt="Flying product"
            className="w-14 h-14 object-cover rounded-xl border-2 border-white shadow-2xl bg-white"
          />
        </div>
      )}

      {/* TOAST NOTIFICATION WHEN ITEM ADDED TO CART */}
      {toastNotice && (
        <div className="fixed bottom-6 right-6 z-[999] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastNotice}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
