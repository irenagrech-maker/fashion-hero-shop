"use client";

import Link from "next/link";
import { useSocial } from "@/components/social-provider";
import { FollowShopButton } from "@/components/follow-shop-button";
import { ProductCard } from "@/components/product-card";
import { products } from "@/data/products";
import { getAllSellers } from "@/data/sellers";

export default function WishlistPage() {
  const { likedProductIds, followedShopIds } = useSocial();

  const likedProducts = products.filter((p) => likedProductIds.includes(p.id));
  const followedShops = getAllSellers().filter((s) => followedShopIds.includes(s.id));

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] text-warm-gray mb-6">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="uppercase tracking-[0.5px] text-charcoal">Saved</span>
      </div>

      <h1 className="text-3xl font-light text-charcoal mb-10">Saved</h1>

      {/* Followed Shops */}
      <section className="mb-12">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal mb-4 pb-2 border-b border-black/10">
          Followed Shops ({followedShops.length})
        </h2>
        {followedShops.length === 0 ? (
          <p className="text-sm text-warm-gray">
            Follow shops to see them here.
          </p>
        ) : (
          <div className="space-y-3">
            {followedShops.map((seller) => (
              <div key={seller.id} className="flex items-center justify-between py-3 border-b border-black/5">
                <div>
                  <Link
                    href={`/sellers/${seller.slug}`}
                    className="text-[13px] font-medium text-charcoal hover:opacity-60 transition-opacity"
                  >
                    {seller.name}
                  </Link>
                  <p className="text-[11px] text-warm-gray mt-0.5">{seller.description}</p>
                </div>
                <FollowShopButton shopId={seller.id} shopName={seller.name} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Liked Products */}
      <section>
        <h2 className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal mb-4 pb-2 border-b border-black/10">
          Liked Products ({likedProducts.length})
        </h2>
        {likedProducts.length === 0 ? (
          <div className="py-10">
            <p className="text-sm text-warm-gray mb-6">
              Tap the heart icon on any product to save it here.
            </p>
            <div className="flex gap-4">
              <Link href="/collections/mens" className="btn-cta">
                SHOP MEN
              </Link>
              <Link href="/collections/womens" className="btn-cta-outline">
                SHOP WOMEN
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {likedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
