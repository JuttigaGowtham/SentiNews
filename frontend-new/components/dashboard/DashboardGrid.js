"use client";
// Bloomberg-lite Terminal Fixed

import React, { useState } from "react";
import { FiActivity, FiX, FiFileText, FiBarChart2, FiTrendingUp } from "react-icons/fi";
import dynamic from "next/dynamic";
import { fetchStockHistory } from "@/lib/api";
import AssetTable from "./AssetTable";

const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });

const WidgetWrapper = ({ title, icon: Icon, children, id }) => (
  <div className="grid-item-container" id={id} style={{ height: "100%" }}>
    <div className="widget-header">
      <div className="widget-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Icon size={14} />
        {title}
      </div>
    </div>
    <div className="widget-content">
      {children}
    </div>
  </div>
);

export default function DashboardGrid({ data, type = "commodities" }) {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const layouts = {
    lg: [
      { i: "assets", x: 0, y: 0, w: 6, h: 10 },
      { i: "news", x: 6, y: 0, w: 6, h: 10 },
    ],
    md: [
      { i: "assets", x: 0, y: 0, w: 6, h: 10 },
      { i: "news", x: 6, y: 0, w: 6, h: 10 },
    ],
    sm: [
      { i: "assets", x: 0, y: 0, w: 6, h: 9 },
      { i: "news", x: 0, y: 9, w: 6, h: 9 },
    ],
    xs: [
      { i: "assets", x: 0, y: 0, w: 4, h: 8 },
      { i: "news", x: 0, y: 8, w: 4, h: 8 },
    ],
    xss: [
      { i: "assets", x: 0, y: 0, w: 2, h: 8 },
      { i: "news", x: 0, y: 8, w: 2, h: 8 },
    ],
  };
  const [showChart, setShowChart] = useState(false);
  const [chartPos, setChartPos] = useState({ x: 300, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [history, setHistory] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [range, setRange] = useState("3M");

  React.useEffect(() => {
    if (!selectedAsset) return;
    let active = true;
    const loadHistory = async () => {
      setChartLoading(true);
      try {
        const res = await fetchStockHistory(selectedAsset.symbol, range);
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
  }, [range, selectedAsset]);

  const onLayoutChange = (newLayout) => {
    // Layout is static
  };

  const handleAssetSelect = (asset) => {
    let tvSymbol = asset.symbol;
    
    // Robust mapping based on type or asset properties
    if (type === "commodities" || asset.kind === "COMM" || asset.category === "Commodity") {
      const commMap = {
        "GC=F": "TVC:GOLD", 
        "CL=F": "TVC:USOIL", 
        "SI=F": "TVC:SILVER", 
        "HG=F": "CAPITALCOM:COPPER",
        "NG=F": "NYMEX:NG1!", 
        "PL=F": "CAPITALCOM:PLATINUM", 
        "PA=F": "CAPITALCOM:PALLADIUM", 
        "RB=F": "NYMEX:RB1!",
        "ZN=F": "CAPITALCOM:ZINC",
        "PB=F": "CAPITALCOM:LEAD",
        "NI=F": "CAPITALCOM:NICKEL",
        "SRU=F": "TVC:RUBBER",
        "GJS=F": "NCDEX:GUARSEED101!",
        "MENTHA-F": "MCX:MENTHAOIL1!",
        "KAPAS.NS": "NCDEX:KAPAS1!",
        "GOLDPETAL": "MCX:GOLDPETAL1!",
        "BZ=F": "TVC:UKOIL",
        "HO=F": "NYMEX:HO1!",
        "ALI=F": "CAPITALCOM:ALUMINUM",
        "ZW=F": "CAPITALCOM:WHEAT",
        "ZC=F": "CAPITALCOM:CORN",
        "ZS=F": "CAPITALCOM:SOYBEANS",
        "SB=F": "CAPITALCOM:SUGAR",
        "KC=F": "CAPITALCOM:COFFEE",
        "CT=F": "CAPITALCOM:COTTON",
        "CC=F": "CAPITALCOM:COCOA",
      };
      tvSymbol = commMap[asset.symbol] || asset.symbol.replace("=F", "");
    } else if (type === "currencies" || asset.kind === "FX" || asset.kind === "FOREX" || asset.category === "Currencies") {
      const curMap = {
        // Spot / Yahoo formats
        "USDINR=X": "FX_IDC:USDINR", 
        "EURUSD=X": "FX:EURUSD", 
        "GBPUSD=X": "FX:GBPUSD", 
        "USDJPY=X": "FX:USDJPY",
        "EURCHF=X": "FX:EURCHF",
        "EURINR=X": "FX_IDC:EURINR", 
        "GBPINR=X": "FX_IDC:GBPINR", 
        "AUDUSD=X": "FX:AUDUSD",
        "USDCAD=X": "FX:USDCAD",
        "USDCHF=X": "FX:USDCHF", 
        "NZDUSD=X": "FX:NZDUSD",
        "GBPEUR=X": "FX:GBPEUR",
        // Futures / other formats
        "USDINR=F": "FX_IDC:USDINR",
        "EURUSD=F": "FX:EURUSD",
        "GBPUSD=F": "FX:GBPUSD",
        "JPY=F": "FX:USDJPY",
        "AUD=F": "FX:AUDUSD",
        "CAD=F": "FX:USDCAD",
      };
      tvSymbol = curMap[asset.symbol] || asset.symbol.replace("=X", "").replace("=F", "");
    } else if (type === "indices" || asset.kind === "INDEX" || asset.category === "Indices") {
      const indexMap = {
        "^NSEI": "TVC:NIFTY", 
        "^BSESN": "TVC:SENSEX", 
        "^NSEBANK": "TVC:BANKNIFTY", 
        "^CNXIT": "NSE:NIFTYIT",
        "^GSPC": "CAPITALCOM:US500", 
        "^DJI": "CAPITALCOM:US30", 
        "^IXIC": "CAPITALCOM:US100", 
        "^NDX": "CAPITALCOM:US100",
        "^FTSE": "CAPITALCOM:UK100", 
        "^N225": "CAPITALCOM:JP225", 
        "^HSI": "CAPITALCOM:HK33",
        "^GDAXI": "CAPITALCOM:DE40",
        "^FCHI": "CAPITALCOM:FRA40",
        "^IBEX": "TVC:IBEX35",
        "^FTSEA50": "CAPITALCOM:CN50",
        "URTH": "AMEX:URTH",
        "NIFTY_F1.NS": "TVC:NIFTY",
        "BANKNIFTY_F1.NS": "TVC:BANKNIFTY",
        "ES=F": "CAPITALCOM:US500",
        "NQ=F": "CAPITALCOM:US100",
        "YM=F": "CAPITALCOM:US30",
        "^VIX": "TVC:VIX",
      };
      tvSymbol = indexMap[asset.symbol] || asset.symbol.replace("^", "");
    }
    setSelectedAsset({ ...asset, tvSymbol });
    setShowChart(true);
  };

  // Filter assets based on type
  const filteredAssets = React.useMemo(() => {
    if (!data?.snapshot) return [];
    let assets = [];
    if (type === "commodities") assets = data.snapshot.commodities || [];
    else if (type === "indices") assets = data.snapshot.indices || [];
    else if (type === "currencies") assets = data.snapshot.currencies || [];

    return assets.map(asset => {
      let tvSymbol = asset.symbol;
      if (type === "commodities" || asset.kind === "COMM" || asset.category === "Commodity") {
        const commMap = {
          "GC=F": "TVC:GOLD", 
          "CL=F": "TVC:USOIL", 
          "SI=F": "TVC:SILVER", 
          "HG=F": "CAPITALCOM:COPPER",
          "NG=F": "NYMEX:NG1!", 
          "PL=F": "CAPITALCOM:PLATINUM", 
          "PA=F": "CAPITALCOM:PALLADIUM", 
          "RB=F": "NYMEX:RB1!",
          "ZN=F": "CAPITALCOM:ZINC",
          "PB=F": "CAPITALCOM:LEAD",
          "NI=F": "CAPITALCOM:NICKEL",
          "SRU=F": "TVC:RUBBER",
          "GJS=F": "NCDEX:GUARSEED101!",
          "MENTHA-F": "MCX:MENTHAOIL1!",
          "KAPAS.NS": "NCDEX:KAPAS1!",
          "GOLDPETAL": "MCX:GOLDPETAL1!",
          "BZ=F": "TVC:UKOIL",
          "HO=F": "NYMEX:HO1!",
          "ALI=F": "CAPITALCOM:ALUMINUM",
          "ZW=F": "CAPITALCOM:WHEAT",
          "ZC=F": "CAPITALCOM:CORN",
          "ZS=F": "CAPITALCOM:SOYBEANS",
          "SB=F": "CAPITALCOM:SUGAR",
          "KC=F": "CAPITALCOM:COFFEE",
          "CT=F": "CAPITALCOM:COTTON",
          "CC=F": "CAPITALCOM:COCOA",
        };
        tvSymbol = commMap[asset.symbol] || asset.symbol.replace("=F", "");
      } else if (type === "currencies" || asset.kind === "FX" || asset.kind === "FOREX" || asset.category === "Currencies") {
        const curMap = {
          "USDINR=X": "FX_IDC:USDINR", 
          "EURUSD=X": "FX:EURUSD", 
          "GBPUSD=X": "FX:GBPUSD", 
          "USDJPY=X": "FX:USDJPY",
          "EURCHF=X": "FX:EURCHF",
          "EURINR=X": "FX_IDC:EURINR", 
          "GBPINR=X": "FX_IDC:GBPINR", 
          "AUDUSD=X": "FX:AUDUSD",
          "USDCAD=X": "FX:USDCAD",
          "USDCHF=X": "FX:USDCHF", 
          "NZDUSD=X": "FX:NZDUSD",
          "GBPEUR=X": "FX:GBPEUR",
          "USDINR=F": "FX_IDC:USDINR",
          "EURUSD=F": "FX:EURUSD",
          "GBPUSD=F": "FX:GBPUSD",
          "JPY=F": "FX:USDJPY",
          "AUD=F": "FX:AUDUSD",
          "CAD=F": "FX:USDCAD",
        };
        tvSymbol = curMap[asset.symbol] || asset.symbol.replace("=X", "").replace("=F", "");
      } else if (type === "indices" || asset.kind === "INDEX" || asset.category === "Indices") {
        const indexMap = {
          "^NSEI": "TVC:NIFTY", 
          "^BSESN": "TVC:SENSEX", 
          "^NSEBANK": "TVC:BANKNIFTY", 
          "^CNXIT": "NSE:NIFTYIT",
          "^GSPC": "CAPITALCOM:US500", 
          "^DJI": "CAPITALCOM:US30", 
          "^IXIC": "CAPITALCOM:US100", 
          "^NDX": "CAPITALCOM:US100",
          "^FTSE": "CAPITALCOM:UK100", 
          "^N225": "CAPITALCOM:JP225", 
          "^HSI": "CAPITALCOM:HK33",
          "^GDAXI": "CAPITALCOM:DE40",
          "^FCHI": "CAPITALCOM:FRA40",
          "^IBEX": "TVC:IBEX35",
          "^FTSEA50": "CAPITALCOM:CN50",
          "URTH": "AMEX:URTH",
          "NIFTY_F1.NS": "TVC:NIFTY",
          "BANKNIFTY_F1.NS": "TVC:BANKNIFTY",
          "ES=F": "CAPITALCOM:US500",
          "NQ=F": "CAPITALCOM:US100",
          "YM=F": "CAPITALCOM:US30",
          "^VIX": "TVC:VIX",
        };
        tvSymbol = indexMap[asset.symbol] || asset.symbol.replace("^", "");
      }
      return { ...asset, tvSymbol };
    });
  }, [data, type]);


  // Floating Chart Drag Logic
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - chartPos.x,
      y: e.clientY - chartPos.y
    });
  };

  const handleMouseMove = React.useCallback((e) => {
    if (isDragging) {
      setChartPos({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  // News to Chart Link logic
  const handleNewsClick = (e, item) => {
    e.preventDefault();
    // Search for matching asset in our current view
    const match = filteredAssets.find(asset => 
      item.headline.toLowerCase().includes(asset.name.toLowerCase()) ||
      (asset.symbol && item.headline.toLowerCase().includes(asset.symbol.toLowerCase().replace("=F", "").replace("^", "").replace("=X", "")))
    );
    
    if (match) {
      handleAssetSelect(match);
    } else {
      // If no asset match, open URL
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const pageTitle = type === "commodities" ? "Commodities" : type === "indices" ? "Global Indices" : "Currencies";
  const PageIcon = type === "commodities" ? FiBarChart2 : type === "indices" ? FiActivity : FiTrendingUp;

  return (
    <div className="terminal-workspace">
      {/* Column 1: Assets List */}
      <div className="terminal-column assets-column">
        <WidgetWrapper title={pageTitle} icon={PageIcon} id="assets">
          <AssetTable assets={filteredAssets} type={type} onSelect={handleAssetSelect} />
        </WidgetWrapper>
      </div>

      {/* Column 2: News Feed */}
      <div className="terminal-column news-column">
        <WidgetWrapper title="Bloomberg Intelligence" icon={FiFileText} id="news">
          <div className="news-terminal-list">
            {(data?.news || []).map((item, idx) => (
              <div key={idx} className="news-terminal-item">
                <div className={`news-impact-indicator impact-${item.impact || 'low'}`}></div>
                <div style={{ flex: 1 }}>
                  <a 
                    href={item.url} 
                    onClick={(e) => handleNewsClick(e, item)}
                    className="news-headline-terminal"
                    style={{ cursor: "pointer" }}
                  >
                    {item.headline}
                  </a>
                  <div className="news-meta">
                    {item.source} • {new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </WidgetWrapper>
      </div>

      {/* Floating Interactive Chart Popup Modal */}
      {showChart && selectedAsset && (() => {
        const isCommodity = type === "commodities" || selectedAsset.category === "Commodity" || selectedAsset.kind === "COMM";
        const popupBg = isCommodity ? "#ffffff" : "var(--bg-elevated)";
        const popupBorder = isCommodity ? "#e2e8f0" : "var(--border-subtle)";
        const popupTextColor = isCommodity ? "#0f172a" : "var(--text-primary)";
        const popupSubtextColor = isCommodity ? "#475569" : "var(--text-secondary)";
        const gridColor = isCommodity ? "#f1f5f9" : "rgba(255, 255, 255, 0.05)";
        const headerBg = isCommodity ? "#f8fafc" : "var(--bg-elevated)";
        
        const isUp = (selectedAsset.day_pct ?? 0) >= 0;
        const trendColor = isUp ? "#10B981" : "#EF4444";

        return (
          <div 
            className="chart-modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }} 
            onClick={() => setShowChart(false)}
          >
            <div 
              className="chart-modal-content"
              style={{
                backgroundColor: popupBg,
                border: `1px solid ${popupBorder}`,
                borderRadius: "12px",
                boxShadow: isCommodity ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" : "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                width: "90%",
                maxWidth: "720px",
                height: "520px",
                position: "relative"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                style={{
                  padding: "14px 18px",
                  backgroundColor: headerBg,
                  borderBottom: `1px solid ${popupBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", fontWeight: "600", color: isCommodity ? "#0f172a" : "var(--neon-cyan)" }}>
                  <FiActivity size={16} />
                  {selectedAsset.name} Terminal Analysis
                </div>
                <button 
                  onClick={() => setShowChart(false)}
                  style={{ background: "none", border: "none", color: popupSubtextColor, cursor: "pointer", padding: "4px" }}
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div style={{ flex: 1, position: "relative", padding: "20px", display: "flex", flexDirection: "column", height: "calc(100% - 48px)" }}>
                {/* Price and Range Selectors */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <span style={{ fontSize: "1.6rem", fontWeight: "700", color: popupTextColor }}>
                      {selectedAsset.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span style={{ marginLeft: "8px", fontWeight: "600", fontSize: "0.9rem", color: trendColor }}>
                      {isUp ? "+" : ""}{selectedAsset.day_change?.toFixed(2)} ({isUp ? "+" : ""}{selectedAsset.day_pct?.toFixed(2)}%)
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {["1W", "1M", "3M", "1Y"].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRange(r)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          border: "1px solid " + (range === r ? trendColor : (isCommodity ? "#cbd5e1" : "rgba(255,255,255,0.1)")),
                          background: range === r ? trendColor : "transparent",
                          color: range === r ? "#ffffff" : popupSubtextColor,
                          transition: "all 0.2s"
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Area Chart Container */}
                <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                  {chartLoading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: popupSubtextColor }}>
                      Loading history...
                    </div>
                  ) : !history || history.length === 0 ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: popupSubtextColor }}>
                      No history data available for this range.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <defs>
                          <linearGradient id={`grad_${selectedAsset.symbol.replace(/[^a-zA-Z0-9]/g, '_')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={trendColor} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={trendColor} stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis 
                          dataKey="date" 
                          tickLine={false} 
                          axisLine={false}
                          stroke={popupSubtextColor}
                          fontSize={10}
                          tickFormatter={(str) => {
                            try {
                              const d = new Date(str);
                              if (isNaN(d.getTime())) return str;
                              return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                            } catch {
                              return str;
                            }
                          }}
                        />
                        <YAxis 
                          domain={["auto", "auto"]} 
                          tickLine={false} 
                          axisLine={false}
                          stroke={popupSubtextColor}
                          fontSize={10}
                          tickFormatter={(val) => Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        />
                        <Tooltip
                          contentStyle={{ 
                            background: isCommodity ? "#ffffff" : "var(--bg-surface)", 
                            border: `1px solid ${isCommodity ? "#cbd5e1" : "var(--border-subtle)"}`, 
                            borderRadius: "8px", 
                            fontSize: "0.75rem",
                            color: popupTextColor
                          }}
                          labelStyle={{ color: popupSubtextColor }}
                          itemStyle={{ color: popupTextColor }}
                          formatter={(value) => [Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 }), "Price"]}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="close" 
                          stroke={trendColor} 
                          strokeWidth={2.5}
                          fillOpacity={1} 
                          fill={`url(#grad_${selectedAsset.symbol.replace(/[^a-zA-Z0-9]/g, '_')})`}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
