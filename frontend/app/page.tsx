'use client';

import React, { useState, useEffect, useCallback } from 'react';
import LanguageSelector, { LANGUAGES, LanguageConfig } from '@/components/LanguageSelector';
import Judge0Status from '@/components/Judge0Status';
import RunButton from '@/components/RunButton';
import CodeEditor from '@/components/CodeEditor';
import InputPanel from '@/components/InputPanel';
import OutputPanel from '@/components/OutputPanel';
import { checkJudge0Status, runCode, Judge0StatusResponse, RunResult } from '@/lib/api';

export default function Home() {
  const [selectedLang, setSelectedLang] = useState<LanguageConfig>(LANGUAGES[71]);
  const [code, setCode] = useState<string>(LANGUAGES[71].template);
  const [stdin, setStdin] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [judge0Status, setJudge0Status] = useState<Judge0StatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(true);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  // Poll Judge0 status
  const fetchStatus = useCallback(async () => {
    const res = await checkJudge0Status();
    setJudge0Status(res);
    setStatusLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 20000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

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

  // Reset & Clear Handlers
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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080d1a] text-slate-100">
      {/* Top Header */}
      <header className="h-14 bg-[#0f172a] border-b border-white/10 flex items-center justify-between px-5 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl filter drop-shadow-[0_0_8px_#06b6d4]">⚡</span>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-base tracking-tight text-white">CodeSphere</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-1.5 py-0.5 rounded-full">
                  Local
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Online Code Compiler</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector
            selectedId={selectedLang.id}
            onSelect={handleLanguageChange}
            disabled={isRunning}
          />
        </div>

        <div className="flex items-center gap-3">
          <Judge0Status status={judge0Status} loading={statusLoading} />
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

        {/* Bottom Terminal Workbench (Custom Input & Output) */}
        <section className="flex flex-col h-[280px] shrink-0 bg-[#0f172a] overflow-hidden">
          {/* Terminal Topbar */}
          <div className="h-9 bg-[#0f172a] border-b border-white/10 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-200">
              <span className="text-sm">📟</span>
              <span>TERMINAL</span>
            </div>
          </div>

          {/* Terminal Split Content */}
          <div className="flex flex-1 overflow-hidden">
            <InputPanel
              value={stdin}
              onChange={setStdin}
              onRun={handleRun}
              isRunning={isRunning}
            />
            <OutputPanel
              result={runResult}
              error={runError}
              isRunning={isRunning}
              onClear={() => {
                setRunResult(null);
                setRunError(null);
              }}
            />
          </div>
        </section>
      </main>

      {/* Status Bar */}
      <footer className="h-7 bg-[#0f172a] border-t border-white/10 flex items-center justify-between px-4 text-[11px] text-slate-400 shrink-0 font-mono">
        <div className="flex items-center gap-2">
          <span>Engine: <strong className="text-slate-200">Judge0 v{judge0Status?.version || '1.13.1'}</strong></span>
          <span className="opacity-40">•</span>
          <span>Host: <span className="text-slate-300">{judge0Status?.url ? judge0Status.url.replace('http://', '') : 'localhost:2358'}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Next.js + Flask Architecture</span>
          <span className="opacity-40 hidden sm:inline">•</span>
          <span>Judge0: Only Execution Engine</span>
        </div>
      </footer>
    </div>
  );
}
