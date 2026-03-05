import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AdWithStore } from "@/types/database";
import { ExternalLink, Lock, Store, Globe2, Eye, CircleDollarSign, Download, Box, Sparkles, TrendingUp, Cpu, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { TrackStoreButton } from "@/components/ads/TrackStoreButton";

async function getAd(id: string): Promise<AdWithStore | null> {
    const supabase = await createClient();
    const { data } = await supabase.from("ads").select("*").eq("id", id).single();
    return data as AdWithStore | null;
}

async function getStoreActiveAdsCount(pageName: string): Promise<number> {
    const supabase = await createClient();
    const { count } = await supabase
        .from("ads")
        .select("*", { count: 'exact', head: true })
        .eq("page_name", pageName)
        .eq("is_active", true);
    return count || 0;
}

export default async function AdModalPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const ad = await getAd(params.id);
    if (!ad) notFound();

    const activeAdsCount = await getStoreActiveAdsCount(ad.page_name || "");

    const poster = ad.image_url ?? ad.thumbnail_url ?? "";
    const hostname = ad.cta_link ? new URL(ad.cta_link).hostname : null;

    const daysActive = ad.started_at
        ? Math.floor((new Date().getTime() - new Date(ad.started_at).getTime()) / (1000 * 3600 * 24))
        : 0;

    const formattedStartDate = ad.started_at
        ? new Date(ad.started_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
        : "Inconnu";

    return (
        <Modal>
            <div className="flex flex-col lg:flex-row w-full h-full bg-slate-50">
                {/* LEFT PANE: AD MEDIA & COPY */}
                <div className="w-full lg:w-[45%] bg-slate-100 p-0 sm:p-8 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200">
                    <div className="bg-white rounded-none sm:rounded-[24px] shadow-sm border-y sm:border border-slate-200 flex flex-col overflow-hidden">
                        {/* Header: Store Info */}
                        <div className="p-5 pb-0 flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    <span className="text-lg font-bold text-slate-500">{ad.page_name?.[0]?.toUpperCase() || '?'}</span>
                                </div>
                                <div className="flex-1 min-w-0 pr-4">
                                    <h3 className="font-bold text-slate-900 text-base truncate">{ad.page_name}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{formattedStartDate}</p>
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
                            <button className="text-slate-900 font-bold text-xs mt-2 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900">
                                Show more
                            </button>
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
                                    className="w-full max-h-[550px] object-contain"
                                />
                            ) : (
                                <img src={poster} alt="Ad Thumbnail" className="w-full max-h-[550px] object-contain" />
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANE: DATABOARD */}
                <div className="w-full lg:w-[55%] bg-slate-50 p-4 sm:p-8 pb-24 lg:pb-8 flex flex-col lg:overflow-y-auto custom-scrollbar relative">

                    {/* Tabs / Header Actions */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 sticky top-0 pt-4 sm:pt-0 bg-slate-50 z-20">
                        <div className="flex gap-6">
                            <button className="text-orange-600 font-bold border-b-2 border-orange-600 pb-4 -mb-[17px] px-1 flex items-center gap-2">
                                <LayoutTemplate className="w-4 h-4" /> Overview
                            </button>
                            {/* <button className="text-slate-400 font-medium hover:text-slate-600 pb-4 -mb-[17px] px-1">Transcript</button> */}
                        </div>
                        <div className="flex gap-2.5 items-center">
                            <TrackStoreButton domain={hostname} pageName={ad.page_name} />
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {/* Ads Details Card */}
                        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center gap-2 mb-6 text-slate-900 font-bold text-lg">
                                <Globe2 className="w-5 h-5 text-slate-400" />
                                Ads Details
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                                {/* Left Side status */}
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

                                {/* Right Side List */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-2"><Globe2 className="w-4 h-4" /> Running time</span>
                                        <span className="font-semibold text-slate-900">{formattedStartDate} → {ad.is_active ? 'Today' : 'Ended'}</span>
                                    </div>
                                    <div className="h-px w-full bg-slate-100" />
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-2"><Eye className="w-4 h-4" /> Reach</span>
                                        <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-indigo-400" />
                                        </div>
                                    </div>
                                    <div className="h-px w-full bg-slate-100" />
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-2"><CircleDollarSign className="w-4 h-4" /> Spend</span>
                                        <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-indigo-400" />
                                        </div>
                                    </div>
                                    <div className="h-px w-full bg-slate-100" />
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-2"><Globe2 className="w-4 h-4" /> Countries</span>
                                        <span className="font-semibold text-slate-900">{ad.country || "-"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Page Details */}
                            <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-6 text-slate-900 font-bold">
                                    <Store className="w-4 h-4 text-slate-400" />
                                    Page Details
                                </div>
                                <div className="flex flex-col items-center justify-center py-2">
                                    <div className="relative w-32 h-32 rounded-full border-[12px] border-slate-100 flex items-center justify-center">
                                        <div className="bg-white w-full h-full shadow-inner rounded-full absolute z-10 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-black text-slate-900">{activeAdsCount}</span>
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Active Ads</span>
                                        </div>
                                        {/* CSS arc representing a fake percentage of success/active */}
                                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                            <circle cx="50%" cy="50%" r="48%" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="100 200" className="z-20 opacity-90" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Shop Details - UNLOCKED */}
                            <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <Store className="w-4 h-4 text-slate-400" />
                                        Shop Details
                                    </div>
                                    <div className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2.5 py-1 rounded-md border border-orange-100">
                                        Unlocked
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    {/* Simulated Insights */}
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Monthly Visits</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-black text-slate-900">45.2K</span>
                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Platform Details</p>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200">
                                                {ad.platform === 'facebook' || ad.platform === 'instagram' ? 'Shopify' : (ad.platform || 'Shopify')}
                                            </span>
                                            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200">
                                                Theme: Dawn
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Tech Stack</p>
                                        <div className="flex items-center gap-1.5 flex-wrap">
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

                    {/* Bottom Right Floating Open Tab Button */}
                    <div className="mt-8 flex justify-end">
                        <Link
                            href={`/ad/${ad.id}`}
                            target="_blank"
                            className="bg-black hover:bg-slate-800 text-white text-sm font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
                        >
                            Open in new tab <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
