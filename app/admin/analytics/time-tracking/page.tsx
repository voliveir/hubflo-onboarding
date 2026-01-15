"use client"

import React, { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Clock, Plus, Edit, Trash2, Calendar, Mail, Users, Wrench, TrendingUp, DollarSign, Zap, Settings, CheckCircle, RefreshCw, Filter } from "lucide-react"
import type { TimeEntry } from "@/lib/types"

export default function TimeTrackingPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [summary, setSummary] = useState<any>(null)
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false)
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  })
  const [selectedActivityType, setSelectedActivityType] = useState<string>("all")

  // Form state
  const [formData, setFormData] = useState({
    client_id: "",
    entry_type: "meeting" as TimeEntry["entry_type"],
    date: new Date().toISOString().split("T")[0],
    duration_minutes: 30,
    description: "",
    notes: "",
  })

  useEffect(() => {
    loadClients()
    loadEntries()
  }, [])

  useEffect(() => {
    loadEntries(selectedClientId || undefined)
    loadSummary(selectedClientId || undefined)
  }, [selectedClientId, dateRange, selectedActivityType])

  const loadClients = async () => {
    try {
      const response = await fetch("/api/clients-list")
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setClients(data)
        }
      }
    } catch (error) {
      console.error("Error loading clients:", error)
      // Continue without client list - user can still add entries manually
    }
  }

  const loadEntries = async (clientId?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (clientId) params.append("client_id", clientId)
      if (dateRange.from) params.append("start_date", dateRange.from)
      if (dateRange.to) params.append("end_date", dateRange.to)
      if (selectedActivityType && selectedActivityType !== "all") {
        params.append("entry_type", selectedActivityType)
      }

      const response = await fetch(`/api/time-entries?${params.toString()}`)
      const data = await response.json()
      setEntries(data)
    } catch (error) {
      console.error("Error loading entries:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = async (clientId?: string) => {
    try {
      const params = new URLSearchParams()
      if (clientId) params.append("client_id", clientId)

      const response = await fetch(`/api/time-entries/summary?${params.toString()}`)
      const data = await response.json()
      setSummary(Array.isArray(data) ? data : [data])
    } catch (error) {
      console.error("Error loading summary:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingEntry
        ? `/api/time-entries/${editingEntry.id}`
        : "/api/time-entries"
      const method = editingEntry ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save entry")

      setIsDialogOpen(false)
      setEditingEntry(null)
      setClientPopoverOpen(false)
      setFormData({
        client_id: "",
        entry_type: "meeting",
        date: new Date().toISOString().split("T")[0],
        duration_minutes: 30,
        description: "",
        notes: "",
      })
      loadEntries(selectedClientId || undefined)
      loadSummary(selectedClientId || undefined)
    } catch (error) {
      console.error("Error saving entry:", error)
      alert("Failed to save entry. Please try again.")
    }
  }

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry)
    setClientPopoverOpen(false)
    setFormData({
      client_id: entry.client_id,
      entry_type: entry.entry_type,
      date: entry.date,
      duration_minutes: entry.duration_minutes,
      description: entry.description || "",
      notes: entry.notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this time entry?")) return

    try {
      const response = await fetch(`/api/time-entries/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete entry")

      loadEntries(selectedClientId || undefined)
      loadSummary(selectedClientId || undefined)
    } catch (error) {
      console.error("Error deleting entry:", error)
      alert("Failed to delete entry. Please try again.")
    }
  }

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || clientId
  }

  const getClientACV = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.revenue_amount || 0
  }

  const getClientPackage = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.success_package || ""
  }

  const getEntryTypeIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return <Users className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "initial_setup":
        return <Wrench className="h-4 w-4" />
      case "automation_workflow":
        return <Zap className="h-4 w-4" />
      case "api_integration":
        return <Settings className="h-4 w-4" />
      case "testing_debugging":
        return <CheckCircle className="h-4 w-4" />
      case "training_handoff":
        return <Users className="h-4 w-4" />
      case "revisions_rework":
        return <RefreshCw className="h-4 w-4" />
      case "implementation":
        return <Wrench className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getEntryTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      meeting: "Meeting",
      email: "Email",
      initial_setup: "Initial Setup/Discovery",
      automation_workflow: "Automation/Workflow",
      api_integration: "API Integration",
      testing_debugging: "Testing/Debugging",
      training_handoff: "Training/Handoff",
      revisions_rework: "Revisions/Rework",
      implementation: "Implementation",
    }
    return labels[type] || type
  }

  const activityTypes = [
    { value: "all", label: "All Activities" },
    { value: "meeting", label: "Meeting" },
    { value: "email", label: "Email" },
    { value: "initial_setup", label: "Initial Setup/Discovery" },
    { value: "automation_workflow", label: "Automation/Workflow" },
    { value: "api_integration", label: "API Integration" },
    { value: "testing_debugging", label: "Testing/Debugging" },
    { value: "training_handoff", label: "Training/Handoff" },
    { value: "revisions_rework", label: "Revisions/Rework" },
    { value: "implementation", label: "Implementation" },
  ]

  const getQuickDateRange = (range: string) => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfQuarter = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
    const startOfYear = new Date(today.getFullYear(), 0, 1)
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)

    switch (range) {
      case "this_month":
        return {
          from: startOfMonth.toISOString().split("T")[0],
          to: today.toISOString().split("T")[0],
        }
      case "last_month":
        return {
          from: lastMonth.toISOString().split("T")[0],
          to: endOfLastMonth.toISOString().split("T")[0],
        }
      case "this_quarter":
        return {
          from: startOfQuarter.toISOString().split("T")[0],
          to: today.toISOString().split("T")[0],
        }
      case "this_year":
        return {
          from: startOfYear.toISOString().split("T")[0],
          to: today.toISOString().split("T")[0],
        }
      default:
        return { from: "", to: "" }
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDateString = (dateString: string) => {
    // Format YYYY-MM-DD to MM/DD/YYYY without timezone conversion
    if (!dateString) return ""
    const [year, month, day] = dateString.split("-")
    return `${month}/${day}/${year}`
  }

  const calculateTimeToACVRatio = (totalHours: number, acv: number) => {
    if (!acv || acv === 0) return null
    return (totalHours / acv) * 1000 // Hours per $1000 ACV
  }

  const HOURLY_RATE = 85 // Fully loaded cost of implementation hourly rate

  const getPackageCost = (packageType: string): number => {
    const packageCosts: Record<string, number> = {
      light: 0,
      premium: 599,
      gold: 990,
      elite: 1600,
      starter: 0,
      professional: 599,
      enterprise: 1600,
    }
    return packageCosts[packageType?.toLowerCase()] || 0
  }

  const calculateBreakevenTimeline = (totalHours: number, acv: number) => {
    if (!acv || acv === 0 || totalHours === 0) return null
    const totalCost = totalHours * HOURLY_RATE
    return (totalCost / acv) * 12 // Months to break even
  }

  const calculateROIEfficiencyScore = (totalHours: number, acv: number) => {
    if (!acv || acv === 0 || totalHours === 0) return null
    const totalCost = totalHours * HOURLY_RATE
    return acv / totalCost // Higher is better
  }

  const calculatePackageROI = (totalHours: number, packageCost: number) => {
    if (!packageCost || packageCost === 0 || totalHours === 0) return null
    const totalCost = totalHours * HOURLY_RATE
    if (totalCost === 0) return null
    return totalCost / packageCost // Ratio of actual cost to package cost (lower is better)
  }

  const calculatePackageCostSavings = (totalHours: number, packageCost: number) => {
    if (packageCost === 0) return null // Free packages
    const totalCost = totalHours * HOURLY_RATE
    return totalCost - packageCost // Positive = over budget, Negative = under budget
  }

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
                  <span className="text-brand-gold font-medium text-sm">Analytics</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold mb-4" style={{color: '#060520'}}>
                  Time Tracking
                </h1>
                <p className="text-xl max-w-4xl leading-relaxed" style={{color: '#64748b'}}>Track meetings, emails, and implementation work</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#10122b] font-semibold hover:brightness-110"
                    onClick={() => {
                      setEditingEntry(null)
                      setClientPopoverOpen(false)
                      setFormData({
                        client_id: selectedClientId || "",
                        entry_type: "meeting",
                        date: new Date().toISOString().split("T")[0],
                        duration_minutes: 30,
                        description: "",
                        notes: "",
                      })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#181a2f] border border-[#F2C94C]/20 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      {editingEntry ? "Edit Time Entry" : "Add Time Entry"}
                    </DialogTitle>
                    <DialogDescription className="text-white/70">
                      Track time spent on meetings, emails, or implementation work
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="client_id" className="text-white">
                          Client *
                        </Label>
                        <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={clientPopoverOpen}
                              className="w-full justify-between bg-[#0d1120] border-slate-600 text-white hover:bg-[#161c36]"
                            >
                              {formData.client_id
                                ? clients.find((client) => client.id === formData.client_id)?.name ||
                                  "Select client"
                                : "Select client"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-[#0d1120] border-slate-600" align="start">
                            <Command className="bg-[#0d1120]">
                              <CommandInput
                                placeholder="Search client..."
                                className="text-white placeholder:text-white/50 border-slate-600"
                              />
                              <CommandList>
                                <CommandEmpty className="text-white/70 py-6 text-center text-sm">
                                  No client found.
                                </CommandEmpty>
                                <CommandGroup>
                                  {clients.map((client) => (
                                    <CommandItem
                                      key={client.id}
                                      value={client.name}
                                      onSelect={() => {
                                        setFormData({ ...formData, client_id: client.id })
                                        setClientPopoverOpen(false)
                                      }}
                                      className="text-white cursor-pointer hover:bg-[#161c36] data-[selected='true']:bg-[#161c36]"
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 text-[#F2C94C] ${
                                          formData.client_id === client.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        }`}
                                      />
                                      {client.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label htmlFor="entry_type" className="text-white">
                          Activity Type *
                        </Label>
                        <Select
                          value={formData.entry_type}
                          onValueChange={(value: any) =>
                            setFormData({ ...formData, entry_type: value })
                          }
                          required
                        >
                          <SelectTrigger className="bg-[#0d1120] border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0d1120] border-slate-600">
                            <SelectItem value="meeting" className="text-white">
                              Meeting
                            </SelectItem>
                            <SelectItem value="email" className="text-white">
                              Email
                            </SelectItem>
                            <SelectItem value="initial_setup" className="text-white">
                              Initial Setup/Discovery
                            </SelectItem>
                            <SelectItem value="automation_workflow" className="text-white">
                              Building Automations/Zapier Workflows
                            </SelectItem>
                            <SelectItem value="api_integration" className="text-white">
                              API Integration Work
                            </SelectItem>
                            <SelectItem value="testing_debugging" className="text-white">
                              Testing/Debugging
                            </SelectItem>
                            <SelectItem value="training_handoff" className="text-white">
                              Training/Handoff
                            </SelectItem>
                            <SelectItem value="revisions_rework" className="text-white">
                              Revisions/Rework
                            </SelectItem>
                            <SelectItem value="implementation" className="text-white">
                              General Implementation
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date" className="text-white">
                          Date *
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="bg-[#0d1120] border-slate-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration_minutes" className="text-white">
                          Duration (minutes) *
                        </Label>
                        <Input
                          id="duration_minutes"
                          type="number"
                          min="1"
                          value={formData.duration_minutes}
                          onChange={(e) =>
                            setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })
                          }
                          className="bg-[#0d1120] border-slate-600 text-white"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-white">
                        Description
                      </Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-[#0d1120] border-slate-600 text-white"
                        placeholder="Brief description of the work"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes" className="text-white">
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="bg-[#0d1120] border-slate-600 text-white"
                        placeholder="Additional notes or details"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="border-slate-600 text-white hover:bg-[#23244a]"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#10122b] font-semibold"
                      >
                        {editingEntry ? "Update" : "Create"} Entry
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <Card className="bg-[#060818]/90 rounded-2xl border border-[#F2C94C]/20 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-[#F2C94C]" />
                <h3 className="text-lg font-semibold text-white">Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="client_filter" className="text-white mb-2 block">
                    Client
                  </Label>
                  <Select value={selectedClientId || "all"} onValueChange={(value) => setSelectedClientId(value === "all" ? "" : value)}>
                    <SelectTrigger className="bg-[#0d1120] border-slate-600 text-white">
                      <SelectValue placeholder="All clients" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d1120] border-slate-600">
                      <SelectItem value="all" className="text-white">
                        All clients
                      </SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id} className="text-white">
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="activity_filter" className="text-white mb-2 block">
                    Activity Type
                  </Label>
                  <Select value={selectedActivityType} onValueChange={setSelectedActivityType}>
                    <SelectTrigger className="bg-[#0d1120] border-slate-600 text-white">
                      <SelectValue placeholder="All activities" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d1120] border-slate-600">
                      {activityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-white">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date_from" className="text-white mb-2 block">
                    Date From
                  </Label>
                  <Input
                    id="date_from"
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="bg-[#0d1120] border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="date_to" className="text-white mb-2 block">
                    Date To
                  </Label>
                  <Input
                    id="date_to"
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="bg-[#0d1120] border-slate-600 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="text-sm text-white/70">Quick filters:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(getQuickDateRange("this_month"))}
                  className="bg-[#0d1120] border-slate-600 text-white hover:bg-[#23244a] hover:text-white text-xs"
                >
                  This Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(getQuickDateRange("last_month"))}
                  className="bg-[#0d1120] border-slate-600 text-white hover:bg-[#23244a] hover:text-white text-xs"
                >
                  Last Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(getQuickDateRange("this_quarter"))}
                  className="bg-[#0d1120] border-slate-600 text-white hover:bg-[#23244a] hover:text-white text-xs"
                >
                  This Quarter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(getQuickDateRange("this_year"))}
                  className="bg-[#0d1120] border-slate-600 text-white hover:bg-[#23244a] hover:text-white text-xs"
                >
                  This Year
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateRange({ from: "", to: "" })
                    setSelectedActivityType("all")
                  }}
                  className="bg-[#0d1120] border-slate-600 text-white hover:bg-[#23244a] hover:text-white text-xs"
                >
                  Clear Filters
                </Button>
              </div>
            </Card>

            {/* Summary Cards */}
            {summary && summary.length > 0 && (
              <div className="space-y-6 mb-6">
                {/* Time Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {summary.map((s: any, idx: number) => {
                  const clientName = s.client_name || (s.client_id ? getClientName(s.client_id) : "All Clients")
                  const acv = s.client_acv || (s.client_id ? getClientACV(s.client_id) : 0)
                  const packageType = s.client_package || (s.client_id ? getClientPackage(s.client_id) : "")
                  const packageCost = getPackageCost(packageType)
                  const timeToACV = calculateTimeToACVRatio(s.total_hours || 0, acv)
                  const totalCost = (s.total_hours || 0) * HOURLY_RATE
                  const breakevenTimeline = calculateBreakevenTimeline(s.total_hours || 0, acv)
                  const roiEfficiencyScore = calculateROIEfficiencyScore(s.total_hours || 0, acv)
                  const packageROI = calculatePackageROI(s.total_hours || 0, packageCost)
                  const packageCostSavings = calculatePackageCostSavings(s.total_hours || 0, packageCost)

                  return (
                    <Card
                      key={idx}
                      className="bg-[#060818]/90 rounded-2xl border border-[#F2C94C]/20 p-6"
                    >
                      <div className="text-sm text-white/70 mb-2">{clientName}</div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {formatDuration(s.total_minutes || 0)}
                      </div>
                      <div className="text-xs text-white/60 mb-3">
                        {s.total_hours?.toFixed(1) || 0} hours
                      </div>
                      {timeToACV !== null && (
                        <div className="text-xs text-yellow-400 mb-1">
                          {timeToACV.toFixed(2)} hrs per $1k ACV
                        </div>
                      )}
                      {acv > 0 && (
                        <>
                          <div className="text-xs text-white/60 mt-3 pt-3 border-t border-slate-700">
                            <div className="mb-1">Implementation Cost: ${totalCost.toLocaleString()}</div>
                            {breakevenTimeline !== null && (
                              <div className="mb-1">
                                Breakeven (ACV): <span className="text-blue-400 font-semibold">{breakevenTimeline.toFixed(1)} months</span>
                              </div>
                            )}
                            {roiEfficiencyScore !== null && (
                              <div className="mb-1">
                                ROI Score (ACV): <span className={`font-semibold ${roiEfficiencyScore >= 10 ? 'text-green-400' : roiEfficiencyScore >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {roiEfficiencyScore.toFixed(2)}x
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      {packageCost > 0 && (
                        <div className="text-xs text-white/60 mt-3 pt-3 border-t border-slate-700">
                          <div className="mb-1">Package Cost: ${packageCost.toLocaleString()}</div>
                          {packageCostSavings !== null && (
                            <div className="mb-1">
                              Cost vs Package: <span className={`font-semibold ${packageCostSavings <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {packageCostSavings < 0 ? `$${Math.abs(packageCostSavings).toLocaleString()} under` : `$${packageCostSavings.toLocaleString()} over`}
                              </span>
                            </div>
                          )}
                          {packageROI !== null && (
                            <div>
                              Cost Ratio: <span className={`font-semibold ${packageROI <= 1 ? 'text-green-400' : 'text-red-400'}`}>
                                {packageROI.toFixed(2)}x
                              </span>
                              <span className="text-white/50 ml-1">({packageROI <= 1 ? 'under budget' : 'over budget'})</span>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  )
                })}
                </div>
              </div>
            )}

            {/* Time Entries Table */}
            <Card className="bg-[#060818]/90 rounded-2xl border border-[#F2C94C]/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Time Entries</h2>
                <div className="text-sm text-white/70">
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}
                </div>
              </div>
              {loading ? (
                <div className="text-center py-8 text-white/70">Loading...</div>
              ) : entries.length === 0 ? (
                <div className="text-center py-8 text-white/70">
                  No time entries found. Click "Add Time Entry" to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700 hover:bg-[#0d1120]">
                        <TableHead className="text-white">Date</TableHead>
                        <TableHead className="text-white">Client</TableHead>
                        <TableHead className="text-white">Type</TableHead>
                        <TableHead className="text-white">Description</TableHead>
                        <TableHead className="text-white">Duration</TableHead>
                        <TableHead className="text-white">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry) => {
                        const clientName = getClientName(entry.client_id)
                        const acv = getClientACV(entry.client_id)
                        const entryHours = entry.duration_minutes / 60
                        const timeToACV = calculateTimeToACVRatio(entryHours, acv)

                        return (
                          <TableRow
                            key={entry.id}
                            className="border-slate-700 hover:bg-[#0d1120]"
                          >
                            <TableCell className="text-white">
                              {formatDateString(entry.date)}
                            </TableCell>
                            <TableCell className="text-white">{clientName}</TableCell>
                            <TableCell className="text-white">
                              <div className="flex items-center gap-2">
                                {getEntryTypeIcon(entry.entry_type)}
                                <span>{getEntryTypeLabel(entry.entry_type)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-white">
                              {entry.description || "-"}
                            </TableCell>
                            <TableCell className="text-white">
                              {formatDuration(entry.duration_minutes)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(entry)}
                                  className="text-[#F2C94C] hover:text-[#F2994A]"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(entry.id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}

