'use client';

import 'client-only'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Replace with your generated Database type later if you want
type Database = unknown

let browserClient : SupabaseClient<Database> | null = null

export function createBrowserSupabaseClient() {
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