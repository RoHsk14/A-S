"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Scan } from "lucide-react";

export function AdCounter() {
    const [count, setCount] = useState<number | null>(null);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        // 1. Fetch initial count of ads created today
        const fetchInitialCount = async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { count: initialCount } = await supabase
                .from("ads")
                .select("*", { count: "exact", head: true })
                .gte("created_at", today.toISOString());

            // Fallback to mock count if Supabase not configured yet
            setCount(initialCount ?? 1247);
        };

        fetchInitialCount();

        // 2. Subscribe to real-time INSERT events on the ads table
        const channel = supabase
            .channel("realtime_ads_count")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "ads" },
                () => {
                    setCount((prev) => (prev !== null ? prev + 1 : 1));
                }
            )
            .subscribe((status) => {
                setIsLive(status === "SUBSCRIBED");
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-burnt/10 flex items-center justify-center flex-shrink-0">
                <Scan className="w-4 h-4 text-orange-burnt" />
            </div>
            <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-xs text-text-muted">Pubs scannées</p>
                    {/* Live indicator dot */}
                    <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLive ? "bg-orange-burnt animate-pulse" : "bg-text-muted"
                            }`}
                        title={isLive ? "Realtime actif" : "En attente..."}
                    />
                </div>

                <AnimatePresence mode="wait">
                    {count === null ? (
                        // Skeleton while loading
                        <motion.div
                            key="skeleton"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-5 w-14 rounded shimmer"
                        />
                    ) : (
                        <motion.span
                            key={count}
                            initial={{ y: 8, opacity: 0, scale: 0.85 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -8, opacity: 0, scale: 0.85 }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 25,
                            }}
                            className="block text-base font-black text-orange-burnt tabular-nums leading-none"
                        >
                            {count.toLocaleString("fr-FR")}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
