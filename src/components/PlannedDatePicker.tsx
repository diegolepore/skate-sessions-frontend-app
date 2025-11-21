"use client";

import { useState, useEffect } from 'react';

// Produces a hidden input named planned_for_date with selected value (YYYY-MM-DD)
// Options: Today, Tomorrow, Custom manual date picker.
export default function PlannedDatePicker() {
  type Mode = 'today' | 'tomorrow' | 'custom';
  const [mode, setMode] = useState<Mode>('today');
  const [customDate, setCustomDate] = useState<string>('');
  const [value, setValue] = useState<string>('');

  // Helper to format date to YYYY-MM-DD in local time
  function formatDate(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    const today = new Date();

    if (mode === 'today') {
      setValue(formatDate(today));
    } 
    
    if (mode === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      setValue(formatDate(tomorrow));
    } 
    
    if (mode === 'custom') {
      setValue(customDate || '');
    }
  }, [mode, customDate]);

  return (
    <div>
      <span className="block text-sm font-medium mb-1">Planned date (optional)</span>
      <div className="flex flex-wrap gap-4 mb-2 items-center">
        <label className="flex items-center gap-1 text-sm">
          <input
            type="radio"
            name="planned_date_mode"
            value="today"
            checked={mode === 'today'}
            onChange={() => setMode('today')}
          />
          Today
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="radio"
            name="planned_date_mode"
            value="tomorrow"
            checked={mode === 'tomorrow'}
            onChange={() => setMode('tomorrow')}
          />
          Tomorrow
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="radio"
            name="planned_date_mode"
            value="custom"
            checked={mode === 'custom'}
            onChange={() => setMode('custom')}
          />
          Custom
        </label>
        {mode === 'custom' && (
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            required={mode === 'custom'}
          />
        )}
      </div>
      {/* Hidden field actually submitted */}
      <input type="hidden" name="planned_for_date" value={value} />
      {value && (
        <p className="text-xs text-neutral-500">Selected date: {value}</p>
      )}
    </div>
  );
}
