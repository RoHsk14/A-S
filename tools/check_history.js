import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load env vars
const envPath = path.resolve(process.cwd(), ".env.local");
let env = {};
if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, "utf-8");
    raw.split("\n").forEach(line => {
        const [k, ...v] = line.split("=");
        if (k && v.length) env[k.trim()] = v.join("=").trim().replace(/['"]/g, '');
    });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkHistory() {
    const { data, error } = await supabase.from('scan_history').select('*').order('created_at', { ascending: false }).limit(5);
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Top 5 Scan History entries:");
        console.log(JSON.stringify(data, null, 2));
    }
}

checkHistory();
