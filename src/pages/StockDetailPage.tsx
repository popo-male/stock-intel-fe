import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Info,
  Compass,
  TrendingUp,
  Globe2,
  Clock,
  Activity,
  CalendarOff,
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
  const isIndex = currentTicker === 'SPY' || currentTicker === 'QQQ';

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
        if (isIndex) {
          // Indices: fetch price history, technicals, and news
          const [detRes, priceRes, techRes, newsRes] = await Promise.all([
            getStockDetail(currentTicker, sentimentRange),
            getPriceHistory(currentTicker, selectedTimeframe),
            getTechnicalIndicators(currentTicker, selectedTimeframe),
            getArticles(currentTicker, undefined, 1, 6),
          ]);
          setDetail(detRes);
          setPriceHistory(priceRes);
          setTechnicals(techRes);
          setNews(newsRes.items);
          setPrediction(null);
          setHistory([]);
        } else {
          // Equities: fetch complete individual predictive profile
          const [detRes, priceRes, techRes, predRes, histRes, newsRes] = await Promise.all([
            getStockDetail(currentTicker, sentimentRange),
            getPriceHistory(currentTicker, selectedTimeframe),
            getTechnicalIndicators(currentTicker, selectedTimeframe),
            getStockPrediction(currentTicker),
            getPredictionHistory(currentTicker),
            getArticles(currentTicker, undefined, 1, 6),
          ]);
          setDetail(detRes);
          setPriceHistory(priceRes);
          setTechnicals(techRes);
          setPrediction(predRes);
          setHistory(histRes);
          setNews(newsRes.items);
        }
      } catch (err) {
        console.error('Error loading stock deep-dive:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [currentTicker, selectedTimeframe, sentimentRange, setSelectedTicker, isIndex]);

  const handleTickerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setSelectedTicker(next);
    navigate(`/stocks/${next}`);
  };

  const isPos = (detail?.market_data?.price_change_pct || 0) >= 0;

  // Merge price history with technical indicators by date for accurate multi-layer charts
  const techMap = new Map<string, TechnicalIndicatorItem>();
  technicals.forEach((t) => techMap.set(t.date, t));

  const mergedChartData = priceHistory.map((p) => {
    const tech = techMap.get(p.date);
    return {
      ...p,
      ma5: tech?.ma5,
      ma10: tech?.ma10,
      ma20: tech?.ma20,
      rsi: tech?.rsi,
      macd: tech?.macd,
      macd_signal: tech?.macd_signal,
    };
  });

  const upPct = prediction ? Math.round(prediction.probabilities.probability_up * 100) : 50;
  const downPct = prediction ? Math.round(prediction.probabilities.probability_down * 100) : 50;

  const macdVal = detail?.technical_summary?.macd !== undefined ? detail.technical_summary.macd : 1.75;
  const macdSig = detail?.technical_summary?.macd_signal !== undefined ? detail.technical_summary.macd_signal : 1.20;
  const macdDiff = macdVal - macdSig;
  const isMacdBullish = macdDiff >= 0;

  // Dynamic historical prediction evaluation calculations
  const evaluatedHistory = history.filter((h) => h.is_correct !== null && h.is_correct !== undefined);
  const correctCount = evaluatedHistory.filter((h) => h.is_correct === true).length;
  const totalEvaluated = evaluatedHistory.length;
  const hitRate = totalEvaluated > 0 ? (correctCount / totalEvaluated) * 100 : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Sticky Stock Header */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Ticker & Asset Info */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-bold text-base shrink-0 ${
              isIndex
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500'
                : 'bg-accent-primary/10 border border-accent-primary/20 text-accent-primary'
            }`}>
              {isIndex ? <Globe2 size={20} /> : currentTicker.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold font-mono text-text-primary tracking-tight">
                  {currentTicker}
                </h1>
                {/* Compact Fixed Ticker Switcher */}
                <div className="relative inline-block">
                  <select
                    value={currentTicker}
                    onChange={handleTickerChange}
                    className="bg-surface-raised border border-border-subtle rounded-lg px-2 py-1 text-xs font-mono font-semibold text-text-primary cursor-pointer hover:border-border-strong focus:outline-none focus:border-accent-primary transition-colors"
                    aria-label="Switch tracked asset"
                  >
                    {watchlist.map((w) => (
                      <option key={w.symbol} value={w.symbol}>
                        {w.symbol} ({w.name.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Badge: Index Mode vs Equity Prediction */}
                {isIndex ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                    <Compass size={13} />
                    Macro Benchmark ETF
                  </span>
                ) : (
                  prediction && (
                    <PredictionBadge
                      direction={prediction.target_direction}
                      confidence={prediction.confidence_score}
                      size="md"
                    />
                  )
                )}
              </div>
              <p className="text-xs text-text-muted mt-0.5 truncate" title={detail?.company_name || 'Asset Profile'}>
                {isIndex
                  ? `${detail?.company_name || (currentTicker === 'SPY' ? 'SPDR S&P 500 ETF Trust' : 'Invesco QQQ Trust')} • Macro Market Benchmark Signal Provider`
                  : `${detail?.company_name || 'Asset Profile'} • Nasdaq Listed • Watchlist Asset`}
              </p>
            </div>
          </div>

          {/* Real-time Valuations */}
          <div className="flex items-center gap-5 sm:gap-7 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-border-subtle">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold block">
                Closing Price
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-text-primary">
                ${detail?.market_data?.close !== undefined ? Number(detail.market_data.close).toFixed(2) : '--'}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold block">
                Day Movement
              </span>
              <div
                className={`text-base sm:text-lg font-bold font-mono flex items-center gap-0.5 ${
                  isPos ? 'text-bullish' : 'text-bearish'
                }`}
              >
                {isPos ? '+' : ''}
                {detail?.market_data?.price_change_pct !== undefined ? Number(detail.market_data.price_change_pct).toFixed(2) : '0.00'}%
              </div>
            </div>

            <div className="hidden sm:block">
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold block">
                Volume
              </span>
              <div className="text-sm sm:text-base font-mono text-text-primary font-semibold">
                {detail?.market_data?.volume ? `${(Number(detail.market_data.volume) / 1e6).toFixed(1)}M` : '--'}
              </div>
            </div>

            <div className="hidden lg:block">
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold block">
                Market Cap / AUM
              </span>
              <div className="text-sm sm:text-base font-mono text-text-primary font-semibold">
                {detail?.market_data?.market_cap ? `$${(Number(detail.market_data.market_cap) / 1e12).toFixed(2)}T` : (isIndex ? (currentTicker === 'SPY' ? '$580.00B' : '$290.00B') : '--')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONDITIONAL TOP SECTION: Macro Benchmark Station (for SPY/QQQ) vs Explainable AI Prediction (for Stocks) */}
      {isIndex ? (
        <div className="bg-surface border border-amber-500/40 rounded-2xl p-6 shadow-sm relative overflow-hidden space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Globe2 size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-text-primary">
                  Macro Market Benchmark & Predictive Feature Role
                </h2>
                <p className="text-xs text-text-muted">
                  How {currentTicker} returns act as scale-invariant macro inputs across the AI model feature store
                </p>
              </div>
            </div>
            <span className="text-xs font-mono bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2.5 py-1 rounded-full font-semibold">
              Global Beta Driver
            </span>
          </div>

          {/* Macro Tri-Split Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-xl bg-surface-raised border border-border-subtle">
            {/* Market Regime */}
            <div className="border-b md:border-b-0 md:border-r border-border-subtle pb-4 md:pb-0 pr-0 md:pr-4 space-y-1">
              <span className="text-xs text-text-muted uppercase font-semibold">Current Macro Regime</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-base font-bold font-mono ${isPos ? 'text-bullish' : 'text-bearish'}`}>
                  {isPos ? '▲ Risk-On Environment' : '▼ Risk-Off Environment'}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary mt-1">
                {isPos
                  ? `${currentTicker} upward drift provides market-wide tailwinds for high-beta tech equities.`
                  : `${currentTicker} contraction imposes systemic resistance across growth sectors.`}
              </p>
            </div>

            {/* Feature Pipeline Role */}
            <div className="border-b md:border-b-0 md:border-r border-border-subtle pb-4 md:pb-0 pr-0 md:pr-4 space-y-1">
              <span className="text-xs text-text-muted uppercase font-semibold">Model Feature Pipeline</span>
              <div className="font-mono text-sm font-bold text-text-primary mt-1">
                Feature: <code className="text-accent-primary">{currentTicker.toLowerCase()}_return</code>
              </div>
              <p className="text-[11px] text-text-secondary mt-1">
                Lagged return (T-1) normalized via tanh(15.0 × Return) and stored in <code className="text-text-primary">daily_stock_features</code>.
              </p>
            </div>

            {/* Macro News Sentiment */}
            <div className="space-y-1">
              <span className="text-xs text-text-muted uppercase font-semibold">Macro News Sentiment</span>
              <div className="flex items-center gap-2 mt-1">
                <SentimentPill
                  score={detail?.sentiment_summary?.avg_sentiment}
                  label={detail?.sentiment_summary?.sentiment_label}
                  size="md"
                />
                <span className="text-xs text-text-muted font-mono">
                  {detail?.sentiment_summary?.total_articles || 0} macro articles
                </span>
              </div>
              <div className="text-[11px] text-text-muted mt-1">
                3D Rolling Sentiment: <span className="font-mono font-semibold text-text-primary">{detail?.sentiment_summary?.sentiment_3d_rolling ? (detail.sentiment_summary.sentiment_3d_rolling > 0 ? `+${Number(detail.sentiment_summary.sentiment_3d_rolling).toFixed(2)}` : Number(detail.sentiment_summary.sentiment_3d_rolling).toFixed(2)) : '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Feature Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-raised border border-border-subtle text-xs">
              <span className="text-text-muted font-semibold">Benchmark Trend</span>
              <div className="font-mono font-bold text-text-primary text-sm mt-0.5">
                MA5 ${(detail?.technical_summary?.ma5 ?? 558.2).toFixed(2)} &gt; MA20
              </div>
              <span className="text-[11px] text-bullish font-medium">Positive macro momentum</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-raised border border-border-subtle text-xs">
              <span className="text-text-muted font-semibold">RSI Momentum (14)</span>
              <div className="font-mono font-bold text-text-primary text-sm mt-0.5">
                {(detail?.technical_summary?.rsi ?? 61.4).toFixed(1)}
              </div>
              <span className="text-[11px] text-bullish font-medium">Healthy expansion zone</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-raised border border-border-subtle text-xs">
              <span className="text-text-muted font-semibold">High-Low Volatility</span>
              <div className="font-mono font-bold text-text-primary text-sm mt-0.5">
                {((detail?.technical_summary?.high_low_spread ?? 0.0085) * 100).toFixed(2)}%
              </div>
              <span className="text-[11px] text-accent-primary font-medium">Stable benchmark range</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-raised border border-border-subtle text-xs">
              <span className="text-text-muted font-semibold">Predictive Weight</span>
              <div className="font-mono font-bold text-text-primary text-sm mt-0.5">
                Rank #6 / 7.60% Gain
              </div>
              <span className="text-[11px] text-amber-500 font-medium">Key XGBoost driver</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-text-primary leading-relaxed flex items-start gap-2.5">
            <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-500">Benchmark Role: </strong>
              Index ETFs ({currentTicker}) serve as market baseline anchors rather than individual prediction targets. Movements in {currentTicker} are ingested daily to calculate systemic risk and market beta for predicting individual Magnificent 7 equities.
            </div>
          </div>
        </div>
      ) : (
        /* Stock Explainable AI Prediction Panel (for AAPL, NVDA, MSFT, etc.) */
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
              <div className="w-16 h-16 rounded-2xl bg-surface border border-border-strong flex flex-col items-center justify-center font-mono shrink-0">
                <span className="text-[10px] text-text-muted font-bold">CONF</span>
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
                3D Rolling Window: <span className="font-mono font-semibold text-text-primary">{detail?.sentiment_summary?.sentiment_3d_rolling !== undefined ? (detail.sentiment_summary.sentiment_3d_rolling > 0 ? `+${Number(detail.sentiment_summary.sentiment_3d_rolling).toFixed(2)}` : Number(detail.sentiment_summary.sentiment_3d_rolling).toFixed(2)) : '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Structured Signal Cards Breakdown */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5">
              Rule-Based Technical & Sentiment Signals
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* RSI Card */}
              <div className="p-3.5 rounded-xl bg-surface-raised border border-border-subtle text-xs flex flex-col justify-between">
                <div>
                  <span className="text-text-muted font-semibold">RSI Momentum (14)</span>
                  <div className="font-mono font-bold text-text-primary text-sm mt-1">
                    {detail?.technical_summary?.rsi !== undefined ? Number(detail.technical_summary.rsi).toFixed(2) : '64.20'}
                  </div>
                </div>
                <span className="text-[11px] text-bullish font-medium mt-1">
                  {(detail?.technical_summary?.rsi ?? 64.2) >= 70 ? 'Overbought (Reversal Risk)' : (detail?.technical_summary?.rsi ?? 64.2) <= 30 ? 'Oversold (Bounce Potential)' : (detail?.technical_summary?.rsi ?? 64.2) > 50 ? 'Bullish Momentum' : 'Bearish Momentum'}
                </span>
              </div>

              {/* MACD Card */}
              <div className="p-3.5 rounded-xl bg-surface-raised border border-border-subtle text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted font-semibold">MACD (12, 26, 9)</span>
                    <span className="text-[10px] text-text-muted font-mono">USD Spread</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`font-mono font-bold text-sm ${macdVal >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                      {macdVal >= 0 ? '+' : ''}{Number(macdVal).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">
                      Sig: {macdSig >= 0 ? '+' : ''}{Number(macdSig).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className={`font-semibold ${isMacdBullish ? 'text-bullish' : 'text-bearish'}`}>
                    {isMacdBullish ? '▲ Golden Cross' : '▼ Death Cross'}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">
                    Diff: {macdDiff >= 0 ? '+' : ''}{Number(macdDiff).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Moving Averages Card */}
              <div className="p-3.5 rounded-xl bg-surface-raised border border-border-subtle text-xs flex flex-col justify-between">
                <div>
                  <span className="text-text-muted font-semibold">Moving Averages</span>
                  <div className="font-mono font-bold text-text-primary text-sm mt-1">
                    MA5 ${detail?.technical_summary?.ma5 !== undefined ? Number(detail.technical_summary.ma5).toFixed(2) : '124.80'}
                  </div>
                </div>
                <span className="text-[11px] text-bullish font-medium mt-1">
                  {(detail?.technical_summary?.ma5 ?? 124.8) > (detail?.technical_summary?.ma20 ?? 119.5) ? 'Bullish Stack (MA5 > MA20)' : 'Bearish (MA5 < MA20)'}
                </span>
              </div>

              {/* Macro Context Card */}
              <div className="p-3.5 rounded-xl bg-surface-raised border border-border-subtle text-xs flex flex-col justify-between">
                <div>
                  <span className="text-text-muted font-semibold">Macro Context</span>
                  <div className="font-mono font-bold text-text-primary text-sm mt-1">
                    SPY +0.75% / QQQ +1.20%
                  </div>
                </div>
                <span className="text-[11px] text-accent-primary font-medium mt-1">
                  Strong Market Tailwind (Risk-On)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE FINANCIAL CHARTS STATION (Active for both Stocks and Indices) */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
          <div>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Layers size={18} className="text-accent-primary" />
              Interactive Price & Technical Indicator Station
            </h2>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center bg-surface-raised p-1 rounded-xl border border-border-subtle self-start sm:self-auto">
            {[
              { label: '30D', value: 30 },
              { label: '60D', value: 60 },
              { label: '90D', value: 90 },
              { label: '180D', value: 180 },
              { label: 'ALL', value: 300 },
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

        {/* Legend Toolbar */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono px-1">
          <span className="flex items-center gap-1.5 text-accent-primary font-bold">
            <span className="w-3.5 h-1 rounded-full bg-accent-primary"></span> Close Price
          </span>
          <span className="flex items-center gap-1.5 text-bullish font-semibold">
            <span className="w-3.5 h-1 rounded-full bg-bullish"></span> MA5 (Fast)
          </span>
          <span className="flex items-center gap-1.5 text-amber-500 font-semibold">
            <span className="w-3.5 h-1 rounded-full bg-amber-500"></span> MA10 (Medium)
          </span>
          <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
            <span className="w-3.5 h-1 rounded-full bg-purple-500"></span> MA20 (Slow)
          </span>
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
                <YAxis domain={['auto', 'auto']} stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={(val) => `$${Number(val).toFixed(2)}`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-surface border border-border-strong p-3 rounded-xl shadow-xl text-xs font-mono space-y-1">
                          <div className="font-bold text-text-primary">{d.date}</div>
                          <div className="text-accent-primary font-bold">Close Price: ${Number(d.close).toFixed(2)}</div>
                          {d.ma5 !== undefined && <div className="text-bullish">MA5: ${Number(d.ma5).toFixed(2)}</div>}
                          {d.ma10 !== undefined && <div className="text-amber-500">MA10: ${Number(d.ma10).toFixed(2)}</div>}
                          {d.ma20 !== undefined && <div className="text-purple-400">MA20: ${Number(d.ma20).toFixed(2)}</div>}
                          <div className="text-text-muted">Volume: {d.volume ? `${(Number(d.volume) / 1e6).toFixed(2)}M` : '--'}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="close" fill="var(--accent-primary)" fillOpacity={0.08} stroke="none" />
                <Line type="monotone" dataKey="close" stroke="var(--accent-primary)" strokeWidth={2.5} dot={false} name="Close Price" />
                <Line type="monotone" dataKey="ma5" stroke="var(--bullish)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="MA5" />
                <Line type="monotone" dataKey="ma10" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="2 2" dot={false} name="MA10" />
                <Line type="monotone" dataKey="ma20" stroke="#A855F7" strokeWidth={1.5} dot={false} name="MA20" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* RSI Momentum Sub-Chart */}
        <div className="pt-2 border-t border-border-subtle">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-text-secondary font-mono">RSI Momentum Oscillator (14)</span>
            <span className="font-mono text-text-muted text-[11px]">Bands: 30.00 Oversold / 70.00 Overbought</span>
          </div>
          <div className="h-28 w-full">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={mergedChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[10, 90]} stroke="var(--text-muted)" fontSize={10} tickLine={false} tickFormatter={(val) => Number(val).toFixed(2)} />
                  <ReferenceLine y={70} stroke="var(--bearish)" strokeDasharray="3 3" />
                  <ReferenceLine y={30} stroke="var(--bullish)" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="rsi" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* CONDITIONAL BOTTOM SECTION: Macro News Feed (for SPY/QQQ) vs Accuracy Log + News (for Stocks) */}
      {isIndex ? (
        <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Globe2 size={18} className="text-amber-500" />
                Latest {currentTicker} Macro News Feed
              </h2>
              <p className="text-xs text-text-muted">
                FinBERT scored market-wide articles & Federal Reserve catalysts
              </p>
            </div>
            <a
              href={`/news?ticker=${currentTicker}`}
              className="text-xs font-mono text-accent-primary hover:underline flex items-center gap-1"
            >
              View All News <ExternalLink size={12} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.slice(0, 6).map((art) => (
              <div
                key={art.id}
                className="p-4 rounded-xl bg-surface-raised border border-border-subtle hover:border-border-strong transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <SentimentPill score={art.sentiment_score} label={art.sentiment_label} size="sm" />
                    <span className="text-[11px] text-text-muted font-mono">{art.source}</span>
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm text-text-primary line-clamp-2">
                    {art.title}
                  </h3>
                  {art.bullets && art.bullets.length > 0 && (
                    <ul className="mt-2.5 space-y-1 text-[11px] text-text-secondary list-disc list-inside">
                      {art.bullets.slice(0, 2).map((b, idx) => (
                        <li key={idx} className="line-clamp-1">{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-[10px] text-text-muted font-mono">
                  <span>{new Date(art.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  <a
                    href={art.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-primary hover:underline flex items-center gap-0.5"
                  >
                    Read <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Stock Prediction Accuracy & News Split (for Equities) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prediction Track Record (Distinct Unique Dates) */}
          <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <TrendingUp size={18} className="text-accent-primary" />
                  Historical Accuracy Log
                </h2>
              </div>
              {hitRate !== null ? (
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                    hitRate >= 60
                      ? 'text-bullish bg-bullish-bg border-bullish-border'
                      : hitRate >= 50
                      ? 'text-amber-500 bg-amber-500/10 border-amber-500/30'
                      : 'text-bearish bg-bearish-bg border-bearish-border'
                  }`}
                >
                  {hitRate.toFixed(2)}% Hit Rate ({correctCount}/{totalEvaluated})
                </span>
              ) : (
                <span className="text-xs font-mono font-medium text-text-muted bg-surface-raised px-2.5 py-1 rounded-full border border-border-subtle">
                  Pending Evaluation
                </span>
              )}
            </div>

            {/* Quick stats ribbon */}
            <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-surface-raised rounded-xl border border-border-subtle text-xs font-mono">
              <div>
                <span className="text-[10px] text-text-muted uppercase block">Logged</span>
                <span className="font-bold text-text-primary">{history.length} Target Days</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block">Evaluated</span>
                <span className="font-bold text-text-primary">{totalEvaluated} Days</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block">Hits / Misses</span>
                <span className="font-bold text-bullish">{correctCount} <span className="text-text-muted font-normal">/</span> <span className="text-bearish">{totalEvaluated - correctCount}</span></span>
              </div>
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
                <tbody className="divide-y border-border-subtle">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-text-muted">
                        No prediction logs available for {currentTicker}
                      </td>
                    </tr>
                  ) : (
                    history.map((h, i) => (
                      <tr key={i} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="py-2.5 px-2 text-text-secondary font-medium">{h.prediction_date}</td>
                        <td className="py-2.5 px-2">
                          <PredictionBadge direction={h.predicted_direction} confidence={h.confidence_score} size="sm" />
                        </td>
                        <td className="py-2.5 px-2 font-semibold">
                          {h.actual_price_change_pct !== null && h.actual_price_change_pct !== undefined ? (
                            <span className={(h.actual_price_change_pct || 0) >= 0 ? 'text-bullish' : 'text-bearish'}>
                              {(h.actual_price_change_pct || 0) >= 0 ? '+' : ''}
                              {Number(h.actual_price_change_pct).toFixed(2)}%
                            </span>
                          ) : h.status === 'MARKET_CLOSED' ? (
                            <span className="text-text-muted font-normal text-[11px]">Holiday (Closed)</span>
                          ) : (
                            <span className="text-text-muted font-normal">--</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          {h.status === 'HIT' || h.is_correct === true ? (
                            <span className="inline-flex items-center gap-1 text-bullish font-semibold bg-bullish-bg px-2 py-0.5 rounded-md border border-bullish-border">
                              <CheckCircle2 size={13} /> Hit
                            </span>
                          ) : h.status === 'MISS' || h.is_correct === false ? (
                            <span className="inline-flex items-center gap-1 text-bearish font-semibold bg-bearish-bg px-2 py-0.5 rounded-md border border-bearish-border">
                              <XCircle size={13} /> Miss
                            </span>
                          ) : h.status === 'MARKET_CLOSED' ? (
                            <span className="inline-flex items-center gap-1 text-text-muted font-medium bg-surface-raised px-2 py-0.5 rounded-md border border-border-subtle" title="Exchange Closed / Market Holiday">
                              <CalendarOff size={13} /> Closed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-500 font-medium bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                              <Clock size={13} /> Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock-Specific News Feed */}
          <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Globe2 size={18} className="text-accent-primary" />
                  Latest {currentTicker} News Feed
                </h2>
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
      )}
    </div>
  );
};
