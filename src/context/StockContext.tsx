import React, { createContext, useContext, useState } from 'react';

export interface WatchlistStock {
  symbol: string;
  name: string;
}

const DEFAULT_WATCHLIST: WatchlistStock[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'META', name: 'Meta Platforms, Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
];

interface StockContextType {
  selectedTicker: string;
  setSelectedTicker: (ticker: string) => void;
  watchlist: WatchlistStock[];
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedTicker, setSelectedTicker] = useState<string>('NVDA');
  const [watchlist] = useState<WatchlistStock[]>(DEFAULT_WATCHLIST);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  return (
    <StockContext.Provider
      value={{
        selectedTicker,
        setSelectedTicker,
        watchlist,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStock = (): StockContextType => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};
