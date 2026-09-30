'use client';

import React from 'react';
import { RunResult } from '@/lib/api';

interface OutputPanelProps {
  result: RunResult | null;
  error: string | null;
  isRunning: boolean;
  onClear: () => void;
}

export default function OutputPanel({
  result,
  error,
  isRunning,
  onClear,
}: OutputPanelProps) {
  // Determine error content if any error state exists
  const hasError = Boolean(
    error ||
    (result && (result.stderr || result.compile_output || (result.status && !result.status.toLowerCase().includes('accepted'))))
  );

  const errorText = error || (
    result?.compile_output ||
    result?.stderr ||
    (result?.message ? result.message : '')
  );

  return (
    <div className="flex flex-col flex-1 bg-[#050811] overflow-hidden">
      {/* Clean Output Header */}
      <div className="h-8 bg-[#0f172a] border-b border-white/10 flex items-center justify-between px-3 shrink-0">
        <span className="text-xs font-semibold text-slate-300 tracking-wider">
          OUTPUT
        </span>
        <button
          type="button"
          onClick={onClear}
          id="clearOutputBtn"
          className="h-6 px-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 rounded text-xs font-medium transition cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* Output Content */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-xs leading-relaxed">
        {isRunning && (
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-3.5 h-3.5 border-2 border-slate-500 border-t-slate-200 rounded-full animate-spin" />
            <span>Running...</span>
          </div>
        )}

        {!isRunning && hasError && errorText && (
          <pre className="text-rose-400 whitespace-pre-wrap selection:bg-rose-950 font-mono">
            {errorText}
          </pre>
        )}

        {!isRunning && !hasError && result?.stdout && (
          <pre className="text-slate-100 whitespace-pre-wrap selection:bg-slate-800 font-mono">
            {result.stdout}
          </pre>
        )}

        {!isRunning && !hasError && result && !result.stdout && !errorText && (
          <div className="text-slate-500 italic">
            (Program finished with no output)
          </div>
        )}
      </div>
    </div>
  );
}
