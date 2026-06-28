import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getSeller, getAllSellers } from "@/data/sellers";
import { getProductsBySeller } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import { SellerFollowSection } from "@/components/seller-follow-section";
import { StarIcon } from "@/components/icons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSellers().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seller = getSeller(slug);
  if (!seller) return { title: "Seller Not Found" };
  return {
    title: `${seller.name} | FashionHero`,
    description: seller.description,
  };
}

function mockFollowerCount(sellerId: string, joinedYear: number): number {
  const base = sellerId.charCodeAt(1) * 43 + joinedYear;
  return (base % 780) + 45;
}

function StarRating({ rating }: { rating: number }) {
  if (rating === 0) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          filled={i < full || (i === full && half)}
          className="h-3.5 w-3.5 text-charcoal"
        />
      ))}
      <span className="text-[12px] text-warm-gray ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default async function SellerPage({ params }: PageProps) {
  const { slug } = await params;
  const seller = getSeller(slug);
  if (!seller) notFound();

  const sellerProducts = getProductsBySeller(slug);
  const followerCount = mockFollowerCount(seller.id, seller.joinedYear);

  return (
    <div className="min-h-screen">
      {/* Hero band */}
      <div className="bg-cream-light border-b border-black/8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 lg:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[11px] text-warm-gray mb-8">
            <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
            <span>/</span>
            <span className="text-charcoal uppercase tracking-[0.5px]">Sellers</span>
            <span>/</span>
            <span className="text-charcoal uppercase tracking-[0.5px]">{seller.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-light text-white select-none">
                {seller.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-light text-charcoal">
                  {seller.name}
                </h1>
                {seller.rating >= 4.5 && (
                  <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.8px] bg-charcoal text-white px-2 py-0.5">
                    Pro Seller
                  </span>
                )}
              </div>

              <p className="text-[13px] text-warm-gray mb-3 max-w-xl">
                {seller.description}
              </p>

              {seller.rating > 0 && <StarRating rating={seller.rating} />}
            </div>

            {/* Follow — client island, owns the live follower count */}
            <div className="flex-shrink-0">
              <SellerFollowSection seller={seller} baseFollowerCount={followerCount} />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-black/8">
            <div className="text-center">
              <p className="text-[22px] font-light text-charcoal">{sellerProducts.length}</p>
              <p className="text-[11px] uppercase tracking-[0.6px] text-warm-gray mt-0.5">Products</p>
            </div>
            <div className="w-px bg-black/10 self-stretch hidden sm:block" />
            <div className="text-center">
              <p className="text-[22px] font-light text-charcoal">{seller.joinedYear}</p>
              <p className="text-[11px] uppercase tracking-[0.6px] text-warm-gray mt-0.5">Joined</p>
            </div>
            {seller.rating > 0 && (
              <>
                <div className="w-px bg-black/10 self-stretch hidden sm:block" />
                <div className="text-center">
                  <p className="text-[22px] font-light text-charcoal">{seller.rating.toFixed(1)}</p>
                  <p className="text-[11px] uppercase tracking-[0.6px] text-warm-gray mt-0.5">Rating</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal mb-6 pb-3 border-b border-black/10">
          All Products ({sellerProducts.length})
        </h2>

        {sellerProducts.length === 0 ? (
          <p className="text-sm text-warm-gray py-10">No products listed yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {sellerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
