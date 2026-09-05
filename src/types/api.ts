// API Response Envelope
export interface ApiResponse<T> {
  request_id: string;
  timestamp: string;
  data: T;
  error: {
    status_code: number;
    detail: string;
    errors: unknown;
  } | null;
}

// Common enums
export type TimeRange = '1d' | '7d' | '30d' | '90d' | '1y' | 'all';
export type SortOrder = 'asc' | 'desc';
export type Interval = 'daily' | 'weekly';

// Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Dashboard Summary
export interface DashboardSummary {
  range: string;
  range_start: string | null;
  range_end: string | null;
  stocks_tracked: number;
  total_articles: number;
  overall_market_sentiment: number | null;
  overall_sentiment_label: string | null;
  stock_with_most_articles: {
    ticker: string;
    name?: string;
    article_count: number;
  } | null;
  highest_sentiment_stock: {
    ticker: string;
    name?: string;
    avg_sentiment_score: number;
    article_count: number;
  } | null;
  lowest_sentiment_stock: {
    ticker: string;
    name?: string;
    avg_sentiment_score: number;
    article_count: number;
  } | null;
  hottest_keyword: {
    keyword: string;
    frequency: number;
  } | null;
  todays_biggest_gainer: {
    ticker: string;
    name?: string;
    close_price?: number;
    price_change_pct: number;
    trade_date?: string;
  } | null;
  todays_biggest_loser: {
    ticker: string;
    name?: string;
    close_price?: number;
    price_change_pct: number;
    trade_date?: string;
  } | null;
  prediction_consensus: {
    up_count: number;
    down_count: number;
    avg_confidence: number;
  } | null;
  last_updated: string | null;
}

// Market Overview Item
export interface MarketOverviewItem {
  ticker: string;
  name?: string;
  latest_trade_date?: string;
  close_price?: number;
  price_change_pct?: number;
  volume?: number;
  market_cap?: number;
  sparkline_7d: number[];
  sentiment_24h?: {
    avg_sentiment: number;
    label: string;
    news_count: number;
  };
  latest_prediction?: {
    direction: 'UP' | 'DOWN';
    confidence_score: number;
    prediction_date?: string;
  };
}

// Stock Overview & Detail
export interface StockDetailResponse {
  ticker: string;
  company_name?: string;
  is_active: boolean;
  market_data?: {
    trade_date?: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    adj_close?: number;
    volume?: number;
    price_change_pct?: number;
    daily_return?: number;
    market_cap?: number;
  };
  technical_summary?: {
    ma5?: number;
    ma10?: number;
    ma20?: number;
    rsi?: number;
    macd?: number;
    macd_signal?: number;
    close_to_ma20_spread?: number;
    high_low_spread?: number;
    open_close_spread?: number;
  };
  sentiment_summary?: {
    range: string;
    avg_sentiment?: number;
    sentiment_label?: string;
    total_articles: number;
    positive_articles: number;
    neutral_articles: number;
    negative_articles: number;
    sentiment_3d_rolling?: number;
  };
  prediction_summary?: {
    prediction_date?: string;
    target_direction?: 'UP' | 'DOWN';
    confidence_score?: number;
    probability_up?: number;
    probability_down?: number;
    signal_summary?: string;
  };
}

// Price History Item
export interface PriceHistoryItem {
  date: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  adj_close?: number;
  volume?: number;
  price_change_pct?: number;
}

// Technical Indicators Item
export interface TechnicalIndicatorItem {
  date: string;
  close?: number;
  ma5?: number;
  ma10?: number;
  ma20?: number;
  rsi?: number;
  macd?: number;
  macd_signal?: number;
  close_to_ma5?: number;
  close_to_ma10?: number;
  close_to_ma20?: number;
  high_low_spread?: number;
  open_close_spread?: number;
  spy_return?: number;
  qqq_return?: number;
}

// Prediction Detail Response
export interface PredictionDetailResponse {
  id: string;
  ticker: string;
  prediction_date: string;
  target_direction: 'UP' | 'DOWN';
  predicted_class: number;
  confidence_score: number;
  probabilities: {
    probability_up: number;
    probability_down: number;
  };
  signal?: {
    technical_signals?: Record<string, unknown>;
    sentiment_signals?: Record<string, unknown>;
    macro_context?: Record<string, unknown>;
    explanation?: string;
  };
  created_at?: string;
}

// Prediction History Item
export interface PredictionHistoryItem {
  prediction_date: string;
  predicted_direction: 'UP' | 'DOWN';
  confidence_score: number;
  actual_trade_date?: string;
  actual_price_change_pct?: number;
  actual_direction?: 'UP' | 'DOWN';
  is_correct?: boolean;
}

// News Article
export interface ArticleItem {
  id: string;
  title: string;
  url: string;
  source?: string;
  published_at: string;
  summary?: string;
  tickers: string[];
  sentiment_score?: number;
  sentiment_label?: 'bullish' | 'neutral' | 'bearish' | 'positive' | 'negative';
  bullets: string[];
  keywords: string[];
}

// Model Metrics
export interface ModelMetricsResponse {
  model_version: string;
  evaluated_at?: string;
  test_split_range: {
    start_date: string;
    end_date: string;
    total_samples: number;
  };
  comparison: {
    market_only: {
      accuracy: number;
      f1_macro: number;
      precision: number;
      recall: number;
      directional_hit_rate: number;
    };
    market_plus_sentiment: {
      accuracy: number;
      f1_macro: number;
      precision: number;
      recall: number;
      directional_hit_rate: number;
    };
    delta: {
      accuracy_gain_pct: number;
      directional_hit_gain_pct: number;
      conclusion: string;
    };
  };
  confusion_matrix?: {
    labels: string[];
    matrix: number[][];
  };
}

// Feature Importance
export interface FeatureImportanceItem {
  feature: string;
  category: 'sentiment' | 'technical' | 'macro';
  importance_score: number;
  rank: number;
}

// Backtest Performance
export interface BacktestPerformanceResponse {
  benchmark_return_pct: number;
  market_only_strategy_return_pct: number;
  multimodal_strategy_return_pct: number;
  time_series: {
    date: string;
    benchmark_equity: number;
    market_only_equity: number;
    multimodal_equity: number;
  }[];
}

// System Health
export interface SystemHealthResponse {
  status: string;
  database: {
    connected: boolean;
    engine: string;
    latency_ms?: number;
  };
  pipeline: {
    last_market_date?: string;
    last_news_article_at?: string;
    last_prediction_date?: string;
  };
  app_version: string;
  server_time: string;
}

// Live Quote
export interface LiveQuoteResponse {
  ticker: string;
  current_price?: number;
  day_open?: number;
  day_high?: number;
  day_low?: number;
  previous_close?: number;
  price_change?: number;
  price_change_pct?: number;
  volume?: number;
  market_cap?: number;
  market_state?: string;
  timestamp: string;
}

// On-demand NLP analysis
export interface AnalyzeTextResponse {
  sentiment_score: number;
  sentiment_label: string;
  model: string;
  bullets: string[];
  keywords: string[];
  processed_at: string;
}
