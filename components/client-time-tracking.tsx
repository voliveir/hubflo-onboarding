"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Clock, Plus, Edit, Trash2, Mail, Users, Wrench, TrendingUp, Zap, Settings, CheckCircle, RefreshCw } from "lucide-react"
import type { TimeEntry } from "@/lib/types"

interface ClientTimeTrackingProps {
  clientId: string
  clientName: string
  clientACV?: number
  clientPackage?: string
}

export function ClientTimeTracking({
  clientId,
  clientName,
  clientACV = 0,
  clientPackage = "",
}: ClientTimeTrackingProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [summary, setSummary] = useState<any>(null)

  // Form state
  const [formData, setFormData] = useState({
    entry_type: "meeting" as TimeEntry["entry_type"],
    date: new Date().toISOString().split("T")[0],
    duration_minutes: 30,
    description: "",
    notes: "",
  })

  useEffect(() => {
    loadEntries()
    loadSummary()
  }, [clientId])

  const loadEntries = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/time-entries?client_id=${clientId}`)
      const data = await response.json()
      setEntries(data)
    } catch (error) {
      console.error("Error loading entries:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = async () => {
    try {
      const response = await fetch(`/api/time-entries/summary?client_id=${clientId}`)
      const data = await response.json()
      setSummary(Array.isArray(data) ? data[0] : data)
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
        body: JSON.stringify({
          ...formData,
          client_id: clientId,
        }),
      })

      if (!response.ok) throw new Error("Failed to save entry")

      setIsDialogOpen(false)
      setEditingEntry(null)
      setFormData({
        entry_type: "meeting",
        date: new Date().toISOString().split("T")[0],
        duration_minutes: 30,
        description: "",
        notes: "",
      })
      loadEntries()
      loadSummary()
    } catch (error) {
      console.error("Error saving entry:", error)
      alert("Failed to save entry. Please try again.")
    }
  }

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry)
    setFormData({
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

      loadEntries()
      loadSummary()
    } catch (error) {
      console.error("Error deleting entry:", error)
      alert("Failed to delete entry. Please try again.")
    }
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
    <Card className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold pl-3 border-l-4 border-brand-gold flex items-center gap-2" style={{color: '#060520'}}>
            <Clock className="h-5 w-5 text-brand-gold" />
            Time Tracking
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#10122b] font-semibold hover:brightness-110"
                onClick={() => {
                  setEditingEntry(null)
                  setFormData({
                    entry_type: "meeting",
                    date: new Date().toISOString().split("T")[0],
                    duration_minutes: 30,
                    description: "",
                    notes: "",
                  })
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border border-gray-200 text-gray-900 max-w-2xl">
              <DialogHeader>
                <DialogTitle style={{color: '#060520'}}>
                  {editingEntry ? "Edit Time Entry" : "Add Time Entry"}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Track time spent on meetings, emails, or implementation work
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="entry_type" style={{color: '#060520'}}>
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
                      <SelectContent className="bg-white border-gray-300">
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
                  <div>
                    <Label htmlFor="date" style={{color: '#060520'}}>
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
                </div>
                <div>
                  <Label htmlFor="duration_minutes" style={{color: '#060520'}}>
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
                <div>
                  <Label htmlFor="description" style={{color: '#060520'}}>
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
                  <Label htmlFor="notes" style={{color: '#060520'}}>
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
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-semibold"
                  >
                    {editingEntry ? "Update" : "Create"} Entry
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-50 border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Total Time</div>
              <div className="text-2xl font-bold" style={{color: '#060520'}}>
                {formatDuration(summary.total_minutes || 0)}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {summary.total_hours?.toFixed(1) || 0} hours
              </div>
            </Card>
            <Card className="bg-gray-50 border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Meetings</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatDuration(summary.meeting_minutes || 0)}
              </div>
            </Card>
            <Card className="bg-gray-50 border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Emails</div>
              <div className="text-2xl font-bold text-purple-600">
                {formatDuration(summary.email_minutes || 0)}
              </div>
            </Card>
            <Card className="bg-gray-50 border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Implementation</div>
              <div className="text-2xl font-bold text-orange-600">
                {formatDuration(summary.implementation_minutes || 0)}
              </div>
            </Card>
          </div>
        )}

        {/* ROI Metrics */}
        {summary && (clientACV > 0 || getPackageCost(clientPackage) > 0) && (
          <div className="mb-6 space-y-4">
            {clientACV > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-gray-600">Time to ACV Ratio</div>
                    <div className="text-lg font-bold mt-1" style={{color: '#060520'}}>
                      {calculateTimeToACVRatio(summary.total_hours || 0, clientACV)?.toFixed(2) || "0.00"}{" "}
                      hrs per $1k ACV
                    </div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-brand-gold" />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Implementation Cost</div>
                <div className="text-xl font-bold" style={{color: '#060520'}}>
                  ${((summary.total_hours || 0) * HOURLY_RATE).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {summary.total_hours?.toFixed(1) || 0} hours × ${HOURLY_RATE}/hr
                </div>
              </div>
              {clientACV > 0 && calculateBreakevenTimeline(summary.total_hours || 0, clientACV) !== null && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Breakeven Timeline (ACV)</div>
                  <div className="text-xl font-bold text-blue-600">
                    {calculateBreakevenTimeline(summary.total_hours || 0, clientACV)?.toFixed(1)} months
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    (Cost / ACV) × 12 months
                  </div>
                </div>
              )}
              {clientACV > 0 && calculateROIEfficiencyScore(summary.total_hours || 0, clientACV) !== null && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">ROI Efficiency Score (ACV)</div>
                  <div className={`text-xl font-bold ${
                    (calculateROIEfficiencyScore(summary.total_hours || 0, clientACV) || 0) >= 10 
                      ? 'text-green-600' 
                      : (calculateROIEfficiencyScore(summary.total_hours || 0, clientACV) || 0) >= 5 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                  }`}>
                    {calculateROIEfficiencyScore(summary.total_hours || 0, clientACV)?.toFixed(2)}x
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    ACV / Implementation Cost (higher is better)
                  </div>
                </div>
              )}
              {getPackageCost(clientPackage) > 0 && (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Package Cost</div>
                    <div className="text-xl font-bold" style={{color: '#060520'}}>
                      ${getPackageCost(clientPackage).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 capitalize">
                      {clientPackage} Package
                    </div>
                  </div>
                  {calculatePackageCostSavings(summary.total_hours || 0, getPackageCost(clientPackage)) !== null && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Cost vs Package</div>
                      <div className={`text-xl font-bold ${
                        (calculatePackageCostSavings(summary.total_hours || 0, getPackageCost(clientPackage)) || 0) <= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {calculatePackageCostSavings(summary.total_hours || 0, getPackageCost(clientPackage))! < 0
                          ? `$${Math.abs(calculatePackageCostSavings(summary.total_hours || 0, getPackageCost(clientPackage))!).toLocaleString()} under`
                          : `$${calculatePackageCostSavings(summary.total_hours || 0, getPackageCost(clientPackage))!.toLocaleString()} over`}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Actual cost vs package price
                      </div>
                    </div>
                  )}
                  {calculatePackageROI(summary.total_hours || 0, getPackageCost(clientPackage)) !== null && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Cost Ratio</div>
                      <div className={`text-xl font-bold ${
                        (calculatePackageROI(summary.total_hours || 0, getPackageCost(clientPackage)) || 0) <= 1
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {calculatePackageROI(summary.total_hours || 0, getPackageCost(clientPackage))?.toFixed(2)}x
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Actual Cost / Package Cost {calculatePackageROI(summary.total_hours || 0, getPackageCost(clientPackage))! <= 1 ? '(under budget)' : '(over budget)'}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Time Entries Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No time entries found. Click "Add Entry" to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50 bg-gray-50">
                  <TableHead style={{color: '#060520'}}>Date</TableHead>
                  <TableHead style={{color: '#060520'}}>Type</TableHead>
                  <TableHead style={{color: '#060520'}}>Description</TableHead>
                  <TableHead style={{color: '#060520'}}>Duration</TableHead>
                  <TableHead style={{color: '#060520'}}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <TableCell style={{color: '#060520'}}>
                      {formatDateString(entry.date)}
                    </TableCell>
                    <TableCell style={{color: '#060520'}}>
                      <div className="flex items-center gap-2">
                        {getEntryTypeIcon(entry.entry_type)}
                        <span>{getEntryTypeLabel(entry.entry_type)}</span>
                      </div>
                    </TableCell>
                    <TableCell style={{color: '#060520'}}>
                      {entry.description || "-"}
                    </TableCell>
                    <TableCell style={{color: '#060520'}}>
                      {formatDuration(entry.duration_minutes)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(entry)}
                          className="text-brand-gold hover:text-[#F2994A]"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

