"use client";

import { useRef, useEffect, useState } from "react";
import { Heart, Volume2, VolumeX, ExternalLink, Play } from "lucide-react";
import Link from "next/link";
import { AdWithStore } from "@/types/database";
import { TrackStoreButton } from "@/components/ads/TrackStoreButton";

interface AdCardProps {
    ad: AdWithStore;
    isFavorite: boolean;
    onToggleFavorite: (adId: string) => void;
}

function getHostname(url: string | null) {
    if (!url) return null;
    try {
        return new URL(url).hostname;
    } catch {
        return null;
    }
}

export function AdCard({ ad, isFavorite, onToggleFavorite }: AdCardProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLAnchorElement>(null);

    const [isIntersecting, setIsIntersecting] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    const hostname = getHostname(ad.cta_link);
    // Use high-res image for zero blur
    const poster = ad.image_url ?? ad.thumbnail_url ?? "";

    const daysActive = ad.started_at
        ? Math.floor((new Date().getTime() - new Date(ad.started_at).getTime()) / (1000 * 3600 * 24))
        : 0;
    const isWinner = daysActive >= 20;

    // Mobile Auto-play via Intersection Observer
    useEffect(() => {
        if (!containerRef.current || !ad.video_url) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            },
            { threshold: 0.5 } // Trigger when 50% visible
        );

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [ad.video_url]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isIntersecting || isHovered) {
            video.play().catch(() => { });
        } else {
            video.pause();
        }
    }, [isIntersecting, isHovered]);

    const handleToggleSound = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsMuted(!isMuted);
    };

    return (
        <div
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                if (videoRef.current) videoRef.current.currentTime = 0;
            }}
        >
            {/* Media Preview (Square) */}
            <Link
                href={`/ad/${ad.id}`}
                ref={containerRef}
                className="relative aspect-square overflow-hidden bg-slate-900 block flex-shrink-0"
            >
                {/* Heart Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleFavorite(ad.id);
                    }}
                    className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/20 text-white backdrop-blur-md transition-all hover:bg-black/40 shadow-sm"
                    aria-label="Toggle Favorite"
                >
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`} />
                </button>
                {ad.video_url ? (
                    <video
                        ref={videoRef}
                        src={ad.video_url}
                        poster={poster}
                        muted={isMuted}
                        loop
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <img src={poster} alt={ad.page_name || "Ad Thumbnail"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                )}

                {/* Overlay Play Icon */}
                {(!isHovered && !isIntersecting) && ad.video_url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none z-10">
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
                            <Play className="w-8 h-8 text-white fill-current" />
                        </div>
                    </div>
                )}

                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
                    {isWinner && (
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center w-fit">
                            🔥 WINNER
                        </span>
                    )}
                    <span className="bg-white/90 backdrop-blur text-slate-900 text-[10px] font-bold px-2 py-1 rounded-full border border-slate-200 w-fit">
                        {daysActive} JOURS
                    </span>
                </div>

                {/* BOUTON SON */}
                {ad.video_url && (
                    <button
                        onClick={handleToggleSound}
                        className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full transition-all z-20"
                        aria-label="Toggle Sound"
                    >
                        {isMuted ? (
                            <VolumeX className="w-4 h-4 text-white" />
                        ) : (
                            <Volume2 className="w-4 h-4 text-white" />
                        )}
                    </button>
                )}
            </Link>

            {/* SECTION INFOS (Light Mode) */}
            <div className="p-4 flex flex-col flex-grow bg-white">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <span className="text-sm font-bold text-slate-500">{ad.page_name?.[0]?.toUpperCase() || '?'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-slate-900 text-sm truncate">{ad.page_name}</h3>
                            <TrackStoreButton domain={hostname} pageName={ad.page_name} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Shopify Store</p>
                    </div>
                </div>

                <p className="text-slate-600 text-xs line-clamp-2 mb-4 italic leading-relaxed">
                    "{ad.ad_copy}"
                </p>

                <div className="bg-orange-50/80 border border-orange-200/60 rounded-xl p-3 mb-5 flex gap-2 items-start mt-auto shadow-sm">
                    <span className="text-[10px] leading-snug text-orange-900/90 font-medium text-left">
                        <strong className="font-bold text-orange-700 block mb-0.5">⚠️ Attention</strong>
                        Cette publicité quittera la sélection Winners dimanche soir. Enregistrez-la dans votre Spy-List pour ne pas la perdre.
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 mt-auto border-t border-slate-100/50">
                    <div className="grid grid-cols-2 gap-2">
                        <a
                            href={ad.cta_link ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 group"
                        >
                            Boutique
                            <ExternalLink className="w-3.5 h-3.5 text-orange-200 group-hover:text-white transition-colors" />
                        </a>
                        <a
                            href={ad.ad_archive_id ? `https://www.facebook.com/ads/library/?id=${ad.ad_archive_id}` : `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(ad.page_name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 flex items-center justify-center py-3 rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                            Facebook
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
