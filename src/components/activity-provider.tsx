"use client";

import {
  createContext, useContext, useState, useEffect,
  useRef, useCallback,
} from "react";
import { useAuth } from "./auth-provider";
import { useSocial } from "./social-provider";
import { products } from "@/data/products";
import { getAllSellers } from "@/data/sellers";
import { generateActivityEvent, type ActivityEvent } from "@/lib/activity-events";
import { ActivityToast } from "./activity-toast";

// ---------------------------------------------------------------------------
// Timing constants  (swap these for feature-flag / server config in production)
// ---------------------------------------------------------------------------
const FIRST_DELAY_MIN  =   5_000;  // 5 s  (30 s in production)
const FIRST_DELAY_MAX  =  10_000;  // 10 s (60 s in production)
const NEXT_DELAY_MIN   =  30_000;  // 30 s (2 min in production)
const NEXT_DELAY_MAX   =  60_000;  // 60 s (4 min in production)
const TOAST_DURATION   =   5_000;  // 5 s visible
const MAX_PER_HOUR     =       8;

const PREF_KEY = "fh_activity_enabled";

function jitter(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ActivityContextValue {
  activityEnabled: boolean;
  setActivityEnabled: (v: boolean) => void;
}

const ActivityContext = createContext<ActivityContextValue | null>(null);

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be used within ActivityProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { followedProductIds, followedShopIds } = useSocial();

  // ── User preference ───────────────────────────────────────────────────────
  const [activityEnabled, setActivityEnabledState] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(PREF_KEY);
      return v === null ? true : v === "true";
    } catch { return true; }
  });

  function setActivityEnabled(v: boolean) {
    setActivityEnabledState(v);
    try { localStorage.setItem(PREF_KEY, String(v)); } catch {}
  }

  // ── Current toast ─────────────────────────────────────────────────────────
  const [currentEvent, setCurrentEvent] = useState<ActivityEvent | null>(null);

  // ── Scheduling state (refs avoid stale-closure issues in timeouts) ────────
  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRef      = useRef(true);
  const hourCountRef    = useRef(0);
  const hourStartRef    = useRef(Date.now());

  // Keep live copies of deps that the timeout callback reads
  const userRef              = useRef(user);
  const enabledRef           = useRef(activityEnabled);
  const followedProductsRef  = useRef(followedProductIds);
  const followedShopsRef     = useRef(followedShopIds);

  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { enabledRef.current = activityEnabled; }, [activityEnabled]);
  useEffect(() => { followedProductsRef.current = followedProductIds; }, [followedProductIds]);
  useEffect(() => { followedShopsRef.current = followedShopIds; }, [followedShopIds]);

  // ── Core scheduler ────────────────────────────────────────────────────────
  const scheduleNext = useCallback((isFirst = false) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const delay = isFirst
      ? jitter(FIRST_DELAY_MIN, FIRST_DELAY_MAX)
      : jitter(NEXT_DELAY_MIN, NEXT_DELAY_MAX);

    timerRef.current = setTimeout(() => {
      if (!enabledRef.current) return;

      // Reset hourly counter
      const now = Date.now();
      if (now - hourStartRef.current > 3_600_000) {
        hourCountRef.current = 0;
        hourStartRef.current = now;
      }
      if (hourCountRef.current >= MAX_PER_HOUR) return;

      // Use followed items when available; fall back to random catalog items for demo
      const allProducts = products;
      const allSellers = getAllSellers();

      const followedProducts = followedProductsRef.current.length > 0
        ? allProducts.filter((p) => followedProductsRef.current.includes(p.id))
        : allProducts.slice(0, 8);  // demo fallback

      const followedShops = followedShopsRef.current.length > 0
        ? allSellers.filter((s) => followedShopsRef.current.includes(s.id))
        : allSellers.slice(0, 4);   // demo fallback

      // In production: await fetchNextActivityEvent(userId) here instead
      const event = generateActivityEvent(followedProducts, followedShops);
      if (event) {
        setCurrentEvent(event);
        hourCountRef.current++;
      }
    }, delay);
  }, []);

  // ── Start on mount; pause when user disables the feature ─────────────────
  useEffect(() => {
    if (!activityEnabled) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    scheduleNext(true);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityEnabled]);

  // ── Dismiss handler ───────────────────────────────────────────────────────
  function handleDismiss() {
    setCurrentEvent(null);
    scheduleNext(false);
  }

  return (
    <ActivityContext.Provider value={{ activityEnabled, setActivityEnabled }}>
      {children}
      {currentEvent && (
        <ActivityToast
          key={currentEvent.id}
          event={currentEvent}
          onDismiss={handleDismiss}
          duration={TOAST_DURATION}
        />
      )}
    </ActivityContext.Provider>
  );
}
