import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface PredictionBadgeProps {
  direction?: 'UP' | 'DOWN' | string;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  showConfidence?: boolean;
  className?: string;
}

export const PredictionBadge: React.FC<PredictionBadgeProps> = ({
  direction = 'UP',
  confidence,
  size = 'md',
  showConfidence = true,
  className = '',
}) => {
  const dir = direction.toUpperCase();
  const isDown = dir === 'DOWN' || dir === 'BEARISH';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3.5 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  if (isDown) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-bearish-bg text-bearish border border-bearish-border ${sizeClasses[size]} ${className}`}
      >
        <ArrowDownRight size={iconSizes[size]} className="stroke-[2.5]" aria-hidden="true" />
        <span>DOWN</span>
        {showConfidence && confidence !== undefined && (
          <span className="opacity-90 font-mono text-[11px] ml-0.5">
            {Math.round(confidence * 100)}%
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-bullish-bg text-bullish border border-bullish-border ${sizeClasses[size]} ${className}`}
    >
      <ArrowUpRight size={iconSizes[size]} className="stroke-[2.5]" aria-hidden="true" />
      <span>UP</span>
      {showConfidence && confidence !== undefined && (
        <span className="opacity-90 font-mono text-[11px] ml-0.5">
          {Math.round(confidence * 100)}%
        </span>
      )}
    </span>
  );
};
