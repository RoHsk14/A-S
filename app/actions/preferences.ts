"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateMarketPreferences(countries: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("user_profiles").upsert({
        id: user.id,
        market_preferences: countries
    });

    if (error) {
        throw new Error(`Failed to update settings: ${error.message}`);
    }

    // Revalidate paths to reflect new feed data
    revalidatePath("/settings");
    revalidatePath("/");
}
