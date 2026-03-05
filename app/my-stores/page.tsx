import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Store } from "lucide-react";
import { TrackNewStoreForm } from "@/components/my-stores/TrackNewStoreForm";
import { StoreAnalysisCard } from "@/components/my-stores/StoreAnalysisCard";

export default async function MyStoresPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch tracked stores for the user
    // Now fetching the enriched data
    const { data: trackedStores, error } = await supabase
        .from("tracked_stores")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    // Fetch real-time active ad count for each store
    const storesWithCounts = await Promise.all((trackedStores || []).map(async (store) => {
        const { count } = await supabase
            .from("ads")
            .select('*', { count: 'exact', head: true })
            .ilike('cta_link', `%${store.store_domain}%`);

        return {
            ...store,
            ads_count: count || 0
        };
    }));

    return (
        <main className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 text-slate-900 overflow-hidden">
            <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🏪</span>
                    <h1 className="text-2xl font-bold tracking-tight">Mes Boutiques</h1>
                </div>
                <p className="text-sm text-slate-500 mb-8 ml-10">
                    Surveillez vos concurrents et analysez leur infrastructure technologique et volume de trafic.
                </p>

                {/* Add New Store Input (Client Component) */}
                <div className="mb-10">
                    <TrackNewStoreForm />
                </div>

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Boutiques sous surveillance</h2>
                    <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">{trackedStores?.length || 0} trackées</span>
                </div>

                {/* Store Grid */}
                {(!storesWithCounts || storesWithCounts.length === 0) ? (
                    <div className="bg-white border text-center border-slate-200 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center mb-4">
                            <Store className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">Aucune boutique suivie</h3>
                        <p className="text-slate-500 text-sm max-w-sm mb-6">
                            Ajoutez un nom de domaine ci-dessus ou cliquez sur "Suivre" depuis une publicité du flux Winners.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {storesWithCounts.map((store) => (
                            <StoreAnalysisCard key={store.id} store={store as any} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
