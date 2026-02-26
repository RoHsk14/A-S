import { createClient } from "@supabase/supabase-js";
import { SpyListGrid } from "@/components/ads/SpyListGrid";
import { AdWithStore } from "@/types/database";

export default async function SpyListPage() {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummyproject.supabase.co";
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch favorites and join with ads table
    // Bypassing RLS with service key so the unauthenticated MVP works globally
    const { data: favorites, error } = await supabase
        .from("favorites")
        .select(`
            ad_id,
            ads (*)
        `);

    if (error) {
        console.error("Error fetching spy list favorites:", error.message);
    }

    // Extract exactly the ad objects that successfully joined
    const validAds = (favorites || [])
        .map((f: any) => f.ads)
        .filter((ad: any) => ad !== null && ad !== undefined) as AdWithStore[];

    return <SpyListGrid initialAds={validAds} />;
}
