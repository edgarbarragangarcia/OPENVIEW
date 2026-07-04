import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  console.log("--- PROFILES ---");
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  console.log("Data:", JSON.stringify(profiles, null, 2));
  console.log("Error:", pErr);

  console.log("\n--- COURSES ---");
  const { data: courses, error: cErr } = await supabase.from('courses').select('*');
  console.log("Data:", JSON.stringify(courses, null, 2));
  console.log("Error:", cErr);
}

check();
