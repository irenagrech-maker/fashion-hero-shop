"use client";

import { useState } from "react";
import { HeartIcon, HeartFilledIcon } from "./icons";
import { useSocial } from "./social-provider";
import { useAuth } from "./auth-provider";
import { AuthGateModal } from "./auth-gate-modal";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const { user } = useAuth();
  const { toggleLike, isLiked } = useSocial();
  const wishlisted = isLiked(productId);
  const [animating, setAnimating] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setAnimating(true);
    toggleLike(productId);
    setTimeout(() => setAnimating(false), 300);
  }

  function handleAuthSuccess() {
    setAnimating(true);
    toggleLike(productId);
    setTimeout(() => setAnimating(false), 300);
  }

  return (
    <>
      <button
        onClick={handleClick}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          "transition-transform duration-200 ease-out",
          animating && "scale-125",
          className
        )}
      >
        {wishlisted ? (
          <HeartFilledIcon className="h-5 w-5 text-red-500" />
        ) : (
          <HeartIcon className="h-5 w-5" />
        )}
      </button>
      <AuthGateModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        message="Sign in to like products"
      />
    </>
  );
}
