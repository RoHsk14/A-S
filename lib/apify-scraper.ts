// lib/apify-scraper.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xgxwasirqsetnnjstims.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key_for_build';
const APIFY_TOKEN = process.env.APIFY_API_TOKEN || '';
const ACTOR_ID = 'XtaWFhbtfxyzqrFmd'; // facebook-ads-library-scraper

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

    const pageName = snap.page_name || item.page_name || 'Page inconnue';
    const body = snap.body?.text || snap.link_description || snap.title || '';
    const videoUrl = videos[0]?.video_hd_url || videos[0]?.video_sd_url || null;
    const imageUrl = images[0]?.resized_image_url || images[0]?.original_image_url || snap.page_profile_picture_url || null;
    const ctaLink = snap.link_url || null;
    const archiveId = String(item.ad_archive_id || item.collation_id || '');

    let startedAt = new Date().toISOString().split('T')[0];
    if (item.start_date) {
        try { startedAt = new Date(item.start_date * 1000).toISOString().split('T')[0]; } catch (_) { }
    }

    return { pageName, body, videoUrl, imageUrl, ctaLink, archiveId, startedAt };
}

async function startApifyRun(keyword: string, country: string, limit: number) {
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
    return data.data.id;
}

async function waitForRun(runId: string, logCallback: (msg: string) => void, timeoutMs = 5 * 60 * 1000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        await new Promise(r => setTimeout(r, 5000));
        const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
        const data = await res.json();
        const status = data.data?.status;
        logCallback(`  ⏳ Status Apify: ${status}`);
        if (status === 'SUCCEEDED') return data.data.defaultDatasetId;
        if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
            throw new Error(`Run Apify terminé avec statut: ${status}`);
        }
    }
    throw new Error('Timeout: le run Apify a pris plus de 5 min');
}

async function fetchDataset(datasetId: string) {
    const res = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&limit=200`
    );
    if (!res.ok) throw new Error(`Dataset fetch error: ${res.status}`);
    return res.json();
}

/**
 * Main scraper function, adapted for API route usage.
 */
export async function runScraper(
    keyword: string,
    limit: number,
    country: string,
    platform: string,
    logCallback: (msg: string) => void
) {
    logCallback(`\n🕵️  AFRO SPY – "${keyword}" | ${country} | max ${limit} pubs\n`);
    logCallback(`🚀 Lancement du run Apify...`);

    const runId = await startApifyRun(keyword, country, limit);
    logCallback(`  ✅ Run ID: ${runId}`);

    logCallback(`\n🔄 Attente de la fin du run (max 5 min)...`);
    const datasetId = await waitForRun(runId, logCallback);
    logCallback(`  ✅ Dataset ID: ${datasetId}`);

    logCallback(`\n📦 Récupération des résultats...`);
    const items = await fetchDataset(datasetId);
    logCallback(`  → ${items.length} items récupérés depuis Apify\n`);

    if (items.length === 0) {
        logCallback('⚠️  Aucun résultat — essaie un autre mot-clé ou pays.');
        return;
    }

    let inserted = 0, skipped = 0;

    for (const item of items.slice(0, limit)) {
        const raw = mapItem(item);

        logCallback(`  🔍 "${raw.pageName}" | body:${raw.body.length}c | video:${!!raw.videoUrl}`);

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
            platform: platform || 'facebook',
            is_active: true,
            started_at: raw.startedAt,
            trend_score: trendScore(raw.startedAt, !!raw.videoUrl),
        };

        const { error } = await supabase.from('ads').upsert(record, { onConflict: 'page_name,ad_copy' });

        if (!error) {
            inserted++;
            logCallback(`  🚀 [${inserted}] "${record.page_name}" — score: ${record.trend_score}`);
        } else {
            logCallback(`  ❌ Erreur Supabase pour "${record.page_name}": ${error.message}`);
        }
    }

    logCallback(`\n📊 Résumé : ${inserted} insérées, ${skipped} ignorées\n`);
    logCallback(`✅ Voir les run Apify : https://console.apify.com/actors/${ACTOR_ID}/runs/${runId}`);
}
