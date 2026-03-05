"use client";

import { useState } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { addTrackedStore } from "@/app/actions/tracked-stores";
import toast from "react-hot-toast";

export function TrackNewStoreForm() {
    const [domain, setDomain] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain.trim()) return;

        setLoading(true);
        const res = await addTrackedStore(domain);
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Boutique ajoutée au radar !");
            setDomain("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Coller l'URL d'une boutique (ex: mycompetitor.com)"
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm"
                    disabled={loading}
                />
            </div>
            <button
                type="submit"
                disabled={loading || !domain.trim()}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-xl"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Suivre
            </button>
        </form>
    );
}
