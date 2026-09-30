'use client';

import React, { useState } from 'react';
import LanguageSelector, { LANGUAGES, LanguageConfig } from '@/components/LanguageSelector';
import RunButton from '@/components/RunButton';
import CodeEditor from '@/components/CodeEditor';
import InputPanel from '@/components/InputPanel';
import OutputPanel from '@/components/OutputPanel';
import { runCode, RunResult } from '@/lib/api';

export default function Home() {
  const [selectedLang, setSelectedLang] = useState<LanguageConfig>(LANGUAGES[71]);
  const [code, setCode] = useState<string>(LANGUAGES[71].template);
  const [stdin, setStdin] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  // Handle Language Change
  const handleLanguageChange = (newLang: LanguageConfig) => {
    if (code.trim() && code.trim() !== selectedLang.template.trim()) {
      if (confirm('Switching languages will replace current code with the starter template. Continue?')) {
        setSelectedLang(newLang);
        setCode(newLang.template);
      }
    } else {
      setSelectedLang(newLang);
      setCode(newLang.template);
    }
  };

  // Reset & Clear Handlers for Editor
  const handleReset = () => {
    if (confirm('Reset code to starter template for this language?')) {
      setCode(selectedLang.template);
    }
  };

  const handleClear = () => {
    setCode('');
  };

  // Run Code via Flask Backend -> Local Judge0
  const handleRun = async () => {
    if (isRunning) return;

    if (!code.trim()) {
      alert('Please enter some code before running.');
      return;
    }

    setIsRunning(true);
    setRunError(null);

    const response = await runCode(selectedLang.id, code, stdin);
    setIsRunning(false);

    if (response.success && response.result) {
      setRunResult(response.result);
    } else {
      setRunResult(null);
      setRunError(response.error || 'Judge0 execution service is unavailable.');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080d1a] text-slate-100 font-sans">
      {/* Top Header: CodeSphere on left, [ Language Selector ] [ Run ] on right */}
      <header className="h-12 bg-[#0f172a] border-b border-white/10 flex items-center justify-between px-4 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-white">
            CodeSphere
          </span>
        </div>

        {/* Right side controls: Language Selector immediately before Run button */}
        <div className="flex items-center gap-2">
          <LanguageSelector
            selectedId={selectedLang.id}
            onSelect={handleLanguageChange}
            disabled={isRunning}
          />
          <RunButton onRun={handleRun} isRunning={isRunning} />
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex flex-col flex-1 overflow-hidden">
        {/* Monaco Code Editor */}
        <CodeEditor
          language={selectedLang.monacoLang}
          filename={selectedLang.filename}
          code={code}
          onChange={setCode}
          onRun={handleRun}
          onReset={handleReset}
          onClear={handleClear}
        />

        {/* Bottom Input & Output Sections */}
        <section className="flex h-[250px] shrink-0 bg-[#0f172a] overflow-hidden">
          {/* Custom Input */}
          <InputPanel
            value={stdin}
            onChange={setStdin}
          />

          {/* Output */}
          <OutputPanel
            result={runResult}
            error={runError}
            isRunning={isRunning}
            onClear={() => {
              setRunResult(null);
              setRunError(null);
            }}
          />
        </section>
      </main>
    </div>
  );
}
