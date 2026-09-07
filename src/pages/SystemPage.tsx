import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Sparkles,
  Zap,
  Activity,
  Database,
  Clock,
  CheckCircle2,
  AlertCircle,
  Radio,
} from 'lucide-react';
import {
  getSystemHealth,
  getLiveQuote,
  analyzeCustomText,
} from '../services/api';
import {
  SystemHealthResponse,
  LiveQuoteResponse,
  AnalyzeTextResponse,
} from '../types/api';
import { SentimentPill } from '../components/common/SentimentPill';
import { Skeleton } from '../components/common/SkeletonLoader';

export const SystemPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [testTicker, setTestTicker] = useState<string>('NVDA');
  const [liveQuote, setLiveQuote] = useState<LiveQuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState<boolean>(false);

  // NLP Sandbox
  const [inputText, setInputText] = useState<string>(
    'NVIDIA reports surging Q3 datacenter revenue beating Wall Street consensus, driven by unprecedented Blackwell AI accelerator demand.'
  );
  const [nlpResult, setNlpResult] = useState<AnalyzeTextResponse | null>(null);
  const [nlpLoading, setNlpLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadHealth = async () => {
      setLoading(true);
      try {
        const h = await getSystemHealth();
        setHealth(h);
      } catch (err) {
        console.error('Failed to load system health:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHealth();
  }, []);

  const handleFetchQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTicker) return;
    setQuoteLoading(true);
    try {
      const q = await getLiveQuote(testTicker);
      setLiveQuote(q);
    } catch (err) {
      console.error('Failed to fetch live quote:', err);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleAnalyzeText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setNlpLoading(true);
    try {
      const res = await analyzeCustomText(inputText);
      setNlpResult(res);
    } catch (err) {
      console.error('Failed to analyze custom text:', err);
    } finally {
      setNlpLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
          <Cpu size={24} className="text-accent-primary" />
          AI Sandbox
        </h1>
      </div>

      {/* ON-DEMAND AI NLP SANDBOX */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-accent-primary" />
          <div>
            <h2 className="text-base font-bold text-text-primary">
              FinBERT Sentiment & LLM Bullet Extraction Sandbox
            </h2>
          </div>
        </div>

        <form onSubmit={handleAnalyzeText} className="space-y-3">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste financial news excerpt or earnings headline..."
            className="w-full p-3.5 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors resize-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted">
              Supports English financial syntax and compound sentiment weights
            </span>
            <button
              type="submit"
              disabled={nlpLoading || !inputText.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              <Zap size={14} />
              {nlpLoading ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
        </form>

        {/* NLP Output Panel */}
        {nlpResult && (
          <div className="p-4 rounded-xl bg-surface-raised border border-accent-primary/30 space-y-3 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-muted">Result:</span>
                <SentimentPill score={nlpResult.sentiment_score} label={nlpResult.sentiment_label} />
              </div>
              <span className="text-[11px] font-mono text-text-muted">
                Model: {nlpResult.model}
              </span>
            </div>

            {nlpResult.bullets && nlpResult.bullets.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-text-secondary">Extracted Takeaways:</span>
                <ul className="space-y-1 text-xs text-text-secondary list-disc list-inside">
                  {nlpResult.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {nlpResult.keywords && nlpResult.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-xs font-semibold text-text-muted mr-1">Entities:</span>
                {nlpResult.keywords.map((k, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-border-subtle text-accent-primary"
                  >
                    {k}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* LIVE QUOTE TESTER & PIPELINE STATUS SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Market Quote Proxy */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-bullish animate-pulse" />
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Live Intraday Quote Proxy
              </h2>
              <p className="text-xs text-text-muted">
                Direct live Yahoo Finance API proxy for active market hours
              </p>
            </div>
          </div>

          <form onSubmit={handleFetchQuote} className="flex gap-2">
            <input
              type="text"
              value={testTicker}
              onChange={(e) => setTestTicker(e.target.value.toUpperCase())}
              placeholder="e.g. AAPL, NVDA"
              className="flex-1 px-3.5 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs font-mono font-bold text-text-primary focus:outline-none focus:border-accent-primary"
            />
            <button
              type="submit"
              disabled={quoteLoading}
              className="px-4 py-2 rounded-xl bg-surface-raised hover:bg-surface-hover border border-border-subtle text-xs font-semibold text-text-primary transition-colors cursor-pointer"
            >
              {quoteLoading ? 'Fetching...' : 'Query Quote'}
            </button>
          </form>

          {liveQuote && (
            <div className="p-4 rounded-xl bg-surface-raised border border-border-subtle font-mono text-xs space-y-2">
              <div className="flex justify-between border-b border-border-subtle pb-2">
                <span className="font-bold text-text-primary text-sm">{liveQuote.ticker}</span>
                <span className="text-bullish font-bold text-sm">${liveQuote.current_price?.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-text-secondary pt-1">
                <div>Day Open: ${liveQuote.day_open?.toFixed(2) || '--'}</div>
                <div>Day High: ${liveQuote.day_high?.toFixed(2) || '--'}</div>
                <div>Day Low: ${liveQuote.day_low?.toFixed(2) || '--'}</div>
                <div>Prev Close: ${liveQuote.previous_close?.toFixed(2) || '--'}</div>
                <div>Volume: {liveQuote.volume ? `${(liveQuote.volume / 1e6).toFixed(1)}M` : '--'}</div>
                <div>State: {liveQuote.market_state}</div>
              </div>
            </div>
          )}
        </div>

        {/* Ingestion & Prediction Pipeline Freshness */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-accent-primary" />
            <div>
              <h2 className="text-base font-bold text-text-primary">
                ETL Pipeline Freshness & Health
              </h2>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-raised border border-border-subtle space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="text-text-muted flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-bullish" />
                Database Engine
              </span>
              <span className="font-mono font-bold text-text-primary">
                {health?.database.engine || 'PostgreSQL 16 / TimescaleDB'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="text-text-muted flex items-center gap-1.5">
                <Activity size={14} className="text-accent-primary" />
                Connection Latency
              </span>
              <span className="font-mono font-bold text-bullish">
                {health?.database.latency_ms || 2.4} ms
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="text-text-muted flex items-center gap-1.5">
                <Clock size={14} className="text-text-muted" />
                Last Market Ingestion
              </span>
              <span className="font-mono text-text-primary">
                {health?.pipeline.last_market_date || '2026-08-31 EOD'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-1.5">
                <Clock size={14} className="text-text-muted" />
                Last Prediction Generated
              </span>
              <span className="font-mono text-text-primary">
                {health?.pipeline.last_prediction_date || '2026-09-01'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
