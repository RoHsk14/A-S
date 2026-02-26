"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Play, Search, Globe, Hash, ChevronDown, Loader2, Zap, CheckCircle2 } from "lucide-react";


// ── Countries ─────────────────────────────────────────────────
const COUNTRIES = [
    { code: "MA", flag: "🇲🇦", label: "Maroc" },
    { code: "DZ", flag: "🇩🇿", label: "Algérie" },
    { code: "TN", flag: "🇹🇳", label: "Tunisie" },
    { code: "EG", flag: "🇪🇬", label: "Égypte" },
    { code: "SN", flag: "🇸🇳", label: "Sénégal" },
    { code: "CI", flag: "🇨🇮", label: "Côte d'Ivoire" },
    { code: "CM", flag: "🇨🇲", label: "Cameroun" },
    { code: "GA", flag: "🇬🇦", label: "Gabon" },
    { code: "TD", flag: "🇹🇩", label: "Tchad" },
    { code: "CD", flag: "🇨🇩", label: "Congo (RDC)" },
    { code: "BJ", flag: "🇧🇯", label: "Bénin" },
    { code: "TG", flag: "🇹🇬", label: "Togo" },
    { code: "NE", flag: "🇳🇪", label: "Niger" },
    { code: "BF", flag: "🇧🇫", label: "Burkina Faso" },
    { code: "ML", flag: "🇲🇱", label: "Mali" },
];

const PRESETS = [
    "livraison gratuite", "perte de poids", "sneakers", "bijoux femme",
    "formation en ligne", "capsule café", "montre luxe", "soin visage",
    "gadget cuisine", "crème anti-âge",
];

const PLATFORMS = [
    { value: "facebook", label: "📘 Facebook" },
    { value: "instagram", label: "📸 Instagram" },
];

interface ScanResult { runId?: string; message?: string; }

export default function ScraperPage() {
    const [keyword, setKeyword] = useState("");
    const [country, setCountry] = useState("TD");
    const limit = 30; // Force strict limit
    const [platform, setPlatform] = useState("facebook");
    const [loading, setLoading] = useState(false);
    const [lastRun, setLastRun] = useState<ScanResult | null>(null);

    const handleStartScan = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!keyword.trim() || loading) return;

        const payload = {
            keyword: keyword.trim(),
            country,
            limit,
            platform,
        };

        setLoading(true);
        setLastRun(null);

        const toastId = toast.loading(`⏳ Lancement du scan pour "${payload.keyword}"...`, {
            style: {
                background: "#FFFFFF",
                color: "#E6EDF3",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
            },
        });

        try {
            // Proxy via Next.js API pour éviter les erreurs CORS en dev
            const res = await fetch("/api/smart-task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errBody = await res.text();
                throw new Error(errBody || `Erreur HTTP ${res.status}`);
            }

            const result: ScanResult = await res.json();
            setLastRun(result);

            toast.success(
                `🚀 Scan lancé sur Apify ! Les résultats arrivent dans quelques minutes.`,
                { id: toastId, duration: 5000 }
            );

            if (result?.runId) {
                console.log("Apify Run ID:", result.runId);
            }
        } catch (err: unknown) {
            console.error(err);
            const isNotDeployed =
                err instanceof Error &&
                (err.message.includes("FunctionsFetchError") ||
                    err.message.includes("Failed to send") ||
                    err.name === "FunctionsFetchError");

            toast.error(
                isNotDeployed
                    ? "⚠️ La Edge Function 'smart-task' n'est pas encore déployée. Lance : supabase functions deploy smart-task"
                    : `❌ Erreur : ${err instanceof Error ? err.message : "Impossible de contacter la Edge Function."}`,
                { id: toastId, duration: 8000 }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🕵️</span>
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">Scraper Control</h1>
                <AnimatePresence>
                    {loading && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-xs font-bold bg-orange-burnt/15 text-orange-burnt border border-orange-burnt/30 px-2.5 py-0.5 rounded-full flex items-center gap-1"
                        >
                            <Loader2 className="w-3 h-3 animate-spin" />
                            EN COURS...
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
            <p className="text-sm text-text-muted ml-11 mb-6">
                Déclenche un scan cloud via Apify · les résultats arrivent directement dans Supabase
            </p>

            {/* Main form */}
            <form onSubmit={handleStartScan} className="space-y-3">
                {/* ── Keyword ───────────────────────────────── */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <label className="block text-xs text-text-muted uppercase tracking-widest mb-2 font-semibold">
                        Mot-clé ou Niche
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            name="keyword"
                            required
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            disabled={loading}
                            placeholder="ex: crème anti-âge, gadget cuisine..."
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-orange-burnt/50 disabled:opacity-50 transition-all"
                        />
                    </div>
                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {PRESETS.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setKeyword(p)}
                                disabled={loading}
                                className="text-[10px] px-2 py-0.5 rounded-full border border-slate-300 text-text-muted hover:border-orange-burnt/40 hover:text-orange-burnt transition-all disabled:opacity-40"
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Country + Limit ───────────────────────── */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Country */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4">
                        <label className="block text-xs text-text-muted uppercase tracking-widest mb-2 font-semibold">
                            <Globe className="inline w-3 h-3 mr-1" />
                            Pays cible
                        </label>
                        <div className="relative">
                            <select
                                name="country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                disabled={loading}
                                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-text-primary focus:outline-none focus:border-orange-burnt/50 disabled:opacity-50 appearance-none cursor-pointer transition-all"
                            >
                                {COUNTRIES.map((c) => (
                                    <option key={c.code} value={c.code} className="bg-white">
                                        {c.flag} {c.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                        </div>
                    </div>

                    {/* Limit */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 opacity-50">
                        <label className="block text-xs text-text-muted uppercase tracking-widest mb-2 font-semibold">
                            <Hash className="inline w-3 h-3 mr-1" />
                            Limite Maximum
                        </label>
                        <div className="text-xl font-bold text-orange-burnt mt-1">{limit}</div>
                        <div className="text-[10px] text-text-muted mt-1 leading-tight">
                            Fixée à 30 pubs par scan (sécurité forfait Apify).
                        </div>
                    </div>
                </div>

                {/* ── Platform ──────────────────────────────── */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <label className="block text-xs text-text-muted uppercase tracking-widest mb-2 font-semibold">
                        Plateforme
                    </label>
                    <div className="flex gap-2">
                        {PLATFORMS.map((pt) => (
                            <button
                                key={pt.value}
                                type="button"
                                onClick={() => setPlatform(pt.value)}
                                disabled={loading}
                                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50 ${platform === pt.value
                                    ? "bg-orange-burnt/15 border-orange-burnt/40 text-orange-burnt"
                                    : "bg-slate-50 border-slate-300 text-text-muted hover:text-text-secondary"
                                    }`}
                            >
                                {pt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Submit ────────────────────────────────── */}
                <motion.button
                    type="submit"
                    whileHover={!loading ? { scale: 1.01 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    disabled={loading || !keyword.trim()}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 bg-gradient-orange text-white shadow-orange-glow hover:shadow-orange-glow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Initialisation du scan cloud...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            DÉMARRER LE SCAN CLOUD
                        </>
                    )}
                </motion.button>
            </form>

            {/* ── Last run result ───────────────────────────── */}
            <AnimatePresence>
                {lastRun && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 bg-white border border-[#3FB950]/30 rounded-2xl p-4 flex items-start gap-3"
                    >
                        <CheckCircle2 className="w-5 h-5 text-green-active flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-text-primary">Scan lancé avec succès !</p>
                            {lastRun.runId && (
                                <p className="text-xs text-text-muted mt-0.5">
                                    Apify Run ID : <span className="font-mono text-blue-accent-light">{lastRun.runId}</span>
                                </p>
                            )}
                            <p className="text-xs text-text-muted mt-1">
                                <Zap className="inline w-3 h-3 text-orange-burnt mr-1" />
                                Les résultats apparaîtront dans la page Winners dans quelques minutes.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
