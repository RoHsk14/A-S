"use client";

import { useState, useCallback } from "react";
import { toggleFavoriteAction } from "@/app/actions/favorites";

export function useFavorites(initialFavoriteIds: string[] = []) {
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
        new Set(initialFavoriteIds)
    );
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

    const isFavorite = useCallback(
        (adId: string) => favoriteIds.has(adId),
        [favoriteIds]
    );

    const toggleFavorite = useCallback(
        async (adId: string) => {
            if (pendingIds.has(adId)) return;

            const wasFavorited = favoriteIds.has(adId);

            // Optimistic update — flip state immediately
            setFavoriteIds((prev) => {
                const next = new Set(prev);
                if (wasFavorited) {
                    next.delete(adId);
                } else {
                    next.add(adId);
                }
                return next;
            });

            setPendingIds((prev) => new Set(prev).add(adId));

            try {
                await toggleFavoriteAction(adId, !wasFavorited);
            } catch (error) {
                console.warn("Failed to sync favorite, reverting:", error);
                // Revert optimistic update on error
                setFavoriteIds((prev) => {
                    const next = new Set(prev);
                    if (wasFavorited) {
                        next.add(adId);
                    } else {
                        next.delete(adId);
                    }
                    return next;
                });
            } finally {
                setPendingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(adId);
                    return next;
                });
            }
        },
        [favoriteIds, pendingIds]
    );

    return { isFavorite, toggleFavorite, favoriteIds, pendingIds };
}
