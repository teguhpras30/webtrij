"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlistProductIds: number[];
  wishlistProducts: any[];
  loading: boolean;
  toggleWishlist: (productId: number) => Promise<boolean>;
  isWishlisted: (productId: number) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistProductIds: [],
  wishlistProducts: [],
  loading: false,
  toggleWishlist: async () => false,
  isWishlisted: () => false,
  refreshWishlist: async () => {},
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistProductIds, setWishlistProductIds] = useState<number[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistProductIds([]);
      setWishlistProducts([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/wishlist");
      if (res.ok) {
        const data = await res.json();
        setWishlistProductIds(data.wishlistProductIds || []);
        setWishlistProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        const data = await res.json();
        setWishlistProductIds(data.wishlistProductIds || []);
        await fetchWishlist();
        return Boolean(data.added);
      }
    } catch (err) {
      console.error("Toggle wishlist error:", err);
    }
    return false;
  };

  const isWishlisted = (productId: number): boolean => {
    return wishlistProductIds.includes(productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistProductIds,
        wishlistProducts,
        loading,
        toggleWishlist,
        isWishlisted,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
