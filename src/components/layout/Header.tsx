import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sun,
  Moon,
  Monitor,
  Search,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useStock } from '../../context/StockContext';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const { theme, setTheme } = useTheme();
  const { setIsSearchOpen } = useStock();

  return (
    <header className="sticky top-0 z-30 w-full bg-surface/90 backdrop-blur-md border-b border-border-subtle transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-hover"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white shadow-md shadow-accent-primary/20">
              <TrendingUp size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-text-primary group-hover:text-accent-primary transition-colors flex items-center gap-1.5">
                STOCK INTEL
              </span>
              <span className="hidden sm:block text-[11px] text-text-muted leading-none">
                Multimodal Sentiment & Trend Intelligence
              </span>
            </div>
          </NavLink>
        </div>

        {/* Global Quick Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex-1 max-w-md hidden sm:flex items-center justify-between px-3.5 py-2 rounded-xl bg-surface-raised border border-border-subtle hover:border-border-strong text-text-muted text-xs transition-all cursor-pointer shadow-sm"
          aria-label="Search ticker symbol"
        >
          <div className="flex items-center gap-2">
            <Search size={15} />
            <span>Search ticker (NVDA, AAPL, TSLA)...</span>
          </div>
          <kbd className="font-mono text-[10px] bg-surface border border-border-subtle px-1.5 py-0.5 rounded text-text-secondary shadow-xs">
            /
          </kbd>
        </button>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile search icon */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-hover"
            aria-label="Open search"
          >
            <Search size={18} />
          </button>

          {/* Theme Mode Selector */}
          <div className="flex items-center bg-surface-raised p-1 rounded-xl border border-border-subtle">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                theme === 'light'
                  ? 'bg-surface text-accent-primary shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Light Mode"
              aria-label="Switch to Light Theme"
            >
              <Sun size={15} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-surface text-accent-primary shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Dark Mode"
              aria-label="Switch to Dark Theme"
            >
              <Moon size={15} />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-lg text-xs transition-colors hidden sm:block ${
                theme === 'system'
                  ? 'bg-surface text-accent-primary shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="System Theme"
              aria-label="Match System Theme"
            >
              <Monitor size={15} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
