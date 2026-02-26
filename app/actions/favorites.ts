"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummyproject.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function toggleFavoriteAction(adId: string, isFavoriting: boolean) {
    if (isFavoriting) {
        // Insert (bypass RLS)
        await supabase.from("favorites").insert({ ad_id: adId });
    } else {
        // Delete (bypass RLS)
        await supabase.from("favorites").delete().eq("ad_id", adId);
    }

    // Refresh the Spy List cache
    revalidatePath("/spy-list");
    revalidatePath("/");
}
