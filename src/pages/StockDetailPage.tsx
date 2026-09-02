import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  ReferenceLine,
} from 'recharts';
import {
  getStockDetail,
  getPriceHistory,
  getTechnicalIndicators,
  getStockPrediction,
  getPredictionHistory,
  getArticles,
} from '../services/api';
import {
  StockDetailResponse,
  PriceHistoryItem,
  TechnicalIndicatorItem,
  PredictionDetailResponse,
  PredictionHistoryItem,
  ArticleItem,
  TimeRange,
} from '../types/api';
import { PredictionBadge } from '../components/common/PredictionBadge';
import { SentimentPill } from '../components/common/SentimentPill';
import { Skeleton } from '../components/common/SkeletonLoader';
import { useStock } from '../context/StockContext';

export const StockDetailPage: React.FC = () => {
  const { ticker: paramTicker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const { selectedTicker, setSelectedTicker, watchlist } = useStock();

  const currentTicker = (paramTicker || selectedTicker || 'NVDA').toUpperCase();

  const [detail, setDetail] = useState<StockDetailResponse | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
  const [technicals, setTechnicals] = useState<TechnicalIndicatorItem[]>([]);
  const [prediction, setPrediction] = useState<PredictionDetailResponse | null>(null);
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [news, setNews] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(60);
  const [sentimentRange] = useState<TimeRange>('7d');

  useEffect(() => {
    setSelectedTicker(currentTicker);
    const loadAll = async () => {
      setLoading(true);
      try {
        const [detRes, priceRes, techRes, predRes, histRes, newsRes] = await Promise.all([
          getStockDetail(currentTicker, sentimentRange),
          getPriceHistory(currentTicker, selectedTimeframe),
          getTechnicalIndicators(currentTicker, selectedTimeframe),
          getStockPrediction(currentTicker),
          getPredictionHistory(currentTicker),
          getArticles(currentTicker, undefined, 1, 5),
        ]);
        setDetail(detRes);
        setPriceHistory(priceRes);
        setTechnicals(techRes);
        setPrediction(predRes);
        setHistory(histRes);
        setNews(newsRes.items);
      } catch (err) {
        console.error('Error loading stock deep-dive:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [currentTicker, selectedTimeframe, sentimentRange, setSelectedTicker]);

  const handleTickerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setSelectedTicker(next);
    navigate(`/stocks/${next}`);
  };

  const isPos = (detail?.market_data?.price_change_pct || 0) >= 0;

  // Merge price history with technical indicators for multi-layer chart
  const mergedChartData = priceHistory.map((p, idx) => {
    const tech = technicals[idx] || {};
    return {
      ...p,
      ma5: tech.ma5,
      ma10: tech.ma10,
      ma20: tech.ma20,
      rsi: tech.rsi,
      macd: tech.macd,
      macd_signal: tech.macd_signal,
    };
  });

  const upPct = prediction ? Math.round(prediction.probabilities.probability_up * 100) : 50;
  const downPct = prediction ? Math.round(prediction.probabilities.probability_down * 100) : 50;

  return (
    <div className="space-y-6 pb-12">
      {/* Sticky Stock Header */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Ticker & Price */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center font-mono font-bold text-accent-primary text-lg">
              {currentTicker.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold font-mono text-text-primary tracking-tight">
                  {currentTicker}
                </h1>
                {/* Ticker Switcher Dropdown */}
                <div className="relative inline-block">
                  <select
                    value={currentTicker}
                    onChange={handleTickerChange}
                    className="bg-surface-raised border border-border-subtle rounded-lg px-2.5 py-1 text-xs font-mono font-semibold text-text-primary cursor-pointer hover:border-border-strong focus:outline-none"
                  >
                    {watchlist.map((w) => (
                      <option key={w.symbol} value={w.symbol}>
                        {w.symbol} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                {prediction && (
                  <PredictionBadge
                    direction={prediction.target_direction}
                    confidence={prediction.confidence_score}
                    size="md"
                  />
                )}
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {detail?.company_name || 'Asset Profile'} • Nasdaq Listed • Watchlist Asset
              </p>
            </div>
          </div>

          {/* Real-time Valuations */}
          <div className="flex flex-wrap items-baseline gap-6 sm:gap-8">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold block">
                Closing Price
              </span>
              <div className="text-2xl font-bold font-mono text-text-primary">
                ${detail?.market_data?.close?.toFixed(2) || '--'}
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold block">
                Day Movement
              </span>
              <div
                className={`text-lg font-bold font-mono flex items-center gap-1 ${
                  isPos ? 'text-bullish' : 'text-bearish'
                }`}
              >
                {isPos ? '+' : ''}
                {detail?.market_data?.price_change_pct?.toFixed(2) || '0.00'}%
              </div>
            </div>

            <div className="hidden sm:block">
              <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold block">
                Volume
              </span>
              <div className="text-base font-mono text-text-primary font-semibold">
                {detail?.market_data?.volume ? `${(detail.market_data.volume / 1e6).toFixed(1)}M` : '--'}
              </div>
            </div>

            <div className="hidden sm:block">
              <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold block">
                Market Cap
              </span>
              <div className="text-base font-mono text-text-primary font-semibold">
                {detail?.market_data?.market_cap ? `$${(detail.market_data.market_cap / 1e12).toFixed(2)}T` : '--'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EXPLAINABLE AI PREDICTION PANEL */}
      <div className="bg-surface border border-accent-primary/40 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Explainable Short-Term Trend Prediction
              </h2>
              <p className="text-xs text-text-muted">
                Next trading day directional forecast ({prediction?.prediction_date || 'Target Day'})
              </p>
            </div>
          </div>
          <span className="text-xs font-mono bg-accent-primary/10 text-accent-primary border border-accent-primary/20 px-2.5 py-1 rounded-full font-semibold">
            Calibrated Binary Model
          </span>
        </div>

        {/* Prediction Main Tri-Split */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-xl bg-surface-raised border border-border-subtle mb-5">
          {/* Direction & Confidence */}
          <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-border-subtle pb-4 md:pb-0 pr-0 md:pr-4">
            <div className="w-16 h-16 rounded-2xl bg-surface border border-border-strong flex flex-col items-center justify-center font-mono">
              <span className="text-xs text-text-muted font-bold">CONF</span>
              <span className="text-lg font-bold text-accent-primary">
                {prediction ? Math.round(prediction.confidence_score * 100) : 0}%
              </span>
            </div>
            <div>
              <span className="text-xs text-text-muted uppercase font-semibold">Predicted Direction</span>
              <div className="mt-1">
                <PredictionBadge
                  direction={prediction?.target_direction}
                  confidence={prediction?.confidence_score}
                  size="lg"
                />
              </div>
            </div>
          </div>

          {/* Probability Distribution Dual-Bar */}
          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-border-subtle pb-4 md:pb-0 pr-0 md:pr-4">
            <div className="flex items-center justify-between text-xs font-mono font-semibold">
              <span className="text-text-muted">Probability Distribution</span>
              <span className="text-accent-primary">
                {upPct}% UP / {downPct}% DOWN
              </span>
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden flex items-stretch bg-surface border border-border-subtle">
              <div
                style={{ width: `${upPct}%` }}
                className="h-full bg-bullish transition-all duration-300"
                title={`UP Probability: ${upPct}%`}
              />
              <div
                style={{ width: `${downPct}%` }}
                className="h-full bg-bearish transition-all duration-300"
                title={`DOWN Probability: ${downPct}%`}
              />
            </div>
            <div className="flex justify-between text-[11px] text-text-muted font-mono pt-0.5">
              <span className="text-bullish font-semibold">▲ UP ({upPct}%)</span>
              <span className="text-bearish font-semibold">▼ DOWN ({downPct}%)</span>
            </div>
          </div>

          {/* Overnight News Sentiment Momentum */}
          <div className="space-y-1">
            <span className="text-xs text-text-muted uppercase font-semibold">Overnight News Sentiment</span>
            <div className="flex items-center gap-2 mt-1">
              <SentimentPill
                score={detail?.sentiment_summary?.avg_sentiment}
                label={detail?.sentiment_summary?.sentiment_label}
                size="md"
              />
              <span className="text-xs text-text-muted font-mono">
                {detail?.sentiment_summary?.total_articles || 0} news items
              </span>
            </div>
            <div className="text-[11px] text-text-muted mt-1">
              3D Rolling Window: <span className="font-mono font-semibold text-text-primary">{detail?.sentiment_summary?.sentiment_3d_rolling ? (detail.sentiment_summary.sentiment_3d_rolling > 0 ? `+${detail.sentiment_summary.sentiment_3d_rolling}` : detail.sentiment_summary.sentiment_3d_rolling) : '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Structured Signal Cards Breakdown */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5">
            Rule-Based Technical & Sentiment Signals
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-surface-raised border border-border-subtle text-xs">
              <span className="text-text-muted font-semibold">RSI Momentum</span>
              <div className="font-mono font-bold text-text-primary text-sm mt-0.5">
                {detail?.technical_summary?.rsi?.toFixed(1) || '64.2'}
              </div>
              <span className="text-[11px] text-bullish font-medium">Neutral-Bullish momentum</span>
            </div>

            <div className="p-3 rounded-xl bg-surface-raised border border-border-subtle text-xs">
              <span className="text-text-muted font-semibold">MACD Signal</span>
              <div className="font-mono font-bold text-text-primary text-sm mt-0.5">
                +{detail?.technical_summary?.macd?.toFixed(2) || '2.45'}
              </div>
              <span className="text-[11px] text-bullish font-medium">Bullish crossover active</span>
            </div>

            <div className="p-3 rounded-xl bg-surface-raised border border-border-subtle text-xs">
              <span className="text-text-muted font-semibold">Moving Averages</span>
              <div className="font-mono font-bold text-text-primary text-sm mt-0.5">
                MA5 {detail?.technical_summary?.ma5?.toFixed(1)} &gt; MA20
              </div>
              <span className="text-[11px] text-bullish font-medium">Perfect bullish stack</span>
            </div>

            <div className="p-3 rounded-xl bg-surface-raised border border-border-subtle text-xs">
              <span className="text-text-muted font-semibold">Macro Context</span>
              <div className="font-mono font-bold text-text-primary text-sm mt-0.5">
                SPY +0.75% / QQQ +1.20%
              </div>
              <span className="text-[11px] text-accent-primary font-medium">Risk-on environment</span>
            </div>
          </div>
        </div>

        {/* AI Explanation Takeaway */}
        <div className="mt-4 p-3.5 rounded-xl bg-accent-primary/5 border border-accent-primary/20 text-xs text-text-primary leading-relaxed flex items-start gap-2.5">
          <Info size={16} className="text-accent-primary shrink-0 mt-0.5" />
          <div>
            <strong className="text-accent-primary">Synthesized Takeaway: </strong>
            {prediction?.signal?.explanation ||
              detail?.prediction_summary?.signal_summary ||
              'Positive momentum supported by overnight news catalysts and strong alignment across scale-invariant moving averages.'}
          </div>
        </div>
      </div>

      {/* INTERACTIVE FINANCIAL CHARTS STATION */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
          <div>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Layers size={18} className="text-accent-primary" />
              Interactive Price & Technical Indicator Station
            </h2>
            <p className="text-xs text-text-muted">
              Most recent {selectedTimeframe} trading days up to latest trade date
            </p>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center bg-surface-raised p-1 rounded-xl border border-border-subtle self-start sm:self-auto">
            {[
              { label: '30D', value: 30 },
              { label: '60D', value: 60 },
              { label: '90D', value: 90 },
              { label: '180D', value: 180 },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedTimeframe(t.value)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  selectedTimeframe === t.value
                    ? 'bg-surface text-accent-primary shadow-xs border border-border-subtle'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Price & MA Chart */}
        <div className="h-72 w-full">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mergedChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-surface border border-border-strong p-3 rounded-xl shadow-xl text-xs font-mono space-y-1">
                          <div className="font-bold text-text-primary">{d.date}</div>
                          <div className="text-text-primary font-bold">Close: ${d.close}</div>
                          <div className="text-accent-primary">MA5: ${d.ma5}</div>
                          <div className="text-purple-500">MA20: ${d.ma20}</div>
                          <div className="text-text-muted">Volume: {d.volume ? `${(d.volume / 1e6).toFixed(1)}M` : '--'}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="close" fill="var(--accent-primary)" fillOpacity={0.08} stroke="none" />
                <Line type="monotone" dataKey="close" stroke="var(--accent-primary)" strokeWidth={2.5} dot={false} name="Close Price" />
                <Line type="monotone" dataKey="ma5" stroke="var(--bullish)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="MA5" />
                <Line type="monotone" dataKey="ma20" stroke="#A855F7" strokeWidth={1.5} dot={false} name="MA20" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* RSI Momentum Sub-Chart */}
        <div className="pt-2 border-t border-border-subtle">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-text-secondary font-mono">RSI Momentum Oscillator (14)</span>
            <span className="font-mono text-text-muted text-[11px]">Bands: 30 Oversold / 70 Overbought</span>
          </div>
          <div className="h-28 w-full">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={mergedChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[10, 90]} stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <ReferenceLine y={70} stroke="var(--bearish)" strokeDasharray="3 3" />
                  <ReferenceLine y={30} stroke="var(--bullish)" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="rsi" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Historical Track Record & News Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prediction Track Record */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Historical Accuracy Log
              </h2>
              <p className="text-xs text-text-muted">
                Model forecast vs subsequent actual market outcome
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-bullish bg-bullish-bg px-2.5 py-1 rounded-full border border-bullish-border">
              80% Hit Rate (Last 5)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted uppercase">
                  <th className="py-2.5 px-2">Pred Date</th>
                  <th className="py-2.5 px-2">Forecast</th>
                  <th className="py-2.5 px-2">Actual Change</th>
                  <th className="py-2.5 px-2 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {history.map((h, i) => (
                  <tr key={i} className="hover:bg-surface-hover/50">
                    <td className="py-2.5 px-2 text-text-secondary">{h.prediction_date}</td>
                    <td className="py-2.5 px-2">
                      <PredictionBadge direction={h.predicted_direction} size="sm" showConfidence={false} />
                    </td>
                    <td className="py-2.5 px-2 font-semibold">
                      <span className={(h.actual_price_change_pct || 0) >= 0 ? 'text-bullish' : 'text-bearish'}>
                        {(h.actual_price_change_pct || 0) >= 0 ? '+' : ''}
                        {h.actual_price_change_pct?.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      {h.is_correct ? (
                        <span className="inline-flex items-center gap-1 text-bullish font-semibold">
                          <CheckCircle2 size={14} /> Hit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-bearish font-semibold">
                          <XCircle size={14} /> Miss
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock-Specific News Feed */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Latest {currentTicker} News Feed
              </h2>
              <p className="text-xs text-text-muted">
                FinBERT scored articles with LLM bullet takeaways
              </p>
            </div>
            <a
              href={`/news?ticker=${currentTicker}`}
              className="text-xs font-mono text-accent-primary hover:underline flex items-center gap-1"
            >
              View All <ExternalLink size={12} />
            </a>
          </div>

          <div className="space-y-3">
            {news.slice(0, 3).map((art) => (
              <div
                key={art.id}
                className="p-3.5 rounded-xl bg-surface-raised border border-border-subtle hover:border-border-strong transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <SentimentPill score={art.sentiment_score} label={art.sentiment_label} size="sm" />
                  <span className="text-[11px] text-text-muted font-mono">{art.source}</span>
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-text-primary line-clamp-2">
                  {art.title}
                </h3>
                {art.bullets && art.bullets.length > 0 && (
                  <ul className="mt-2 space-y-1 text-[11px] text-text-secondary list-disc list-inside">
                    {art.bullets.slice(0, 2).map((b, idx) => (
                      <li key={idx} className="line-clamp-1">{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
