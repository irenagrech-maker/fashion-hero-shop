"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BookmarkIcon, BookmarkFilledIcon } from "./icons";
import { useSocial } from "./social-provider";
import { getSellerById } from "@/data/sellers";

export function FollowedShopsDropdown() {
  const { followedShopIds } = useSocial();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const count = followedShopIds.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Followed shops"
        className="p-1 hover:opacity-60 transition-opacity relative"
      >
        {count > 0 ? (
          <BookmarkFilledIcon className="h-5 w-5 text-charcoal" />
        ) : (
          <BookmarkIcon className="h-5 w-5" />
        )}
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-charcoal text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-black/10 shadow-lg z-50">
          <div className="px-4 py-3 border-b border-black/5">
            <span className="text-[11px] font-medium uppercase tracking-[0.8px] text-charcoal">
              Followed Shops
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {count === 0 ? (
              <p className="text-[12px] text-warm-gray text-center py-6 px-4">
                No followed shops yet
              </p>
            ) : (
              followedShopIds.map((shopId) => {
                const seller = getSellerById(shopId);
                if (!seller) return null;
                return (
                  <Link
                    key={shopId}
                    href={`/collections/all?seller=${seller.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 border-b border-black/5 last:border-0 hover:bg-black/[0.02] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-semibold text-charcoal">
                        {seller.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-charcoal font-medium truncate">
                        {seller.name}
                      </p>
                      <p className="text-[11px] text-warm-gray truncate">
                        {seller.description}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
