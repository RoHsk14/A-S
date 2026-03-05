"use client";

import { useState } from "react";
import { Plus, Check, Loader2, Store } from "lucide-react";
import { addTrackedStore, removeTrackedStore } from "@/app/actions/tracked-stores";
import toast from "react-hot-toast";

interface TrackStoreButtonProps {
    domain: string | null;
    pageName: string | null;
    className?: string; // Ajout prop optionnelle pour le style
}

export function TrackStoreButton({ domain, pageName, className = "" }: TrackStoreButtonProps) {
    const [loading, setLoading] = useState(false);
    const [tracked, setTracked] = useState(false);

    if (!domain) return null;

    const handleTrack = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading) return;

        setLoading(true);

        try {
            if (tracked) {
                // Désabonnement
                const res = await removeTrackedStore(domain);
                if (res.error) {
                    toast.error(res.error, { position: "bottom-center" });
                } else {
                    setTracked(false);
                    toast.success("Boutique retirée de vos suivis", { position: "bottom-center", icon: <Store className="w-4 h-4 text-slate-500" /> });
                }
            } else {
                // Abonnement
                const res = await addTrackedStore(domain, pageName || undefined);
                if (res.error) {
                    if (res.error === "Vous suivez déjà cette boutique.") {
                        setTracked(true); // C'était déjà fait niveau base de données
                        toast.success("Boutique déjà dans votre radar", { position: "bottom-center" });
                    } else {
                        toast.error(res.error, { position: "bottom-center" });
                    }
                } else {
                    setTracked(true);
                    toast.success(`${domain} ajouté à vos boutiques`, { position: "bottom-center", icon: "💎" });
                }
            }
        } catch (err) {
            toast.error("Erreur de connexion serveur", { position: "bottom-center" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleTrack}
            disabled={loading}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full transition-all border ${className} ${tracked
                ? "bg-orange-50 text-orange-600 border-orange-200"
                : "bg-white text-slate-500 border-slate-200 hover:border-orange-300 hover:text-orange-600 shadow-sm"
                }`}
        >
            {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : tracked ? (
                <Check className="w-3 h-3" strokeWidth={3} />
            ) : (
                <Plus className="w-3 h-3" strokeWidth={2.5} />
            )}
            {tracked ? "SUIVI" : "SUIVRE"}
        </button>
    );
}
