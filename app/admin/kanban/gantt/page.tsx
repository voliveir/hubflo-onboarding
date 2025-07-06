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

// Capitalize helper for package names
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
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
  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to?: Date | undefined }>({ from: undefined })
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
    if (dateRange.from && isBefore(created, dateRange.from)) return false
    if (dateRange.to && isAfter(created, dateRange.to)) return false
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
    <div className="flex gap-3 items-center mb-2">
      {packageMilestones[packageType as keyof typeof packageMilestones].labels.map((label, i) => (
        <span
          key={label}
          className="px-3 py-1 rounded-full text-xs font-bold shadow-[0_1px_4px_rgba(0,0,0,0.10)]"
          style={{ background: packageMilestones[packageType as keyof typeof packageMilestones].colors[i], color: '#fff', boxShadow: '0 1px 8px #0002' }}
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
    setDateRange({ from: undefined })
    setPackageType("light")
  }

  // Fix: Add type for packageType
  const packageTypeTyped = packageType as keyof typeof packageMilestones

  // Gantt row with alternating background, spacing, and hover
  const GanttRow = ({ d, idx, chartWidth, minDate, maxDate, totalDuration }: any) => {
    const [hovered, setHovered] = useState(false)
    return (
      <div
        className={`flex items-center relative transition-colors ${idx % 2 === 0 ? 'bg-[#15173d]' : 'bg-[#181a2f]'} ${hovered ? 'ring-2 ring-[#F2C94C]/40 z-10' : ''}`}
        style={{ minHeight: 56, borderBottom: '1px solid #23244a', padding: '8px 0', gap: 0 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Client name sticky column */}
        <div className="sticky left-0 z-30 pr-4 bg-[#10122b] border-l-4 border-[#F2C94C] shadow-lg" style={{ minWidth: 180, fontWeight: 600, color: '#fff', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}>{d.client}</div>
        {/* Milestone bar with anchored labels and grid lines */}
        <div className="relative flex-1" style={{ minWidth: chartWidth }}>
          {/* Vertical grid lines (weekly) */}
          <div className="absolute inset-0 flex" style={{ zIndex: 0 }}>
            {Array.from({ length: Math.ceil(chartWidth / 100) }).map((_, i) => (
              <div key={i} style={{ left: i * 100, width: 1, height: '100%' }} className="absolute top-0 border-l border-[#F2C94C]/25" />
            ))}
          </div>
          {/* Milestone labels above segments */}
          <div className="absolute top-0 left-0 w-full h-full flex items-center" style={{ pointerEvents: 'none' }}>
            {d.segments.map((seg: any, i: number) => {
              const segStart = seg.start.getTime()
              const segEnd = seg.end.getTime()
              const segWidth = ((segEnd - segStart) / totalDuration) * chartWidth
              const segLeft = ((segStart - minDate.getTime()) / totalDuration) * chartWidth
              return (
                <div
                  key={i}
                  style={{ position: 'absolute', left: segLeft, width: segWidth, textAlign: 'center', top: -22 }}
                >
                  <span className="text-xs text-gray-200 font-medium" style={{ background: 'rgba(24,26,47,0.95)', padding: '0 4px', borderRadius: 4, marginBottom: 4, display: 'inline-block' }}>
                    {seg.fromLabel} <span className="font-normal">({format(seg.fromDate, 'M/d/yyyy')})</span>
                  </span>
                </div>
              )
            })}
          </div>
          {/* Milestone bars */}
          <div className="absolute left-0 w-full flex items-center" style={{ height: 20, top: 8 }}>
            {d.segments.map((seg: any, i: number) => {
              const segStart = seg.start.getTime()
              const segEnd = seg.end.getTime()
              const segWidth = ((segEnd - segStart) / totalDuration) * chartWidth
              const segLeft = ((segStart - minDate.getTime()) / totalDuration) * chartWidth
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: segLeft,
                    width: segWidth,
                    height: 16,
                    borderRadius: 8,
                    background: seg.color,
                    boxShadow: hovered ? '0 4px 16px #F2C94C33, 0 1px 8px #0004' : '0 1px 4px #0002',
                    border: hovered ? '2px solid #F2C94C99' : '1px solid #e5e7eb22',
                    transition: 'box-shadow 0.2s, border 0.2s, transform 0.2s',
                    zIndex: 2,
                    opacity: hovered ? 0.92 : 1,
                    transform: hovered ? 'translateY(-1px)' : 'none',
                    cursor: 'pointer',
                  }}
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
      <div className="flex h-screen bg-gradient-to-br from-[#10122b] to-[#181a2f]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Project Management</h1>
            <div className="w-full rounded-2xl ring-1 ring-[#F2C94C] bg-gradient-to-br from-[#10122b] to-[#181a2f] shadow-lg p-6">
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
              {/* Compact filter bar: only package dropdown as dark pill with colored dot */}
              <div className="flex items-center mb-6 px-2 py-2 rounded-xl bg-[#181a2f]/80 ring-1 ring-[#F2C94C]/10 shadow-inner-glass backdrop-blur-md min-h-[44px]">
                <div className="flex items-center gap-2">
                  <Select value={packageType} onValueChange={setPackageType}>
                    <SelectTrigger className="bg-[#181a2f] border border-[#23244a] rounded-full px-4 py-1 text-white text-xs font-semibold flex items-center gap-2 min-w-[110px]">
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: packageMilestones[packageType as keyof typeof packageMilestones].colors[0] }} />
                      <span className="text-white">{capitalize(packageType)}</span>
                    </SelectTrigger>
                    <SelectContent className="bg-[#181a2f] border border-[#23244a] rounded-xl mt-2">
                      {Object.keys(packageMilestones).map((pkg) => (
                        <SelectItem key={pkg} value={pkg} className="flex items-center gap-2 text-xs text-white">
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: packageMilestones[pkg as keyof typeof packageMilestones].colors[0] }} />
                          <span className="text-white">{capitalize(pkg)}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mb-6" />
              <Legend />
              <div className="relative overflow-x-auto scrollbar-thin scrollbar-thumb-[#F2C94C]/70 scrollbar-track-transparent" style={{ minWidth: chartWidth, WebkitOverflowScrolling: 'touch' }}>
                {journeyData.length === 0 ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="bg-[#181a2f] border border-[#F2C94C]/30 rounded-xl px-8 py-10 text-center text-white/80 text-lg shadow-lg">
                      <span className="text-3xl mb-2 block">🗂️</span>
                      No projects in this range — <span className="italic text-[#F2C94C]">adjust filters.</span>
                    </div>
                  </div>
                ) : journeyData.map((d, idx) => (
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