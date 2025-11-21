import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/types';

type Session = Tables<'sessions'>;
type Trick = Tables<'tricks'>;
type SessionTrick = Tables<'session_tricks'>;
type SessionTrickWithTrick = SessionTrick & { tricks: Trick | null };
// Extend to include completion timestamp (new column) without breaking generated types
interface SessionTrickWithCompletion extends SessionTrickWithTrick {
  completed_at: string | null;
}

// Server action to add a trick to this session
async function addTrickToSession(formData: FormData) {
  'use server';

  const sessionId = formData.get('session_id');
  const trickIdRaw = formData.get('trick_id');
  const attemptsRaw = formData.get('target_attempts');
  const notes = formData.get('notes');

  if (typeof sessionId !== 'string' || !sessionId) {
    redirect('/sessions');
  }

  const trickId = typeof trickIdRaw === 'string' ? Number(trickIdRaw) : NaN;
  const targetAttempts =
    typeof attemptsRaw === 'string' && attemptsRaw.trim()
      ? Number(attemptsRaw)
      : null;

  if (!Number.isFinite(trickId)) {
    redirect(`/sessions/${sessionId}`);
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Compute next order_index = count + 1 for this session
  const { count, error: countError } = await supabase
    .from('session_tricks')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId);

  if (countError) {
    console.error('Error counting session tricks:', countError);
  }

  const nextOrderIndex = (count ?? 0) + 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('session_tricks').insert({
    session_id: sessionId,
    trick_id: trickId,
    order_index: nextOrderIndex,
    target_attempts: targetAttempts,
    notes: typeof notes === 'string' ? notes : null,
  });

  if (error) {
    console.error('Error inserting session_trick:', error);
  }

  redirect(`/sessions/${sessionId}`);
}

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  const sessionId = id;

  // 1) Load the session (RLS ensures it's the user's)
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id, title, spot_name, planned_for_date, created_at')
    .eq('id', sessionId)
    .single();

  if (sessionError) {
    console.error('Error loading session:', sessionError);
  }

  if (!session) {
    notFound();
  }

  const typedSession = session as Session;

  // 2) Load tricks attached to this session, joined with tricks catalog
  const { data: sessionTricksData, error: stError } = await supabase
    .from('session_tricks')
    .select(
      `
      id,
      order_index,
      target_attempts,
      notes,
      completed_at,
      tricks (
        id,
        name
      )
    `
    )
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true });
  if (stError) {
    console.error('Error loading session_tricks:', stError);
  }

  const sessionTricks = (sessionTricksData ?? []) as unknown as SessionTrickWithCompletion[];
  const allCompleted = sessionTricks.length > 0 && sessionTricks.every(st => st.completed_at);

  // 3) Load full tricks catalog for the dropdown
  const { data: tricksData, error: tricksError } = await supabase
    .from('tricks')
    .select('id, name')
    .order('name', { ascending: true });

  if (tricksError) {
    console.error('Error loading tricks:', tricksError);
  }

  const tricks = (tricksData ?? []) as Trick[];

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4 space-y-8">
      <header className="space-y-1">
        <Link
          href="/sessions"
          className="text-sm text-blue-600 hover:underline inline-block mb-2"
        >
          ← Back to all sessions
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <span>{typedSession.title}</span>
          <span
            className={`inline-block text-xs font-medium px-2 py-1 rounded border ${allCompleted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
          >
            {allCompleted ? 'Session completed' : 'Ongoing session'}
          </span>
        </h1>
        <p className="text-sm text-neutral-500">
          {typedSession.spot_name && (
            <>
              <span className="font-medium">{typedSession.spot_name}</span>
              {' · '}
            </>
          )}
          {typedSession.planned_for_date
            && `Planned: ${new Date(
                typedSession.planned_for_date
              ).toLocaleDateString()}`}
          {typedSession.created_at
            && `Created: ${new Date(
                typedSession.created_at
              ).toLocaleDateString()}`}
        </p>
      </header>

      {/* Add trick form */}
      <section className="border rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-semibold">Add trick to this session</h2>

        {tricks.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No tricks in catalog yet. Add some in Supabase &quot;tricks&quot; table.
          </p>
        ) : (
          <form action={addTrickToSession} className="space-y-4">
            <input type="hidden" name="session_id" value={typedSession.id} />

            <div>
              <label
                htmlFor="trick_id"
                className="block text-sm font-medium mb-1"
              >
                Trick
              </label>
              <select
                id="trick_id"
                name="trick_id"
                required
                className="w-full border rounded px-3 py-2"
                defaultValue=""
              >
                <option value="" disabled>
                  Select a trick
                </option>
                {tricks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="target_attempts"
                className="block text-sm font-medium mb-1"
              >
                Target attempts (optional)
              </label>
              <input
                id="target_attempts"
                name="target_attempts"
                type="number"
                min={1}
                className="border rounded px-3 py-2 w-32"
                placeholder="10"
              />
            </div>

            <div>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="w-full border rounded px-3 py-2"
                placeholder="Notes about this trick in this session (optional)"
              />
            </div>

            <button
              type="submit"
              className="rounded bg-black text-white px-4 py-2 text-sm font-medium"
            >
              Add trick
            </button>
          </form>
        )}
      </section>

      {/* List of tricks in this session */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Planned tricks</h2>

        {sessionTricks.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No tricks added yet. Use the form above to add your first one.
          </p>
        ) : (
          <ol className="space-y-2 list-decimal list-inside">
            {sessionTricks.map((st) => {
              console.log('st', st);
              const trick = st.tricks; // handle array or single object

              if (!trick) {
                // Safety fallback: if for some reason relation is missing
                return null;
              }

              const isCompleted = !!st.completed_at;
              return (
                <li
                  key={st.id}
                  className="border rounded-lg px-3 py-2 flex flex-col gap-1"
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-medium">
                      {trick.name} · {trick.obstacle}
                    </span>
                    <span className="text-xs text-neutral-500">
                      Diff {trick.difficulty}
                      {st.target_attempts
                        ? ` · ${st.target_attempts} attempts`
                        : ''}
                    </span>
                    <div>
                      {st.notes}
                    </div>
                    <form action={toggleSessionTrickCompletion} className="ml-2 flex items-center">
                      <input type="hidden" name="session_id" value={typedSession.id} />
                      <input type="hidden" name="session_trick_id" value={String(st.id)} />
                      <input type="hidden" name="desired" value={isCompleted ? 'incomplete' : 'complete'} />
                      <button
                        type="submit"
                        aria-pressed={isCompleted}
                        aria-label={isCompleted ? 'Mark trick incomplete' : 'Mark trick complete'}
                        className={`w-5 h-5 rounded border flex items-center justify-center text-xs transition-colors ${isCompleted ? 'bg-green-600 border-green-600 text-white' : 'bg-white hover:bg-neutral-100'} `}
                      >
                        {isCompleted ? '✅' : '☑'}
                      </button>
                    </form>
                  </div>
                  <form action={removeSessionTrick}>
                    <input type="hidden" name="session_id" value={typedSession.id} />
                    <input type="hidden" name="session_trick_id" value={String(st.id)} />
                    <button
                      type="submit"
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </form>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

async function removeSessionTrick(formData: FormData) {
  'use server';

  const sessionId = formData.get('session_id');
  const sessionTrickIdRaw = formData.get('session_trick_id');

  const stId = typeof sessionTrickIdRaw === 'string' ? Number(sessionTrickIdRaw) : NaN;
  if (!Number.isFinite(stId)) {
    redirect(`/sessions/${sessionId}`);
  }

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
    .from('session_tricks')
    .delete()
    .eq('id', stId)
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error deleting session_trick:', error);
  }

  redirect(`/sessions/${sessionId}`);
}

// Toggle completion state: set completed_at to NOW() or NULL
async function toggleSessionTrickCompletion(formData: FormData) {
  'use server';

  const sessionId = formData.get('session_id');
  const sessionTrickIdRaw = formData.get('session_trick_id');
  const desired = formData.get('desired'); // 'complete' | 'incomplete'

  if (typeof sessionId !== 'string' || !sessionId) {
    redirect('/sessions');
  }
  const stId = typeof sessionTrickIdRaw === 'string' ? Number(sessionTrickIdRaw) : NaN;
  if (!Number.isFinite(stId)) {
    redirect(`/sessions/${sessionId}`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const updateValue = desired === 'complete' ? new Date().toISOString() : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('session_tricks')
    .update({ completed_at: updateValue })
    .eq('id', stId)
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error updating completion:', error);
  }

  redirect(`/sessions/${sessionId}`);
}