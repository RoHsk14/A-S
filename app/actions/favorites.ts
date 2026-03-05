"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleFavoriteAction(adId: string, isFavoriting: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    if (isFavoriting) {
        await supabase.from("spy_list").insert({ ad_id: adId, user_id: user.id });
    } else {
        await supabase.from("spy_list").delete().eq("ad_id", adId).eq("user_id", user.id);
    }

    // Refresh the Spy List cache
    revalidatePath("/spy-list");
    revalidatePath("/");
}
