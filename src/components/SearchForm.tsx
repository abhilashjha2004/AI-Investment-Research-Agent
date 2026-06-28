import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

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
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="company-search" className="block text-sm font-medium text-slate-300">
          Enter Company Name for Research
        </label>
        
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              id="company-search"
              type="text"
              placeholder="e.g. Tesla, Nvidia, Apple..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3.5 pr-4 pl-12 text-white placeholder-slate-500 shadow-inner outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-purple-500/20 hover:from-blue-500 hover:to-purple-500 active:scale-98 disabled:pointer-events-none disabled:opacity-50 transition-all duration-150"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <span>Start Analysis</span>
            )}
          </button>
        </div>
      </form>

      <div className="mt-4">
        <span className="text-xs text-slate-400">Suggestions:</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s.symbol}
              type="button"
              disabled={isLoading}
              onClick={() => handleSuggestionClick(s.name)}
              className="rounded-lg border border-white/5 bg-slate-950/20 px-3 py-1.5 text-xs text-slate-300 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white disabled:pointer-events-none disabled:opacity-50 transition-all duration-150"
            >
              {s.name} <span className="text-slate-500">({s.symbol})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
