// ─── Ads table (real schema) ─────────────────────────────────
// page_name is stored directly on the ads row (denormalized)
export interface Ad {
    id: string;
    store_id: string | null;

    // Content
    page_name: string;          // Brand / store display name
    ad_copy: string;
    cta_link: string | null;    // If contains "/products" → Shopify badge

    // Media
    image_url: string | null;       // High-res image
    thumbnail_url: string | null;   // Low-res preview (shown before hover)
    video_url: string | null;       // Video played on hover

    // Metadata
    platform: string | null;        // "facebook" | "instagram" | "tiktok" etc.
    ad_archive_id: string | null;   // Facebook Ad Library ID
    trend_score: number | null;     // Higher = trending harder
    is_active: boolean | null;      // Still running?
    started_at: string | null;      // Date the ad started running (YYYY-MM-DD)
    created_at: string;             // When we scraped it
    country?: string | null;        // Scraped targeting country
}

// ─── Stores table ────────────────────────────────────────────
export interface Store {
    id: string;
    page_name?: string;
    domain?: string;
    favicon_url?: string | null;
    created_at?: string;
}

// ─── Ad joined with optional store data ──────────────────────
// Since page_name is already on Ad, the store join is optional
export interface AdWithStore extends Ad {
    store?: Store | null;
}

// ─── Spy List table ─────────────────────────────────────────
export interface SpyList {
    id: string;
    user_id: string;
    ad_id: string;
    created_at: string;
    ad?: AdWithStore;
}

// ─── User Profiles table ────────────────────────────────────
export interface UserProfile {
    id: string; // matches auth.users.id
    market_preferences: string[]; // JSON array of country codes or names
    created_at: string;
}

// ─── Filter state ────────────────────────────────────────────
export interface FilterState {
    keyword: string;
    lander: "all" | "shopify" | "other";
    age: "all" | "24h" | "7d" | "30d";
    platform: "all" | "facebook" | "instagram" | "tiktok";
    activeOnly: boolean;
    africaFocus: boolean;
}
