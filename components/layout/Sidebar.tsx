"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Target, Flame, Folder, Settings, Bot, Store, Search } from "lucide-react";
import { AdCounter } from "@/components/ads/AdCounter";
import { MOCK_STATS } from "@/lib/mock-data";
import { AfroSpyLogo } from "@/components/ui/AfroSpyLogo";

const DISCOVERY_ITEMS = [
    { href: "/", label: "Winners", icon: Target, description: "Flux principal" },
    { href: "/top-stores", label: "Top Stores", icon: Store, description: "Boutiques gagnantes" },
    { href: "/scraper", label: "Ads Search", icon: Search, description: "Recherche en direct" },
];

const LAB_ITEMS = [
    { href: "/spy-list", label: "My Spy-List", icon: Folder, description: "Mes pubs sauvegardées" },
    { href: "/my-stores", label: "My Stores", icon: Store, description: "Boutiques suivies" },
    { href: "/settings", label: "Settings", icon: Settings, description: "Configuration" },
];

function NavItem({ item, isActive, delay }: { item: any; isActive: boolean; delay: number }) {
    const Icon = item.icon;
    return (
        <motion.div
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay }}
        >
            <Link href={item.href}>
                <div className={`relative flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all duration-150 group ${isActive
                    ? "bg-orange-50 border border-orange-200"
                    : "border border-transparent hover:bg-slate-50 hover:border-slate-200"
                    }`}>
                    {isActive && (
                        <motion.div
                            layoutId="nav-active"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-orange-600 rounded-r"
                        />
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors shadow-sm border ${isActive
                        ? "bg-white text-orange-600 border-orange-100"
                        : "bg-white text-slate-400 border-slate-200 group-hover:text-slate-600"
                        }`}>
                        <Icon className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isActive ? "text-orange-900" : "text-slate-700 group-hover:text-slate-900"}`}>
                            {item.label}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate font-medium">{item.description}</p>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

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
                <Link href="/" className="flex items-center gap-2.5 group mb-4">
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

                {/* Credits Badge */}
                <div className="bg-orange-50/50 rounded-lg p-3 border border-orange-100/50">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-bold text-orange-900 uppercase">Scans restants</span>
                        <span className="text-xs font-black text-orange-600">3/10</span>
                    </div>
                    <div className="h-1.5 w-full bg-orange-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full w-[30%]" />
                    </div>
                    <p className="text-[9px] text-orange-600/70 mt-1.5 font-medium text-center">Ce mois-ci</p>
                </div>
            </div>

            {/* ── Navigation ───────────────────────────────── */}
            <div className="flex-1 overflow-y-auto w-full">
                {/* DISCOVERY Section */}
                <div className="px-5 pt-5 pb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">
                        Discovery
                    </p>
                    <nav className="space-y-0.5">
                        {DISCOVERY_ITEMS.map((item, i) => (
                            <NavItem key={item.href} item={item} isActive={pathname === item.href} delay={0.05 + i * 0.05} />
                        ))}
                    </nav>
                </div>

                {/* MY LABORATORY Section */}
                <div className="px-5 pt-3 pb-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">
                        My Laboratory
                    </p>
                    <nav className="space-y-0.5">
                        {LAB_ITEMS.map((item, i) => (
                            <NavItem key={item.href} item={item} isActive={pathname === item.href} delay={0.15 + i * 0.05} />
                        ))}
                    </nav>
                </div>
            </div>

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
