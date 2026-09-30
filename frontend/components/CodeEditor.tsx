'use client';

import React, { useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
  language: string; // 'python' | 'c' | 'cpp' | 'java'
  filename: string;
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onReset: () => void;
  onClear: () => void;
}

export default function CodeEditor({
  language,
  filename,
  code,
  onChange,
  onRun,
  onReset,
  onClear,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [copied, setCopied] = useState(false);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Track cursor movement
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({
        line: e.position.lineNumber,
        col: e.position.column,
      });
    });

    // Add Ctrl+Enter shortcut inside editor to trigger Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun();
    });

    // Ensure 4-space tab indentation for Python and all languages
    editor.getModel()?.updateOptions({
      tabSize: 4,
      insertSpaces: true,
    });
  };

  const handleCopy = async () => {
    if (editorRef.current) {
      const val = editorRef.current.getValue();
      await navigator.clipboard.writeText(val);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <section className="flex flex-col flex-1 min-h-[300px] bg-[#080d1a] border-b border-white/10 overflow-hidden">
      {/* Editor Header Bar */}
      <div className="h-10 bg-[#0f172a] border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <span className="text-sm">📄</span>
          <span>{filename}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onReset}
            title="Reset code to starter template"
            className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-[#1e293b] rounded transition"
          >
            ↺ Reset
          </button>
          <button
            onClick={onClear}
            title="Clear code editor"
            className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-[#1e293b] rounded transition"
          >
            🗑 Clear
          </button>
          <button
            onClick={handleCopy}
            title="Copy code to clipboard"
            className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-[#1e293b] rounded transition"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full relative">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: "'Fira Code', monospace, Consolas",
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
            renderWhitespace: 'none',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
          }}
        />
      </div>

      {/* Editor Footer / Stats */}
      <div className="h-6 bg-[#0f172a] border-t border-white/10 flex items-center justify-between px-3 text-[11px] text-slate-500 font-mono">
        <span>
          Line {cursorPos.line}, Col {cursorPos.col}
        </span>
        <span className="uppercase tracking-wider">{language} • UTF-8</span>
      </div>
    </section>
  );
}
