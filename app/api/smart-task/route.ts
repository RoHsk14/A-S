import { NextRequest, NextResponse } from "next/server";
import { runScraper } from "@/lib/apify-scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Allow up to 5 minutes on Vercel deployment (Requires Pro, but works locally perfectly)

export async function POST(req: NextRequest) {
    try {
        const { keyword, country = "TD", limit = 30, platform = "facebook" } = await req.json();

        console.log(`[API] Lancement synchrone Apify pour: "${keyword}" | Pays: ${country} | Limite: ${limit}`);

        // Await the entire scraping and DB insertion process directly
        // This takes up to 5 minutes but uses the unified logic
        const result = await runScraper(keyword, limit, country, platform, console.log);

        if (!result) {
            return NextResponse.json({ error: "No results generated" }, { status: 400 });
        }

        return NextResponse.json({
            runId: result.runId,
            status: "finished",
            inserted: result.inserted,
            skipped: result.skipped
        }, { status: 200 });

    } catch (err: unknown) {
        console.error("[API Error]", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erreur interne" },
            { status: 500 }
        );
    }
}
