import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface Session {
  id: string;
  title: string;
  spot_name: string | null;
  planned_for_date: string | null;
  created_at: string;
};

interface Trick {
  id: number;
  name: string;
  obstacle: string;
  stance: string;
  difficulty: number;
};

interface SessionTrick {
  id: number;
  order_index: number;
  target_attempts: number | null;
  notes: string | null;
  tricks: Trick;
};



// Server action to add a trick to this session
async function addTrickToSession(formData: FormData) {
  'use server';

  const sessionId = formData.get('session_id');
  const trickIdRaw = formData.get('trick_id');
  const attemptsRaw = formData.get('target_attempts');

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

  const { error } = await supabase.from('session_tricks').insert({
    session_id: sessionId,
    trick_id: trickId,
    order_index: nextOrderIndex,
    target_attempts: targetAttempts,
  });

  if (error) {
    console.error('Error inserting session_trick:', error);
  }

  redirect(`/sessions/${sessionId}`);
}

type PageProps = {
  params: { id: string };
};

export default async function SessionDetailPage({ params }: PageProps) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const sessionId = params.id;

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
      tricks (
        id,
        name,
        obstacle,
        stance,
        difficulty
      )
    `
    )
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true });

  if (stError) {
    console.error('Error loading session_tricks:', stError);
  }

  const sessionTricks = (sessionTricksData ?? []) as unknown as SessionTrick[];

  // 3) Load full tricks catalog for the dropdown
  const { data: tricksData, error: tricksError } = await supabase
    .from('tricks')
    .select('id, name, obstacle, stance, difficulty')
    .order('difficulty', { ascending: true })
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
        <h1 className="text-2xl font-bold">{typedSession.title}</h1>
        <p className="text-sm text-neutral-500">
          {typedSession.spot_name && (
            <>
              <span className="font-medium">{typedSession.spot_name}</span>
              {' · '}
            </>
          )}
          {typedSession.planned_for_date
            ? `Planned: ${new Date(
                typedSession.planned_for_date
              ).toLocaleDateString()}`
            : `Created: ${new Date(
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
                    {t.name} · {t.obstacle} · diff {t.difficulty}
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
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}