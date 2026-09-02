import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Sparkline } from './Sparkline';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  changePct?: number;
  icon?: LucideIcon;
  sparklineData?: number[];
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  changePct,
  icon: Icon,
  sparklineData,
  className = '',
}) => {
  const isPos = changePct !== undefined && changePct > 0;
  const isNeg = changePct !== undefined && changePct < 0;

  return (
    <div
      className={`bg-surface border border-border-subtle rounded-xl p-5 shadow-sm hover:border-border-strong transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-surface-raised text-text-muted">
            <Icon size={18} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-3 mt-1">
        <div className="text-2xl font-bold font-mono text-text-primary tracking-tight">
          {value}
        </div>
        {changePct !== undefined && (
          <span
            className={`inline-flex items-center text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
              isPos
                ? 'bg-bullish-bg text-bullish'
                : isNeg
                ? 'bg-bearish-bg text-bearish'
                : 'bg-neutral-bg text-neutral-brand'
            }`}
          >
            {isPos ? `+${changePct.toFixed(2)}%` : `${changePct.toFixed(2)}%`}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border-subtle/50 text-xs text-text-muted">
        {subtext && <span>{subtext}</span>}
        {sparklineData && sparklineData.length > 1 && (
          <div className="ml-auto">
            <Sparkline data={sparklineData} width={80} height={24} />
          </div>
        )}
      </div>
    </div>
  );
};
