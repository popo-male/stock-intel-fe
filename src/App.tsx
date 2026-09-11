import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './context/ThemeContext';
import { StockProvider } from './context/StockContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { SearchModal } from './components/common/SearchModal';
import { DashboardPage } from './pages/DashboardPage';
import { StockDetailPage } from './pages/StockDetailPage';
import { NewsFeedPage } from './pages/NewsFeedPage';
import { ResearchPage } from './pages/ResearchPage';
import { SystemPage } from './pages/SystemPage';

export const App: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ThemeProvider>
      <StockProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-text-primary flex flex-col selection:bg-accent-primary selection:text-white">
            {/* Global Header */}
            <Header
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            {/* Global Search Modal (triggered by / or Cmd+K) */}
            <SearchModal />

            {/* Body Shell with Sidebar + Main Content */}
            <div className="flex-1 flex max-w-7xl w-full mx-auto">
              {/* Collapsible / Responsive Sidebar */}
              <Sidebar
                isMobileOpen={isMobileMenuOpen}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
              />

              {/* Main Content Viewport */}
              <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/stocks" element={<Navigate to="/stocks/NVDA" replace />} />
                  <Route path="/stocks/:ticker" element={<StockDetailPage />} />
                  <Route path="/news" element={<NewsFeedPage />} />
                  <Route path="/model" element={<ResearchPage />} />
                  <Route path="/system" element={<SystemPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </BrowserRouter>
        <Analytics />
      </StockProvider>
    </ThemeProvider>
  );
};

export default App;
