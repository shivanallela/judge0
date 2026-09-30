'use client';

import React from 'react';

interface RunButtonProps {
  onRun: () => void;
  isRunning: boolean;
  disabled?: boolean;
}

export default function RunButton({
  onRun,
  isRunning,
  disabled = false,
}: RunButtonProps) {
  return (
    <button
      onClick={onRun}
      disabled={disabled || isRunning}
      id="runBtn"
      title="Execute code through Judge0 (Ctrl+Enter)"
      className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm text-white shadow-lg transition-all ${
        isRunning || disabled
          ? 'bg-emerald-600/50 cursor-not-allowed opacity-75'
          : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 shadow-emerald-500/20 hover:shadow-emerald-500/40 cursor-pointer'
      }`}
    >
      {isRunning ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Running...</span>
        </>
      ) : (
        <>
          <span className="text-xs">▶</span>
          <span>Run</span>
          <span className="text-[10px] uppercase tracking-wider bg-black/20 px-1.5 py-0.5 rounded text-emerald-100 font-mono">
            Ctrl+Enter
          </span>
        </>
      )}
    </button>
  );
}
