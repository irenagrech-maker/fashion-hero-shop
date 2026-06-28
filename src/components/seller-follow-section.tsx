"use client";

import { FollowShopButton } from "./follow-shop-button";
import { useSocial } from "./social-provider";
import type { Seller } from "@/types";

interface Props {
  seller: Seller;
  baseFollowerCount: number;
}

export function SellerFollowSection({ seller, baseFollowerCount }: Props) {
  const { isFollowingShop } = useSocial();
  const isFollowing = isFollowingShop(seller.id);
  const displayCount = baseFollowerCount + (isFollowing ? 1 : 0);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-center">
        <p className="text-[22px] font-light text-charcoal leading-none">{displayCount}</p>
        <p className="text-[11px] uppercase tracking-[0.6px] text-warm-gray mt-0.5">Followers</p>
      </div>
      <FollowShopButton
        shopId={seller.id}
        shopName={seller.name}
        className="px-6 py-2 text-[11px]"
      />
    </div>
  );
}
