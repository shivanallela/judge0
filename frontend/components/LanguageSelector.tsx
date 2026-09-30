'use client';

import React from 'react';

export interface LanguageConfig {
  id: number;
  name: string;
  version: string;
  extension: string;
  filename: string;
  icon: string;
  monacoLang: string;
  template: string;
}

export const LANGUAGES: Record<number, LanguageConfig> = {
  71: {
    id: 71,
    name: 'Python',
    version: '3.8.1',
    extension: '.py',
    filename: 'main.py',
    icon: '🐍',
    monacoLang: 'python',
    template: 'print("Hello, World!")\n',
  },
  50: {
    id: 50,
    name: 'C',
    version: 'GCC 9.2.0',
    extension: '.c',
    filename: 'main.c',
    icon: '🇨',
    monacoLang: 'c',
    template: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
`,
  },
  54: {
    id: 54,
    name: 'C++',
    version: 'GCC 9.2.0',
    extension: '.cpp',
    filename: 'main.cpp',
    icon: '⚙️',
    monacoLang: 'cpp',
    template: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`,
  },
  62: {
    id: 62,
    name: 'Java',
    version: 'OpenJDK 13.0.1',
    extension: '.java',
    filename: 'Main.java',
    icon: '☕',
    monacoLang: 'java',
    template: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`,
  },
};

interface LanguageSelectorProps {
  selectedId: number;
  onSelect: (lang: LanguageConfig) => void;
  disabled?: boolean;
}

export default function LanguageSelector({
  selectedId,
  onSelect,
  disabled = false,
}: LanguageSelectorProps) {
  const currentLang = LANGUAGES[selectedId] || LANGUAGES[71];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = Number(e.target.value);
    const newLang = LANGUAGES[newId];
    if (newLang) {
      onSelect(newLang);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-[#1e293b] border border-white/10 rounded-lg px-3 py-1.5 transition-all hover:border-cyan-500/50 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Language:
      </span>
      <span className="text-base select-none">{currentLang.icon}</span>
      <select
        value={selectedId}
        onChange={handleChange}
        disabled={disabled}
        aria-label="Select Programming Language"
        className="bg-transparent border-none text-slate-100 font-semibold text-sm outline-none cursor-pointer pr-1"
      >
        {Object.values(LANGUAGES).map((lang) => (
          <option key={lang.id} value={lang.id} className="bg-[#0f172a] text-slate-100">
            {lang.name} ({lang.version})
          </option>
        ))}
      </select>
    </div>
  );
}
