import { createClient } from "@/lib/supabase/server";
import { SpyListGrid } from "@/components/ads/SpyListGrid";
import { AdWithStore } from "@/types/database";

export default async function SpyListPage() {
    const supabase = await createClient();

    // Fetch spy list and join with ads table
    // Using the authenticated client naturally applies the RLS policy for the isolated user
    const { data: spyList, error } = await supabase
        .from("spy_list")
        .select(`
            ad_id,
            ads (*)
        `);

    if (error) {
        console.error("Error fetching spy list:", error.message);
    }

    // Extract exactly the ad objects that successfully joined
    const validAds = (spyList || [])
        .map((f: any) => f.ads)
        .filter((ad: any) => ad !== null && ad !== undefined) as AdWithStore[];

    return <SpyListGrid initialAds={validAds} />;
}
