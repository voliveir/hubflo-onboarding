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
import type { ReactElement } from "react";

const BAR_COLORS = ["#F2C94C", "#F2994A", "#0a0b1a", "#10122b", "#1a1c3a"];

function formatDate(date: Date) {
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

const PLAN_TYPES = ["pro", "business", "unlimited"];
const SUCCESS_PACKAGES = ["light", "premium", "gold", "elite", "starter", "professional", "enterprise", "pilot"];
const STATUSES = ["active", "draft", "archived", "completed"];
const IMPLEMENTATION_MANAGERS = ["vanessa", "vishal"];

const AnalyticsDashboard = ({ lastUpdated }: { lastUpdated: string }): ReactElement => {
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
  // 2. Add state for churned clients modal
  const [showChurnedClientsModal, setShowChurnedClientsModal] = useState(false);
  // Add state for expiring contracts modal
  const [showExpiringContractsModal, setShowExpiringContractsModal] = useState(false);

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
    revenueAtRiskChurn: {
      name: 'Revenue at Risk (Churn Risk)',
      description: 'Total revenue from clients currently marked as churn risk (excluding churned and demo clients).',
      logic: 'Sums the revenue_amount field for all clients where churn_risk is true, churned is false, and is_demo is false.'
    },
    revenueLostToChurnedClients: {
      name: 'Revenue Lost to Churned Clients',
      description: 'Total revenue lost from all churned (non-demo) clients.',
      logic: 'Sums the revenue_amount field for all clients where churned is true and is_demo is false.'
    },
    growthRate60: {
      name: 'Growth Rate (60d)',
      description: 'The percentage increase in total clients over the last 60 days.',
      logic: 'Growth Rate (60d) = (Clients now - Clients 60 days ago) / Clients 60 days ago x 100.'
    },
    growthRate90: {
      name: 'Growth Rate (90d)',
      description: 'The percentage increase in total clients over the last 90 days.',
      logic: 'Growth Rate (90d) = (Clients now - Clients 90 days ago) / Clients 90 days ago x 100.'
    },
  };

  // 3. Metric explanation modal component
  function MetricExplanationModal({ open, onClose, metricKey }: { open: boolean, onClose: () => void, metricKey: string | null }) {
    if (!open || !metricKey) return null;
    const metric = metricExplanations[metricKey];
    if (!metric) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-200">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 text-2xl font-bold hover:text-gray-900">×</button>
          <h3 className="text-xl font-bold mb-2" style={{color: '#060520'}}>{metric.name}</h3>
          <p className="text-gray-700 mb-2">{metric.description}</p>
          <div className="text-gray-600 font-mono text-sm whitespace-pre-line">{metric.logic}</div>
        </div>
      </div>
    );
  }

  // 4. Churn Risk Clients Modal component
  function ChurnRiskClientsModal({ open, onClose, clients }: { open: boolean, onClose: () => void, clients: any[] }) {
    if (!open) return null;
    const safeClients = Array.isArray(clients) ? clients : [];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-200">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 text-2xl font-bold hover:text-gray-900">×</button>
          <h3 className="text-xl font-bold mb-4" style={{color: '#060520'}}>Churn Risk Clients</h3>
          <div className="overflow-y-auto max-h-[60vh]">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 px-3 text-left" style={{color: '#060520'}}>Name</th>
                  <th className="py-2 px-3 text-left" style={{color: '#060520'}}>Implementation Manager</th>
                </tr>
              </thead>
              <tbody>
                {safeClients.length === 0 ? (
                  <tr><td colSpan={2} className="py-4 text-center text-gray-600">No clients at risk of churn.</td></tr>
                ) : (
                  safeClients.map((client, idx) => (
                    <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2 px-3" style={{color: '#060520'}}>{client.name}</td>
                      <td className="py-2 px-3" style={{color: '#64748b'}}>{client.implementation_manager ?? '-'}</td>
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

  // 5. Churned Clients Modal component
  function ChurnedClientsModal({ open, onClose, clients }: { open: boolean, onClose: () => void, clients: any[] }) {
    if (!open) return null;
    const safeClients = Array.isArray(clients) ? clients : [];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-200">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 text-2xl font-bold hover:text-gray-900">×</button>
          <h3 className="text-xl font-bold mb-4" style={{color: '#060520'}}>Churned Clients</h3>
          <div className="overflow-y-auto max-h-[60vh]">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 px-3 text-left" style={{color: '#060520'}}>Name</th>
                  <th className="py-2 px-3 text-left" style={{color: '#060520'}}>Implementation Manager</th>
                </tr>
              </thead>
              <tbody>
                {safeClients.length === 0 ? (
                  <tr><td colSpan={2} className="py-4 text-center text-gray-600">No churned clients.</td></tr>
                ) : (
                  safeClients.map((client, idx) => (
                    <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2 px-3" style={{color: '#060520'}}>{client.name}</td>
                      <td className="py-2 px-3" style={{color: '#64748b'}}>{client.implementation_manager ?? '-'}</td>
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

  // 6. Expiring Contracts Modal component
  function ExpiringContractsModal({ open, onClose, clients }: { open: boolean, onClose: () => void, clients: any[] }) {
    if (!open) return null;
    const safeClients = Array.isArray(clients) ? clients : [];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative border border-gray-200">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 text-2xl font-bold hover:text-gray-900">×</button>
          <h3 className="text-xl font-bold mb-4" style={{color: '#060520'}}>Expiring Contracts (90d)</h3>
          <div className="overflow-y-auto max-h-[60vh]">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 px-3 text-left" style={{color: '#060520'}}>Name</th>
                  <th className="py-2 px-3 text-left" style={{color: '#060520'}}>Contract End Date</th>
                  <th className="py-2 px-3 text-left" style={{color: '#060520'}}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {safeClients.length === 0 ? (
                  <tr><td colSpan={3} className="py-4 text-center text-gray-600">No contracts expiring in the next 90 days.</td></tr>
                ) : (
                  safeClients.map((client, idx) => (
                    <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2 px-3" style={{color: '#060520'}}>{client.name}</td>
                      <td className="py-2 px-3" style={{color: '#64748b'}}>{client.end ? new Date(client.end).toLocaleDateString() : '-'}</td>
                      <td className="py-2 px-3" style={{color: '#060520'}}>${typeof client.revenue === 'number' ? client.revenue.toLocaleString() : (client.revenue || '-')}</td>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin w-8 h-8 text-brand-gold" />
      </div>
    );
  }
  if (error || !data) {
    return <div className="text-red-600 p-8">{error || "No data available."}</div>;
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
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative border border-gray-200">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 text-2xl font-bold hover:text-gray-900">×</button>
          <h3 className="text-xl font-bold mb-4" style={{color: '#060520'}}>Clients: {stage}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 px-3 text-left" style={{color: '#060520'}}>Name</th>
                  <th className="py-2 px-3 text-left" style={{color: '#060520'}}>Package</th>
                  <th className="py-2 px-3 text-left" style={{color: '#060520'}}>Created Date</th>
                  <th className="py-2 px-3 text-left" style={{color: '#060520'}}>Implementation Manager</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-center text-gray-600">No clients in this stage.</td></tr>
                ) : (
                  clients.map((client, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2 px-3" style={{color: '#060520'}}>{client.name}</td>
                      <td className="py-2 px-3 capitalize" style={{color: '#64748b'}}>{client.package}</td>
                      <td className="py-2 px-3" style={{color: '#64748b'}}>{client.date_created ? new Date(client.date_created).toLocaleDateString() : '-'}</td>
                      <td className="py-2 px-3" style={{color: '#64748b'}}>{client.implementation_manager ?? '-'}</td>
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
      <div className="mb-8">
        <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
          <span className="text-brand-gold font-medium text-sm">Analytics</span>
        </div>
        <h1 className="text-5xl lg:text-6xl font-bold mb-4" style={{color: '#060520'}}>
          Analytics Dashboard
        </h1>
        <p className="text-xl max-w-4xl leading-relaxed mb-8" style={{color: '#64748b'}}>Track key metrics and business performance</p>
      </div>
      <div className="flex flex-wrap gap-4 mb-8 items-end">
        {filterOptions.map((filter) => (
          <div key={filter.key} className="flex flex-col">
            <label className="text-xs mb-1 font-medium" style={{color: '#060520'}}>{filter.label}</label>
            <select
              className="bg-white text-gray-900 rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              value={filters[filter.key as keyof typeof filters]}
              onChange={e => handleFilterChange(filter.key, e.target.value)}
            >
              {filter.options.map(opt => (
                <option key={opt} value={opt}>{opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : "All"}</option>
              ))}
            </select>
          </div>
        ))}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-semibold shadow-lg hover:scale-105 transition-transform h-[42px]"
          title="Export analytics as CSV"
        >
          <Download className="w-5 h-5" /> Export
        </button>
        <div className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
          <RefreshCw className="w-4 h-4 text-brand-gold" />
          Last updated: <span className="ml-1 font-medium" style={{color: '#060520'}}>{lastUpdated}</span>
        </div>
      </div>

      {/* SECTION A: Business Overview */}
      <div className="py-10">
        <h2 className="text-2xl font-bold mb-4" style={{color: '#060520'}}>💼 Business Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white shadow-lg p-6 flex flex-col items-center justify-center border border-gray-200 rounded-2xl">
            <div className="text-base mb-1 font-medium" style={{color: '#060520'}}>
              <div className="flex items-center gap-1">
                <span>Total Clients</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-brand-gold cursor-pointer"
                        onClick={() => setOpenMetricModal('totalClients')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-white border border-gray-200 text-gray-900">Number of all clients in the system.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold" style={{color: '#060520'}}>{data.totalClients}</div>
          </Card>
          <Card className="bg-white shadow-lg p-6 flex flex-col items-center justify-center border border-gray-200 rounded-2xl">
            <div className="text-base mb-1 font-medium" style={{color: '#060520'}}>
              <div className="flex items-center gap-1">
                <span>MRR</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-brand-gold cursor-pointer"
                        onClick={() => setOpenMetricModal('mrr')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-white border border-gray-200 text-gray-900">Monthly Recurring Revenue from all active subscriptions.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold" style={{color: '#060520'}}>${data.mrr?.toLocaleString()}</div>
          </Card>
          <Card className="bg-white shadow-lg p-6 flex flex-col items-center justify-center border border-gray-200 rounded-2xl">
            <div className="text-base mb-1 font-medium" style={{color: '#060520'}}>
              <div className="flex items-center gap-1">
                <span>ARR</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-brand-gold cursor-pointer"
                        onClick={() => setOpenMetricModal('arr')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-white border border-gray-200 text-gray-900">Annual Recurring Revenue, calculated as MRR x 12.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold" style={{color: '#060520'}}>${data.arr?.toLocaleString()}</div>
          </Card>
          <Card className="bg-white shadow-lg p-6 flex flex-col items-center justify-center border border-gray-200 rounded-2xl">
            <div className="text-base mb-1 font-medium" style={{color: '#060520'}}>
              <div className="flex items-center gap-1">
                <span>Growth Rate (30d)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-brand-gold cursor-pointer"
                        onClick={() => setOpenMetricModal('growthRate')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-white border border-gray-200 text-gray-900">Percentage increase in total clients over the last 30 days.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold" style={{color: '#060520'}}>{data.growthRate}%</div>
          </Card>
          <Card className="bg-white shadow-lg p-6 flex flex-col items-center justify-center border border-gray-200 rounded-2xl">
            <div className="text-base mb-1 font-medium" style={{color: '#060520'}}>
              <div className="flex items-center gap-1">
                <span>Growth Rate (60d)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-brand-gold cursor-pointer"
                        onClick={() => setOpenMetricModal('growthRate60')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-white border border-gray-200 text-gray-900">Percentage increase in total clients over the last 60 days.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold" style={{color: '#060520'}}>{data.growthRate60}%</div>
          </Card>
          <Card className="bg-white shadow-lg p-6 flex flex-col items-center justify-center border border-gray-200 rounded-2xl">
            <div className="text-base mb-1 font-medium" style={{color: '#060520'}}>
              <div className="flex items-center gap-1">
                <span>Growth Rate (90d)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="w-4 h-4 text-brand-gold cursor-pointer"
                        onClick={() => setOpenMetricModal('growthRate90')}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-white border border-gray-200 text-gray-900">Percentage increase in total clients over the last 90 days.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-3xl font-extrabold" style={{color: '#060520'}}>{data.growthRate90}%</div>
          </Card>
        </div>
      </div>

      {/* SECTION: Client Join Date Heatmap */}
      <div className="py-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{color: '#060520'}}>
          <span>📅 Client Join Heatmap</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-5 h-5 text-brand-gold cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-white border border-gray-200 text-gray-900">Shows which months and years had the most client signups. Darker squares = more clients joined that month.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h2>
        <Card className="bg-white shadow-lg p-6 flex flex-col items-center justify-center border border-gray-200 rounded-2xl w-full">
          {/* Heatmap grid */}
          {data.clients && data.clients.length > 0 ? (
            <ClientJoinHeatmap clients={data.clients} arrByMonth={data.arrByMonth} />
          ) : (
            <div className="text-gray-600">No client join data available.</div>
          )}
        </Card>
      </div>

      {/* SECTION B: Churn */}
      <div className="py-10">
        <h2 className="text-2xl font-bold mb-4" style={{color: '#060520'}}>❗ Churn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          {/* Revenue at Risk (Churn Risk) */}
          <Card className="bg-white shadow-lg p-6 flex flex-col items-center justify-center border-2 border-red-300 rounded-2xl">
            <div className="flex items-center gap-1 text-base mb-1 font-bold" style={{color: '#060520'}}>
              <span>Revenue at Risk (Churn Risk)</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle
                      className="w-4 h-4 text-brand-gold cursor-pointer"
                      onClick={() => setOpenMetricModal('revenueAtRiskChurn')}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white border border-gray-200 text-gray-900">Total revenue from clients currently marked as churn risk (excluding churned and demo clients).</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-3xl font-extrabold text-red-600">${data.revenueAtRiskChurn?.toLocaleString() ?? '-'}</div>
          </Card>
          {/* Revenue Lost to Churned Clients */}
          <Card className="bg-red-50 shadow-lg p-6 flex flex-col items-center justify-center border-2 border-red-500 rounded-2xl">
            <div className="flex items-center gap-1 text-base mb-1 font-bold" style={{color: '#060520'}}>
              <span>Revenue Lost to Churned Clients</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle
                      className="w-4 h-4 text-brand-gold cursor-pointer"
                      onClick={() => setOpenMetricModal('revenueLostToChurnedClients')}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white border border-gray-200 text-gray-900">Total revenue lost from all churned (non-demo) clients. Sums the revenue_amount for all churned clients.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-3xl font-extrabold text-red-700">${data.revenueLostToChurnedClients?.toLocaleString() ?? '-'}</div>
          </Card>
          {/* Churned Clients */}
          <Card className="bg-white shadow-lg p-6 flex flex-col items-center justify-center border border-gray-200 cursor-pointer rounded-2xl hover:bg-gray-50" onClick={() => setShowChurnedClientsModal(true)}>
            <div className="flex items-center gap-1 text-base mb-1 font-medium" style={{color: '#060520'}}>
              <span>Churned Clients</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle
                      className="w-4 h-4 text-brand-gold cursor-pointer"
                      onClick={e => { e.stopPropagation(); setOpenMetricModal('churnedClients'); }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white border border-gray-200 text-gray-900">Number of clients marked as churned (no longer active customers).</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-3xl font-extrabold" style={{color: '#060520'}}>{data.churnedClients ?? '-'}</div>
          </Card>
          {/* Churn Rate */}
          <Card className="bg-white shadow-lg p-6 flex flex-col items-center justify-center border border-gray-200 rounded-2xl">
            <div className="flex items-center gap-1 text-base mb-1 font-medium" style={{color: '#060520'}}>
              <span>Churn Rate</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle
                      className="w-4 h-4 text-brand-gold cursor-pointer"
                      onClick={() => setOpenMetricModal('churnRate')}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white border border-gray-200 text-gray-900">Percentage of all clients who have churned (no longer active customers).</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-3xl font-extrabold" style={{color: '#060520'}}>{data.totalClients ? `${((data.churnedClients / data.totalClients) * 100).toFixed(1)}%` : '-'}</div>
          </Card>
          {/* Churn Risk Clients */}
          <Card className="bg-white shadow-lg p-6 flex flex-col items-center justify-center border border-gray-200 cursor-pointer rounded-2xl hover:bg-gray-50" onClick={() => setShowChurnRiskModal(true)}>
            <div className="flex items-center gap-1 text-base mb-1 font-medium" style={{color: '#060520'}}>
              <span>Churn Risk Clients</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle
                      className="w-4 h-4 text-brand-gold cursor-pointer"
                      onClick={e => { e.stopPropagation(); setOpenMetricModal('churnRiskClients'); }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white border border-gray-200 text-gray-900">Number of clients currently marked as at risk of churn by an implementation manager.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-3xl font-extrabold" style={{color: '#060520'}}>{data.churnRiskClients ?? '-'}</div>
          </Card>
        </div>
      </div>

      {/* Modal for metric explanations */}
      <MetricExplanationModal
        open={!!openMetricModal}
        onClose={() => setOpenMetricModal(null)}
        metricKey={openMetricModal}
      />
      <ChurnRiskClientsModal
        open={showChurnRiskModal}
        onClose={() => setShowChurnRiskModal(false)}
        clients={data.churnRiskClientList || []}
      />
      <ChurnedClientsModal
        open={showChurnedClientsModal}
        onClose={() => setShowChurnedClientsModal(false)}
        clients={data.churnedClientList || []}
      />
      <ExpiringContractsModal
        open={showExpiringContractsModal}
        onClose={() => setShowExpiringContractsModal(false)}
        clients={data.contractRenewal?.expiring90 || []}
      />
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
      <div className="flex h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8 max-w-7xl mx-auto">
            <AnalyticsDashboard lastUpdated={lastUpdated} />
          </div>
        </main>
      </div>
    </PasswordProtection>
  );
}

function ClientJoinHeatmap({ clients, arrByMonth }: { clients: any[], arrByMonth?: Record<string, Record<string, number>> }) {
  // Group clients by year and month
  const joinCounts: Record<string, Record<string, number>> = {};
  let minYear = new Date().getFullYear();
  let maxYear = new Date().getFullYear();
  clients.forEach(client => {
    if (!client.created_at) return;
    const date = new Date(client.created_at);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
    if (!joinCounts[year]) joinCounts[year] = {};
    joinCounts[year][month] = (joinCounts[year][month] || 0) + 1;
    if (year < minYear) minYear = year;
    if (year > maxYear) maxYear = year;
  });
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // Find max count for color scaling
  let maxCount = 0;
  Object.values(joinCounts).forEach(yearObj => {
    Object.values(yearObj).forEach(count => {
      if (count > maxCount) maxCount = count;
    });
  });
  // Color scale: 0 = light gray, max = gold
  function getColor(count: number) {
    if (!count) return "#f3f4f6";
    // Linear interpolate between light gray and gold
    const t = Math.min(1, count / maxCount);
    // Simple blend: light gray to gold
    const r = Math.round(243 + t * (242 - 243));
    const g = Math.round(244 + t * (201 - 244));
    const b = Math.round(246 + t * (76 - 246));
    return `rgb(${r},${g},${b})`;
  }
  // Render grid
  return (
    <div className="overflow-x-auto w-full">
      <table className="border-collapse w-full min-w-0">
        <thead>
          <tr>
            <th className="text-xs font-normal p-1 min-w-0" style={{color: '#060520'}}></th>
            {months.map(m => (
              <th key={m} className="text-xs font-normal p-1 text-center min-w-0" style={{color: '#060520'}}>{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map(year => (
            <tr key={year}>
              <td className="text-xs font-normal p-1 text-right pr-2 min-w-0" style={{color: '#060520'}}>{year}</td>
              {months.map((_, mIdx) => {
                const count = joinCounts[year]?.[mIdx] || 0;
                const arr = arrByMonth?.[year]?.[mIdx] || 0;
                const tooltip = arr > 0 
                  ? `${months[mIdx]} ${year}: ${count} client${count === 1 ? '' : 's'} | ARR: $${arr.toLocaleString()}`
                  : `${months[mIdx]} ${year}: ${count} client${count === 1 ? '' : 's'}`;
                return (
                  <td
                    key={mIdx}
                    title={tooltip}
                    className="rounded transition-all border border-gray-200 text-center align-middle min-w-0 relative group"
                    style={{ background: getColor(count), color: count > maxCount * 0.6 ? '#010124' : '#060520', fontWeight: count > 0 ? 'bold' : 'normal', width: `${100 / 12}%` }}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span>{count > 0 ? count : ''}</span>
                      {arr > 0 && (
                        <span className="text-xs opacity-80" style={{ color: count > maxCount * 0.6 ? '#010124' : '#64748b' }}>
                          ${(arr / 1000).toFixed(0)}k
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}