# Fashion Hero — Developer Context

> Living document. Read this before making any changes.
> Last updated: 7 June 2026.

---

## 1. What Is This Project

Fashion Hero is a **multi-seller fashion marketplace** built as an educational starting point for Wojtek's AI Product Heroes workshops. Students receive a professional-looking e-commerce codebase they can learn from, customise, and extend. It is a faithful visual clone of Allbirds' design language, re-skinned with generic "FashionHero" branding and entirely fictitious product data.

**It is intentionally a frontend-only demo.** There is no real backend, no real authentication, no real payments. All data is hardcoded. Every auth action always succeeds.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 — App Router, React 19, TypeScript strict |
| Styling | Tailwind CSS v4 with `oklch` design tokens |
| Components | shadcn/ui (base-nova style, Radix primitives) |
| Icons | Custom SVG components in `src/components/icons.tsx` |
| Font | Geist via `next/font/google` |
| State | React Context + `localStorage` (no external state library) |
| Deployment | Vercel |

---

## 3. Design Principles

- **No UX changes** — when adding features, slot them in without touching existing layout, spacing, hover states, or interaction patterns. Match existing style exactly.
- **Pixel-perfect Allbirds feel** — warm cream background (`#ece9e2`), charcoal text (`#212121`), uppercase tracking labels, rounded-full buttons.
- **Subtle over aggressive** — every new UI element should feel like it was always there.
- All prices in **PLN (zl)**, copy in **English**.
- **Read this file first** before every task.

### Key colour tokens (from `globals.css`)
```
--color-cream:          #ece9e2
--color-charcoal:       #212121
--color-charcoal-light: #333333
--color-warm-gray:      #6b6b6b
--color-footer-bg:      #212121
```

---

## 4. Project Structure

```
src/
  app/
    page.tsx                    # Home — hero carousel, carousels, promo tiles
    layout.tsx                  # Root layout (Geist font, Shell wrapper)
    about/page.tsx
    collections/[slug]/page.tsx # PLP — filter sidebar, product grid
    products/[slug]/page.tsx    # PDP — image gallery, product info
    wishlist/page.tsx           # "Saved" page — followed shops + liked products
    account/
      page.tsx                  # Dashboard — liked products, orders, preferences
      login/page.tsx
      register/page.tsx
    checkout/page.tsx

  components/
    shell.tsx                   # Provider tree + layout wrapper (see §5)
    header.tsx                  # Sticky nav — logo, mega menu, icon row
    footer.tsx
    announcement-bar.tsx

    # Providers
    auth-provider.tsx           # Mock auth (always succeeds), localStorage
    cart-provider.tsx           # In-memory cart + CartDrawer
    wishlist-provider.tsx       # ⚠ UNUSED — not mounted, superseded by SocialProvider
    social-provider.tsx         # Likes, followed products, followed shops, seen state
    activity-provider.tsx       # Activity toast scheduler
    quick-view-provider.tsx     # Quick-view modal state

    # Header dropdowns
    notifications-dropdown.tsx  # Bell — 2-level: shops → new products (max 5 each)
    followed-shops-dropdown.tsx # Bookmark — dropdown list of followed shops

    # Auth gate
    auth-gate-modal.tsx         # Inline login/register modal (no page navigation)

    # Social action buttons (all auth-gated via AuthGateModal)
    wishlist-button.tsx         # Heart — like/unlike → SocialProvider.likedProductIds
    follow-product-button.tsx   # Bookmark icon — follow/unfollow product
    follow-shop-button.tsx      # Pill button — follow/unfollow shop

    # Activity notifications
    activity-toast.tsx          # Toast UI — priority accent, progress bar, slide-up
    activity-provider.tsx       # Scheduler, hourly cap, demo fallback

    # Product UI
    product-card.tsx
    product-info.tsx
    product-grid.tsx
    quick-view-modal.tsx
    color-swatches.tsx
    size-selector.tsx
    image-gallery.tsx
    related-products.tsx
    recently-viewed.tsx

    # Collection UI
    collection-hero.tsx
    collection-view.tsx
    filter-sidebar.tsx
    filter-bar.tsx

    # Homepage sections
    sections/hero-carousel.tsx
    sections/product-carousel.tsx
    sections/feature-story.tsx
    sections/promo-tiles.tsx
    sections/category-row.tsx
    sections/value-props.tsx

    # Misc
    mega-menu.tsx
    search-modal.tsx
    cart-drawer.tsx
    icons.tsx                   # All SVG icons as React components

  data/
    products.ts                 # ~120+ hardcoded products across 12 sellers
    collections.ts              # Collection metadata
    sellers.ts                  # 12 seller profiles

  lib/
    utils.ts                    # cn() from shadcn
    activity-events.ts          # ActivityEvent types + demo generator

  types/
    index.ts                    # Product, Collection, CartItem, HeroSlide
    seller.ts                   # Seller interface
```

---

## 5. Provider Tree

Order matters — each provider can only consume contexts above it.

```
AuthProvider
  CartProvider
    SocialProvider              ← needs useAuth()
      ActivityProvider          ← needs useSocial() + useAuth()
        QuickViewProvider
          ShellInner            ← reads useCart(), useSocial() for header counts
```

`WishlistProvider` exists in the repo but is **not mounted** — safe to delete.

---

## 6. Data Model

### localStorage keys

| Key | Scope | Provider | Contents |
|---|---|---|---|
| `stepforward_user` | global | AuthProvider | `{ email, firstName, lastName }` |
| `fh_{email}_likes` | per user | SocialProvider | `string[]` — liked product IDs |
| `fh_{email}_followed_products` | per user | SocialProvider | `string[]` — followed product IDs |
| `fh_{email}_followed_shops` | per user | SocialProvider | `string[]` — followed seller IDs |
| `fh_{email}_seen_products` | per user | SocialProvider | `string[]` — seen product IDs (bell read state) |
| `fh_activity_enabled` | global | ActivityProvider | `"true"` \| `"false"` — toast preference |

All per-user keys reset to `[]` on logout / user switch.

### Sellers (12 total)
`s1` UrbanEdge · `s2` Bella Donna · `s3` SportPeak · `s4` Modna Szafa · `s5` Sneaker Lab · `s6` EcoThreads · `s7` Classic Fit · `s8` Marta Handmade · `s9` VintageFind · `s10` DropStyle · `s11` Kasia Creates · `s12` FirstStep

---

## 7. Social Features

### Auth gate
`AuthGateModal` — inline login/register modal with Sign In / Create Account tabs. Accepts `onSuccess` callback so the blocked action fires immediately after login — no page navigation. Used by all three social buttons.

### Like (heart — `WishlistButton`)
- Writes to / reads from `SocialProvider.likedProductIds`
- Auth-gated: unauthenticated click opens `AuthGateModal`
- Placed on: `ProductCard` hover overlay, `ProductInfo` next to title
- Displayed on: `/wishlist` (Liked Products section), `/account` (Liked Products section)
- Header heart icon links to `/wishlist` with liked-count badge

### Follow Product (bookmark icon — `FollowProductButton`)
- Writes to `SocialProvider.followedProductIds`
- Auth-gated
- Placed on: `ProductCard` hover overlay, `ProductInfo` next to title

### Follow Shop (pill — `FollowShopButton`)
- Writes to `SocialProvider.followedShopIds`
- Auth-gated
- Placed on: `ProductCard` below seller name, `ProductInfo` next to seller link, `/wishlist` page in Followed Shops list
- Header bookmark icon opens `FollowedShopsDropdown`

### Header icon row (logged-in only)
| Icon | Component | Action |
|---|---|---|
| Heart | Link → `/wishlist` | Shows liked-count badge |
| Bookmark | `FollowedShopsDropdown` | Dropdown — list of followed shops with links |
| Bell | `NotificationsDropdown` | 2-level panel — shops → unread products |

### `FollowedShopsDropdown`
- Filled bookmark when count > 0, outline when empty
- Lists followed shops with avatar, name, description
- Each row links to `?seller=slug` filtered collection

### `NotificationsDropdown`
- Level 1: list of followed shops, each showing unread count (capped at 5+)
- Level 2: click a shop → shows up to 5 unread products (name + price + link)
- Back chevron returns to Level 1
- "Mark all read" writes all followed-shop product IDs to `seenProductIds`
- Unread = products from followed shop not in `seenProductIds`

### `/wishlist` page (titled "Saved")
Two sections:
1. **Followed Shops** — list with description + unfollow button
2. **Liked Products** — 4-column product grid

### `/account` page additions
- **Liked Products** section — list with name, price, link; "View all" → `/wishlist`
- **Preferences** section — toggle for activity notifications

---

## 8. Activity Notification System

Client-side toast system simulating real-time marketplace activity. Designed as a helpful shopping assistant, not aggressive marketing.

### Files
| File | Role |
|---|---|
| `src/lib/activity-events.ts` | `ActivityEvent` type + `generateActivityEvent()` demo generator |
| `src/components/activity-provider.tsx` | Scheduler, hourly cap, ref-based stale-closure handling |
| `src/components/activity-toast.tsx` | Toast UI — slide-up animation, priority styles, progress bar |

### `ActivityEvent` interface (stable contract for backend swap)
```typescript
interface ActivityEvent {
  id: string;
  type: EventType;          // see table below
  priority: "high" | "medium" | "low";
  title: string;            // product name or shop name
  message: string;          // one-line description
  avatarChar: string;       // single char for avatar circle
  href: string;             // route on click
  productId?: string;
  shopId?: string;
}
```

### Event types and priorities
| Type | Priority | Example message |
|---|---|---|
| `product_purchased` | high | "Just purchased by someone in Warsaw" |
| `low_stock` | high | "Only 3 left in stock — act fast" |
| `price_drop` | high | "Price just dropped 20% — limited time" |
| `product_added_to_cart` | medium | "5 people have this in their cart right now" |
| `new_product_in_shop` | medium | "New items just added to the collection" |
| `shop_activity` | low | "34 people browsing right now" |
| `product_trending` | low | "87 people viewed this in the last hour" |

Priority draw: **high 40% · medium 40% · low 20%**

### Timing
| Setting | Current (demo) | Production target |
|---|---|---|
| First notification | 5–10 s | 30–60 s |
| Between notifications | 30–60 s | 2–4 min |
| Max per hour | 8 | 5–8 |
| Toast visible | 5 s | 4–6 s |

Constants are at the top of `activity-provider.tsx` — easy to change.

### Demo fallback
No followed items → uses first 8 products + first 4 sellers from catalog so the feature is always visible. Real followed data takes priority when present.

### Stale-closure handling
The scheduler uses `useRef` mirrors for all reactive values (`user`, `activityEnabled`, `followedProductIds`, `followedShopIds`) so `setTimeout` callbacks always read current values without re-creating timers.

### Toast UI
- Fixed bottom-right (desktop) / bottom full-width (mobile)
- Slide-up + fade-in entrance, reverse exit (300 ms)
- Left border by priority: `border-l-amber-500` (high) · `border-l-charcoal` (medium) · `border-l-black/20` (low)
- Small priority dot next to title
- CSS `@keyframes shrink` progress bar
- Clickable → navigates to product or shop; X button for manual dismiss

### User preference toggle
`/account` → Preferences section. `localStorage` key `fh_activity_enabled`. Pauses the scheduler immediately (no reload needed).

---

## 9. To-Do / Future Implementation Notes

### Plugging in a real backend

**Auth** — replace `auth-provider.tsx` mock with NextAuth, Supabase Auth, etc. `User` interface is `{ email, firstName, lastName }`.

**Social data** — replace the `save()`/`load()` helpers in `SocialProvider` with API calls. State shape is unchanged.

**Activity events** — replace `generateActivityEvent()` in `activity-events.ts` with a WebSocket/SSE subscription or polling endpoint. `ActivityEvent` interface is the stable contract.

**Notification read state** — `seenProductIds` should move server-side for cross-device persistence.

### Features not yet built
- Dedicated "Followed Products" view (followed ≠ liked; no view exists for followed products)
- Shop profile pages (seller links currently go to `?seller=slug` filtered collection)
- Real-time bell badge update via server push
- Notification history / inbox page
- "Suggested for you" feed based on liked/followed history
- Social icons in mobile menu drawer (currently `hidden sm:flex`)
- Wishlisted items count on mobile header

### Known debt
- `wishlist-provider.tsx` — unused, safe to delete
- `src/hooks/.gitkeep` and `src/types/.gitkeep` — empty placeholders

---

## 10. Commands

```bash
npm run dev     # Dev server → http://localhost:3000
npm run build   # Production build (runs TypeScript check)
npm run lint    # ESLint
```
