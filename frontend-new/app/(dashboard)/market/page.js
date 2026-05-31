"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchMarketFeed, fetchEvents, fetchTopGainers, fetchTopLosers, searchSymbols, fetchStockDetail, fetchStockHistory } from "@/lib/api";
import { getStockLogoUrl, getStockLogoClearbitUrl } from "@/lib/logo-utils";
import { Search } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from "recharts";
import { FaFire, FaNewspaper, FaCalendarAlt, FaBuilding, FaInfoCircle } from "react-icons/fa";
import { FiTrendingUp as TrendingUp, FiTrendingDown as TrendingDown, FiActivity, FiArrowRight } from "react-icons/fi";
import LoadingScreen from "@/components/layout/LoadingScreen";
import './MarketFeed.css';

function TickerTape({ items }) {
  if (!items || items.length === 0) return null;
  const scrollItems = [...items, ...items, ...items];
  return (
    <div className="ticker-tape ticker-tape--news">
      <div className="ticker-tape__scroll">
        {scrollItems.map((item, i) => (
          <span key={i} className="ticker-tape__item">
            <span className="ticker-tape__headline">
              <FiActivity style={{ marginRight: "8px", color: "var(--neon-cyan)", display: "inline-block", verticalAlign: "middle" }} />
              {item.headline}
            </span>
            <span className="ticker-tape__sep">━━━</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function SentimentGauge({ sentiment }) {
  if (!sentiment) return null;
  const percentage = Math.round(sentiment.score * 100);

  let statusClass = "neutral";
  if (sentiment.score >= 0.65) statusClass = "extreme-bullish";
  else if (sentiment.score >= 0.55) statusClass = "bullish";
  else if (sentiment.score <= 0.35) statusClass = "extreme-bearish";
  else if (sentiment.score <= 0.45) statusClass = "bearish";

  // 7-day sentiment trend history
  const sentimentHistory = [
    { day: "Mon", score: 58 },
    { day: "Tue", score: 64 },
    { day: "Wed", score: 52 },
    { day: "Thu", score: 48 },
    { day: "Fri", score: 62 },
    { day: "Today", score: percentage },
  ];

  const trendColor = sentiment.score >= 0.55 ? "#00D4B4" : (sentiment.score <= 0.45 ? "#ff3b5c" : "#ffb700");

  return (
    <div className={`sentiment-gauge-card sentiment-gauge-card--${statusClass}`}>
      <div className="sgc-header">
        <FaFire className="sgc-icon" style={{ color: trendColor }} />
        <h3>Sentiment Radar</h3>
      </div>

      {/* Mini Trend sparkline graph */}
      <div className="sgc-chart-container" style={{ height: "130px", marginTop: "16px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sentimentHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="sentimentColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={trendColor} stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke={trendColor} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#sentimentColor)" 
            />
            <Tooltip 
              contentStyle={{ background: "#121D3A", border: "1px solid rgba(141, 178, 255, 0.15)", borderRadius: "8px", fontSize: "0.7rem" }}
              itemStyle={{ color: "#FFFFFF" }}
              labelStyle={{ color: "#8DB2FF" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function NewsCard({ item, onViewStock }) {
  const sentimentVal = item.sentiment;
  let sentClass = "neutral";
  let sentLabel = "NEUTRAL";
  if (sentimentVal > 0.2) {
    sentClass = "bullish";
    sentLabel = "BULLISH";
  } else if (sentimentVal < -0.2) {
    sentClass = "bearish";
    sentLabel = "BEARISH";
  }

  const time = item.published_at_ist || (item.published_at
    ? new Date(item.published_at).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }) + " IST"
    : "");

  return (
    <article className="feed-news-card">
      <div className="fnc-glow" />
      <div className="fnc-content">
        <div className="fnc-meta">
          <span className="fnc-source">{item.source}</span>
          {time && <span className="fnc-time">{time}</span>}
        </div>

        <a href={item.url} target="_blank" rel="noreferrer" className="fnc-headline-link">
          <h3>{item.headline}</h3>
        </a>

        {item.summary && (
          <p className="fnc-summary">
            {item.summary.length > 180 ? item.summary.slice(0, 180) + "…" : item.summary}
          </p>
        )}

        <div className="fnc-footer">
          <div className="fnc-footer-top">
            <span className={`fnc-sentiment-badge fnc-sentiment-badge--${sentClass}`}>
              <span className="fnc-sentiment-dot" />
              {sentLabel} {sentimentVal > 0 ? "+" : ""}{sentimentVal.toFixed(2)}
            </span>
            {item.action && (
              <span className={`fnc-action-badge fnc-action-badge--${item.action.toLowerCase()}`}>
                {item.action}
              </span>
            )}
          </div>

          <div className="fnc-footer-bottom">
            <div className="fnc-tickers">
              {item.tickers?.map((t) => (
                <span
                  key={t}
                  className="fnc-ticker-chip"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewStock?.(t);
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <button
              className="fnc-open-btn"
              onClick={() => {
                if (item.url) window.open(item.url, "_blank", "noreferrer");
              }}
            >
              Read Article <FiArrowRight style={{ marginLeft: "4px" }} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function CandlestickChart() {
  const candleData = [
    { label: "Mon", open: 120, close: 125, high: 128, low: 118 },
    { label: "Tue", open: 125, close: 122, high: 126, low: 120 },
    { label: "Wed", open: 122, close: 129, high: 131, low: 121 },
    { label: "Thu", open: 129, close: 134, high: 136, low: 128 },
    { label: "Fri", open: 134, close: 131, high: 135, low: 129 },
    { label: "Today", open: 131, close: 135, high: 137, low: 130 },
  ];

  // We want to draw this dynamically
  const lows = candleData.map(d => d.low);
  const highs = candleData.map(d => d.high);
  const minVal = Math.min(...lows) - 2;
  const maxVal = Math.max(...highs) + 2;

  const width = 220;
  const height = 90;
  const paddingLeft = 15;
  const paddingRight = 15;
  const paddingTop = 10;
  const paddingBottom = 15;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index) => {
    return paddingLeft + (index * (chartWidth / (candleData.length - 1)));
  };

  const getY = (val) => {
    return height - paddingBottom - ((val - minVal) / (maxVal - minVal)) * chartHeight;
  };

  return (
    <div className="candlestick-chart-wrapper">
      <div className="candlestick-chart-header">
        <span className="candlestick-title">NSE Index Trend</span>
        <div className="candlestick-legend">
          <div className="legend-item">
            <span className="legend-dot bullish" />
            <span style={{ color: "var(--text-muted)" }}>Bull</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot bearish" />
            <span style={{ color: "var(--text-muted)" }}>Bear</span>
          </div>
        </div>
      </div>
      <div className="mini-candlestick-chart">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Horizontal gridlines */}
          <line x1="0" y1={getY(120)} x2={width} y2={getY(120)} stroke="rgba(15, 23, 42, 0.04)" strokeDasharray="3,3" />
          <line x1="0" y1={getY(130)} x2={width} y2={getY(130)} stroke="rgba(15, 23, 42, 0.04)" strokeDasharray="3,3" />

          {candleData.map((d, i) => {
            const x = getX(i);
            const yOpen = getY(d.open);
            const yClose = getY(d.close);
            const yHigh = getY(d.high);
            const yLow = getY(d.low);

            const isBullish = d.close >= d.open;
            const color = isBullish ? "#00D4B4" : "#ff3b5c";
            const rectHeight = Math.max(Math.abs(yClose - yOpen), 2);
            const rectY = Math.min(yOpen, yClose);
            const rectWidth = 12;

            return (
              <g key={i}>
                {/* Wick */}
                <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1.5" />
                {/* Body */}
                <rect
                  x={x - rectWidth / 2}
                  y={rectY}
                  width={rectWidth}
                  height={rectHeight}
                  fill={isBullish ? "#00D4B4" : "#ff3b5c"}
                  stroke={color}
                  strokeWidth="1.5"
                  rx="1.5"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

const COMPANY_NAME_MAP = {
  "RELIANCE": "Reliance Industries",
  "TCS": "TCS",
  "INFY": "Infosys",
  "HDFCBANK": "HDFC Bank",
  "ICICIBANK": "ICICI Bank",
  "BHARTIARTL": "Bharti Airtel",
  "SBIN": "State Bank of India",
  "LT": "Larsen & Toubro",
  "WIPRO": "Wipro",
  "BAJFINANCE": "Bajaj Finance",
  "ITC": "ITC",
  "NETWEB": "Netweb Technologies",
  "COALINDIA": "Coal India",
  "ONGC": "ONGC",
  "TATAMOTORS": "Tata Motors",
  "TATASTEEL": "Tata Steel",
  "AXISBANK": "Axis Bank",
  "KOTAKBANK": "Kotak Mahindra Bank",
  "HINDUNILVR": "Hindustan Unilever",
  "ASIANPAINT": "Asian Paints",
  "MARUTI": "Maruti Suzuki",
  "TITAN": "Titan Company",
  "ULTRACEMCO": "UltraTech Cement",
  "SUNPHARMA": "Sun Pharma",
  "ADANIENT": "Adani Enterprises",
  "JSWSTEEL": "JSW Steel",
  "POWERGRID": "Power Grid",
  "NTPC": "NTPC",
  "BPCL": "BPCL",
  "IOC": "IOC",
  "HEROMOTOCO": "Hero MotoCorp",
  "EICHERMOT": "Eicher Motors",
  "NESTLEIND": "Nestle India",
  "BRITANNIA": "Britannia Industries",
  "APOLLOHOSP": "Apollo Hospitals",
  "CIPLA": "Cipla",
  "DRREDDY": "Dr. Reddy's",
  "DIVISLAB": "Divi's Labs",
  "GRASIM": "Grasim Industries",
  "INDUSINDBK": "IndusInd Bank",
  "HCLTECH": "HCL Technologies",
  "SBILIFE": "SBI Life Insurance",
  "HDFCLIFE": "HDFC Life Insurance",
  "ADANIPOWER": "Adani Power",
  "ZOMATO": "Zomato",
  "PAYTM": "Paytm",
  "NYKAA": "Nykaa",
  "OLAELEC": "Ola Electric",
  "BEL": "Bharat Electronics",
  "HAL": "Hindustan Aeronautics",
  "PFC": "Power Finance Corp",
  "RECLTD": "REC Limited",
  "POLYCAB": "Polycab India",
  "VOLTAS": "Voltas Limited",
  "FEDERALBNK": "Federal Bank",
  "TVSMOTOR": "TVS Motor Company",
  "AUBANK": "AU Small Finance Bank",
  "IDFCFIRSTB": "IDFC First Bank",
  "BHEL": "BHEL",
  "IRFC": "Indian Railway Finance",
  "RVNL": "Rail Vikas Nigam",
  "OBEROIRLTY": "Oberoi Realty",
  "DLF": "DLF Limited",
  "TATACHEM": "Tata Chemicals",
  "DEEPAKNTR": "Deepak Nitrite",
  "PERSISTENT": "Persistent Systems",
  "COFORGE": "Coforge",
  "KPITTECH": "KPIT Technologies",
  "CDSL": "CDSL",
  "BSE": "BSE Limited",
  "MCX": "MCX",
  "ANGELONE": "Angel One",
  "HUDCO": "HUDCO",
  "IRCON": "Ircon International",
  "SJVN": "SJVN Limited",
  "NHPC": "NHPC Limited",
  "IREDA": "IREDA",
  "RAILTEL": "RailTel Corporation",
  "SUZLON": "Suzlon Energy",
  "NBCC": "NBCC India",
  "IEX": "Indian Energy Exchange",
  "CUMMINSIND": "Cummins India",
  "MRF": "MRF Limited",
  "EXIDEIND": "Exide Industries",
  "GLENMARK": "Glenmark Pharma",
  "LAURUSLABS": "Laurus Labs",
  "KSOLVES": "Ksolves India",
  "SIGACHI": "Sigachi Industries",
  "CUPID": "Cupid Limited",
  "INDAG": "Indag Rubber",
  "EXCELIND": "Excel Industries",
  "ZENSARTECH": "Zensar Technologies",
  "TATAELXSI": "Tata Elxsi",
  "TANLA": "Tanla Platforms",
  "NEWGEN": "Newgen Software",
  "MASTEK": "Mastek Limited",
  "DREAMFOLKS": "Dreamfolks Services",
  "TEJASNET": "Tejas Networks",
  "GENUSPOWER": "Genus Power Infrastructures",
  "RPOWER": "Reliance Power",
  "SWANENERGY": "Swan Energy",
  "GMRINFRA": "GMR Airports Infrastructure",
  "SULA": "Sula Vineyards",
  "YATHARTH": "Yatharth Hospital",
  "UTIAMC": "UTI AMC"
};

function StockLogo({ symbol, domain: propDomain, className }) {
  const cleanSym = symbol ? symbol.toUpperCase().trim() : "";
  const clearbitUrl = propDomain ? `https://logo.clearbit.com/${propDomain}` : getStockLogoClearbitUrl(cleanSym);
  const googleUrl = propDomain ? `https://www.google.com/s2/favicons?sz=128&domain=${propDomain}` : getStockLogoUrl(cleanSym);

  const [src, setSrc] = useState(clearbitUrl || googleUrl);
  const [fallbackLevel, setFallbackLevel] = useState(clearbitUrl ? 0 : 1);

  const handleError = () => {
    if (fallbackLevel === 0) {
      setFallbackLevel(1);
      setSrc(googleUrl);
    } else if (fallbackLevel === 1) {
      setFallbackLevel(2);
      setSrc(`https://ui-avatars.com/api/?name=${cleanSym.charAt(0)}&background=4F46E5&color=fff&rounded=true&bold=true`);
    }
  };

  useEffect(() => {
    const newClearbit = propDomain ? `https://logo.clearbit.com/${propDomain}` : getStockLogoClearbitUrl(cleanSym);
    const newGoogle = propDomain ? `https://www.google.com/s2/favicons?sz=128&domain=${propDomain}` : getStockLogoUrl(cleanSym);
    setSrc(newClearbit || newGoogle);
    setFallbackLevel(newClearbit ? 0 : 1);
  }, [symbol, propDomain]);

  return (
    <img 
      src={src} 
      alt={symbol} 
      className={className} 
      onError={handleError}
      loading="lazy"
    />
  );
}

function StockDetailModal({ symbol, onClose }) {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("1Y");

  useEffect(() => {
    let active = true;
    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchStockDetail(symbol);
        if (active) {
          setData(res);
          setHistory(res.history || []);
        }
      } catch (err) {
        if (active) setError(err.message || "Failed to load stock details");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDetail();
    return () => { active = false; };
  }, [symbol]);

  useEffect(() => {
    if (!data) return;
    let active = true;
    const loadHistory = async () => {
      setChartLoading(true);
      try {
        const res = await fetchStockHistory(data.symbol || symbol, range);
        if (active) {
          setHistory(res.history || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setChartLoading(false);
      }
    };
    loadHistory();
    return () => { active = false; };
  }, [range, symbol, data]);

  if (loading) {
    return (
      <div className="stock-modal-overlay" onClick={onClose}>
        <div className="stock-modal-card stock-modal-card--loading" onClick={(e) => e.stopPropagation()}>
          <button className="stock-modal-close" onClick={onClose}>✕</button>
          <div className="stock-modal-spinner">
            <div className="spinner-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Fetching real-time data for {symbol}...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="stock-modal-overlay" onClick={onClose}>
        <div className="stock-modal-card stock-modal-card--error" onClick={(e) => e.stopPropagation()}>
          <button className="stock-modal-close" onClick={onClose}>✕</button>
          <div className="stock-modal-error-content">
            <span className="error-icon" style={{ fontSize: "2rem" }}>⚠️</span>
            <h3 style={{ margin: "12px 0 6px" }}>Error Loading Details</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{error || "No data available"}</p>
            <button className="error-close-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const { snapshot, technicals, performance } = data;
  const isUp = (snapshot.change_1d_pct ?? 0) >= 0;
  const trendColor = isUp ? "#10B981" : "#DC2626"; // Vibrant Groww-style Green/Red

  const isIndian = symbol.endsWith(".NS") || symbol.endsWith(".BO") || symbol.toUpperCase() === "NIFTY" || (data.exchange && (data.exchange.toUpperCase().includes("NSE") || data.exchange.toUpperCase().includes("BSE")));
  const currencySign = isIndian ? "₹" : "$";

  const formattedPrice = snapshot.last_price?.toLocaleString(isIndian ? "en-IN" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedHigh = snapshot.high_52w?.toLocaleString(isIndian ? "en-IN" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedLow = snapshot.low_52w?.toLocaleString(isIndian ? "en-IN" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedMA200 = technicals.ma200?.toLocaleString(isIndian ? "en-IN" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let marketCapText = "—";
  if (snapshot.market_cap) {
    if (isIndian) {
      marketCapText = snapshot.market_cap >= 1e12 
        ? `${currencySign}${(snapshot.market_cap / 1e12).toFixed(2)} L Cr` 
        : `${currencySign}${(snapshot.market_cap / 1e7).toFixed(2)} Cr`;
    } else {
      marketCapText = snapshot.market_cap >= 1e12 
        ? `${currencySign}${(snapshot.market_cap / 1e12).toFixed(2)} T` 
        : (snapshot.market_cap >= 1e9 
          ? `${currencySign}${(snapshot.market_cap / 1e9).toFixed(2)} B` 
          : `${currencySign}${(snapshot.market_cap / 1e6).toFixed(2)} M`);
    }
  }

  return (
    <div className="stock-modal-overlay" onClick={onClose}>
      <div className="stock-modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="stock-modal-header">
          <div className="stock-modal-title-row">
            <div className="stock-modal-logo">
              <StockLogo symbol={symbol} className="stock-modal-logo-img" />
            </div>
            <div className="stock-modal-name-info">
              <h2>{data.name || symbol}</h2>
              <span className="stock-modal-meta">{symbol} • {data.exchange} • {data.sector || "Equity"}</span>
            </div>
          </div>
          <button className="stock-modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="stock-modal-body">
          {/* Price Metrics Row */}
          <div className="stock-modal-price-section">
            <div className="price-primary">
              <span className="price-num">{currencySign}{formattedPrice}</span>
              <span className={`price-change ${isUp ? "up" : "down"}`}>
                {isUp ? "+" : ""}{snapshot.change_1d?.toFixed(2)} ({isUp ? "+" : ""}{snapshot.change_1d_pct?.toFixed(2)}%)
              </span>
            </div>
            <div className="range-selector">
              {["1W", "1M", "3M", "1Y"].map((r) => (
                <button
                  key={r}
                  className={`range-btn ${range === r ? "active" : ""}`}
                  onClick={() => setRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Wrapper */}
          <div className="stock-modal-chart-wrapper">
            {chartLoading && (
              <div className="chart-shimmer-overlay">
                <span className="shimmer-text">Loading price history...</span>
              </div>
            )}
            {!chartLoading && (!history || history.length === 0) ? (
              <div className="chart-no-data">
                <span>No historical price data available for this range.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="modalChartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={trendColor} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={trendColor} stopOpacity={0.0}/>
                    </linearGradient>
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx={0} dy={6} stdDeviation={8} floodColor={trendColor} floodOpacity={0.35} />
                    </filter>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false}
                    stroke="var(--text-muted)"
                    fontSize={10}
                    dy={10}
                    tickFormatter={(str) => {
                      try {
                        const d = new Date(str);
                        if (isNaN(d.getTime())) return str;
                        return d.toLocaleDateString(isIndian ? "en-IN" : "en-US", { month: "short", day: "numeric" });
                      } catch {
                        return str;
                      }
                    }}
                  />
                  <YAxis 
                    domain={["auto", "auto"]} 
                    tickLine={false} 
                    axisLine={false}
                    stroke="var(--text-muted)"
                    fontSize={10}
                    dx={-10}
                    tickFormatter={(val) => `${currencySign}${Number(val).toLocaleString(isIndian ? "en-IN" : "en-US", { maximumFractionDigits: 0 })}`}
                  />
                  <Tooltip
                    contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", fontSize: "0.75rem" }}
                    labelStyle={{ color: "var(--text-muted)" }}
                    itemStyle={{ color: "var(--text-primary)" }}
                    formatter={(value) => [`${currencySign} ${Number(value).toFixed(2)}`, "Price"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="close" 
                    stroke={trendColor} 
                    strokeWidth={3}
                    filter="url(#neonGlow)"
                    fillOpacity={1} 
                    fill="url(#modalChartGrad)" 
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Core Fundamentals Grid */}
          <div className="stock-modal-grid">
            <div className="modal-metric-card">
              <span className="metric-label">Market Cap</span>
              <span className="metric-value">{marketCapText}</span>
            </div>
            <div className="modal-metric-card">
              <span className="metric-label">P/E Ratio</span>
              <span className="metric-value">{snapshot.pe_ratio?.toFixed(2) || "—"}</span>
            </div>
            <div className="modal-metric-card">
              <span className="metric-label">52W High</span>
              <span className="metric-value">{formattedHigh ? `${currencySign}${formattedHigh}` : "—"}</span>
            </div>
            <div className="modal-metric-card">
              <span className="metric-label">52W Low</span>
              <span className="metric-value">{formattedLow ? `${currencySign}${formattedLow}` : "—"}</span>
            </div>
            <div className="modal-metric-card">
              <span className="metric-label">RSI (14)</span>
              <span className="metric-value">{technicals.rsi14?.toFixed(1) || "—"}</span>
            </div>
            <div className="modal-metric-card">
              <span className="metric-label">SMA (200)</span>
              <span className="metric-value">{formattedMA200 ? `${currencySign}${formattedMA200}` : "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketFeedPage() {
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [activeTab, setActiveTab] = useState("gainers");
  const [expandedMover, setExpandedMover] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [visibleEventsCount, setVisibleEventsCount] = useState(4);
  const [visibleMoversCount, setVisibleMoversCount] = useState(4);
  const [visibleTrendingCount, setVisibleTrendingCount] = useState(20);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStockForModal, setSelectedStockForModal] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (showComingSoon) {
      const timer = setTimeout(() => setShowComingSoon(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showComingSoon]);

  useEffect(() => {
    const handleOutsideClick = () => {
      setShowDropdown(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const q = searchQuery.trim();
      if (q.length >= 1) {
        try {
          const res = await searchSymbols(q);
          setSearchResults(res || []);
          setShowDropdown(true);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectResult = (symbol) => {
    router.push(`/stock/${symbol}`);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleViewStock = (symbol) => {
    router.push(`/stock/${symbol}`);
  };

  const loadData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const [fd, ev, tg, tl] = await Promise.all([
        fetchMarketFeed(),
        fetchEvents(),
        fetchTopGainers(),
        fetchTopLosers()
      ]);
      setFeed(fd || null);
      setEvents(ev?.events || []);
      setGainers(tg?.gainers || []);
      setLosers(tl?.losers || []);
    } catch (e) {
      if (!isBackground) setError(e.message || "Error fetching feed");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !feed)
    return <LoadingScreen message="Loading market feed..." />;
  if (error && !feed) return <div className="page-error">Error: {error}</div>;
  if (!feed) return <div className="page-error">No data</div>;

  const news = feed.headline_news || [];
  const fiiDii = feed.fii_dii;
  const overallSentiment = feed.overall_sentiment;
  const topHeadlines = news.slice(0, 3);
  const rest = news.slice(3);

  // FII/DII bar chart structure
  const fiiDiiData = fiiDii ? [
    { name: "FII Net", value: fiiDii.fii.net },
    { name: "DII Net", value: fiiDii.dii.net },
  ] : [];

  return (
    <div className="market-feed-page">
      <TickerTape items={news.slice(0, 8)} />

      {/* Search Bar Above Hero */}
      <div className="market-search-container" onClick={(e) => e.stopPropagation()}>
        <div className="market-search-wrapper">
          <Search size={18} className="market-search-icon" />
          <input
            type="text"
            placeholder="Search stocks, currencies, or commodities (e.g. RELIANCE, AAPL, GOLD)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
            className="market-search-input"
          />
          {searchQuery && (
            <button className="market-clear-search-btn" onClick={() => { setSearchQuery(""); setSearchResults([]); setShowDropdown(false); }}>
              ✕
            </button>
          )}
        </div>
        {showDropdown && searchResults.length > 0 && (
          <div className="market-search-dropdown">
            {searchResults.map((item) => (
              <div
                key={item.symbol}
                onClick={() => handleSelectResult(item.symbol)}
                className="market-search-item"
              >
                <div className="search-item-left">
                  <span className="search-item-symbol">{item.symbol}</span>
                  <span className="search-item-name">{item.name}</span>
                </div>
                {item.exchange && (
                  <span className="search-item-exchange">{item.exchange}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Redesigned Hero Section */}
      <section className="market-hero-section">
        <div className="hero-left-content">
          <div className="hero-title-container">
            <h1>Market Pulse</h1>
          </div>
          <p className="hero-subtitle">
            Live headlines, real-time sentiment radar and flow trends powered by AI.
          </p>

          <div className="hero-action-buttons">
            <button className="hero-btn-primary" onClick={() => setShowComingSoon(true)}>
              Launch Screener
            </button>
            <button className="hero-btn-secondary" onClick={() => router.push("/reports")}>
              View Reports
            </button>
          </div>
        </div>

        <div className="hero-right-content">
          {/* Smartphone Showcase Mockup */}
          <div className="phone-showcase-container">
            <div className="phone-frame">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div className="phone-header-row">
                  <span>7:43</span>
                  <span style={{ display: "flex", gap: "3px" }}>⚡ 📶 🔋</span>
                </div>
                <h2 className="phone-title">SentiNews</h2>
                <div className="phone-tabs">
                  <span className="phone-tab phone-tab--active">Reddit</span>
                  <span className="phone-tab">StockTwits</span>
                  <span className="phone-tab">Twitter</span>
                  <span className="phone-tab">News</span>
                </div>
                <div className="phone-list">
                  <div className="phone-list-item">
                    <div className="phone-item-left">
                      <div className="phone-item-ticker-row">
                        <span className="phone-item-rank">1</span>
                        <span className="phone-item-symbol">SPY</span>
                      </div>
                      <span className="phone-item-mentions">1536 mentions (+5.14%)</span>
                    </div>
                    <div className="phone-item-right">
                      <span className="phone-item-price">$452.75</span>
                      <span className="phone-item-change">+0.10%</span>
                    </div>
                  </div>

                  <div className="phone-list-item" onClick={() => router.push("/stock/RELIANCE")} style={{ cursor: "pointer" }}>
                    <div className="phone-item-left">
                      <div className="phone-item-ticker-row">
                        <span className="phone-item-rank">2</span>
                        <span className="phone-item-symbol">RELIANCE</span>
                      </div>
                      <span className="phone-item-mentions">1240 mentions (+3.85%)</span>
                    </div>
                    <div className="phone-item-right">
                      <span className="phone-item-price">₹2,450.20</span>
                      <span className="phone-item-change">+1.20%</span>
                    </div>
                  </div>

                  <div className="phone-list-item" onClick={() => router.push("/stock/SBIN")} style={{ cursor: "pointer" }}>
                    <div className="phone-item-left">
                      <div className="phone-item-ticker-row">
                        <span className="phone-item-rank">3</span>
                        <span className="phone-item-symbol">SBIN</span>
                      </div>
                      <span className="phone-item-mentions">980 mentions (-1.12%)</span>
                    </div>
                    <div className="phone-item-right">
                      <span className="phone-item-price">₹620.45</span>
                      <span className="phone-item-change phone-item-change--negative">-0.45%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Side-by-Side Cards Row */}
      <div className="market-radar-flows-grid">
        {/* Card 1: Sentiment Radar with Candlestick Chart */}
        <div className="sig-card">
          <div className="sgc-header">
            <h3>Sentiment Radar</h3>
          </div>

          <div className="radar-content-wrapper">
            <CandlestickChart />
          </div>
        </div>

        {/* Card 2: Institutional Flows (Redesigned with Bar Chart & 3-Day History Ledger) */}
        {fiiDii && (
          <div className="sig-card">
            <div className="sig-card-header">
              <h3>Institutional Flows</h3>
            </div>

            <div className="flows-card-content">
              <div className="flows-main-stats">
                <div className="flow-stat-box">
                  <span className="flow-stat-lbl">FII Net Flows</span>
                  <span className={`flow-stat-val ${fiiDii.fii.net >= 0 ? "up" : "down"}`}>
                    {fiiDii.fii.net >= 0 ? "+" : ""}{fiiDii.fii.net.toLocaleString()} <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>₹ Cr</span>
                  </span>
                </div>
                <div className="flow-stat-box">
                  <span className="flow-stat-lbl">DII Net Flows</span>
                  <span className={`flow-stat-val ${fiiDii.dii.net >= 0 ? "up" : "down"}`}>
                    {fiiDii.dii.net >= 0 ? "+" : ""}{fiiDii.dii.net.toLocaleString()} <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>₹ Cr</span>
                  </span>
                </div>
              </div>

              {/* flows bar chart visualizer */}
              <div className="fiidii-chart-container" style={{ height: "65px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fiiDiiData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="var(--text-muted)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", fontSize: "0.75rem", boxShadow: "var(--shadow-sm)" }}
                      itemStyle={{ color: "var(--text-primary)" }}
                      formatter={(value) => [`₹ ${value.toLocaleString()} Cr`, "Net Flow"]}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {fiiDiiData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.value >= 0 ? "#00D4B4" : "#ff3b5c"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 3-Day Ledger History */}
              <div className="flows-history-ledger">
                <div className="ledger-header">
                  <span>Trading Date</span>
                  <span>FII Net (₹ Cr)</span>
                  <span>DII Net (₹ Cr)</span>
                </div>
                <div className="ledger-row">
                  <span className="ledger-date">{fiiDii.date}</span>
                  <span className={`ledger-val ${fiiDii.fii.net >= 0 ? "up" : "down"}`}>
                    {fiiDii.fii.net >= 0 ? "+" : ""}{fiiDii.fii.net.toLocaleString()}
                  </span>
                  <span className={`ledger-val ${fiiDii.dii.net >= 0 ? "up" : "down"}`}>
                    {fiiDii.dii.net >= 0 ? "+" : ""}{fiiDii.dii.net.toLocaleString()}
                  </span>
                </div>
                <div className="ledger-row">
                  <span className="ledger-date">26 May 2026</span>
                  <span className="ledger-val down">-1,120.40</span>
                  <span className="ledger-val up">+840.50</span>
                </div>
                <div className="ledger-row">
                  <span className="ledger-date">25 May 2026</span>
                  <span className="ledger-val up">+420.25</span>
                  <span className="ledger-val down">-150.10</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Today's Movers Section (Groww Card Row style) */}
      <section className="market-movers-section">
        <div className="movers-section-header">
          <div className="movers-title-wrap">
            <h2>Today&apos;s Movers</h2>
            <p>Track top-performing stocks and market leaders.</p>
          </div>
          <div className="movers-toggle-pill">
            <button 
              className={`movers-toggle-btn ${activeTab === "gainers" ? "active" : ""}`}
              onClick={() => { setActiveTab("gainers"); setVisibleMoversCount(4); }}
            >
              Top Gainers
            </button>
            <button 
              className={`movers-toggle-btn ${activeTab === "losers" ? "active" : ""}`}
              onClick={() => { setActiveTab("losers"); setVisibleMoversCount(4); }}
            >
              Top Losers
            </button>
          </div>
        </div>

        <div className="movers-card-grid">
          {(activeTab === "gainers" ? gainers : losers).slice(0, visibleMoversCount).map((item, idx) => {
            const changeVal = item.change || 0;
            const changePctVal = item.change_pct || 0;
            const isUp = changeVal >= 0;
            
            const cleanSym = item.symbol ? item.symbol.replace(".NS", "").toUpperCase() : "";
            const displayName = COMPANY_NAME_MAP[cleanSym] || item.name || item.symbol;
            
            const absChange = Math.abs(changeVal).toFixed(2);
            const absChangePct = Math.abs(changePctVal).toFixed(2);
            const changeText = `${changeVal < 0 ? "-" : ""}${absChange} (${absChangePct}%)`;
            const isExtra = idx >= 4;

            return (
              <div 
                key={item.symbol} 
                className={`mover-groww-card ${isExtra ? "movers-extra-card-animate" : ""}`}
                onClick={() => setSelectedStockForModal(item.symbol)}
              >
                <div className="mover-card-logo-box">
                  <StockLogo symbol={item.symbol} className="mover-card-logo-img" />
                </div>
                
                <span className="mover-card-name">{displayName}</span>
                
                <span className="mover-card-price">
                  ₹{Number(item.last_price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                
                <span className={`mover-card-change ${isUp ? "up" : "down"}`}>
                  {changeText}
                </span>
              </div>
            );
          })}
          
          {(activeTab === "gainers" ? gainers : losers).length === 0 && (
            <div className="movers-empty-grid-state">No live movers data available at this time.</div>
          )}
        </div>

        {(activeTab === "gainers" ? gainers : losers).length > 4 && (
          <div className="movers-see-more-row">
            <button 
              className="movers-see-more-link" 
              onClick={() => setVisibleMoversCount(visibleMoversCount === 4 ? (activeTab === "gainers" ? gainers : losers).length : 4)}
            >
              {visibleMoversCount === 4 ? "Show more >" : "Show less <"}
            </button>
          </div>
        )}
      </section>

      {/* Corporate Events Section (Modern Split Layout Accordion) */}
      {/* Corporate Events Section (Groww Card Row style) */}
      {events && events.length > 0 && (
        <section className="market-movers-section" style={{ marginTop: "40px" }}>
          <div className="movers-section-header">
            <div className="movers-title-wrap">
              <h2>Corporate Events</h2>
              <p>Upcoming market catalysts: Board meetings, earnings releases, and dividends.</p>
            </div>
          </div>

          <div className="events-card-grid">
            {events.slice(0, visibleEventsCount).map((ev, idx) => {
              const cleanSym = ev.symbol ? ev.symbol.replace(".NS", "").toUpperCase() : "";
              const displayName = COMPANY_NAME_MAP[cleanSym] || ev.company || ev.symbol;
              const isExtra = idx >= 4;
              
              return (
                <div 
                  key={idx} 
                  className={`event-groww-card ${isExtra ? "events-extra-card-animate" : ""}`}
                  onClick={() => setSelectedStockForModal(ev.symbol)}
                >
                  <div className="event-card-logo-box">
                    <StockLogo symbol={ev.symbol} domain={ev.domain} className="event-logo-img" />
                  </div>
                  
                  <span className="event-card-name">{displayName}</span>
                  
                  <span className="event-card-date">{ev.date}</span>
                  
                  <span className="event-card-purpose" title={ev.purpose}>
                    {ev.purpose}
                  </span>
                </div>
              );
            })}
          </div>

          {events.length > 4 && (
            <div className="movers-see-more-row">
              <button 
                className="movers-see-more-link" 
                onClick={() => setVisibleEventsCount(visibleEventsCount === 4 ? events.length : 4)}
              >
                {visibleEventsCount === 4 ? "Show more >" : "Show less <"}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Main layout column (no split sidebar) */}
      <div className="market-main-layout-full">
        {/* Top Headlines */}
        <section className="feed-section">
          <div className="feed-section-header">
            <h2>
              <FaNewspaper style={{ marginRight: "10px", color: "var(--neon-cyan)", verticalAlign: "middle" }} />
              Top Headlines
            </h2>
            <span className="section-subtitle">Highest impact market signals and analysis</span>
          </div>
          <div className="headlines-grid-new">
            {topHeadlines.map((item, idx) => (
              <NewsCard key={item.id || idx} item={item} onViewStock={handleViewStock} />
            ))}
          </div>
        </section>

        {/* Market Sponsors (Horizontal below Top Headlines) */}
        <section className="feed-section sponsors-section-new">
          <div className="feed-section-header" style={{ marginBottom: "16px" }}>
            <h2>
              <FaInfoCircle style={{ marginRight: "10px", color: "var(--neon-teal)", verticalAlign: "middle" }} />
              Market Sponsors
            </h2>
            <span className="section-subtitle">Premium strategic and brokerage partners</span>
          </div>
          <div className="sponsors-grid-horizontal">
            <div className="ad-box-slot-new">
              <div>
                <span className="ad-badge-new">SPONSOR</span>
                <h4 style={{ marginTop: "8px", fontSize: "1.05rem", fontWeight: "750", color: "var(--text-primary)" }}>Premium Strategy Partner</h4>
                <p style={{ marginTop: "6px", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  Unlock real-time volatility indices and advanced screening algorithms.
                </p>
              </div>
              <button className="ad-action-btn-new">Learn More</button>
            </div>
            
            <div className="ad-box-slot-new">
              <div>
                <span className="ad-badge-new">SPONSOR</span>
                <h4 style={{ marginTop: "8px", fontSize: "1.05rem", fontWeight: "750", color: "var(--text-primary)" }}>Brokerage Partner</h4>
                <p style={{ marginTop: "6px", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  Execute trades directly from SentiNews charts with zero latency.
                </p>
              </div>
              <button className="ad-action-btn-new">Connect Account</button>
            </div>
          </div>
        </section>

        {/* All Trending News */}
        <section className="feed-section">
          <div className="feed-section-header">
            <h2>
              <FiActivity style={{ marginRight: "10px", color: "var(--neon-light-blue)", verticalAlign: "middle" }} />
              All Trending News
            </h2>
            <span className="section-subtitle">Sorted by relevance and recent sentiment score</span>
          </div>
          <div className="trending-grid-new">
            {rest.slice(0, visibleTrendingCount).map((item, idx) => (
              <NewsCard key={item.id || idx} item={item} onViewStock={handleViewStock} />
            ))}
          </div>
          {rest.length > visibleTrendingCount && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
              <button 
                className="read-more-btn"
                onClick={() => setVisibleTrendingCount(rest.length)}
              >
                Read More All Trending News
              </button>
            </div>
          )}
        </section>
      </div>

      {showComingSoon && (
        <div className="coming-soon-toast">
          <div className="toast-dot" />
          <div className="toast-body">
            <span className="toast-title">Screener Coming Soon</span>
            <span className="toast-desc">We are currently building this feature. Stay tuned!</span>
          </div>
          <button className="toast-close" onClick={() => setShowComingSoon(false)}>✕</button>
        </div>
      )}

      {selectedStockForModal && (
        <StockDetailModal
          symbol={selectedStockForModal}
          onClose={() => setSelectedStockForModal(null)}
        />
      )}
    </div>
  );
}
