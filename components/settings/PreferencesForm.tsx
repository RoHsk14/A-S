"use client";

import { useState, useTransition } from "react";
import { updateMarketPreferences } from "@/app/actions/preferences";
import { Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const AFRICAN_MARKETS = [
    { id: "SN", label: "Sénégal" },
    { id: "CI", label: "Côte d'Ivoire" },
    { id: "CM", label: "Cameroun" },
    { id: "CD", label: "RD Congo" },
    { id: "ML", label: "Mali" },
    { id: "BF", label: "Burkina Faso" },
    { id: "GN", label: "Guinée" },
    { id: "TG", label: "Togo" },
    { id: "BJ", label: "Bénin" },
    { id: "GA", label: "Gabon" },
    { id: "CG", label: "Congo" },
    { id: "MA", label: "Maroc" },
    { id: "DZ", label: "Algérie" },
    { id: "TN", label: "Tunisie" },
];

export function PreferencesForm({ initialPreferences }: { initialPreferences: string[] }) {
    const [selected, setSelected] = useState<string[]>(initialPreferences || []);
    const [isPending, startTransition] = useTransition();

    const toggleMarket = (id: string) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateMarketPreferences(selected);
                toast.success("Préférences sauvegardées");
            } catch (err: any) {
                toast.error("Erreur de sauvegarde");
            }
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-1">Marchés Cibles</h2>
            <p className="text-sm text-slate-500 mb-6">
                Sélectionnez les pays d'Afrique qui vous intéressent. Votre flux Winners principal sera filtré selon ces choix.
                Si aucun n'est sélectionné, tous les marchés seront affichés.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {AFRICAN_MARKETS.map(market => {
                    const isSelected = selected.includes(market.id);
                    return (
                        <button
                            key={market.id}
                            onClick={() => toggleMarket(market.id)}
                            className={`flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition-all ${isSelected
                                ? "bg-orange-50 border-orange-200 text-orange-900"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                        >
                            <span>{market.label}</span>
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${isSelected ? "bg-orange-600 text-white" : "bg-slate-100 text-transparent border border-slate-200"
                                }`}>
                                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Enregistrer mes marchés
                </button>
            </div>
        </div>
    );
}
