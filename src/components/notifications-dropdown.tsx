"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BellIcon, BellFilledIcon, ChevronLeftIcon } from "./icons";
import { useSocial } from "./social-provider";
import { getSellerById } from "@/data/sellers";
import { products } from "@/data/products";

const MAX_PRODUCTS = 5;

export function NotificationsDropdown() {
  const { unreadNotificationCount, notificationsByShop, markAllRead, seenProductIds } = useSocial();
  const [open, setOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

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

  const newProductsForShop = selectedShopId
    ? products
        .filter((p) => p.sellerId === selectedShopId && !seenProductIds.includes(p.id))
        .slice(0, MAX_PRODUCTS)
    : [];

  const selectedSeller = selectedShopId ? getSellerById(selectedShopId) : null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        className="p-1 hover:opacity-60 transition-opacity relative"
      >
        {unreadNotificationCount > 0 ? (
          <BellFilledIcon className="h-5 w-5 text-charcoal" />
        ) : (
          <BellIcon className="h-5 w-5" />
        )}
        {unreadNotificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
          </span>
        )}
      </button>

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

          {/* Shop list */}
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
