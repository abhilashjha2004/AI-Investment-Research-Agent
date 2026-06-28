'use client';

import React from 'react';
import Header from '@/components/Header';
import SearchForm from '@/components/SearchForm';
import Timeline from '@/components/Timeline';
import ReportView from '@/components/ReportView';
import { useAnalyze } from '@/hooks/useAnalyze';
import { AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';

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

  const isIdle = !isLoading && !result.recommendation && !error;
  const showTimeline = isLoading || result.recommendation || error;

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Top Header */}
      <Header />

      {/* Search Input Section */}
      <div className="print:hidden">
        <SearchForm onSearch={analyze} isLoading={isLoading} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-6">
        
        {/* Welcome screen (Idle state) */}
        {isIdle && (
          <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-white/5 bg-white/2 pb-16 mt-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 mb-6">
              <BarChart2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Ready for Stock Research</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-md leading-relaxed">
              Enter a company name above or click one of the quick suggestions. The system will launch a LangGraph agent workflow to fetch information, analyze financials, evaluate risks, and issue an investment recommendation.
            </p>
          </div>
        )}

        {/* Error Card */}
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Analysis Failed</h4>
                <p className="text-xs text-rose-300 mt-1 leading-normal">{error}</p>
              </div>
            </div>
            <button
              onClick={() => analyze(result.companyName)}
              className="flex items-center gap-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 px-4 py-2 text-xs font-semibold text-rose-400 transition-all shrink-0"
            >
              <RefreshCw className="h-4.5 w-4.5" />
              <span>Retry Search</span>
            </button>
          </div>
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

      {/* Small subtle footer */}
      <footer className="mt-auto py-8 text-center text-xs text-slate-500 border-t border-white/5 print:hidden">
        <p>© 2026 InsideIIM AI Product Development Engineer Intern Assignment.</p>
        <p className="mt-1">For demonstration and research purposes only. Not financial advice.</p>
      </footer>
    </div>
  );
}
