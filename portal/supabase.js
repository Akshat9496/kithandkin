// Kith & Kin — Supabase client
const SUPABASE_URL = 'https://ijyqeopkoxfvkgaufuoo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqeXFlb3Brb3hmdmtnYXVmdW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk3NTMsImV4cCI6MjA5NTUwNTc1M30.ys25-6S6L7AtfgC-BpuumVieFDJ4j9grcugcD2udfKM';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
