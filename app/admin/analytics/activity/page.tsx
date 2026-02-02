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

export default function ActivityAnalyticsPage() {
  const [weekStart, setWeekStart] = useState(getThisWeekStartLocal())
  const [activities, setActivities] = useState<BrowserActivity[]>([])
  const [groups, setGroups] = useState<ActivityGroup[]>([])
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { startISO, endISO, label } = getWeekRangeLocal(weekStart)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([
      fetch(`/api/browser-activity?start_date=${encodeURIComponent(startISO)}&end_date=${encodeURIComponent(endISO)}`),
      fetch(`/api/activity-groups?start_date=${encodeURIComponent(startISO)}&end_date=${encodeURIComponent(endISO)}`),
      fetch("/api/clients-list"),
    ])
      .then(([actRes, grpRes, clientsRes]) => {
        if (cancelled) return
        if (!actRes.ok) throw new Error("Failed to load activity")
        return Promise.all([actRes.json(), grpRes.json(), clientsRes.ok ? clientsRes.json() : []])
      })
      .then(([actData, grpData, clientsData]) => {
        if (cancelled) return
        setActivities(Array.isArray(actData) ? actData : [])
        setGroups(Array.isArray(grpData) ? grpData : [])
        setClients(Array.isArray(clientsData) ? clientsData : [])
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
  }, [startISO, endISO])

  const ungrouped = activities.filter((a) => !a.group_id && !a.is_hidden)
  const byClient = new Map<string | null, { totalSeconds: number; workSeconds: number }>()

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

  const totals = Array.from(byClient.entries()).reduce(
    (acc, [, v]) => ({
      totalSeconds: acc.totalSeconds + v.totalSeconds,
      workSeconds: acc.workSeconds + v.workSeconds,
    }),
    { totalSeconds: 0, workSeconds: 0 }
  )
  const outsideSeconds = totals.totalSeconds - totals.workSeconds

  const rows = Array.from(byClient.entries())
    .map(([clientId, v]) => ({
      clientId,
      name: clientId ? clients.find((c) => c.id === clientId)?.name ?? "Unknown" : "Unassigned",
      ...v,
    }))
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
                                  row.name
                                )}
                              </td>
                              <td className="text-right py-3 px-4 text-green-700">
                                {formatHours(row.workSeconds)}
                              </td>
                              <td className="text-right py-3 px-4 text-gray-600">
                                {formatHours(row.totalSeconds - row.workSeconds)}
                              </td>
                              <td className="text-right py-3 px-4 font-medium">
                                {formatHours(row.totalSeconds)}
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
