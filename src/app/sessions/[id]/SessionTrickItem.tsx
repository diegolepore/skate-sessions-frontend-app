import type { Tables } from '@/lib/supabase/types';
import { toggleSessionTrickCompletion, updateSessionTrick, removeSessionTrick } from './actions';

type Trick = Tables<'tricks'>;
type SessionTrick = Tables<'session_tricks'> & { tricks?: Trick | null };

interface Props {
  sessionTrick: SessionTrick & { completed_at: string | null };
  sessionId: string;
}

export default function SessionTrickItem({ sessionTrick: st, sessionId }: Props) {
  const trick = st.tricks;
  if (!trick) return null;
  const isCompleted = !!st.completed_at;
  return (
    <li className="border rounded-lg px-3 py-2 flex flex-col gap-1">
      <details className="group" data-completed={isCompleted}>
        <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-medium flex items-center gap-2">
              {trick.name}
              {isCompleted && <span className="text-green-600 text-xs">(done)</span>}
            </span>
            <span className="text-[11px] text-neutral-500">
              Target: {st.target_attempts ?? '—'} · Landed: {st.landed_attempts ?? '—'} {st.notes && <span>· {st.notes}</span>}
            </span>
          </div>
          <form action={toggleSessionTrickCompletion} className="flex items-center">
            <input type="hidden" name="session_id" value={sessionId} />
            <input type="hidden" name="session_trick_id" value={String(st.id)} />
            <input type="hidden" name="desired" value={isCompleted ? 'incomplete' : 'complete'} />
            <button
              type="submit"
              aria-pressed={isCompleted}
              aria-label={isCompleted ? 'Mark trick incomplete' : 'Mark trick complete'}
              className={`w-6 h-6 rounded border flex items-center justify-center text-xs transition-colors ${isCompleted ? 'bg-green-600 border-green-600 text-white' : 'bg-white hover:bg-neutral-100'} `}
            >
              {isCompleted ? '✓' : ''}
            </button>
          </form>
          <span className="text-xs text-blue-600 underline-offset-2 group-open:hidden">Expand</span>
          <span className="text-xs text-blue-600 underline-offset-2 hidden group-open:inline">Collapse</span>
        </summary>
        <div className="mt-3 border-t pt-3">
          <form action={updateSessionTrick} className="grid grid-cols-3 gap-2 text-xs items-start">
            <input type="hidden" name="session_id" value={sessionId} />
            <input type="hidden" name="session_trick_id" value={String(st.id)} />
            <label className="flex flex-col gap-1">
              <span className="font-medium">Target</span>
              <input
                name="target_attempts"
                type="number"
                min={1}
                defaultValue={st.target_attempts ?? ''}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">Landed</span>
              <input
                name="landed_attempts"
                type="number"
                min={0}
                defaultValue={st.landed_attempts ?? ''}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1 col-span-3">
              <span className="font-medium">Notes</span>
              <input
                name="notes"
                type="text"
                defaultValue={st.notes ?? ''}
                placeholder="Update notes"
                className="border rounded px-2 py-1"
              />
            </label>
            <div className="col-span-3 flex gap-3">
              <button
                type="submit"
                className="px-3 py-1 rounded bg-blue-600 text-white font-medium"
              >
                Save changes
              </button>
            </div>
          </form>
          <form action={removeSessionTrick} className="mt-2 inline-block">
            <input type="hidden" name="session_id" value={sessionId} />
            <input type="hidden" name="session_trick_id" value={String(st.id)} />
            <button
              type="submit"
              className="px-3 py-1 rounded bg-red-50 text-red-600 border border-red-200 text-xs"
            >
              Remove
            </button>
          </form>
        </div>
      </details>
    </li>
  );
}