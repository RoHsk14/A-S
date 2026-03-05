"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- Mock API Integrations ---
async function fetchWappalyzer(domain: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate detection logic
    const isShopify = domain.includes("shopify") || Math.random() > 0.4;
    return {
        platform: isShopify ? "Shopify" : "YouCan",
        technologies: isShopify
            ? ["Shopify", "Klaviyo", "Meta Pixel", "Hotjar", "Stripe"]
            : ["YouCan", "Google Analytics", "TikTok Pixel", "PayPal"]
    };
}

async function fetchSimilarWeb(domain: string) {
    await new Promise(resolve => setTimeout(resolve, 600));
    // Simulate traffic between 10k and 2.5m
    const visits = Math.floor(Math.random() * 2500000) + 10000;
    return { visits };
}

export async function addTrackedStore(storeDomain: string, pageName?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Vous devez être connecté pour suivre une boutique." };
    }

    // Clean up domain if user pastes full URL
    let cleanDomain = storeDomain.trim().toLowerCase();
    try {
        if (cleanDomain.startsWith("http")) {
            const url = new URL(cleanDomain);
            cleanDomain = url.hostname;
        }
    } catch (e) {
        // Validation handled below
    }

    if (!cleanDomain || !cleanDomain.includes(".")) {
        return { error: "Veuillez entrer un nom de domaine valide (ex: boutique.com)." };
    }

    // Retrieve Enrichment Data in parallel
    const [techData, trafficData] = await Promise.all([
        fetchWappalyzer(cleanDomain),
        fetchSimilarWeb(cleanDomain)
    ]);

    // Calculate a simulated trust score (1-5) based loosely on traffic
    const trustScore = trafficData.visits > 500000 ? 5 : trafficData.visits > 100000 ? 4 : trafficData.visits > 50000 ? 3 : 2;

    const { error } = await supabase
        .from("tracked_stores")
        .upsert({
            user_id: user.id,
            store_domain: cleanDomain,
            page_name: pageName || null,
            platform: techData.platform,
            monthly_traffic: trafficData.visits,
            tech_stack: techData.technologies,
            trust_score: trustScore,
            last_analyzed_at: new Date().toISOString()
        }, {
            onConflict: "user_id, store_domain"
        });

    if (error) {
        console.error("Erreur lors de l'ajout/mise à jour de la boutique:", error);
        return { error: "Une erreur est survenue lors de l'ajout ou de l'analyse." };
    }

    revalidatePath("/my-stores");
    revalidatePath("/trending");
    return { success: true };
}

export async function removeTrackedStore(storeDomain: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Non autorisé" };
    }

    const { error } = await supabase
        .from("tracked_stores")
        .delete()
        .eq("user_id", user.id)
        .eq("store_domain", storeDomain);

    if (error) {
        console.error("Erreur lors de la suppression de la boutique:", error);
        return { error: "Erreur lors de la désactivation du suivi." };
    }

    revalidatePath("/my-stores");
    revalidatePath("/trending");
    return { success: true };
}
