'use client';

import React from 'react';

export interface LanguageConfig {
  id: number;
  name: string;
  version: string;
  displayName: string;
  extension: string;
  filename: string;
  monacoLang: string;
  template: string;
}

export const LANGUAGES: Record<number, LanguageConfig> = {
  71: {
    id: 71,
    name: 'Python',
    version: '3.8.1',
    displayName: 'Python 3.8.1',
    extension: '.py',
    filename: 'main.py',
    monacoLang: 'python',
    template: 'print("Hello, World!")\n',
  },
  50: {
    id: 50,
    name: 'C',
    version: 'GCC 9.2.0',
    displayName: 'C',
    extension: '.c',
    filename: 'main.c',
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
    displayName: 'C++',
    extension: '.cpp',
    filename: 'main.cpp',
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
    displayName: 'Java',
    extension: '.java',
    filename: 'Main.java',
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
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = Number(e.target.value);
    const newLang = LANGUAGES[newId];
    if (newLang) {
      onSelect(newLang);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        id="languageSelect"
        value={selectedId}
        onChange={handleChange}
        disabled={disabled}
        aria-label="Select Programming Language"
        className="h-8 appearance-none bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 rounded-md pl-3 pr-7 text-xs font-medium cursor-pointer transition focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {Object.values(LANGUAGES).map((lang) => (
          <option key={lang.id} value={lang.id} className="bg-slate-900 text-slate-200 py-1">
            {lang.displayName}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 text-[10px] text-slate-400 select-none">
        ▼
      </span>
    </div>
  );
}
