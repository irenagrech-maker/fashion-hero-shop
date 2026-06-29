"use client";

import { useEffect, useState, useRef } from "react";
import type { Product } from "@/types";
import { products as allProducts } from "@/data/products";
import { ProductCard } from "./product-card";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

const STORAGE_KEY = "stepforward-recently-viewed";
const MAX_ITEMS = 8;

function loadRecentlyViewed(): string[] {
  try {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentlyViewed(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage unavailable
  }
}

export function trackRecentlyViewed(productId: string) {
  const ids = loadRecentlyViewed();
  const next = [productId, ...ids.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
  saveRecentlyViewed(next);
}

export function RecentlyViewed({ currentProductId }: { currentProductId: string }) {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ids = loadRecentlyViewed().filter((id) => id !== currentProductId);
    const resolved = ids
      .map((id) => allProducts.find((p) => p.id === id))
      .filter((p): p is Product => !!p);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecentProducts(resolved);
  }, [currentProductId]);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  }

  if (recentProducts.length === 0) return null;

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-charcoal">Recently Viewed</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-full hover:border-charcoal transition-colors"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-full hover:border-charcoal transition-colors"
            aria-label="Next"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 snap-x snap-mandatory"
      >
        {recentProducts.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-[220px] md:w-[260px] snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
