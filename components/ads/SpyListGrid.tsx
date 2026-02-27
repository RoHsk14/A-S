"use client";

import { useFavorites } from "@/hooks/useFavorites";
import { AdCard } from "@/components/ads/AdCard";
import { Heart } from "lucide-react";
import { AdWithStore } from "@/types/database";
import { AnimatePresence } from "framer-motion";

interface SpyListGridProps {
    initialAds: AdWithStore[];
}

export function SpyListGrid({ initialAds }: SpyListGridProps) {
    const { isFavorite, toggleFavorite, favoriteIds } = useFavorites(
        initialAds.map((a) => a.id)
    );

    const favoriteAds = initialAds.filter((ad) => favoriteIds.has(ad.id));

    return (
        <div>
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📁</span>
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">Spy List</h1>
                <span className="text-xs font-bold bg-red-500/15 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full">
                    {favoriteAds.length} sauvegardé{favoriteAds.length !== 1 ? "s" : ""}
                </span>
            </div>
            <p className="text-sm text-text-muted mb-6 sm:ml-9">
                Vos pubs favorites — sauvegardées pour analyse
            </p>

            {favoriteAds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                        <Heart className="w-8 h-8 text-text-muted" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                        Votre Spy List est vide
                    </h3>
                    <p className="text-sm text-text-muted max-w-xs">
                        Cliquez sur le ❤️ sur n'importe quelle pub dans Winners pour la sauvegarder ici.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-4 sm:mt-6">
                    <AnimatePresence mode="popLayout">
                        {favoriteAds.map((ad) => (
                            <AdCard
                                key={ad.id}
                                ad={ad}
                                isFavorite={isFavorite(ad.id)}
                                onToggleFavorite={toggleFavorite}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
