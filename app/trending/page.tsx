import { MOCK_ADS } from "@/lib/mock-data";
import { ExternalLink, TrendingUp } from "lucide-react";
import Image from "next/image";

interface StoreStats {
    domain: string;
    favicon_url: string | null;
    platform: string;
    adCount: number;
    latestAd: string;
}

async function getTrendingStores(): Promise<StoreStats[]> {
    const SUPABASE_URL = "https://xgxwasirqsetnnjstims.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneHdhc2lycXNldG5uanN0aW1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgwNzUyOCwiZXhwIjoyMDg3MzgzNTI4fQ.9xT1K765h6X8saoXDN7pWdoEkuKt--HfRlgm5Fnnlcg";

    // Fetch all ads to group them locally (PostgREST grouping is complex without a view)
    // We fetch a larger limit to get a good sampling of active ads
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/ads?select=page_name,cta_link,is_active,created_at&is_active=eq.true&limit=500`,
        {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
            },
            cache: "no-store",
        }
    );

    if (!res.ok) {
        console.error("Supabase REST error:", res.status, await res.text());
        return [];
    }

    const ads = await res.json();
    const storeMap = new Map<string, StoreStats>();

    for (const ad of ads) {
        if (!ad.page_name) continue;
        const existing = storeMap.get(ad.page_name);

        let isShopify = false;
        if (ad.cta_link && (ad.cta_link.includes("shopify") || ad.cta_link.includes("youcan") || ad.cta_link.includes("products/"))) {
            isShopify = true;
        }

        if (existing) {
            existing.adCount++;
            if (new Date(ad.created_at) > new Date(existing.latestAd)) {
                existing.latestAd = ad.created_at;
            }
            if (isShopify) existing.platform = "Shopify"; // Override if any link is Shopify
        } else {
            storeMap.set(ad.page_name, {
                domain: ad.page_name,
                favicon_url: null, // Hard to extract favicon automatically without a scraper
                platform: isShopify ? "Shopify" : "Inconnu",
                adCount: 1,
                latestAd: ad.created_at,
            });
        }
    }

    return Array.from(storeMap.values()).sort((a, b) => b.adCount - a.adCount).slice(0, 20); // Top 20
}

export default async function TrendingPage() {
    const stores = await getTrendingStores();

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🔥</span>
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">Trending</h1>
            </div>
            <p className="text-sm text-text-muted ml-9 mb-6">
                Boutiques qui scalent agressivement en ce moment
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map((store, index) => (
                    <div
                        key={store.domain}
                        className="group bg-white rounded-2xl p-4 border border-slate-200 hover:border-orange-burnt/20 hover:shadow-card-hover transition-all duration-300"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            {/* Rank */}
                            <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${index === 0
                                    ? "bg-amber-100 text-amber-600 border border-amber-200"
                                    : index === 1
                                        ? "bg-slate-200 text-slate-600 border border-slate-300"
                                        : index === 2
                                            ? "bg-orange-100 text-orange-600 border border-orange-200"
                                            : "bg-slate-100 text-slate-500 border border-slate-200"
                                    }`}
                            >
                                #{index + 1}
                            </div>

                            {/* Favicon */}
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                                {store.favicon_url ? (
                                    <Image
                                        src={store.favicon_url}
                                        alt={store.domain}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-text-muted text-xs font-bold">
                                        {store.domain[0].toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-text-primary truncate">
                                    {store.domain}
                                </p>
                                <p className="text-[10px] text-text-muted">{store.platform}</p>
                            </div>

                            <a
                                href={`https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(store.domain)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-text-muted hover:text-orange-burnt hover:border-orange-burnt/30 transition-all"
                                title="Voir sur Ad Library"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                            <div className="flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-orange-burnt" />
                                <span className="text-xs font-bold text-orange-burnt">{store.adCount}</span>
                                <span className="text-xs text-text-muted">pub{store.adCount > 1 ? "s" : ""} active{store.adCount > 1 ? "s" : ""}</span>
                            </div>

                            {store.platform === "Shopify" && (
                                <span className="ml-auto text-[9px] font-bold bg-green-500/15 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                    Shopify
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
