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

        {status && (
          <p className="text-sm text-neutral-600 mt-2">{status}</p>
        )}
      </form>
    </div>
  );
}