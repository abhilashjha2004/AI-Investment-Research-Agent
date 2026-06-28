import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Cpu, Compass, Search, DollarSign, ShieldAlert, FileCheck, Star } from 'lucide-react';

const workflowSteps = [
  { id: 'research', name: 'Research AI', icon: Search, color: 'from-purple-600 to-indigo-750', glow: 'rgba(124, 58, 237, 0.12)' },
  { id: 'financial', name: 'Financial AI', icon: DollarSign, color: 'from-emerald-600 to-teal-750', glow: 'rgba(16, 185, 129, 0.12)' },
  { id: 'risk', name: 'Risk AI', icon: ShieldAlert, color: 'from-orange-600 to-amber-700', glow: 'rgba(249, 115, 22, 0.12)' },
  { id: 'decision', name: 'Decision AI', icon: FileCheck, color: 'from-amber-500 to-yellow-600', glow: 'rgba(245, 158, 11, 0.12)' },
];

export default function Header() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Rotate highlighted step in the hero visualizer for a live "AI operating" feel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % workflowSteps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative w-full overflow-hidden rounded-[20px] border border-[#1F2937] bg-slate-900/40 p-6 backdrop-blur-xl transition-all duration-300 md:p-10 lg:p-12">
      {/* Decorative subtle emerald background glows */}
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-650/3 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-650/3 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-emerald-500/2 blur-3xl pointer-events-none" />

      {/* Background glowing particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-emerald-500/10"
            style={{
              width: Math.random() * 3 + 2,
              height: Math.random() * 3 + 2,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.6, 0.1],
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        {/* Left Column: Hero Text */}
        <div className="flex flex-col items-start text-left lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-800 shadow-lg shadow-emerald-550/10">
              <TrendingUp className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/5 px-3 py-1 text-[11px] font-semibold text-emerald-400">
              <Star className="h-3 w-3 fill-emerald-400 text-emerald-400" />
              <span>InvestResearch AI v1.0</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl"
          >
            InvestResearch <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500">AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-base text-[#94A3B8] max-w-xl leading-relaxed md:text-lg"
          >
            Perform in-depth multi-agent financial research on any public company. Launch a coordinated team of LangGraph agents to analyze filings, weigh risks, and compile institutional-grade reports.
          </motion.p>

          {/* Feature Badges */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-2.5"
          >
            <div className="flex items-center gap-2 rounded-xl border border-[#1F2937] bg-slate-950/40 px-3.5 py-2 text-xs text-slate-300 backdrop-blur-sm transition-all hover:bg-slate-950/60">
              <Cpu className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">LangGraph Orchestrated</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#1F2937] bg-slate-950/40 px-3.5 py-2 text-xs text-slate-300 backdrop-blur-sm transition-all hover:bg-slate-950/60">
              <Compass className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">Tavily Web Search</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#1F2937] bg-slate-950/40 px-3.5 py-2 text-xs text-slate-300 backdrop-blur-sm transition-all hover:bg-slate-950/60">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">Gemini 1.5 Pro</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Interactive AI Workflow Visualization */}
        <div className="relative flex flex-col items-center justify-center lg:col-span-5 border-t border-[#1F2937] lg:border-t-0 pt-8 lg:pt-0 lg:pl-6">
          <div className="w-full max-w-xs flex flex-col items-center relative gap-2">
            
            {workflowSteps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = idx === activeStepIndex;
              
              return (
                <React.Fragment key={step.id}>
                  {/* Step Card */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.04 : 1,
                      borderColor: isActive ? 'rgba(16, 185, 129, 0.2)' : '#1F2937',
                      backgroundColor: isActive ? 'rgba(17, 24, 39, 0.85)' : 'rgba(17, 24, 39, 0.5)',
                      boxShadow: isActive ? `0 0 15px ${step.glow}` : 'none',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-full flex items-center justify-between rounded-[18px] border p-4 z-10"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${step.color} shadow-sm text-white`}>
                        <StepIcon className="h-4.5 w-4.5" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-semibold text-white">{step.name}</div>
                        <div className="text-[10px] text-[#94A3B8]">
                          {isActive ? 'Processing Context...' : 'Standby / Ready'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isActive && (
                        <motion.span
                          layoutId="active-dot"
                          className="h-2 w-2 rounded-full bg-emerald-400"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                      )}
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {isActive ? 'Active' : 'Idle'}
                      </span>
                    </div>
                  </motion.div>

                  {/* Flow Connector Arrow */}
                  {idx < workflowSteps.length - 1 && (
                    <div className="h-6 flex items-center justify-center relative w-full">
                      {/* Animated dot sliding down the connector */}
                      {isActive && (
                        <motion.div
                          initial={{ y: -12, opacity: 0 }}
                          animate={{ y: 12, opacity: [0, 1, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute h-2.5 w-2.5 rounded-full bg-emerald-400 blur-[2px] z-20"
                        />
                      )}
                      {/* Connector Line */}
                      <div className={`w-0.5 h-full transition-colors duration-500 ${isActive ? 'bg-emerald-500/20' : 'bg-slate-800'}`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

          </div>
        </div>
      </div>
    </header>
  );
}
