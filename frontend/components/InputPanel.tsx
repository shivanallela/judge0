'use client';

import React from 'react';

interface InputPanelProps {
  value: string;
  onChange: (val: string) => void;
  onRun: () => void;
  isRunning: boolean;
}

export default function InputPanel({
  value,
  onChange,
  onRun,
  isRunning,
}: InputPanelProps) {
  // Prevent any parent container or document shortcut from executing on Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      // Allow default textarea newline insertion
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#050811] border-r border-white/10 overflow-hidden">
      {/* Subheader */}
      <div className="h-8 bg-[#0f172a]/70 border-b border-white/10 flex items-center justify-between px-3">
        <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-slate-300">
          <span className="text-cyan-400 font-extrabold">&gt;</span>
          <span>Input:</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Program stdin</span>
      </div>

      {/* Multiline Stdin Textarea */}
      <div className="flex-1 p-2">
        <textarea
          id="customInput"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={'Enter input here... (e.g. Shiva\n20\nHyderabad)'}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className="w-full h-full bg-transparent border-none outline-none text-sky-400 font-mono text-xs leading-relaxed resize-none p-1 placeholder:text-slate-600"
        />
      </div>

      {/* Controls Bar */}
      <div className="h-10 bg-[#0f172a]/90 border-t border-white/10 flex items-center justify-between px-3 gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRun}
            disabled={isRunning}
            id="runWithInputBtn"
            title="Execute program with this input"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs rounded transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <span>▶</span>
            <span>Run with Input</span>
          </button>
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-2 py-1 bg-transparent border border-white/10 hover:bg-[#1e293b] text-slate-400 hover:text-slate-200 text-xs rounded transition cursor-pointer"
          >
            Clear
          </button>
        </div>
        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
          Passed to Judge0 as stdin
        </span>
      </div>
    </div>
  );
}
