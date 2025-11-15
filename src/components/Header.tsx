import Link from 'next/link';
import { signOut } from '@/lib/supabase/actions';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function Header() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b">
      <nav className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/sessions" className="font-semibold hover:opacity-80">
          Skate Sessions
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/me" className="hover:underline">Me</Link>
              <Link href="/sessions" className="hover:underline">Sessions</Link>
              <form action={signOut}>
                <button type="submit" className="text-red-600 hover:underline">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hover:underline">Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
