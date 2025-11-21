'use client';

import { useState, FormEvent } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Sending magic link…');

    const supabase = createBrowserSupabaseClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // This must match an allowed redirect URL in Supabase → URL Configuration
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
      return;
    }

    setStatus('Magic link sent. Check your email 👀');
  };

  const handleGoogle = async () => {
    setLoading(true);
    setStatus('Redirecting to Google…');
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/sessions`,
        },
      });
      if (error) {
        console.error(error);
        setStatus(`Google sign-in error: ${error.message}`);
      } else {
        // User will be redirected; keep a transient message
        setStatus('Opening Google OAuth…');
      }
    } catch (err) {
      console.error(err);
      setStatus('Unexpected error starting Google OAuth');
    } finally {
      // We intentionally do not clear loading immediately; the redirect will happen.
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <h1 className="text-2xl font-bold mb-4">Log in</h1>
      <p className="text-sm text-neutral-500 mb-4">
        Enter your email and we&apos;ll send you a magic link.
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="you@example.com"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black text-white py-2 font-medium disabled:opacity-60"
        >
          {loading ? 'Sending…' : 'Send magic link'}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-neutral-500">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full rounded border border-neutral-300 bg-white text-neutral-800 py-2 font-medium disabled:opacity-60 hover:bg-neutral-50 flex items-center justify-center gap-2"
        >
          <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="w-4 h-4"><path fill="#EA4335" d="M12 11.988h11.52c.096.576.144 1.152.144 1.872 0 6.24-4.176 10.704-10.656 10.704-6.096 0-11.008-4.944-11.008-11.04 0-6.096 4.912-11.04 11.008-11.04 2.976 0 5.472 1.056 7.392 2.784l-3.072 2.976C15.696 7.152 14.112 6.48 12 6.48c-3.84 0-6.944 3.168-6.944 7.008 0 3.84 3.104 7.008 6.944 7.008 3.552 0 5.376-2.016 5.76-4.128H12v-4.368Z"/><path fill="#34A853" d="M3.456 7.392 7.2 10.176C8.208 7.632 10.8 6 12 6.48V1.584C8.208 1.248 4.992 3.744 3.456 7.392Z"/><path fill="#FBBC05" d="M12 22.536c2.208.192 4.368-.576 5.76-1.728l-2.688-2.208c-.768.528-1.92.96-3.072.96-3.072 0-5.664-2.304-6.432-5.376l-3.744 2.88C3.648 20.448 7.488 22.536 12 22.536Z"/><path fill="#4285F4" d="M23.52 11.988H12v4.368h6.72c-.384 2.112-2.208 4.128-5.76 4.128-3.84 0-6.944-3.168-6.944-7.008 0-3.84 3.104-7.008 6.944-7.008 2.112 0 3.696.672 4.992 1.872l3.072-2.976C17.472 2.64 14.976 1.584 12 1.584 5.904 1.584.992 6.528.992 12.624c0 6.096 4.912 11.04 11.008 11.04 6.48 0 10.656-4.464 10.656-10.704 0-.72-.048-1.296-.144-1.872Z"/></svg>
          {loading ? 'Working…' : 'Continue with Google'}
        </button>

        {status && (
          <p className="text-sm text-neutral-600 mt-2">{status}</p>
        )}
      </form>
    </div>
  );
}