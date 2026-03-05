"use server";

import { createClient } from "@/lib/supabase/server";

export async function getScanHistory() {
    const supabase = await createClient();

    const { data: history, error } = await supabase
        .from("scan_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching scan history:", error);
        return [];
    }

    return history;
}
