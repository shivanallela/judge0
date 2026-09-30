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
      title="Execute code (Ctrl+Enter)"
      className="h-8 inline-flex items-center justify-center gap-1.5 px-3.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 rounded-md text-xs font-semibold cursor-pointer transition focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isRunning ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
          <span>Running...</span>
        </>
      ) : (
        <span>Run</span>
      )}
    </button>
  );
}
