"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function MoversScanner({ gainers = [], losers = [] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("gainers"); // "gainers" or "losers"

  const handleRowClick = (symbol) => {
    router.push(`/stock/${symbol}`);
  };

  const currentList = activeTab === "gainers" ? (gainers || []) : (losers || []);

  return (
    <div className="movers-scanner-container">
      {/* Tab Switcher */}
      <div className="movers-tabs">
        <button
          className={`movers-tab-btn tab-gainers ${activeTab === "gainers" ? "active" : ""}`}
          onClick={() => setActiveTab("gainers")}
        >
          <TrendingUp size={16} />
          <span>Gainers</span>
          <span className="count-badge green">{gainers?.length || 0}</span>
        </button>
        
        <button
          className={`movers-tab-btn tab-losers ${activeTab === "losers" ? "active" : ""}`}
          onClick={() => setActiveTab("losers")}
        >
          <TrendingDown size={16} />
          <span>Losers</span>
          <span className="count-badge red">{losers?.length || 0}</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="movers-content">
        {currentList.length === 0 ? (
          <div className="movers-empty-state">
            <span className="empty-icon">📊</span>
            <p>No market data available</p>
          </div>
        ) : (
          <div className="movers-table-wrapper">
            <table className="movers-table-new">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th style={{ textAlign: "right" }}>Price</th>
                  <th style={{ textAlign: "right" }}>Change</th>
                </tr>
              </thead>
              <tbody>
                {currentList.slice(0, 10).map((stock, i) => {
                  const isUp = activeTab === "gainers";
                  const changePct = stock.change_pct || 0;
                  const price = stock.last_price || 0;
                  
                  return (
                    <tr 
                      key={`${stock.symbol}-${i}`} 
                      onClick={() => handleRowClick(stock.symbol)}
                      className="mover-row-interactive"
                    >
                      <td className="symbol-cell">
                        <span className="symbol-ticker">{stock.symbol}</span>
                      </td>
                      <td className="price-cell" style={{ textAlign: "right" }}>
                        ₹{Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span className={`change-pill ${isUp ? "up" : "down"}`}>
                          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {isUp ? "+" : ""}{changePct.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
