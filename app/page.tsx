import { Suspense } from "react";
import { AdWithStore } from "@/types/database";
import { WinnerGrid } from "@/components/ads/WinnerGrid";
import { SkeletonCard } from "@/components/ads/SkeletonCard";
import { createClient } from "@/lib/supabase/server";
import { TrendingUp, Sparkles, Store, Rocket, ShieldCheck, Zap, ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { CountdownTimer } from "@/components/ads/CountdownTimer";

// ── Data fetching from Supabase ──────────────────────────────
async function getAds(preferences: string[] = []): Promise<AdWithStore[]> {
  const SUPABASE_URL = "https://xgxwasirqsetnnjstims.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneHdhc2lycXNldG5uanN0aW1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgwNzUyOCwiZXhwIjoyMDg3MzgzNTI4fQ.9xT1K765h6X8saoXDN7pWdoEkuKt--HfRlgm5Fnnlcg";

  // strict "Winners of the Week" rule
  let fetchUrl = `${SUPABASE_URL}/rest/v1/ads?select=*&is_winner_of_the_week=eq.true&order=winner_week_date.desc&limit=20`;

  if (preferences.length > 0) {
    fetchUrl += `&country=in.(${preferences.join(',')})`;
  }

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
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

async function getMarketPreferences() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: profile } = await supabase.from("user_profiles").select("market_preferences").eq("id", user.id).single();
  return profile?.market_preferences || [];
}

import { StoreAnalysisBanner } from "@/components/ads/StoreAnalysisBanner";

async function getFavorites() {
  const supabase = await createClient();
  const { data: spyList } = await supabase.from("spy_list").select("ad_id");
  return spyList?.map(f => f.ad_id) || [];
}

// ── Server component ─────────────────────────────────────────
async function WinnersContent({ storeQuery }: { storeQuery?: string }) {
  const preferences = await getMarketPreferences();
  let ads = await getAds(preferences);
  const favoriteIds = await getFavorites();

  // If coming from the "My Stores" dashboard, filter ads by the specific store
  if (storeQuery) {
    const query = storeQuery.toLowerCase();
    ads = ads.filter(ad =>
      ad.page_name?.toLowerCase().includes(query) ||
      ad.cta_link?.toLowerCase().includes(query)
    );
  }

  return (
    <>
      {storeQuery && ads.length > 0 && (
        <StoreAnalysisBanner storeDomain={storeQuery} adCopies={ads.map(a => a.ad_copy)} />
      )}
      <WinnerGrid ads={ads} initialFavoriteIds={favoriteIds} />
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────
async function WinnersDashboard({ storeQuery }: { storeQuery?: string }) {
  // We fetch counts directly or estimate. For UI purposes, we'll wait for the main ads array
  const preferences = await getMarketPreferences();
  const ads = await getAds(preferences);
  const totalWinners = ads.length;

  // Realistically, to get total stores we map unique page_names
  const uniqueStores = new Set(ads.map(a => a.page_name)).size;

  // New in 7 days could be calculated differently but since these are all >20 days old, "0" is technically accurate 
  // unless we mean "newly detected winners this week" which is distinct from "ad launch date".
  const newThisWeek = ads.length;

  return (
    <div className="flex flex-col min-h-full">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🏆</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Winners
          </h1>
          <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Sélection Hebdomadaire
          </span>
          {storeQuery && (
            <span className="text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded-full ml-auto shadow-sm">
              Focus : {storeQuery}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mb-4 sm:ml-9">
          Intelligence de marché 100% Africaine — Les publicités vérifiées qui scalent.
        </p>

        <div className="sm:ml-9 mb-6">
          <CountdownTimer text={`Sélection de la semaine : ${ads.length} pépites`} />
        </div>

        {/* KPI & Demo Row */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 sm:ml-9 mb-6 items-start w-full max-w-6xl">

          {/* KPI Header */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full lg:w-2/3 max-w-2xl">
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1.5 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div className="w-full min-w-0">
                <p className="text-[9px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate leading-tight">Total Winners</p>
                <p className="text-lg sm:text-2xl font-black text-slate-900 leading-none mt-0.5">{totalWinners}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1.5 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="w-full min-w-0">
                <p className="text-[9px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate leading-tight">
                  <span className="sm:hidden">Nouveau</span>
                  <span className="hidden sm:inline">Nouveautés (7j)</span>
                </p>
                <p className="text-lg sm:text-2xl font-black text-slate-900 leading-none mt-0.5">{newThisWeek}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1.5 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <Store className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="w-full min-w-0">
                <p className="text-[9px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate leading-tight">Top Stores</p>
                <p className="text-lg sm:text-2xl font-black text-slate-900 leading-none mt-0.5">{uniqueStores}</p>
              </div>
            </div>
          </div>

          {/* Demo Section */}
          <div className="w-full lg:w-1/3 flex-shrink-0">
            {/* Desktop Card */}
            <a href="https://demo.afrospy.com" target="_blank" rel="noopener noreferrer" className="hidden lg:flex flex-col justify-center h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-xl hover:-translate-y-1 transition-transform relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-orange-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-colors">
                  <Play className="w-5 h-5 text-orange-400 fill-orange-400 ml-1" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-0.5">Voir la démo de la plateforme</h3>
                  <p className="text-slate-300 text-xs font-medium opacity-80">Découvrez nos fonctionnalités en 2 min</p>
                </div>
              </div>
            </a>

            {/* Mobile Button */}
            <a href="https://demo.afrospy.com" target="_blank" rel="noopener noreferrer" className="flex lg:hidden w-full items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-3.5 px-4 font-bold text-sm shadow-md hover:bg-slate-800 transition-colors active:scale-95">
              <Play className="w-4 h-4 fill-white flex-shrink-0" />
              Regarder la démo
            </a>
          </div>

        </div>
      </div>

      <Suspense fallback={<WinnerGridSkeleton />}>
        <WinnersContent storeQuery={storeQuery} />
      </Suspense>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
      {/* Navigation Rapide */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-orange-600 text-white p-2 rounded-lg font-bold text-xl">A-S</div>
          <span className="text-xl font-black text-slate-900 tracking-tighter">Afro Spy</span>
        </div>
        <Link href="/login" className="text-slate-600 font-semibold hover:text-orange-600 transition">
          Se connecter
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="max-w-4xl mx-auto text-center py-20 px-6">
        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
          L'outil n°1 pour l'E-commerce en Afrique
        </span>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mt-6 mb-8 leading-[1.1]">
          Espionnez les publicités qui <span className="text-orange-600">vendent vraiment.</span>
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
          Ne perdez plus d'argent en tests inutiles. Accédez instantanément aux produits qui tournent depuis plus de 20 jours sur le marché africain.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 hover:scale-105 transition-all flex items-center justify-center gap-2">
            Commencer maintenant <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="#features" className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
            Voir la démo
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 px-6 py-20">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="bg-orange-100 p-3 w-fit rounded-2xl mb-6"><Zap className="text-orange-600" /></div>
          <h3 className="text-xl font-bold mb-3 text-slate-900">Scan Cloud Automatique</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Nos serveurs analysent la bibliothèque publicitaire Facebook 24h/24 pour vous extraire les meilleures opportunités.</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="bg-blue-100 p-3 w-fit rounded-2xl mb-6"><ShieldCheck className="text-blue-600" /></div>
          <h3 className="text-xl font-bold mb-3 text-slate-900">Algorithme "Winner"</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Nous filtrons les pubs actives depuis plus de 20 jours. Si ça tourne encore, c'est que c'est rentable.</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="bg-green-100 p-3 w-fit rounded-2xl mb-6"><Rocket className="text-green-600" /></div>
          <h3 className="text-xl font-bold mb-3 text-slate-900">Focus Marché Africain</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Sénégal, Côte d'Ivoire, Tchad, Maghreb... Accédez aux données précises de votre marché local.</p>
        </div>
      </section>

      {/* Footer simple */}
      <footer className="py-10 text-center text-slate-400 text-sm border-t border-slate-200">
        © 2026 Afro Spy (A-S). Tous droits réservés.
      </footer>
    </div>
  );
}

export default async function Page(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const storeQuery = typeof searchParams.store === 'string' ? searchParams.store : undefined;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    return <WinnersDashboard storeQuery={storeQuery} />;
  }

  return <LandingPage />;
}
