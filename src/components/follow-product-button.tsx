"use client";

import { useState } from "react";
import { BookmarkIcon, BookmarkFilledIcon } from "./icons";
import { useSocial } from "./social-provider";
import { useAuth } from "./auth-provider";
import { AuthGateModal } from "./auth-gate-modal";
import { cn } from "@/lib/utils";

interface FollowProductButtonProps {
  productId: string;
  className?: string;
}

export function FollowProductButton({ productId, className }: FollowProductButtonProps) {
  const { user } = useAuth();
  const { toggleFollowProduct, isFollowingProduct } = useSocial();
  const following = isFollowingProduct(productId);
  const [authOpen, setAuthOpen] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setAuthOpen(true); return; }
    toggleFollowProduct(productId);
  }

  return (
    <>
      <button
        onClick={handleClick}
        aria-label={following ? "Unfollow product" : "Follow product"}
        className={cn("transition-opacity hover:opacity-60", className)}
      >
        {following ? (
          <BookmarkFilledIcon className="h-5 w-5 text-charcoal" />
        ) : (
          <BookmarkIcon className="h-5 w-5" />
        )}
      </button>
      <AuthGateModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => toggleFollowProduct(productId)}
        message="Sign in to follow products"
      />
    </>
  );
}
