"use client";

import { useState } from "react";
import { StoreLogo } from "./StoreLogo";
import { Trash2, ArrowRight, Flame, X, Code2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { removeTrackedStore } from "@/app/actions/tracked-stores";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

import { triggerForceScan } from "@/app/actions/force-scan";

export interface TrackedStoreEnriched {
    id: string;
    store_domain: string;
    page_name?: string | null;
    platform?: string | null;
    theme?: string | null;
    monthly_traffic?: number | null;
    tech_stack?: string[] | null;
    trust_score?: number | null;
    last_analyzed_at?: string | null;
    ads_count?: number;
}

export function StoreAnalysisCard({ store }: { store: TrackedStoreEnriched }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    // Formatting helper
    const formatTraffic = (num: number | null | undefined) => {
        if (!num || num === 0) return "En cours...";
        if (num > 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num > 1000) return (num / 1000).toFixed(1) + "K";
        return num.toString();
    };

    // Platform Badge Logic
    const getPlatformStyles = (platform: string | null | undefined) => {
        const p = (platform || "").toLowerCase();
        if (p === 'shopify') return 'bg-green-100 text-green-700';
        if (p === 'youcan') return 'bg-blue-100 text-blue-700';
        if (p === 'woocommerce') return 'bg-purple-100 text-purple-700';
        return 'bg-slate-100 text-slate-600';
    };

    // Mock AI Summary (in reality, generated periodically and saved to DB)
    const mockAiSummary = store.monthly_traffic && store.monthly_traffic > 50000
        ? "Leader de sa niche. Stratégie d'acquisition massive avec reciblage sur plusieurs réseaux."
        : "Phase de test. Rotation fréquente des créatifs vidéos pour trouver l'angle gagnant.";

    const handleForceScan = async () => {
        setIsScanning(true);
        toast.loading("Lancement du scanner Apify...", { id: `scan-${store.id}` });
        try {
            const res = await triggerForceScan(store.store_domain);
            if (res.error) {
                toast.error(res.error, { id: `scan-${store.id}` });
            } else {
                toast.success(res.message || "Extraction en cours !", { id: `scan-${store.id}` });
            }
        } catch (err) {
            toast.error('Erreur de connexion', { id: `scan-${store.id}` });
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full relative group">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <StoreLogo domain={store.store_domain} />
                        <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 truncate text-sm">{store.page_name || store.store_domain}</h3>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className={`text-[10px] px-2 py-0.5 inline-block rounded-full uppercase font-bold ${getPlatformStyles(store.platform)}`}>
                                    {store.platform || 'Analyse en cours'}
                                </span>
                                {store.theme && (
                                    <span className="text-[10px] px-2 py-0.5 inline-block rounded-full border border-slate-200 text-slate-600 font-semibold truncate max-w-[120px]">
                                        🎨 Thème: {store.theme}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <form action={async () => {
                        const res = await removeTrackedStore(store.store_domain);
                        if (res.error) toast.error(res.error);
                        else toast.success(`Boutique supprimée`);
                    }}>
                        <button type="submit" title="Ne plus suivre" className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 -mr-2 rounded-xl transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </form>
                </div>

                {/* ADS COUNT BADGE & SCAN ACTIONS */}
                {(!store.ads_count || store.ads_count === 0) ? (
                    <div className="mt-2 mb-4 bg-orange-50/50 p-3 rounded-xl border border-orange-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <span className="text-xs font-bold text-orange-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            0 publicité active
                        </span>
                        <button
                            type="button"
                            disabled={isScanning}
                            onClick={handleForceScan}
                            className="w-full sm:w-auto text-[10px] font-bold bg-white border border-orange-200 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-600 hover:text-white transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                            {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>🚀 Lancer un scan forcé</span>}
                        </button>
                    </div>
                ) : (
                    <div className="mt-2 mb-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            {store.ads_count} publicités actives
                        </span>
                    </div>
                )}

                {/* DATA VISUALIZATION (API SimilarWeb) */}
                <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-50 mt-auto">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Metrics (Trafic)</p>
                        <div className="flex items-center gap-2">
                            <p className="text-lg font-black text-slate-900">{formatTraffic(store.monthly_traffic)}</p>
                            {(store.monthly_traffic && store.monthly_traffic > 10000) && (
                                <span title="High Traffic" className="flex items-center justify-center bg-orange-100 rounded-full p-1 animate-pulse">
                                    <Flame className="w-4 h-4 text-orange-600" />
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Confiance Marché</p>
                        <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <div key={s} className={`h-1.5 w-full rounded-full ${s <= (store.trust_score || 0) ? 'bg-orange-500' : 'bg-slate-100'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI SUMMARY */}
                <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                        <span className="font-bold text-slate-800 not-italic">A-S Synthèse : </span>
                        {mockAiSummary}
                    </p>
                </div>

                {/* TECH STACK (API Wappalyzer) */}
                <div className="mt-4 flex flex-wrap gap-1.5 mb-6">
                    {(!store.tech_stack || store.tech_stack.length === 0) ? (
                        <span className="text-[10px] text-slate-400 italic">Aucune stack détectée</span>
                    ) : (
                        store.tech_stack.slice(0, 3).map(tech => (
                            <span key={tech} className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded-md border border-slate-200/60">
                                {tech}
                            </span>
                        ))
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-auto grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 py-3 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                    >
                        <Code2 className="w-3.5 h-3.5" /> Détails techniques
                    </button>
                    <Link
                        href={`/?store=${encodeURIComponent(store.store_domain)}`}
                        className="w-full flex items-center justify-center gap-1.5 bg-slate-900 text-white py-3 rounded-xl text-xs font-bold hover:bg-black transition-all"
                    >
                        Analyser pubs <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Technical Details Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
                        >
                            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Code2 className="w-5 h-5 text-slate-400" />
                                    Tech Stack Complète
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <StoreLogo domain={store.store_domain} />
                                    <div>
                                        <p className="font-bold text-slate-900 leading-tight">{store.page_name || store.store_domain}</p>
                                        <p className="text-xs text-slate-500">{store.store_domain}</p>
                                    </div>
                                </div>

                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Technologies Front-end & Tracking détectées</h4>

                                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2 pb-4 snap-y custom-scrollbar">
                                    {(!store.tech_stack || store.tech_stack.length === 0) ? (
                                        <div className="w-full text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-sm text-slate-500 italic">Aucune donnée technique disponible pour ce domaine.</p>
                                        </div>
                                    ) : (
                                        store.tech_stack.map(tech => (
                                            <div key={tech} className="bg-slate-50 text-slate-700 font-medium text-sm px-3 py-1.5 rounded-lg border border-slate-200">
                                                {tech}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
