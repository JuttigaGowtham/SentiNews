"use client";

import React, { useState, useEffect } from "react";
import { fetchPreMarketIntel } from "@/lib/api";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  Shield,
  Zap,
  DollarSign,
  Activity as LiquidityIcon,
  Percent,
  Briefcase,
  Compass,
  FileText,
  Calendar,
  Layers,
  LineChart,
  Eye,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  RefreshCw,
  Clock,
  TrendingUp as BullishIcon,
  TrendingDown as BearishIcon,
  Minus as NeutralIcon
} from "lucide-react";
import LoadingScreen from "@/components/layout/LoadingScreen";
import "./PreMarketIntel.css";

export default function PreMarketIntelPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [macroTab, setMacroTab] = useState("india");
  const [playbookTab, setPlaybookTab] = useState("bullish");
  const [earningsTab, setEarningsTab] = useState("before");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await fetchPreMarketIntel();
      setData(res);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch pre-market intelligence report.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 300000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingScreen message="Assembling Pre-Market Intelligence..." />;
  }

  if (error) {
    return (
      <div className="pmi-error-container">
        <Shield size={48} className="down" />
        <h2>Intelligence Report Unavailable</h2>
        <p>{error}</p>
        <button className="pmi-btn" onClick={() => loadData()}>Try Again</button>
      </div>
    );
  }

  if (!data) return null;

  const {
    generated_at,
    executive_brief,
    global_intelligence,
    indian_intelligence,
    risk_dashboard,
    gift_nifty,
    money_flow,
    market_liquidity,
    macroeconomic,
    commodity_intelligence,
    currency_intelligence,
    news_impact,
    earnings_intelligence,
    options_intelligence,
    sector_rotation,
    smart_money_watchlist,
    opening_playbook
  } = data;

  const renderImpactBadge = (impact) => {
    const imp = impact.toLowerCase();
    if (imp === "bullish" || imp === "positive" || imp.includes("up") || imp.includes("buy")) {
      return <span className="pmi-badge pmi-badge--bullish"><BullishIcon size={12} /> Bullish</span>;
    }
    if (imp === "bearish" || imp === "negative" || imp.includes("down") || imp.includes("sell")) {
      return <span className="pmi-badge pmi-badge--bearish"><BearishIcon size={12} /> Bearish</span>;
    }
    return <span className="pmi-badge pmi-badge--neutral"><NeutralIcon size={12} /> Neutral</span>;
  };

  return (
    <div className="pmi-page">
      {/* Top Header Section */}
      <div className="pmi-header">
        <div className="pmi-header-title">
          <div className="pmi-live-tag">
            <span className="pmi-live-dot"></span>
            PRE-MARKET REPORT
          </div>
          <h1>Pre-Market Intelligence</h1>
          <p>Institutional Grade Market Intelligence & Actionable Opening Playbook</p>
        </div>
        <div className="pmi-header-actions">
          {generated_at && (
            <div className="pmi-timestamp">
              <Clock size={14} />
              <span>
                Generated:{" "}
                {new Date(generated_at).toLocaleString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true
                })}
              </span>
            </div>
          )}
          <button 
            className={`pmi-refresh-btn ${isRefreshing ? "spin" : ""}`} 
            onClick={() => loadData(true)}
            title="Reload Intelligence Data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="pmi-grid">
        {/* SECTION 1: EXECUTIVE MARKET BRIEF */}
        <div className="pmi-card col-12 pmi-brief-card">
          <div className="pmi-card-header">
            <FileText size={18} className="pmi-sec-icon" />
            <h2>1. Executive Market Brief</h2>
          </div>
          <div className="pmi-brief-body">
            <div className="pmi-sentiment-gauge-wrapper">
              <div className="pmi-sentiment-gauge">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="gauge-bg" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    className="gauge-val" 
                    style={{ strokeDasharray: `${(executive_brief.sentiment_score * 2.82).toFixed(0)} 282` }}
                  />
                </svg>
                <div className="gauge-center">
                  <span className="gauge-num">{executive_brief.sentiment_score}</span>
                  <span className="gauge-lbl">/100</span>
                </div>
              </div>
              <div className="pmi-sentiment-label">
                <h3>{executive_brief.sentiment_label}</h3>
                <p>Composite Sentiment Score</p>
              </div>
            </div>
            
            <div className="pmi-brief-indicators">
              {Object.entries(executive_brief.components).map(([key, val]) => (
                <div key={key} className="pmi-indicator-row">
                  <span className="pmi-ind-lbl">{key}</span>
                  <div className="pmi-ind-progress-bar">
                    <div 
                      className="pmi-ind-progress-fill" 
                      style={{ width: `${val}%`, backgroundColor: val >= 65 ? "var(--neon-teal)" : val >= 45 ? "var(--neon-yellow)" : "var(--neon-pink)" }}
                    />
                  </div>
                  <span className="pmi-ind-val">{val}%</span>
                </div>
              ))}
            </div>

            <div className="pmi-brief-summary-box">
              <h4>AI Generated Briefing</h4>
              <p>{executive_brief.ai_summary}</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: INDIAN MARKET INTELLIGENCE */}
        <div className="pmi-card col-8">
          <div className="pmi-card-header">
            <TrendingUp size={18} className="pmi-sec-icon" />
            <h2>2. Indian Market Intelligence</h2>
          </div>
          <div className="pmi-table-container">
            <table className="pmi-table">
              <thead>
                <tr>
                  <th>Index Name</th>
                  <th className="num">Last Price</th>
                  <th className="num">Daily Change</th>
                  <th className="num">Weekly Change</th>
                  <th className="num">YTD Return</th>
                  <th className="num">Volatility</th>
                  <th>Gap Impact</th>
                </tr>
              </thead>
              <tbody>
                {indian_intelligence?.map((idx) => {
                  const dir = idx.change_pct >= 0 ? "up" : "down";
                  return (
                    <tr key={idx.name}>
                      <td className="bold">{idx.name}</td>
                      <td className="num font-mono">{idx.last_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className={`num font-mono bold ${dir}`}>
                        {idx.change_pct >= 0 ? "+" : ""}
                        {idx.change_pct.toFixed(2)}%
                      </td>
                      <td className={`num font-mono ${idx.weekly_change_pct >= 0 ? "up" : "down"}`}>
                        {idx.weekly_change_pct >= 0 ? "+" : ""}
                        {idx.weekly_change_pct.toFixed(2)}%
                      </td>
                      <td className="num font-mono">{idx.ytd_return_pct >= 0 ? "+" : ""}{idx.ytd_return_pct}%</td>
                      <td className="num font-mono">{idx.volatility_score}%</td>
                      <td>
                        <span className={`pmi-impact-tag pmi-impact-tag--${dir}`}>
                          {idx.gap_probability_impact}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: RISK-ON / RISK-OFF DASHBOARD */}
        <div className="pmi-card col-4">
          <div className="pmi-card-header">
            <Shield size={18} className="pmi-sec-icon" />
            <h2>3. Risk-On / Risk-Off Dashboard</h2>
          </div>
          <div className="pmi-risk-dashboard-body">
            <div className="pmi-risk-score-display">
              <div className="pmi-risk-badge">
                <span className="risk-score-title">Risk Index</span>
                <span className="risk-score-value">{risk_dashboard.risk_score}</span>
              </div>
              <div className="pmi-risk-interpretation">
                <span className="risk-interp-lbl">Investor Appetite</span>
                <span className={`risk-interp-val risk-interp-val--${risk_dashboard.interpretation.toLowerCase()}`}>
                  {risk_dashboard.interpretation}
                </span>
              </div>
            </div>

            <div className="pmi-risk-metrics-grid">
              {risk_dashboard.items.map((item) => {
                const isDown = item.change_pct < 0;
                return (
                  <div key={item.name} className="pmi-risk-mini-card">
                    <span className="pmi-rmc-name">{item.name}</span>
                    <div className="pmi-rmc-values">
                      <span className="pmi-rmc-val font-mono">{item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      <span className={`pmi-rmc-pct font-mono ${isDown ? "down" : "up"}`}>
                        {isDown ? "" : "+"}
                        {item.change_pct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 4: GLOBAL MARKET INTELLIGENCE */}
        <div className="pmi-card col-12">
          <div className="pmi-card-header">
            <Globe size={18} className="pmi-sec-icon" />
            <h2>4. Global Market Intelligence</h2>
          </div>
          <div className="pmi-table-container">
            <table className="pmi-table">
              <thead>
                <tr>
                  <th>Index Name</th>
                  <th className="num">Last Price</th>
                  <th className="num">Daily Change</th>
                  <th className="num">Weekly Change</th>
                  <th className="num">YTD Return</th>
                  <th className="num">Volatility</th>
                  <th>Gap Impact</th>
                </tr>
              </thead>
              <tbody>
                {global_intelligence.map((idx) => {
                  const dir = idx.change_pct >= 0 ? "up" : "down";
                  return (
                    <tr key={idx.name}>
                      <td className="bold">{idx.name}</td>
                      <td className="num font-mono">{idx.last_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className={`num font-mono bold ${dir}`}>
                        {idx.change_pct >= 0 ? "+" : ""}
                        {idx.change_pct.toFixed(2)}%
                      </td>
                      <td className={`num font-mono ${idx.weekly_change_pct >= 0 ? "up" : "down"}`}>
                        {idx.weekly_change_pct >= 0 ? "+" : ""}
                        {idx.weekly_change_pct.toFixed(2)}%
                      </td>
                      <td className="num font-mono">{idx.ytd_return_pct >= 0 ? "+" : ""}{idx.ytd_return_pct}%</td>
                      <td className="num font-mono">{idx.volatility_score}%</td>
                      <td>
                        <span className={`pmi-impact-tag pmi-impact-tag--${dir}`}>
                          {idx.gap_probability_impact}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 5: GIFT NIFTY PREDICTION ENGINE */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <Zap size={18} className="pmi-sec-icon" />
            <h2>5. GIFT Nifty Prediction Engine</h2>
          </div>
          <div className="pmi-gift-nifty-body">
            <div className="pmi-gift-stats-grid">
              <div className="pmi-gift-stat">
                <span className="lbl">GIFT Value</span>
                <span className="val font-mono">{gift_nifty.current_value.toLocaleString()}</span>
              </div>
              <div className="pmi-gift-stat">
                <span className="lbl">Gap Projection</span>
                <span className={`val font-mono ${gift_nifty.gap_pct >= 0 ? "up" : "down"}`}>
                  {gift_nifty.gap_pct >= 0 ? "▲" : "▼"} {gift_nifty.gap_pct >= 0 ? "+" : ""}
                  {gift_nifty.gap_pct}%
                </span>
              </div>
              <div className="pmi-gift-stat">
                <span className="lbl">Expected Open</span>
                <span className="val font-mono highlight">{gift_nifty.expected_open.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="pmi-gift-stat">
                <span className="lbl">Expected Range</span>
                <span className="val font-mono">{gift_nifty.expected_range}</span>
              </div>
            </div>

            <div className="pmi-gift-bar-wrapper">
              <div className="pmi-gift-bar-row">
                <span>Prediction Confidence</span>
                <span className="bold">{gift_nifty.confidence_pct}%</span>
              </div>
              <div className="pmi-gift-progress">
                <div className="pmi-gift-progress-fill" style={{ width: `${gift_nifty.confidence_pct}%` }} />
              </div>
              <p className="pmi-subtext">Historical open accuracy is {gift_nifty.historical_accuracy_pct}%.</p>
            </div>

            <div className="pmi-gift-forecast">
              <h5>AI Prediction Analysis</h5>
              <p>{gift_nifty.ai_forecast}</p>
            </div>
          </div>
        </div>

        {/* SECTION 6: MONEY FLOW DASHBOARD */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <DollarSign size={18} className="pmi-sec-icon" />
            <h2>6. Money Flow Dashboard</h2>
          </div>
          <div className="pmi-money-flow-body">
            <div className="pmi-money-grid">
              <div className="pmi-money-stat">
                <span className="lbl">FII Cash Net</span>
                <span className={`val font-mono ${money_flow.fii_cash >= 0 ? "up" : "down"}`}>
                  {money_flow.fii_cash >= 0 ? "+" : ""}
                  {money_flow.fii_cash.toLocaleString()} Cr
                </span>
              </div>
              <div className="pmi-money-stat">
                <span className="lbl">DII Cash Net</span>
                <span className={`val font-mono ${money_flow.dii_cash >= 0 ? "up" : "down"}`}>
                  {money_flow.dii_cash >= 0 ? "+" : ""}
                  {money_flow.dii_cash.toLocaleString()} Cr
                </span>
              </div>
              <div className="pmi-money-stat">
                <span className="lbl">FII Futures Flow</span>
                <span className={`val font-mono ${money_flow.fii_futures >= 0 ? "up" : "down"}`}>
                  {money_flow.fii_futures >= 0 ? "+" : ""}
                  {money_flow.fii_futures.toLocaleString()} Cr
                </span>
              </div>
              <div className="pmi-money-stat">
                <span className="lbl">FII Options Flow</span>
                <span className={`val font-mono ${money_flow.fii_options >= 0 ? "up" : "down"}`}>
                  {money_flow.fii_options >= 0 ? "+" : ""}
                  {money_flow.fii_options.toLocaleString()} Cr
                </span>
              </div>
            </div>

            <div className="pmi-net-flow-bar">
              <div className="pmi-net-flow-info">
                <span>FII Derivatives Flow: <strong className={money_flow.index_futures >= 0 ? "up" : "down"}>{money_flow.index_futures} Cr (Index)</strong></span>
                <span>Stock Futures: <strong className={money_flow.stock_futures >= 0 ? "up" : "down"}>{money_flow.stock_futures} Cr</strong></span>
              </div>
              <div className="pmi-net-flow-main">
                <span>Composite Net Flow</span>
                <span className={`font-mono bold ${money_flow.net_flow >= 0 ? "up" : "down"}`}>
                  {money_flow.net_flow >= 0 ? "+" : ""}
                  {money_flow.net_flow.toLocaleString()} Cr
                </span>
              </div>
            </div>

            <div className="pmi-flow-trends">
              <div className="pmi-flow-trend-badge">
                <span>30-Day Trend</span>
                <strong className="high-p">{money_flow.trend_30d}</strong>
              </div>
              <div className="pmi-flow-trend-badge">
                <span>90-Day Trend</span>
                <strong className="high-p">{money_flow.trend_90d}</strong>
              </div>
            </div>

            <div className="pmi-money-conclusion">
              <h5>Flow Intelligence Interpretation</h5>
              <p>{money_flow.ai_conclusion}</p>
            </div>
          </div>
        </div>

        {/* SECTION 7: MARKET LIQUIDITY ANALYSIS */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <LiquidityIcon size={18} className="pmi-sec-icon" />
            <h2>7. Market Liquidity Analysis</h2>
          </div>
          <div className="pmi-liquidity-body">
            <div className="pmi-liq-score-section">
              <div className="pmi-liq-score-main">
                <span className="score-val">{market_liquidity.liquidity_strength_score}</span>
                <span className="score-lbl">Liquidity Strength Score</span>
              </div>
              <div className="pmi-liq-score-bars">
                <div className="pmi-ind-row">
                  <span className="pmi-ind-lbl">Retail Participation</span>
                  <div className="pmi-ind-progress-bar">
                    <div className="pmi-ind-progress-fill" style={{ width: `${market_liquidity.retail_participation_score}%`, backgroundColor: "var(--neon-cyan)" }} />
                  </div>
                  <span>{market_liquidity.retail_participation_score}%</span>
                </div>
                <div className="pmi-ind-row">
                  <span className="pmi-ind-lbl">Institutional Activity</span>
                  <div className="pmi-ind-progress-bar">
                    <div className="pmi-ind-progress-fill" style={{ width: `${market_liquidity.institutional_participation_score}%`, backgroundColor: "var(--neon-teal)" }} />
                  </div>
                  <span>{market_liquidity.institutional_participation_score}%</span>
                </div>
              </div>
            </div>

            <div className="pmi-liq-details">
              <div className="pmi-liq-row">
                <span>Advance/Decline Trend</span>
                <strong>{market_liquidity.advance_decline_trend}</strong>
              </div>
              <div className="pmi-liq-row">
                <span>Market Breadth</span>
                <strong>{market_liquidity.market_breadth}</strong>
              </div>
              <div className="pmi-liq-row">
                <span>Average Delivery %</span>
                <strong className="font-mono">{market_liquidity.average_delivery_pct}</strong>
              </div>
              <div className="pmi-liq-row">
                <span>Margin Funding Trend</span>
                <strong>{market_liquidity.margin_funding_trend}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 8: MACROECONOMIC DASHBOARD */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <Percent size={18} className="pmi-sec-icon" />
            <h2>8. Macroeconomic Dashboard</h2>
            <div className="pmi-card-tabs">
              <button 
                className={`pmi-tab-btn ${macroTab === "india" ? "active" : ""}`}
                onClick={() => setMacroTab("india")}
              >
                India Macros
              </button>
              <button 
                className={`pmi-tab-btn ${macroTab === "us" ? "active" : ""}`}
                onClick={() => setMacroTab("us")}
              >
                United States Macros
              </button>
            </div>
          </div>
          <div className="pmi-macro-body">
            <div className="pmi-macro-grid">
              {Object.entries(macroeconomic[macroTab]).map(([key, val]) => (
                <div key={key} className="pmi-macro-item">
                  <span className="pmi-macro-name">{key}</span>
                  <span className="pmi-macro-val font-mono">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 9: COMMODITY INTELLIGENCE */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <Briefcase size={18} className="pmi-sec-icon" />
            <h2>9. Commodity Intelligence</h2>
          </div>
          <div className="pmi-table-container">
            <table className="pmi-table">
              <thead>
                <tr>
                  <th>Commodity</th>
                  <th className="num">Price</th>
                  <th className="num">Daily Chg</th>
                  <th className="num">Weekly</th>
                  <th className="num">Monthly</th>
                  <th>Sector Impact Summary</th>
                </tr>
              </thead>
              <tbody>
                {commodity_intelligence.map((com) => {
                  const dir = com.change_pct >= 0 ? "up" : "down";
                  return (
                    <tr key={com.name}>
                      <td className="bold">{com.name}</td>
                      <td className="num font-mono">{com.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className={`num font-mono bold ${dir}`}>
                        {com.change_pct >= 0 ? "+" : ""}
                        {com.change_pct.toFixed(2)}%
                      </td>
                      <td className={`num font-mono ${com.weekly_change >= 0 ? "up" : "down"}`}>
                        {com.weekly_change >= 0 ? "+" : ""}
                        {com.weekly_change.toFixed(2)}%
                      </td>
                      <td className={`num font-mono ${com.monthly_change >= 0 ? "up" : "down"}`}>
                        {com.monthly_change >= 0 ? "+" : ""}
                        {com.monthly_change.toFixed(2)}%
                      </td>
                      <td className="pmi-table-text">{com.sector_impact}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 10: CURRENCY INTELLIGENCE */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <Compass size={18} className="pmi-sec-icon" />
            <h2>10. Currency Intelligence</h2>
          </div>
          <div className="pmi-currency-body">
            <div className="pmi-currency-table-wrapper">
              <table className="pmi-table">
                <thead>
                  <tr>
                    <th>Currency Pair</th>
                    <th className="num">LTP</th>
                    <th className="num">Daily Chg</th>
                    <th className="num">Weekly Chg</th>
                  </tr>
                </thead>
                <tbody>
                  {currency_intelligence.currencies.map((curr) => {
                    const dir = curr.change_pct >= 0 ? "up" : "down";
                    return (
                      <tr key={curr.name}>
                        <td className="bold">{curr.name}</td>
                        <td className="num font-mono">{curr.price.toLocaleString(undefined, { minimumFractionDigits: 4 })}</td>
                        <td className={`num font-mono bold ${dir}`}>
                          {curr.change_pct >= 0 ? "+" : ""}
                          {curr.change_pct.toFixed(2)}%
                        </td>
                        <td className={`num font-mono ${curr.weekly_change >= 0 ? "up" : "down"}`}>
                          {curr.weekly_change >= 0 ? "+" : ""}
                          {curr.weekly_change.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pmi-currency-impact-list">
              <h4>Forecast Sector Impact</h4>
              <div className="pmi-impact-items-scroll">
                {currency_intelligence.forecast_impact.map((impactItem) => {
                  const outlook = impactItem.outlook.toLowerCase();
                  return (
                    <div key={impactItem.sector} className="pmi-currency-impact-item">
                      <div className="pmi-cii-header">
                        <span className="pmi-cii-sector">{impactItem.sector}</span>
                        <span className={`pmi-cii-outlook pmi-cii-outlook--${outlook}`}>{impactItem.outlook}</span>
                      </div>
                      <p className="pmi-cii-reason">{impactItem.reason}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 11: NEWS IMPACT ENGINE */}
        <div className="pmi-card col-12">
          <div className="pmi-card-header">
            <FileText size={18} className="pmi-sec-icon" />
            <h2>11. News Impact Engine</h2>
          </div>
          <div className="pmi-table-container">
            <table className="pmi-table">
              <thead>
                <tr>
                  <th>Headline News</th>
                  <th>Category</th>
                  <th>Affected Asset</th>
                  <th>Sectors Impacted</th>
                  <th>Expected Impact</th>
                  <th className="num">Impact Score</th>
                  <th>Outlook Term</th>
                  <th className="num">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {news_impact.map((news, i) => (
                  <tr key={i}>
                    <td className="pmi-news-headline">{news.headline}</td>
                    <td>
                      <span className="pmi-category-badge">{news.category}</span>
                    </td>
                    <td className="bold">{news.affected_company}</td>
                    <td>{news.affected_sectors}</td>
                    <td>{renderImpactBadge(news.expected_impact)}</td>
                    <td className="num font-mono bold">{news.impact_score}/10</td>
                    <td>{news.duration}</td>
                    <td className="num font-mono">{news.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 12: EARNINGS INTELLIGENCE */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <Calendar size={18} className="pmi-sec-icon" />
            <h2>12. Earnings Intelligence</h2>
            <div className="pmi-card-tabs">
              <button 
                className={`pmi-tab-btn ${earningsTab === "before" ? "active" : ""}`}
                onClick={() => setEarningsTab("before")}
              >
                Before Market Open
              </button>
              <button 
                className={`pmi-tab-btn ${earningsTab === "after" ? "active" : ""}`}
                onClick={() => setEarningsTab("after")}
              >
                After Market Close
              </button>
            </div>
          </div>
          <div className="pmi-table-container">
            <table className="pmi-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Revenue Est.</th>
                  <th>Profit Est.</th>
                  <th>Surprise Est.</th>
                  <th>Historical Beat Rate</th>
                  <th>Analyst Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {earnings_intelligence[`${earningsTab}_market`]?.map((earn) => (
                  <tr key={earn.company}>
                    <td className="bold">{earn.company}</td>
                    <td className="font-mono">{earn.revenue_estimate}</td>
                    <td className="font-mono">{earn.profit_estimate}</td>
                    <td className={`font-mono bold ${earn.expected_surprise.includes("-") ? "down" : "up"}`}>
                      {earn.expected_surprise}
                    </td>
                    <td className="font-mono">{earn.historical_beat_rate}</td>
                    <td>{renderImpactBadge(earn.analyst_sentiment)}</td>
                  </tr>
                ))}
                {(!earnings_intelligence[`${earningsTab}_market`] || earnings_intelligence[`${earningsTab}_market`].length === 0) && (
                  <tr>
                    <td colSpan="6" className="center pmi-subtext">No major earnings scheduled.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 13: OPTIONS INTELLIGENCE */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <Layers size={18} className="pmi-sec-icon" />
            <h2>13. Options Intelligence</h2>
          </div>
          <div className="pmi-options-body">
            <div className="pmi-options-header-row">
              <div className="pmi-opt-stat-card">
                <span>Nifty PCR</span>
                <strong className="font-mono">{options_intelligence.pcr}</strong>
              </div>
              <div className="pmi-opt-stat-card">
                <span>Max Pain Strike</span>
                <strong className="font-mono">{options_intelligence.max_pain.toLocaleString()}</strong>
              </div>
              <div className="pmi-opt-stat-card">
                <span>Expected Range</span>
                <strong className="font-mono highlight">{options_intelligence.expected_range}</strong>
              </div>
            </div>

            <div className="pmi-options-details-list">
              <div className="pmi-opt-detail-row">
                <span>OI Build-up Cues</span>
                <strong>{options_intelligence.oi_buildup}</strong>
              </div>
              <div className="pmi-opt-detail-row">
                <span>Resistance Zone (Call Wall)</span>
                <strong>{options_intelligence.call_concentration}</strong>
              </div>
              <div className="pmi-opt-detail-row">
                <span>Support Zone (Put Wall)</span>
                <strong>{options_intelligence.put_concentration}</strong>
              </div>
              <div className="pmi-opt-detail-row">
                <span>Dealer positioning</span>
                <p>{options_intelligence.dealer_positioning}</p>
              </div>
              <div className="pmi-opt-detail-row">
                <span>Gamma Zones</span>
                <strong>{options_intelligence.gamma_zones}</strong>
              </div>
              <div className="pmi-opt-detail-row">
                <span>Volatility Outlook</span>
                <p>{options_intelligence.volatility_forecast}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 14: SECTOR ROTATION MODEL */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <LineChart size={18} className="pmi-sec-icon" />
            <h2>14. Sector Rotation Model</h2>
          </div>
          <div className="pmi-table-container">
            <table className="pmi-table">
              <thead>
                <tr>
                  <th>Sector</th>
                  <th>Relative Strength</th>
                  <th className="num">Volume Growth</th>
                  <th className="num">Momentum</th>
                  <th className="num">Fund Flow</th>
                  <th>Expected leadership</th>
                </tr>
              </thead>
              <tbody>
                {sector_rotation.map((sec) => {
                  const strength = sec.strength.toLowerCase();
                  const leadership = sec.expected_leadership.toLowerCase();
                  return (
                    <tr key={sec.sector}>
                      <td className="bold">{sec.sector}</td>
                      <td>
                        <span className={`pmi-rot-strength pmi-rot-strength--${strength}`}>{sec.strength}</span>
                      </td>
                      <td className="num font-mono">{sec.volume_growth >= 0 ? "+" : ""}{sec.volume_growth}%</td>
                      <td className={`num font-mono bold ${sec.momentum >= 0 ? "up" : "down"}`}>
                        {sec.momentum >= 0 ? "+" : ""}
                        {sec.momentum.toFixed(2)}%
                      </td>
                      <td className={`num font-mono bold ${sec.fund_flow.includes("-") ? "down" : "up"}`}>{sec.fund_flow}</td>
                      <td>
                        <span className={`pmi-leadership pmi-leadership--${leadership}`}>{sec.expected_leadership}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 15: SMART MONEY WATCHLIST */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <Eye size={18} className="pmi-sec-icon" />
            <h2>15. Smart Money Watchlist</h2>
          </div>
          <div className="pmi-table-container">
            <table className="pmi-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th className="num">Delivery %</th>
                  <th className="num">Vol Spike</th>
                  <th className="num">OI Spike</th>
                  <th>Block Deals Info</th>
                  <th>Fund Activity</th>
                  <th>Analyst Upgrade Action</th>
                </tr>
              </thead>
              <tbody>
                {smart_money_watchlist.map((watch) => (
                  <tr key={watch.symbol}>
                    <td className="bold highlight">{watch.symbol}</td>
                    <td className="num font-mono">{watch.delivery_pct}</td>
                    <td className="num font-mono bold up">{watch.volume_spike}</td>
                    <td className="num font-mono">{watch.oi_spike}</td>
                    <td className="pmi-table-text">{watch.block_deals}</td>
                    <td className="bold">{watch.fund_activity}</td>
                    <td className="pmi-table-text">{watch.analyst_upgrades}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 16: OPENING PLAYBOOK */}
        <div className="pmi-card col-12 pmi-playbook-card">
          <div className="pmi-card-header">
            <BookOpen size={18} className="pmi-sec-icon" />
            <h2>16. Opening Playbook</h2>
            <div className="pmi-card-tabs">
              <button 
                className={`pmi-tab-btn pmi-tab-btn--bullish ${playbookTab === "bullish" ? "active" : ""}`}
                onClick={() => setPlaybookTab("bullish")}
              >
                <BullishIcon size={12} /> Bullish Scenario
              </button>
              <button 
                className={`pmi-tab-btn pmi-tab-btn--neutral ${playbookTab === "neutral" ? "active" : ""}`}
                onClick={() => setPlaybookTab("neutral")}
              >
                <NeutralIcon size={12} /> Neutral Scenario
              </button>
              <button 
                className={`pmi-tab-btn pmi-tab-btn--bearish ${playbookTab === "bearish" ? "active" : ""}`}
                onClick={() => setPlaybookTab("bearish")}
              >
                <BearishIcon size={12} /> Bearish Scenario
              </button>
            </div>
          </div>
          
          <div className="pmi-playbook-body">
            <div className="pmi-playbook-scenario-detail">
              <h3>Expected Scenario Trading Strategy</h3>
              <p className="scenario-desc">
                {playbookTab === "bullish" && opening_playbook.bullish_scenario}
                {playbookTab === "neutral" && opening_playbook.neutral_scenario}
                {playbookTab === "bearish" && opening_playbook.bearish_scenario}
              </p>
            </div>

            <div className="pmi-playbook-grid">
              <div className="pmi-levels-box">
                <h4>Key Operational Levels</h4>
                <div className="levels-grid">
                  {Object.entries(opening_playbook.key_levels).map(([key, val]) => (
                    <div key={key} className="level-item">
                      <span>{key}</span>
                      <strong className="font-mono">{val}</strong>
                    </div>
                  ))}
                </div>
                <div className="invalidation-alert">
                  <Info size={14} />
                  <span><strong>Invalidation:</strong> {opening_playbook.invalidation_levels}</span>
                </div>
              </div>

              <div className="pmi-trades-box">
                <h4>High Probability Trade Setups</h4>
                <div className="trades-list">
                  {opening_playbook.high_probability_trades.map((trade, i) => (
                    <div key={i} className="trade-setup-item">
                      <div className="trade-title">{trade.trade}</div>
                      <div className="trade-metrics">
                        <span>Entry: <strong className="font-mono">{trade.entry}</strong></span>
                        <span>Stop Loss: <strong className="font-mono down">{trade.stop_loss}</strong></span>
                        <span>Target: <strong className="font-mono up">{trade.target}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Events Sidebar (or bottom panel) */}
        {data.events && data.events.length > 0 && (
          <div className="pmi-card col-12">
            <div className="pmi-card-header">
              <Calendar size={18} className="pmi-sec-icon" />
              <h2>Key Scheduled Corporate Events</h2>
            </div>
            <div className="pmi-table-container">
              <table className="pmi-table">
                <thead>
                  <tr>
                    <th>Company Symbol</th>
                    <th>Purpose / Event Details</th>
                    <th>Date Scheduled</th>
                  </tr>
                </thead>
                <tbody>
                  {data.events.map((evt, i) => (
                    <tr key={i}>
                      <td className="bold highlight">{evt.company}</td>
                      <td>{evt.purpose}</td>
                      <td className="font-mono">{evt.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="pmi-disclaimer col-12">
          <strong>Institutional Disclaimer:</strong> The pre-market report data, AI outlook values, option models, and playbook scenarios are provided solely for information, educational, and simulation purposes. Sentinews does not distribute stock recommendations, financial tips, buy/sell alerts, or legal investment advice. Market operations involve extreme capital risks. Consult a registered financial advisor before placing actual market trades.
        </div>
      </div>
    </div>
  );
}
