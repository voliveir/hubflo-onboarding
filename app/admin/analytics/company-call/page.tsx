"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Loader2, Users, DollarSign, Award, Calendar } from "lucide-react";
import { PieChart, Pie, Cell as PieCell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { AdminSidebar } from "@/components/admin-sidebar";
import { PasswordProtection } from "@/components/password-protection";

function getPreviousMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function billingLabel(b: string) {
  const v = (b || '').toLowerCase();
  if (v === 'annually' || v === 'yearly') return 'Annual';
  if (v === 'quarterly') return 'Quarterly';
  if (v === 'monthly') return 'Monthly';
  return b || 'Unknown';
}

const PACKAGE_COLORS: Record<string, string> = {
  light: "#F2C94C",
  premium: "#F2994A",
  gold: "#E67E22",
  elite: "#060520",
  starter: "#95a5a6",
  professional: "#3498db",
  enterprise: "#9b59b6",
  pilot: "#1abc9c",
  unknown: "#bdc3c7",
};

export default function ImplementationReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportMonth, setReportMonth] = useState<string>(() => getPreviousMonth());

  const monthOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      opts.push({
        value: val,
        label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      });
    }
    return opts;
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("report_month", reportMonth);
    fetch(`/api/analytics-summary?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load implementation report.");
        setLoading(false);
      });
  }, [reportMonth]);

  const monthly = data?.monthlyReport;

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8 max-w-6xl mx-auto">
            <section className="rounded-3xl overflow-hidden border-2 border-[#060520]/10 shadow-2xl bg-gradient-to-br from-white via-amber-50/30 to-white">
              <div className="p-8 lg:p-12" style={{ background: "linear-gradient(180deg, rgba(236,178,45,0.08) 0%, transparent 50%)" }}>
                <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-6 h-6 text-brand-gold" />
                      <span className="text-sm font-semibold uppercase tracking-widest text-brand-gold/90">Monthly Company Call</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-[#060520]">Implementation Report</h1>
                  </div>
                  <select
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border-2 border-[#060520]/20 bg-white font-medium text-[#060520] focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                  >
                    {monthOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {error ? (
                  <p className="text-red-600 py-8 text-center">{error}</p>
                ) : monthly ? (
                  <div className="space-y-8">
                    {/* Key metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      <div className="relative overflow-hidden rounded-2xl bg-white border border-[#060520]/10 p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-xl bg-amber-100">
                            <Users className="w-5 h-5 text-amber-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-600">Clients Added</span>
                        </div>
                        <p className="text-4xl lg:text-5xl font-extrabold text-[#060520]">{monthly.clientsAdded}</p>
                      </div>
                      <div className="relative overflow-hidden rounded-2xl bg-white border border-[#060520]/10 p-6 shadow-lg hover:shadow-xl transition-shadow min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-xl bg-emerald-100">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-600">New ARR</span>
                        </div>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-emerald-700 leading-tight break-words">${Math.round(monthly.arrFromNewClients).toLocaleString()}</p>
                      </div>
                      <div className="relative overflow-hidden rounded-2xl bg-white border border-[#060520]/10 p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-xl bg-violet-100">
                            <Award className="w-5 h-5 text-violet-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-600">Graduations</span>
                        </div>
                        <p className="text-4xl lg:text-5xl font-extrabold text-violet-700">{monthly.graduationsInMonth}</p>
                      </div>
                      <div className="relative overflow-hidden rounded-2xl bg-white border border-[#060520]/10 p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-xl bg-amber-100">
                            <span className="text-lg font-bold">📊</span>
                          </div>
                          <span className="text-sm font-medium text-slate-600">Avg ARR / Client</span>
                        </div>
                        <p className="text-4xl lg:text-5xl font-extrabold text-[#060520]">
                          {monthly.clientsAdded > 0
                            ? `$${Math.round(monthly.arrFromNewClients / monthly.clientsAdded).toLocaleString()}`
                            : "$0"}
                        </p>
                      </div>
                    </div>

                    {/* Package breakdown + Client list */}
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="rounded-2xl bg-white border border-[#060520]/10 p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-[#060520] mb-4">Clients by Package</h3>
                        {Object.keys(monthly.packageBreakdown).length > 0 ? (
                          <div className="flex flex-col gap-4">
                            <div className="h-48 lg:h-56">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={Object.entries(monthly.packageBreakdown).map(([pkgKey, v]) => ({
                                      name: pkgKey.charAt(0).toUpperCase() + pkgKey.slice(1),
                                      pkgKey,
                                      value: v.count,
                                      fill: PACKAGE_COLORS[pkgKey.toLowerCase()] || PACKAGE_COLORS.unknown,
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    nameKey="name"
                                  >
                                    {Object.entries(monthly.packageBreakdown).map(([pkgKey]) => (
                                      <PieCell key={pkgKey} stroke="white" strokeWidth={2} />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip
                                    formatter={(value: number, _name: string, props: any) => {
                                      const pkgKey = props.payload?.pkgKey || "";
                                      const arr = monthly.packageBreakdown[pkgKey]?.arr ?? 0;
                                      return [`${value} client${value !== 1 ? "s" : ""} · $${Math.round(arr).toLocaleString()} ARR`, props.payload?.name];
                                    }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {Object.entries(monthly.packageBreakdown)
                                .sort(([, a], [, b]) => b.count - a.count)
                                .map(([pkg, v]) => (
                                  <div key={pkg} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PACKAGE_COLORS[pkg.toLowerCase()] || PACKAGE_COLORS.unknown }} />
                                    <span className="font-medium text-[#060520] capitalize">{pkg}</span>
                                    <span className="text-slate-500 text-sm">{v.count} · ${Math.round(v.arr).toLocaleString()}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-500 py-8 text-center">No clients added this month</p>
                        )}
                      </div>

                      <div className="rounded-2xl bg-white border border-[#060520]/10 p-6 shadow-lg overflow-hidden">
                        <h3 className="text-lg font-bold text-[#060520] mb-4">New Clients</h3>
                        {monthly.clientsAddedList.length > 0 ? (
                          <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
                            {[...monthly.clientsAddedList]
                              .sort((a, b) => (b.revenue_amount || 0) - (a.revenue_amount || 0))
                              .map((client) => (
                              <div
                                key={client.id}
                                className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-slate-50/80 hover:bg-amber-50/80 border border-slate-100 transition-colors"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-[#060520] leading-tight">{client.name}</p>
                                  <p className="text-xs text-slate-500 capitalize">{client.success_package} · {client.plan_type} · {billingLabel(client.billing_type)}</p>
                                </div>
                                <p className="text-sm font-bold text-emerald-700">${Math.round(client.revenue_amount || 0).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 py-8 text-center">No clients added this month</p>
                        )}
                      </div>
                    </div>

                    {/* Graduations — who graduated and duration (sales close → first client) */}
                    {monthly.graduationsList && monthly.graduationsList.length > 0 && (
                      <div className="rounded-2xl bg-white border border-[#060520]/10 p-6 shadow-lg overflow-hidden">
                        <h3 className="text-lg font-bold text-[#060520] mb-2">Graduations</h3>
                        <p className="text-sm text-slate-500 mb-4">Sales close → First client invited (business days)</p>
                        <div className="space-y-1">
                          {monthly.graduationsList.map((g) => (
                            <div
                              key={g.id}
                              className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-violet-50/80 hover:bg-violet-100/80 border border-violet-100 transition-colors"
                            >
                              <div>
                                <p className="text-sm font-semibold text-[#060520] leading-tight">{g.name}</p>
                                <p className="text-xs text-slate-500 capitalize">{g.success_package} · {billingLabel(g.billing_type)}</p>
                              </div>
                              <p className="text-sm font-bold text-violet-700">
                                {g.duration_days != null ? `${g.duration_days} days` : "—"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Plan Type + Billing Type breakdown */}
                    <div className="grid lg:grid-cols-2 gap-8">
                      {monthly.planTypeBreakdown && Object.keys(monthly.planTypeBreakdown).length > 0 && (
                        <div className="rounded-2xl bg-white border border-[#060520]/10 p-6 shadow-lg">
                          <h3 className="text-lg font-bold text-[#060520] mb-4">By Plan Type</h3>
                          <div className="flex flex-wrap gap-4">
                            {Object.entries(monthly.planTypeBreakdown)
                              .sort(([, a], [, b]) => b.arr - a.arr)
                              .map(([plan, v]) => (
                                <div key={plan} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                                  <span className="font-semibold text-[#060520] capitalize">{plan}</span>
                                  <span className="text-slate-600">{v.count} client{v.count !== 1 ? "s" : ""}</span>
                                  <span className="font-bold text-emerald-600">${Math.round(v.arr).toLocaleString()} ARR</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                      {monthly.billingTypeBreakdown && Object.keys(monthly.billingTypeBreakdown).length > 0 && (
                        <div className="rounded-2xl bg-white border border-[#060520]/10 p-6 shadow-lg">
                          <h3 className="text-lg font-bold text-[#060520] mb-4">By Billing Type</h3>
                          <div className="flex flex-wrap gap-4">
                            {Object.entries(monthly.billingTypeBreakdown)
                              .sort(([, a], [, b]) => b.arr - a.arr)
                              .map(([billing, v]) => (
                                <div key={billing} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                                  <span className="font-semibold text-[#060520]">{billingLabel(billing)}</span>
                                  <span className="text-slate-600">{v.count} client{v.count !== 1 ? "s" : ""}</span>
                                  <span className="font-bold text-emerald-600">${Math.round(v.arr).toLocaleString()} ARR</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="text-center">
                      <p className="text-sm text-slate-500">
                        Hubflo Implementation Metrics · {monthly.monthName} {monthly.year}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-gold mx-auto mb-4" />
                    <p className="text-slate-500">Loading implementation report…</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </PasswordProtection>
  );
}
