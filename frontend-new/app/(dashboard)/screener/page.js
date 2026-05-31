"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchScreenerData } from '@/lib/api';
import { getStockLogoUrl } from '@/lib/logo-utils';
import { useTheme } from '@/context/ThemeContext';
import dynamic from 'next/dynamic';
import LoadingScreen from "@/components/layout/LoadingScreen";
import './ScreenerPage.css';

// Client-only TradingView component to avoid SSR issues
const AdvancedRealTimeChart = dynamic(
  () => import('react-ts-tradingview-widgets').then((mod) => mod.AdvancedRealTimeChart),
  { ssr: false }
);

const PAGE_SIZE = 25;

/* ─── Format helpers ─── */
const fmt = (v, decimals = 1) => (v == null ? null : parseFloat(v).toFixed(decimals));
const fmtMcap = (v) => {
  if (!v) return null;
  if (v >= 1e12) return `₹${(v / 1e12).toFixed(1)}L Cr`;
  if (v >= 1e9)  return `₹${(v / 1e9).toFixed(1)}K Cr`;
  return `₹${(v / 1e7).toFixed(0)} Cr`;
};

/* ─── Preset Screens (like Screener.in sidebar) ─── */
const PRESETS = [
  {
    group: "Popular Screens",
    items: [
      { id: "ALL",        label: "All Stocks" },
      { id: "VALUE",      label: "Benjamin Graham (P/E < 15)" },
      { id: "QUALITY",    label: "Quality Stocks" },
      { id: "HIGH_ROE",   label: "High ROE (>15%)" },
      { id: "HIGH_DIV",   label: "High Dividend (>3%)" },
      { id: "LOW_DEBT",   label: "Low Debt (D/E < 0.5)" },
    ],
  },
  {
    group: "Growth & Momentum",
    items: [
      { id: "GROWTH",     label: "High Growth (EPS+Sales >20%)" },
      { id: "MOMENTUM",   label: "Momentum Stocks" },
      { id: "BREAKOUT",   label: "Volume Breakout" },
      { id: "GOLDEN",     label: "Golden Cross (50 > 200 DMA)" },
      { id: "SMA200",     label: "Above 200 DMA" },
      { id: "TURNAROUND", label: "Turnaround Candidates" },
    ],
  },
  {
    group: "Technicals",
    items: [
      { id: "OVERSOLD",   label: "Oversold (RSI < 30)" },
      { id: "OVERBOUGHT", label: "Overbought (RSI > 70)" },
      { id: "NEAR_HIGH",  label: "Near 52W High (< 5%)" },
      { id: "NEAR_LOW",   label: "⬇Near 52W Low" },
    ],
  },
  {
    group: "Market Cap",
    items: [
      { id: "LARGECAP",   label: "Large Cap (> ₹20,000 Cr)" },
      { id: "MIDCAP",     label: "Mid Cap (5K–20K Cr)" },
      { id: "SMALLCAP",   label: "Small Cap (< ₹5,000 Cr)" },
    ],
  },
  {
    group: "Sector",
    items: [
      { id: "SEC_IT",      label: "IT / Technology" },
      { id: "SEC_FIN",     label: "Financial Services" },
      { id: "SEC_PHARMA",  label: "Healthcare / Pharma" },
      { id: "SEC_ENERGY",  label: "Energy" },
      { id: "SEC_CONSUMER",label: "Consumer Goods" },
      { id: "SEC_AUTO",    label: "Automobile" },
      { id: "SEC_INFRA",   label: "Infrastructure / Realty" },
    ],
  },
];

const SECTOR_MAP = {
  SEC_IT:       ["Technology", "Information Technology"],
  SEC_FIN:      ["Financial Services", "Banking"],
  SEC_PHARMA:   ["Healthcare", "Pharmaceuticals", "Biotechnology"],
  SEC_ENERGY:   ["Energy", "Utilities", "Oil & Gas"],
  SEC_CONSUMER: ["Consumer Defensive", "Consumer Cyclical", "Consumer Goods"],
  SEC_AUTO:     ["Automobile", "Automotive"],
  SEC_INFRA:    ["Real Estate", "Infrastructure","Industrials"],
};

/* ─── Sortable Column Header ─── */
function Th({ label, sortKey, sortConfig, onSort, className = "" }) {
  const active = sortConfig.key === sortKey;
  return (
    <th
      className={`${className} ${active ? "active-sort" : ""}`}
      onClick={() => onSort(sortKey)}
    >
      {label}
      <span style={{ marginLeft: 4, opacity: active ? 1 : 0.3, fontSize: "0.65rem" }}>
        {active ? (sortConfig.dir === "asc" ? "▲" : "▼") : "↕"}
      </span>
    </th>
  );
}

const Cell = ({ val, suffix = "", pos, neg, className = "" }) => {
  if (val == null) return <td className={`mono ${className}`}><span className="dash">—</span></td>;
  const cls = pos != null && val > pos ? "pos" : neg != null && val < neg ? "neg" : "";
  return <td className={`mono ${className} ${cls}`}>{val}{suffix}</td>;
};

/* ─── Stock Detail Drawer ─── */
function StockDrawer({ stock, theme, onClose }) {
  if (!stock) return null;
  const FundCard = ({ label, value, highlight }) => (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
      borderRadius: 8, padding: '12px 16px', minWidth: 110
    }}>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: highlight || 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>{value ?? '—'}</div>
    </div>
  );

  const pctColor = (v) => v == null ? 'var(--text-primary)' : v >= 0 ? 'var(--neon-green)' : 'var(--neon-red)';
  const f = (v, d = 1) => v == null ? null : parseFloat(v).toFixed(d);

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.3)',
        zIndex: 200, backdropFilter: 'blur(4px)'
      }} />

      <div 
        className="scr-drawer"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column',
          zIndex: 201,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={getStockLogoUrl(stock.symbol)} 
              alt={stock.symbol} 
              className="stock-logo-img" 
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'contain', background: '#fff', border: '1px solid var(--border-subtle)', padding: '2px', marginRight: 0 }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${stock.symbol.charAt(0)}&background=1E40AF&color=fff&rounded=true&bold=true`;
              }} 
            />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{stock.symbol}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{stock.sector || ''}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                ₹{f(stock.price, 2)}
              </div>
              <div style={{ fontSize: '0.88rem', color: pctColor(stock.change_pct), fontFamily: "'JetBrains Mono', monospace" }}>
                {stock.change_pct != null ? (stock.change_pct > 0 ? '+' : '') + f(stock.change_pct) + '%' : ''}
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: '1rem'
            }}>✕</button>
          </div>
        </div>

        <div className="scr-drawer-chart" style={{ flexShrink: 0, borderBottom: '1px solid var(--border-subtle)' }}>
          <AdvancedRealTimeChart
            container_id={`tv_drawer_${stock.symbol}`}
            symbol={`BSE:${stock.symbol}`}
            theme={theme === 'dark' ? 'dark' : 'light'}
            width="100%"
            height="100%"
            timezone="Asia/Kolkata"
            locale="en"
            enable_publishing={false}
            hide_top_toolbar={false}
            save_image={false}
            studies={['RSI@tv-basicstudies','Volume@tv-basicstudies']}
          />
        </div>

        <div style={{ overflow: 'auto', flex: 1, padding: 20 }}>
          <div style={{ marginBottom: 14, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Fundamentals</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            <FundCard label="Market Cap"   value={fmtMcap(stock.market_cap)} />
            <FundCard label="P/E Ratio"    value={f(stock.pe)} />
            <FundCard label="P/B Ratio"    value={f(stock.pb)} />
            <FundCard label="EPS"          value={f(stock.eps, 2)} />
            <FundCard label="ROE %"        value={stock.roe != null ? f(stock.roe) + '%' : null} highlight={stock.roe > 15 ? 'var(--neon-green)' : undefined} />
            <FundCard label="ROCE %"       value={stock.roce != null ? f(stock.roce) + '%' : null} highlight={stock.roce > 15 ? 'var(--neon-green)' : undefined} />
            <FundCard label="Div Yield"    value={stock.div_yield != null ? f(stock.div_yield) + '%' : null} />
            <FundCard label="Debt / Eq"    value={f(stock.debt_to_eq)} highlight={stock.debt_to_eq > 2 ? 'var(--neon-red)' : undefined} />
          </div>

          <div style={{ marginBottom: 14, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Technicals</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            <FundCard label="RSI (14)"     value={f(stock.rsi)} highlight={stock.rsi < 30 ? 'var(--neon-red)' : stock.rsi > 70 ? 'var(--neon-green)' : undefined} />
            <FundCard label="52W High"     value={stock.high_52w != null ? `₹${f(stock.high_52w, 0)}` : null} />
            <FundCard label="52W Low"      value={stock.low_52w != null ? `₹${f(stock.low_52w, 0)}` : null} />
            <FundCard label="vs 52W High"  value={stock.dist_high != null ? f(stock.dist_high) + '%' : null} highlight={stock.dist_high > -5 ? 'var(--neon-green)' : undefined} />
            <FundCard label="SMA 50"       value={stock.sma50 != null ? `₹${f(stock.sma50, 0)}` : null} />
            <FundCard label="SMA 200"      value={stock.sma200 != null ? `₹${f(stock.sma200, 0)}` : null} />
            <FundCard label="Vol Ratio"    value={f(stock.vol_ratio)} highlight={stock.vol_ratio > 2 ? 'var(--neon-light-blue)' : undefined} />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {stock.is_value    && <span style={{ background:'var(--neon-green-dim)', color:'var(--neon-green)', padding:'6px 14px', borderRadius:6, fontSize:'0.8rem', fontWeight:700, border: '1px solid rgba(16, 185, 129, 0.1)' }}>💎 Value Stock (P/E&lt;15)</span>}
            {stock.is_quality  && <span style={{ background:'rgba(245,158,11,0.06)', color:'var(--neon-amber)', padding:'6px 14px', borderRadius:6, fontSize:'0.8rem', fontWeight:700, border: '1px solid rgba(245, 158, 11, 0.1)' }}>⭐ Quality Stock</span>}
            {stock.is_high_roe && <span style={{ background:'rgba(139,92,246,0.06)', color:'#8b5cf6', padding:'6px 14px', borderRadius:6, fontSize:'0.8rem', fontWeight:700, border: '1px solid rgba(139, 92, 246, 0.1)' }}>📈 High ROE</span>}
            {stock.is_breakout && <span style={{ background:'var(--neon-light-blue-dim)',  color:'var(--neon-light-blue)', padding:'6px 14px', borderRadius:6, fontSize:'0.8rem', fontWeight:700, border: '1px solid var(--border-accent)' }}>🔥 Volume Breakout</span>}
            {stock.is_oversold && <span style={{ background:'var(--neon-red-dim)',   color:'var(--neon-red)', padding:'6px 14px', borderRadius:6, fontSize:'0.8rem', fontWeight:700, border: '1px solid rgba(220, 38, 38, 0.1)' }}>📉 Oversold</span>}
            {stock.near_52w_high && <span style={{ background:'rgba(74,222,128,0.06)', color:'var(--neon-green)', padding:'6px 14px', borderRadius:6, fontSize:'0.8rem', fontWeight:700, border: '1px solid rgba(74, 222, 128, 0.1)' }}>🎯 Near 52W High</span>}
            {stock.is_high_div && <span style={{ background:'var(--neon-green-dim)',  color:'var(--neon-green)', padding:'6px 14px', borderRadius:6, fontSize:'0.8rem', fontWeight:700, border: '1px solid rgba(16, 185, 129, 0.1)' }}>💰 High Dividend</span>}
          </div>
        </div>
      </div>
    </>
  );
}

export default function ScreenerPage() {
  const { theme } = useTheme();
  const [data,     setData]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [filter,   setFilter]   = useState("ALL");
  const [search,   setSearch]   = useState("");
  const [sort,     setSort]     = useState({ key: "market_cap", dir: "desc" });
  const [page,     setPage]     = useState(1);
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    let pollTimer = null;
    const loadData = async (isRefresh = false) => {
      if (!isRefresh) setLoading(true);
      try {
        const res = await fetchScreenerData();
        const items = Array.isArray(res) ? res : (res?.data || []);
        setData(items);
        if (res?.scanning === true) {
          pollTimer = setTimeout(() => loadData(true), 30000);
        }
      } catch (e) {
        setError("Failed to load screener data.");
      } finally {
        if (!isRefresh) setLoading(false);
      }
    };
    loadData();
    return () => { if (pollTimer) clearTimeout(pollTimer); };
  }, []);

  const handleSort = useCallback((key) => {
    setSort(s => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }));
    setPage(1);
  }, []);

  const matchesSector = (item, sectorId) => {
    const aliases = SECTOR_MAP[sectorId] || [];
    return aliases.some(a => (item.sector || "").toLowerCase().includes(a.toLowerCase()));
  };

  const countFor = useCallback((id) => {
    if (id === "ALL") return data.length;
    return data.filter(s => {
      if (id === "VALUE")       return s.is_value;
      if (id === "QUALITY")     return s.is_quality;
      if (id === "HIGH_ROE")    return s.is_high_roe;
      if (id === "HIGH_DIV")    return s.is_high_div;
      if (id === "LOW_DEBT")    return s.is_low_debt;
      if (id === "GROWTH")      return s.is_growth;
      if (id === "MOMENTUM")    return s.is_momentum;
      if (id === "TURNAROUND")  return s.is_turnaround;
      if (id === "BREAKOUT")    return s.is_breakout;
      if (id === "OVERSOLD")    return s.is_oversold;
      if (id === "OVERBOUGHT")  return s.is_overbought;
      if (id === "NEAR_HIGH")   return s.near_52w_high;
      if (id === "NEAR_LOW")    return s.near_52w_low;
      if (id === "SMA200")      return s.above_sma200;
      if (id === "GOLDEN")      return s.golden_cross;
      if (id === "LARGECAP")    return s.is_largecap;
      if (id === "MIDCAP")      return s.is_midcap;
      if (id === "SMALLCAP")    return s.is_smallcap;
      if (id.startsWith("SEC_")) return matchesSector(s, id);
      return true;
    }).length;
  }, [data]);

  const displayed = useMemo(() => {
    let list = [...data];
    if (filter !== "ALL") {
      list = list.filter(s => {
        if (filter === "VALUE")       return s.is_value;
        if (filter === "QUALITY")     return s.is_quality;
        if (filter === "HIGH_ROE")    return s.is_high_roe;
        if (filter === "HIGH_DIV")    return s.is_high_div;
        if (filter === "LOW_DEBT")    return s.is_low_debt;
        if (filter === "GROWTH")      return s.is_growth;
        if (filter === "MOMENTUM")    return s.is_momentum;
        if (filter === "TURNAROUND")  return s.is_turnaround;
        if (filter === "BREAKOUT")    return s.is_breakout;
        if (filter === "OVERSOLD")    return s.is_oversold;
        if (filter === "OVERBOUGHT")  return s.is_overbought;
        if (filter === "NEAR_HIGH")   return s.near_52w_high;
        if (filter === "NEAR_LOW")    return s.near_52w_low;
        if (filter === "SMA200")      return s.above_sma200;
        if (filter === "GOLDEN")      return s.golden_cross;
        if (filter === "LARGECAP")    return s.is_largecap;
        if (filter === "MIDCAP")      return s.is_midcap;
        if (filter === "SMALLCAP")    return s.is_smallcap;
        if (filter.startsWith("SEC_")) return matchesSector(s, filter);
        return true;
      });
    }
    if (search.trim()) {
      const q = search.toUpperCase();
      list = list.filter(s => s.symbol.includes(q) || (s.name || "").toUpperCase().includes(q));
    }
    list.sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key];
      if (av == null) av = sort.dir === "asc" ? Infinity : -Infinity;
      if (bv == null) bv = sort.dir === "asc" ? Infinity : -Infinity;
      if (typeof av === "string") return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sort.dir === "asc" ? av - bv : bv - av;
    });
    return list;
  }, [data, filter, search, sort]);

  const totalPages = Math.max(1, Math.ceil(displayed.length / PAGE_SIZE));
  const pageData   = displayed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const changePage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const changeFilter = (id) => { setFilter(id); setPage(1); };

  const exportCSV = () => {
    const headers = "Symbol,Name,Sector,Price,Chg%,MktCap,P/E,P/B,EPS,ROE%,ROCE%,DivYield%,Debt/Eq,RSI";
    const rows = displayed.map(d =>
      [d.symbol, `"${d.name || ""}"`, `"${d.sector || ""}"`,
       d.price, d.change_pct, d.market_cap, d.pe, d.pb, d.eps,
       d.roe, d.roce, d.div_yield, d.debt_to_eq, d.rsi].join(",")
    );
    const csv = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const a = document.createElement("a");
    a.href = encodeURI(csv);
    a.download = `sentinews_screener_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
  };

  const PaginationBar = () => {
    const window_size = 5;
    const half = Math.floor(window_size / 2);
    let start = Math.max(1, page - half);
    let end   = Math.min(totalPages, start + window_size - 1);
    if (end - start < window_size - 1) start = Math.max(1, end - window_size + 1);

    return (
      <div className="scr-pagination">
        <button className="pg-btn" disabled={page <= 1} onClick={() => changePage(1)}>«</button>
        <button className="pg-btn" disabled={page <= 1} onClick={() => changePage(page - 1)}>‹</button>
        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(p => (
          <button key={p} className={`pg-btn ${p === page ? "pg-active" : ""}`} onClick={() => changePage(p)}>{p}</button>
        ))}
        <button className="pg-btn" disabled={page >= totalPages} onClick={() => changePage(page + 1)}>›</button>
        <button className="pg-btn" disabled={page >= totalPages} onClick={() => changePage(totalPages)}>»</button>
      </div>
    );
  };

  const PresetDropdown = () => (
    <div className="scr-mobile-presets">
      <select 
        value={filter}
        onChange={(e) => changeFilter(e.target.value)}
      >
        {PRESETS.map(group => (
          <optgroup key={group.group} label={group.group}>
            {group.items.map(item => (
              <option key={item.id} value={item.id}>
                {item.label} ({countFor(item.id)})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );

  return (
    <div className="scr-page">
      <aside className="scr-sidebar">
        {PRESETS.map(group => (
          <div key={group.group}>
            <h3>{group.group}</h3>
            {group.items.map(item => (
              <button
                key={item.id}
                className={`scr-preset-btn ${filter === item.id ? "active" : ""}`}
                onClick={() => changeFilter(item.id)}
              >
                {item.label}
                {countFor(item.id) > 0 && (
                  <span style={{ float: "right", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    {countFor(item.id)}
                  </span>
                )}
              </button>
            ))}
            <hr />
          </div>
        ))}
      </aside>

      <div className="scr-main">
        <div className="scr-topbar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="scr-screen-title">
              {PRESETS.flatMap(g => g.items).find(i => i.id === filter)?.label || "All Stocks"}
            </div>
            <div className="scr-result-count">
              {loading ? "Scanning universe…" : `${displayed.length} companies found`}
            </div>
            <PresetDropdown />
          </div>
          <div className="scr-topbar-right">
            <input
              className="scr-search"
              placeholder="Search company or symbol…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <button className="scr-btn export" onClick={exportCSV}>Export</button>
          </div>
        </div>

        <div className="scr-table-wrap">
          {loading ? (
            <LoadingScreen message="Scanning NSE Universe..." />
          ) : error ? (
            <div className="scr-error">{error}</div>
          ) : (
            <table className="scr-table">
              <thead>
                <tr>
                  <th className="name-col" onClick={() => handleSort("name")}>NAME / SYMBOL</th>
                  <Th label="CMP ₹"       sortKey="price"        sortConfig={sort} onSort={handleSort} />
                  <Th label="CHG %"       sortKey="change_pct"   sortConfig={sort} onSort={handleSort} />
                  <Th label="MKT CAP"     sortKey="market_cap"   sortConfig={sort} onSort={handleSort} className="hide-mobile" />
                  <Th label="P/E"         sortKey="pe"           sortConfig={sort} onSort={handleSort} className="hide-mobile" />
                  <Th label="P/B"         sortKey="pb"           sortConfig={sort} onSort={handleSort} className="hide-mobile" />
                  <Th label="EPS"         sortKey="eps"          sortConfig={sort} onSort={handleSort} className="hide-mobile" />
                  <Th label="ROE %"       sortKey="roe"          sortConfig={sort} onSort={handleSort} className="hide-mobile" />
                  <Th label="ROCE %"      sortKey="roce"         sortConfig={sort} onSort={handleSort} className="hide-mobile" />
                  <Th label="DIV YLD"     sortKey="div_yield"    sortConfig={sort} onSort={handleSort} className="hide-mobile" />
                  <Th label="DEBT/EQ"     sortKey="debt_to_eq"   sortConfig={sort} onSort={handleSort} className="hide-mobile" />
                  <Th label="RSI"         sortKey="rsi"          sortConfig={sort} onSort={handleSort} className="hide-mobile" />
                </tr>
              </thead>
              <tbody>
                {pageData.map(item => (
                  <tr key={item.symbol}>
                    <td className="name-col" onClick={() => setSelectedStock(item)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={getStockLogoUrl(item.symbol)} 
                          alt={item.symbol} 
                          className="stock-logo-img" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${item.symbol.charAt(0)}&background=1E40AF&color=fff&rounded=true&bold=true`;
                          }} 
                        />
                        <div>
                          <div className="scr-name">{item.symbol}</div>
                          <div className="scr-sector">{item.sector || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="mono">₹{fmt(item.price, 2)}</td>
                    <td className={`mono ${item.change_pct >= 0 ? "pos" : "neg"}`}>
                      {item.change_pct != null ? (item.change_pct > 0 ? "+" : "") + fmt(item.change_pct) + "%" : "—"}
                    </td>
                    <td className="mono hide-mobile">{fmtMcap(item.market_cap)}</td>
                    <Cell val={fmt(item.pe)} className="hide-mobile" />
                    <Cell val={fmt(item.pb)} className="hide-mobile" />
                    <Cell val={fmt(item.eps, 2)} className="hide-mobile" />
                    <Cell val={item.roe != null ? fmt(item.roe) + "%" : null} className="hide-mobile" />
                    <Cell val={item.roce != null ? fmt(item.roce) + "%" : null} className="hide-mobile" />
                    <Cell val={item.div_yield != null ? fmt(item.div_yield) + "%" : null} className="hide-mobile" />
                    <Cell val={fmt(item.debt_to_eq)} className="hide-mobile" />
                    <td className="mono hide-mobile">{fmt(item.rsi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && !error && displayed.length > PAGE_SIZE && <PaginationBar />}
      </div>
      {selectedStock && <StockDrawer stock={selectedStock} theme={theme} onClose={() => setSelectedStock(null)} />}
    </div>
  );
}
