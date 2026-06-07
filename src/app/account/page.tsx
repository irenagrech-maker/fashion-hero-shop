"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useSocial } from "@/components/social-provider";
import { useActivity } from "@/components/activity-provider";
import { products } from "@/data/products";

const mockOrders = [
  { id: "SF-10042", date: "March 15, 2026", status: "Delivered", total: 592 },
  { id: "SF-10038", date: "February 22, 2026", status: "Delivered", total: 940 },
  { id: "SF-10031", date: "January 8, 2026", status: "Delivered", total: 480 },
];

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { likedProductIds } = useSocial();
  const { activityEnabled, setActivityEnabled } = useActivity();
  const router = useRouter();

  const likedProducts = products.filter((p) => likedProductIds.includes(p.id));

  useEffect(() => {
    if (!user) {
      router.push("/account/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      {/* Breadcrumb */}
      <nav className="text-[11px] text-warm-gray mb-8 tracking-wide">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-charcoal">Account</span>
      </nav>

      <h1 className="text-2xl font-light text-charcoal mb-2">
        Hello, {user.firstName}
      </h1>
      <p className="text-[13px] text-warm-gray mb-10">
        Welcome back to your FashionHero account.
      </p>

      {/* Liked Products */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/10">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal">
            Liked Products
          </h2>
          {likedProducts.length > 0 && (
            <Link href="/wishlist" className="text-[11px] text-warm-gray underline hover:text-charcoal transition-colors">
              View all
            </Link>
          )}
        </div>
        {likedProducts.length === 0 ? (
          <p className="text-[13px] text-warm-gray">No liked products yet.</p>
        ) : (
          <div className="space-y-3">
            {likedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="flex items-center justify-between py-3 border-b border-black/5 hover:opacity-70 transition-opacity"
              >
                <p className="text-[13px] font-medium text-charcoal">{product.name}</p>
                <p className="text-[13px] text-charcoal">{product.price} zl</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Order History */}
      <section className="mb-10">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal mb-4 pb-2 border-b border-black/10">
          Order History
        </h2>
        <div className="space-y-3">
          {mockOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between py-3 border-b border-black/5">
              <div>
                <p className="text-[13px] font-medium text-charcoal">{order.id}</p>
                <p className="text-[12px] text-warm-gray">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-medium text-charcoal">{order.total.toFixed(0)} zl</p>
                <p className="text-[11px] text-green-700 font-medium">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Account Details */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/10">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal">
            Account Details
          </h2>
          <button className="text-[11px] text-warm-gray underline hover:text-charcoal transition-colors">
            Edit
          </button>
        </div>
        <div className="space-y-1.5 text-[13px] text-charcoal/80">
          <p>{user.firstName} {user.lastName}</p>
          <p>{user.email}</p>
        </div>
      </section>

      {/* Saved Addresses */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/10">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal">
            Saved Addresses
          </h2>
          <button className="text-[11px] text-warm-gray underline hover:text-charcoal transition-colors">
            Add Address
          </button>
        </div>
        <div className="text-[13px] text-charcoal/80 space-y-0.5">
          <p className="font-medium text-charcoal">{user.firstName} {user.lastName}</p>
          <p>123 Sustainable Ave</p>
          <p>San Francisco, CA 94110</p>
          <p>United States</p>
        </div>
      </section>

      {/* Preferences */}
      <section className="mb-10">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal mb-4 pb-2 border-b border-black/10">
          Preferences
        </h2>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-[13px] text-charcoal">Activity notifications</p>
            <p className="text-[11px] text-warm-gray mt-0.5">
              Subtle alerts about products and shops you follow
            </p>
          </div>
          <button
            onClick={() => setActivityEnabled(!activityEnabled)}
            aria-label={activityEnabled ? "Disable activity notifications" : "Enable activity notifications"}
            className={[
              "relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0",
              activityEnabled ? "bg-charcoal" : "bg-black/20",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
                activityEnabled ? "translate-x-5" : "translate-x-0.5",
              ].join(" ")}
            />
          </button>
        </div>
      </section>

      <button
        onClick={() => {
          logout();
          router.push("/");
        }}
        className="btn-cta-outline text-[12px] w-full"
      >
        SIGN OUT
      </button>
    </div>
  );
}
