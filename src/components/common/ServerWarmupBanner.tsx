import React, { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { getSystemHealth } from '../../services/api';

export const ServerWarmupBanner: React.FC = () => {
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;

    // Trigger timer if server response takes > 2.5 seconds
    timer = setTimeout(() => {
      if (isMounted && isOnline === null) {
        setIsWarmingUp(true);
        interval = setInterval(() => {
          setElapsed((prev) => prev + 1);
        }, 1000);
      }
    }, 2500);

    const pingServer = async () => {
      try {
        await getSystemHealth();
        if (isMounted) {
          setIsOnline(true);
          if (isWarmingUp) {
            // Keep green "Connected" badge for 3 seconds then fade out
            setTimeout(() => {
              if (isMounted) setIsWarmingUp(false);
            }, 3000);
          }
        }
      } catch (err) {
        if (isMounted) {
          setIsWarmingUp(true);
        }
      } finally {
        if (timer) clearTimeout(timer);
        if (interval) clearInterval(interval);
      }
    };

    pingServer();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, []);

  if (!isWarmingUp && isOnline !== null) return null;

  return (
    <aside
      aria-label="Server status notification"
      className="fixed bottom-4 right-4 z-50 max-w-sm w-full transition-all duration-300 transform translate-y-0"
    >
      <div
        className={`p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all ${
          isOnline
            ? 'bg-surface/95 border-bullish-border text-text-primary'
            : 'bg-surface/95 border-amber-500/40 text-text-primary'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-xl shrink-0 mt-0.5 ${
              isOnline
                ? 'bg-bullish-bg text-bullish'
                : 'bg-amber-500/10 text-amber-500'
            }`}
          >
            {isOnline ? (
              <CheckCircle2 size={18} />
            ) : (
              <RefreshCw size={18} className="animate-spin" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                {isOnline ? 'Backend Connected' : 'Waking Up Server...'}
              </span>
              {!isOnline && (
                <span className="font-mono text-[10px] text-amber-500 font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {elapsed}s
                </span>
              )}
            </div>

            <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
              {isOnline
                ? 'Live API connection established with Neon DB and inference services.'
                : 'Render free instances spin down during inactivity. Booting container & loading AI models (~30-50s)...'}
            </p>

            {!isOnline && (
              <div className="mt-2.5 h-1.5 w-full bg-surface-raised rounded-full overflow-hidden border border-border-subtle">
                <div className="h-full bg-gradient-to-r from-amber-500 to-accent-primary animate-pulse w-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
