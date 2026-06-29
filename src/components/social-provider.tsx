"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./auth-provider";
import { products } from "@/data/products";

interface SocialContextValue {
  likedProductIds: string[];
  toggleLike: (productId: string) => void;
  isLiked: (productId: string) => boolean;

  followedProductIds: string[];
  toggleFollowProduct: (productId: string) => void;
  isFollowingProduct: (productId: string) => boolean;

  followedShopIds: string[];
  toggleFollowShop: (shopId: string) => void;
  isFollowingShop: (shopId: string) => boolean;

  seenProductIds: string[];
  unreadNotificationCount: number;
  notificationsByShop: { shopId: string; count: number }[];
  markAllRead: () => void;
}

const SocialContext = createContext<SocialContextValue | null>(null);

function storageKey(email: string, suffix: string) {
  return `fh_${email}_${suffix}`;
}

function load<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used within SocialProvider");
  return ctx;
}

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [likedProductIds, setLikedProductIds] = useState<string[]>([]);
  const [followedProductIds, setFollowedProductIds] = useState<string[]>([]);
  const [followedShopIds, setFollowedShopIds] = useState<string[]>([]);
  const [seenProductIds, setSeenProductIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLikedProductIds([]);
      setFollowedProductIds([]);
      setFollowedShopIds([]);
      setSeenProductIds([]);
      return;
    }
    setLikedProductIds(load<string[]>(storageKey(user.email, "likes"), []));
    setFollowedProductIds(load<string[]>(storageKey(user.email, "followed_products"), []));
    setFollowedShopIds(load<string[]>(storageKey(user.email, "followed_shops"), []));
    setSeenProductIds(load<string[]>(storageKey(user.email, "seen_products"), []));
  }, [user]);

  const toggleLike = useCallback((productId: string) => {
    if (!user) return;
    setLikedProductIds(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      save(storageKey(user.email, "likes"), next);
      return next;
    });
  }, [user]);

  const isLiked = useCallback(
    (productId: string) => likedProductIds.includes(productId),
    [likedProductIds]
  );

  const toggleFollowProduct = useCallback((productId: string) => {
    if (!user) return;
    setFollowedProductIds(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      save(storageKey(user.email, "followed_products"), next);
      return next;
    });
  }, [user]);

  const isFollowingProduct = useCallback(
    (productId: string) => followedProductIds.includes(productId),
    [followedProductIds]
  );

  const toggleFollowShop = useCallback((shopId: string) => {
    if (!user) return;
    setFollowedShopIds(prev => {
      const next = prev.includes(shopId)
        ? prev.filter(id => id !== shopId)
        : [...prev, shopId];
      save(storageKey(user.email, "followed_shops"), next);
      return next;
    });
  }, [user]);

  const isFollowingShop = useCallback(
    (shopId: string) => followedShopIds.includes(shopId),
    [followedShopIds]
  );

  const notificationsByShop = followedShopIds.map(shopId => {
    const shopProducts = products.filter(p => p.sellerId === shopId);
    const unread = shopProducts.filter(p => !seenProductIds.includes(p.id));
    return { shopId, count: unread.length };
  }).filter(n => n.count > 0);

  const unreadNotificationCount = notificationsByShop.reduce((sum, n) => sum + n.count, 0);

  const markAllRead = useCallback(() => {
    if (!user) return;
    const allFollowedShopProductIds = products
      .filter(p => followedShopIds.includes(p.sellerId))
      .map(p => p.id);
    setSeenProductIds(prev => {
      const next = Array.from(new Set([...prev, ...allFollowedShopProductIds]));
      save(storageKey(user.email, "seen_products"), next);
      return next;
    });
  }, [user, followedShopIds]);

  return (
    <SocialContext.Provider value={{
      likedProductIds,
      toggleLike,
      isLiked,
      followedProductIds,
      toggleFollowProduct,
      isFollowingProduct,
      followedShopIds,
      toggleFollowShop,
      isFollowingShop,
      seenProductIds,
      unreadNotificationCount,
      notificationsByShop,
      markAllRead,
    }}>
      {children}
    </SocialContext.Provider>
  );
}
