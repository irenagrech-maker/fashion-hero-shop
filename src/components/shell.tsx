"use client";

import { AnnouncementBar } from "./announcement-bar";
import { Header } from "./header";
import { Footer } from "./footer";
import { CartProvider, useCart } from "./cart-provider";
import { CartDrawer } from "./cart-drawer";
import { QuickViewProvider } from "./quick-view-provider";
import { AuthProvider, useAuth } from "./auth-provider";
import { SocialProvider, useSocial } from "./social-provider";
import { ActivityProvider } from "./activity-provider";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { openCart, closeCart, itemCount, items, isOpen, removeItem, updateQuantity } = useCart();
  const { likedProductIds, followedShopIds, notificationsByShop } = useSocial();
  const { user } = useAuth();

  return (
    <>
      <AnnouncementBar />
      <Header onCartOpen={openCart} cartCount={itemCount} wishlistCount={likedProductIds.length} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer
        isOpen={isOpen}
        onClose={closeCart}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        isLoggedIn={!!user}
        followedShopIds={followedShopIds}
        notificationsByShop={notificationsByShop}
      />
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
