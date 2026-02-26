import { createClient } from "@/lib/supabase/server";
import { SpyListGrid } from "@/components/ads/SpyListGrid";
import { AdWithStore } from "@/types/database";

export default async function SpyListPage() {
    const supabase = await createClient();

    // Fetch favorites and join with ads table
    // Using service role key because RLS is likely not fully set up for anonymous users,
    // or we can just use the standard client which uses anon key.
    // The previous implementation of `useFavorites` uses the client component `createClient` (anon), 
    // Which means anyone can insert/delete. We should be able to read.
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
