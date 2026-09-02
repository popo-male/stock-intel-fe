import React from 'react';

interface SentimentPillProps {
  score?: number | null;
  label?: string | null;
  showScore?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const SentimentPill: React.FC<SentimentPillProps> = ({
  score,
  label,
  showScore = true,
  size = 'md',
  className = '',
}) => {
  if (score === undefined || score === null) {
    return (
      <span className="text-xs text-text-muted font-mono">--</span>
    );
  }

  const isPos = score >= 0.15;
  const isNeg = score <= -0.15;

  const resolvedLabel = label || (isPos ? 'Positive' : (isNeg ? 'Negative' : 'Neutral'));

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  const colorClasses = isPos
    ? 'bg-bullish-bg text-bullish border-bullish-border'
    : isNeg
    ? 'bg-bearish-bg text-bearish border-bearish-border'
    : 'bg-neutral-bg text-neutral-brand border-neutral-border';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className="capitalize">{resolvedLabel}</span>
      {showScore && (
        <span className="font-mono text-[10px] opacity-80">
          ({score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)})
        </span>
      )}
    </span>
  );
};
