"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { Loader2, Download, RefreshCw, HelpCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { AdminSidebar } from "@/components/admin-sidebar";
import { PasswordProtection } from "@/components/password-protection";
import { PieChart, Pie, Legend as RechartsLegend } from "recharts";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

const BAR_COLORS = ["#F2C94C", "#F2994A", "#0a0b1a", "#10122b", "#1a1c3a"];

function formatDate(date: Date) {
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

const PLAN_TYPES = ["pro", "business", "unlimited"];
const SUCCESS_PACKAGES = ["light", "premium", "gold", "elite", "starter", "professional", "enterprise", "pilot"];
const STATUSES = ["active", "draft", "archived", "completed"];
const IMPLEMENTATION_MANAGERS = ["vanessa", "vishal"];

const AnalyticsDashboard = ({ lastUpdated }: { lastUpdated: string }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    plan_type: "",
    success_package: "",
    implementation_manager: "",
    status: "",
  });
  // Move modal state hooks here
  const [selectedStage, setSelectedStage] = useState<number|null>(null);
  const [showModal, setShowModal] = useState(false);
  // 1. Add state for metric explanation modal
  const [openMetricModal, setOpenMetricModal] = useState<string | null>(null);
  // 2. Add state for churn risk clients modal
  const [showChurnRiskModal, setShowChurnRiskModal] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    fetch(`/api/analytics-summary${params.toString() ? `?${params.toString()}` : ""}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load analytics.");
        setLoading(false);
      });
  }, [filters]);

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

  // Filter UI
  const filterOptions = useMemo(() => ([
    {
      label: "Plan Type",
      key: "plan_type",
      options: ["", ...PLAN_TYPES],
    },
    {
      label: "Success Package",
      key: "success_package",
      options: ["", ...SUCCESS_PACKAGES],
    },
    {
      label: "Implementation Manager",
      key: "implementation_manager",
      options: ["", ...IMPLEMENTATION_MANAGERS],
    },
    {
      label: "Status",
      key: "status",
      options: ["", ...STATUSES],
    },
  ]), []);

  // 2. Metric explanations mapping
  const metricExplanations: Record<string, { name: string; description: string; logic: string }> = {
    totalClients: {
      name: 'Total Clients',
      description: 'The total number of clients in the system.',
      logic: 'Counts all client records, regardless of status or plan.'
    },
    payingClients: {
      name: 'Paying Clients',
      description: 'Clients with an active paid subscription.',
      logic: 'Counts clients whose billing type or plan indicates they are paying.'
    },
    mrr: {
      name: 'MRR (Monthly Recurring Revenue)',
      description: 'The amount of recurring revenue you expect to receive each month.',
      logic: 'MRR = Total Annual Revenue (ARR) divided by 12.'
    },
    arr: {
      name: 'ARR (Annual Recurring Revenue)',
      description: 'The total recurring revenue you expect to receive in a year.',
      logic: 'ARR = Sum of all client revenue amounts (provided by sales as total annual revenue).'
    },
    growthRate: {
      name: 'Growth Rate (30d)',
      description: 'The percentage increase in total clients over the last 30 days.',
      logic: 'Growth Rate = (Clients now - Clients 30 days ago) / Clients 30 days ago x 100.'
    },
    totalRevenue: {
      name: 'Total Revenue',
      description: 'The sum of all revenue amounts from all clients.',
      logic: 'Adds up the revenue_amount field for every client.'
    },
    churnedClients: {
      name: 'Churned Clients',
      description: 'The number of clients marked as churned (no longer active customers).',
      logic: 'Counts clients where the churned field is true.'
    },
    churnRate: {
      name: 'Churn Rate',
      description: 'The percentage of all clients who have churned.',
      logic: 'Churn Rate = (Churned Clients / Total Clients) x 100.'
    },
    timeToFirstValue: {
      name: 'Time to First Value',
      description: 'The average number of days from client signup to their first onboarding milestone (e.g., first call).',
      logic: 'For each client, calculates days between created_at and their first onboarding call date, then averages across all clients.'
    },
    avgOnboardingDuration: {
      name: 'Avg. Onboarding Duration',
      description: 'The average time it takes for clients to complete onboarding.',
      logic: 'For each client, calculates days between created_at and graduation_date, then averages across all clients who have graduated.'
    },
    activeImplementations: {
      name: 'Active Implementations',
      description: 'The number of clients currently in the onboarding process.',
      logic: 'Counts clients who do not have a graduation_date (i.e., onboarding not completed).'
    },
    atRiskClients: {
      name: 'At-Risk Clients',
      description: 'Clients who are at risk of churn or onboarding failure.',
      logic: 'Clients who have not had their first onboarding call within 10 days of signup, or clients who have not completed onboarding after 45 days.'
    },
    expiringContracts: {
      name: 'Expiring Contracts (90d)',
      description: 'Clients with contracts ending in the next 90 days.',
      logic: 'Counts clients whose contract end date is within 90 days from today.'
    },
    revenueAtRisk: {
      name: 'Revenue at Risk (90d)',
      description: 'The total revenue from contracts expiring in the next 90 days.',
      logic: 'Sums the revenue amounts for clients with contracts expiring in the next 90 days.'
    },
    avgEngagementScore: {
      name: 'Avg. Engagement Score',
      description: 'The average engagement score across all clients.',
      logic: 'For each client, calculates a score based on calls completed, forms setup, Zapier integrations, and project completion percentage (each normalized 0–1, then averaged and scaled to 0–100). Averages these scores across all clients.'
    },
    lowEngagementClients: {
      name: 'Low Engagement Clients',
      description: 'The number of clients with low engagement.',
      logic: 'Counts clients whose engagement score is below 40.'
    },
    engagementDistribution: {
      name: 'Engagement Distribution',
      description: 'Shows how many clients fall into each engagement score range (e.g., 0–20, 20–40, etc.).',
      logic: 'Buckets clients by their engagement score.'
    },
    topRevenuePlan: {
      name: 'Top Revenue Plan',
      description: 'The plan type generating the most revenue.',
      logic: 'Finds the plan with the highest total revenue across all clients.'
    },
    topRevenuePackage: {
      name: 'Highest Revenue Package',
      description: 'The success package with the highest total revenue.',
      logic: 'Finds the package with the highest total revenue across all clients.'
    },
    revenueByPlan: {
      name: 'Revenue by Plan Type',
      description: 'Visual breakdown of revenue by plan type.',
      logic: 'Sums revenue for each plan.'
    },
    revenueByBilling: {
      name: 'Revenue by Billing Type',
      description: 'Visual breakdown of revenue by billing type.',
      logic: 'Sums revenue for each billing type.'
    },
    revenueByPackage: {
      name: 'Revenue by Success Package',
      description: 'Visual breakdown of revenue by success package.',
      logic: 'Sums revenue for each package.'
    },
    avgUsersPerClient: {
      name: 'Avg. Users per Client',
      description: 'The average number of users per client account.',
      logic: 'Calculated by averaging the number_of_users field across all clients.'
    },
    churnRiskClients: {
      name: 'Churn Risk Clients',
      description: 'Number of clients currently marked as at risk of churn by an implementation manager.',
      logic: 'Implementation managers can manually toggle churn risk for any client. This metric counts all non-churned, non-demo clients with churn risk enabled.'
    },
  };

  // 3. Metric explanation modal component
  function MetricExplanationModal({ open, onClose, metricKey }: { open: boolean, onClose: () => void, metricKey: string | null }) {
    if (!open || !metricKey) return null;
    const metric = metricExplanations[metricKey];
    if (!metric) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-[#181a2f] rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gold-400">×</button>
          <h3 className="text-xl font-bold text-white mb-2">{metric.name}</h3>
          <p className="text-white mb-2">{metric.description}</p>
          <div className="text-white font-mono text-sm whitespace-pre-line">{metric.logic}</div>
        </div>
      </div>
    );
  }

  // 4. Churn Risk Clients Modal component
  function ChurnRiskClientsModal({ open, onClose, clients }: { open: boolean, onClose: () => void, clients: any[] }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-[#181a2f] rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gold-400">×</button>
          <h3 className="text-xl font-bold text-white mb-4">Churn Risk Clients</h3>
          <table className="min-w-full text-white">
            <thead>
              <tr className="border-b border-[#23244a]">
                <th className="py-2 px-3 text-left">Name</th>
                <th className="py-2 px-3 text-left">Implementation Manager</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr><td colSpan={2} className="py-4 text-center text-slate-400">No clients at risk of churn.</td></tr>
              ) : (
                clients.map((client, idx) => (
                  <tr key={client.id} className="border-b border-[#23244a] hover:bg-[#23244a]/40">
                    <td className="py-2 px-3">{client.name}</td>
                    <td className="py-2 px-3">{client.implementation_manager ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

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

  // Section 1: Implementation Health Metric Cards (live data)
  const implementationMetrics = [
    { label: "Time to First Value", value: data.implementationHealth?.timeToFirstValue !== null ? `${data.implementationHealth?.timeToFirstValue} days` : "-" },
    { label: "Avg. Onboarding Duration", value: data.implementationHealth?.avgOnboardingDuration !== null ? `${data.implementationHealth?.avgOnboardingDuration} days` : "-" },
    { label: "Active Implementations", value: data.implementationHealth?.activeImplementations ?? "-" },
    { label: "At-Risk Clients", value: data.implementationHealth?.atRiskClients ?? "-", highlight: true },
  ];

  // Section 2: Gantt Chart live data
  const ganttClients = (data.clients || []).map((client: any) => {
    return {
      name: client.name,
      package: client.success_package,
      date_created: client.created_at,
      light_onboarding_call_date: client.light_onboarding_call_date ?? null,
      premium_first_call_date: client.premium_first_call_date ?? null,
      premium_second_call_date: client.premium_second_call_date ?? null,
      gold_first_call_date: client.gold_first_call_date ?? null,
      gold_second_call_date: client.gold_second_call_date ?? null,
      gold_third_call_date: client.gold_third_call_date ?? null,
      graduation_date: client.graduation_date ?? null,
      elite_verification_completed_date: client.elite_verification_completed_date ?? null,
      elite_configurations_started_date: client.elite_configurations_started_date ?? null,
      elite_integrations_started_date: client.elite_integrations_started_date ?? null,
    };
  });

  // Section 3: Funnel Chart live data
  // Calculate funnel stages based on onboarding call/graduation fields
  const funnelStages = [
    { stage: "Not Started", count: 0 },
    { stage: "Kickoff Complete", count: 0 },
    { stage: "Mid-Onboarding", count: 0 },
    { stage: "Completed", count: 0 },
  ];
  // 1. Track clients for each funnel stage
  const notStartedClients: any[] = [];
  const kickoffCompleteClients: any[] = [];
  const midOnboardingClients: any[] = [];
  const completedClients: any[] = [];
  ganttClients.forEach((client: any) => {
    if (client.package === "elite") {
      if (client.graduation_date) {
        completedClients.push(client);
      } else if (client.elite_verification_completed_date) {
        midOnboardingClients.push(client);
      } else if (client.elite_configurations_started_date || client.elite_integrations_started_date) {
        kickoffCompleteClients.push(client);
      } else {
        notStartedClients.push(client);
      }
    } else if (client.graduation_date) {
      completedClients.push(client);
    } else if (client.package === "gold" && client.gold_second_call_date) {
      midOnboardingClients.push(client);
    } else if (client.package === "premium" && client.premium_second_call_date) {
      midOnboardingClients.push(client);
    } else if (client.package === "gold" && client.gold_first_call_date) {
      kickoffCompleteClients.push(client);
    } else if (client.package === "premium" && client.premium_first_call_date) {
      kickoffCompleteClients.push(client);
    } else if (client.package === "light" && client.light_onboarding_call_date) {
      kickoffCompleteClients.push(client);
    } else {
      notStartedClients.push(client);
    }
  });
  // After populating the arrays, update the funnelStages counts
  funnelStages[0].count = notStartedClients.length;
  funnelStages[1].count = kickoffCompleteClients.length;
  funnelStages[2].count = midOnboardingClients.length;
  funnelStages[3].count = completedClients.length;
  const funnelStageClients = [notStartedClients, kickoffCompleteClients, midOnboardingClients, completedClients];

  // 2. Add state for modal
  // const [selectedStage, setSelectedStage] = useState<number|null>(null);
  // const [showModal, setShowModal] = useState(false);

  // 3. Modal component (simple custom modal)
  function FunnelClientsModal({ open, onClose, clients, stage }: { open: boolean, onClose: () => void, clients: any[], stage: string }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-[#181a2f] rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gold-400">×</button>
          <h3 className="text-xl font-bold text-white mb-4">Clients: {stage}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-white">
              <thead>
                <tr className="border-b border-[#23244a]">
                  <th className="py-2 px-3 text-left">Name</th>
                  <th className="py-2 px-3 text-left">Package</th>
                  <th className="py-2 px-3 text-left">Created Date</th>
                  <th className="py-2 px-3 text-left">Implementation Manager</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-center text-slate-400">No clients in this stage.</td></tr>
                ) : (
                  clients.map((client, idx) => (
                    <tr key={idx} className="border-b border-[#23244a] hover:bg-[#23244a]/40">
                      <td className="py-2 px-3">{client.name}</td>
                      <td className="py-2 px-3 capitalize">{client.package}</td>
                      <td className="py-2 px-3">{client.date_created ? new Date(client.date_created).toLocaleDateString() : '-'}</td>
                      <td className="py-2 px-3">{client.implementation_manager ?? '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      {/* Header */}
      <div className="flex flex-wrap gap-4 mb-8 items-end">
        {filterOptions.map((filter) => (
          <div key={filter.key} className="flex flex-col">
            <label className="text-xs text-white mb-1 font-medium">{filter.label}</label>
            <select
              className="bg-[#181a2f] text-white rounded-lg px-3 py-2 border border-[#23244a] focus:outline-none focus:ring-2 focus:ring-gold-400"
              value={filters[filter.key as keyof typeof filters]}
              onChange={e => handleFilterChange(filter.key, e.target.value)}
            >
              {filter.options.map(opt => (
                <option key={opt} value={opt}>{opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : "All"}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
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
          <div className="flex items-center gap-2 text-sm text-white bg-[#10122b] px-3 py-1.5 rounded-lg shadow">
            <RefreshCw className="w-4 h-4 text-gold-400" />
            Last updated: <span className="ml-1 font-medium text-white">{lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* SECTION A: Business Overview */}
      <div className="py-10">
        <h2 className="text-2xl font-bold text-white mb-4">💼 Business Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="text-base text-white mb-1 font-medium">
              <div className="flex items-center gap-1">
                <span>Total Clients</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-gold-400 cursor-pointer"
                        onClick={() => setOpenMetricModal('totalClients')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">Number of all clients in the system.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{data.totalClients}</div>
          </Card>
          <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="text-base text-white mb-1 font-medium">
              <div className="flex items-center gap-1">
                <span>MRR</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-gold-400 cursor-pointer"
                        onClick={() => setOpenMetricModal('mrr')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">Monthly Recurring Revenue from all active subscriptions.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">${data.mrr?.toLocaleString()}</div>
          </Card>
          <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="text-base text-white mb-1 font-medium">
              <div className="flex items-center gap-1">
                <span>ARR</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-gold-400 cursor-pointer"
                        onClick={() => setOpenMetricModal('arr')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">Annual Recurring Revenue, calculated as MRR x 12.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">${data.arr?.toLocaleString()}</div>
          </Card>
          <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="text-base text-white mb-1 font-medium">
              <div className="flex items-center gap-1">
                <span>Growth Rate (30d)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-gold-400 cursor-pointer"
                        onClick={() => setOpenMetricModal('growthRate')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">Percentage increase in total clients over the last 30 days.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{data.growthRate}%</div>
          </Card>
          <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="text-base text-white mb-1 font-medium">
              <div className="flex items-center gap-1">
                <span>Total Revenue</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-gold-400 cursor-pointer"
                        onClick={() => setOpenMetricModal('totalRevenue')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">Total revenue generated from all clients.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">${data.revenue?.total?.toLocaleString() ?? '-'}</div>
          </Card>
          <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="flex items-center gap-1 text-base text-white mb-1 font-medium">
              <span>Churned Clients</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle
                      className="w-4 h-4 text-gold-400 cursor-pointer"
                      onClick={() => setOpenMetricModal('churnedClients')}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">Number of clients marked as churned (no longer active customers).</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-3xl font-extrabold text-white">{data.churnedClients ?? '-'}</div>
          </Card>
          <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="flex items-center gap-1 text-base text-white mb-1 font-medium">
              <span>Churn Rate</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle
                      className="w-4 h-4 text-gold-400 cursor-pointer"
                      onClick={() => setOpenMetricModal('churnRate')}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">Percentage of all clients who have churned (no longer active customers).</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-3xl font-extrabold text-white">{data.totalClients ? `${((data.churnedClients / data.totalClients) * 100).toFixed(1)}%` : '-'}</div>
          </Card>
          {/* TODO: If data.churnedClients is not available, update the backend analytics API to include it. */}
          <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="flex items-center gap-1 text-base text-white mb-1 font-medium">
              <span>Avg. Users per Client</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle
                      className="w-4 h-4 text-gold-400 cursor-pointer"
                      onClick={() => setOpenMetricModal('avgUsersPerClient')}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">The average number of users per client account.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-3xl font-extrabold text-white">{data.avgUsersPerClient ? data.avgUsersPerClient.toFixed(1) : '-'}</div>
          </Card>
          <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a] cursor-pointer" onClick={() => setShowChurnRiskModal(true)}>
            <div className="flex items-center gap-1 text-base text-white mb-1 font-medium">
              <span>Churn Risk Clients</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-gold-400 cursor-pointer" onClick={e => { e.stopPropagation(); setOpenMetricModal('churnRiskClients'); }} />
                  </TooltipTrigger>
                  <TooltipContent side="top">Number of clients currently marked as at risk of churn.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-3xl font-extrabold text-white">{data.churnRiskClients ?? '-'}</div>
          </Card>
        </div>
        <div className="text-xs text-white mb-10">Last updated: {lastUpdated}</div>
      </div>

      {/* SECTION B: Onboarding Progress & Health */}
      <div className="py-10">
        <h2 className="text-2xl font-bold text-white mb-4">🚀 Onboarding Progress & Health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-[#181a2f] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="text-base text-white mb-1 font-medium">
              <div className="flex items-center gap-1">
                <span>Time to First Value</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-gold-400 cursor-pointer"
                        onClick={() => setOpenMetricModal('timeToFirstValue')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">Average days from signup to first successful onboarding milestone.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{data.implementationHealth?.timeToFirstValue !== null ? `${data.implementationHealth?.timeToFirstValue} days` : '-'}</div>
          </Card>
          <Card className="bg-[#181a2f] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="text-base text-white mb-1 font-medium">
              <div className="flex items-center gap-1">
                <span>Avg. Onboarding Duration</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-gold-400 cursor-pointer"
                        onClick={() => setOpenMetricModal('avgOnboardingDuration')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">Average time to complete onboarding for all clients.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{data.implementationHealth?.avgOnboardingDuration !== null ? `${data.implementationHealth?.avgOnboardingDuration} days` : '-'}</div>
          </Card>
          <Card className="bg-[#181a2f] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="text-base text-white mb-1 font-medium">
              <div className="flex items-center gap-1">
                <span>Active Implementations</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-gold-400 cursor-pointer"
                        onClick={() => setOpenMetricModal('activeImplementations')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">Clients currently in the onboarding process.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{data.implementationHealth?.activeImplementations ?? '-'}</div>
          </Card>
          <Card className="bg-[#181a2f] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a] border-yellow-400 bg-yellow-900/30">
            <div className="text-base text-white mb-1 font-medium">
              <div className="flex items-center gap-1">
                <span>At-Risk Clients</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-gold-400 cursor-pointer"
                        onClick={() => setOpenMetricModal('atRiskClients')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">Clients flagged as at risk of churn or onboarding failure.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-yellow-300">{data.implementationHealth?.atRiskClients ?? '-'}</div>
          </Card>
          <Card className="bg-[#181a2f] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="text-base text-white mb-1 font-medium">
              <div className="flex items-center gap-1">
                <span>Expiring Contracts (90d)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-gold-400 cursor-pointer"
                        onClick={() => setOpenMetricModal('expiringContracts')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">Clients with contracts ending in the next 90 days.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{data.contractRenewal?.expiring90?.length ?? '-'}</div>
          </Card>
          <Card className="bg-[#181a2f] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="text-base text-white mb-1 font-medium">
              <div className="flex items-center gap-1">
                <span>Revenue at Risk (90d)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-gold-400 cursor-pointer"
                        onClick={() => setOpenMetricModal('revenueAtRisk')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">Total revenue from contracts expiring in the next 90 days.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className={`text-3xl font-extrabold ${data.contractRenewal?.revenueAtRisk ? 'text-red-400' : 'text-white'}`}>${data.contractRenewal?.revenueAtRisk?.toLocaleString() ?? '-'}</div>
          </Card>
        </div>
        <div className="text-xs text-white mb-10">Last updated: {lastUpdated}</div>
        {/* Gantt Chart Section */}
        <div className="bg-[#1a1c3a] glass rounded-2xl p-8 shadow-2xl mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Onboarding Timeline (Gantt)</h2>
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[700px]">
              {/* Gantt chart mockup: each client as a row, bars for each stage */}
              {ganttClients.map((client: any, idx: number) => {
                // Build stages array for this client
                let stages: { label: string; date: string | null }[] = [];
                if (client.package === "light") {
                  stages = [
                    { label: "Onboarding Call", date: client.light_onboarding_call_date ?? null },
                  ];
                } else if (client.package === "premium") {
                  stages = [
                    { label: "First Call", date: client.premium_first_call_date ?? null },
                    { label: "Second Call", date: client.premium_second_call_date ?? null },
                  ];
                } else if (client.package === "gold") {
                  stages = [
                    { label: "First Call", date: client.gold_first_call_date ?? null },
                    { label: "Second Call", date: client.gold_second_call_date ?? null },
                    { label: "Third Call", date: client.gold_third_call_date ?? null },
                  ];
                }
                // Timeline: from date_created to completed_date or today
                const start = new Date(client.date_created);
                const end = client.graduation_date ? new Date(client.graduation_date) : new Date();
                const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                // For each stage, calculate offset and width
                let prevDate = start;
                return (
                  <div key={client.name} className="flex items-center mb-4">
                    <div className="w-40 text-sm text-white font-semibold truncate pr-2">{client.name}</div>
                    <div className="flex-1 flex items-center relative h-8">
                      {stages.map((stage, sIdx) => {
                        const stageDate = stage.date ? new Date(stage.date) : null;
                        const offsetDays = Math.round((stageDate ? (stageDate.getTime() - start.getTime()) : 0) / (1000 * 60 * 60 * 24));
                        const widthDays = stageDate ? Math.max(1, Math.round((stageDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
                        const leftPercent = (offsetDays / totalDays) * 100;
                        const widthPercent = (widthDays / totalDays) * 100;
                        const isPending = !stage.date;
                        const color = isPending ? 'bg-gray-700 border-dashed border-2 border-gray-400' : 'bg-gold-400';
                        const tooltip = isPending ? 'Pending' : `${stage.label}: ${stage.date}`;
                        if (stageDate) prevDate = stageDate;
                        return (
                          <div
                            key={stage.label}
                            className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-full ${color} flex items-center justify-center transition-all`}
                            style={{ left: `${leftPercent}%`, width: `${widthPercent}%`, minWidth: 24, zIndex: 2 }}
                            title={tooltip}
                          >
                            <span className="text-xs font-bold text-[#10122b] px-2 select-none">{stage.label}</span>
                          </div>
                        );
                      })}
                      {/* End bar: from last stage to end */}
                      {(() => {
                        const lastStage = stages.filter(s => s.date).slice(-1)[0];
                        const lastDate = lastStage && lastStage.date ? new Date(lastStage.date) : start;
                        const widthDays = Math.max(1, Math.round((end.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)));
                        const leftPercent = ((lastDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100;
                        const widthPercent = (widthDays / totalDays) * 100;
                        const isPending = !client.graduation_date;
                        const color = isPending ? 'bg-gray-700 border-dashed border-2 border-gray-400' : 'bg-green-400';
                        const tooltip = isPending ? 'Pending Completion' : `Completed: ${client.graduation_date}`;
                        return (
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-full ${color} flex items-center justify-center transition-all`}
                            style={{ left: `${leftPercent}%`, width: `${widthPercent}%`, minWidth: 24, zIndex: 1 }}
                            title={tooltip}
                          >
                            <span className="text-xs font-bold text-[#10122b] px-2 select-none">{isPending ? 'Pending' : 'Completed'}</span>
                          </div>
                        );
                      })()}
                      {/* Timeline axis */}
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-800 rounded-full z-0" />
                    </div>
                    <div className="w-28 text-xs text-white pl-2 text-right">{client.date_created} → {client.graduation_date || 'Present'}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-xs text-white mt-4">Last updated: {lastUpdated}</div>
        </div>
        {/* Funnel Chart Section */}
        <div className="bg-[#1a1c3a] glass rounded-2xl p-8 shadow-2xl mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Onboarding Funnel</h2>
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center w-40">
              {funnelStages.map((stage, idx) => (
                <div key={stage.stage} className="flex flex-col items-center w-full mb-4">
                  <button
                    className={`w-full py-2 rounded-full text-center text-2xl font-bold mb-2 shadow-md focus:outline-none focus:ring-2 focus:ring-gold-400 transition ${idx === funnelStages.length - 1 ? 'bg-green-500 text-white' : 'bg-[#23244a] text-white'} hover:scale-105`}
                    onClick={() => { setSelectedStage(idx); setShowModal(true); }}
                    title={`View clients in ${stage.stage}`}
                    type="button"
                  >
                    {stage.count}
                  </button>
                  <span className="px-3 py-1 rounded-full bg-[#23244a] text-white text-sm font-semibold shadow">{stage.stage}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-white mt-4">Last updated: {lastUpdated}</div>
          {/* Modal for clients in selected stage */}
          <FunnelClientsModal
            open={showModal && selectedStage !== null}
            onClose={() => setShowModal(false)}
            clients={selectedStage !== null ? funnelStageClients[selectedStage] : []}
            stage={selectedStage !== null ? funnelStages[selectedStage].stage : ''}
          />
        </div>
      </div>

      {/* SECTION C: Client Engagement */}
      <div className="py-10">
        <h2 className="text-2xl font-bold text-white mb-4">📈 Client Engagement</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="text-base text-white mb-1 font-medium">
              <div className="flex items-center gap-1">
                <span>Avg. Engagement Score</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-gold-400 cursor-pointer"
                        onClick={() => setOpenMetricModal('avgEngagementScore')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">Average engagement score across all clients.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{data.engagement?.avgScore ?? '-'}</div>
          </Card>
          <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="text-base text-white mb-1 font-medium">
              <div className="flex items-center gap-1">
                <span>Low Engagement Clients</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-gold-400 cursor-pointer"
                        onClick={() => setOpenMetricModal('lowEngagementClients')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">Number of clients with low engagement scores.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{data.engagement?.lowEngagementClients?.length ?? '-'}</div>
          </Card>
        </div>
        {/* Engagement Distribution Bar Chart */}
        <div className="bg-[#1a1c3a] glass rounded-2xl p-8 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Engagement Distribution</h2>
          <div className="w-full max-w-2xl mx-auto">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.engagement?.distribution || []}>
                  <XAxis dataKey="range" stroke="#F2C94C" tick={{ fill: '#fff', fontWeight: 600 }} />
                  <YAxis stroke="#F2C94C" tick={{ fill: '#fff', fontWeight: 600 }} />
                  <RechartsTooltip contentStyle={{ background: '#10122b', border: '1px solid #F2C94C', color: '#fff', borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#F2C94C" radius={[8, 8, 8, 8]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
        {/* Low Engagement Clients Table */}
        <div className="bg-[#1a1c3a] glass rounded-2xl p-8 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Lowest Engagement Clients</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-white">
              <thead>
                <tr>
                  <th className="px-4 py-2">Client</th>
                  <th className="px-4 py-2">Score</th>
                  <th className="px-4 py-2">Manager</th>
                </tr>
              </thead>
              <tbody>
                {(data.engagement?.lowEngagementClients || []).map((c: any) => (
                  <tr key={c.id} className="border-b border-[#23244a]">
                    <td className="px-4 py-2">{c.name}</td>
                    <td className="px-4 py-2">{c.score}</td>
                    <td className="px-4 py-2">{c.implementation_manager}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="text-xs text-white mt-4">Last updated: {lastUpdated}</div>
      </div>

      {/* SECTION D: Revenue Breakdown */}
      <div className="py-10">
        <h2 className="text-2xl font-bold text-white mb-4">💰 Revenue Breakdown</h2>
        {/* Revenue by Plan Type Bar Chart */}
        <div className="bg-[#1a1c3a] glass rounded-2xl p-8 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Revenue by Plan Type</h2>
          <div className="w-full max-w-2xl mx-auto">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(data.revenue?.byPlan || {}).map(([k, v]) => ({ name: k, value: v }))}>
                  <XAxis dataKey="name" stroke="#F2C94C" tick={{ fill: '#fff', fontWeight: 600 }} />
                  <YAxis stroke="#F2C94C" tick={{ fill: '#fff', fontWeight: 600 }} />
                  <RechartsTooltip contentStyle={{ background: '#10122b', border: '1px solid #F2C94C', color: '#fff', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#F2C94C" radius={[8, 8, 8, 8]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
        {/* Revenue by Billing Type Pie Chart */}
        <div className="bg-[#1a1c3a] glass rounded-2xl p-8 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Revenue by Billing Type</h2>
          <div className="w-full max-w-xl mx-auto">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(data.revenue?.byBilling || {}).map(([k, v]) => ({ name: k, value: v }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {Object.keys(data.revenue?.byBilling || {}).map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={["#F2C94C", "#F2994A", "#0a0b1a", "#10122b", "#1a1c3a"][idx % 5]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <RechartsLegend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
        {/* Revenue by Success Package Bar Chart */}
        <div className="bg-[#1a1c3a] glass rounded-2xl p-8 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Revenue by Success Package</h2>
          <div className="w-full max-w-2xl mx-auto">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(data.revenue?.byPackage || {}).map(([k, v]) => ({ name: k, value: v }))}>
                  <XAxis dataKey="name" stroke="#F2C94C" tick={{ fill: '#fff', fontWeight: 600 }} />
                  <YAxis stroke="#F2C94C" tick={{ fill: '#fff', fontWeight: 600 }} />
                  <RechartsTooltip contentStyle={{ background: '#10122b', border: '1px solid #F2C94C', color: '#fff', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#F2994A" radius={[8, 8, 8, 8]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="text-base text-white mb-1 font-medium">
              <div className="flex items-center gap-1">
                <span>Top Revenue Plan</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-gold-400 cursor-pointer"
                        onClick={() => setOpenMetricModal('topRevenuePlan')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">Plan type generating the most revenue.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{data.revenue?.topRevenuePlan ?? '-'}</div>
          </Card>
          <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
            <div className="text-base text-white mb-1 font-medium">
              <div className="flex items-center gap-1">
                <span>Highest Revenue Package</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-gold-400 cursor-pointer"
                        onClick={() => setOpenMetricModal('topRevenuePackage')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">Success package with the highest total revenue.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{data.revenue?.topRevenuePackage ?? '-'}</div>
          </Card>
        </div>
        <div className="text-xs text-white mt-4">Last updated: {lastUpdated}</div>
      </div>

      {/* Contract Renewal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
          <div className="text-base text-white mb-1 font-medium">
            <div className="flex items-center gap-1">
              <span>Contracts Expiring in 30 Days</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle
                      className="w-4 h-4 text-gold-400 cursor-pointer"
                      onClick={() => setOpenMetricModal('expiringContracts')}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">Clients with contracts expiring in the next 30 days.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-yellow-300">{data.contractRenewal?.expiring30?.length ?? '-'}</div>
        </Card>
        <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
          <div className="text-base text-white mb-1 font-medium">
            <div className="flex items-center gap-1">
              <span>Contracts Expiring in 60 Days</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle
                      className="w-4 h-4 text-gold-400 cursor-pointer"
                      onClick={() => setOpenMetricModal('expiringContracts')}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">Clients with contracts expiring in the next 60 days.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-yellow-300">{data.contractRenewal?.expiring60?.length ?? '-'}</div>
        </Card>
        <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
          <div className="text-base text-white mb-1 font-medium">
            <div className="flex items-center gap-1">
              <span>Contracts Expiring in 90 Days</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle
                      className="w-4 h-4 text-gold-400 cursor-pointer"
                      onClick={() => setOpenMetricModal('expiringContracts')}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">Clients with contracts expiring in the next 90 days.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-yellow-300">{data.contractRenewal?.expiring90?.length ?? '-'}</div>
        </Card>
        <Card className="bg-[#10122b] glass shadow-xl p-6 flex flex-col items-center justify-center border border-[#23244a]">
          <div className="text-base text-white mb-1 font-medium">
            <div className="flex items-center gap-1">
              <span>Revenue at Risk (90d)</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle
                      className="w-4 h-4 text-gold-400 cursor-pointer"
                      onClick={() => setOpenMetricModal('revenueAtRisk')}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">Total revenue from contracts expiring in the next 90 days.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-red-400">${data.contractRenewal?.revenueAtRisk?.toLocaleString() ?? '-'}</div>
        </Card>
      </div>

      {/* Expiring Contracts Table */}
      <div className="bg-[#1a1c3a] glass rounded-2xl p-8 shadow-2xl mb-8">
        <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Expiring Contracts (Next 90 Days)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-white">
            <thead>
              <tr>
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2">End Date</th>
                <th className="px-4 py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[...(data.contractRenewal?.expiring30 || []), ...(data.contractRenewal?.expiring60 || []), ...(data.contractRenewal?.expiring90 || [])].map((c: any) => (
                <tr key={c.id} className="border-b border-[#23244a]">
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.end}</td>
                  <td className="px-4 py-2">${c.revenue?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Implementation Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {implementationMetrics.map((metric, i) => (
          <Card
            key={metric.label}
            className={`bg-[#181a2f] glass shadow-xl p-6 flex flex-col items-center justify-center rounded-xl border border-[#23244a] transition-transform duration-200 hover:scale-105 hover:shadow-2xl group ${metric.highlight ? 'border-yellow-400 bg-yellow-900/30' : ''}`}
          >
            <div className={`text-base mb-1 font-medium tracking-wide group-hover:text-gold-400 transition-colors ${metric.highlight ? 'text-yellow-300' : 'text-white'}`}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle
                      className="w-4 h-4 text-gold-400 cursor-pointer"
                      onClick={() => setOpenMetricModal('timeToFirstValue')}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">Average days from signup to first successful onboarding milestone.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              Time to First Value
            </div>
            <div className={`text-3xl font-extrabold group-hover:text-gold-400 transition-colors drop-shadow ${metric.highlight ? 'text-yellow-300' : 'text-white'}`}>{metric.value}</div>
          </Card>
        ))}
      </div>
      <div className="text-xs text-white mb-10">Last updated: {lastUpdated}</div>

      {/* Bar Chart Section */}
      <div className="bg-[#1a1c3a] glass rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Clients by Package</h2>
        <div className="w-full max-w-2xl mx-auto">
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} layout="vertical" margin={{ left: 40, right: 40, top: 10, bottom: 10 }}>
                <XAxis type="number" stroke="#F2C94C" tick={{ fill: '#fff', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#F2C94C" tick={{ fill: '#fff', fontWeight: 600 }} axisLine={false} tickLine={false} width={120} />
                <RechartsTooltip
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
      {/* Modal for metric explanations */}
      <MetricExplanationModal
        open={!!openMetricModal}
        onClose={() => setOpenMetricModal(null)}
        metricKey={openMetricModal}
      />
      {showChurnRiskModal && (
        <ChurnRiskClientsModal
          open={showChurnRiskModal}
          onClose={() => setShowChurnRiskModal(false)}
          clients={data.churnRiskClientList || []}
        />
      )}
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