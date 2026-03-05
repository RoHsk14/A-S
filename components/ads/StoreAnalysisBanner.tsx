import { Sparkles } from "lucide-react";

export async function StoreAnalysisBanner({ storeDomain, adCopies }: { storeDomain: string, adCopies: string[] }) {
    if (!storeDomain) return null;

    // Simulate OpenAI Network Request
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulated OpenAI response based on amount of ads or keyword presence
    const fullText = adCopies.join(" ").toLowerCase();
    let strategy = "Cette boutique semble diversifier ses offres sans angle marketing agressif particulier.";

    if (fullText.includes("gratuit") || fullText.includes("free") || fullText.includes("offert")) {
        strategy = "Cette boutique mise tout sur l'acquisition agressive avec des offres de livraison gratuite et des cadeaux pour déclencher l'achat impulsif.";
    } else if (fullText.includes("urgent") || fullText.includes("stock") || fullText.includes("vite")) {
        strategy = "Leur stratégie repose fortement sur le FOMO (peur de rater une occasion), en jouant sur l'urgence et des stocks limités fictifs.";
    } else if (adCopies.length > 5) {
        strategy = "Avec une forte densité publicitaire, cette boutique teste un volume très élevé de créatifs pour trouver le bon angle rapidement.";
    }

    return (
        <div className="mb-6 mx-6 sm:mx-9 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <Sparkles className="w-24 h-24 text-white" />
            </div>

            <div className="flex items-center gap-2 mb-3 relative z-10">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                    A-S Intelligence <span className="text-slate-400 font-medium">· Analyse Tactique</span>
                </h3>
            </div>

            <div className="relative z-10">
                <p className="text-slate-200 text-sm md:text-base leading-relaxed font-medium">
                    <span className="text-orange-400 font-bold">{storeDomain}</span> : {strategy}
                </p>
                <div className="mt-3 inline-block bg-white/10 backdrop-blur px-3 py-1 rounded-full border border-white/5">
                    <p className="text-[10px] text-slate-300 font-semibold tracking-wider uppercase">
                        Généré par IA à partir de {adCopies.length} publicités
                    </p>
                </div>
            </div>
        </div>
    );
}
