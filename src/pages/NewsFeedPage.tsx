import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Newspaper,
  Search,
  ExternalLink,
  Tag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { getArticles } from '../services/api';
import { ArticleItem, PaginatedResponse } from '../types/api';
import { SentimentPill } from '../components/common/SentimentPill';
import { Skeleton } from '../components/common/SkeletonLoader';
import { useStock } from '../context/StockContext';

export const NewsFeedPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { watchlist } = useStock();

  const initialTicker = searchParams.get('ticker') || '';
  const initialSentiment = searchParams.get('sentiment') || '';
  const initialKeyword = searchParams.get('keyword') || '';

  const [selectedTicker, setSelectedTicker] = useState<string>(initialTicker);
  const [selectedSentiment, setSelectedSentiment] = useState<string>(initialSentiment);
  const [searchQuery, setSearchQuery] = useState<string>(initialKeyword);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [articlesData, setArticlesData] = useState<PaginatedResponse<ArticleItem> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const res = await getArticles(
          selectedTicker || undefined,
          selectedSentiment || undefined,
          currentPage,
          10,
          searchQuery || undefined
        );
        setArticlesData(res);
      } catch (err) {
        console.error('Failed to load articles:', err);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, [selectedTicker, selectedSentiment, currentPage, searchQuery]);

  const handleSentimentFilter = (sent: string) => {
    setSelectedSentiment(sent);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    if (sent) params.set('sentiment', sent);
    else params.delete('sentiment');
    setSearchParams(params);
  };

  const handleTickerFilter = (ticker: string) => {
    setSelectedTicker(ticker);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    if (ticker) params.set('ticker', ticker);
    else params.delete('ticker');
    setSearchParams(params);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    if (val.trim()) params.set('keyword', val.trim());
    else params.delete('keyword');
    setSearchParams(params);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    params.set('keyword', tag);
    setSearchParams(params);
  };

  const totalPages = articlesData?.total_pages || 1;
  const totalCount = articlesData?.total || 0;
  const pageItems = articlesData?.items || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Newspaper size={24} className="text-accent-primary" />
            Financial News & Sentiment Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            FinBERT polarity scoring combined with Groq LLM executive takeaways and entity tagging.
          </p>
        </div>
      </div>

      {/* Multi-Criteria Filter Toolbar */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Sentiment Filter Pills (Bullish / Neutral / Bearish) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-text-muted mr-1">Sentiment:</span>
            {[
              { label: 'All', value: '' },
              { label: 'Bullish', value: 'bullish' },
              { label: 'Neutral', value: 'neutral' },
              { label: 'Bearish', value: 'bearish' },
            ].map((p) => {
              const isSelected = selectedSentiment.toLowerCase() === p.value.toLowerCase();
              return (
                <button
                  key={p.value}
                  onClick={() => handleSentimentFilter(p.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-accent-primary text-white shadow-xs'
                      : 'bg-surface-raised text-text-secondary hover:text-text-primary border border-border-subtle'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Ticker Dropdown Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted">Stock:</span>
            <select
              value={selectedTicker}
              onChange={(e) => handleTickerFilter(e.target.value)}
              className="bg-surface-raised border border-border-subtle rounded-lg px-3 py-1 text-xs font-mono font-semibold text-text-primary cursor-pointer hover:border-border-strong focus:outline-none"
            >
              <option value="">All Tickers</option>
              {watchlist.map((w) => (
                <option key={w.symbol} value={w.symbol}>
                  {w.symbol} - {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search keywords, headlines, or entities..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
          />
        </div>
      </div>

      {/* Articles Feed */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))
        ) : pageItems.length > 0 ? (
          pageItems.map((art) => (
            <div
              key={art.id}
              className="bg-surface border border-border-subtle hover:border-border-strong rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              {/* Header: Sentiment + Ticker Badges + Source */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SentimentPill score={art.sentiment_score} label={art.sentiment_label} size="sm" />
                  {art.tickers.map((t) => (
                    <span
                      key={t}
                      onClick={() => handleTickerFilter(t)}
                      className="font-mono font-bold text-[11px] bg-surface-raised px-2 py-0.5 rounded border border-border-subtle text-text-primary hover:border-accent-primary cursor-pointer"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-text-muted font-mono flex items-center gap-2">
                  <span>{art.source}</span>
                  <span>•</span>
                  <span>{new Date(art.published_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Article Title */}
              <h2 className="text-base font-bold text-text-primary hover:text-accent-primary transition-colors">
                <a href={art.url} target="_blank" rel="noreferrer" className="flex items-start justify-between gap-2">
                  <span>{art.title}</span>
                  <ExternalLink size={16} className="shrink-0 text-text-muted mt-1" />
                </a>
              </h2>

              {/* Summary */}
              {art.summary && (
                <p className="text-xs text-text-secondary leading-relaxed">
                  {art.summary}
                </p>
              )}

              {/* LLM Key Bullet Takeaways */}
              {art.bullets && art.bullets.length > 0 && (
                <div className="p-3 rounded-xl bg-surface-raised border border-border-subtle/80 text-xs space-y-1.5">
                  <div className="font-semibold text-[11px] text-accent-primary flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles size={13} />
                    Key Takeaways (LLM Extracted)
                  </div>
                  <ul className="space-y-1 text-text-secondary">
                    {art.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-accent-primary font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Keyword Chips Footer */}
              {art.keywords && art.keywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Tag size={12} className="text-text-muted mr-1" />
                  {art.keywords.map((k, idx) => (
                    <span
                      key={idx}
                      onClick={() => handleTagClick(k)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-surface-raised text-text-muted hover:text-text-primary border border-border-subtle cursor-pointer transition-colors"
                    >
                      #{k}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-surface rounded-2xl border border-border-subtle text-xs text-text-muted">
            No articles found matching the current search or filter criteria.
          </div>
        )}
      </div>

      {/* Pagination Bar (Always synchronized with search count) */}
      {articlesData && (
        <div className="flex items-center justify-between px-2 pt-4 border-t border-border-subtle text-xs">
          <span className="text-text-muted font-mono">
            Page {currentPage} of {totalPages} ({totalCount} {totalCount === 1 ? 'article' : 'articles'})
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg bg-surface border border-border-subtle disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-hover text-text-primary transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg bg-surface border border-border-subtle disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-hover text-text-primary transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
