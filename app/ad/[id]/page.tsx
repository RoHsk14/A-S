import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { AdWithStore } from "@/types/database";
import { ExternalLink, Play, Download, ArrowLeft, Store } from "lucide-react";
import Link from "next/link";
import { AdCard } from "@/components/ads/AdCard";
import { SpyListGrid } from "@/components/ads/SpyListGrid";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummyproject.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function getAd(id: string): Promise<AdWithStore | null> {
    const { data } = await supabase.from("ads").select("*").eq("id", id).single();
    return data as AdWithStore | null;
}

async function getSimilarAds(platform: string | null, currentId: string): Promise<AdWithStore[]> {
    // For MVP, just fetch latest 4 active ads to act as 'similar stores'
    const { data } = await supabase
        .from("ads")
        .select("*")
        .eq("is_active", true)
        .neq("id", currentId)
        .limit(4);
    return (data || []) as AdWithStore[];
}

export default async function AdDetailPage({ params }: { params: { id: string } }) {
    const ad = await getAd(params.id);

    if (!ad) {
        notFound();
    }

    const similarAds = await getSimilarAds(ad.platform, ad.id);
    const poster = ad.image_url ?? ad.thumbnail_url ?? "";
    const hostname = ad.cta_link ? new URL(ad.cta_link).hostname : null;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 relative pb-24 lg:pb-8">
            {/* Header Navbar */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center shadow-sm">
                <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-semibold">Retour aux Winners</span>
                </Link>
            </div>

            <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

                    {/* Colonne Gauche: Vidéo */}
                    <div className="lg:col-span-5 h-fit sticky top-24">
                        <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-[9/16] relative shadow-2xl border border-slate-200">
                            {ad.video_url ? (
                                <video
                                    src={ad.video_url}
                                    poster={poster}
                                    controls
                                    autoPlay
                                    loop
                                    playsInline
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <img src={poster} alt="Ad Thumbnail" className="w-full h-full object-cover" />
                            )}
                        </div>
                    </div>

                    {/* Colonne Droite: Détails */}
                    <div className="lg:col-span-7 flex flex-col pt-2 lg:pt-8">
                        {/* Header Infos */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                                <span className="text-2xl font-bold text-slate-500">{ad.page_name?.[0]?.toUpperCase() || '?'}</span>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{ad.page_name}</h1>
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider flex items-center gap-1.5 mt-1">
                                    <Store className="w-4 h-4" /> Shopify Store
                                </p>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {ad.is_active && (
                                <span className="bg-green-500/15 text-green-600 text-xs font-bold px-3 py-1.5 rounded-full border border-green-500/20">
                                    🟢 Active Now
                                </span>
                            )}
                            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full">
                                {ad.platform || "Facebook/Instagram"}
                            </span>
                        </div>

                        {/* Actions Principales */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-10">
                            {ad.cta_link && (
                                <a
                                    href={ad.cta_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 min-h-[56px] flex items-center justify-center gap-2.5 bg-orange-600 text-white px-6 rounded-2xl text-sm font-bold hover:bg-orange-700 transition-all active:scale-95 shadow-lg shadow-orange-600/30"
                                >
                                    Analyser la Boutique <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                            {ad.video_url && (
                                <a
                                    href={ad.video_url}
                                    download={`ad_video_${ad.id}.mp4`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 min-h-[56px] flex items-center justify-center gap-2.5 bg-white text-slate-700 border-2 border-slate-200 px-6 rounded-2xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
                                >
                                    Télécharger Vidéo <Download className="w-4 h-4" />
                                </a>
                            )}
                        </div>

                        {/* Ad Copy */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-12">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Ad Copy Full Text</h3>
                            <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap font-medium">
                                {ad.ad_copy || "Aucun texte détecté."}
                            </p>
                        </div>

                        {/* Stores Similaires MVP */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-xl">🔥</span>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Stores similaires</h2>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
                                {/* Since we need favorites context here, we can pass initial data to a client wrapper or render lightweight cards */}
                                {similarAds.map(similar => (
                                    <Link key={similar.id} href={`/ad/${similar.id}`} className="group relative rounded-2xl overflow-hidden border border-slate-200 aspect-[9/16] bg-slate-900 block">
                                        {similar.video_url ? (
                                            <video src={similar.video_url} poster={similar.image_url ?? similar.thumbnail_url ?? ""} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted loop playsInline onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                                        ) : (
                                            <img src={similar.image_url ?? similar.thumbnail_url ?? ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                            <p className="text-white font-bold text-sm truncate">{similar.page_name}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
