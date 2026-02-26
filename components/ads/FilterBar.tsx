"use client";

import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Store, Clock, X, Radio } from "lucide-react";
import { FilterState } from "@/types/database";

interface FilterBarProps {
    filters: FilterState;
    onChange: (filters: FilterState) => void;
    resultCount: number;
}

const LANDER_OPTIONS: { value: FilterState["lander"]; label: string }[] = [
    { value: "all", label: "Tous les landers" },
    { value: "shopify", label: "Shopify" },
    { value: "other", label: "Autres" },
];

const AGE_OPTIONS: { value: FilterState["age"]; label: string }[] = [
    { value: "all", label: "Toute période" },
    { value: "24h", label: "< 24 heures" },
    { value: "7d", label: "7 derniers jours" },
    { value: "30d", label: "30 derniers jours" },
];

const PLATFORM_OPTIONS: { value: FilterState["platform"]; label: string }[] = [
    { value: "all", label: "Toutes plateformes" },
    { value: "facebook", label: "📘 Facebook" },
    { value: "instagram", label: "📸 Instagram" },
    { value: "tiktok", label: "🎵 TikTok" },
];

const ChevronDown = () => (
    <svg className="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

export function FilterBar({ filters, onChange, resultCount }: FilterBarProps) {
    const searchRef = useRef<HTMLInputElement>(null);

    const hasActiveFilters =
        filters.keyword !== "" ||
        filters.lander !== "all" ||
        filters.age !== "all" ||
        filters.platform !== "all" ||
        filters.activeOnly;

    const resetAll = useCallback(() => {
        onChange({ keyword: "", lander: "all", age: "all", platform: "all", activeOnly: false });
    }, [onChange]);

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="sticky top-0 z-30 glass border-b border-charcoal-border px-6 py-3"
        >
            <div className="flex flex-wrap items-center gap-2.5">

                {/* Search */}
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        ref={searchRef}
                        type="text"
                        value={filters.keyword}
                        onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
                        placeholder="Rechercher page ou pub..."
                        className="w-full pl-9 pr-8 py-2 bg-charcoal-light border border-charcoal-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-orange-burnt/50 transition-all"
                    />
                    {filters.keyword && (
                        <button
                            onClick={() => { onChange({ ...filters, keyword: "" }); searchRef.current?.focus(); }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Platform */}
                <div className="relative">
                    <select
                        value={filters.platform}
                        onChange={(e) => onChange({ ...filters, platform: e.target.value as FilterState["platform"] })}
                        className="pl-3 pr-7 py-2 bg-charcoal-light border border-charcoal-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-orange-burnt/50 transition-all cursor-pointer appearance-none min-w-40"
                    >
                        {PLATFORM_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-charcoal">{opt.label}</option>
                        ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"><ChevronDown /></div>
                </div>

                {/* Lander */}
                <div className="relative">
                    <Store className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                    <select
                        value={filters.lander}
                        onChange={(e) => onChange({ ...filters, lander: e.target.value as FilterState["lander"] })}
                        className="pl-8 pr-7 py-2 bg-charcoal-light border border-charcoal-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-orange-burnt/50 transition-all cursor-pointer appearance-none min-w-36"
                    >
                        {LANDER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-charcoal">{opt.label}</option>
                        ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"><ChevronDown /></div>
                </div>

                {/* Age */}
                <div className="relative">
                    <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                    <select
                        value={filters.age}
                        onChange={(e) => onChange({ ...filters, age: e.target.value as FilterState["age"] })}
                        className="pl-8 pr-7 py-2 bg-charcoal-light border border-charcoal-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-orange-burnt/50 transition-all cursor-pointer appearance-none min-w-40"
                    >
                        {AGE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-charcoal">{opt.label}</option>
                        ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"><ChevronDown /></div>
                </div>

                {/* Active only toggle */}
                <button
                    onClick={() => onChange({ ...filters, activeOnly: !filters.activeOnly })}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${filters.activeOnly
                            ? "bg-green-500/15 border-green-500/30 text-green-400"
                            : "bg-charcoal-light border-charcoal-border text-text-muted hover:text-text-secondary"
                        }`}
                >
                    <Radio className="w-3.5 h-3.5" />
                    Live only
                </button>

                {/* Reset */}
                {hasActiveFilters && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={resetAll}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs text-orange-burnt border border-orange-burnt/30 rounded-xl hover:bg-orange-burnt/10 transition-all"
                    >
                        <X className="w-3 h-3" />
                        Reset
                    </motion.button>
                )}

                {/* Count */}
                <span className="ml-auto text-xs text-text-muted font-medium whitespace-nowrap">
                    <span className="text-orange-burnt font-bold">{resultCount}</span> résultat{resultCount !== 1 ? "s" : ""}
                </span>
            </div>
        </motion.div>
    );
}
