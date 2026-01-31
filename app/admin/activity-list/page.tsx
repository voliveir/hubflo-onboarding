"use client"

import React, { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Clock,
  Globe,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Layers,
  Ungroup,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  EyeOff,
  Eye,
} from "lucide-react"
import Link from "next/link"

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
    second: "2-digit",
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

export default function ActivityListPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayLocal)
  const [activities, setActivities] = useState<BrowserActivity[]>([])
  const [groups, setGroups] = useState<ActivityGroup[]>([])
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [groupClientId, setGroupClientId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [openCombos, setOpenCombos] = useState<Record<string, boolean>>({})
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [showHidden, setShowHidden] = useState(false)

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
        throw new Error(err.error || "Failed to load")
      }
      const actData = await actRes.json()
      setActivities(Array.isArray(actData) ? actData : [])
      const grpData = await grpRes.json()
      setGroups(Array.isArray(grpData) ? grpData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
      setActivities([])
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  const ungroupedActivities = activities.filter((a) => !a.group_id)
  const totalMinutes = activities.reduce((s, a) => s + Math.round(a.duration_seconds / 60), 0)
  const isToday = selectedDate === getTodayLocal()

  const goToPreviousDay = () => {
    const [y, m, d] = selectedDate.split("-").map(Number)
    const prev = new Date(y, m - 1, d - 1)
    setSelectedDate(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getDate()).padStart(2, "0")}`)
  }

  const goToNextDay = () => {
    const [y, m, d] = selectedDate.split("-").map(Number)
    const next = new Date(y, m - 1, d + 1)
    setSelectedDate(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllUngrouped = () => {
    if (selectedIds.size === ungroupedActivities.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(ungroupedActivities.map((a) => a.id)))
    }
  }

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  const createGroupAndAssign = async () => {
    if (selectedIds.size < 2 || !groupClientId) return
    setUpdatingId("group")
    try {
      const createRes = await fetch("/api/activity-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity_ids: [...selectedIds] }),
      })
      if (createRes.ok) {
        const grp = await createRes.json()
        await fetch(`/api/activity-groups/${grp.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: groupClientId }),
        })
        setGroupDialogOpen(false)
        setGroupClientId(null)
        await loadData()
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
      if (res.ok) await loadData()
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

  const toggleHide = async (activityId: string, hidden: boolean) => {
    setUpdatingId(activityId)
    try {
      const res = await fetch(`/api/browser-activity/${activityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_hidden: hidden }),
      })
      if (res.ok) await loadData()
    } catch {
      // ignore
    } finally {
      setUpdatingId(null)
    }
  }

  const assignActivityClient = async (activityId: string, clientId: string | null) => {
    setUpdatingId(activityId)
    try {
      const res = await fetch(`/api/browser-activity/${activityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId || null }),
      })
      if (res.ok) await loadData()
    } catch {
      // ignore
    } finally {
      setUpdatingId(null)
    }
  }

  const getClientName = (id: string | null) =>
    id ? clients.find((c) => c.id === id)?.name || "—" : "—"

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 mb-4">
                <Link
                  href="/admin/activity-timeline"
                  className="text-sm text-brand-gold hover:underline"
                >
                  ← Timeline view
                </Link>
              </div>
              <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-4">
                <span className="text-brand-gold font-medium text-sm">Analytics</span>
              </div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: "#060520" }}>
                Activity list
              </h1>
              <p className="text-gray-600">
                Spreadsheet view — select activities to group into a project and assign to a client
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={goToPreviousDay}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <Label className="text-xs text-gray-500">Date</Label>
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
                <Button variant="outline" size="sm" onClick={() => setSelectedDate(getTodayLocal())}>
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
              <Button variant="ghost" size="icon" onClick={loadData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              {activities.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-brand-gold/10 rounded-lg">
                    <Clock className="h-4 w-4 text-brand-gold" />
                    <span className="font-semibold text-sm">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</span>
                    <span className="text-xs text-gray-600">· {activities.length} activities</span>
                  </div>
                  {selectedIds.size >= 2 && (
                    <Button
                      size="sm"
                      onClick={() => setGroupDialogOpen(true)}
                      disabled={!!updatingId}
                      className="bg-brand-gold text-[#010124] hover:bg-brand-gold/90"
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      Group {selectedIds.size} → assign client
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex justify-center py-24">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={loadData} variant="outline">Try again</Button>
                </div>
              ) : activities.length === 0 ? (
                <div className="p-16 text-center text-gray-500">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No activity for this date. Use the timeline to view, or try another date.</p>
                  <Link href="/admin/activity-timeline" className="text-brand-gold hover:underline mt-2 inline-block">
                    Go to Timeline
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-10">
                        {ungroupedActivities.length > 0 && (
                          <input
                            type="checkbox"
                            checked={selectedIds.size === ungroupedActivities.length && ungroupedActivities.length > 0}
                            onChange={selectAllUngrouped}
                            className="rounded border-gray-300"
                          />
                        )}
                      </TableHead>
                      <TableHead className="font-semibold">Start</TableHead>
                      <TableHead className="font-semibold">End</TableHead>
                      <TableHead className="font-semibold">Duration</TableHead>
                      <TableHead className="font-semibold">Page / URL</TableHead>
                      <TableHead className="font-semibold">Domain</TableHead>
                      <TableHead className="font-semibold">Client</TableHead>
                      <TableHead className="font-semibold w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Ungrouped activities */}
                    {ungroupedActivities
                      .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
                      .map((a) => (
                        <TableRow key={a.id} className={`hover:bg-gray-50/50 ${a.is_hidden ? "bg-amber-50/50" : ""}`}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(a.id)}
                              onChange={() => toggleSelect(a.id)}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">{formatTime(a.started_at)}</TableCell>
                          <TableCell className="font-mono text-sm">{formatTime(a.ended_at)}</TableCell>
                          <TableCell className="font-medium">{formatDuration(a.duration_seconds)}</TableCell>
                          <TableCell>
                            <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline truncate block max-w-xs" title={a.url}>
                              {a.page_title || a.domain || a.url}
                            </a>
                          </TableCell>
                          <TableCell className="text-gray-600">{a.domain || "—"}</TableCell>
                          <TableCell>
                            <Popover open={!!openCombos[a.id]} onOpenChange={(o) => setOpenCombos((p) => ({ ...p, [a.id]: o }))}>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 text-xs" disabled={!!updatingId}>
                                  {getClientName(a.client_id)}
                                  <ChevronsUpDown className="ml-1 h-3 w-3" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-56 p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Search client..." />
                                  <CommandList>
                                    <CommandEmpty>No client found</CommandEmpty>
                                    <CommandGroup>
                                      <CommandItem value="No client" onSelect={() => { assignActivityClient(a.id, null); setOpenCombos((p) => ({ ...p, [a.id]: false })) }}>
                                        <Check className="mr-2 h-4 w-4" />
                                        No client
                                      </CommandItem>
                                      {clients.map((c) => (
                                        <CommandItem key={c.id} value={c.name} onSelect={() => { assignActivityClient(a.id, c.id); setOpenCombos((p) => ({ ...p, [a.id]: false })) }}>
                                          <Check className="mr-2 h-4 w-4" />
                                          {c.name}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => toggleHide(a.id, !a.is_hidden)}
                              disabled={!!updatingId}
                              title={a.is_hidden ? "Unhide" : "Hide from timeline"}
                            >
                              {a.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            {a.is_hidden && <span className="text-xs text-amber-600 ml-1">Hidden</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    {/* Groups */}
                    {groups
                      .sort((a, b) =>
                        new Date(a.activities[0]?.started_at || 0).getTime() - new Date(b.activities[0]?.started_at || 0).getTime()
                      )
                      .map((g) => {
                        const totalSec = g.activities.reduce((s, a) => s + a.duration_seconds, 0)
                        const start = g.activities[0]?.started_at
                        const end = g.activities[g.activities.length - 1]?.ended_at
                        const isExpanded = expandedGroups.has(g.id)
                        return (
                          <React.Fragment key={g.id}>
                            <TableRow className="bg-brand-gold/5 hover:bg-brand-gold/10">
                              <TableCell>
                                <button type="button" onClick={() => toggleGroupExpand(g.id)} className="p-0.5">
                                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                                </button>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{start ? formatTime(start) : "—"}</TableCell>
                              <TableCell className="font-mono text-sm">{end ? formatTime(end) : "—"}</TableCell>
                              <TableCell className="font-medium">{formatDuration(totalSec)}</TableCell>
                              <TableCell>
                                <span className="inline-flex items-center gap-1 text-sm">
                                  <Layers className="h-4 w-4 text-brand-gold" />
                                  Group · {g.activities.length} activities
                                </span>
                              </TableCell>
                              <TableCell>—</TableCell>
                              <TableCell>
                                <Popover open={!!openCombos[`g-${g.id}`]} onOpenChange={(o) => setOpenCombos((p) => ({ ...p, [`g-${g.id}`]: o }))}>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" disabled={!!updatingId}>
                                      {getClientName(g.client_id)}
                                      <ChevronsUpDown className="ml-1 h-3 w-3" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-56 p-0" align="start">
                                    <Command>
                                      <CommandInput placeholder="Search client..." />
                                      <CommandList>
                                        <CommandGroup>
                                          <CommandItem value="No client" onSelect={() => { assignGroupClient(g.id, null); setOpenCombos((p) => ({ ...p, [`g-${g.id}`]: false })) }}>
                                            <Check className="mr-2 h-4 w-4" /> No client
                                          </CommandItem>
                                          {clients.map((c) => (
                                            <CommandItem key={c.id} value={c.name} onSelect={() => { assignGroupClient(g.id, c.id); setOpenCombos((p) => ({ ...p, [`g-${g.id}`]: false })) }}>
                                              <Check className="mr-2 h-4 w-4" /> {c.name}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="h-7 text-amber-700" onClick={() => ungroup(g.id)} disabled={!!updatingId}>
                                  <Ungroup className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                            {isExpanded && g.activities.map((a) => (
                              <TableRow key={a.id} className={`bg-gray-50/50 ${a.is_hidden ? "opacity-60" : ""}`}>
                                <TableCell className="pl-12"></TableCell>
                                <TableCell className="font-mono text-xs text-gray-600">{formatTime(a.started_at)}</TableCell>
                                <TableCell className="font-mono text-xs text-gray-600">{formatTime(a.ended_at)}</TableCell>
                                <TableCell className="text-xs">{formatDuration(a.duration_seconds)}</TableCell>
                                <TableCell>
                                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline text-xs truncate block max-w-xs">
                                    {a.page_title || a.domain || a.url}
                                  </a>
                                </TableCell>
                                <TableCell className="text-xs text-gray-500">{a.domain || "—"}</TableCell>
                                <TableCell></TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={() => toggleHide(a.id, !a.is_hidden)}
                                    disabled={!!updatingId}
                                    title={a.is_hidden ? "Unhide" : "Hide"}
                                  >
                                    {a.is_hidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </React.Fragment>
                        )
                      })}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Group and assign to client</DialogTitle>
            <DialogDescription>
              Combine {selectedIds.size} activities into one project and assign to a client. A single time entry will be created for the total duration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Client</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between mt-2">
                    {groupClientId ? getClientName(groupClientId) : "Select client"}
                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Type to search clients..." />
                    <CommandList>
                      <CommandEmpty>No client found</CommandEmpty>
                      <CommandGroup>
                        {clients.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={c.name}
                            onSelect={() => {
                              setGroupClientId(c.id)
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${groupClientId === c.id ? "opacity-100" : "opacity-0"}`} />
                            {c.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={createGroupAndAssign}
                disabled={!groupClientId || !!updatingId}
                className="bg-brand-gold text-[#010124] hover:bg-brand-gold/90"
              >
                {updatingId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4 mr-2" />}
                Group & assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PasswordProtection>
  )
}
