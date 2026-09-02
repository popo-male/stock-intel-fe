# Stock Intelligence Platform — Frontend (`stock-intel-fe`)

Institutional-grade financial analytics and multimodal trend prediction dashboard built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Recharts**, designed according to the **UI/UX Pro Max** specification.

---

## Key Features

1. **Light & Dark Theme Parity:**
   - Full first-class support for both clean financial Light Mode and deep midnight OLED Dark Mode.
   - Contrast ratio compliant with WCAG AAA/AA ($\ge 4.5:1$ text contrast, $\ge 3:1$ UI boundaries).
   - System preference sync and zero-flicker mode switching.

2. **Five Primary Platform Views:**
   - **Market Command Center (`/`):** Summary KPIs, watchlist matrix cards with 7-day vector sparklines, cross-stock sentiment distribution, trending keyword cloud, and prediction leaderboard.
   - **Stock Deep-Dive (`/stocks/:ticker`):** Dynamic ticker workstation with interactive candlestick OHLCV + moving averages (MA5/10/20), RSI momentum oscillator, explainable AI prediction gauge, and structured rule-based signals breakdown.
   - **News & Sentiment Intelligence (`/news`):** Multi-criteria filtered article feed with FinBERT sentiment scores, Groq LLM bullet takeaways, and keyword tags.
   - **Model Analytics & Research Lab (`/model`):** Empirical performance scorecard evaluating Experiment 1 (Market Only) vs Experiment 2 (Market + Sentiment), global feature importance chart (SHAP / Gain), out-of-sample confusion matrix, and cumulative backtest equity curves.
   - **AI Sandbox & System Operations (`/system`):** Real-time text sentiment analyzer for ad-hoc headlines, live Yahoo Finance quote proxy, and ETL pipeline freshness indicators.

3. **Accessible & Responsive:**
   - Monospace tabular numbers (`font-variant-numeric: tabular-nums`) eliminating layout jitter.
   - Non-color-dependent directional indicators (geometric glyphs ▲ / ▼ / ▬ + text badges).
   - Global quick search modal (`/` or `Cmd+K` keyboard shortcut).
   - Fluid responsiveness across 375px mobile, 768px tablet, and 1440px desktop screens.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file (or copy `.env.example`):
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
