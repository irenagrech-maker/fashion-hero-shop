"use client";

import { AnnouncementBar } from "./announcement-bar";
import { Header } from "./header";
import { Footer } from "./footer";
import { CartProvider, useCart } from "./cart-provider";
import { QuickViewProvider } from "./quick-view-provider";
import { AuthProvider } from "./auth-provider";
import { SocialProvider, useSocial } from "./social-provider";
import { ActivityProvider } from "./activity-provider";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { openCart, itemCount } = useCart();
  const { likedProductIds } = useSocial();

  return (
    <>
      <AnnouncementBar />
      <Header onCartOpen={openCart} cartCount={itemCount} wishlistCount={likedProductIds.length} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <SocialProvider>
          <ActivityProvider>
            <QuickViewProvider>
              <ShellInner>{children}</ShellInner>
            </QuickViewProvider>
          </ActivityProvider>
        </SocialProvider>
      </CartProvider>
    </AuthProvider>
  );
}
