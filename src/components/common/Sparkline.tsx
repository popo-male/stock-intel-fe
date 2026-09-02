import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color,
  width = 120,
  height = 36,
  className = '',
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Auto-detect color if not specified
  const isUp = data[data.length - 1] >= data[0];
  const strokeColor = color || (isUp ? 'var(--bullish)' : 'var(--bearish)');

  const padding = 4;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  const points = data
    .map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * usableWidth;
      const y = height - padding - ((val - min) / range) * usableHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className={`overflow-visible ${className}`} aria-hidden="true">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};
