import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export type Vote = {
  id: string;
  choice: 'BRETT' | 'POPCAT';
  fid: number;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  created_at: string;
}; 