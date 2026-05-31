"use client";

import React, { useState } from "react";
import { FiClock } from "react-icons/fi";

const getAssetFlag = (name, symbol, type) => {
  const n = name ? name.toLowerCase() : "";
  const s = symbol ? symbol.toUpperCase() : "";
  
  if (type === "indices") {
    if (n.includes("nifty") || n.includes("sensex") || n.includes("vix")) return "🇮🇳";
    if (n.includes("s&p 500") || n.includes("dow jones") || n.includes("nasdaq") || s.includes("GSPC") || s.includes("DJI") || s.includes("IXIC") || s.includes("NDX") || s.includes("VIX")) return "🇺🇸";
    if (n.includes("ftse 100")) return "🇬🇧";
    if (n.includes("dax")) return "🇩🇪";
    if (n.includes("cac 40")) return "🇫🇷";
    if (n.includes("ibex 35") || s.includes("IBEX")) return "🇪🇸";
    if (n.includes("nikkei")) return "🇯🇵";
    if (n.includes("hang seng")) return "🇭🇰";
    if (n.includes("china")) return "🇨🇳";
    if (n.includes("msci") || n.includes("world") || s.includes("URTH")) return "🌐";
    if (n.includes("tsx") || s.includes("TSX")) return "🇨🇦";
    if (n.includes("bovespa") || s.includes("BVSP")) return "🇧🇷";
    if (n.includes("ipc") || s.includes("MXX")) return "🇲🇽";
    return "🌐";
  }
  
  if (type === "currencies") {
    if (n.includes("usd/inr") || s.includes("USDINR")) return "🇺🇸🇮🇳";
    if (n.includes("eur/usd") || s.includes("EURUSD")) return "🇪🇺🇺🇸";
    if (n.includes("gbp/usd") || s.includes("GBPUSD")) return "🇬🇧🇺🇸";
    if (n.includes("usd/jpy") || s.includes("USDJPY")) return "🇺🇸🇯🇵";
    if (n.includes("eur/inr") || s.includes("EURINR")) return "🇪🇺🇮🇳";
    if (n.includes("gbp/inr") || s.includes("GBPINR")) return "🇬🇧🇮🇳";
    if (n.includes("aud/usd") || s.includes("AUDUSD")) return "🇦🇺🇺🇸";
    if (n.includes("usd/cad") || s.includes("USDCAD")) return "🇺🇸🇨🇦";
    if (n.includes("usd/chf") || s.includes("USDCHF")) return "🇺🇸🇨🇭";
    if (n.includes("nzd/usd") || s.includes("NZDUSD")) return "🇳🇿🇺🇸";
    if (n.includes("gbp/eur") || s.includes("GBPEUR")) return "🇬🇧🇪🇺";
    if (n.includes("eur/chf") || s.includes("EURCHF")) return "🇪🇺🇨🇭";
    return "💱";
  }
  
  if (type === "commodities") {
    return "";
  }
  
  return "📈";
};

export default function AssetTable({ assets, onSelect, type }) {
  const [activeTab, setActiveTab] = useState("price"); // price, performance, technical
  const [checkedAssets, setCheckedAssets] = useState({});

  if (!assets || assets.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
        No data available for {type}...
      </div>
    );
  }

  const allChecked = assets.length > 0 && assets.every(asset => checkedAssets[asset.symbol]);

  const handleSelectAll = (e) => {
    e.stopPropagation();
    if (allChecked) {
      setCheckedAssets({});
    } else {
      const newChecked = {};
      assets.forEach(asset => {
        newChecked[asset.symbol] = true;
      });
      setCheckedAssets(newChecked);
    }
  };

  const handleSelectRow = (symbol, e) => {
    e.stopPropagation();
    setCheckedAssets(prev => ({
      ...prev,
      [symbol]: !prev[symbol]
    }));
  };

  const renderHeader = () => {
    if (activeTab === "price") {
      return (
        <>
          <th style={{ ...thStyle, width: "40px", paddingRight: 0 }}>
            <div 
              className={`custom-table-checkbox ${allChecked ? "checked" : ""}`}
              onClick={handleSelectAll}
            />
          </th>
          <th style={thStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              Name <span style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>▼</span>
            </div>
          </th>
          <th style={thTextAlignRight}>Last</th>
          <th style={thTextAlignRight} className="hide-mobile">High</th>
          <th style={thTextAlignRight} className="hide-mobile">Low</th>
          <th style={thTextAlignRight} className="hide-mobile">Chg.</th>
          <th style={thTextAlignRight}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
              Chg. % <span style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>▼</span>
            </div>
          </th>
          <th style={thTextAlignRight}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
              Time <span style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>▼</span>
            </div>
          </th>
        </>
      );
    }
    if (activeTab === "performance") {
      return (
        <>
          <th style={{ ...thStyle, width: "40px", paddingRight: 0 }}>
            <div 
              className={`custom-table-checkbox ${allChecked ? "checked" : ""}`}
              onClick={handleSelectAll}
            />
          </th>
          <th style={thStyle}>Name</th>
          <th style={thTextAlignRight}>Daily</th>
          <th style={thTextAlignRight} className="hide-mobile">1 Week</th>
          <th style={thTextAlignRight}>1 Month</th>
          <th style={thTextAlignRight} className="hide-mobile">YTD</th>
          <th style={thTextAlignRight} className="hide-mobile">Volatility</th>
        </>
      );
    }
    return ( // technical
      <>
        <th style={{ ...thStyle, width: "40px", paddingRight: 0 }}>
          <div 
            className={`custom-table-checkbox ${allChecked ? "checked" : ""}`}
            onClick={handleSelectAll}
          />
        </th>
        <th style={thStyle}>Name</th>
        <th style={thTextAlignRight} className="hide-mobile">52W High</th>
        <th style={thTextAlignRight} className="hide-mobile">52W Low</th>
        <th style={thTextAlignRight}>Sentiment</th>
      </>
    );
  };

  const renderRow = (asset) => {
    const flag = getAssetFlag(asset.name, asset.symbol, type);
    
    if (activeTab === "price") {
      const isUp = asset.day_pct > 0;
      const isDown = asset.day_pct < 0;
      const colorClass = isUp ? "up" : isDown ? "down" : "flat";

      const formattedChange = asset.day_change != null ? (asset.day_change > 0 ? "+" : "") + asset.day_change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
      const formattedPct = asset.day_pct != null ? (asset.day_pct > 0 ? "+" : "") + asset.day_pct.toFixed(2) + "%" : "—";
      const high = asset.daily_high || asset.high_52w || asset.price;
      const low = asset.daily_low || asset.low_52w || asset.price;
      
      const dateObj = new Date(asset.last_update);
      const formattedTime = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })
        : "—";

      return (
        <tr key={asset.symbol} className="table-row-hover" onClick={() => onSelect(asset)} style={trStyle}>
          <td style={{ ...tdStyle, width: "40px", paddingRight: 0 }} onClick={(e) => e.stopPropagation()}>
            <div 
              className={`custom-table-checkbox ${checkedAssets[asset.symbol] ? "checked" : ""}`}
              onClick={(e) => handleSelectRow(asset.symbol, e)}
            />
          </td>
          <td style={tdStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {flag && <span style={{ fontSize: "1.15rem", display: "inline-flex", minWidth: "22px" }}>{flag}</span>}
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{asset.name}</span>
            </div>
          </td>
          <td style={tdTextAlignRight} className="price-num">
            {asset.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
          <td style={tdTextAlignRight} className="price-num hide-mobile">
            {high?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "—"}
          </td>
          <td style={tdTextAlignRight} className="price-num hide-mobile">
            {low?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "—"}
          </td>
          <td style={tdTextAlignRight} className={`price-num ${colorClass} hide-mobile`}>
            {formattedChange}
          </td>
          <td style={tdTextAlignRight} className={`price-num ${colorClass}`}>
            {formattedPct}
          </td>
          <td style={tdTextAlignRight}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
              <span className="price-num" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{formattedTime}</span>
              <FiClock size={12} style={{ color: "var(--neon-red)", opacity: 0.85 }} />
            </div>
          </td>
        </tr>
      );
    }
    
    if (activeTab === "performance") {
      const getPerfClass = (val) => {
        if (val == null || val === 0) return "flat";
        return val > 0 ? "up" : "down";
      };

      return (
        <tr key={asset.symbol} className="table-row-hover" onClick={() => onSelect(asset)} style={trStyle}>
          <td style={{ ...tdStyle, width: "40px", paddingRight: 0 }} onClick={(e) => e.stopPropagation()}>
            <div 
              className={`custom-table-checkbox ${checkedAssets[asset.symbol] ? "checked" : ""}`}
              onClick={(e) => handleSelectRow(asset.symbol, e)}
            />
          </td>
          <td style={tdStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {flag && <span style={{ fontSize: "1.15rem", display: "inline-flex", minWidth: "22px" }}>{flag}</span>}
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{asset.name}</span>
            </div>
          </td>
          <td style={tdTextAlignRight} className={`price-num ${getPerfClass(asset.day_pct)}`}>
            {asset.day_pct != null ? `${asset.day_pct > 0 ? "+" : ""}${asset.day_pct.toFixed(2)}%` : "—"}
          </td>
          <td style={tdTextAlignRight} className={`price-num ${getPerfClass(asset.weekly_pct)} hide-mobile`}>
            {asset.weekly_pct != null ? `${asset.weekly_pct > 0 ? "+" : ""}${asset.weekly_pct.toFixed(2)}%` : "—"}
          </td>
          <td style={tdTextAlignRight} className={`price-num ${getPerfClass(asset.monthly_pct)}`}>
            {asset.monthly_pct != null ? `${asset.monthly_pct > 0 ? "+" : ""}${asset.monthly_pct.toFixed(2)}%` : "—"}
          </td>
          <td style={tdTextAlignRight} className="price-num hide-mobile">—</td>
          <td style={tdTextAlignRight} className="price-num hide-mobile">
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Low</div>
          </td>
        </tr>
      );
    }

    // Technical
    return (
      <tr key={asset.symbol} className="table-row-hover" onClick={() => onSelect(asset)} style={trStyle}>
        <td style={{ ...tdStyle, width: "40px", paddingRight: 0 }} onClick={(e) => e.stopPropagation()}>
          <div 
            className={`custom-table-checkbox ${checkedAssets[asset.symbol] ? "checked" : ""}`}
            onClick={(e) => handleSelectRow(asset.symbol, e)}
          />
        </td>
        <td style={tdStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {flag && <span style={{ fontSize: "1.15rem", display: "inline-flex", minWidth: "22px" }}>{flag}</span>}
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{asset.name}</span>
          </div>
        </td>
        <td style={tdTextAlignRight} className="price-num hide-mobile">
          {asset.high_52w?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "—"}
        </td>
        <td style={tdTextAlignRight} className="price-num hide-mobile">
          {asset.low_52w?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "—"}
        </td>
        <td style={tdTextAlignRight}>
          <span style={{ 
            padding: "4px 8px", 
            borderRadius: "4px", 
            fontSize: "0.75rem", 
            fontWeight: "600",
            background: asset.sentiment > 0.65 ? "rgba(16, 185, 129, 0.15)" : asset.sentiment < 0.35 ? "rgba(239, 68, 68, 0.15)" : "var(--bg-elevated)",
            color: asset.sentiment > 0.65 ? "#10b981" : asset.sentiment < 0.35 ? "#ef4444" : "var(--text-secondary)",
            border: "1px solid " + (asset.sentiment > 0.65 ? "rgba(16, 185, 129, 0.3)" : asset.sentiment < 0.35 ? "rgba(239, 68, 68, 0.3)" : "var(--border-subtle)")
          }}>
            {(asset.sentiment * 100).toFixed(0)}%
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className="asset-table-container" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="asset-table-tabs" style={{ display: "flex", gap: "2px", padding: "8px 12px", borderBottom: "1px solid var(--border-subtle)" }}>
        {["price", "performance", "technical"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "6px 12px",
              background: activeTab === tab ? "var(--neon-cyan-dim)" : "transparent",
              border: "none",
              borderRadius: "4px",
              color: activeTab === tab ? "var(--neon-cyan)" : "var(--text-secondary)",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.2s"
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div style={{ flex: 1, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ position: "sticky", top: 0, background: "var(--bg-surface)", zIndex: 10 }}>
            <tr>
              {renderHeader()}
            </tr>
          </thead>
          <tbody>
            {assets.map(renderRow)}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .table-row-hover {
            cursor: pointer;
            transition: background 0.2s;
        }
        .table-row-hover:hover {
            background: var(--bg-elevated);
        }
        .price-num {
            font-family: inherit;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .up { color: var(--neon-green); font-weight: 600; }
        .down { color: var(--neon-red); font-weight: 600; }
        .flat { color: var(--text-secondary); font-weight: 600; }
        .custom-table-checkbox {
            width: 14px;
            height: 14px;
            border: 1px solid var(--border-subtle);
            border-radius: 3px;
            background: var(--bg-surface);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        .custom-table-checkbox:hover {
            border-color: var(--neon-cyan);
        }
        .custom-table-checkbox.checked {
            background: var(--neon-cyan);
            border-color: var(--neon-cyan);
        }
        .custom-table-checkbox.checked::after {
            content: "";
            width: 4px;
            height: 8px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
            margin-bottom: 2px;
        }
      `}</style>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "8px 12px",
  fontSize: "0.7rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid var(--border-subtle)"
};

const thTextAlignRight = {
    ...thStyle,
    textAlign: "right"
};

const tdStyle = {
  padding: "10px 12px",
  fontSize: "0.85rem",
  borderBottom: "1px solid var(--border-subtle)"
};

const tdTextAlignRight = {
    ...tdStyle,
    textAlign: "right"
};

const trStyle = {
    transition: "background 0.2s"
};
