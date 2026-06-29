"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BellIcon, BellFilledIcon, ChevronLeftIcon, CloseIcon } from "./icons";
import { useSocial } from "./social-provider";
import { getSellerById } from "@/data/sellers";
import { products } from "@/data/products";

const MAX_PRODUCTS      = 5;
const PEEK_FIRST_DELAY  = 45_000;   // 45 s before first peek
const PEEK_REPEAT_DELAY = 180_000;  // 3 min between peeks
const PEEK_DURATION     =   6_000;  // 6 s visible
const MAX_PEEKS         =       2;  // max peeks per session

export function NotificationsDropdown() {
  const {
    unreadNotificationCount,
    notificationsByShop,
    markAllRead,
    seenProductIds,
    likedProductIds,
  } = useSocial();

  const [open, setOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [reminderPeek, setReminderPeek] = useState(false);

  const ref            = useRef<HTMLDivElement>(null);
  const openRef        = useRef(false);
  const peekTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const peekDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const peekCountRef   = useRef(0);

  useEffect(() => { openRef.current = open; }, [open]);

  // Close dropdown on outside click
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) { setSelectedShopId(null); return; }
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Periodic peek reminder — fires automatically when user has liked items
  useEffect(() => {
    if (likedProductIds.length === 0) {
      if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
      if (peekDismissRef.current) clearTimeout(peekDismissRef.current);
      return;
    }

    function showPeek() {
      if (peekCountRef.current >= MAX_PEEKS) return;
      if (openRef.current) {
        peekTimerRef.current = setTimeout(showPeek, PEEK_REPEAT_DELAY);
        return;
      }
      setReminderPeek(true);
      peekCountRef.current++;
      peekDismissRef.current = setTimeout(() => {
        setReminderPeek(false);
        if (peekCountRef.current < MAX_PEEKS) {
          peekTimerRef.current = setTimeout(showPeek, PEEK_REPEAT_DELAY);
        }
      }, PEEK_DURATION);
    }

    peekTimerRef.current = setTimeout(showPeek, PEEK_FIRST_DELAY);
    return () => {
      if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
      if (peekDismissRef.current) clearTimeout(peekDismissRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likedProductIds.length]);

  function handleBellClick() {
    setOpen((prev) => !prev);
    setReminderPeek(false);
  }

  const newProductsForShop = selectedShopId
    ? products
        .filter((p) => p.sellerId === selectedShopId && !seenProductIds.includes(p.id))
        .slice(0, MAX_PRODUCTS)
    : [];

  const selectedSeller = selectedShopId ? getSellerById(selectedShopId) : null;

  // Bell badge = shop notifications + 1 if user has saved items
  const totalBadgeCount = unreadNotificationCount + (likedProductIds.length > 0 ? 1 : 0);

  return (
    <div ref={ref} className="relative">

      {/* Bell button */}
      <button
        onClick={handleBellClick}
        aria-label="Notifications"
        className="p-1 hover:opacity-60 transition-opacity relative"
      >
        {totalBadgeCount > 0 ? (
          <BellFilledIcon className="h-5 w-5 text-charcoal" />
        ) : (
          <BellIcon className="h-5 w-5" />
        )}
        {totalBadgeCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {totalBadgeCount > 99 ? "99+" : totalBadgeCount}
          </span>
        )}
      </button>

      {/* Auto-peek reminder — slides out from bell periodically */}
      {reminderPeek && !open && likedProductIds.length > 0 && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-black/10 shadow-lg z-50">
          <div className="px-4 py-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.6px] text-charcoal">
                ⭐ {likedProductIds.length} saved item{likedProductIds.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => setReminderPeek(false)}
                className="text-warm-gray hover:text-charcoal flex-shrink-0 transition-opacity"
                aria-label="Dismiss"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-warm-gray leading-relaxed mb-2.5">
              Take another look and see if they still catch your eye.
            </p>
            <Link
              href="/wishlist"
              onClick={() => setReminderPeek(false)}
              className="inline-block text-[10px] font-medium uppercase tracking-[0.5px] text-charcoal underline underline-offset-2 hover:opacity-60 transition-opacity"
            >
              View Saved Items →
            </Link>
          </div>
        </div>
      )}

      {/* Main dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-black/10 shadow-lg z-50">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
            {selectedShopId ? (
              <button
                onClick={() => setSelectedShopId(null)}
                className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.8px] text-charcoal hover:opacity-60 transition-opacity"
              >
                <ChevronLeftIcon className="h-3.5 w-3.5" />
                Back
              </button>
            ) : (
              <span className="text-[11px] font-medium uppercase tracking-[0.8px] text-charcoal">
                Notifications
              </span>
            )}
            {!selectedShopId && unreadNotificationCount > 0 && (
              <button
                onClick={() => { markAllRead(); setOpen(false); }}
                className="text-[10px] text-warm-gray underline hover:text-charcoal transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Saved Items Reminder — always visible at top when user has liked items */}
          {!selectedShopId && likedProductIds.length > 0 && (
            <div className="px-4 py-3 border-b border-black/8 bg-[#f5f2eb]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.6px] text-charcoal mb-0.5">
                ⭐ You&apos;re following {likedProductIds.length} saved item{likedProductIds.length !== 1 ? "s" : ""}
              </p>
              <p className="text-[11px] text-warm-gray leading-relaxed mb-2">
                Take another look and see if they still catch your eye.
              </p>
              <Link
                href="/wishlist"
                onClick={() => setOpen(false)}
                className="text-[10px] font-medium uppercase tracking-[0.5px] text-charcoal underline underline-offset-2 hover:opacity-60 transition-opacity"
              >
                View Saved Items
              </Link>
            </div>
          )}

          {/* Shop notifications list */}
          {!selectedShopId && (
            <div className="max-h-72 overflow-y-auto">
              {notificationsByShop.length === 0 ? (
                <p className="text-[12px] text-warm-gray text-center py-6 px-4">
                  No new notifications
                </p>
              ) : (
                notificationsByShop.map(({ shopId, count }) => {
                  const seller = getSellerById(shopId);
                  if (!seller) return null;
                  const displayCount = Math.min(count, MAX_PRODUCTS);
                  return (
                    <button
                      key={shopId}
                      onClick={() => setSelectedShopId(shopId)}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-black/5 last:border-0 hover:bg-black/[0.02] transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-semibold text-charcoal">
                          {seller.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-charcoal font-medium truncate">{seller.name}</p>
                        <p className="text-[11px] text-warm-gray">
                          {displayCount}{count > MAX_PRODUCTS ? "+" : ""} new product{displayCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <ChevronLeftIcon className="h-3.5 w-3.5 text-warm-gray rotate-180 flex-shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* New products for selected shop */}
          {selectedShopId && selectedSeller && (
            <div className="max-h-72 overflow-y-auto">
              <p className="px-4 py-2 text-[11px] text-warm-gray border-b border-black/5">
                New from {selectedSeller.name}
              </p>
              {newProductsForShop.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-3 border-b border-black/5 last:border-0 hover:bg-black/[0.02] transition-colors"
                >
                  <p className="text-[12px] text-charcoal font-medium truncate pr-3">
                    {product.name}
                  </p>
                  <p className="text-[12px] text-warm-gray flex-shrink-0">
                    {product.price} zl
                  </p>
                </Link>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
