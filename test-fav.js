require("dotenv").config({ path: ".env.local" });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('favorites').insert({ ad_id: '1' }).select();
  console.log("Error:", error);
  console.log("Data:", data);
}
test();
