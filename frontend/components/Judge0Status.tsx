'use client';

import React from 'react';
import { Judge0StatusResponse } from '@/lib/api';

interface Judge0StatusProps {
  status: Judge0StatusResponse | null;
  loading?: boolean;
}

export default function Judge0Status({ status, loading = false }: Judge0StatusProps) {
  const isConnected = status?.connected === true;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
        isConnected
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
      }`}
      title={
        isConnected
          ? `Connected to Judge0 at ${status?.url} (v${status?.version || '1.13.1'})`
          : status?.error || 'Judge0 execution service is unavailable'
      }
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isConnected ? 'bg-emerald-400' : 'bg-rose-400'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isConnected ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />
      </span>
      <span>
        {loading
          ? 'Checking Judge0...'
          : isConnected
          ? 'Judge0: Connected'
          : 'Judge0: Disconnected'}
      </span>
    </div>
  );
}
