import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/sessions';

  if (!code) {
    // No code? Just send them back to login.
    return NextResponse.redirect(`${url.origin}/login`);
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Error exchanging code for session:', error);
    return NextResponse.redirect(`${url.origin}/login?error=auth`);
  }

  // Session is now set via cookies. Redirect to "home" or wherever.
  return NextResponse.redirect(`${url.origin}${next}`);
}