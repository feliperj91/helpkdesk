import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables are missing!');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Configured' : '✗ Missing');
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Configured' : '✗ Missing');
    throw new Error('Supabase configuration is missing. Please check your environment variables in Vercel.');
}

console.log('✓ Supabase client initialized successfully');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
