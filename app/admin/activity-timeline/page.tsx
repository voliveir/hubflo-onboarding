"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Clock,
  Globe,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  Loader2,
  Zap,
  Layers,
  Ungroup,
  EyeOff,
  Eye,
} from "lucide-react"

interface BrowserActivity {
  id: string
  url: string
  domain: string | null
  page_title: string | null
  started_at: string
  ended_at: string
  duration_seconds: number
  client_id: string | null
  group_id?: string | null
  time_entry_id?: string | null
  is_hidden?: boolean
  source: string
}

interface ActivityGroup {
  id: string
  client_id: string | null
  time_entry_id: string | null
  name: string | null
  activities: BrowserActivity[]
}

function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (secs === 0) return `${mins}m`
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`
  return `${mins}m ${secs}s`
}

function getTodayLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function getLocalDayRange(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  const start = new Date(y, m - 1, d, 0, 0, 0, 0)
  const end = new Date(y, m - 1, d, 23, 59, 59, 999)
  return { startISO: start.toISOString(), endISO: end.toISOString() }
}

function getMinutesFromMidnight(isoString: string) {
  const d = new Date(isoString)
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60
}

const MIN_BLOCK_HEIGHT = 48

type TimelineItem = { type: "activity"; activity: BrowserActivity } | { type: "group"; group: ActivityGroup }

function computeLanes(items: TimelineItem[]) {
  const lanes: number[] = []
  const result: { item: TimelineItem; lane: number; startMin: number; endMin: number }[] = []
  for (const item of items) {
    const startMin = item.type === "activity"
      ? getMinutesFromMidnight(item.activity.started_at)
      : Math.min(...item.group.activities.map((a) => getMinutesFromMidnight(a.started_at)))
    const endMin = item.type === "activity"
      ? startMin + item.activity.duration_seconds / 60
      : Math.max(...item.group.activities.map((a) => getMinutesFromMidnight(a.started_at) + a.duration_seconds / 60))

    let lane = 0
    while (lane < lanes.length && lanes[lane] > startMin) lane++
    lanes[lane] = endMin
    result.push({ item, lane, startMin, endMin })
  }
  return { items: result, maxLanes: lanes.length }
}

const ZOOM_CONFIG = {
  15: { pxPerHour: 72, labelsPerHour: 4 },
  30: { pxPerHour: 56, labelsPerHour: 2 },
  60: { pxPerHour: 48, labelsPerHour: 1 },
} as const

export default function ActivityTimelinePage() {
  const [selectedDate, setSelectedDate] = useState(getTodayLocal)
  const [activities, setActivities] = useState<BrowserActivity[]>([])
  const [groups, setGroups] = useState<ActivityGroup[]>([])
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [openCombos, setOpenCombos] = useState<Record<string, boolean>>({})
  const [selectedActivity, setSelectedActivity] = useState<BrowserActivity | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<ActivityGroup | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showHidden, setShowHidden] = useState(false)
  const [zoomMinutes, setZoomMinutes] = useState<15 | 30 | 60>(30)

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    loadData()
  }, [selectedDate, showHidden])

  const loadClients = async () => {
    try {
      const res = await fetch("/api/clients-list")
      if (res.ok) {
        const data = await res.json()
        setClients(Array.isArray(data) ? data : [])
      }
    } catch {
      // ignore
    }
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)
    setSelectedActivity(null)
    setSelectedGroup(null)
    setSelectedIds(new Set())
    try {
      const { startISO, endISO } = getLocalDayRange(selectedDate)
      const hiddenParam = showHidden ? "&include_hidden=true" : ""
      const [actRes, grpRes] = await Promise.all([
        fetch(`/api/browser-activity?start_date=${encodeURIComponent(startISO)}&end_date=${encodeURIComponent(endISO)}${hiddenParam}`),
        fetch(`/api/activity-groups?start_date=${encodeURIComponent(startISO)}&end_date=${encodeURIComponent(endISO)}${hiddenParam}`),
      ])
      if (!actRes.ok) {
        const err = await actRes.json()
        throw new Error(err.error || "Failed to load activity")
      }
      const actData = await actRes.json()
      setActivities(Array.isArray(actData) ? actData : [])
      const grpData = await grpRes.json()
      setGroups(Array.isArray(grpData) ? grpData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity")
      setActivities([])
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  const loadActivities = loadData

  const goToPreviousDay = () => {
    const [y, m, d] = selectedDate.split("-").map(Number)
    const prev = new Date(y, m - 1, d - 1)
    setSelectedDate(
      `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getDate()).padStart(2, "0")}`
    )
  }

  const goToNextDay = () => {
    const [y, m, d] = selectedDate.split("-").map(Number)
    const next = new Date(y, m - 1, d + 1)
    setSelectedDate(
      `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`
    )
  }

  const goToToday = () => setSelectedDate(getTodayLocal())

  const ungroupedActivities = activities.filter((a) => !a.group_id)
  const timelineItems: TimelineItem[] = [
    ...ungroupedActivities.map((a) => ({ type: "activity" as const, activity: a })),
    ...groups.map((g) => ({ type: "group" as const, group: g })),
  ].sort((a, b) => {
    const startA = a.type === "activity" ? getMinutesFromMidnight(a.activity.started_at) : Math.min(...a.group.activities.map((x) => getMinutesFromMidnight(x.started_at)))
    const startB = b.type === "activity" ? getMinutesFromMidnight(b.activity.started_at) : Math.min(...b.group.activities.map((x) => getMinutesFromMidnight(x.started_at)))
    return startA - startB
  })

  const totalMinutes =
    activities.reduce((sum, a) => sum + Math.round(a.duration_seconds / 60), 0)
  const isToday = selectedDate === getTodayLocal()

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const createGroup = async () => {
    if (selectedIds.size < 2) return
    setUpdatingId("group")
    try {
      const res = await fetch("/api/activity-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity_ids: [...selectedIds] }),
      })
      if (res.ok) await loadData()
    } catch {
      // ignore
    } finally {
      setUpdatingId(null)
    }
  }

  const assignGroupClient = async (groupId: string, clientId: string | null) => {
    setUpdatingId(groupId)
    try {
      const res = await fetch(`/api/activity-groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId || null }),
      })
      if (res.ok) {
        const data = await res.json()
        setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, ...data } : g)))
        setSelectedGroup((s) => (s?.id === groupId ? { ...s, ...data } : s))
      }
    } catch {
      // ignore
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleHide = async (activityId: string, hidden: boolean) => {
    setUpdatingId(activityId)
    try {
      const res = await fetch(`/api/browser-activity/${activityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_hidden: hidden }),
      })
      if (res.ok) {
        setActivities((prev) => prev.map((a) => (a.id === activityId ? { ...a, is_hidden: hidden } : a)))
        setSelectedActivity((s) => (s?.id === activityId ? { ...s, is_hidden: hidden } : s))
        setGroups((prev) =>
          prev.map((g) => ({
            ...g,
            activities: g.activities.map((a) => (a.id === activityId ? { ...a, is_hidden: hidden } : a)),
          }))
        )
        setSelectedGroup((s) =>
          s ? { ...s, activities: s.activities.map((a) => (a.id === activityId ? { ...a, is_hidden: hidden } : a)) } : s
        )
      }
    } catch {
      // ignore
    } finally {
      setUpdatingId(null)
    }
  }

  const bulkHide = async (hidden: boolean) => {
    if (selectedIds.size === 0) return
    setUpdatingId("bulk-hide")
    try {
      await Promise.all(
        [...selectedIds].map((id) =>
          fetch(`/api/browser-activity/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_hidden: hidden }),
          })
        )
      )
      setSelectedIds(new Set())
      await loadData()
    } catch {
      // ignore
    } finally {
      setUpdatingId(null)
    }
  }

  const ungroup = async (groupId: string) => {
    setUpdatingId(groupId)
    try {
      const res = await fetch(`/api/activity-groups/${groupId}`, { method: "DELETE" })
      if (res.ok) await loadData()
    } catch {
      // ignore
    } finally {
      setUpdatingId(null)
    }
  }

  const assignClient = async (activityId: string, clientId: string | null) => {
    setUpdatingId(activityId)
    try {
      const res = await fetch(`/api/browser-activity/${activityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId || null }),
      })
      if (res.ok) {
        setActivities((prev) =>
          prev.map((a) => (a.id === activityId ? { ...a, client_id: clientId } : a))
        )
        setSelectedActivity((prev) =>
          prev?.id === activityId ? { ...prev, client_id: clientId } : prev
        )
      }
    } catch {
      // ignore
    } finally {
      setUpdatingId(null)
    }
  }

  const { pxPerHour, labelsPerHour } = ZOOM_CONFIG[zoomMinutes]
  const hoursHeight = 24 * pxPerHour
  const timeLabels = Array.from({ length: 24 * labelsPerHour }, (_, i) => {
    const h = Math.floor(i / labelsPerHour)
    const m = (i % labelsPerHour) * (60 / labelsPerHour)
    return { h, m }
  })

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 mb-4">
                <Link
                  href="/admin/activity-list"
                  className="text-sm text-brand-gold hover:underline"
                >
                  List view →
                </Link>
              </div>
              <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-4">
                <span className="text-brand-gold font-medium text-sm">Analytics</span>
              </div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: "#060520" }}>
                Memory Aid
              </h1>
              <p className="text-gray-600">
                Chronologically displays your day — captured automatically as you browse
              </p>
            </div>

            {/* Controls bar */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={goToPreviousDay}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <Label className="text-xs text-gray-500">Day</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-[140px] h-9"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={goToNextDay}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              {!isToday && (
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-gray-500">Zoom</Label>
                <select
                  value={zoomMinutes}
                  onChange={(e) => setZoomMinutes(Number(e.target.value) as 15 | 30 | 60)}
                  className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm"
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHidden}
                  onChange={(e) => setShowHidden(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Show hidden</span>
              </label>
              <Button
                variant="ghost"
                size="icon"
                onClick={loadActivities}
                disabled={loading}
                className="ml-auto"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              {activities.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-brand-gold/10 rounded-lg">
                    <Clock className="h-4 w-4 text-brand-gold" />
                    <span className="font-semibold text-sm" style={{ color: "#060520" }}>
                      {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                    </span>
                    <span className="text-xs text-gray-600">
                      · {activities.length} activit{activities.length === 1 ? "y" : "ies"}
                    </span>
                  </div>
                  {selectedIds.size >= 1 && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => bulkHide(true)}
                        disabled={!!updatingId}
                        title="Hide selected from timeline"
                      >
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide {selectedIds.size}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => bulkHide(false)}
                        disabled={!!updatingId}
                        title="Unhide selected"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Unhide {selectedIds.size}
                      </Button>
                    </>
                  )}
                  {selectedIds.size >= 2 && (
                    <Button
                      size="sm"
                      onClick={createGroup}
                      disabled={!!updatingId}
                      className="bg-brand-gold text-[#010124] hover:bg-brand-gold/90"
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      Group {selectedIds.size} selected
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Main content: Memory Aid + Detail panel */}
            <div className="flex gap-6">
              {/* Memory Aid timeline */}
              <Card className="flex-1 min-w-0 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-32">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={loadActivities} variant="outline">
                      Try again
                    </Button>
                  </div>
                ) : timelineItems.length === 0 ? (
                  <div className="p-16 text-center">
                    <Globe className="h-14 w-14 mx-auto text-gray-300 mb-4" />
                    <h3 className="font-semibold mb-2" style={{ color: "#060520" }}>
                      No activity recorded for this date
                    </h3>
                    <p className="text-gray-600 text-sm max-w-md mx-auto mb-6">
                      Install the Hubflo Chrome extension and enable automatic tracking.
                      Activity is captured as you browse — no manual timers needed.
                    </p>
                    <div className="inline-flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-left max-w-md mx-auto">
                      <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">
                        Stay on a site 3+ seconds, then switch tabs. View Admin → Analytics → Activity Timeline.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex">
                    {/* Time scale */}
                    <div
                      className="shrink-0 border-r border-gray-200 bg-gray-50/80 py-4"
                      style={{ width: 52 }}
                    >
                      {timeLabels.map(({ h, m }) => (
                        <div
                          key={`${h}-${m}`}
                          className="text-xs text-gray-500 font-mono pl-2 pr-2"
                          style={{ height: pxPerHour / labelsPerHour }}
                        >
                          {h.toString().padStart(2, "0")}:{m.toString().padStart(2, "0")}
                        </div>
                      ))}
                    </div>
                    {/* Activity & group blocks */}
                    <div
                      className="relative flex-1 min-h-0 overflow-auto py-4 px-4"
                      style={{ minHeight: hoursHeight }}
                    >
                      {(() => {
                        const { items, maxLanes } = computeLanes(timelineItems)
                        const laneWidthPct = maxLanes > 0 ? (96 / maxLanes) - 0.5 : 96
                        return items.map(({ item, lane, startMin, endMin }) => {
                          const rangeMin = endMin - startMin
                          const totalSec = item.type === "activity"
                            ? item.activity.duration_seconds
                            : item.group.activities.reduce((s, a) => s + a.duration_seconds, 0)
                          const topPx = (startMin / 1440) * hoursHeight
                          const heightPx = Math.max(MIN_BLOCK_HEIGHT, (rangeMin / 1440) * hoursHeight)
                          const leftPct = 2 + lane * (96 / Math.max(1, maxLanes))
                          const isActivity = item.type === "activity"
                          const act = isActivity ? item.activity : null
                          const grp = !isActivity ? item.group : null
                          const id = isActivity ? act!.id : grp!.id
                          const isSelected = isActivity
                            ? selectedActivity?.id === act!.id
                            : selectedGroup?.id === grp!.id
                          const isChecked = isActivity && selectedIds.has(act!.id)

                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => {
                                if (isActivity) {
                                  setSelectedActivity(act!)
                                  setSelectedGroup(null)
                                } else {
                                  setSelectedGroup(grp!)
                                  setSelectedActivity(null)
                                }
                              }}
                              className={`absolute rounded-lg border text-left transition-all flex items-center gap-3 px-3 py-2 ${
                                isSelected
                                  ? "border-brand-gold bg-brand-gold/10 shadow-md"
                                  : (isActivity && act!.is_hidden)
                                    ? "border-amber-200 bg-amber-50/80 opacity-75"
                                    : "border-gray-200 bg-white hover:border-brand-gold/50 hover:bg-gray-50"
                              }`}
                              style={{
                                top: topPx,
                                left: `${leftPct}%`,
                                width: `${laneWidthPct}%`,
                                height: heightPx,
                                minHeight: MIN_BLOCK_HEIGHT,
                              }}
                            >
                              {isActivity && (
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    toggleSelect(act!.id)
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="shrink-0 rounded border-gray-300"
                                />
                              )}
                              <div className="shrink-0 w-8 h-8 rounded-lg bg-brand-gold/20 flex items-center justify-center">
                                {isActivity ? (
                                  <Globe className="h-4 w-4 text-brand-gold" />
                                ) : (
                                  <Layers className="h-4 w-4 text-brand-gold" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate" style={{ color: "#060520" }}>
                                  {isActivity
                                    ? act!.page_title || act!.domain || "Untitled"
                                    : `Group · ${grp!.activities.length} activities`}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {isActivity
                                    ? `${formatTime(act!.started_at)} – ${formatTime(act!.ended_at)}`
                                    : `${formatTime(grp!.activities[0]?.started_at || "")} – ${formatTime(grp!.activities[grp!.activities.length - 1]?.ended_at || "")}`}
                                </p>
                              </div>
                              <span className="shrink-0 text-xs font-medium text-gray-600">
                                {formatDuration(totalSec)}
                              </span>
                            </button>
                          )
                        })
                      })()}
                    </div>
                  </div>
                )}
              </Card>

              {/* Detail panel */}
              <Card
                className={`w-80 shrink-0 rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all ${
                  selectedActivity || selectedGroup ? "opacity-100" : "opacity-60"
                }`}
              >
                <div className="p-4 border-b border-gray-200 bg-gray-50/80">
                  <h3 className="font-semibold text-sm" style={{ color: "#060520" }}>
                    {selectedGroup ? "Group details" : "Activity details"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedGroup
                      ? "Grouped activities — assign to client to log time"
                      : "Click an activity to view and assign. Check to group."}
                  </p>
                </div>
                <div className="p-4 overflow-auto" style={{ maxHeight: 520 }}>
                  {selectedGroup ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total duration</p>
                        <p className="text-sm font-medium">
                          {formatDuration(selectedGroup.activities.reduce((s, a) => s + a.duration_seconds, 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Contains ({selectedGroup.activities.length})</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {selectedGroup.activities.map((a) => (
                            <div
                              key={a.id}
                              className={`flex items-center justify-between gap-2 py-1.5 px-2 rounded text-xs transition-colors ${a.is_hidden ? "bg-amber-50/80" : "bg-gray-50 hover:bg-gray-100"}`}
                            >
                              <a
                                href={a.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate flex-1 text-brand-gold hover:underline"
                                title={a.page_title || a.url || ""}
                              >
                                {a.page_title || a.domain || "Untitled"}
                              </a>
                              <span className="shrink-0 text-gray-500">{formatDuration(a.duration_seconds)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 shrink-0"
                                onClick={() => toggleHide(a.id, !a.is_hidden)}
                                disabled={!!updatingId}
                                title={a.is_hidden ? "Unhide" : "Hide"}
                              >
                                {a.is_hidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Assign group to client</p>
                        <Popover
                          open={!!openCombos[`group-${selectedGroup.id}`]}
                          onOpenChange={(open) =>
                            setOpenCombos((p) => ({ ...p, [`group-${selectedGroup.id}`]: open }))
                          }
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between h-9 text-sm font-normal"
                              disabled={updatingId === selectedGroup.id}
                            >
                              {selectedGroup.client_id
                                ? clients.find((c) => c.id === selectedGroup.client_id)?.name || "Unknown"
                                : "No client"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Type to search clients..." />
                              <CommandList>
                                <CommandEmpty>No client found.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    value="No client"
                                    onSelect={() => {
                                      assignGroupClient(selectedGroup.id, null)
                                      setOpenCombos((p) => ({ ...p, [`group-${selectedGroup.id}`]: false }))
                                    }}
                                  >
                                    <Check className={`mr-2 h-4 w-4 ${!selectedGroup.client_id ? "opacity-100" : "opacity-0"}`} />
                                    <span className="text-gray-500">No client</span>
                                  </CommandItem>
                                  {clients.map((c) => (
                                    <CommandItem
                                      key={c.id}
                                      value={c.name}
                                      onSelect={() => {
                                        assignGroupClient(selectedGroup.id, c.id)
                                        setOpenCombos((p) => ({ ...p, [`group-${selectedGroup.id}`]: false }))
                                      }}
                                    >
                                      <Check className={`mr-2 h-4 w-4 ${selectedGroup.client_id === c.id ? "opacity-100" : "opacity-0"}`} />
                                      {c.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-amber-700 border-amber-200 hover:bg-amber-50"
                        onClick={() => ungroup(selectedGroup.id)}
                        disabled={!!updatingId}
                      >
                        <Ungroup className="h-4 w-4 mr-2" />
                        Ungroup
                      </Button>
                    </div>
                  ) : selectedActivity ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Page</p>
                        <a
                          href={selectedActivity.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-brand-gold hover:underline break-all flex items-center gap-1"
                        >
                          {selectedActivity.page_title || selectedActivity.url}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">URL</p>
                        <p className="text-xs text-gray-600 break-all">{selectedActivity.url}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Time</p>
                        <p className="text-sm font-mono">
                          {formatTime(selectedActivity.started_at)} – {formatTime(selectedActivity.ended_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Duration</p>
                        <p className="text-sm font-medium">{formatDuration(selectedActivity.duration_seconds)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Hide from timeline</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => toggleHide(selectedActivity.id, !selectedActivity.is_hidden)}
                          disabled={!!updatingId}
                        >
                          {selectedActivity.is_hidden ? (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Unhide
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Hide (e.g. lunch browsing)
                            </>
                          )}
                        </Button>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Assign to client</p>
                        <Popover
                          open={!!openCombos[selectedActivity.id]}
                          onOpenChange={(open) =>
                            setOpenCombos((p) => ({ ...p, [selectedActivity.id]: open }))
                          }
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between h-9 text-sm font-normal"
                              disabled={updatingId === selectedActivity.id}
                            >
                              {selectedActivity.client_id
                                ? clients.find((c) => c.id === selectedActivity.client_id)?.name || "Unknown"
                                : "No client"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Type to search clients..." />
                              <CommandList>
                                <CommandEmpty>No client found.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    value="No client"
                                    onSelect={() => {
                                      assignClient(selectedActivity.id, null)
                                      setOpenCombos((p) => ({ ...p, [selectedActivity.id]: false }))
                                    }}
                                  >
                                    <Check className={`mr-2 h-4 w-4 ${!selectedActivity.client_id ? "opacity-100" : "opacity-0"}`} />
                                    <span className="text-gray-500">No client</span>
                                  </CommandItem>
                                  {clients.map((c) => (
                                    <CommandItem
                                      key={c.id}
                                      value={c.name}
                                      onSelect={() => {
                                        assignClient(selectedActivity.id, c.id)
                                        setOpenCombos((p) => ({ ...p, [selectedActivity.id]: false }))
                                      }}
                                    >
                                      <Check className={`mr-2 h-4 w-4 ${selectedActivity.client_id === c.id ? "opacity-100" : "opacity-0"}`} />
                                      {c.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Zap className="h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500">Select an activity or group. Check activities to group them together.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
