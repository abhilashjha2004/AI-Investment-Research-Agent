import React from 'react';
import { AgentProgress } from '@/types';
import { Search, DollarSign, AlertTriangle, FileCheck, CheckCircle2, ShieldAlert, Circle, Loader2 } from 'lucide-react';

interface TimelineProps {
  progress: AgentProgress[];
  statusMessage: string;
}

export default function Timeline({ progress, statusMessage }: TimelineProps) {
  const getIcon = (id: string, size = "h-5 w-5") => {
    switch (id) {
      case 'research':
        return <Search className={size} />;
      case 'financial':
        return <DollarSign className={size} />;
      case 'risk':
        return <AlertTriangle className={size} />;
      case 'decision':
        return <FileCheck className={size} />;
      default:
        return <Circle className={size} />;
    }
  };

  const getStatusColor = (status: AgentProgress['status']) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400 border-emerald-500 bg-emerald-950/30';
      case 'running':
        return 'text-blue-400 border-blue-500 bg-blue-950/30 shadow-lg shadow-blue-500/20';
      case 'failed':
        return 'text-rose-400 border-rose-500 bg-rose-950/30';
      default:
        return 'text-slate-500 border-slate-700 bg-slate-900/40';
    }
  };

  const getStatusBadge = (status: AgentProgress['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" /> Running
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
            <ShieldAlert className="h-3 w-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">Agent Execution Status</h2>
        {statusMessage && (
          <p className="mt-1.5 text-sm text-slate-300 flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
            <span>{statusMessage}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
        {progress.map((p, idx) => {
          const isCompleted = p.status === 'completed';
          const isRunning = p.status === 'running';
          
          return (
            <div
              key={p.id}
              className={`relative flex flex-col items-start rounded-xl border p-5 transition-all duration-300 ${
                isRunning
                  ? 'border-blue-500/40 bg-white/5 shadow-md shadow-blue-500/5'
                  : isCompleted
                  ? 'border-emerald-500/20 bg-emerald-950/5'
                  : 'border-white/5 bg-transparent'
              }`}
            >
              {/* Connector line between steps (shown on large screens) */}
              {idx < progress.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-3 w-6 h-0.5 bg-slate-800 z-0">
                  <div
                    className={`h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ${
                      isCompleted ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}

              <div className="flex items-center justify-between w-full z-10">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 ${getStatusColor(
                    p.status
                  )} ${isRunning ? 'animate-pulse' : ''}`}
                >
                  {getIcon(p.id)}
                </div>
                {getStatusBadge(p.status)}
              </div>

              <h3 className="mt-4 text-sm font-bold text-white">{p.name}</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">{p.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
