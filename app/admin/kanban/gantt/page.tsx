"use client"

import { useEffect, useState, useRef, useLayoutEffect, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getAllClients } from "@/lib/database"
import { Client } from "@/lib/types"
import { ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Scatter, LabelList } from "recharts"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"
import { format, isAfter, isBefore } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

// Milestone definitions per package
const packageMilestones = {
  light: {
    keys: ["created_at", "light_onboarding_call_date", "graduation_date"],
    labels: ["Created", "Onboarding Call", "Graduation"],
    colors: ["#ECB22D", "#10B981"], // yellow, green
  },
  premium: {
    keys: ["created_at", "premium_first_call_date", "premium_second_call_date", "graduation_date"],
    labels: ["Created", "Onboarding Call 1", "Onboarding Call 2", "Graduation"],
    colors: ["#ECB22D", "#F59E42", "#10B981"], // yellow, orange, green
  },
  gold: {
    keys: ["created_at", "gold_first_call_date", "gold_second_call_date", "gold_third_call_date", "graduation_date"],
    labels: ["Created", "Onboarding Call 1", "Onboarding Call 2", "Onboarding Call 3", "Graduation"],
    colors: ["#ECB22D", "#F59E42", "#3B82F6", "#10B981"], // yellow, orange, blue, green
  },
  elite: {
    keys: ["created_at", "elite_configurations_started_date", "elite_integrations_started_date", "elite_verification_completed_date", "graduation_date"],
    labels: ["New Client", "Configuration", "Integrations", "Verification", "Graduation"],
    colors: ["#E5E7EB", "#A78BFA", "#14B8A6", "#3B82F6", "#10B981"], // gray, purple, teal, blue, green
  },
}

function getClientSegments(client: Client, pkg: string) {
  const packageData = packageMilestones[pkg as keyof typeof packageMilestones]
  const { keys, labels, colors } = packageData
  const milestones = keys.map((key: string, i: number) => {
    const date = client[key as keyof Client]
    return date ? { label: labels[i], date: new Date(date as string) } : null
  }).filter(Boolean) as { label: string; date: Date }[]
  // Only show if all milestones exist
  if (milestones.some(m => !m)) return null
  const segments = []
  for (let i = 1; i < milestones.length; i++) {
    segments.push({
      start: milestones[i - 1]!.date,
      end: milestones[i]!.date,
      color: colors[i - 1],
      label: `${milestones[i - 1]!.label} → ${milestones[i]!.label}`,
      fromLabel: milestones[i - 1]!.label,
      toLabel: milestones[i]!.label,
      fromDate: milestones[i - 1]!.date,
      toDate: milestones[i]!.date,
    })
  }
  return {
    client: client.name,
    segments,
    milestones: milestones as { label: string, date: Date }[],
  }
}

// Add a time scale toggle (UI only)
const timeScales = [
  { label: "Weekly", value: "week" },
  { label: "Monthly", value: "month" },
]

export default function GanttChartPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedPackage, setSelectedPackage] = useState<"light" | "premium" | "gold" | "elite">("premium")
  const [loading, setLoading] = useState(true)
  const pathname = usePathname();
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartWidth, setChartWidth] = useState(800)
  const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null })
  const [packageType, setPackageType] = useState<string>("light")
  const [timeScale, setTimeScale] = useState<string>("week")

  useEffect(() => {
    getAllClients().then((data) => {
      setClients(data)
      setLoading(false)
    })
  }, [])

  useLayoutEffect(() => {
    function updateWidth() {
      if (chartContainerRef.current) {
        setChartWidth(chartContainerRef.current.offsetWidth - 180) // leave space for sticky Y axis
      }
    }
    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  // Filtering
  const filteredClients = clients.filter((c) => {
    if (c.success_package !== packageType) return false
    if (!c.created_at) return false
    const created = new Date(c.created_at)
    if (dateRange.start && isBefore(created, dateRange.start)) return false
    if (dateRange.end && isAfter(created, dateRange.end)) return false
    return true
  })

  const journeyData = filteredClients.map(c => getClientSegments(c, packageType)).filter(Boolean) as any[]

  // Find the min and max dates for the axis
  const allDates = journeyData.flatMap(d => d.segments.flatMap((s: any) => [s.start, s.end]))
  const minDate = allDates.length ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date()
  const maxDate = allDates.length ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date()

  // Calculate X-axis ticks (every 7 days for week, every 1st for month)
  const xTicks = useMemo(() => {
    if (!allDates.length) return []
    const start = new Date(minDate)
    const end = new Date(maxDate)
    const ticks = []
    const d = new Date(start)
    if (timeScale === "week") {
      d.setDate(d.getDate() - d.getDay()) // align to week start
      while (d <= end) {
        ticks.push(new Date(d))
        d.setDate(d.getDate() + 7)
      }
    } else {
      d.setDate(1)
      while (d <= end) {
        ticks.push(new Date(d))
        d.setMonth(d.getMonth() + 1)
      }
    }
    return ticks.map(dt => dt.getTime())
  }, [minDate, maxDate, allDates, timeScale])

  // Custom X-axis tick renderer
  const renderXAxisTick = (props: any) => {
    const { x, y, payload, index } = props
    const dateStr = format(new Date(payload.value), "M/d/yyyy")
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fontSize={11}
          fill="#6B7280"
          transform="rotate(-45)"
        >
          {dateStr}
        </text>
      </g>
    )
  }

  // Custom bar shape for segmented bar
  const SegmentedBar = (props: any) => {
    const { x, y, height, payload } = props
    const width = chartWidth
    const totalDuration = maxDate.getTime() - minDate.getTime()
    let left = x
    const barY = y + height / 2 - 10 // center bar vertically
    const labelY = barY - 18
    return (
      <g>
        {/* Milestone labels with dates above the bar */}
        {payload.segments.map((seg: any, idx: number) => {
          const segStart = seg.start.getTime()
          const segEnd = seg.end.getTime()
          const segWidth = ((segEnd - segStart) / totalDuration) * width
          const labelX = left + 4 // add a little padding
          const label = (
            <g key={"label-" + idx}>
              <text
                x={labelX}
                y={labelY}
                fontSize={11}
                fill="#6B7280"
                textAnchor="start"
                fontWeight={400}
                style={{ pointerEvents: "none" }}
              >
                {seg.fromLabel} ({format(seg.fromDate, "M/d/yyyy")})
              </text>
            </g>
          )
          left += segWidth
          return label
        })}
        {/* Last milestone label at the end */}
        {payload.segments.length > 0 && (
          <text
            x={x + width - 4}
            y={labelY}
            fontSize={11}
            fill="#6B7280"
            textAnchor="end"
            fontWeight={400}
            style={{ pointerEvents: "none" }}
          >
            {payload.segments[payload.segments.length - 1].toLabel} ({format(payload.segments[payload.segments.length - 1].toDate, "M/d/yyyy")})
          </text>
        )}
        {/* Segmented bar */}
        {(() => {
          const left = x
          return payload.segments.map((seg: any, idx: number) => {
            const segStart = seg.start.getTime()
            const segEnd = seg.end.getTime()
            const segWidth = ((segEnd - segStart) / totalDuration) * width
            return (
              <rect
                key={idx}
                x={left}
                y={barY}
                width={segWidth}
                height={20}
                fill={seg.color}
                rx={8}
                stroke="#d1d5db"
                strokeWidth={1}
                style={{ filter: "drop-shadow(0 1px 2px #0001)", opacity: 0.95 }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = "0.8"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = "0.95"
                }}
              />
            )
          })
        })()}
      </g>
    )
  }

  // Custom tooltip for the composed chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload
      return (
        <div className="bg-white p-2 border rounded shadow text-xs">
          <div className="font-bold">{d.client}</div>
          {d.segments.map((seg: any, idx: number) => (
            <div key={idx}>
              <span style={{ color: seg.color, fontWeight: 600 }}>{seg.label}:</span> {format(seg.fromDate, "M/d/yyyy")} - {format(seg.toDate, "M/d/yyyy")} ({Math.round((seg.toDate.getTime() - seg.fromDate.getTime()) / (1000 * 60 * 60 * 24))} days)
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Dynamic legend for the selected package
  const Legend = () => (
    <div className="flex gap-3 mb-4 items-center">
      {packageMilestones[packageType as keyof typeof packageMilestones].labels.map((label, i) => (
        <span
          key={label}
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: packageMilestones[packageType as keyof typeof packageMilestones].colors[i], color: '#fff', boxShadow: '0 1px 4px #0001' }}
        >
          {label}
        </span>
      ))}
    </div>
  )

  // Sticky Y-axis for client names
  const StickyYAxis = () => (
    <div className="sticky left-0 z-10 bg-white" style={{ width: 180, minWidth: 180 }}>
      <div style={{ height: 60 }} />
      {journeyData.map((d, idx) => (
        <div key={d.client} style={{ height: 60, display: "flex", alignItems: "center", fontWeight: 500, fontSize: 14, borderBottom: "1px solid #f3f4f6" }}>
          {d.client}
        </div>
      ))}
    </div>
  )

  // Reset filters
  const resetFilters = () => {
    setDateRange({ start: null, end: null })
    setPackageType("light")
  }

  // Fix: Add type for packageType
  const packageTypeTyped = packageType as keyof typeof packageMilestones

  // Gantt row with alternating background, spacing, and hover
  const GanttRow = ({ d, idx, chartWidth, minDate, maxDate, totalDuration }: any) => {
    const [hovered, setHovered] = useState(false)
    return (
      <div
        className={`flex items-center relative transition-colors ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${hovered ? 'ring-2 ring-blue-200 z-10' : ''}`}
        style={{ minHeight: 56, borderBottom: '1px solid #F1F5F9', padding: '8px 0', gap: 0 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Client name */}
        <div className="sticky left-0 z-20 bg-inherit pr-4" style={{ minWidth: 180, fontWeight: 500, color: '#334155' }}>{d.client}</div>
        {/* Milestone bar with anchored labels */}
        <div className="relative flex-1" style={{ minWidth: chartWidth }}>
          <div className="absolute top-0 left-0 w-full h-full flex items-center" style={{ pointerEvents: 'none' }}>
            {d.segments.map((seg: any, i: number) => {
              const segStart = seg.start.getTime()
              const segEnd = seg.end.getTime()
              const segWidth = ((segEnd - segStart) / totalDuration) * chartWidth
              const segLeft = ((segStart - minDate.getTime()) / totalDuration) * chartWidth
              // Center label above segment
              return (
                <div
                  key={i}
                  style={{ position: 'absolute', left: segLeft, width: segWidth, textAlign: 'center', top: -22 }}
                >
                  <span className="text-xs text-gray-500 font-medium" style={{ background: 'rgba(255,255,255,0.85)', padding: '0 4px', borderRadius: 4, marginBottom: 4, display: 'inline-block' }}>
                    {seg.fromLabel} <span className="font-normal">({format(seg.fromDate, 'M/d/yyyy')})</span>
                  </span>
                </div>
              )
            })}
          </div>
          <div className="absolute left-0 w-full flex items-center" style={{ height: 20, top: 8 }}>
            {d.segments.map((seg: any, i: number) => {
              const segStart = seg.start.getTime()
              const segEnd = seg.end.getTime()
              const segWidth = ((segEnd - segStart) / totalDuration) * chartWidth
              const segLeft = ((segStart - minDate.getTime()) / totalDuration) * chartWidth
              return (
                <div
                  key={i}
                  style={{ position: 'absolute', left: segLeft, width: segWidth, height: 14, borderRadius: 7, background: seg.color, boxShadow: '0 1px 4px #0001', border: '1px solid #e5e7eb', transition: 'box-shadow 0.2s', zIndex: 1, opacity: hovered ? 0.85 : 1 }}
                  title={`${seg.fromLabel} → ${seg.toLabel}: ${format(seg.fromDate, 'M/d/yyyy')} - ${format(seg.toDate, 'M/d/yyyy')} (${Math.max(1, Math.round((seg.toDate.getTime() - seg.fromDate.getTime()) / 86400000))} days)`}
                />
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // X-axis: reduce tick count, monthly for large ranges, rotate 45°, center-align
  const getXTicks = (minDate: Date, maxDate: Date, timeScale: string) => {
    const ticks = []
    const d = new Date(minDate)
    if (timeScale === 'month' || (maxDate.getTime() - minDate.getTime()) > 60 * 86400000) {
      d.setDate(1)
      while (d <= maxDate) {
        ticks.push(new Date(d))
        d.setMonth(d.getMonth() + 1)
      }
    } else {
      d.setDate(d.getDate() - d.getDay())
      while (d <= maxDate) {
        ticks.push(new Date(d))
        d.setDate(d.getDate() + 7)
      }
    }
    return ticks.map(dt => dt.getTime())
  }

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
              <p className="text-gray-600">Track clients through their success package workflows</p>
            </div>
            {/* Tab navigation for Kanban/Gantt */}
            <div className="mb-4">
              <div className="flex space-x-2 border-b border-gray-200">
                <Link href="/admin/kanban" legacyBehavior>
                  <a className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${pathname === "/admin/kanban" ? "border-[#ECB22D] text-[#010124] bg-white" : "border-transparent text-gray-500 hover:text-[#010124]"}`}>Kanban Board</a>
                </Link>
                <Link href="/admin/kanban/gantt" legacyBehavior>
                  <a className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${pathname === "/admin/kanban/gantt" ? "border-[#ECB22D] text-[#010124] bg-white" : "border-transparent text-gray-500 hover:text-[#010124]"}`}>Gantt Chart</a>
                </Link>
              </div>
            </div>
            {/* Filters */}
            <div className="mb-2 flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-800 mb-2">Filter by Date Range</div>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 mr-2">Time Scale:</span>
                <Select value={timeScale} onValueChange={setTimeScale}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeScales.map(ts => (
                      <SelectItem key={ts.value} value={ts.value}>{ts.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Package</label>
                <Select value={packageType} onValueChange={setPackageType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                <Calendar
                  mode="single"
                  selected={dateRange.start ?? undefined}
                  onSelect={date => setDateRange(r => ({ ...r, start: date ?? null }))}
                  className="border rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                <Calendar
                  mode="single"
                  selected={dateRange.end ?? undefined}
                  onSelect={date => setDateRange(r => ({ ...r, end: date ?? null }))}
                  className="border rounded-md shadow-sm"
                />
              </div>
              <div className="flex-1" />
              <div className="pt-5 flex justify-end w-full">
                <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
              </div>
            </div>
            <div className="mb-6" />
            <Legend />
            <div className="relative" style={{
              overflowX: 'auto',
              overflowY: journeyData.length > 15 ? 'auto' : 'visible',
              height: `calc(90vh - 220px)`, // 90vh minus estimated header/filters height
              minHeight: 400,
              maxHeight: 'none',
              borderRadius: 16,
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px #0001',
              background: '#F9FAFB',
              marginBottom: 0,
            }}>
              <div style={{ minWidth: 1200, width: '100%' }}>
                {journeyData.map((d, idx) => (
                  <GanttRow
                    key={d.client}
                    d={d}
                    idx={idx}
                    chartWidth={chartWidth}
                    minDate={minDate}
                    maxDate={maxDate}
                    totalDuration={maxDate.getTime() - minDate.getTime()}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
} 