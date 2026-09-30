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
  const getBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('accepted')) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (s.includes('error') || s.includes('exceeded') || s.includes('failed')) {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="flex flex-col flex-[1.35] bg-[#030712] overflow-hidden">
      {/* Subheader */}
      <div className="h-8 bg-[#0f172a]/70 border-b border-white/10 flex items-center justify-between px-3">
        <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-slate-300">
          <span className="text-cyan-400 font-extrabold">&gt;</span>
          <span>Output:</span>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getBadgeClass(
                result.status
              )}`}
            >
              {result.status}
            </span>
          )}
          {result && (result.time || result.memory !== undefined) && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-[#1e293b] px-2 py-0.5 rounded">
              {result.time && <span>Time: {result.time}</span>}
              {result.time && result.memory !== undefined && <span className="opacity-40">•</span>}
              {result.memory !== undefined && <span>Mem: {result.memory} KB</span>}
            </div>
          )}
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded hover:bg-[#1e293b] transition cursor-pointer"
          >
            ✕ Clear
          </button>
        </div>
      </div>

      {/* Output Content */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-xs leading-relaxed">
        {isRunning && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <div className="spinner" />
            <p className="text-xs">Executing through local Judge0 sandbox...</p>
          </div>
        )}

        {!isRunning && error && (
          <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded text-rose-300">
            <div className="text-[10px] uppercase font-bold tracking-wider text-rose-400 mb-1">
              ERROR:
            </div>
            <pre className="whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {!isRunning && !error && !result && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500">
            <span className="text-2xl">⚡</span>
            <p className="text-xs text-slate-400">
              Click <strong className="text-slate-300">▶ Run</strong> or{' '}
              <strong className="text-slate-300">Run with Input</strong> to execute.
            </p>
            <span className="text-[10px] text-slate-600">
              Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-400">Ctrl</kbd> +{' '}
              <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-400">Enter</kbd> to run directly.
            </span>
          </div>
        )}

        {!isRunning && result && (
          <div className="flex flex-col gap-3">
            {/* Standard Output */}
            {result.stdout && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  STDOUT:
                </div>
                <pre className="p-2.5 bg-black/40 border border-white/5 rounded text-slate-200 whitespace-pre-wrap">
                  {result.stdout}
                </pre>
              </div>
            )}

            {/* Standard Error / Runtime Error */}
            {result.stderr && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  STDERR / RUNTIME ERROR:
                </div>
                <pre className="p-2.5 bg-rose-950/20 border border-rose-500/20 rounded text-rose-300 whitespace-pre-wrap">
                  {result.stderr}
                </pre>
              </div>
            )}

            {/* Compilation Error */}
            {result.compile_output && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  COMPILATION ERROR:
                </div>
                <pre className="p-2.5 bg-rose-950/20 border border-rose-500/20 rounded text-rose-300 whitespace-pre-wrap">
                  {result.compile_output}
                </pre>
              </div>
            )}

            {/* Message if any */}
            {result.message && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  SANDBOX MESSAGE:
                </div>
                <pre className="p-2.5 bg-amber-950/20 border border-amber-500/20 rounded text-amber-300 whitespace-pre-wrap">
                  {result.message}
                </pre>
              </div>
            )}

            {/* Empty Output */}
            {!result.stdout && !result.stderr && !result.compile_output && !result.message && (
              <div className="text-slate-500 italic p-2">
                (Program executed successfully with no output)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
