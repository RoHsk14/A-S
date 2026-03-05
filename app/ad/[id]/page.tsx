import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { AdWithStore } from "@/types/database";
import { ExternalLink, Lock, Store, Target, Globe2, Eye, CircleDollarSign, Download, Box, Sparkles, TrendingUp, Cpu, LayoutTemplate, ArrowLeft } from "lucide-react";
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

async function getStoreActiveAdsCount(pageName: string): Promise<number> {
    const { count } = await supabase
        .from("ads")
        .select("*", { count: 'exact', head: true })
        .eq("page_name", pageName)
        .eq("is_active", true);
    return count || 0;
}



export default async function AdDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const ad = await getAd(params.id);

    if (!ad) {
        notFound();
    }

    const poster = ad.image_url ?? ad.thumbnail_url ?? "";
    const hostname = ad.cta_link ? new URL(ad.cta_link).hostname : null;

    const activeAdsCount = await getStoreActiveAdsCount(ad.page_name || "");

    const daysActive = ad.started_at
        ? Math.floor((new Date().getTime() - new Date(ad.started_at).getTime()) / (1000 * 3600 * 24))
        : 0;

    const formattedStartDate = ad.started_at
        ? new Date(ad.started_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
        : "Inconnu";

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 relative pb-24 lg:pb-8">
            {/* Header Navbar */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center shadow-sm">
                <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-semibold">Retour aux Winners</span>
                </Link>
            </div>

            <div className="max-w-6xl mx-auto w-full px-0 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

                    {/* Colonne Gauche: Full Card (Copied from Modal) */}
                    <div className="lg:col-span-5 h-fit lg:sticky top-24 mb-6 lg:mb-0">
                        <div className="bg-white rounded-none sm:rounded-[24px] shadow-sm border-y sm:border border-slate-200 flex flex-col overflow-hidden">
                            {/* Header: Store Info */}
                            <div className="p-5 pb-0 flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        <span className="text-lg font-bold text-slate-500">{ad.page_name?.[0]?.toUpperCase() || '?'}</span>
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h3 className="font-bold text-slate-900 text-base truncate">{ad.page_name}</h3>
                                        <p className="text-xs text-slate-500 font-medium">{ad.started_at ? new Date(ad.started_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : "Inconnu"}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={ad.cta_link ?? "#"}
                                        target="_blank"
                                        className="p-2 bg-white hover:bg-slate-50 rounded-lg text-slate-500 transition-colors border border-slate-200 shadow-sm"
                                        title="Visiter la boutique"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    {ad.video_url && (
                                        <a
                                            href={ad.video_url}
                                            download
                                            target="_blank"
                                            className="p-2 bg-white hover:bg-slate-50 rounded-lg text-slate-500 transition-colors border border-slate-200 shadow-sm"
                                            title="Télécharger la vidéo"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Ad Copy */}
                            <div className="px-5 mb-5">
                                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                    {ad.ad_copy || "Aucun texte détecté."}
                                </p>
                            </div>

                            {/* Media */}
                            <div className="relative w-full bg-[#09090b] flex items-center justify-center mt-auto">
                                {ad.video_url ? (
                                    <video
                                        src={ad.video_url}
                                        poster={poster}
                                        controls
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="w-full max-h-[700px] object-contain"
                                    />
                                ) : (
                                    <img src={poster} alt="Ad Thumbnail" className="w-full max-h-[700px] object-contain" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Colonne Droite: Détails */}
                    <div className="lg:col-span-7 flex flex-col px-4 sm:px-0 pt-6 lg:pt-0">
                        {/* Actions Principales */}
                        {ad.cta_link && (
                            <div className="mb-6 flex">
                                <a
                                    href={ad.cta_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 min-h-[56px] flex items-center justify-center gap-2.5 bg-orange-600 text-white px-6 rounded-2xl text-sm font-bold hover:bg-orange-700 transition-all active:scale-95 shadow-lg shadow-orange-600/30"
                                >
                                    Analyser la Boutique <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        )}

                        <div className="grid gap-6 mb-12">
                            {/* Ads Details Card */}
                            <div className="bg-white rounded-[20px] sm:rounded-[24px] shadow-sm border border-slate-200 p-4 sm:p-6">
                                <div className="flex items-center justify-center sm:justify-start gap-2 mb-5 sm:mb-6 text-slate-900 font-bold text-lg">
                                    <Globe2 className="w-5 h-5 text-slate-400" />
                                    Ads Details
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                                    <div className="flex flex-col items-center justify-center bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100/50">
                                        <span className="text-4xl font-black text-slate-900 mb-1">{daysActive}</span>
                                        <span className="text-sm font-medium text-slate-500 mb-4">Days running</span>
                                        {ad.is_active ? (
                                            <div className="bg-emerald-100 text-emerald-700 font-bold text-[10px] tracking-widest uppercase px-4 py-1.5 rounded-full flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> STILL ACTIVE
                                            </div>
                                        ) : (
                                            <div className="bg-slate-200 text-slate-600 font-bold text-[10px] tracking-widest uppercase px-4 py-1.5 rounded-full">
                                                INACTIVE
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between py-2 sm:py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                    <Target className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium">Running time</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{formattedStartDate} → Today</span>
                                        </div>

                                        <div className="flex items-center justify-between py-2 sm:py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                    <Eye className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium">Reach</span>
                                            </div>
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between py-2 sm:py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                    <CircleDollarSign className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium">Spend</span>
                                            </div>
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between py-2 sm:py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                    <Globe2 className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium">Countries</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{ad.country || "CD"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Page Details */}
                                <div className="bg-white rounded-[20px] sm:rounded-[24px] shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col justify-center">
                                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-6 text-slate-900 font-bold text-lg">
                                        <Store className="w-4 h-4 text-slate-400" />
                                        Page Details
                                    </div>
                                    <div className="flex flex-col items-center justify-center py-2">
                                        <div className="relative w-32 h-32 rounded-full border-[12px] border-slate-100 flex items-center justify-center">
                                            <div className="bg-white w-full h-full shadow-inner rounded-full absolute z-10 flex flex-col items-center justify-center">
                                                <span className="text-2xl font-black text-slate-900">{activeAdsCount}</span>
                                                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Active Ads</span>
                                            </div>
                                            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                                <circle cx="50%" cy="50%" r="48%" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="100 200" className="z-20 opacity-90" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Shop Details - UNLOCKED */}
                                <div className="bg-white rounded-[20px] sm:rounded-[24px] shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                                        <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-900 font-bold text-lg">
                                            <Store className="w-5 h-5 text-slate-400" />
                                            Shop Details
                                        </div>
                                        <div className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2.5 py-1 rounded-md border border-orange-100">
                                            Unlocked
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="space-y-5 sm:space-y-6 flex flex-col items-center sm:items-start text-center sm:text-left">
                                            <div>
                                                <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1.5 sm:mb-2">MONTHLY VISITS</h4>
                                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                                    <span className="text-2xl font-black text-slate-900">45.2K</span>
                                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                                </div>
                                            </div>

                                            <div className="w-full flex flex-col items-center sm:items-start">
                                                <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">PLATFORM DETAILS</h4>
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-xs">
                                                    Shopify
                                                </div>
                                            </div>

                                            <div className="w-full flex flex-col items-center sm:items-start">
                                                <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">TECH STACK</h4>
                                                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                                                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded-lg border border-indigo-100">
                                                        Klaviyo
                                                    </span>
                                                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg border border-blue-100">
                                                        Meta Pixel
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
