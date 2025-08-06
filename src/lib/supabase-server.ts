import { cookies } from 'next/headers';
import { createServerClient } from "@supabase/ssr";
import { env } from "@/env";

export const supabaseServer = async () => {
  // Next.js 15 cookie store (read-write inside Server Actions / Route Handlers)
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        /**
         * Called by supabase-js whenever it needs the current cookies.
         * Just forward everything as-is.
         */
        getAll() {
          return cookieStore.getAll();
        },

        /**
         * Called by supabase-js after it refreshes / sets auth cookies.
         * We must copy each cookie exactly, otherwise the session breaks.
         */
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
};
