"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Clock, Briefcase, Calendar, ArrowLeft } from "lucide-react"
import { getWorkHoursSeconds, WORK_HOURS_LABEL } from "@/lib/workHours"

interface BrowserActivity {
  id: string
  started_at: string
  ended_at: string
  duration_seconds: number
  client_id: string | null
  group_id?: string | null
  is_hidden?: boolean
}

interface ActivityGroup {
  id: string
  client_id: string | null
  activities: { started_at: string; ended_at: string; duration_seconds: number }[]
}

function formatHours(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

// Monday = 1 in JS getDay(); we want week Mon–Sun
function getWeekRangeLocal(weekStart: string): { startISO: string; endISO: string; label: string } {
  const [y, m, d] = weekStart.split("-").map(Number)
  const mon = new Date(y, m - 1, d, 0, 0, 0, 0)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  sun.setHours(23, 59, 59, 999)
  const monNext = new Date(mon)
  monNext.setDate(mon.getDate() + 7)
  return {
    startISO: mon.toISOString(),
    endISO: sun.toISOString(),
    label: `${mon.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${sun.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`,
  }
}

function getThisWeekStartLocal(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(d)
  mon.setDate(d.getDate() + diff)
  return `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, "0")}-${String(mon.getDate()).padStart(2, "0")}`
}

function getPreviousWeekStart(weekStart: string): string {
  const [y, m, d] = weekStart.split("-").map(Number)
  const mon = new Date(y, m - 1, d)
  mon.setDate(mon.getDate() - 7)
  return `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, "0")}-${String(mon.getDate()).padStart(2, "0")}`
}

function computeByClient(
  activities: BrowserActivity[],
  groups: ActivityGroup[]
): Map<string | null, { totalSeconds: number; workSeconds: number }> {
  const byClient = new Map<string | null, { totalSeconds: number; workSeconds: number }>()
  const ungrouped = activities.filter((a) => !a.group_id && !a.is_hidden)
  for (const a of ungrouped) {
    const cid = a.client_id
    const workSec = getWorkHoursSeconds(a.started_at, a.ended_at)
    const existing = byClient.get(cid) ?? { totalSeconds: 0, workSeconds: 0 }
    byClient.set(cid, {
      totalSeconds: existing.totalSeconds + a.duration_seconds,
      workSeconds: existing.workSeconds + workSec,
    })
  }
  for (const g of groups) {
    const cid = g.client_id
    const totalSec = g.activities.reduce((s, a) => s + a.duration_seconds, 0)
    const workSec = g.activities.reduce(
      (s, a) => s + getWorkHoursSeconds(a.started_at, a.ended_at),
      0
    )
    const existing = byClient.get(cid) ?? { totalSeconds: 0, workSeconds: 0 }
    byClient.set(cid, {
      totalSeconds: existing.totalSeconds + totalSec,
      workSeconds: existing.workSeconds + workSec,
    })
  }
  return byClient
}

function formatDelta(deltaSeconds: number): string {
  if (deltaSeconds === 0) return "0"
  const sign = deltaSeconds > 0 ? "+" : ""
  const h = Math.floor(Math.abs(deltaSeconds) / 3600)
  const m = Math.round((Math.abs(deltaSeconds) % 3600) / 60)
  if (h === 0) return `${sign}${m}m`
  return m > 0 ? `${sign}${h}h ${m}m` : `${sign}${h}h`
}

export default function ActivityAnalyticsPage() {
  const [weekStart, setWeekStart] = useState(getThisWeekStartLocal())
  const [compareWeeks, setCompareWeeks] = useState(false)
  const [activities, setActivities] = useState<BrowserActivity[]>([])
  const [groups, setGroups] = useState<ActivityGroup[]>([])
  const [prevActivities, setPrevActivities] = useState<BrowserActivity[]>([])
  const [prevGroups, setPrevGroups] = useState<ActivityGroup[]>([])
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { startISO, endISO, label } = getWeekRangeLocal(weekStart)
  const prevWeekStart = getPreviousWeekStart(weekStart)
  const { startISO: prevStartISO, endISO: prevEndISO, label: prevLabel } = getWeekRangeLocal(prevWeekStart)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const loadCurrent = Promise.all([
      fetch(`/api/browser-activity?start_date=${encodeURIComponent(startISO)}&end_date=${encodeURIComponent(endISO)}`),
      fetch(`/api/activity-groups?start_date=${encodeURIComponent(startISO)}&end_date=${encodeURIComponent(endISO)}`),
      fetch("/api/clients-list"),
    ]).then(async ([actRes, grpRes, clientsRes]) => {
      if (!actRes.ok) throw new Error("Failed to load activity")
      const [actData, grpData, clientsData] = await Promise.all([
        actRes.json(),
        grpRes.json(),
        clientsRes.ok ? clientsRes.json() : [],
      ])
      return { actData, grpData, clientsData }
    })
    const loadPrev = compareWeeks
      ? Promise.all([
          fetch(`/api/browser-activity?start_date=${encodeURIComponent(prevStartISO)}&end_date=${encodeURIComponent(prevEndISO)}`),
          fetch(`/api/activity-groups?start_date=${encodeURIComponent(prevStartISO)}&end_date=${encodeURIComponent(prevEndISO)}`),
        ]).then(async ([actRes, grpRes]) => {
          const [prevActData, prevGrpData] = await Promise.all([actRes.json(), grpRes.json()])
          return { prevActData, prevGrpData }
        })
      : Promise.resolve({ prevActData: [], prevGrpData: [] })

    Promise.all([loadCurrent, loadPrev])
      .then(([current, prev]) => {
        if (cancelled) return
        setActivities(Array.isArray(current.actData) ? current.actData : [])
        setGroups(Array.isArray(current.grpData) ? current.grpData : [])
        setClients(Array.isArray(current.clientsData) ? current.clientsData : [])
        setPrevActivities(Array.isArray(prev.prevActData) ? prev.prevActData : [])
        setPrevGroups(Array.isArray(prev.prevGrpData) ? prev.prevGrpData : [])
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [startISO, endISO, compareWeeks, prevStartISO, prevEndISO])

  const byClient = computeByClient(activities, groups)
  const prevByClient = compareWeeks ? computeByClient(prevActivities, prevGroups) : new Map<string | null, { totalSeconds: number; workSeconds: number }>()

  const totals = Array.from(byClient.entries()).reduce(
    (acc, [, v]) => ({
      totalSeconds: acc.totalSeconds + v.totalSeconds,
      workSeconds: acc.workSeconds + v.workSeconds,
    }),
    { totalSeconds: 0, workSeconds: 0 }
  )
  const prevTotals = Array.from(prevByClient.entries()).reduce(
    (acc, [, v]) => ({
      totalSeconds: acc.totalSeconds + v.totalSeconds,
      workSeconds: acc.workSeconds + v.workSeconds,
    }),
    { totalSeconds: 0, workSeconds: 0 }
  )
  const outsideSeconds = totals.totalSeconds - totals.workSeconds
  const prevOutsideSeconds = prevTotals.totalSeconds - prevTotals.workSeconds

  const rows = Array.from(byClient.entries())
    .map(([clientId, v]) => {
      const prev = prevByClient.get(clientId) ?? { totalSeconds: 0, workSeconds: 0 }
      return {
        clientId,
        name: clientId ? clients.find((c) => c.id === clientId)?.name ?? "Unknown" : "Unassigned",
        ...v,
        prevTotalSeconds: prev.totalSeconds,
        prevWorkSeconds: prev.workSeconds,
      }
    })
    .sort((a, b) => (a.clientId === null ? 1 : b.clientId === null ? -1 : b.totalSeconds - a.totalSeconds))

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-6">
              <Link
                href="/admin/activity-timeline"
                className="inline-flex items-center gap-1 text-sm text-brand-gold hover:underline mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Activity Timeline
              </Link>
              <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-4">
                <span className="text-brand-gold font-medium text-sm">Analytics</span>
              </div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: "#060520" }}>
                Activity analytics
              </h1>
              <p className="text-gray-600">
                Time by client with work hours (9–5 Mon–Fri) vs outside work hours
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-4 mb-6">
              <div>
                <Label className="text-xs text-gray-500">Week starting (Monday)</Label>
                <Input
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  className="w-44 h-9 mt-1"
                />
              </div>
              <p className="text-sm text-gray-600 pb-2">{label}</p>
              <Button variant="outline" size="sm" onClick={() => setWeekStart(getThisWeekStartLocal())}>
                This week
              </Button>
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={compareWeeks}
                  onChange={(e) => setCompareWeeks(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Compare to previous week</span>
              </label>
              {compareWeeks && (
                <p className="text-xs text-gray-500 pb-2" title={prevLabel}>
                  vs {prevLabel}
                </p>
              )}
            </div>

            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-2 text-sm text-amber-800">
              <strong>Work hours:</strong> {WORK_HOURS_LABEL}
            </div>

            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
              </div>
            ) : error ? (
              <Card className="p-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => setWeekStart(weekStart)} variant="outline">
                  Retry
                </Button>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Card className="p-6 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand-gold/10">
                        <Clock className="h-5 w-5 text-brand-gold" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total time</p>
                        <p className="text-2xl font-bold" style={{ color: "#060520" }}>
                          {formatHours(totals.totalSeconds)}
                          {compareWeeks && (
                            <span
                              className={`ml-2 text-sm font-normal ${
                                totals.totalSeconds >= prevTotals.totalSeconds ? "text-green-600" : "text-gray-500"
                              }`}
                              title={`Previous week: ${formatHours(prevTotals.totalSeconds)}`}
                            >
                              ({formatDelta(totals.totalSeconds - prevTotals.totalSeconds)})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <Briefcase className="h-5 w-5 text-green-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Work hours</p>
                        <p className="text-2xl font-bold text-green-700">
                          {formatHours(totals.workSeconds)}
                          {compareWeeks && (
                            <span
                              className={`ml-2 text-sm font-normal ${
                                totals.workSeconds >= prevTotals.workSeconds ? "text-green-600" : "text-gray-500"
                              }`}
                              title={`Previous week: ${formatHours(prevTotals.workSeconds)}`}
                            >
                              ({formatDelta(totals.workSeconds - prevTotals.workSeconds)})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Calendar className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Outside work hours</p>
                        <p className="text-2xl font-bold text-gray-700">
                          {formatHours(outsideSeconds)}
                          {compareWeeks && (
                            <span
                              className={`ml-2 text-sm font-normal ${
                                outsideSeconds >= prevOutsideSeconds ? "text-gray-600" : "text-gray-500"
                              }`}
                              title={`Previous week: ${formatHours(prevOutsideSeconds)}`}
                            >
                              ({formatDelta(outsideSeconds - prevOutsideSeconds)})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-semibold" style={{ color: "#060520" }}>
                      By client
                    </h2>
                    <p className="text-sm text-gray-500">
                      Work hours = 9–5 Mon–Fri. Hidden activities excluded.
                      {compareWeeks && " Deltas vs previous week in parentheses."}
                      {rows.some((r) => r.clientId !== null) && " Click a client to see that week’s activity in List view."}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/80">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Client</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Work hours</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Outside</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-gray-500">
                              No activity for this week
                            </td>
                          </tr>
                        ) : (
                          rows.map((row) => (
                            <tr key={row.clientId ?? "unassigned"} className="border-b border-gray-100 hover:bg-gray-50/50">
                              <td className="py-3 px-4 font-medium">
                                {row.clientId === null ? (
                                  <span className="text-gray-500">Unassigned</span>
                                ) : (
                                  <Link
                                    href={`/admin/activity-list?date=${weekStart}&client_id=${encodeURIComponent(row.clientId)}`}
                                    className="text-brand-gold hover:underline"
                                  >
                                    {row.name}
                                  </Link>
                                )}
                              </td>
                              <td className="text-right py-3 px-4 text-green-700">
                                {formatHours(row.workSeconds)}
                                {compareWeeks && (
                                  <span
                                    className={`ml-1 text-xs ${
                                      row.workSeconds >= row.prevWorkSeconds ? "text-green-600" : "text-gray-500"
                                    }`}
                                    title={`Prev: ${formatHours(row.prevWorkSeconds)}`}
                                  >
                                    ({formatDelta(row.workSeconds - row.prevWorkSeconds)})
                                  </span>
                                )}
                              </td>
                              <td className="text-right py-3 px-4 text-gray-600">
                                {formatHours(row.totalSeconds - row.workSeconds)}
                                {compareWeeks && (
                                  <span className="ml-1 text-xs text-gray-500" title={`Prev: ${formatHours(row.prevTotalSeconds - row.prevWorkSeconds)}`}>
                                    ({formatDelta((row.totalSeconds - row.workSeconds) - (row.prevTotalSeconds - row.prevWorkSeconds))})
                                  </span>
                                )}
                              </td>
                              <td className="text-right py-3 px-4 font-medium">
                                {formatHours(row.totalSeconds)}
                                {compareWeeks && (
                                  <span
                                    className={`ml-1 text-xs ${
                                      row.totalSeconds >= row.prevTotalSeconds ? "text-gray-700" : "text-gray-500"
                                    }`}
                                    title={`Prev: ${formatHours(row.prevTotalSeconds)}`}
                                  >
                                    ({formatDelta(row.totalSeconds - row.prevTotalSeconds)})
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
