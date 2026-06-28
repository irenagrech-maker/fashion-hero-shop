"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { WishlistButton } from "./wishlist-button";
import { FollowProductButton } from "./follow-product-button";
import { FollowShopButton } from "./follow-shop-button";
import { useQuickView } from "./quick-view-provider";
import { getSellerById } from "@/data/sellers";

interface ProductCardProps {
  product: Product;
  className?: string;
}

/* Each product gets a unique gradient based on its first color hex */
function productGradient(hex: string): string {
  return `radial-gradient(ellipse at 50% 60%, ${hex}33 0%, ${hex}11 40%, #ece9e2 70%)`;
}

function hasRealImage(src: string): boolean {
  return src.startsWith("/images/");
}

export function ProductCard({ product, className }: ProductCardProps) {
  const firstColor = product.colors[0];
  const { openQuickView } = useQuickView();
  const seller = getSellerById(product.sellerId);
  const badgeLabel = product.badge === "new"
    ? "NEW"
    : product.badge === "new-color"
    ? "NEW COLOR"
    : product.badge === "bestseller"
    ? "BESTSELLER"
    : product.badge === "sale"
    ? "SALE"
    : null;

  const imageSrc = firstColor.image;
  const showImage = hasRealImage(imageSrc);

  return (
    <div className={cn("group", className)}>
      <div className="relative">
        <Link href={`/products/${product.slug}`} className="block">
          {/* Image area */}
          <div
            className="relative aspect-square overflow-hidden mb-3"
            style={{ background: productGradient(firstColor.hex) }}
          >
            {badgeLabel && (
              <span className="absolute top-3 left-3 text-[10px] font-medium uppercase tracking-wider bg-white/90 px-2 py-1 z-10">
                {badgeLabel}
              </span>
            )}
            {showImage ? (
              <Image
                src={imageSrc}
                alt={`${product.name} - ${firstColor.name}`}
                width={800}
                height={800}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
              >
                <div className="relative w-3/5 h-2/5">
                  <div
                    className="absolute inset-0 rounded-[50%]"
                    style={{
                      background: `linear-gradient(135deg, ${firstColor.hex}88 0%, ${firstColor.hex}44 100%)`,
                      transform: "rotate(-8deg) scaleX(1.6)",
                    }}
                  />
                  <div
                    className="absolute top-[-20%] left-[10%] w-[50%] h-[70%] rounded-[40%_60%_30%_70%]"
                    style={{
                      background: `linear-gradient(180deg, ${firstColor.hex}66 0%, ${firstColor.hex}33 100%)`,
                      transform: "rotate(-15deg)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Quick View button — desktop only, on hover */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openQuickView(product);
              }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 text-[10px] font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:block hover:bg-white z-10"
            >
              QUICK VIEW
            </button>
          </div>
        </Link>

        {/* Like + Follow buttons — top-right, shows on hover */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:flex hidden flex-col gap-1.5 items-center">
          <WishlistButton productId={product.id} className="bg-white/90 rounded-full p-1.5 hover:bg-white" />
          <FollowProductButton productId={product.id} className="bg-white/90 rounded-full p-1.5 hover:bg-white" />
        </div>
      </div>

      {/* Product info — name/color link to product; seller row is a sibling, not nested */}
      <div>
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-[12px] font-medium uppercase tracking-[0.5px] mb-0.5">
            {product.name}
          </h3>
          <p className="text-[12px] text-warm-gray mb-0.5">{firstColor?.name}</p>
        </Link>
        {seller && (
          <div className="flex items-center justify-between gap-3 mt-1.5 mb-1">
            <Link
              href={`/sellers/${seller.slug}`}
              className="text-[12px] text-charcoal/75 hover:text-charcoal transition-colors truncate"
            >
              {seller.name}
              {seller.rating >= 4.5 && (
                <span className="inline-block ml-1.5 text-[9px] bg-charcoal/10 text-charcoal/70 px-1 py-0.5 rounded uppercase tracking-wide">
                  Pro
                </span>
              )}
            </Link>
            <FollowShopButton
              shopId={seller.id}
              shopName={seller.name}
              className="flex-shrink-0 px-3 py-1 text-[11px]"
            />
          </div>
        )}
      </div>

      {/* Color swatches */}
      <div className="flex gap-1.5 mb-1.5">
        {product.colors.map((color) => (
          <button
            key={color.hex}
            className="w-3 h-3 rounded-full border border-black/10"
            style={{ backgroundColor: color.hex }}
            aria-label={color.name}
          />
        ))}
      </div>

      {/* Price */}
      <div className="flex items-center gap-2">
        <span className="text-[14px] font-medium">{product.price} zl</span>
        {product.originalPrice && (
          <span className="text-xs text-warm-gray line-through">
            {product.originalPrice} zl
          </span>
        )}
      </div>
    </div>
  );
}
