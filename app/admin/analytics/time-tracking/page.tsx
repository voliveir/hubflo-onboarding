"use client"

import React, { useEffect, useState, useMemo } from "react"
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
import { Check, ChevronsUpDown, ChevronDown, ChevronUp } from "lucide-react"
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
  const [summarySortColumn, setSummarySortColumn] = useState<string | null>(null)
  const [summarySortDirection, setSummarySortDirection] = useState<"asc" | "desc">("asc")

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

  const sortedSummary = useMemo(() => {
    if (!summary || summary.length === 0) return []
    const mult = summarySortDirection === "asc" ? 1 : -1
    return [...summary].sort((a: any, b: any) => {
      const aName = (a.client_name || (a.client_id ? getClientName(a.client_id) : "All Clients")).toLowerCase()
      const bName = (b.client_name || (b.client_id ? getClientName(b.client_id) : "All Clients")).toLowerCase()
      const aTime = a.total_minutes || 0
      const bTime = b.total_minutes || 0
      if (summarySortColumn === "client") return aName.localeCompare(bName) * mult
      if (summarySortColumn === "time") return (aTime - bTime) * mult
      return 0
    })
  }, [summary, summarySortColumn, summarySortDirection, clients])

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8 max-w-7xl mx-auto">
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
                    className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-semibold shadow-lg hover:scale-105 transition-transform"
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
                <DialogContent className="bg-white border border-gray-200 shadow-2xl max-w-2xl">
                  <DialogHeader>
                    <DialogTitle style={{ color: "#060520" }}>
                      {editingEntry ? "Edit Time Entry" : "Add Time Entry"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Track time spent on meetings, emails, or implementation work
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="client_id" style={{ color: "#060520" }}>
                          Client *
                        </Label>
                        <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={clientPopoverOpen}
                              className="w-full justify-between bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                            >
                              {formData.client_id
                                ? clients.find((client) => client.id === formData.client_id)?.name ||
                                  "Select client"
                                : "Select client"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border-gray-200" align="start">
                            <Command className="bg-white">
                              <CommandInput
                                placeholder="Search client..."
                                className="text-gray-900 placeholder:text-gray-500 border-gray-200"
                              />
                              <CommandList>
                                <CommandEmpty className="text-gray-600 py-6 text-center text-sm">
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
                                      className="text-gray-900 cursor-pointer hover:bg-gray-100 data-[selected='true']:bg-gray-100"
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 text-brand-gold ${
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
                        <Label htmlFor="entry_type" style={{ color: "#060520" }}>
                          Activity Type *
                        </Label>
                        <Select
                          value={formData.entry_type}
                          onValueChange={(value: any) =>
                            setFormData({ ...formData, entry_type: value })
                          }
                          required
                        >
                          <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200">
                            <SelectItem value="meeting" className="text-gray-900">
                              Meeting
                            </SelectItem>
                            <SelectItem value="email" className="text-gray-900">
                              Email
                            </SelectItem>
                            <SelectItem value="initial_setup" className="text-gray-900">
                              Initial Setup/Discovery
                            </SelectItem>
                            <SelectItem value="automation_workflow" className="text-gray-900">
                              Building Automations/Zapier Workflows
                            </SelectItem>
                            <SelectItem value="api_integration" className="text-gray-900">
                              API Integration Work
                            </SelectItem>
                            <SelectItem value="testing_debugging" className="text-gray-900">
                              Testing/Debugging
                            </SelectItem>
                            <SelectItem value="training_handoff" className="text-gray-900">
                              Training/Handoff
                            </SelectItem>
                            <SelectItem value="revisions_rework" className="text-gray-900">
                              Revisions/Rework
                            </SelectItem>
                            <SelectItem value="implementation" className="text-gray-900">
                              General Implementation
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date" style={{ color: "#060520" }}>
                          Date *
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="bg-white border-gray-300 text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration_minutes" style={{ color: "#060520" }}>
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
                          className="bg-white border-gray-300 text-gray-900"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description" style={{ color: "#060520" }}>
                        Description
                      </Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-white border-gray-300 text-gray-900"
                        placeholder="Brief description of the work"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes" style={{ color: "#060520" }}>
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="bg-white border-gray-300 text-gray-900"
                        placeholder="Additional notes or details"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-semibold shadow-lg hover:scale-105 transition-transform"
                      >
                        {editingEntry ? "Update" : "Create"} Entry
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <Card className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-brand-gold" />
                <h3 className="text-lg font-semibold" style={{ color: "#060520" }}>Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="client_filter" className="mb-2 block" style={{ color: "#060520" }}>
                    Client
                  </Label>
                  <Select value={selectedClientId || "all"} onValueChange={(value) => setSelectedClientId(value === "all" ? "" : value)}>
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="All clients" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="all" className="text-gray-900">
                        All clients
                      </SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id} className="text-gray-900">
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="activity_filter" className="mb-2 block" style={{ color: "#060520" }}>
                    Activity Type
                  </Label>
                  <Select value={selectedActivityType} onValueChange={setSelectedActivityType}>
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="All activities" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {activityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-gray-900">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date_from" className="mb-2 block" style={{ color: "#060520" }}>
                    Date From
                  </Label>
                  <Input
                    id="date_from"
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div>
                  <Label htmlFor="date_to" className="mb-2 block" style={{ color: "#060520" }}>
                    Date To
                  </Label>
                  <Input
                    id="date_to"
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="text-sm text-gray-600">Quick filters:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(getQuickDateRange("this_month"))}
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-brand-gold/50 text-xs"
                >
                  This Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(getQuickDateRange("last_month"))}
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-brand-gold/50 text-xs"
                >
                  Last Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(getQuickDateRange("this_quarter"))}
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-brand-gold/50 text-xs"
                >
                  This Quarter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(getQuickDateRange("this_year"))}
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-brand-gold/50 text-xs"
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
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-brand-gold/50 text-xs"
                >
                  Clear Filters
                </Button>
              </div>
            </Card>

            {/* Time by Client - Spreadsheet */}
            {summary && summary.length > 0 && (
              <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl p-0 mb-6">
                <div className="px-6 pt-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-brand-gold" />
                    <h2 className="text-xl font-bold" style={{ color: "#060520" }}>Time by Client</h2>
                    <span className="text-sm font-normal text-gray-500">({summary.length} clients)</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">Summary of tracked time and ROI metrics per client</p>
                </div>
                <div className="overflow-x-auto rounded-b-2xl">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                        <TableHead
                          className="font-bold text-xs px-4 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors sticky left-0 z-10 bg-gray-50 min-w-[160px]"
                          style={{ color: "#060520" }}
                          onClick={() => {
                            if (summarySortColumn === "client") {
                              setSummarySortDirection((d) => (d === "asc" ? "desc" : "asc"))
                            } else {
                              setSummarySortColumn("client")
                              setSummarySortDirection("asc")
                            }
                          }}
                        >
                          <div className="flex items-center gap-1">
                            Client
                            {summarySortColumn === "client" ? (
                              summarySortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronsUpDown className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="font-bold text-xs px-4 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors min-w-[100px]"
                          style={{ color: "#060520" }}
                          onClick={() => {
                            if (summarySortColumn === "time") {
                              setSummarySortDirection((d) => (d === "asc" ? "desc" : "asc"))
                            } else {
                              setSummarySortColumn("time")
                              setSummarySortDirection("asc")
                            }
                          }}
                        >
                          <div className="flex items-center gap-1">
                            Time
                            {summarySortColumn === "time" ? (
                              summarySortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronsUpDown className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-xs px-4 py-3 min-w-[90px]" style={{ color: "#060520" }}>Hrs</TableHead>
                        <TableHead className="font-bold text-xs px-4 py-3 min-w-[120px]" style={{ color: "#060520" }}>Hrs / $1k ACV</TableHead>
                        <TableHead className="font-bold text-xs px-4 py-3 min-w-[130px]" style={{ color: "#060520" }}>Impl. Cost</TableHead>
                        <TableHead className="font-bold text-xs px-4 py-3 min-w-[110px]" style={{ color: "#060520" }}>Breakeven</TableHead>
                        <TableHead className="font-bold text-xs px-4 py-3 min-w-[100px]" style={{ color: "#060520" }}>ROI Score</TableHead>
                        <TableHead className="font-bold text-xs px-4 py-3 min-w-[110px]" style={{ color: "#060520" }}>Package Cost</TableHead>
                        <TableHead className="font-bold text-xs px-4 py-3 min-w-[120px]" style={{ color: "#060520" }}>Cost vs Pkg</TableHead>
                        <TableHead className="font-bold text-xs px-4 py-3 min-w-[100px]" style={{ color: "#060520" }}>Cost Ratio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedSummary.map((s: any, idx: number) => {
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
                          <TableRow key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors group">
                            <TableCell className="font-semibold text-sm px-4 py-3 sticky left-0 z-10 bg-white group-hover:bg-gray-50 border-r border-gray-200" style={{ color: "#060520" }}>
                              {clientName}
                            </TableCell>
                            <TableCell className="text-sm font-medium px-4 py-3 text-gray-900">
                              {formatDuration(s.total_minutes || 0)}
                            </TableCell>
                            <TableCell className="text-sm px-4 py-3 text-gray-600">
                              {s.total_hours?.toFixed(1) || 0}h
                            </TableCell>
                            <TableCell className="text-sm px-4 py-3 text-brand-gold font-medium">
                              {timeToACV !== null ? `${timeToACV.toFixed(2)}` : "—"}
                            </TableCell>
                            <TableCell className="text-sm px-4 py-3 text-gray-700">
                              {acv > 0 ? `$${totalCost.toLocaleString()}` : "—"}
                            </TableCell>
                            <TableCell className="text-sm px-4 py-3 text-blue-600 font-medium">
                              {breakevenTimeline !== null ? `${breakevenTimeline.toFixed(1)} mo` : "—"}
                            </TableCell>
                            <TableCell className="text-sm px-4 py-3">
                              {roiEfficiencyScore !== null ? (
                                <span className={`font-semibold ${roiEfficiencyScore >= 10 ? "text-green-600" : roiEfficiencyScore >= 5 ? "text-amber-600" : "text-red-600"}`}>
                                  {roiEfficiencyScore.toFixed(2)}x
                                </span>
                              ) : "—"}
                            </TableCell>
                            <TableCell className="text-sm px-4 py-3 text-gray-700">
                              {packageCost > 0 ? `$${packageCost.toLocaleString()}` : "—"}
                            </TableCell>
                            <TableCell className="text-sm px-4 py-3">
                              {packageCostSavings !== null ? (
                                <span className={`font-semibold ${packageCostSavings <= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {packageCostSavings < 0 ? `$${Math.abs(packageCostSavings).toLocaleString()} under` : `$${packageCostSavings.toLocaleString()} over`}
                                </span>
                              ) : "—"}
                            </TableCell>
                            <TableCell className="text-sm px-4 py-3">
                              {packageROI !== null ? (
                                <span className={`font-semibold ${packageROI <= 1 ? "text-green-600" : "text-red-600"}`}>
                                  {packageROI.toFixed(2)}x
                                </span>
                              ) : "—"}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {/* Time Entries Table */}
            <Card className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: "#060520" }}>Time Entries</h2>
                <div className="text-sm text-gray-600">
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}
                </div>
              </div>
              {loading ? (
                <div className="text-center py-12 text-gray-600">Loading...</div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12 text-gray-600 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No time entries found. Click &quot;Add Time Entry&quot; to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 bg-gray-50 hover:bg-gray-50">
                        <TableHead style={{ color: "#060520" }}>Date</TableHead>
                        <TableHead style={{ color: "#060520" }}>Client</TableHead>
                        <TableHead style={{ color: "#060520" }}>Type</TableHead>
                        <TableHead style={{ color: "#060520" }}>Description</TableHead>
                        <TableHead style={{ color: "#060520" }}>Duration</TableHead>
                        <TableHead style={{ color: "#060520" }}>Actions</TableHead>
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
                            className="border-gray-200 hover:bg-gray-50/80"
                          >
                            <TableCell className="text-gray-900">
                              {formatDateString(entry.date)}
                            </TableCell>
                            <TableCell className="font-medium text-gray-900">{clientName}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-gray-700">
                                {getEntryTypeIcon(entry.entry_type)}
                                <span>{getEntryTypeLabel(entry.entry_type)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {entry.description || "-"}
                            </TableCell>
                            <TableCell className="font-medium text-gray-900">
                              {formatDuration(entry.duration_minutes)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(entry)}
                                  className="text-brand-gold hover:text-brand-gold-hover hover:bg-brand-gold/10"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(entry.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

