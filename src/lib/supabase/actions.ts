"use server";

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from './server';

export async function pingSupabase() {
  try {
    // Real connection test - make an actual HTTP request to Supabase
    // Using the REST API health check endpoint
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url) {
      throw new Error('Supabase URL not configured');
    }
    
    if (!serviceRoleKey) {
      throw new Error('Supabase service role key not configured');
    }
    
    console.log('Testing connection to:', url);
    
    // Make a real HTTP request to test connectivity
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      throw new Error(`HTTP ${response.status}: Failed to connect to Supabase REST API - ${errorText}`);
    }

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    // If we get here, we successfully made a network request to Supabase
    return `✅ Supabase connection successful! HTTP ${response.status} - Network connectivity confirmed`;
  } catch (error) {
    console.error('Ping Supabase error:', error);
    throw error;
  }
}

// Sign the current user out and redirect to the login page
export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/login');
}
