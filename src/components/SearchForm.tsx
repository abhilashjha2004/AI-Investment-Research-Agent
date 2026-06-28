import React, { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchFormProps {
  onSearch: (company: string) => void;
  isLoading: boolean;
}

const suggestions = [
  { name: 'Tesla', symbol: 'TSLA' },
  { name: 'Nvidia', symbol: 'NVDA' },
  { name: 'Apple', symbol: 'AAPL' },
  { name: 'Microsoft', symbol: 'MSFT' },
  { name: 'Amazon', symbol: 'AMZN' },
];

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleSuggestionClick = (name: string) => {
    if (!isLoading) {
      setQuery(name);
      onSearch(name);
    }
  };

  return (
    <div className="w-full rounded-[20px] border border-[#1F2937] bg-slate-900/40 p-6 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="company-search" className="block text-sm font-semibold text-[#94A3B8] tracking-wide">
          Search Company Directory
        </label>
        
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              id="company-search"
              type="text"
              placeholder="Search any public company..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-[18px] border border-[#1F2937] bg-slate-950/60 py-4 pr-4 pl-12 text-[#F8FAFC] placeholder-slate-500 shadow-inner outline-none transition-all duration-200 focus:border-emerald-500/25 focus:ring-1 focus:ring-emerald-500/25 focus:bg-slate-950/80 disabled:opacity-50 text-sm md:text-base"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)' }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading || !query.trim()}
            className="relative overflow-hidden flex items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 font-bold text-[#F8FAFC] shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/15 disabled:pointer-events-none disabled:opacity-50 transition-all duration-200 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Running Workflow...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5 text-emerald-200" />
                <span>Analyze Company</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-xs font-semibold text-[#94A3B8] tracking-wide uppercase shrink-0">
          Try Researching:
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              key={s.symbol}
              type="button"
              disabled={isLoading}
              onClick={() => handleSuggestionClick(s.name)}
              className="rounded-xl border border-[#1F2937] bg-slate-950/30 px-3.5 py-1.5 text-xs text-slate-300 hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:text-[#F8FAFC] disabled:pointer-events-none disabled:opacity-40 transition-all duration-200 cursor-pointer"
            >
              {s.name} <span className="text-slate-500 font-medium">({s.symbol})</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
