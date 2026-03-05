"use server";

import { createClient } from "@/lib/supabase/server";

export async function triggerForceScan(domain: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Vous devez être connecté pour lancer un scan." };
    }

    try {
        // Déclenchement de l'Edge Function Supabase qui contrôle Apify
        const { data, error } = await supabase.functions.invoke('smart-task', {
            body: { targetDomain: domain, force: true }
        });

        if (error) {
            console.error("Erreur lors de l'appel à l'Edge Function smart-task:", error);
            return { error: "Le serveur de scan est instable." };
        }

        return { success: true, message: "L'extracteur est lancé en arrière-plan." };
    } catch (err) {
        console.error("Exception lors du force scan:", err);
        return { error: "Impossible de joindre le système d'extraction." };
    }
}
