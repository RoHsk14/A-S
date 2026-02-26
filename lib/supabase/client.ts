import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return createBrowserClient(
        url && url.length > 0 ? url : "https://dummyproject.supabase.co",
        key && key.length > 0 ? key : "dummy_key"
    );
}
