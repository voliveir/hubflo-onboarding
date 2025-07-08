"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { Loader2, Download, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { AdminSidebar } from "@/components/admin-sidebar";
import { PasswordProtection } from "@/components/password-protection";

const BAR_COLORS = ["#F2C94C", "#F2994A", "#0a0b1a", "#10122b", "#1a1c3a"];

function formatDate(date: Date) {
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

const AnalyticsDashboard = ({ lastUpdated }: { lastUpdated: string }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/analytics-summary")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load analytics.");
        setLoading(false);
      });
  }, []);

  const handleExport = () => {
    if (!data) return;
    const csvRows = [
      ["Metric", "Value"],
      ["Total Clients", data.totalClients],
      ["MRR", data.mrr],
      ["ARR", data.arr],
      ["Paying Clients", data.payingClients],
      ["Non-Paying Clients", data.nonPayingClients],
      ["Growth Rate (30d)", data.growthRate],
      ...Object.entries(data.clientsByPackage || {}).map(([pkg, count]) => [
        `Clients (${pkg})`,
        count,
      ]),
    ];
    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hubflo-analytics-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin w-8 h-8 text-gold-400" />
      </div>
    );
  }
  if (error || !data) {
    return <div className="text-red-500 p-8">{error || "No data available."}</div>;
  }

  // Prepare bar chart data
  const barData = Object.keys(data.clientsByPackage || {}).map((label, i) => ({
    name: label,
    value: data.clientsByPackage[label],
    fill: BAR_COLORS[i % BAR_COLORS.length],
  }));

  return (
    <div className="w-full font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">Analytics Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#10122b] font-semibold shadow-lg hover:scale-105 transition-transform"
            title="Export analytics as CSV"
          >
            <Download className="w-5 h-5" /> Export
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-300 bg-[#10122b] px-3 py-1.5 rounded-lg shadow">
            <RefreshCw className="w-4 h-4 text-gold-400" />
            Last updated: <span className="ml-1 font-medium text-white">{lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
        {[
          { label: "Total Clients", value: data.totalClients },
          { label: "MRR", value: `$${data.mrr.toLocaleString()}` },
          { label: "ARR", value: `$${data.arr.toLocaleString()}` },
          { label: "Paying Clients", value: data.payingClients },
          { label: "Non-Paying Clients", value: data.nonPayingClients },
          { label: "Growth Rate (30d)", value: `${data.growthRate}%` },
        ].map((metric, i) => (
          <Card
            key={metric.label}
            className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center transition-transform duration-200 hover:scale-105 hover:shadow-2xl group border border-[#23244a]"
          >
            <div className="text-base text-gray-400 mb-1 font-medium tracking-wide group-hover:text-gold-400 transition-colors">
              {metric.label}
            </div>
            <div className="text-3xl font-extrabold text-white group-hover:text-gold-400 transition-colors drop-shadow">
              {metric.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Bar Chart Section */}
      <div className="bg-[#1a1c3a] glass rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Clients by Package</h2>
        <div className="w-full max-w-2xl mx-auto">
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} layout="vertical" margin={{ left: 40, right: 40, top: 10, bottom: 10 }}>
                <XAxis type="number" stroke="#F2C94C" tick={{ fill: '#fff', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#F2C94C" tick={{ fill: '#fff', fontWeight: 600 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip
                  contentStyle={{ background: '#10122b', border: '1px solid #F2C94C', color: '#fff', borderRadius: 8 }}
                  labelStyle={{ color: '#F2C94C', fontWeight: 700 }}
                  cursor={{ fill: '#F2C94C', fillOpacity: 0.1 }}
                />
                <Legend
                  wrapperStyle={{ color: '#fff', fontWeight: 600 }}
                  iconType="rect"
                  formatter={(value: string) => <span className="text-gold-400 font-semibold">{value}</span>}
                />
                <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                  {barData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [lastUpdated, setLastUpdated] = React.useState<string>("");
  useEffect(() => {
    setLastUpdated(formatDate(new Date()));
  }, []);
  return (
    <PasswordProtection>
      <div className="flex h-screen bg-gradient-to-br from-[#010124] via-[#0a0a2a] to-[#1a1a40]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-7xl mx-auto">
            <AnalyticsDashboard lastUpdated={lastUpdated} />
          </div>
        </main>
      </div>
    </PasswordProtection>
  );
} 