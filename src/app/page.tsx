'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import SearchForm from '@/components/SearchForm';
import Timeline from '@/components/Timeline';
import ReportView from '@/components/ReportView';
import { useAnalyze } from '@/hooks/useAnalyze';
import { AlertCircle, RefreshCw, BarChart2, Cpu, Terminal, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const {
    isLoading,
    statusMessage,
    error,
    progress,
    result,
    analyze,
    reset,
  } = useAnalyze();

  const [loadingStepText, setLoadingStepText] = useState('Initializing research core...');

  const isIdle = !isLoading && !result.recommendation && !error;
  const showTimeline = isLoading || result.recommendation || error;

  // Compute progress percentage based on agent state
  const getProgressPercentage = () => {
    const completedCount = progress.filter((p) => p.status === 'completed').length;
    const runningAgent = progress.find((p) => p.status === 'running');
    let percent = completedCount * 25;
    if (runningAgent) {
      percent += 12; // Intermediate progress when running
    }
    return Math.min(percent, 100);
  };

  // Cycle loading logs dynamically based on the currently active agent
  useEffect(() => {
    if (!isLoading) return;
    const activeAgent = progress.find((p) => p.status === 'running');
    if (!activeAgent) return;

    let subtasks: string[] = [];
    if (activeAgent.id === 'research') {
      subtasks = [
        `Researching ${result.companyName || 'target'}...`,
        'Gathering latest news & events...',
        'Scouting regulatory filings and market position...',
        'Indexing business models and competitor landscape...'
      ];
    } else if (activeAgent.id === 'financial') {
      subtasks = [
        'Reading financial statements...',
        'Parsing balance sheet assets and liabilities...',
        'Analyzing profit margins and cash flow metrics...',
        'Assessing historical revenue trends...'
      ];
    } else if (activeAgent.id === 'risk') {
      subtasks = [
        'Evaluating risk vectors...',
        'Modeling macro-economic sensitivities...',
        'Analyzing competitive threat factors...',
        'Checking industry regulatory compliance...'
      ];
    } else if (activeAgent.id === 'decision') {
      subtasks = [
        'Synthesizing agent consensus...',
        'Generating conviction scoring matrices...',
        'Formulating final investment thesis...',
        'Compiling comprehensive source citations...'
      ];
    }

    let textIdx = 0;
    setLoadingStepText(subtasks[0] || 'Executing agent node...');

    const textInterval = setInterval(() => {
      textIdx = (textIdx + 1) % subtasks.length;
      setLoadingStepText(subtasks[textIdx]);
    }, 2800);

    return () => clearInterval(textInterval);
  }, [isLoading, progress, result.companyName]);

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Top Header Section */}
      <Header />

      {/* Search Input Section */}
      <div className="print:hidden">
        <SearchForm onSearch={analyze} isLoading={isLoading} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-8 flex-1">
        
        {/* Welcome screen (Idle state) */}
        {isIdle && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4"
          >
            {/* Main Welcome Message */}
            <div className="md:col-span-2 flex flex-col justify-center p-8 rounded-[20px] border border-[#1F2937] bg-slate-900/40 backdrop-blur-md">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 mb-6">
                <BarChart2 className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-wide">Enter a Stock to Begin Deep Research</h2>
              <p className="mt-3 text-sm text-[#94A3B8] leading-relaxed max-w-lg">
                Type any public company name in the search bar. The multi-agent coordinator will orchestrate 4 distinct Gemini AI agents to query the web in real-time, compute key ratios, audit weaknesses, and compile an institutional-quality recommendation.
              </p>
            </div>

            {/* Quick Capability Highlights */}
            <div className="space-y-4">
              {[
                { icon: Terminal, title: 'LangGraph Flow', desc: 'Visual step-by-step progress tracking of isolated AI nodes.', color: 'text-emerald-400' },
                { icon: Cpu, title: 'Gemini Rationale', desc: 'Deep synthesis of financial sheets and risks without assumptions.', color: 'text-emerald-555' },
                { icon: Layers, title: 'Source Audit', desc: 'Direct web link references and host site confidence ratings.', color: 'text-amber-400' }
              ].map((cap) => (
                <div key={cap.title} className="p-5 rounded-[20px] border border-[#1F2937] bg-slate-900/20 flex gap-4">
                  <cap.icon className={`h-6 w-6 ${cap.color} shrink-0 mt-0.5`} />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{cap.title}</h4>
                    <p className="text-xs text-[#94A3B8] mt-1.5 leading-normal">{cap.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Error Card */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[20px] border border-rose-500/20 bg-rose-500/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden"
          >
            <div className="flex gap-3.5">
              <AlertCircle className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Operational Research Blocked</h4>
                <p className="text-xs text-rose-300 mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
            <button
              onClick={() => analyze(result.companyName)}
              className="flex items-center gap-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 px-4.5 py-2.5 text-xs font-bold text-rose-300 transition-all shrink-0 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Search</span>
            </button>
          </motion.div>
        )}

        {/* Custom AI Workflow Loading Box */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-[20px] border border-[#1F2937] bg-slate-900/40 p-6 backdrop-blur-md print:hidden flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="relative h-16 w-16 flex items-center justify-center">
              {/* Spinner glows */}
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/25 border-t-emerald-500 animate-spin" />
              <div className="absolute h-10 w-10 rounded-full border border-emerald-700/20 border-b-emerald-700 animate-spin-reverse" style={{ animationDuration: '3s' }} />
              <Cpu className="h-5 w-5 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <span className="text-2xl font-black text-white">{getProgressPercentage()}%</span>
              <h3 className="text-sm font-bold text-slate-200 tracking-wide">{loadingStepText}</h3>
              <p className="text-xs text-[#94A3B8] max-w-xs">{statusMessage}</p>
            </div>

            {/* Glowing neon progress line */}
            <div className="w-full max-w-sm h-1.5 bg-slate-950/60 rounded-full overflow-hidden relative border border-[#1F2937]">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full"
                animate={{ width: `${getProgressPercentage()}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}

        {/* Workflow Progress Timeline */}
        {showTimeline && (
          <div className="print:hidden">
            <Timeline progress={progress} statusMessage={statusMessage} />
          </div>
        )}

        {/* Analysis Results View */}
        {result.recommendation && (
          <div className="mt-4">
            <ReportView result={result} onReset={reset} />
          </div>
        )}
      </div>

      {/* Styled Footer */}
      <footer className="mt-auto py-8 flex flex-col md:flex-row items-center justify-between border-t border-[#1F2937] text-slate-500 text-xs gap-4 print:hidden">
        <div className="text-center md:text-left">
          <p>© 2026 InsideIIM AI Product Development Engineer Intern Assignment.</p>
          <p className="mt-1 text-[10px] text-slate-600">Educational research prototype. Not certified financial advice.</p>
        </div>

        {/* Tech Stack Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 mr-1">Powered By</span>
          {[
            { name: 'Gemini', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-450' },
            { name: 'LangGraph', color: 'border-emerald-600/20 bg-emerald-600/5 text-emerald-400' },
            { name: 'Tavily Search', color: 'border-[#059669]/20 bg-[#059669]/5 text-emerald-350' },
            { name: 'Next.js', color: 'border-[#1F2937] bg-white/5 text-slate-350' },
            { name: 'TypeScript', color: 'border-emerald-500/10 bg-emerald-500/5 text-emerald-300' },
          ].map((tech) => (
            <span
              key={tech.name}
              className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${tech.color}`}
            >
              {tech.name}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
