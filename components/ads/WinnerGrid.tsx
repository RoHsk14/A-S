"use client";

import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { AdCard } from "./AdCard";
import { FilterBar } from "./FilterBar";
import { AdWithStore, FilterState } from "@/types/database";
import { useFavorites } from "@/hooks/useFavorites";

interface WinnerGridProps {
    ads: AdWithStore[];
    initialFavoriteIds?: string[];
}

export function WinnerGrid({ ads, initialFavoriteIds = [] }: WinnerGridProps) {
    const [filters, setFilters] = useState<FilterState>({
        keyword: "",
        lander: "all",
        age: "all",
        platform: "all",
        activeOnly: false,
    });

    const { isFavorite, toggleFavorite } = useFavorites(initialFavoriteIds);

    const filteredAds = useMemo(() => {
        const now = Date.now();
        const AGE_MAP: Record<string, number> = {
            "24h": 24 * 60 * 60 * 1000,
            "7d": 7 * 24 * 60 * 60 * 1000,
            "30d": 30 * 24 * 60 * 60 * 1000,
        };

        return ads.filter((ad) => {
            // Keyword: page_name + ad_copy
            if (filters.keyword) {
                const kw = filters.keyword.toLowerCase();
                const ok = ad.page_name?.toLowerCase().includes(kw) ||
                    ad.ad_copy?.toLowerCase().includes(kw);
                if (!ok) return false;
            }

            // Lander: Shopify detected via cta_link
            if (filters.lander !== "all") {
                const shopify = ad.cta_link?.includes("/products") || ad.cta_link?.includes("myshopify.com");
                if (filters.lander === "shopify" && !shopify) return false;
                if (filters.lander === "other" && shopify) return false;
            }

            // Platform: facebook / instagram / tiktok
            if (filters.platform !== "all") {
                if ((ad.platform ?? "").toLowerCase() !== filters.platform) return false;
            }

            // Active only
            if (filters.activeOnly && !ad.is_active) return false;

            // Age (based on created_at)
            if (filters.age !== "all") {
                const maxAge = AGE_MAP[filters.age];
                if (now - new Date(ad.created_at).getTime() > maxAge) return false;
            }

            return true;
        });
    }, [ads, filters]);

    return (
        <div>
            <FilterBar filters={filters} onChange={setFilters} resultCount={filteredAds.length} />

            <div className="p-6">
                {filteredAds.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-charcoal-light border border-charcoal-border flex items-center justify-center mb-4">
                            <span className="text-2xl">🔍</span>
                        </div>
                        <h3 className="text-lg font-semibold text-text-primary mb-1">Aucun résultat</h3>
                        <p className="text-sm text-text-muted">Essayez d'ajuster vos filtres.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredAds.map((ad) => (
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
        </div>
    );
}
