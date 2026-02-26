// supabase/functions/smart-task/index.ts
// Edge Function Afro Spy — Lance un acteur Apify pour scraper la Facebook Ad Library
// Déploiement: supabase functions deploy smart-task

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Config ──────────────────────────────────────────────────
const APIFY_TOKEN = Deno.env.get("APIFY_TOKEN") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Acteur Apify pour la Facebook Ad Library
// Alternatives valides: "apify~facebook-ads-scraper", "enovatech~facebook-ad-library-scraper"
const ACTOR_ID = "apify~facebook-ads-scraper";

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
};

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: CORS });
    }

    try {
        // ── Parse body ───────────────────────────────────────
        const { keyword, country = "FR", limit = 20, platform = "facebook" } = await req.json();

        if (!keyword) {
            return new Response(JSON.stringify({ error: "keyword is required" }), {
                status: 400, headers: CORS,
            });
        }

        if (!APIFY_TOKEN) {
            return new Response(JSON.stringify({ error: "APIFY_TOKEN manquant dans les secrets Supabase" }), {
                status: 500, headers: CORS,
            });
        }

        console.log(`[smart-task] Demande Scrape: "${keyword}" | Pays reçu: ${country}`);

        const africanCountries = ['MA', 'DZ', 'TN', 'EG', 'SN', 'CI', 'CM', 'GA', 'TD', 'CD', 'BJ', 'TG', 'NE', 'BF', 'ML'];
        // Force African country fallback
        const targetCountry = africanCountries.includes(country) ? country : 'TD';
        // Force max limit
        const strictLimit = 30;

        console.log(`[smart-task] Exécution Scrape: "${keyword}" | Pays final: ${targetCountry} | Limit stricte: ${strictLimit}`);

        // ── Lancer l'acteur Apify ────────────────────────────
        const apifyRes = await fetch(
            `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    searchQuery: keyword,
                    country: targetCountry,
                    maxAds: strictLimit,
                    activeStatus: "active",
                }),
            }
        );


        if (!apifyRes.ok) {
            const err = await apifyRes.text();
            console.error("[smart-task] Apify error:", err);
            return new Response(JSON.stringify({ error: `Apify error: ${apifyRes.status}`, detail: err }), {
                status: 502, headers: CORS,
            });
        }

        const apifyData = await apifyRes.json();
        const runId = apifyData?.data?.id;

        console.log(`[smart-task] Run ID: ${runId}`);

        // ── Optionnel : enregistrer le run dans Supabase ─────
        if (SUPABASE_URL && SUPABASE_KEY && runId) {
            const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
            await supabase.from("scraper_runs").upsert({
                run_id: runId,
                keyword,
                country,
                limit,
                platform,
                status: "running",
                started_at: new Date().toISOString(),
            }).select();
        }

        return new Response(
            JSON.stringify({ runId, keyword, country, limit, status: "running" }),
            { status: 200, headers: CORS }
        );

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        console.error("[smart-task] Erreur:", message);
        return new Response(JSON.stringify({ error: message }), {
            status: 500, headers: CORS,
        });
    }
});
