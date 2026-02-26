import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const APIFY_TOKEN = process.env.APIFY_TOKEN!;
const ACTOR_ID = "XtaWFhbtfxyzqrFmd"; // facebook-ads-library-scraper

// -- Helper functions for Background Processing --
async function upsertAd(ad: any) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/ads`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(ad),
    });
    if (!res.ok) {
        console.error(`❌ Supabase Insert Error [${res.status}]:`, await res.text());
        return false;
    }
    return true;
}

function trendScore(startedAt: string, hasVideo: boolean) {
    const ageDays = (Date.now() - new Date(startedAt).getTime()) / 86_400_000;
    let score = Math.max(0, 1 - ageDays / 90);
    if (hasVideo) score = Math.min(1, score + 0.15);
    return parseFloat(score.toFixed(3));
}

function mapItem(item: any) {
    const snap = item.snapshot || {};
    const videos = snap.videos || [];
    const images = snap.images || [];

    const pageName = snap.page_name || item.page_name || "Page inconnue";
    const body = snap.body?.text || snap.link_description || snap.title || "";
    const videoUrl = videos[0]?.video_hd_url || videos[0]?.video_sd_url || null;
    const imageUrl = images[0]?.resized_image_url || images[0]?.original_image_url || snap.page_profile_picture_url || null;
    const ctaLink = snap.link_url || null;
    const archiveId = String(item.ad_archive_id || item.collation_id || "");

    let startedAt = new Date().toISOString().split("T")[0];
    if (item.start_date) {
        try { startedAt = new Date(item.start_date * 1000).toISOString().split("T")[0]; } catch (_) { }
    }
    return { pageName, body, videoUrl, imageUrl, ctaLink, archiveId, startedAt };
}

// Background processing function - runs after response is sent
async function processRun(runId: string, limit: number, countryCode: string) {
    console.log(`[Background] 🔄 Attente de la fin du run Apify: ${runId}`);
    const start = Date.now();
    const timeoutMs = 5 * 60 * 1000;
    let datasetId = null;

    // 1. Poll Apify
    while (Date.now() - start < timeoutMs) {
        await new Promise((r) => setTimeout(r, 5000));
        const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
        const data = await res.json();
        const status = data.data?.status;
        console.log(`[Background] Run ${runId} Status: ${status}`);

        if (status === "SUCCEEDED") {
            datasetId = data.data.defaultDatasetId;
            break;
        }
        if (["FAILED", "ABORTED", "TIMED-OUT"].includes(status)) {
            console.error(`[Background] Run failed with status: ${status}`);
            return;
        }
    }

    if (!datasetId) {
        console.error("[Background] Timeout: Run took too long");
        return;
    }

    // 2. Fetch Dataset
    console.log(`[Background] 📦 Run finished, fetching dataset: ${datasetId}`);
    const dsRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&limit=200`);
    const items = await dsRes.json();
    console.log(`[Background] Found ${items.length} items`);

    // 3. Insert to Supabase
    let inserted = 0;
    for (const item of items.slice(0, limit)) {
        const raw = mapItem(item);
        if (raw.pageName === "Page inconnue" && !raw.body && !raw.videoUrl) continue;

        const record = {
            page_name: raw.pageName,
            ad_copy: raw.body || "(aucun texte)",
            cta_link: raw.ctaLink,
            video_url: raw.videoUrl,
            image_url: raw.imageUrl,
            thumbnail_url: raw.imageUrl,
            ad_archive_id: raw.archiveId,
            platform: "facebook",
            is_active: true,
            started_at: raw.startedAt,
            trend_score: trendScore(raw.startedAt, !!raw.videoUrl),
            // Note: Since the Apify scraper is already locked to African countries
            // in the URL, all these ads are inherently from the African market.
        };

        if (await upsertAd(record)) inserted++;
    }
    console.log(`[Background] ✅ Fin ! ${inserted} pubs insérées.`);
}

export async function POST(req: NextRequest) {
    try {
        const { keyword, country = "TD", limit = 30 } = await req.json();

        if (!APIFY_TOKEN) throw new Error("Missing APIFY_TOKEN");

        console.log(`[API] Lancement Apify pour: "${keyword}" | Pays: ${country} | Limite: ${limit}`);

        // Start Apify Run
        const searchUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${country}&q=${encodeURIComponent(keyword)}&media_type=all`;
        const res = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls: [{ url: searchUrl }], resultsLimit: limit }),
        });

        if (!res.ok) {
            throw new Error(`Apify start error ${res.status}: ${await res.text()}`);
        }

        const data = await res.json();
        const runId = data.data.id;

        // Start background processing without awaiting it!
        processRun(runId, limit, country).catch(err => console.error("[Background Error]", err));

        return NextResponse.json({ runId, status: "started" }, { status: 200 });

    } catch (err: unknown) {
        console.error("[API Error]", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erreur interne" },
            { status: 500 }
        );
    }
}
