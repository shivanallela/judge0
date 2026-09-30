'use client';

import React from 'react';

interface InputPanelProps {
  value: string;
  onChange: (val: string) => void;
}

export default function InputPanel({
  value,
  onChange,
}: InputPanelProps) {
  // Guarantee pressing Enter inside stdin textarea only inserts a newline
  // and never triggers any form submit, window shortcut, or execution
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      // Allow native textarea newline insertion
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#050811] border-r border-white/10 overflow-hidden">
      {/* Input Header */}
      <div className="h-8 bg-[#0f172a] border-b border-white/10 flex items-center justify-between px-3 shrink-0">
        <span className="text-xs font-semibold text-slate-300 tracking-wider">
          INPUT
        </span>
        <button
          type="button"
          onClick={() => onChange('')}
          id="clearInputBtn"
          className="h-6 px-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 rounded text-xs font-medium transition cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* Multiline Stdin Textarea */}
      <div className="flex-1 p-2">
        <textarea
          id="customInput"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter input here..."
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className="w-full h-full bg-transparent border-none outline-none text-slate-100 font-mono text-xs leading-relaxed resize-none p-1 placeholder:text-slate-600 focus:outline-none"
        />
      </div>
    </div>
  );
}
