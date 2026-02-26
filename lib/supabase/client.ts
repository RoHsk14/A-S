import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummyproject.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key"
    );
}
