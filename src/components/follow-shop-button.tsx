"use client";

import { useState } from "react";
import { useSocial } from "./social-provider";
import { useAuth } from "./auth-provider";
import { AuthGateModal } from "./auth-gate-modal";
import { cn } from "@/lib/utils";

interface FollowShopButtonProps {
  shopId: string;
  shopName?: string;
  className?: string;
}

export function FollowShopButton({ shopId, shopName, className }: FollowShopButtonProps) {
  const { user } = useAuth();
  const { toggleFollowShop, isFollowingShop } = useSocial();
  const following = isFollowingShop(shopId);
  const [authOpen, setAuthOpen] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setAuthOpen(true); return; }
    toggleFollowShop(shopId);
  }

  return (
    <>
      <button
        onClick={handleClick}
        aria-label={following ? `Unfollow ${shopName ?? "shop"}` : `Follow ${shopName ?? "shop"}`}
        className={cn(
          "text-[10px] font-medium uppercase tracking-[0.6px] border px-2 py-0.5 transition-colors",
          following
            ? "border-charcoal bg-charcoal text-white hover:bg-charcoal/80"
            : "border-black/20 text-warm-gray hover:border-charcoal hover:text-charcoal",
          className
        )}
      >
        {following ? "Following" : "+ Follow"}
      </button>
      <AuthGateModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => toggleFollowShop(shopId)}
        message={`Sign in to follow ${shopName ?? "this shop"}`}
      />
    </>
  );
}
