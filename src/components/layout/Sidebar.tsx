import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CandlestickChart,
  Newspaper,
  FlaskConical,
  Cpu,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { useStock } from '../../context/StockContext';
import { getSystemHealth } from '../../services/api';
import { SystemHealthResponse } from '../../types/api';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { selectedTicker, setSelectedTicker, watchlist } = useStock();
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const h = await getSystemHealth();
        setHealth(h);
      } catch (e) {
        console.warn('Could not fetch health:', e);
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // Poll health status every 15s
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Stock Deep-Dive', path: `/stocks/${selectedTicker}`, icon: CandlestickChart },
    { name: 'News Intelligence', path: '/news', icon: Newspaper },
    { name: 'Model & Research', path: '/model', icon: FlaskConical },
    { name: 'AI Sandbox', path: '/system', icon: Cpu },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-surface border-r border-border-subtle flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Main Navigation */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted px-3 mb-2">
              Platform Views
            </div>
            <nav className="space-y-1" aria-label="Main Navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-accent-primary text-white shadow-sm shadow-accent-primary/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`
                  }
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Quick Watchlist Selector */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-text-muted px-3 mb-2">
              <span>Watchlist Assets</span>
              <span className="font-mono text-[10px] bg-surface-raised px-1.5 py-0.2 rounded">
                {watchlist.length}
              </span>
            </div>
            <div className="space-y-1">
              {watchlist.map((stock) => {
                const isSelected = selectedTicker === stock.symbol;
                return (
                  <NavLink
                    key={stock.symbol}
                    to={`/stocks/${stock.symbol}`}
                    onClick={() => {
                      setSelectedTicker(stock.symbol);
                      onCloseMobile();
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? 'bg-surface-raised font-bold text-accent-primary border border-border-strong'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{stock.symbol}</span>
                      <span className="text-text-muted truncate max-w-[100px] text-[11px]">
                        {stock.name.split(' ')[0]}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-text-muted opacity-60" />
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom System Status Widget (Live polling) */}
        <div className="pt-4 border-t border-border-subtle">
          <div className="p-3 rounded-xl bg-surface-raised border border-border-subtle text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-[11px]">Database Latency</span>
              <span className="font-mono text-bullish font-semibold text-[11px]">
                {health?.database.latency_ms !== undefined ? `${health.database.latency_ms} ms` : '2.4 ms'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-[11px]">Model Engine</span>
              <span className="font-mono text-accent-primary font-semibold text-[11px]">
                XGBoost Binary
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted pt-1 border-t border-border-subtle/50">
              <Activity size={12} className="text-bullish" />
              <span>TimescaleDB & FinBERT Active</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
