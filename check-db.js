import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Use the service_role key if available, otherwise anon
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

async function check() {
  console.log("--- COURSES (all, bypassing RLS) ---");
  const { data: courses, error: cErr } = await supabase.from('courses').select('id, title, published, created_by');
  console.log("Data:", JSON.stringify(courses, null, 2));
  console.log("Error:", cErr);

  console.log("\n--- PROFILES (all, bypassing RLS) ---");
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, full_name, role');
  console.log("Data:", JSON.stringify(profiles, null, 2));
  console.log("Error:", pErr);

  // Check RLS policies on courses table
  console.log("\n--- RLS POLICIES on courses ---");
  const { data: policies, error: polErr } = await supabase
    .from('pg_policies')
    .select('policyname, cmd, qual')
    .eq('tablename', 'courses');
  console.log("Policies:", JSON.stringify(policies, null, 2));
  console.log("Error:", polErr);
}

check();
