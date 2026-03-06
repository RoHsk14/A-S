import { createClient } from "@/lib/supabase/server";
import { Store, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AdWithStore } from "@/types/database";
import { TrackStoreButton } from "@/components/ads/TrackStoreButton";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummyproject.supabase.co";

async function getTopStores() {
    const supabase = await createClient();

    // Fetch all ads that are winners this week
    const { data: winningAds, error } = await supabase
        .from("ads")
        .select("*")
        .eq("is_winner_of_the_week", true)
        .order("winner_week_date", { ascending: false });

    if (error || !winningAds) return [];

    // Group ads by store (page_name)
    const storeMap = new Map<string, {
        pageName: string;
        adCount: number;
        bestAd: AdWithStore;
        domain: string | null;
        platform: string;
    }>();

    for (const ad of winningAds) {
        if (!storeMap.has(ad.page_name)) {
            let domain = null;
            try { if (ad.cta_link) domain = new URL(ad.cta_link).hostname; } catch (e) { }

            storeMap.set(ad.page_name, {
                pageName: ad.page_name,
                adCount: 1,
                bestAd: ad as AdWithStore, // Use the most recent winner ad as the best representative
                domain,
                platform: ad.platform || 'facebook'
            });
        } else {
            const store = storeMap.get(ad.page_name)!;
            store.adCount += 1;
        }
    }

    // Convert map to array and sort by adCount (Top stores with most winning ads first)
    return Array.from(storeMap.values()).sort((a, b) => b.adCount - a.adCount);
}

export default async function TopStoresPage() {
    const topStores = await getTopStores();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 relative pb-24 lg:pb-8">
            <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">

                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-orange-100 rounded-xl">
                        <Store className="w-5 h-5 text-orange-600" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Top Stores</h1>
                </div>
                <p className="text-sm text-slate-500 mb-8 max-w-2xl leading-relaxed">
                    Découvrez les boutiques e-commerce qui performent le mieux cette semaine avec les campagnes publicitaires générant le plus d'engagement.
                </p>

                {topStores.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                        <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">Aucun top store détecté</h3>
                        <p className="text-slate-500">Lancez un nouveau scan pour générer votre sélection hebdomadaire.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {topStores.map((store, index) => {
                            const poster = store.bestAd?.image_url || store.bestAd?.thumbnail_url || "";
                            return (
                                <div key={store.pageName} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative">

                                    {/* Number Rank Badge */}
                                    <div className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black shadow-lg shadow-black/20">
                                        #{index + 1}
                                    </div>

                                    {/* Best Ad Visual acts as cover for Store Details */}
                                    <Link href={`/store/${encodeURIComponent(store.pageName)}`} className="relative aspect-[16/9] bg-slate-900 overflow-hidden block">
                                        {store.bestAd.video_url ? (
                                            <video
                                                src={store.bestAd.video_url}
                                                poster={poster}
                                                muted
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : poster ? (
                                            <img
                                                src={poster}
                                                alt={store.pageName}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Store className="w-12 h-12 text-slate-700 opacity-50" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                                        {/* Overlay Info on Image */}
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                            <div>
                                                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm mb-1 inline-block">
                                                    WINNING SHOP
                                                </span>
                                                <h3 className="text-lg font-bold text-white leading-tight truncate">{store.pageName}</h3>
                                            </div>
                                            <div className="bg-white/20 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/30 text-center">
                                                <div className="text-[10px] text-white/80 font-medium uppercase tracking-wider">Pubs Actives</div>
                                                <div className="text-lg font-black text-white flex items-center gap-1 justify-center">
                                                    {store.adCount} <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Metadata & Actions */}
                                    <div className="p-5 flex flex-col flex-grow bg-white">
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                <span className="text-lg font-bold text-slate-500">{store.pageName[0].toUpperCase()}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-slate-900 truncate flex items-center gap-2">
                                                    {store.domain || "Domaine inconnu"}
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5 select-all">
                                                    {store.platform}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-auto grid grid-cols-2 gap-2">
                                            <TrackStoreButton domain={store.domain} pageName={store.pageName} className="py-2.5 rounded-xl text-xs flex-1 w-full justify-center" />
                                            {store.domain ? (
                                                <a
                                                    href={`https://${store.domain}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
                                                >
                                                    Visiter <ArrowRight className="w-3.5 h-3.5" />
                                                </a>
                                            ) : (
                                                <div className="bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center py-2.5 rounded-xl text-xs font-bold cursor-not-allowed">
                                                    Lien indisponible
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
