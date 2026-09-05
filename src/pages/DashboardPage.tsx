import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  TrendingUp,
  Activity,
  Newspaper,
  Flame,
  BrainCircuit,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  getDashboardSummary,
  getMarketOverview,
  getSentimentComparison,
  getKeywordFrequency,
} from '../services/api';
import {
  DashboardSummary,
  MarketOverviewItem,
  TimeRange,
} from '../types/api';
import { StatCard } from '../components/common/StatCard';
import { Sparkline } from '../components/common/Sparkline';
import { PredictionBadge } from '../components/common/PredictionBadge';
import { SentimentPill } from '../components/common/SentimentPill';
import { Skeleton } from '../components/common/SkeletonLoader';
import { useStock } from '../context/StockContext';

export const DashboardPage: React.FC = () => {
  const { setSelectedTicker } = useStock();
  const [range, setRange] = useState<TimeRange>('7d');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [marketList, setMarketList] = useState<MarketOverviewItem[]>([]);
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [sumRes, mktRes, sentRes, kwRes] = await Promise.all([
          getDashboardSummary(range),
          getMarketOverview(),
          getSentimentComparison(range),
          getKeywordFrequency(range),
        ]);
        setSummary(sumRes);
        setMarketList(mktRes);
        setSentimentData(sentRes);
        setKeywords(kwRes);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [range]);

  const ranges: { label: string; value: TimeRange }[] = [
    { label: '24H', value: '1d' },
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: 'ALL', value: 'all' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Time Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            Market Command Center
            <span className="text-xs font-normal text-text-muted bg-surface-raised px-2.5 py-1 rounded-full border border-border-subtle">
              Mag 7 + Benchmark
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Real-time market movements combined with FinBERT precision news sentiment and AI predictions.
          </p>
        </div>

        {/* Range Segmented Control */}
        <div className="flex items-center bg-surface-raised p-1 rounded-xl border border-border-subtle self-start sm:self-auto">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                range === r.value
                  ? 'bg-surface text-accent-primary shadow-xs border border-border-subtle'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading || !summary ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))
        ) : (
          <>
            <StatCard
              title="Market Sentiment"
              value={summary.overall_market_sentiment !== null ? `${summary.overall_market_sentiment > 0 ? '+' : ''}${Number(summary.overall_market_sentiment).toFixed(2)}` : '--'}
              subtext={`${summary.total_articles} articles analyzed (${summary.overall_sentiment_label || 'neutral'})`}
              icon={Activity}
            />
            <StatCard
              title="Top Market Gainer"
              value={summary.todays_biggest_gainer?.ticker || '--'}
              changePct={summary.todays_biggest_gainer?.price_change_pct}
              subtext={summary.todays_biggest_gainer?.close_price ? `$${Number(summary.todays_biggest_gainer.close_price).toFixed(2)} Close` : undefined}
              icon={TrendingUp}
            />
            <StatCard
              title="Top News Coverage"
              value={summary.stock_with_most_articles?.ticker || '--'}
              subtext={`${summary.stock_with_most_articles?.article_count || 0} news items in ${range}`}
              icon={Newspaper}
            />
            <StatCard
              title="Forecast Consensus"
              value={`${summary.prediction_consensus?.up_count || 0} UP / ${summary.prediction_consensus?.down_count || 0} DOWN`}
              subtext={`Avg confidence: ${Math.round((summary.prediction_consensus?.avg_confidence || 0) * 100)}%`}
              icon={BrainCircuit}
            />
          </>
        )}
      </div>

      {/* Watchlist Card Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            Watchlist Overview
            <span className="text-xs font-normal text-text-muted">
              (Live OHLCV + 24h Sentiment + Directional Signal)
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-44 w-full" />
              ))
            : marketList.map((item) => {
                const isPos = (item.price_change_pct || 0) >= 0;
                return (
                  <NavLink
                    key={item.ticker}
                    to={`/stocks/${item.ticker}`}
                    onClick={() => setSelectedTicker(item.ticker)}
                    className="bg-surface border border-border-subtle hover:border-accent-primary/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="font-mono font-bold text-base text-text-primary group-hover:text-accent-primary transition-colors block leading-tight">
                            {item.ticker}
                          </span>
                          <span className="block text-[11px] text-text-muted truncate mt-0.5" title={item.name}>
                            {item.name}
                          </span>
                        </div>
                        {item.latest_prediction && (
                          <div className="shrink-0">
                            <PredictionBadge
                              direction={item.latest_prediction.direction}
                              confidence={item.latest_prediction.confidence_score}
                              size="sm"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between mt-3">
                        <span className="text-xl font-bold font-mono text-text-primary">
                          ${item.close_price !== undefined ? Number(item.close_price).toFixed(2) : '--'}
                        </span>
                        <span
                          className={`text-xs font-mono font-semibold flex items-center shrink-0 ${
                            isPos ? 'text-bullish' : 'text-bearish'
                          }`}
                        >
                          {isPos ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {item.price_change_pct !== undefined ? `${Math.abs(item.price_change_pct).toFixed(2)}%` : '0.00%'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] text-text-muted shrink-0">24h:</span>
                        <SentimentPill
                          score={item.sentiment_24h?.avg_sentiment}
                          label={item.sentiment_24h?.label}
                          size="sm"
                          showScore={false}
                        />
                      </div>
                      <div className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Sparkline data={item.sparkline_7d} width={60} height={20} />
                      </div>
                    </div>
                  </NavLink>
                );
              })}
        </div>
      </div>

      {/* Visual Analytics Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Comparison Chart */}
        <div className="lg:col-span-2 bg-surface border border-border-subtle rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Cross-Stock Sentiment Ranking
              </h2>
              <p className="text-xs text-text-muted">
                Average FinBERT score ([-1.00, 1.00]) per tracked stock
              </p>
            </div>
            <span className="text-xs font-mono text-text-muted bg-surface-raised px-2 py-1 rounded">
              Window: {range}
            </span>
          </div>

          <div className="h-64 w-full">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="ticker" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                  <YAxis domain={[-1, 1]} stroke="var(--text-muted)" fontSize={12} tickLine={false} tickFormatter={(val) => Number(val).toFixed(2)} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-surface border border-border-strong p-2.5 rounded-lg shadow-lg text-xs font-mono">
                            <div className="font-bold text-text-primary">{d.company_name} ({d.ticker})</div>
                            <div className="text-accent-primary mt-1">Avg Score: {d.avg_sentiment_score > 0 ? `+${Number(d.avg_sentiment_score).toFixed(2)}` : Number(d.avg_sentiment_score).toFixed(2)}</div>
                            <div className="text-text-muted mt-0.5">Articles: {d.article_count} (Pos: {d.positive_count}, Neg: {d.negative_count})</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="avg_sentiment_score" radius={[4, 4, 0, 0]}>
                    {sentimentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.avg_sentiment_score >= 0.15
                            ? 'var(--bullish)'
                            : entry.avg_sentiment_score <= -0.15
                            ? 'var(--bearish)'
                            : 'var(--neutral-brand)'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Trending Keywords Cloud */}
        <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-1.5">
                <Flame size={18} className="text-amber-500" />
                Trending Keywords
              </h2>
              <span className="text-xs font-mono text-text-muted">LLM Extracted</span>
            </div>
            <p className="text-xs text-text-muted mb-4">
              High-frequency entities and financial topics across news articles
            </p>

            <div className="flex flex-wrap gap-2">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-20 rounded-full" />
                  ))
                : keywords.map((k, i) => {
                    const isPosBias = (k.sentiment_bias || 0) > 0.2;
                    const isNegBias = (k.sentiment_bias || 0) < -0.2;
                    return (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          isPosBias
                            ? 'bg-bullish-bg text-bullish border-bullish-border/50 hover:border-bullish'
                            : isNegBias
                            ? 'bg-bearish-bg text-bearish border-bearish-border/50 hover:border-bearish'
                            : 'bg-surface-raised text-text-secondary border-border-subtle hover:border-border-strong'
                        }`}
                      >
                        <span>{k.keyword}</span>
                        <span className="font-mono text-[10px] opacity-75">
                          {k.frequency}
                        </span>
                      </span>
                    );
                  })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle text-xs text-text-muted flex items-center justify-between">
            <span>Click any tag to filter news feed</span>
            <NavLink to="/news" className="text-accent-primary hover:underline flex items-center gap-1">
              Explore News <ArrowUpRight size={12} />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Predictions Breakdown Table */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Sparkles size={18} className="text-accent-primary" />
              Directional Predictions & Probability Distribution
            </h2>
            <p className="text-xs text-text-muted">
              Next-day forecast evaluated by calibrated multimodal inference model
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Ticker</th>
                <th className="py-3 px-3">Direction</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3 text-center">Probability Distribution (UP / DOWN)</th>
                <th className="py-3 px-3">24h Sentiment</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {marketList.map((item) => {
                const pred = item.latest_prediction;
                const isUp = pred?.direction === 'UP';
                const conf = pred ? pred.confidence_score : 0.5;
                const upPct = pred ? (isUp ? Math.round(conf * 100) : Math.round((1 - conf) * 100)) : 50;
                const downPct = 100 - upPct;

                return (
                  <tr key={item.ticker} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-text-primary">
                      {item.ticker}
                      <span className="block text-[11px] font-sans font-normal text-text-muted">
                        {item.name}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {pred ? (
                        <PredictionBadge
                          direction={pred.direction}
                          showConfidence={false}
                          size="sm"
                        />
                      ) : (
                        <span className="text-text-muted">--</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold">
                      {pred ? `${Math.round(pred.confidence_score * 100)}%` : '--'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-1 mx-auto max-w-[180px]">
                        <div className="w-36 h-2.5 flex items-stretch rounded-full overflow-hidden bg-surface-raised border border-border-subtle">
                          <div
                            style={{ width: `${upPct}%` }}
                            className="h-full bg-bullish transition-all duration-300"
                            title={`UP: ${upPct}%`}
                          />
                          <div
                            style={{ width: `${downPct}%` }}
                            className="h-full bg-bearish transition-all duration-300"
                            title={`DOWN: ${downPct}%`}
                          />
                        </div>
                        <div className="flex items-center justify-between w-36 text-[10px] font-mono">
                          <span className="text-bullish font-semibold">{upPct}% UP</span>
                          <span className="text-bearish font-semibold">{downPct}% DOWN</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <SentimentPill
                        score={item.sentiment_24h?.avg_sentiment}
                        label={item.sentiment_24h?.label}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <NavLink
                        to={`/stocks/${item.ticker}`}
                        onClick={() => setSelectedTicker(item.ticker)}
                        className="inline-flex items-center gap-1 font-mono text-accent-primary hover:underline text-xs"
                      >
                        Deep Dive <ArrowUpRight size={12} />
                      </NavLink>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
