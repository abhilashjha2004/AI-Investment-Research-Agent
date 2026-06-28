import React from 'react';
import { AnalysisResult } from '@/types';
import { 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  BookOpen, 
  ExternalLink, 
  Printer, 
  RefreshCw,
  FileText,
  Bookmark
} from 'lucide-react';

interface ReportViewProps {
  result: AnalysisResult;
  onReset: () => void;
}

export default function ReportView({ result, onReset }: ReportViewProps) {
  const {
    companyName,
    researchSummary,
    financialAnalysis,
    riskAnalysis,
    recommendation,
    confidence,
    reasoning,
    sources
  } = result;

  const isInvest = recommendation === 'INVEST';
  const hasResult = recommendation !== '';

  // Extract lists of strengths & weaknesses from financial analysis text
  const extractList = (text: string, titleRegex: RegExp, stopRegex: RegExp): string[] => {
    const list: string[] = [];
    const lines = text.split('\n');
    let startCollecting = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (titleRegex.test(line)) {
        startCollecting = true;
        continue;
      }
      if (startCollecting && stopRegex.test(line)) {
        break;
      }
      if (startCollecting && (line.startsWith('-') || line.startsWith('*'))) {
        list.push(line.substring(1).trim());
      }
    }
    return list;
  };

  const strengths = extractList(
    financialAnalysis, 
    /financial strengths|strengths/i, 
    /###|financial weaknesses|weaknesses/i
  );
  
  const weaknesses = extractList(
    financialAnalysis, 
    /financial weaknesses|weaknesses/i, 
    /###|strengths/i
  );

  // Helper to format simple markdown text
  const formatMarkdown = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;
      
      if (trimmed.startsWith('###')) {
        return (
          <h4 key={idx} className="mt-4 mb-2 text-base font-bold text-white border-b border-white/5 pb-1">
            {trimmed.replace('###', '').trim()}
          </h4>
        );
      }
      if (trimmed.startsWith('##')) {
        return (
          <h3 key={idx} className="mt-6 mb-3 text-lg font-bold text-slate-100">
            {trimmed.replace('##', '').trim()}
          </h3>
        );
      }
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm text-slate-300 mb-1 leading-relaxed">
            {trimmed.substring(1).trim()}
          </li>
        );
      }
      
      // Basic bold formatting **text**
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={idx} className="text-sm text-slate-300 mb-2 leading-relaxed">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="text-white">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  // SVG Circular Gauge variables
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  const handlePrint = () => {
    window.print();
  };

  if (!hasResult) return null;

  return (
    <div className="space-y-6 print-container">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/5 bg-slate-900/40 p-4 backdrop-blur-sm print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-semibold text-slate-200">
            Report ready for {companyName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Download PDF / Print</span>
          </button>
          
          <button
            onClick={onReset}
            className="flex items-center gap-2 rounded-lg bg-blue-600/20 border border-blue-500/30 px-4 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-600/30 active:scale-95 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Grid of Decision Card & Core Financial Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Recommendation Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:col-span-2">
          <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-10 blur-2xl" />
          
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Investment Recommendation
              </span>
              
              <div className="flex items-center gap-4">
                {isInvest ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 shadow-lg shadow-emerald-500/10">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                    <div>
                      <div className="text-3xl font-extrabold text-emerald-400 tracking-wide">INVEST</div>
                      <div className="text-xs text-emerald-500/80 mt-0.5">High Conviction Case</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-6 py-4 shadow-lg shadow-rose-500/10">
                    <XCircle className="h-8 w-8 text-rose-400" />
                    <div>
                      <div className="text-3xl font-extrabold text-rose-400 tracking-wide">PASS</div>
                      <div className="text-xs text-rose-500/80 mt-0.5">Elevated Risks / Volatility</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Circular Gauge for Confidence Score */}
            <div className="flex items-center gap-4 border-l border-white/5 pl-0 sm:pl-6">
              <div className="relative flex items-center justify-center">
                <svg className="h-24 w-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke={isInvest ? '#34d399' : '#f87171'}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-white">{confidence}%</span>
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Confidence</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">Conviction Meter</h4>
                <p className="text-xs text-slate-400 max-w-[140px] mt-1 leading-relaxed">
                  Based on AI consensus of core financials and industry risk models.
                </p>
              </div>
            </div>
          </div>

          {/* Core Reasoning */}
          <div className="mt-6 border-t border-white/5 pt-5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Decision Rationale
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed italic bg-slate-950/20 rounded-xl p-4 border border-white/5">
              "{reasoning}"
            </p>
          </div>
        </div>

        {/* Overview & Quick Info Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bookmark className="h-5 w-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Research Summary</h3>
            </div>
            
            {/* Quick overview extracted from researchSummary */}
            <div className="text-xs text-slate-300 leading-relaxed line-clamp-12 overflow-hidden">
              {formatMarkdown(researchSummary)}
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-4 mt-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Searches Performed</span>
              <span className="text-white font-medium">Advanced (3 nodes)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health Analysis Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Financial Health Analysis</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Detailed Financial Breakdown Text */}
          <div className="space-y-4 pr-0 lg:pr-6 border-r border-white/0 lg:border-white/5">
            <div className="text-sm text-slate-300">
              {formatMarkdown(
                financialAnalysis
                  .replace(/###\s+Financial Strengths[\s\S]*?(?:###|$)/i, '')
                  .replace(/###\s+Financial Weaknesses[\s\S]*?(?:###|$)/i, '')
              )}
            </div>
          </div>

          {/* Bulleted Strengths and Weaknesses Grid */}
          <div className="space-y-6">
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-400 mb-3 uppercase tracking-wider">
                <TrendingUp className="h-4.5 w-4.5" /> Financial Strengths
              </h4>
              {strengths.length > 0 ? (
                <ul className="space-y-2">
                  {strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-2.5 text-xs text-slate-300 leading-normal">
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No explicit strengths listed in summary.</p>
              )}
            </div>

            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-rose-400 mb-3 uppercase tracking-wider">
                <TrendingDown className="h-4.5 w-4.5" /> Financial Weaknesses
              </h4>
              {weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {weaknesses.map((weak, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 rounded-lg bg-rose-500/5 border border-rose-500/10 p-2.5 text-xs text-slate-300 leading-normal">
                      <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No explicit weaknesses listed in summary.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Analysis Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-6">
          <ShieldAlert className="h-5 w-5 text-rose-400" />
          <h2 className="text-lg font-bold text-white">Risk & Vulnerability Factors</h2>
        </div>
        <div className="text-sm text-slate-300">
          {formatMarkdown(riskAnalysis)}
        </div>
      </div>

      {/* Sources Citations Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md print:hidden">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Research Citations & Sources</h3>
        {sources && sources.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {sources.map((url, idx) => {
              let domain = url;
              try {
                domain = new URL(url).hostname;
              } catch (_) {}
              
              return (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/20 p-3 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-semibold text-slate-300 truncate">
                      Source #{idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate mt-0.5">
                      {domain}
                    </span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" />
                </a>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No external sources used for this report.</p>
        )}
      </div>

      {/* Custom print CSS stylesheet block */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print:hidden {
            display: none !important;
          }
          .print-container {
            display: block !important;
            background: white !important;
            color: black !important;
          }
          .print-container * {
            color: black !important;
            border-color: #ddd !important;
          }
          .print-container .rounded-2xl,
          .print-container .rounded-xl {
            border: 1px solid #ccc !important;
            background: transparent !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }
          .print-container a {
            text-decoration: underline !important;
          }
        }
      `}</style>
    </div>
  );
}
