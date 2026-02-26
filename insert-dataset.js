/**
 * Insérer les données d'un dataset Apify existant dans Supabase
 * Usage: node insert-dataset.js <datasetId>
 */

require("dotenv").config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xgxwasirqsetnnjstims.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

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
    if (!res.ok) { console.error('❌ Supabase:', (await res.text()).slice(0, 200)); return false; }
    return true;
}

function trendScore(startedAt, hasVideo) {
    const days = (Date.now() - new Date(startedAt).getTime()) / 86_400_000;
    let s = Math.max(0, 1 - days / 90);
    if (hasVideo) s = Math.min(1, s + 0.15);
    return parseFloat(s.toFixed(3));
}

async function main() {
    const datasetId = process.argv[2];
    if (!datasetId) { console.log('Usage: node insert-dataset.js <datasetId>'); process.exit(1); }

    console.log(`\n📦 Lecture du dataset ${datasetId}...`);
    const res = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&limit=200`);
    const items = await res.json();
    console.log(`→ ${items.length} items\n`);

    let ok = 0, skip = 0;
    for (const item of items) {
        const snap = item.snapshot || {};
        const videos = snap.videos || [];
        const images = snap.images || [];

        const pageName = snap.page_name || item.page_name || 'Page inconnue';
        const body = snap.body?.text || snap.link_description || snap.title || '';
        const videoUrl = videos[0]?.video_hd_url || videos[0]?.video_sd_url || null;
        const imageUrl = images[0]?.resized_image_url || snap.page_profile_picture_url || null;
        const ctaLink = snap.link_url || null;
        const archId = String(item.ad_archive_id || item.collation_id || '');

        let startedAt = new Date().toISOString().split('T')[0];
        if (item.start_date) {
            try { startedAt = new Date(item.start_date * 1000).toISOString().split('T')[0]; } catch (_) { }
        }

        if (pageName === 'Page inconnue' && !body && !videoUrl) { skip++; continue; }

        const inserted = await upsertAd({
            page_name: pageName,
            ad_copy: body || '(aucun texte)',
            cta_link: ctaLink,
            video_url: videoUrl,
            image_url: imageUrl,
            thumbnail_url: imageUrl,
            ad_archive_id: archId,
            platform: 'facebook',
            is_active: true,
            started_at: startedAt,
            trend_score: trendScore(startedAt, !!videoUrl),
        });
        if (inserted) { ok++; console.log(`  ✅ [${ok}] "${pageName}"`); }
    }

    console.log(`\n📊 Résumé: ${ok} insérées, ${skip} ignorées`);
}

main().catch(console.error);
