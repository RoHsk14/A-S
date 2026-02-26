/**
 * Afro Spy – Scraper Apify v4
 * ─── Utilise directement l'API Apify (actor: facebook-ads-library-scraper) ───
 *
 * Usage:
 *   node scraper.js "mot-clé" [limit=20] [country=FR]
 *
 * Flow:
 *   1. Lance un run Apify  →  2. Poll jusqu'à SUCCEEDED  →  3. Insère dans Supabase
 */

// ── Config ──────────────────────────────────────────────────
require("dotenv").config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xgxwasirqsetnnjstims.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = 'XtaWFhbtfxyzqrFmd'; // facebook-ads-library-scraper

// ── Helpers Supabase ────────────────────────────────────────
async function upsertAd(ad) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/ads`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(ad),
    });
    if (!res.ok) {
        const err = await res.text();
        console.error(`  ❌ Supabase [${res.status}]:`, err.slice(0, 200));
        return false;
    }
    return true;
}

// ── Trend score ─────────────────────────────────────────────
function trendScore(startedAt, hasVideo) {
    const ageDays = (Date.now() - new Date(startedAt).getTime()) / 86_400_000;
    let score = Math.max(0, 1 - ageDays / 90);
    if (hasVideo) score = Math.min(1, score + 0.15);
    return parseFloat(score.toFixed(3));
}

// ── Mapper un item Apify → record Supabase ──────────────────
function mapItem(item) {
    const snap = item.snapshot || {};
    const videos = snap.videos || [];
    const images = snap.images || [];

    const pageName = snap.page_name || item.page_name || 'Page inconnue';
    const body = snap.body?.text || snap.link_description || snap.title || '';
    const videoUrl = videos[0]?.video_hd_url || videos[0]?.video_sd_url || null;
    const imageUrl = images[0]?.resized_image_url || images[0]?.original_image_url
        || snap.page_profile_picture_url || null;
    const ctaLink = snap.link_url || null;
    const archiveId = String(item.ad_archive_id || item.collation_id || '');

    let startedAt = new Date().toISOString().split('T')[0];
    if (item.start_date) {
        try { startedAt = new Date(item.start_date * 1000).toISOString().split('T')[0]; } catch (_) { }
    }

    return { pageName, body, videoUrl, imageUrl, ctaLink, archiveId, startedAt };
}

// ── Apify: lancer un run ────────────────────────────────────
async function startApifyRun(keyword, country, limit) {
    // L'acteur attend une liste d'URLs de la FB Ad Library
    const searchUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${country}&q=${encodeURIComponent(keyword)}&media_type=all`;

    const res = await fetch(
        `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                urls: [{ url: searchUrl }],
                resultsLimit: limit,
            }),
        }
    );
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Apify start error ${res.status}: ${err.slice(0, 200)}`);
    }
    const data = await res.json();
    return data.data.id; // runId
}

// ── Apify: poll jusqu'à SUCCEEDED ──────────────────────────
async function waitForRun(runId, timeoutMs = 5 * 60 * 1000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        await new Promise(r => setTimeout(r, 5000)); // poll toutes les 5s
        const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
        const data = await res.json();
        const status = data.data?.status;
        console.log(`  ⏳ Status Apify: ${status}`);
        if (status === 'SUCCEEDED') return data.data.defaultDatasetId;
        if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
            throw new Error(`Run Apify terminé avec statut: ${status}`);
        }
    }
    throw new Error('Timeout: le run Apify a pris plus de 5 min');
}

// ── Apify: récupérer les items du dataset ───────────────────
async function fetchDataset(datasetId) {
    const res = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&limit=200`
    );
    if (!res.ok) throw new Error(`Dataset fetch error: ${res.status}`);
    return res.json();
}

// ── Scraper principal ───────────────────────────────────────
async function runScraper(keyword, limit = 20, country = 'FR') {
    console.log(`\n🕵️  AFRO SPY – "${keyword}" | ${country} | max ${limit} pubs\n`);
    console.log(`🚀 Lancement du run Apify...`);

    // 1. Lancer le run
    const runId = await startApifyRun(keyword, country, limit);
    console.log(`  ✅ Run ID: ${runId}`);

    // 2. Attendre la fin
    console.log(`\n🔄 Attente de la fin du run (max 5 min)...`);
    const datasetId = await waitForRun(runId);
    console.log(`  ✅ Dataset ID: ${datasetId}`);

    // 3. Récupérer les items
    console.log(`\n📦 Récupération des résultats...`);
    const items = await fetchDataset(datasetId);
    console.log(`  → ${items.length} items récupérés depuis Apify\n`);

    if (items.length === 0) {
        console.log('⚠️  Aucun résultat — essaie un autre mot-clé ou pays.');
        return;
    }

    // 4. Insérer dans Supabase
    let inserted = 0, skipped = 0;

    for (const item of items.slice(0, limit)) {
        const raw = mapItem(item);

        console.log(`  🔍 "${raw.pageName}" | body:${raw.body.length}c | video:${!!raw.videoUrl}`);

        if (raw.pageName === 'Page inconnue' && !raw.body && !raw.videoUrl) {
            skipped++;
            continue;
        }

        const record = {
            page_name: raw.pageName,
            ad_copy: raw.body || '(aucun texte)',
            cta_link: raw.ctaLink,
            video_url: raw.videoUrl,
            image_url: raw.imageUrl,
            thumbnail_url: raw.imageUrl,
            ad_archive_id: raw.archiveId,
            platform: process.env.PLATFORM_OVERRIDE || 'facebook',
            is_active: true,
            started_at: raw.startedAt,
            trend_score: trendScore(raw.startedAt, !!raw.videoUrl),
        };

        const ok = await upsertAd(record);
        if (ok) {
            inserted++;
            console.log(`  🚀 [${inserted}] "${record.page_name}" — score: ${record.trend_score}`);
        }
    }

    console.log(`\n📊 Résumé : ${inserted} insérées, ${skipped} ignorées\n`);
    console.log(`� Voir les run Apify : https://console.apify.com/actors/${ACTOR_ID}/runs/${runId}`);
}

// ── Point d'entrée ──────────────────────────────────────────
const keyword = process.argv[2] || 'livraison gratuite';
const limit = parseInt(process.argv[3] || '20', 10);
const country = process.argv[4] || 'FR';
runScraper(keyword, limit, country);