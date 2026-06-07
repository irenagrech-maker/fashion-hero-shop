import type { Product } from "@/types";
import type { Seller } from "@/types";

export type EventType =
  | "product_purchased"
  | "product_added_to_cart"
  | "new_product_in_shop"
  | "low_stock"
  | "price_drop"
  | "shop_activity"
  | "product_trending";

export type Priority = "high" | "medium" | "low";

export interface ActivityEvent {
  id: string;
  type: EventType;
  priority: Priority;
  /** Display title — product name or shop name */
  title: string;
  /** One-line description shown below the title */
  message: string;
  /** Single character for the avatar circle */
  avatarChar: string;
  /** Route to navigate to when toast is clicked */
  href: string;
  productId?: string;
  shopId?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CITIES = [
  "Warsaw", "Kraków", "Gdańsk", "Wrocław", "Poznań",
  "Łódź", "Katowice", "Lublin", "Rzeszów", "Bydgoszcz",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ---------------------------------------------------------------------------
// Event generator
// In production: replace this function with events streamed from your backend
// (WebSocket, SSE, or polling endpoint). The ActivityEvent interface is the
// contract — keep it stable when wiring real data.
// ---------------------------------------------------------------------------

export function generateActivityEvent(
  followedProducts: Product[],
  followedShops: Seller[],
): ActivityEvent | null {
  const hasProducts = followedProducts.length > 0;
  const hasShops = followedShops.length > 0;
  if (!hasProducts && !hasShops) return null;

  // Weighted priority draw: high 40 % | medium 40 % | low 20 %
  const r = Math.random();
  const priority: Priority = r < 0.4 ? "high" : r < 0.8 ? "medium" : "low";

  // ── High priority ─────────────────────────────────────────────────────────
  if (priority === "high" && hasProducts) {
    const product = pick(followedProducts);
    const type = pick<EventType>(["product_purchased", "low_stock", "price_drop"]);

    if (type === "product_purchased") {
      return {
        id: uid(), type, priority: "high",
        title: product.name,
        message: `Just purchased by someone in ${pick(CITIES)}`,
        avatarChar: product.name[0],
        href: `/products/${product.slug}`,
        productId: product.id,
      };
    }
    if (type === "low_stock") {
      const qty = rand(2, 5);
      return {
        id: uid(), type, priority: "high",
        title: product.name,
        message: `Only ${qty} left in stock — act fast`,
        avatarChar: product.name[0],
        href: `/products/${product.slug}`,
        productId: product.id,
      };
    }
    // price_drop
    const pct = pick([10, 15, 20, 25]);
    return {
      id: uid(), type: "price_drop", priority: "high",
      title: product.name,
      message: `Price just dropped ${pct}% — limited time`,
      avatarChar: product.name[0],
      href: `/products/${product.slug}`,
      productId: product.id,
    };
  }

  // ── Medium priority ───────────────────────────────────────────────────────
  if (priority === "medium") {
    // 50/50 between product-in-cart and new-product-in-shop
    if (hasProducts && (!hasShops || Math.random() < 0.5)) {
      const product = pick(followedProducts);
      const count = rand(2, 9);
      return {
        id: uid(), type: "product_added_to_cart", priority: "medium",
        title: product.name,
        message: `${count} people have this in their cart right now`,
        avatarChar: product.name[0],
        href: `/products/${product.slug}`,
        productId: product.id,
      };
    }
    if (hasShops) {
      const shop = pick(followedShops);
      return {
        id: uid(), type: "new_product_in_shop", priority: "medium",
        title: shop.name,
        message: "New items just added to the collection",
        avatarChar: shop.name[0],
        href: `/collections/all?seller=${shop.slug}`,
        shopId: shop.id,
      };
    }
  }

  // ── Low priority ──────────────────────────────────────────────────────────
  if (hasShops && Math.random() < 0.5) {
    const shop = pick(followedShops);
    const count = rand(10, 60);
    return {
      id: uid(), type: "shop_activity", priority: "low",
      title: shop.name,
      message: `${count} people browsing right now`,
      avatarChar: shop.name[0],
      href: `/collections/all?seller=${shop.slug}`,
      shopId: shop.id,
    };
  }
  if (hasProducts) {
    const product = pick(followedProducts);
    const views = rand(20, 130);
    return {
      id: uid(), type: "product_trending", priority: "low",
      title: product.name,
      message: `${views} people viewed this in the last hour`,
      avatarChar: product.name[0],
      href: `/products/${product.slug}`,
      productId: product.id,
    };
  }

  return null;
}
