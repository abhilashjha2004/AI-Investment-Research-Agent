import React from 'react';
import { TrendingUp, Cpu, Compass } from 'lucide-react';

export default function Header() {
  return (
    <header className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 md:p-8">
      {/* Decorative background glow */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />

      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              InsideIIM Intern Project
            </span>
          </div>
          
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            AI Investment Research Agent
          </h1>
          <p className="mt-2 text-sm text-slate-400 md:text-base">
            Perform in-depth multi-agent financial research on any company to generate investment decisions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-purple-400" />
            <span>LangGraph & Gemini</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
            <Compass className="h-3.5 w-3.5 text-blue-400" />
            <span>Tavily Search</span>
          </div>
        </div>
      </div>
    </header>
  );
}
