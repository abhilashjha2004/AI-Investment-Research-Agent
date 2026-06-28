import React, { useEffect, useState } from 'react';
import { AgentProgress } from '@/types';
import { Search, DollarSign, AlertTriangle, FileCheck, CheckCircle2, ShieldAlert, Loader2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineProps {
  progress: AgentProgress[];
  statusMessage: string;
}

interface LogEntry {
  timestamp: string;
  message: string;
  status: AgentProgress['status'];
  id: string;
}

const agentConfig = {
  research: {
    accent: 'purple',
    icon: Search,
    colorClass: 'text-purple-400 border-purple-555 bg-purple-950/15 shadow-purple-500/5',
    borderClass: 'border-purple-500/20',
    bgActive: 'bg-purple-500/3',
    activeGlow: 'shadow-md shadow-purple-500/5',
  },
  financial: {
    accent: 'emerald',
    icon: DollarSign,
    colorClass: 'text-emerald-400 border-emerald-555 bg-emerald-950/15 shadow-emerald-500/5',
    borderClass: 'border-emerald-500/20',
    bgActive: 'bg-emerald-500/3',
    activeGlow: 'shadow-md shadow-emerald-500/5',
  },
  risk: {
    accent: 'orange',
    icon: AlertTriangle,
    colorClass: 'text-orange-400 border-orange-555 bg-orange-950/15 shadow-orange-500/5',
    borderClass: 'border-orange-500/20',
    bgActive: 'bg-orange-500/3',
    activeGlow: 'shadow-md shadow-orange-500/5',
  },
  decision: {
    accent: 'amber',
    icon: FileCheck,
    colorClass: 'text-amber-400 border-amber-555 bg-amber-950/15 shadow-amber-500/5',
    borderClass: 'border-amber-500/20',
    bgActive: 'bg-amber-500/3',
    activeGlow: 'shadow-md shadow-amber-500/5',
  },
};

export default function Timeline({ progress, statusMessage }: TimelineProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Log transitions dynamically based on state changes to create a live execution feed
  useEffect(() => {
    const allPending = progress.every((p) => p.status === 'pending');
    if (allPending) {
      setLogs([]);
      return;
    }

    progress.forEach((agent) => {
      if (agent.status !== 'pending') {
        const logKey = `${agent.id}-${agent.status}`;
        
        setLogs((prevLogs) => {
          const exists = prevLogs.some((l) => `${l.id}-${l.status}` === logKey);
          if (!exists) {
            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS format
            let logMsg = '';

            if (agent.status === 'running') {
              if (agent.id === 'research') logMsg = 'Research Agent Started: Gathering news and filings...';
              else if (agent.id === 'financial') logMsg = 'Financial Agent Started: Inspecting margins and strengths...';
              else if (agent.id === 'risk') logMsg = 'Risk Agent Started: Modeling exposure and vulnerabilities...';
              else if (agent.id === 'decision') logMsg = 'Decision Agent Started: Compiling recommendation criteria...';
            } else if (agent.status === 'completed') {
              if (agent.id === 'research') logMsg = 'Research Completed: Market overview and news indexed';
              else if (agent.id === 'financial') logMsg = 'Financial Analysis Completed: Core sheets parsed';
              else if (agent.id === 'risk') logMsg = 'Risk Evaluation Completed: Severity scores mapped';
              else if (agent.id === 'decision') logMsg = 'Decision Compiled: Conviction score generated';
            } else if (agent.status === 'failed') {
              logMsg = `Error: ${agent.name} failed during operational step`;
            }

            if (logMsg) {
              return [...prevLogs, { timestamp: timeStr, message: logMsg, status: agent.status, id: agent.id }];
            }
          }
          return prevLogs;
        });
      }
    });
  }, [progress]);

  const getStatusBadge = (status: AgentProgress['status'], agentId: string) => {
    const accentColor = agentConfig[agentId as keyof typeof agentConfig]?.accent || 'emerald';
    
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Done
          </span>
        );
      case 'running':
        let runBg = 'bg-emerald-500/10 text-emerald-400';
        if (accentColor === 'purple') runBg = 'bg-purple-500/10 text-purple-400';
        else if (accentColor === 'orange') runBg = 'bg-orange-500/10 text-orange-400';
        else if (accentColor === 'amber') runBg = 'bg-amber-500/10 text-amber-400';

        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold animate-pulse ${runBg}`}>
            <Loader2 className="h-3 w-3 animate-spin" /> Active
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
            <ShieldAlert className="h-3 w-3" /> Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
            Ready
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Agent execution status cards container */}
      <div className="w-full rounded-[20px] border border-[#1F2937] bg-slate-900/40 p-6 backdrop-blur-md">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Multi-Agent Workflow Operations</h2>
            <p className="text-xs text-[#94A3B8] mt-1">Four specialized subagents executing a sequential LangGraph chain</p>
          </div>
          {statusMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-xs font-medium text-emerald-300">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
          {progress.map((p, idx) => {
            const config = agentConfig[p.id as keyof typeof agentConfig] || agentConfig.financial;
            const StepIcon = config.icon;
            
            const isCompleted = p.status === 'completed';
            const isRunning = p.status === 'running';
            const isFailed = p.status === 'failed';
            
            let cardBorder = 'border-[#1F2937] bg-transparent';
            if (isRunning) cardBorder = `${config.borderClass} ${config.bgActive} ${config.activeGlow}`;
            else if (isCompleted) cardBorder = 'border-emerald-500/15 bg-emerald-950/5';
            else if (isFailed) cardBorder = 'border-rose-500/15 bg-rose-950/5';

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative flex flex-col items-start rounded-[18px] border p-5 transition-all duration-300 ${cardBorder}`}
              >
                {/* Connector line between steps (shown on large screens) */}
                {idx < progress.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-3.5 w-7 h-0.5 bg-slate-800 z-0">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: isCompleted ? '100%' : '0%' }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between w-full z-10">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 ${
                      isRunning ? 'animate-pulse' : ''
                    } ${
                      isCompleted 
                        ? 'text-emerald-400 border-emerald-500 bg-emerald-950/30' 
                        : isFailed 
                        ? 'text-rose-400 border-rose-500 bg-rose-950/30' 
                        : isRunning 
                        ? config.colorClass 
                        : 'text-slate-500 border-slate-700 bg-slate-900/40'
                    }`}
                  >
                    <StepIcon className="h-5 w-5" />
                  </div>
                  {getStatusBadge(p.status, p.id)}
                </div>

                <h3 className="mt-4 text-sm font-bold text-white tracking-wide">{p.name}</h3>
                <p className="mt-1 text-xs text-[#94A3B8] leading-relaxed min-h-[32px]">{p.description}</p>
                
                {/* Animated status bar under card text when running */}
                {isRunning && (
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-4">
                    <motion.div
                      animate={{ x: [-100, 200] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                      className="h-full w-24 bg-gradient-to-r from-emerald-500 to-emerald-700"
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Live Log Timeline */}
      {logs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-[20px] border border-[#1F2937] bg-slate-900/40 p-6 backdrop-blur-md"
        >
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-wider uppercase">Live Activity Timeline</h3>
          </div>
          
          <div className="relative pl-6 border-l border-slate-800 space-y-4">
            <AnimatePresence initial={false}>
              {logs.map((log, lIdx) => {
                const isErr = log.status === 'failed';
                const isRun = log.status === 'running';
                
                // Color timeline markers to match each agent specifically
                let dotColor = 'bg-emerald-400 border-emerald-500';
                let textColor = 'text-slate-300';
                
                if (isErr) {
                  dotColor = 'bg-rose-500 border-rose-600';
                  textColor = 'text-rose-400';
                } else {
                  if (log.id === 'research') {
                    dotColor = isRun ? 'bg-purple-400 border-purple-500 animate-pulse shadow-md shadow-purple-500/10' : 'bg-purple-550 border-purple-600';
                    textColor = isRun ? 'text-purple-300' : 'text-slate-300';
                  } else if (log.id === 'financial') {
                    dotColor = isRun ? 'bg-emerald-400 border-emerald-500 animate-pulse shadow-md shadow-emerald-500/10' : 'bg-emerald-550 border-emerald-600';
                    textColor = isRun ? 'text-emerald-300' : 'text-slate-300';
                  } else if (log.id === 'risk') {
                    dotColor = isRun ? 'bg-orange-400 border-orange-500 animate-pulse shadow-md shadow-orange-500/10' : 'bg-orange-550 border-orange-600';
                    textColor = isRun ? 'text-orange-300' : 'text-slate-300';
                  } else if (log.id === 'decision') {
                    dotColor = isRun ? 'bg-amber-400 border-amber-500 animate-pulse shadow-md shadow-amber-500/10' : 'bg-amber-550 border-amber-600';
                    textColor = isRun ? 'text-amber-300' : 'text-slate-300';
                  }
                }
                
                return (
                  <motion.div
                    key={`${log.id}-${log.status}`}
                    initial={{ opacity: 0, x: -10, y: -5 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative flex items-center justify-between text-xs"
                  >
                    {/* Circle Dot Marker */}
                    <div className={`absolute -left-[30px] h-2.5 w-2.5 rounded-full border ${dotColor}`} />

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-500">{log.timestamp}</span>
                      <span className={`font-medium ${textColor}`}>
                        {log.message}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
