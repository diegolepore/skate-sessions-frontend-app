import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function MePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-16 px-4">
        <p className="text-lg">You are not logged in.</p>
        <a href="/login" className="text-blue-600 underline mt-2 inline-block">
          Go to login
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-4 space-y-2">
      <h1 className="text-2xl font-bold">Your account</h1>
      <p>
        <span className="font-medium">Email:</span> {user.email}
      </p>
      <p className="text-sm text-neutral-500">
        (This is rendered on the server using your Supabase auth cookies.)
      </p>
    </div>
  );
}