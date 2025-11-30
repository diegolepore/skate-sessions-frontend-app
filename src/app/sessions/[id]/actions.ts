"use server";

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Remove a session_tricks row
export async function removeSessionTrick(formData: FormData) {
  const sessionId = formData.get('session_id');
  const sessionTrickIdRaw = formData.get('session_trick_id');

  const stId = typeof sessionTrickIdRaw === 'string' ? Number(sessionTrickIdRaw) : NaN;
  if (!Number.isFinite(stId) || typeof sessionId !== 'string') {
    redirect('/sessions');
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('session_tricks')
    .delete()
    .eq('id', stId)
    .eq('session_id', sessionId);

  if (error) console.error('Error deleting session_trick:', error);
  redirect(`/sessions/${sessionId}`);
}

// Toggle completion state: set completed_at timestamp or NULL
export async function toggleSessionTrickCompletion(formData: FormData) {
  const sessionId = formData.get('session_id');
  const sessionTrickIdRaw = formData.get('session_trick_id');
  const desired = formData.get('desired'); // 'complete' | 'incomplete'

  const stId = typeof sessionTrickIdRaw === 'string' ? Number(sessionTrickIdRaw) : NaN;
  if (!Number.isFinite(stId) || typeof sessionId !== 'string') {
    redirect('/sessions');
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const updateValue = desired === 'complete' ? new Date().toISOString() : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('session_tricks')
    .update({ completed_at: updateValue })
    .eq('id', stId)
    .eq('session_id', sessionId);

  if (error) console.error('Error updating completion:', error);
  redirect(`/sessions/${sessionId}`);
}

// Update target_attempts, landed_attempts, notes
export async function updateSessionTrick(formData: FormData) {
  const sessionId = formData.get('session_id');
  const sessionTrickIdRaw = formData.get('session_trick_id');
  const targetAttemptsRaw = formData.get('target_attempts');
  const landedAttemptsRaw = formData.get('landed_attempts');
  const notesRaw = formData.get('notes');

  const stId = typeof sessionTrickIdRaw === 'string' ? Number(sessionTrickIdRaw) : NaN;
  if (!Number.isFinite(stId) || typeof sessionId !== 'string') {
    redirect('/sessions');
  }

  const targetAttempts =
    typeof targetAttemptsRaw === 'string' && targetAttemptsRaw.trim() ? Number(targetAttemptsRaw) : null;
  const landedAttempts =
    typeof landedAttemptsRaw === 'string' && landedAttemptsRaw.trim() ? Number(landedAttemptsRaw) : null;
  const notes = typeof notesRaw === 'string' && notesRaw.trim() ? notesRaw : null;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const updatePayload: Record<string, unknown> = {
    target_attempts: targetAttempts,
    landed_attempts: landedAttempts,
    notes,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('session_tricks')
    .update(updatePayload)
    .eq('id', stId)
    .eq('session_id', sessionId);

  if (error) console.error('Error updating session_trick:', error);
  redirect(`/sessions/${sessionId}`);
}