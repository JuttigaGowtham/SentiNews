"use client";

import React, { useEffect, useState } from "react";
import { fetchPreMarketReport, fetchPostMarketReport } from "@/lib/api";
import { 
  Sun, 
  Moon, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Coins, 
  Building2, 
  Package, 
  Newspaper, 
  Calendar, 
  BrainCircuit, 
  Compass, 
  Clock 
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import "./MarketReportsPage.css";
import LoadingScreen from "@/components/layout/LoadingScreen";

function getISTHour() {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const istMs = utcMs + 5.5 * 3600 * 1000;
  return new Date(istMs).getHours() + new Date(istMs).getMinutes() / 60;
}

function getReportMode() {
  const h = getISTHour();
  if (h >= 4 && h < 9.25) return "pre";
  return "post"; 
}

function BreadthPieChart({ gainersCount, losersCount }) {
  if (gainersCount === 0 && losersCount === 0) {
    return (
      <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
        <span>📈 Chart pending market open</span>
      </div>
    );
  }

  const data = [
    { name: "Gainers", value: gainersCount },
    { name: "Losers", value: losersCount },
  ];
  
  const COLORS = ["#00D4B4", "#ff3b5c"];
  const total = gainersCount + losersCount;
  const ratio = total > 0 ? ((gainersCount / total) * 100).toFixed(0) : 50;

  return (
    <div style={{ position: "relative", width: "100%", height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={75}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}
            itemStyle={{ color: "var(--text-primary)" }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={24}
            formatter={(value, entry) => <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600 }}>{value}: {entry.payload.value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Text Overlay */}
      <div style={{
        position: "absolute",
        top: "43%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        pointerEvents: "none"
      }}>
        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--neon-teal)", fontFamily: "'JetBrains Mono', monospace" }}>{ratio}%</div>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>BULLISH</div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, className = "", children }) {
  return (
    <div className={`report-dashboard-card ${className}`}>
      <div className="report-section__header">
        <span className="report-section__icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className="report-section__body">{children}</div>
    </div>
  );
}

function IndexCard({ name, value, change_pct }) {
  const dir = change_pct > 0 ? "up" : change_pct < 0 ? "down" : "flat";
  const priceStr = (value && value !== 0) ? value.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "—";
  return (
    <div className={`report-index-card report-index-card--${dir}`}>
      <div className="ric__name">{name}</div>
      <div className="ric__price">{priceStr}</div>
      <div className={`ric__change ric__change--${dir}`}>
        {(change_pct != null && change_pct !== 0) ? (
          <>
            {change_pct > 0 ? "▲" : "▼"} {Math.abs(change_pct).toFixed(2)}%
          </>
        ) : "—"}
      </div>
    </div>
  );
}

function StockTable({ rows, type }) {
  const isGainer = type === "gainers";
  return (
    <table className="report-table">
      <thead>
        <tr><th>Symbol</th><th>Price</th><th>Change %</th></tr>
      </thead>
      <tbody>
        {rows?.slice(0, 5).map((r, i) => (
          <tr key={i}>
            <td className="report-table__symbol">{r.symbol}</td>
            <td>₹{r.last_price?.toLocaleString()}</td>
            <td className={isGainer ? "up" : "down"}>{isGainer ? "▲" : "▼"} {Math.abs(r.change_pct).toFixed(2)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function MarketReportsPage() {
  const mode = getReportMode();
  const [activeMode, setActiveMode] = useState(mode);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const fetcher = activeMode === "pre" ? fetchPreMarketReport : fetchPostMarketReport;
      const res = await fetcher();
      setData(res);
    } catch (e) {
      if (!isBackground) setError(e.message);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 300000);
    return () => clearInterval(interval);
  }, [activeMode]);

  if (loading) return <LoadingScreen message="Generating Intelligence Report..." />;

  const gainersCount = data?.gainers?.length || 0;
  const losersCount = data?.losers?.length || 0;

  return (
    <div className="reports-page">
      <div className="reports-page__header">
        <div>
          <h2>Market Reports</h2>
          <p>Daily briefing & digest powered by AI</p>
        </div>
        <div className="reports-toggle">
          <button className={`toggle-btn ${activeMode === "pre" ? "active" : ""}`} onClick={() => setActiveMode("pre")}>
            <span>Pre-Market</span>
          </button>
          <button className={`toggle-btn ${activeMode === "post" ? "active" : ""}`} onClick={() => setActiveMode("post")}>
            <span>Post-Market</span>
          </button>
        </div>
      </div>

      <div className="reports-dashboard-grid">
        {/* Row 1: Header / Document Title Card */}
        <div className="report-dashboard-card col-12 report-doc__header-new">
          <div className="report-doc__header-main">
            <div className="report-doc__badge">{activeMode.toUpperCase()}</div>
            <h1>
              {activeMode === "pre" 
                ? "Pre-Market Briefing" 
                : getISTHour() < 15.5 && activeMode === "post"
                  ? "Live Market Digest" 
                  : "Post-Market Digest"}
            </h1>
          </div>
          {data?.generated_at && (
            <div className="report-doc__timestamp">
              <span className="timestamp-label">Last Updated</span>
              <span className="timestamp-value">
                <Clock size={14} />
                {new Date(data.generated_at).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          )}
        </div>

        {/* Row 2: Indian & Global Indices */}
        {data?.indices && (
          <SectionCard title="Indian Indices" icon={<TrendingUp size={18} />} className="col-6">
            <div className="report-indices-grid">
              {data.indices.filter(i => i.region === "indian").map(idx => (
                <IndexCard key={idx.name} {...idx} value={idx.last_price} change_pct={idx.change_pct} />
              ))}
              {data.indices.filter(i => i.region === "indian").length === 0 && <div className="report-text">Market data currently unavailable.</div>}
            </div>
          </SectionCard>
        )}

        {data?.indices && (
          <SectionCard title="Global Indices & Futures" icon={<Globe size={18} />} className="col-6">
            <div className="report-indices-grid">
              {data.indices.filter(i => i.region !== "indian").map(idx => (
                <IndexCard key={idx.name} {...idx} value={idx.last_price} change_pct={idx.change_pct} />
              ))}
              {data.indices.filter(i => i.region !== "indian").length === 0 && <div className="report-text">Market data currently unavailable.</div>}
            </div>
          </SectionCard>
        )}

        {/* Row 3: FII / DII & Market Breadth Chart */}
        <SectionCard title="FII / DII Activity" icon={<Building2 size={18} />} className="col-6">
          {data?.fii_dii ? (
            <div className="report-fii-dii-wrapper">
              <div className="report-fii-dii-grid">
                <div className="report-index-card">
                  <div className="ric__name">FII Net (₹ Cr)</div>
                  <div className={`ric__price ${data.fii_dii.fii?.net >= 0 ? "up" : "down"}`}>
                    {data.fii_dii.fii?.net >= 0 ? "+" : ""}{data.fii_dii.fii?.net?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="report-index-card">
                  <div className="ric__name">DII Net (₹ Cr)</div>
                  <div className={`ric__price ${data.fii_dii.dii?.net >= 0 ? "up" : "down"}`}>
                    {data.fii_dii.dii?.net >= 0 ? "+" : ""}{data.fii_dii.dii?.net?.toLocaleString() || 0}
                  </div>
                </div>
              </div>
              <p className="rni-source" style={{ textTransform: "none", margin: 0 }}>Data as of {data.fii_dii.date}</p>
            </div>
          ) : (
            <p className="report-text">FII/DII data currently unavailable.</p>
          )}
        </SectionCard>

        <SectionCard title="Market Breadth" icon={<BrainCircuit size={18} />} className="col-6">
          <BreadthPieChart gainersCount={gainersCount} losersCount={losersCount} />
        </SectionCard>

        {/* Advertisement Placeholder */}
        <div className="report-ad-placeholder col-12">Advertisement</div>

        {/* Row 4: Currencies & Commodities */}
        {data?.currencies && data.currencies.length > 0 && (
          <SectionCard title="Currencies" icon={<Coins size={18} />} className="col-6">
            <div className="report-indices-grid">
              {data.currencies.map(idx => <IndexCard key={idx.name} {...idx} value={idx.price} change_pct={idx.day_pct} />)}
            </div>
          </SectionCard>
        )}

        {data?.commodities && data.commodities.length > 0 && (
          <SectionCard title="Commodities Snapshot" icon={<Package size={18} />} className="col-6">
            <div className="report-indices-grid">
              {data.commodities.map(idx => <IndexCard key={idx.name} {...idx} value={idx.price} change_pct={idx.day_pct} />)}
            </div>
          </SectionCard>
        )}

        {/* Pre-Market ADRs */}
        {activeMode === "pre" && (
          <SectionCard title="Pre-Market Indian ADRs" icon={<Compass size={18} />} className="col-12">
            <div className="report-indices-grid">
              {data?.adrs && data.adrs.length > 0 ? (
                data.adrs.map(idx => <IndexCard key={idx.name} {...idx} value={idx.last_price} change_pct={idx.change_pct} />)
              ) : (
                <div className="report-text">ADR market data unavailable at this time.</div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Row 5: Market News & Key Corporate Events */}
        {data?.events && data.events.length > 0 && (
          <SectionCard title="Key Corporate Events" icon={<Calendar size={18} />} className="col-4">
            <table className="report-table">
              <thead>
                <tr><th>Company</th><th>Purpose</th><th>Date</th></tr>
              </thead>
              <tbody>
                {data.events.slice(0, 5).map((r, i) => (
                  <tr key={i}>
                    <td className="report-table__symbol">{r.company}</td>
                    <td>{r.purpose}</td>
                    <td>{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        )}

        {(data?.geopolitical_news?.length > 0 || data?.indian_news?.length > 0 || data?.stocks_in_news?.length > 0) && (
          <SectionCard title="Market & Stocks News" icon={<Newspaper size={18} />} className={data?.events && data.events.length > 0 ? "col-8" : "col-12"}>
            <ul className="report-news-list">
              {[...(data?.geopolitical_news || []), ...(data?.indian_news || [])].map((item, i) => (
                <li key={`macro-${i}`} className="report-news-item">
                  <div className="rni-bullet"></div>
                  <div className="rni-content">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="rni-text" style={{textDecoration: "none"}}>
                      {item.headline}
                    </a>
                    {item.source && <span className="rni-source">Source: {item.source}</span>}
                  </div>
                </li>
              ))}
              {(data?.stocks_in_news || []).map((item, i) => (
                <li key={`stock-${i}`} className="report-news-item">
                  <div className="rni-bullet"></div>
                  <div className="rni-content">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="rni-text" style={{textDecoration: "none"}}>
                      <span className="rni-company">{item.company}</span>
                      {item.news}
                    </a>
                    {item.source && (
                      <span className="rni-source">Source: {item.source}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* Advertisement Placeholder */}
        <div className="report-ad-placeholder col-12">Advertisement</div>

        {/* Row 6: Gainers & Losers side-by-side */}
        <SectionCard title="Top Gainers" icon={<TrendingUp size={18} style={{ color: "#00D4B4" }} />} className="col-6">
          <StockTable rows={data?.gainers} type="gainers" />
        </SectionCard>

        <SectionCard title="Top Losers" icon={<TrendingDown size={18} style={{ color: "#ff3b5c" }} />} className="col-6">
          <StockTable rows={data?.losers} type="losers" />
        </SectionCard>

        {/* Row 7: AI Market Outlook (Full width) */}
        {data?.ai_outlook && (
          <div className="report-ai-outlook col-12">
            <h4>
              <BrainCircuit size={18} />
              <span>AI Market Outlook</span>
            </h4>
            <p>{data.ai_outlook}</p>
          </div>
        )}

        {/* Row 8: Disclaimer */}
        <div className="report-disclaimer col-12">
          <strong>Disclaimer:</strong> All data, news, and analysis provided in this report are strictly for educational and informational purposes only. Sentinews does not provide financial tips, trading suggestions, or investment advice. Market data may be delayed or inaccurate. Please consult a registered financial advisor before making any investment decisions.
        </div>
      </div>
    </div>
  );
}
