"use client";

import { pingSupabase } from "@/lib/supabase/actions";

export default function SupabasePing() {
  const handlePing = async () => {
    try {
      const result = await pingSupabase();
      console.log(result); // "pong"
      alert(`Supabase connection successful: ${result}`);
    } catch (error) {
      console.error("Supabase connection failed:", error);
      alert(`Supabase connection failed: ${error}`);
    }
  };

  return (
    <button 
      onClick={handlePing}
      className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
    >
      Ping Supabase
    </button>
  );
}
