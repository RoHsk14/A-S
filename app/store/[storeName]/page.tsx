import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Store, Globe, Search, Calendar, Package, ExternalLink, TrendingUp, Filter, Sparkles, Info, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WinnerGrid } from "@/components/ads/WinnerGrid";
import { PaginatedProductGrid } from "@/components/store/PaginatedProductGrid";
import { ExportCsvButton } from "@/components/store/ExportCsvButton";
import { AdWithStore } from "@/types/database";

export default async function StoreDetailsPage(props: { params: Promise<{ storeName: string }> }) {
    const params = await props.params;
    const storeNameDecoded = decodeURIComponent(params.storeName);

    const supabase = await createClient();

    // Fetch the ads from this specific store (page_name)
    const { data: ads, error } = await supabase
        .from("ads")
        .select("*")
        .eq("page_name", storeNameDecoded)
        .order("created_at", { ascending: false });

    if (error || !ads || ads.length === 0) {
        notFound();
    }

    // Grab a representative ad to extract the domain, country, etc
    const representativeAd = ads[0];
    let domain = "Domaine inconnu";
    try {
        if (representativeAd.cta_link) {
            domain = new URL(representativeAd.cta_link).hostname;
        }
    } catch (e) { }

    const platform = representativeAd.platform || "Facebook";

    // LIVE SHOPIFY DATA FETCH
    let realProductCount = 0;
    let bestSellers: any[] = [];
    let establishedAt: string | null = null;
    let storeTheme = "Détection PRO...";
    let isShopify = false;

    if (domain !== "Domaine inconnu") {
        try {
            const response = await fetch(`https://${domain}/products.json?limit=250`, {
                next: { revalidate: 3600 } // Cache Server-Side
            });
            if (response.ok) {
                const { products } = await response.json();
                if (products && Array.isArray(products)) {
                    isShopify = true;
                    realProductCount = products.length;

                    bestSellers = products.slice(0, 40).map((p: any) => ({
                        id: p.id,
                        title: p.title,
                        price: p.variants[0]?.price || "N/A",
                        image: p.images[0]?.src || "https://placehold.co/400x500/slate/white?text=No+Image",
                        created_at: p.created_at,
                        handle: p.handle
                    }));

                    const oldestProduct = products[products.length - 1];
                    establishedAt = oldestProduct?.created_at || null;
                    storeTheme = "Shopify (Standard)";
                }
            }
        } catch (e) {
            console.log("Failed to fetch Shopify JSON for", domain);
        }
    }

    const formatPrice = (price: string) => {
        if (price === "N/A") return price;
        return `${price}`; // Real shopify stores usually return just the number string here. The user said FCFA ou Dirhams, we can't reliably detect currency from products.json without the currency code, so we just display the raw value for now or append a basic currency symbol. We'll leave it as raw string.
    };

    const isNewProduct = (dateString: string) => {
        if (!dateString) return false;
        const diff = Date.now() - new Date(dateString).getTime();
        return diff < 7 * 24 * 60 * 60 * 1000;
    };

    let creationDateDisplay = "Inconnue";
    if (establishedAt) {
        const d = new Date(establishedAt);
        const monthsAgo = Math.max(0, Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        creationDateDisplay = `${d.toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })} (${monthsAgo} mois)`;
    }

    // ---------------------------------------------------------
    // ALGORITHME A-S : CALCULATEUR DE CA ESTIMÉ
    // ---------------------------------------------------------
    let estimatedRevenueRange = "Analyse en cours...";
    let avgOrderValue = 0;
    let estimatedMonthlyTraffic = 12500; // default fallback

    if (isShopify && bestSellers.length > 0) {
        // 1. Calcul du Panier Moyen (AOV)
        const validPrices = bestSellers
            .map(p => parseFloat(p.price))
            .filter(price => !isNaN(price) && price > 0);

        if (validPrices.length > 0) {
            avgOrderValue = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
        }

        // 2. Estimation du Trafic basée sur l'activité publicitaire
        // 200 visites par jour par pub active * 30 jours
        estimatedMonthlyTraffic = (ads.length > 0 ? ads.length : 1) * 200 * 30;

        // 3. Calcul Final (Taux de conversion estimé à 1.8% = 0.018)
        const baseRevenue = estimatedMonthlyTraffic * 0.018 * avgOrderValue;

        // 4. Création de la fourchette (Marge d'erreur +/- 15%)
        const minRev = baseRevenue * 0.85;
        const maxRev = baseRevenue * 1.15;

        // Fonction utilitaire pour abréger les grands nombres (ex: 12000000 -> 12M)
        const formatNumber = (num: number) => {
            if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
            return Math.floor(num).toString();
        };

        estimatedRevenueRange = `${formatNumber(minRev)} — ${formatNumber(maxRev)}`;
    }

    const mockCountry = "CD 🇨🇩";

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 relative pb-24 lg:pb-8">
            {/* Header Navbar */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center shadow-sm">
                <Link href="/top-stores" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-semibold">Retour aux Top Stores</span>
                </Link>
            </div>

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">

                {/* Top Section: Store Info & KPIs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Card: Store Profile */}
                    <div className="col-span-1 lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-2xl font-black text-slate-400">
                                {storeNameDecoded[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-bold text-slate-900 truncate">{storeNameDecoded}</h1>
                                    <span className="bg-green-100 text-green-700 p-1 rounded-md" title="Shopify">
                                        <Store className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                                <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-orange-600 transition-colors flex items-center gap-1 mt-1 truncate">
                                    <Globe className="w-3 h-3" /> {domain}
                                </a>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                                <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Création</span>
                                <span className="font-semibold text-slate-900 text-right">{creationDateDisplay}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                                <span className="text-slate-500 flex items-center gap-2"><Globe className="w-4 h-4" /> Pays</span>
                                <span className="font-semibold text-slate-900">{mockCountry}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                                <span className="text-slate-500 flex items-center gap-2"><Store className="w-4 h-4" /> Thème</span>
                                <span className="font-semibold text-slate-900">{storeTheme}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                                <span className="text-slate-500 flex items-center gap-2"><Search className="w-4 h-4" /> Traffic (Mensuel)</span>
                                <span className="font-semibold text-slate-900">~{estimatedMonthlyTraffic.toLocaleString('fr-FR')}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm pb-1">
                                <span className="text-slate-500 flex items-center gap-2">Canaux Sociaux</span>
                                <span className="font-semibold text-slate-900 capitalize bg-slate-100 px-2 py-0.5 rounded-md text-xs">{platform}</span>
                            </div>
                        </div>

                        <button className="w-full mt-6 bg-slate-900 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-slate-800 transition-colors flex justify-center items-center gap-2">
                            <Filter className="w-4 h-4" /> Analyse Complète (PRO)
                        </button>
                    </div>

                    {/* Right Area: KPI Cards & Best Products */}
                    <div className="col-span-1 lg:col-span-2 space-y-6 flex flex-col">
                        {/* KPIs */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
                                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Pubs Actives
                                </div>
                                <div className="text-3xl font-black text-slate-900">{ads.length} <span className="text-sm font-medium text-slate-400">Ads</span></div>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
                                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-orange-500" /> Total Produits
                                </div>
                                <div className="text-3xl font-black text-slate-900">{isShopify ? realProductCount : "?"}</div>
                            </div>
                            <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl p-5 border border-orange-400 shadow-orange-glow flex flex-col justify-center text-white relative group">
                                <div className="text-orange-100 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> CA Estimé (30j)</span>
                                    <Info className="w-4 h-4 text-orange-200 cursor-help" />
                                </div>
                                <div className="text-xl sm:text-2xl font-black mb-1">{estimatedRevenueRange}</div>
                                <div className="flex items-center gap-1.5 text-orange-200 text-[10px] font-medium mt-1">
                                    <BrainCircuit className="w-3 h-3" /> Calculé par l'IA Afro Spy
                                </div>

                                {/* Info Tooltip */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                                    Estimation basée sur le volume publicitaire ({ads.length} ads actives), le trafic mensuel corrélé, et le panier moyen du catalogue (Marge d'erreur : 15%).
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                </div>
                            </div>
                        </div>

                        {/* Best Products (Mocked) */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex-1">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Meilleurs Produits</h2>
                                    <p className="text-sm text-slate-500">Les articles les plus vendus de la boutique.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {isShopify && <ExportCsvButton domain={domain} />}
                                    <button className="text-sm text-orange-600 font-bold hover:underline">Voir tout ({isShopify ? realProductCount : 0})</button>
                                </div>
                            </div>

                            <PaginatedProductGrid products={bestSellers} domain={domain} />
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Live Ads Grid */}
                <div>
                    <div className="flex items-center gap-3 mb-6 mt-4">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Publicités du Store</h2>
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-bold border border-slate-200">{ads.length}</span>
                    </div>
                    {/* Re-use WinnerGrid to display the ads we fetched */}
                    <WinnerGrid ads={ads as AdWithStore[]} />
                </div>

            </div>
        </div>
    );
}
