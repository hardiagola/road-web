import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cfjttoskvcgssxsbrecz.supabase.co';
const supabaseAnonKey = 'sb_publishable_o11s7fVf3Bil5iW8sBvJFw_gOBdQdcY';

export const externalSupabase = createClient(supabaseUrl, supabaseAnonKey);
