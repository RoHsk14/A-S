import { Suspense } from "react";
import { AdWithStore } from "@/types/database";
import { WinnerGrid } from "@/components/ads/WinnerGrid";
import { SkeletonCard } from "@/components/ads/SkeletonCard";
import { createClient } from "@/lib/supabase/server";
import { TrendingUp, Sparkles, Store } from "lucide-react";

// ── Data fetching from Supabase ──────────────────────────────
async function getAds(): Promise<AdWithStore[]> {
  const SUPABASE_URL = "https://xgxwasirqsetnnjstims.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneHdhc2lycXNldG5uanN0aW1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgwNzUyOCwiZXhwIjoyMDg3MzgzNTI4fQ.9xT1K765h6X8saoXDN7pWdoEkuKt--HfRlgm5Fnnlcg";

  // Calculate threshold date: 20 days ago
  const date20DaysAgo = new Date();
  date20DaysAgo.setDate(date20DaysAgo.getDate() - 20);
  const dateStr = date20DaysAgo.toISOString().split('T')[0];

  // African countries are natively enforced by Scraper rules so `started_at` and `cta_link` are enough
  const orFilter = `cta_link.ilike.*shopify*,cta_link.ilike.*youcan*`;

  // Fetch only active, ecommerce, >20days old
  // Note: Removed &limit=100 to fetch all active winners as requested
  const fetchUrl = `${SUPABASE_URL}/rest/v1/ads?select=*&is_active=eq.true&started_at=lte.${dateStr}&or=(${orFilter})&order=started_at.desc`;

  const res = await fetch(fetchUrl, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Supabase REST error:", res.status, await res.text());
    return [];
  }

  const data = await res.json();
  return (data ?? []) as AdWithStore[];
}

// ── Skeleton fallback ────────────────────────────────────────
function WinnerGridSkeleton() {
  return (
    <div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

// ── Server component ─────────────────────────────────────────
async function WinnersContent() {
  const ads = await getAds();

  const supabase = await createClient();
  const { data: favorites } = await supabase.from("favorites").select("ad_id");
  const favoriteIds = favorites?.map(f => f.ad_id) || [];

  return <WinnerGrid ads={ads} initialFavoriteIds={favoriteIds} />;
}

// ── Page ─────────────────────────────────────────────────────
export default async function WinnersPage() {
  // We fetch counts directly or estimate. For UI purposes, we'll wait for the main ads array
  const ads = await getAds();
  const totalWinners = ads.length;

  // Realistically, to get total stores we map unique page_names
  const uniqueStores = new Set(ads.map(a => a.page_name)).size;

  // New in 7 days could be calculated differently but since these are all >20 days old, "0" is technically accurate 
  // unless we mean "newly detected winners this week" which is distinct from "ad launch date".
  const newThisWeek = 0;

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="px-6 pt-6 pb-6 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🏆</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Winners
          </h1>
          <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Live Database
          </span>
        </div>
        <p className="text-sm text-slate-500 ml-9 mb-6">
          Intelligence de marché 100% Africaine — Les publicités vérifiées qui scalent.
        </p>

        {/* KPI Header */}
        <div className="grid grid-cols-3 gap-4 ml-9 items-start max-w-2xl">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Winners</p>
              <p className="text-2xl font-black text-slate-900">{totalWinners}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Nouveautés (7j)</p>
              <p className="text-2xl font-black text-slate-900">{newThisWeek}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <Store className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Top Stores</p>
              <p className="text-2xl font-black text-slate-900">{uniqueStores}</p>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={<WinnerGridSkeleton />}>
        <WinnersContent />
      </Suspense>
    </div>
  );
}
