import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp } from 'lucide-react';
import { useStock } from '../../context/StockContext';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, watchlist, setSelectedTicker } = useStock();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.metaKey && e.key === 'k') || (e.ctrlKey && e.key === 'k')) && !isSearchOpen) {
        // Only trigger if not typing inside an input
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsSearchOpen(true);
        }
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredStocks = watchlist.filter(
    (s) =>
      s.symbol.toLowerCase().includes(query.toLowerCase()) ||
      s.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (symbol: string) => {
    setSelectedTicker(symbol);
    setIsSearchOpen(false);
    setQuery('');
    navigate(`/stocks/${symbol}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-surface border border-border-strong rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center px-4 border-b border-border-subtle">
          <Search size={20} className="text-text-muted mr-3" />
          <input
            type="text"
            placeholder="Search symbol (e.g. NVDA, AAPL) or company..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full py-4 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-base"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary"
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handleSelect(stock.symbol)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-hover text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center font-mono font-bold text-xs text-accent-primary">
                    {stock.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-mono font-bold text-text-primary text-sm flex items-center gap-1.5">
                      {stock.symbol}
                      <TrendingUp size={12} className="opacity-0 group-hover:opacity-100 text-bullish transition-opacity" />
                    </div>
                    <div className="text-xs text-text-muted">{stock.name}</div>
                  </div>
                </div>
                <span className="text-xs font-mono text-text-muted px-2 py-1 rounded bg-surface-raised">
                  View Ticker
                </span>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-text-muted text-sm">
              No matching stocks found for "{query}"
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 bg-surface-raised border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
          <span>Navigate with arrows, Enter to select</span>
          <span className="font-mono bg-surface border border-border-subtle px-1.5 py-0.5 rounded">ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
