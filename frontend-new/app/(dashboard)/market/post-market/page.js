"use client";

import React, { useState, useEffect } from "react";
import { fetchPostMarketIntel } from "@/lib/api";
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
  Minus as NeutralIcon,
  Lock,
  Sparkles,
  PieChart as PieChartIcon
} from "lucide-react";
import LoadingScreen from "@/components/layout/LoadingScreen";
import "./PostMarketIntel.css";

const FUTURE_PREMIUM_FEATURES = [
  { title: "SentiNews Intelligence Score", desc: "Proprietary real-time institutional sentiment tracking index." },
  { title: "Institutional Money Tracker", desc: "Granular live mapping of FII/DII block order placement & execution." },
  { title: "Smart Money Heatmap", desc: "Visual sector-by-sector institutional asset accumulation dashboard." },
  { title: "AI Earnings Predictor", desc: "Machine learning models forecasting EPS surprises before declarations." },
  { title: "AI Market Forecast Engine", desc: "Next-day directional predictive models backed by historical backtests." },
  { title: "AI Sector Rotation Engine", desc: "Predictive capital migration mapping across major NSE indices." },
  { title: "AI News Impact Engine", desc: "Immediate stock-specific volatility mapping on flash media wires." },
  { title: "Portfolio Impact Analyzer", desc: "Assess how global cues and overnight news affect your exact holdings." },
  { title: "Personalized Investor Reports", desc: "Custom daily briefs tailoring macro cues to your stock watchlist." },
  { title: "Portfolio Risk Score", desc: "Stress test portfolios against black-swan macro & geopolitical triggers." },
  { title: "Real-Time Market Copilot", desc: "Interactive AI assistant answering instant queries on corporate actions." },
  { title: "Voice-Based Market Briefing", desc: "Listen to instant audio briefs of your daily pre & post market updates." },
  { title: "Daily 3-Min AI Market Podcast", desc: "Curated daily markets recap packaged into a high-production audio podcast." },
  { title: "Interactive Market Simulator", desc: "Simulate playbook trade strategies using live-running paper trading." }
];

export default function PostMarketIntelPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [techTab, setTechTab] = useState("nifty");
  const [moversTab, setMoversTab] = useState("gainers");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await fetchPostMarketIntel();
      setData(res);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch post-market intelligence report.");
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
    return <LoadingScreen message="Assembling Post-Market Intelligence..." />;
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
    market_wrap,
    market_story,
    capital_flow_analysis,
    breadth_analysis,
    sector_performance_analysis,
    factor_analysis,
    top_movers,
    options_market_review,
    earnings_reaction_analysis,
    corporate_actions_review,
    smart_money_tracker,
    technical_market_map,
    ai_forecast_engine,
    risk_monitor,
    next_day_action_plan
  } = data;

  const renderImpactBadge = (impact) => {
    const imp = impact.toLowerCase();
    if (imp === "bullish" || imp === "positive" || imp.includes("up") || imp.includes("buy") || imp.includes("beat")) {
      return <span className="pmi-badge pmi-badge--bullish"><BullishIcon size={12} /> Bullish</span>;
    }
    if (imp === "bearish" || imp === "negative" || imp.includes("down") || imp.includes("sell") || imp.includes("miss")) {
      return <span className="pmi-badge pmi-badge--bearish"><BearishIcon size={12} /> Bearish</span>;
    }
    return <span className="pmi-badge pmi-badge--neutral"><NeutralIcon size={12} /> Neutral</span>;
  };

  return (
    <div className="pmi-page">
      {/* Top Header Section */}
      <div className="pmi-header">
        <div className="pmi-header-title">
          <div className="pmi-live-tag pmi-live-tag--post">
            <span className="pmi-live-dot pmi-live-dot--post"></span>
            POST-MARKET REPORT
          </div>
          <h1>Post-Market Intelligence</h1>
          <p>Analytical Market Wrap, Capital Migration Factors & Tomorrow's Forecast</p>
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
        {/* SECTION 1: MARKET WRAP */}
        <div className="pmi-card col-12">
          <div className="pmi-card-header">
            <FileText size={18} className="pmi-sec-icon" />
            <h2>1. Market Wrap</h2>
          </div>
          <div className="pmi-table-container">
            <table className="pmi-table">
              <thead>
                <tr>
                  <th>Index Name</th>
                  <th className="num">Open</th>
                  <th className="num">High</th>
                  <th className="num">Low</th>
                  <th className="num">Close</th>
                  <th className="num">Change</th>
                  <th className="num">Volume</th>
                  <th className="num">Value Traded</th>
                  <th className="num">Volatility</th>
                </tr>
              </thead>
              <tbody>
                {market_wrap.map((idx) => {
                  const dir = idx.change_pct >= 0 ? "up" : "down";
                  return (
                    <tr key={idx.name}>
                      <td className="bold">{idx.name}</td>
                      <td className="num font-mono">{idx.open.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="num font-mono">{idx.high.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="num font-mono">{idx.low.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="num font-mono bold">{idx.close.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className={`num font-mono bold ${dir}`}>
                        {idx.change_pct >= 0 ? "+" : ""}
                        {idx.change_pct.toFixed(2)}%
                      </td>
                      <td className="num font-mono">{idx.volume}</td>
                      <td className="num font-mono">{idx.value_traded}</td>
                      <td className="num font-mono">{idx.volatility}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: MARKET STORY */}
        <div className="pmi-card col-12 pmi-brief-card">
          <div className="pmi-card-header">
            <Sparkles size={18} className="pmi-sec-icon" />
            <h2>2. Market Story</h2>
            <span className={`pmi-badge pmi-badge--${market_story.direction}`}>
              {market_story.direction.toUpperCase()} SESSION
            </span>
          </div>
          <div className="pmi-story-body">
            <div className="pmi-story-grid">
              <div className="pmi-story-item">
                <h4>What Happened</h4>
                <p>{market_story.what_happened}</p>
              </div>
              <div className="pmi-story-item">
                <h4>Why It Happened</h4>
                <p>{market_story.why_it_happened}</p>
              </div>
              <div className="pmi-story-item">
                <h4>Who Drove It</h4>
                <p>{market_story.who_drove_it}</p>
              </div>
              <div className="pmi-story-item">
                <h4>What Changed</h4>
                <p>{market_story.what_changed}</p>
              </div>
            </div>
            <div className="pmi-story-tomorrow-box">
              <h4>Tomorrow's Implications</h4>
              <p>{market_story.tomorrow_implications}</p>
            </div>
          </div>
        </div>

        {/* SECTION 3: CAPITAL FLOW ANALYSIS */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <DollarSign size={18} className="pmi-sec-icon" />
            <h2>3. Capital Flow Analysis</h2>
          </div>
          <div className="pmi-money-flow-body">
            <div className="pmi-money-grid">
              <div className="pmi-money-stat">
                <span className="lbl">FII Cash Net Flow</span>
                <span className={`val font-mono ${capital_flow_analysis.fii_cash_net >= 0 ? "up" : "down"}`}>
                  {capital_flow_analysis.fii_cash_net >= 0 ? "+" : ""}
                  {capital_flow_analysis.fii_cash_net.toLocaleString()} Cr
                </span>
              </div>
              <div className="pmi-money-stat">
                <span className="lbl">DII Cash Net Flow</span>
                <span className={`val font-mono ${capital_flow_analysis.dii_cash_net >= 0 ? "up" : "down"}`}>
                  {capital_flow_analysis.dii_cash_net >= 0 ? "+" : ""}
                  {capital_flow_analysis.dii_cash_net.toLocaleString()} Cr
                </span>
              </div>
              <div className="pmi-money-stat">
                <span className="lbl">Mutual Funds Activity</span>
                <span className={`val font-mono ${capital_flow_analysis.mutual_funds >= 0 ? "up" : "down"}`}>
                  {capital_flow_analysis.mutual_funds >= 0 ? "+" : ""}
                  {capital_flow_analysis.mutual_funds.toLocaleString()} Cr
                </span>
              </div>
              <div className="pmi-money-stat">
                <span className="lbl">Insurance Funds Flow</span>
                <span className={`val font-mono ${capital_flow_analysis.insurance_funds >= 0 ? "up" : "down"}`}>
                  {capital_flow_analysis.insurance_funds >= 0 ? "+" : ""}
                  {capital_flow_analysis.insurance_funds.toLocaleString()} Cr
                </span>
              </div>
            </div>

            <div className="pmi-liq-score-section">
              <div className="pmi-liq-score-main">
                <span className="score-val">{capital_flow_analysis.net_liquidity_score}</span>
                <span className="score-lbl">Net Liquidity Score</span>
              </div>
              <div className="pmi-liq-score-bars">
                <div className="pmi-ind-row">
                  <span className="pmi-ind-lbl">Institutional Activity</span>
                  <span className="bold text-secondary">{capital_flow_analysis.institutional_activity}</span>
                </div>
                <div className="pmi-ind-row">
                  <span className="pmi-ind-lbl">Retail Activity</span>
                  <span className="bold text-secondary">{capital_flow_analysis.retail_activity}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: BREADTH ANALYSIS */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <PieChartIcon size={18} className="pmi-sec-icon" />
            <h2>4. Breadth Analysis</h2>
          </div>
          <div className="pmi-gift-nifty-body">
            <div className="pmi-gift-stats-grid">
              <div className="pmi-gift-stat">
                <span className="lbl">Advances</span>
                <span className="val font-mono up">{breadth_analysis.advances}</span>
              </div>
              <div className="pmi-gift-stat">
                <span className="lbl">Declines</span>
                <span className="val font-mono down">{breadth_analysis.declines}</span>
              </div>
              <div className="pmi-gift-stat">
                <span className="lbl">52W Highs</span>
                <span className="val font-mono highlight">{breadth_analysis.fifty_two_week_highs}</span>
              </div>
              <div className="pmi-gift-stat">
                <span className="lbl">52W Lows</span>
                <span className="val font-mono down">{breadth_analysis.fifty_two_week_lows}</span>
              </div>
            </div>

            <div className="pmi-gift-bar-wrapper">
              <div className="pmi-gift-bar-row">
                <span>Advances / Declines Ratio</span>
                <span className="bold">{(breadth_analysis.advances / breadth_analysis.declines).toFixed(2)}</span>
              </div>
              <div className="pmi-gift-progress">
                <div 
                  className="pmi-gift-progress-fill" 
                  style={{ 
                    width: `${(breadth_analysis.advances / (breadth_analysis.advances + breadth_analysis.declines) * 100).toFixed(0)}%`,
                    backgroundColor: "var(--neon-cyan)" 
                  }} 
                />
              </div>
              <div className="pmi-gift-bar-row" style={{ marginTop: 12 }}>
                <span>Market Participation Score</span>
                <span className="bold">{breadth_analysis.participation_score}%</span>
              </div>
              <p className="pmi-subtext">Calculated based on volume-weighted advances across mid & small cap categories.</p>
            </div>
          </div>
        </div>

        {/* SECTION 5: SECTOR PERFORMANCE ANALYSIS */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <LineChart size={18} className="pmi-sec-icon" />
            <h2>5. Sector Performance</h2>
          </div>
          <div className="pmi-table-container">
            <table className="pmi-table">
              <thead>
                <tr>
                  <th>Sector</th>
                  <th className="num">Return %</th>
                  <th className="num">Volume</th>
                  <th>Relative Strength</th>
                  <th className="num">Fund Flow</th>
                  <th>Leadership</th>
                </tr>
              </thead>
              <tbody>
                {sector_performance_analysis.map((sec) => {
                  const strength = sec.relative_strength.toLowerCase();
                  const leadership = sec.leadership.toLowerCase();
                  return (
                    <tr key={sec.sector}>
                      <td className="bold">{sec.sector}</td>
                      <td className={`num font-mono bold ${sec.return_pct >= 0 ? "up" : "down"}`}>
                        {sec.return_pct >= 0 ? "+" : ""}
                        {sec.return_pct.toFixed(2)}%
                      </td>
                      <td className="num font-mono">{sec.volume}</td>
                      <td>
                        <span className={`pmi-rot-strength pmi-rot-strength--${strength}`}>{sec.relative_strength}</span>
                      </td>
                      <td className={`num font-mono bold ${sec.fund_flow.includes("-") ? "down" : "up"}`}>{sec.fund_flow}</td>
                      <td>
                        <span className={`pmi-leadership pmi-leadership--${leadership}`}>{sec.leadership}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 6: FACTOR ANALYSIS */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <Layers size={18} className="pmi-sec-icon" />
            <h2>6. Factor Analysis (Capital Migration)</h2>
          </div>
          <div className="pmi-table-container">
            <table className="pmi-table">
              <thead>
                <tr>
                  <th>Factor Styles</th>
                  <th className="num">Return %</th>
                  <th>Money Migration Sentiment</th>
                  <th>Flow Migration Detail</th>
                </tr>
              </thead>
              <tbody>
                {factor_analysis.map((style) => (
                  <tr key={style.factor}>
                    <td className="bold">{style.factor}</td>
                    <td className={`num font-mono bold ${style.return_pct >= 0 ? "up" : "down"}`}>
                      {style.return_pct >= 0 ? "+" : ""}
                      {style.return_pct.toFixed(2)}%
                    </td>
                    <td className="bold">{style.sentiment}</td>
                    <td className="pmi-table-text">{style.migration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 7: TOP MOVERS ENGINE */}
        <div className="pmi-card col-12">
          <div className="pmi-card-header">
            <Compass size={18} className="pmi-sec-icon" />
            <h2>7. Top Movers Engine</h2>
            <div className="pmi-card-tabs">
              <button 
                className={`pmi-tab-btn ${moversTab === "gainers" ? "active" : ""}`}
                onClick={() => setMoversTab("gainers")}
              >
                Top Gainers & Losers
              </button>
              <button 
                className={`pmi-tab-btn ${moversTab === "shockers" ? "active" : ""}`}
                onClick={() => setMoversTab("shockers")}
              >
                Volume & Delivery Shockers
              </button>
              <button 
                className={`pmi-tab-btn ${moversTab === "oi" ? "active" : ""}`}
                onClick={() => setMoversTab("oi")}
              >
                OI Shockers
              </button>
            </div>
          </div>
          
          <div className="pmi-table-container">
            {moversTab === "gainers" && (
              <div className="pmi-movers-split">
                <div className="pmi-movers-col">
                  <h4>Top Session Gainers</h4>
                  <table className="pmi-table">
                    <thead>
                      <tr><th>Symbol</th><th className="num">Close Price</th><th className="num">Change %</th></tr>
                    </thead>
                    <tbody>
                      {top_movers.gainers.map((g) => (
                        <tr key={g.symbol}>
                          <td className="bold highlight">{g.symbol}</td>
                          <td className="num font-mono">₹{g.price.toLocaleString()}</td>
                          <td className="num font-mono bold up">+{g.change_pct.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pmi-movers-col">
                  <h4>Top Session Losers</h4>
                  <table className="pmi-table">
                    <thead>
                      <tr><th>Symbol</th><th className="num">Close Price</th><th className="num">Change %</th></tr>
                    </thead>
                    <tbody>
                      {top_movers.losers.map((l) => (
                        <tr key={l.symbol}>
                          <td className="bold down">{l.symbol}</td>
                          <td className="num font-mono">₹{l.price.toLocaleString()}</td>
                          <td className="num font-mono bold down">{l.change_pct.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {moversTab === "shockers" && (
              <div className="pmi-movers-split">
                <div className="pmi-movers-col">
                  <h4>Volume Shockers</h4>
                  <table className="pmi-table">
                    <thead>
                      <tr><th>Symbol</th><th className="num">Spike Ratio</th><th>Primary Driver</th></tr>
                    </thead>
                    <tbody>
                      {top_movers.volume_shockers.map((v) => (
                        <tr key={v.symbol}>
                          <td className="bold highlight">{v.symbol}</td>
                          <td className="num font-mono bold up">{v.volume_spike}</td>
                          <td className="pmi-table-text">{v.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pmi-movers-col">
                  <h4>Delivery Shockers</h4>
                  <table className="pmi-table">
                    <thead>
                      <tr><th>Symbol</th><th className="num">Delivery %</th><th className="num">Avg Del.</th><th>Implication</th></tr>
                    </thead>
                    <tbody>
                      {top_movers.delivery_shockers.map((d) => (
                        <tr key={d.symbol}>
                          <td className="bold">{d.symbol}</td>
                          <td className="num font-mono bold highlight">{d.delivery_pct}</td>
                          <td className="num font-mono">{d.average_delivery}</td>
                          <td className="pmi-table-text">{d.implication}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {moversTab === "oi" && (
              <table className="pmi-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th className="num">OI Change</th>
                    <th className="num">Price Change</th>
                    <th>Options Implication</th>
                  </tr>
                </thead>
                <tbody>
                  {top_movers.oi_shockers.map((oi) => (
                    <tr key={oi.symbol}>
                      <td className="bold highlight">{oi.symbol}</td>
                      <td className="num font-mono bold up">{oi.oi_change}</td>
                      <td className={`num font-mono bold ${oi.price_change.includes("-") ? "down" : "up"}`}>{oi.price_change}</td>
                      <td>{oi.implication}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* SECTION 8: OPTIONS MARKET REVIEW */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <Layers size={18} className="pmi-sec-icon" />
            <h2>8. Options Market Review</h2>
          </div>
          <div className="pmi-options-body">
            <div className="pmi-options-header-row">
              <div className="pmi-opt-stat-card">
                <span>Put Call Ratio (PCR)</span>
                <strong className="font-mono">{options_market_review.pcr}</strong>
              </div>
              <div className="pmi-opt-stat-card">
                <span>Max Pain Strike</span>
                <strong className="font-mono">{options_market_review.max_pain.toLocaleString()}</strong>
              </div>
              <div className="pmi-opt-stat-card">
                <span>Tomorrow Bias</span>
                <strong className="highlight">{options_market_review.tomorrow_bias}</strong>
              </div>
            </div>

            <div className="pmi-options-details-list">
              <div className="pmi-opt-detail-row">
                <span>Gamma Shift Cues</span>
                <strong>{options_market_review.gamma_shift}</strong>
              </div>
              <div className="pmi-opt-detail-row">
                <span>Implied Volatility (IV) Change</span>
                <strong>{options_market_review.iv_change}</strong>
              </div>
              <div className="pmi-opt-detail-row">
                <span>Open Interest (OI) Concentration Shift</span>
                <strong>{options_market_review.oi_change}</strong>
              </div>
              <div className="pmi-opt-detail-row">
                <span>Dealer Positioning</span>
                <p>{options_market_review.dealer_positioning}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 9: EARNINGS REACTION ANALYSIS */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <Calendar size={18} className="pmi-sec-icon" />
            <h2>9. Earnings Reaction Analysis</h2>
          </div>
          <div className="pmi-table-container">
            <table className="pmi-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Result</th>
                  <th className="num">Market Reaction</th>
                  <th>Guidance Details</th>
                  <th>Management Commentary</th>
                  <th>Outlook</th>
                </tr>
              </thead>
              <tbody>
                {earnings_reaction_analysis.map((earn) => (
                  <tr key={earn.company}>
                    <td className="bold">{earn.company}</td>
                    <td>
                      <span className={`pmi-category-badge ${earn.result.toLowerCase() === "beat" ? "up" : "down"}`}>{earn.result}</span>
                    </td>
                    <td className={`num font-mono bold ${earn.market_reaction.includes("-") ? "down" : "up"}`}>{earn.market_reaction}</td>
                    <td className="pmi-table-text">{earn.guidance}</td>
                    <td className="pmi-table-text">{earn.commentary}</td>
                    <td>{renderImpactBadge(earn.outlook)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 10: CORPORATE ACTIONS REVIEW */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <Briefcase size={18} className="pmi-sec-icon" />
            <h2>10. Corporate Actions Review</h2>
          </div>
          <div className="pmi-table-container">
            <table className="pmi-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Action Category</th>
                  <th>Event Description Details</th>
                </tr>
              </thead>
              <tbody>
                {corporate_actions_review.map((corp, i) => (
                  <tr key={i}>
                    <td className="bold highlight">{corp.company}</td>
                    <td><span className="pmi-category-badge">{corp.action}</span></td>
                    <td className="pmi-table-text">{corp.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 11: SMART MONEY TRACKER */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <Eye size={18} className="pmi-sec-icon" />
            <h2>11. Smart Money Tracker</h2>
          </div>
          <div className="pmi-table-container">
            <table className="pmi-table">
              <thead>
                <tr>
                  <th>Deal Type</th>
                  <th>Asset Name</th>
                  <th>Transaction details</th>
                </tr>
              </thead>
              <tbody>
                {smart_money_tracker.map((deal, i) => (
                  <tr key={i}>
                    <td className="bold"><span className="pmi-category-badge">{deal.type}</span></td>
                    <td className="bold highlight">{deal.asset}</td>
                    <td className="pmi-table-text">{deal.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 12: TECHNICAL MARKET MAP */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <LineChart size={18} className="pmi-sec-icon" />
            <h2>12. Technical Market Map</h2>
            <div className="pmi-card-tabs">
              <button 
                className={`pmi-tab-btn ${techTab === "nifty" ? "active" : ""}`}
                onClick={() => setTechTab("nifty")}
              >
                Nifty 50 Map
              </button>
              <button 
                className={`pmi-tab-btn ${techTab === "bank" ? "active" : ""}`}
                onClick={() => setTechTab("bank")}
              >
                Bank Nifty Map
              </button>
            </div>
          </div>
          
          <div className="pmi-options-body">
            {Object.entries(technical_market_map).map(([key, mapVal]) => {
              if ((techTab === "nifty" && key !== "nifty") || (techTab === "bank" && key !== "bank_nifty")) return null;
              return (
                <div key={key} className="pmi-options-details-list" style={{ border: "none", padding: 0 }}>
                  <div className="pmi-gift-stats-grid" style={{ marginBottom: 12 }}>
                    <div className="pmi-gift-stat">
                      <span className="lbl">Support 1</span>
                      <span className="val font-mono">{mapVal.support_1.toLocaleString()}</span>
                    </div>
                    <div className="pmi-gift-stat">
                      <span className="lbl">Resistance 1</span>
                      <span className="val font-mono highlight">{mapVal.resistance_1.toLocaleString()}</span>
                    </div>
                    <div className="pmi-gift-stat">
                      <span className="lbl">Support 2</span>
                      <span className="val font-mono">{mapVal.support_2.toLocaleString()}</span>
                    </div>
                    <div className="pmi-gift-stat">
                      <span className="lbl">Resistance 2</span>
                      <span className="val font-mono highlight">{mapVal.resistance_2.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="pmi-opt-detail-row">
                    <span>Volume Weighted Average Price (VWAP)</span>
                    <strong className="font-mono highlight">{mapVal.vwap.toLocaleString()}</strong>
                  </div>
                  <div className="pmi-opt-detail-row">
                    <span>Moving Averages Condition</span>
                    <p>{mapVal.moving_averages}</p>
                  </div>
                  <div className="pmi-opt-detail-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span>Technical Trend Score</span>
                      <strong style={{ fontSize: "1.1rem" }}>{mapVal.trend_score}</strong>
                    </div>
                    <div>
                      <span>Breakout Probability</span>
                      <strong className="highlight" style={{ fontSize: "1.1rem" }}>{mapVal.breakout_probability}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 13: AI FORECAST ENGINE */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <Zap size={18} className="pmi-sec-icon" />
            <h2>13. AI Forecast Engine</h2>
          </div>
          <div className="pmi-gift-nifty-body">
            <div className="pmi-gift-stats-grid">
              <div className="pmi-gift-stat">
                <span className="lbl">Bullish Probability</span>
                <span className="val font-mono up">{ai_forecast_engine.tomorrow_direction_probability.bullish}%</span>
              </div>
              <div className="pmi-gift-stat">
                <span className="lbl">Bearish Probability</span>
                <span className="val font-mono down">{ai_forecast_engine.tomorrow_direction_probability.bearish}%</span>
              </div>
              <div className="pmi-gift-stat">
                <span className="lbl">Neutral Probability</span>
                <span className="val font-mono">{ai_forecast_engine.tomorrow_direction_probability.neutral}%</span>
              </div>
              <div className="pmi-gift-stat">
                <span className="lbl">Confidence Score</span>
                <span className="val font-mono highlight">{ai_forecast_engine.confidence_score}</span>
              </div>
            </div>

            <div className="pmi-net-flow-bar">
              <div className="pmi-net-flow-main" style={{ marginBottom: 6 }}>
                <span>Expected Trading Range</span>
                <span className="font-mono bold highlight">{ai_forecast_engine.expected_range}</span>
              </div>
              <div className="pmi-net-flow-main">
                <span>Expected Volatility</span>
                <span className="bold text-secondary">{ai_forecast_engine.expected_volatility}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 14: RISK MONITOR */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <Shield size={18} className="pmi-sec-icon" />
            <h2>14. Risk Monitor</h2>
          </div>
          <div className="pmi-options-body">
            <div className="pmi-options-details-list" style={{ border: "none", padding: 0 }}>
              {Object.entries(risk_monitor).map(([key, val]) => {
                const isHigh = val.toLowerCase().includes("high");
                const isMod = val.toLowerCase().includes("moderate");
                return (
                  <div key={key} className="pmi-opt-detail-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ textTransform: "capitalize", margin: 0 }}>{key.replace("_", " ")}</span>
                    <strong className={isHigh ? "down" : isMod ? "highlight" : "up"}>{val}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 15: NEXT DAY ACTION PLAN */}
        <div className="pmi-card col-6">
          <div className="pmi-card-header">
            <BookOpen size={18} className="pmi-sec-icon" />
            <h2>15. Next Day Action Plan</h2>
          </div>
          <div className="pmi-options-body">
            <div className="pmi-options-details-list" style={{ border: "none", padding: 0 }}>
              <div className="pmi-opt-detail-row">
                <span>Key Economic Catalysts</span>
                <strong>{next_day_action_plan.key_economic_events}</strong>
              </div>
              <div className="pmi-opt-detail-row">
                <span>Critical Index Boundaries</span>
                <strong>{next_day_action_plan.critical_levels}</strong>
              </div>
              <div className="pmi-opt-detail-row">
                <span>Market Triggers</span>
                <p>{next_day_action_plan.market_triggers}</p>
              </div>
              <div className="pmi-opt-detail-row">
                <span>High Conviction Intraday Trades</span>
                <p className="bold highlight">{next_day_action_plan.high_conviction_opportunities}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Day Action Watchlist Sub-panel */}
        <div className="pmi-card col-12">
          <div className="pmi-card-header">
            <BookOpen size={18} className="pmi-sec-icon" />
            <h2>Next Day Action Watchlist (Stocks & Sectors)</h2>
          </div>
          <div className="pmi-movers-split">
            <div className="pmi-movers-col">
              <h4>Stocks to Watch tomorrow</h4>
              <table className="pmi-table">
                <thead>
                  <tr><th>Symbol</th><th>Suggested Action</th><th>Levels Mapping</th></tr>
                </thead>
                <tbody>
                  {next_day_action_plan.stocks_to_watch.map((s) => (
                    <tr key={s.symbol}>
                      <td className="bold highlight">{s.symbol}</td>
                      <td><span className={`pmi-cii-outlook pmi-cii-outlook--${s.action.toLowerCase().includes("buy") ? "positive" : "negative"}`}>{s.action}</span></td>
                      <td className="pmi-table-text">{s.levels}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pmi-movers-col" style={{ display: "flex", flexDirection: "column", justifyItems: "center" }}>
              <h4>Sectors in Focus tomorrow</h4>
              <ul className="pmi-sect-list">
                {next_day_action_plan.sectors_to_watch.map((sec, i) => (
                  <li key={i} className="pmi-sect-list-item">
                    <span className="pmi-live-dot pmi-live-dot--post"></span>
                    <span>{sec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* FUTURE PREMIUM FEATURES SHOWCASE CARD */}
        <div className="pmi-card col-12 pmi-premium-showcase-card">
          <div className="pmi-premium-glow"></div>
          <div className="pmi-premium-header">
            <div className="pmi-premium-badge">
              <Sparkles size={12} />
              <span>SentiNews Premium</span>
            </div>
            <h3>Future Premium Intelligence Showcase</h3>
            <p>Institutional utilities and AI forecasting models scheduled for release.</p>
          </div>
          <div className="pmi-premium-grid">
            {FUTURE_PREMIUM_FEATURES.map((feat, i) => (
              <div key={i} className="pmi-premium-feature-item">
                <div className="pmi-premium-feature-title">
                  <Lock size={12} className="pmi-premium-lock" />
                  <h4>{feat.title}</h4>
                </div>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pmi-disclaimer col-12">
          <strong>Institutional Disclaimer:</strong> The post-market report data, AI wrap stories, Money migration factors, and technical maps are compiled for simulation, educational, and information purposes only. Sentinews does not distribute stock advice, buy/sell alerts, or financial tips. Market investments involve extreme capital risks. Consult a registered financial advisor before placing actual market trades.
        </div>
      </div>
    </div>
  );
}
