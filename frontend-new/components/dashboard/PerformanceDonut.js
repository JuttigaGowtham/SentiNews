"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function PerformanceDonut({ data }) {
  const chartData = useMemo(() => {
    if (!data) return [];
    const all = [
      ...data.commodities,
      ...data.currencies,
      ...data.indices
    ];
    
    const up = all.filter(a => (a.day_pct || 0) > 0).length;
    const down = all.filter(a => (a.day_pct || 0) < 0).length;
    const neutral = all.length - up - down;

    return [
      { name: "Advances", value: up, color: "#00FF33" },
      { name: "Declines", value: down, color: "#FF3333" },
      { name: "Neutral", value: neutral, color: "#888888" }
    ];
  }, [data]);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "150px", position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", fontSize: "10px", color: "var(--text-primary)" }}
            itemStyle={{ color: "var(--text-primary)" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ 
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        textAlign: "center", pointerEvents: "none"
      }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
          {chartData.find(d => d.name === "Advances")?.value || 0}
        </div>
        <div style={{ fontSize: "8px", color: "var(--text-muted)" }}>ADV / DEC</div>
        <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-muted)" }}>
          {chartData.find(d => d.name === "Declines")?.value || 0}
        </div>
      </div>
    </div>
  );
}
