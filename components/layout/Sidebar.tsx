"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Target, Flame, Folder, Settings, Bot } from "lucide-react";
import { AdCounter } from "@/components/ads/AdCounter";
import { MOCK_STATS } from "@/lib/mock-data";
import { AfroSpyLogo } from "@/components/ui/AfroSpyLogo";

const NAV_ITEMS = [
    { href: "/", label: "Winners", icon: Target, description: "Flux principal" },
    { href: "/trending", label: "Trending", icon: Flame, description: "Boutiques qui scalent" },
    { href: "/spy-list", label: "Spy List", icon: Folder, description: "Mes favoris" },
    { href: "/scraper", label: "Scraper", icon: Bot, description: "Lancer un scraping" },
    { href: "/settings", label: "Settings", icon: Settings, description: "Configuration" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <motion.aside
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-56 h-full flex flex-col bg-white border-r border-slate-200 flex-shrink-0"
        >
            {/* ── Logo ─────────────────────────────────────── */}
            <div className="px-4 py-4 border-b border-slate-200">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <AfroSpyLogo className="w-9 h-9 shadow-orange-glow group-hover:shadow-orange-glow-lg transition-shadow" />
                    <div className="leading-tight">
                        <p className="text-sm font-black tracking-widest text-text-primary">
                            AFRO <span className="text-orange-burnt">SPY</span>
                        </p>
                        <p className="text-[9px] text-text-muted uppercase tracking-widest">
                            Ad Intelligence
                        </p>
                    </div>
                </Link>
            </div>

            {/* ── Navigation ───────────────────────────────── */}
            <nav className="flex-1 px-2 py-3 space-y-0.5">
                {NAV_ITEMS.map((item, i) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={item.href}
                            initial={{ x: -16, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.05 + i * 0.06 }}
                        >
                            <Link href={item.href}>
                                <div className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 group ${isActive
                                    ? "bg-orange-burnt/10 border border-orange-burnt/25"
                                    : "border border-transparent hover:bg-slate-100 hover:border-slate-300"
                                    }`}>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-active"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-burnt rounded-r"
                                        />
                                    )}
                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${isActive
                                        ? "bg-orange-burnt/20 text-orange-burnt"
                                        : "text-text-muted group-hover:text-text-secondary"
                                        }`}>
                                        <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-xs font-semibold truncate ${isActive ? "text-orange-burnt" : "text-text-primary"}`}>
                                            {item.label}
                                        </p>
                                        <p className="text-[10px] text-text-muted truncate">{item.description}</p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            {/* ── Stats ────────────────────────────────────── */}
            <div className="px-3 py-3 border-t border-slate-200">
                <p className="text-[9px] text-text-muted uppercase tracking-widest px-1 mb-2 font-semibold">
                    Statistiques du jour
                </p>
                <div className="bg-slate-100 rounded-xl p-3 space-y-2.5 border border-slate-200">
                    {/* Realtime Ad Counter */}
                    <AdCounter />

                    {/* Boutiques actives */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-text-muted">Boutiques actives</span>
                        <span className="text-xs font-bold text-gold tabular-nums">{MOCK_STATS.totalStores}</span>
                    </div>

                    {/* Nouveaux winners */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-text-muted">Nouveaux winners</span>
                        <span className="text-xs font-bold text-green-active tabular-nums">+{MOCK_STATS.newWinners}</span>
                    </div>
                </div>
                <p className="text-center text-[10px] text-text-muted mt-2 tracking-widest">v1.0 · BETA</p>
            </div>
        </motion.aside>
    );
}
