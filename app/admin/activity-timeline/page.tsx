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
  Briefcase,
  Calendar,
  Coffee,
  Trash2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getWorkHoursSeconds } from "@/lib/workHours"
import {
  ACTIVITY_GROUP_CATEGORIES,
  getCategoryLabel,
  getCategoryColor,
  MANUAL_BLOCK_CATEGORIES,
} from "@/lib/activityCategories"

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
  category?: string | null
  activities: BrowserActivity[]
}

interface ManualTimeBlock {
  id: string
  started_at: string
  ended_at: string
  category: string
  label: string | null
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

// Visual bar: 6am–10pm = 360–1320 minutes from midnight
const TIMELINE_DAY_START_MIN = 6 * 60
const TIMELINE_DAY_END_MIN = 22 * 60
const TIMELINE_DAY_SPAN_MIN = TIMELINE_DAY_END_MIN - TIMELINE_DAY_START_MIN

function getGroupBarPosition(grp: ActivityGroup): { leftPercent: number; widthPercent: number } {
  const startMin = Math.min(...grp.activities.map((a) => getMinutesFromMidnight(a.started_at)))
  const endMin = Math.max(...grp.activities.map((a) => getMinutesFromMidnight(a.ended_at)))
  const blockStart = Math.max(startMin, TIMELINE_DAY_START_MIN)
  const blockEnd = Math.min(endMin, TIMELINE_DAY_END_MIN)
  const widthMin = Math.max(0, blockEnd - blockStart)
  return {
    leftPercent: ((blockStart - TIMELINE_DAY_START_MIN) / TIMELINE_DAY_SPAN_MIN) * 100,
    widthPercent: (widthMin / TIMELINE_DAY_SPAN_MIN) * 100,
  }
}

function getManualBlockBarPosition(block: ManualTimeBlock): { leftPercent: number; widthPercent: number } {
  const startMin = getMinutesFromMidnight(block.started_at)
  const endMin = getMinutesFromMidnight(block.ended_at)
  const blockStart = Math.max(startMin, TIMELINE_DAY_START_MIN)
  const blockEnd = Math.min(endMin, TIMELINE_DAY_END_MIN)
  const widthMin = Math.max(0, blockEnd - blockStart)
  return {
    leftPercent: ((blockStart - TIMELINE_DAY_START_MIN) / TIMELINE_DAY_SPAN_MIN) * 100,
    widthPercent: (widthMin / TIMELINE_DAY_SPAN_MIN) * 100,
  }
}

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
  const [manualBlocks, setManualBlocks] = useState<ManualTimeBlock[]>([])
  const [selectedBlock, setSelectedBlock] = useState<ManualTimeBlock | null>(null)
  const [addBlockDialogOpen, setAddBlockDialogOpen] = useState(false)
  const [addBlockStart, setAddBlockStart] = useState("12:00")
  const [addBlockEnd, setAddBlockEnd] = useState("13:00")
  const [addBlockCategory, setAddBlockCategory] = useState("lunch")

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
    setSelectedBlock(null)
    setSelectedIds(new Set())
    try {
      const { startISO, endISO } = getLocalDayRange(selectedDate)
      const hiddenParam = showHidden ? "&include_hidden=true" : ""
      const [actRes, grpRes, blocksRes] = await Promise.all([
        fetch(`/api/browser-activity?start_date=${encodeURIComponent(startISO)}&end_date=${encodeURIComponent(endISO)}${hiddenParam}`),
        fetch(`/api/activity-groups?start_date=${encodeURIComponent(startISO)}&end_date=${encodeURIComponent(endISO)}${hiddenParam}`),
        fetch(`/api/manual-time-blocks?start_date=${encodeURIComponent(startISO)}&end_date=${encodeURIComponent(endISO)}`),
      ])
      if (!actRes.ok) {
        const err = await actRes.json()
        throw new Error(err.error || "Failed to load activity")
      }
      const actData = await actRes.json()
      setActivities(Array.isArray(actData) ? actData : [])
      const grpData = await grpRes.json()
      setGroups(Array.isArray(grpData) ? grpData : [])
      const blocksData = blocksRes.ok ? await blocksRes.json() : []
      setManualBlocks(Array.isArray(blocksData) ? blocksData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity")
      setActivities([])
      setGroups([])
      setManualBlocks([])
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
  const groupsSorted = [...groups].sort((a, b) => {
    const startA = Math.min(...a.activities.map((x) => getMinutesFromMidnight(x.started_at)))
    const startB = Math.min(...b.activities.map((x) => getMinutesFromMidnight(x.started_at)))
    return startA - startB
  })

  const totalGroupMinutes = groupsSorted.reduce(
    (sum, g) => sum + Math.round(g.activities.reduce((s, a) => s + a.duration_seconds, 0) / 60),
    0
  )
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

  const renameGroup = async (groupId: string, name: string | null) => {
    setUpdatingId(groupId)
    try {
      const res = await fetch(`/api/activity-groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || null }),
      })
      if (res.ok) {
        const data = await res.json()
        setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, name: data.name ?? name } : g)))
        setSelectedGroup((s) => (s?.id === groupId ? { ...s, name: data.name ?? name ?? s.name } : s))
      }
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

  const updateGroupCategory = async (groupId: string, category: string | null) => {
    setUpdatingId(groupId)
    try {
      const res = await fetch(`/api/activity-groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: category || null }),
      })
      if (res.ok) {
        const data = await res.json()
        setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, category: data.category ?? category } : g)))
        setSelectedGroup((s) => (s?.id === groupId ? { ...s, category: data.category ?? category ?? s.category } : s))
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

  const createManualBlock = async () => {
    const [y, m, d] = selectedDate.split("-").map(Number)
    const startDate = new Date(y, m - 1, d, ...addBlockStart.split(":").map(Number), 0, 0)
    const endDate = new Date(y, m - 1, d, ...addBlockEnd.split(":").map(Number), 0, 0)
    if (endDate.getTime() <= startDate.getTime()) return
    setUpdatingId("add-block")
    try {
      const res = await fetch("/api/manual-time-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          started_at: startDate.toISOString(),
          ended_at: endDate.toISOString(),
          category: addBlockCategory,
        }),
      })
      if (res.ok) {
        setAddBlockDialogOpen(false)
        await loadData()
      }
    } catch {
      // ignore
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteManualBlock = async (blockId: string) => {
    setUpdatingId(blockId)
    try {
      const res = await fetch(`/api/manual-time-blocks/${blockId}`, { method: "DELETE" })
      if (res.ok) {
        setSelectedBlock(null)
        await loadData()
      }
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

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-4 mb-4">
                <Link href="/admin/activity-list" className="text-sm text-brand-gold hover:underline">
                  List view →
                </Link>
                <Link href="/admin/analytics/activity" className="text-sm text-brand-gold hover:underline">
                  Activity analytics →
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
              {groupsSorted.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-brand-gold/10 rounded-lg">
                    <Clock className="h-4 w-4 text-brand-gold" />
                    <span className="font-semibold text-sm" style={{ color: "#060520" }}>
                      {Math.floor(totalGroupMinutes / 60)}h {totalGroupMinutes % 60}m
                    </span>
                    <span className="text-xs text-gray-600">
                      · {groupsSorted.length} group{groupsSorted.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddBlockDialogOpen(true)}
                className="border-gray-300"
              >
                <Coffee className="h-4 w-4 mr-2" />
                Add lunch / block
              </Button>
              <p className="text-xs text-gray-500">
                To group or hide activities, use <Link href="/admin/activity-list" className="text-brand-gold hover:underline">List view</Link>.
              </p>
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
                ) : groupsSorted.length === 0 && manualBlocks.length === 0 ? (
                  <div className="p-16 text-center">
                    <Layers className="h-14 w-14 mx-auto text-gray-300 mb-4" />
                    <h3 className="font-semibold mb-2" style={{ color: "#060520" }}>
                      No groups or blocks for this date
                    </h3>
                    <p className="text-gray-600 text-sm max-w-md mx-auto mb-6">
                      Use List view to group activities, or add a lunch/break block below.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <Link href="/admin/activity-list">
                        <Button variant="outline" className="text-brand-gold border-brand-gold/50 hover:bg-brand-gold/10">
                          Open List view
                        </Button>
                      </Link>
                      <Button variant="outline" onClick={() => setAddBlockDialogOpen(true)}>
                        <Coffee className="h-4 w-4 mr-2" />
                        Add lunch block
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Visual timeline bar: 6am–10pm, groups (gold) + manual blocks (gray) */}
                    <div className="px-4 pt-4 pb-2 border-b border-gray-100">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] text-gray-500 font-mono">6am</span>
                        <div className="flex-1 relative h-8 rounded-lg bg-gray-100 overflow-hidden">
                          {manualBlocks.map((block) => {
                            const { leftPercent, widthPercent } = getManualBlockBarPosition(block)
                            if (widthPercent <= 0) return null
                            const isSelected = selectedBlock?.id === block.id
                            return (
                              <button
                                key={block.id}
                                type="button"
                                onClick={() => {
                                  setSelectedBlock(block)
                                  setSelectedGroup(null)
                                  setSelectedActivity(null)
                                }}
                                className="absolute top-0.5 bottom-0.5 rounded-md transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                                style={{
                                  left: `${leftPercent}%`,
                                  width: `${widthPercent}%`,
                                  backgroundColor: isSelected ? "rgb(107 114 128)" : "rgba(107, 114, 128, 0.5)",
                                  minWidth: 4,
                                }}
                                title={getCategoryLabel(block.category, MANUAL_BLOCK_CATEGORIES) || block.category}
                              />
                            )
                          })}
                          {groupsSorted.map((grp) => {
                            const { leftPercent, widthPercent } = getGroupBarPosition(grp)
                            if (widthPercent <= 0) return null
                            const isSelected = selectedGroup?.id === grp.id
                            const color = getCategoryColor(grp.category)
                            return (
                              <button
                                key={grp.id}
                                type="button"
                                onClick={() => {
                                  setSelectedGroup(grp)
                                  setSelectedActivity(null)
                                  setSelectedBlock(null)
                                }}
                                className="absolute top-0.5 bottom-0.5 rounded-md transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1"
                                style={{
                                  left: `${leftPercent}%`,
                                  width: `${widthPercent}%`,
                                  backgroundColor: isSelected ? color.bar : color.barMuted,
                                  minWidth: 4,
                                }}
                                title={`${grp.name ?? "Group"}${grp.category ? ` · ${getCategoryLabel(grp.category, ACTIVITY_GROUP_CATEGORIES)}` : ""}`}
                              />
                            )
                          })}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">10pm</span>
                      </div>
                      <p className="text-[10px] text-gray-500">Bar color = category (Call=blue, Prep=amber, Lunch=gray, etc.) · Gray = lunch/break blocks</p>
                    </div>
                    <div className="overflow-y-auto py-4 px-4 space-y-3">
                    {groupsSorted.map((grp) => {
                      const totalSec = grp.activities.reduce((s, a) => s + a.duration_seconds, 0)
                      const workSec = grp.activities.reduce(
                        (s, a) => s + getWorkHoursSeconds(a.started_at, a.ended_at),
                        0
                      )
                      const isWorkHours = workSec >= totalSec / 2
                      const isSelected = selectedGroup?.id === grp.id
                      const color = getCategoryColor(grp.category)

                      return (
                        <button
                          key={grp.id}
                          type="button"
                          onClick={() => {
                            setSelectedGroup(grp)
                            setSelectedActivity(null)
                            setSelectedBlock(null)
                          }}
                          className={`w-full rounded-lg border text-left transition-all flex items-center gap-3 px-4 py-3 ${
                            isSelected ? "shadow-md" : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                          style={
                            isSelected
                              ? { borderColor: color.border, backgroundColor: color.bg }
                              : undefined
                          }
                        >
                          <div
                            className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: color.barMuted,
                              color: color.bar,
                            }}
                          >
                            <Layers className="h-5 w-5" style={{ color: color.bar }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" style={{ color: "#060520" }}>
                              {grp.name
                                ? `${grp.name} · ${grp.activities.length}`
                                : `Group · ${grp.activities.length} activities`}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {formatTime(grp.activities[0]?.started_at || "")} – {formatTime(grp.activities[grp.activities.length - 1]?.ended_at || "")}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-medium text-gray-600">
                            {formatDuration(totalSec)}
                          </span>
                          <span
                            className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded ${
                              isWorkHours ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}
                            title={isWorkHours ? "Work hours (9–5 Mon–Fri)" : "Outside work hours"}
                          >
                            {isWorkHours ? (
                              <Briefcase className="h-3 w-3 inline" />
                            ) : (
                              <Calendar className="h-3 w-3 inline" />
                            )}
                          </span>
                        </button>
                      )
                    })}
                    {manualBlocks.length > 0 && (
                      <>
                        <p className="text-xs font-medium text-gray-500 px-1 pt-2 pb-1">Lunch / breaks</p>
                        {manualBlocks.map((block) => {
                          const dur = Math.round(
                            (new Date(block.ended_at).getTime() - new Date(block.started_at).getTime()) / 1000
                          )
                          const isSelected = selectedBlock?.id === block.id
                          return (
                            <button
                              key={block.id}
                              type="button"
                              onClick={() => {
                                setSelectedBlock(block)
                                setSelectedGroup(null)
                                setSelectedActivity(null)
                              }}
                              className={`w-full rounded-lg border text-left transition-all flex items-center gap-3 px-4 py-3 ${
                                isSelected
                                  ? "border-gray-400 bg-gray-100 shadow-md"
                                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Coffee className="h-5 w-5 text-gray-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate" style={{ color: "#060520" }}>
                                  {getCategoryLabel(block.category, MANUAL_BLOCK_CATEGORIES) || block.category}
                                  {block.label ? ` · ${block.label}` : ""}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {formatTime(block.started_at)} – {formatTime(block.ended_at)}
                                </p>
                              </div>
                              <span className="shrink-0 text-sm font-medium text-gray-600">
                                {formatDuration(dur)}
                              </span>
                            </button>
                          )
                        })}
                      </>
                    )}
                  </div>
                  </>
                )}
              </Card>

              {/* Detail panel */}
              <Card
                className={`w-80 shrink-0 rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all ${
                  selectedActivity || selectedGroup || selectedBlock ? "opacity-100" : "opacity-60"
                }`}
              >
                <div className="p-4 border-b border-gray-200 bg-gray-50/80">
                  <h3 className="font-semibold text-sm" style={{ color: "#060520" }}>
                    {selectedBlock ? "Block details" : selectedGroup ? "Group details" : "Activity details"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedBlock
                      ? "Lunch, break, or other non-browsing time"
                      : selectedGroup
                        ? "Grouped activities — assign to client to log time"
                        : "Click a group or block to view details."}
                  </p>
                </div>
                <div className="p-4 overflow-auto" style={{ maxHeight: 520 }}>
                  {selectedBlock ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Time</p>
                        <p className="text-sm font-medium">
                          {formatTime(selectedBlock.started_at)} – {formatTime(selectedBlock.ended_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Duration</p>
                        <p className="text-sm font-medium">
                          {formatDuration(
                            Math.round(
                              (new Date(selectedBlock.ended_at).getTime() - new Date(selectedBlock.started_at).getTime()) / 1000
                            )
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Category</p>
                        <p className="text-sm font-medium">
                          {getCategoryLabel(selectedBlock.category, MANUAL_BLOCK_CATEGORIES) || selectedBlock.category}
                        </p>
                      </div>
                      {selectedBlock.label && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Label</p>
                          <p className="text-sm">{selectedBlock.label}</p>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => deleteManualBlock(selectedBlock.id)}
                        disabled={!!updatingId}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete block
                      </Button>
                    </div>
                  ) : selectedGroup ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Group name</p>
                        <Input
                          placeholder="e.g. Client research"
                          value={selectedGroup.name ?? ""}
                          onChange={(e) =>
                            setSelectedGroup((s) => (s ? { ...s, name: e.target.value || null } : s))
                          }
                          onBlur={() => {
                            const trimmed = (selectedGroup.name ?? "").trim() || null
                            renameGroup(selectedGroup.id, trimmed)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur()
                            }
                          }}
                          className="h-9 text-sm"
                          disabled={!!updatingId}
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total duration</p>
                        <p className="text-sm font-medium">
                          {formatDuration(selectedGroup.activities.reduce((s, a) => s + a.duration_seconds, 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Category</p>
                        <select
                          value={selectedGroup.category ?? ""}
                          onChange={(e) => {
                            const val = e.target.value || null
                            setSelectedGroup((s) => (s ? { ...s, category: val } : s))
                            updateGroupCategory(selectedGroup.id, val)
                          }}
                          className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
                          disabled={!!updatingId}
                        >
                          {ACTIVITY_GROUP_CATEGORIES.map((c) => (
                            <option key={c.value || "none"} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
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
                      <p className="text-sm text-gray-500">Select a group or block. Use List view to group activities.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={addBlockDialogOpen} onOpenChange={setAddBlockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add lunch or break block</DialogTitle>
            <DialogDescription>
              Add a block of time with no browser activity (e.g. lunch, break). Uses the selected day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Start time</Label>
                <Input
                  type="time"
                  value={addBlockStart}
                  onChange={(e) => setAddBlockStart(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">End time</Label>
                <Input
                  type="time"
                  value={addBlockEnd}
                  onChange={(e) => setAddBlockEnd(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Category</Label>
              <select
                value={addBlockCategory}
                onChange={(e) => setAddBlockCategory(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
              >
                {MANUAL_BLOCK_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddBlockDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={createManualBlock}
                disabled={!!updatingId || addBlockStart >= addBlockEnd}
                className="bg-brand-gold text-[#010124] hover:bg-brand-gold/90"
              >
                {updatingId === "add-block" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add block"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PasswordProtection>
  )
}
