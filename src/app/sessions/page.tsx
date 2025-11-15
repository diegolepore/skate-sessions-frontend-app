import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface SessionRow {
  id: string;
  title: string;
  spot_name: string | null;
  planned_for_date: string | null;
  created_at: string;
};

// Server action to create a new session
async function createSession(formData: FormData) {
  'use server';

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const title = formData.get('title');
  const spotName = formData.get('spot_name');
  const plannedForDate = formData.get('planned_for_date');

  if (typeof title !== 'string' || !title.trim()) {
    // If title is missing, just reload the page – in real life you'd show an error.
    redirect('/sessions');
  }

  const insertPayload: {
    user_id: string;
    title: string;
    spot_name?: string | null;
    planned_for_date?: string | null;
  } = {
    user_id: user!.id,
    title: title.trim(),
  };

  if (typeof spotName === 'string' && spotName.trim()) {
    insertPayload.spot_name = spotName.trim();
  }

  if (typeof plannedForDate === 'string' && plannedForDate.trim()) {
    insertPayload.planned_for_date = plannedForDate;
  }

  const { error } = await supabase.from('sessions').insert(insertPayload);

  if (error) {
    console.error('Error inserting session:', error);
    // In a more advanced version, we’d keep the error in URL or return state.
  }

  redirect('/sessions');
}

export default async function SessionsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('sessions')
    .select('id, title, spot_name, planned_for_date, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading sessions:', error);
  }

  const sessions = (data ?? []) as SessionRow[];

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Your skate sessions</h1>
        <p className="text-sm text-neutral-500">
          These sessions are protected by RLS – you&apos;re only seeing your own rows.
        </p>
      </header>

      {/* New session form */}
      <section className="border rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-semibold">Create a new session</h2>
        <form action={createSession} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              placeholder="Parque de Invierno – ledge session"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="spot_name">
              Spot name (optional)
            </label>
            <input
              id="spot_name"
              name="spot_name"
              placeholder="Parque de Invierno"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="planned_for_date">
              Planned date (optional)
            </label>
            <input
              id="planned_for_date"
              name="planned_for_date"
              type="date"
              className="border rounded px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="rounded bg-black text-white px-4 py-2 text-sm font-medium"
          >
            Save session
          </button>
        </form>
      </section>

      {/* Sessions list */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Existing sessions</h2>

        {sessions.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No sessions yet. Create your first one above 🤘
          </p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="border rounded-lg px-4 py-3 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={`/sessions/${s.id}`}
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    {s.title}
                  </a>
                  <span className="text-xs text-neutral-500">
                    {formatDateLabel(s.planned_for_date, s.created_at)}
                  </span>
                </div>
                {(s.spot_name || '').trim() && (
                  <p className="text-sm text-neutral-600">
                    Spot: <span className="font-medium">{s.spot_name}</span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function formatDateLabel(plannedForDate: string | null, createdAt: string): string {
  if (plannedForDate) {
    try {
      return `Planned: ${new Date(plannedForDate).toLocaleDateString()}`;
    } catch {
      // Fallback
      return `Planned: ${plannedForDate}`;
    }
  }

  try {
    return `Created: ${new Date(createdAt).toLocaleDateString()}`;
  } catch {
    return `Created: ${createdAt}`;
  }
}