import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Tables, TablesInsert } from '@/lib/supabase/types';
import PlannedDatePicker from '@/components/PlannedDatePicker';
import ConfirmButton from '@/components/ConfirmButton';

type SessionRow = Tables<'sessions'>;
type SessionInsert = TablesInsert<'sessions'>;
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

 // Example payload: prefer letting DB set defaults like id/created_at
  const insertPayload: SessionInsert = {
    user_id: user!.id,
    title: title.trim(),
  }

  if (typeof spotName === 'string' && spotName.trim()) {
    insertPayload.spot_name = spotName.trim();
  }

  if (typeof plannedForDate === 'string' && plannedForDate.trim()) {
    insertPayload.planned_for_date = plannedForDate;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('sessions').insert(insertPayload);

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

          <PlannedDatePicker />

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
                  <Link
                    href={`/sessions/${s.id}`}
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    {s.title}
                  </Link>
                  <span className="text-xs text-neutral-500">
                    {formatDateLabel(s.planned_for_date, s.created_at)}
                  </span>
                </div>
                {(s.spot_name || '').trim() && (
                  <p className="text-sm text-neutral-600">
                    Spot: <span className="font-medium">{s.spot_name}</span>
                  </p>
                )}
                  <form action={removeSession}>
                    <input type="hidden" name="session_id" value={s.id} />
                    <ConfirmButton
                      type="submit"
                      className="text-xs text-red-600 hover:underline"
                      message="Are you sure you want to remove this session?"
                    >
                      Remove
                    </ConfirmButton>
                  </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function formatDateLabel(plannedForDate: string | null, createdAt: string | null): string {  
  if (plannedForDate) {
    try {
      return `Planned: ${new Date(plannedForDate).toLocaleDateString()}`;
    } catch {
      return `Planned: ${plannedForDate}`;
    }
  }

  if(createdAt) {
    try {
      return `Created: ${new Date(createdAt).toLocaleDateString()}`;
    } catch {
      return `Created: ${createdAt}`;
    }
  }

  return '';
}

async function removeSession(formData: FormData) {
  'use server';

  const sessionId = formData.get('session_id');

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }
  
  // Delete the session_trick entry
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting session:', error);
  }

  redirect(`/sessions`);
}