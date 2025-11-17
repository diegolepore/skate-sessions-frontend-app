'use client';

import 'client-only'
import { createBrowserClient } from '@supabase/ssr'
import type { Database as RawDatabase } from '@/lib/supabase/types';

// Strip the internal metadata from Database for the client
type Database = Omit<RawDatabase, '__InternalSupabase'>;

type TypedSupabaseClient = ReturnType<typeof createBrowserClient<Database>>

let browserClient : TypedSupabaseClient | null = null

export function createBrowserSupabaseClient(): TypedSupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (browserClient) {
    return browserClient
  }

  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }
  
  browserClient = createBrowserClient<Database>(
    url,
    anonKey
  )

  return browserClient
}

/**
 	•	✅ use client + client-only → makes it clear it’s client-only.
	•	✅ Singleton cached in browserClient → avoids re-creating.
	•	✅ Explicit env checks with clear error messages.
	•	✅ SupabaseClient<Database> typed, with Database = unknown as a placeholder.
 */