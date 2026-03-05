"use server";

import * as cheerio from "cheerio";

export async function fetchStoreMetadata(domain: string) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        let targetUrl = domain.startsWith("http") ? domain : `https://${domain}`;

        const res = await fetch(targetUrl, {
            redirect: 'follow',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        clearTimeout(timeoutId);

        const html = await res.text();
        const $ = cheerio.load(html);

        let theme = "Thème personnalisé";
        let platform = "Autre";

        // 1. Détection Platform & Theme
        if (html.includes("Shopify.theme") || html.includes("shopify.com") || html.includes("cdn.shopify.com")) {
            platform = "Shopify";
            // Extraire Shopify.theme = {"name":"Dawn",...}
            const themeMatch = html.match(/Shopify\.theme\s*=\s*\{[^}]*?["']?name["']?\s*:\s*["']([^"']+)["']/i) ||
                html.match(/theme_name:\s*["']([^"']+)["']/i);

            if (themeMatch && themeMatch[1]) {
                theme = themeMatch[1];
            } else if (html.includes("debutify")) {
                theme = "Debutify";
            } else {
                theme = "Thème Shopify";
            }
        } else if (html.includes("youcan.shop") || html.includes("youcan_") || html.includes("cdn.youcan.shop")) {
            platform = "YouCan";
            if (html.includes("theme-modern")) theme = "Modern";
            else if (html.includes("theme-standard")) theme = "Standard";
            else theme = "Thème YouCan";
        } else if (html.includes("woocommerce") || html.includes("wp-content/plugins/woocommerce")) {
            platform = "WooCommerce";
            theme = "Thème WordPress";
        }

        // 2. Détection Apps & Tracking via les scripts actifs
        const apps: string[] = [];

        // Analyse des balises script
        $('script').each((_, el) => {
            const src = $(el).attr('src') || "";
            const content = $(el).html() || "";
            const combined = (src + content).toLowerCase();

            if ((combined.includes("klaviyo.com") || combined.includes("klaviyo.js")) && !apps.includes("Klaviyo")) apps.push("Klaviyo");
            if ((combined.includes("connect.facebook.net") || combined.includes("fbq('init'")) && !apps.includes("Meta Pixel")) apps.push("Meta Pixel");
            if ((combined.includes("googletagmanager.com") || combined.includes("gtag/js")) && !apps.includes("Google Analytics")) apps.push("Google Analytics");
            if ((combined.includes("tiktok.com") || combined.includes("ttq.load")) && !apps.includes("TikTok Pixel")) apps.push("TikTok Pixel");
            if ((combined.includes("snap.licdn.com") || combined.includes("snaptr(")) && !apps.includes("Snapchat Pixel")) apps.push("Snapchat Pixel");
            if (combined.includes("hotjar.com") && !apps.includes("Hotjar")) apps.push("Hotjar");
            if (combined.includes("tawk.to") && !apps.includes("Tawk.to")) apps.push("Tawk.to");
            if (combined.includes("widebundle") && !apps.includes("WideBundle")) apps.push("WideBundle");
            if (combined.includes("loox.io") && !apps.includes("Loox Reviews")) apps.push("Loox Reviews");
        });

        // Analyse des liens (WhatsApp)
        $('a').each((_, el) => {
            const href = $(el).attr('href') || "";
            if ((href.includes("api.whatsapp.com") || href.includes("wa.me")) && !apps.includes("WhatsApp")) {
                apps.push("WhatsApp");
            }
        });

        // Détection Paiements (si non trouvés dans scripts)
        if (html.includes("stripe.com") && !apps.includes("Stripe")) apps.push("Stripe");
        if (html.includes("paypal.com") && !apps.includes("PayPal")) apps.push("PayPal");

        return { theme, apps, platform };
    } catch (e) {
        console.error("Deep analysis failed for", domain, e);
        return { theme: "Inconnu", apps: [], platform: "Inconnu" };
    }
}
