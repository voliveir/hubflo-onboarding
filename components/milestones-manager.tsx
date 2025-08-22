"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  Plus,
  Edit,
  Trash2,
  Save,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  GripVertical,
  Copy,
  Settings,
  Eye,
} from "lucide-react"
import {
  getClientMilestones,
  getMilestoneTemplates,
  createClientMilestone,
  updateClientMilestone,
  deleteClientMilestone,
  reorderClientMilestones,
  createMilestonesFromTemplates,
  calculateMilestoneCompletion,
} from "@/lib/database"
import type { Client, ImplementationMilestone, MilestoneTemplate } from "@/lib/types"

interface MilestonesManagerProps {
  client: Client
}

export function MilestonesManager({ client }: MilestonesManagerProps) {
  const [milestones, setMilestones] = useState<ImplementationMilestone[]>([])
  const [templates, setTemplates] = useState<MilestoneTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<ImplementationMilestone | null>(null)
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    estimated_days: "",
    status: "pending" as const,
    notes: "",
  })

  useEffect(() => {
    loadData()
  }, [client.id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [milestonesData, templatesData, completion] = await Promise.all([
        getClientMilestones(client.id),
        getMilestoneTemplates(),
        calculateMilestoneCompletion(client.id),
      ])
      setMilestones(milestonesData || [])
      setTemplates(templatesData || [])
      setCompletionPercentage(completion || 0)
    } catch (error) {
      console.error("Error loading milestones:", error)
      toast.error("Failed to load milestones")
      setMilestones([])
      setTemplates([])
      setCompletionPercentage(0)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMilestone = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required")
      return
    }

    try {
      const newMilestone = await createClientMilestone({
        client_id: client.id,
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        order_index: milestones.length + 1,
        estimated_days: formData.estimated_days ? parseInt(formData.estimated_days) : undefined,
        status: formData.status,
        notes: formData.notes || undefined,
      })

      setMilestones([...milestones, newMilestone])
      setShowCreateDialog(false)
      resetForm()
      toast.success("Milestone created successfully")
      await loadData() // Refresh completion percentage
    } catch (error) {
      console.error("Error creating milestone:", error)
      toast.error("Failed to create milestone")
    }
  }

  const handleUpdateMilestone = async () => {
    if (!editingMilestone || !formData.title.trim()) {
      toast.error("Title is required")
      return
    }

    try {
      const updatedMilestone = await updateClientMilestone(editingMilestone.id, {
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        estimated_days: formData.estimated_days ? parseInt(formData.estimated_days) : undefined,
        status: formData.status,
        notes: formData.notes || undefined,
        completed_at: formData.status === "completed" ? new Date().toISOString() : undefined,
        completed_by: formData.status === "completed" ? "Admin" : undefined,
      })

      setMilestones(milestones.map(m => m.id === updatedMilestone.id ? updatedMilestone : m))
      setEditingMilestone(null)
      resetForm()
      toast.success("Milestone updated successfully")
      await loadData() // Refresh completion percentage
    } catch (error) {
      console.error("Error updating milestone:", error)
      toast.error("Failed to update milestone")
    }
  }

  const handleDeleteMilestone = async (id: string) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return

    try {
      await deleteClientMilestone(id)
      setMilestones(milestones.filter(m => m.id !== id))
      toast.success("Milestone deleted successfully")
      await loadData() // Refresh completion percentage
    } catch (error) {
      console.error("Error deleting milestone:", error)
      toast.error("Failed to delete milestone")
    }
  }

  const handleReorderMilestones = async (milestoneIds: string[]) => {
    try {
      await reorderClientMilestones(client.id, milestoneIds)
      // Reorder local state
      const reorderedMilestones = milestoneIds.map(id => 
        milestones.find(m => m.id === id)!
      )
      setMilestones(reorderedMilestones)
      toast.success("Milestones reordered successfully")
    } catch (error) {
      console.error("Error reordering milestones:", error)
      toast.error("Failed to reorder milestones")
    }
  }

  const handleCreateFromTemplates = async () => {
    if (selectedTemplates.length === 0) {
      toast.error("Please select at least one template")
      return
    }

    try {
      const newMilestones = await createMilestonesFromTemplates(client.id, selectedTemplates)
      setMilestones([...milestones, ...newMilestones])
      setShowTemplateDialog(false)
      setSelectedTemplates([])
      toast.success(`${newMilestones.length} milestones created from templates`)
      await loadData() // Refresh completion percentage
    } catch (error) {
      console.error("Error creating milestones from templates:", error)
      toast.error("Failed to create milestones from templates")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "general",
      estimated_days: "",
      status: "pending",
      notes: "",
    })
  }

  const openEditDialog = (milestone: ImplementationMilestone) => {
    setEditingMilestone(milestone)
    setFormData({
      title: milestone.title,
      description: milestone.description || "",
      category: milestone.category,
      estimated_days: milestone.estimated_days?.toString() || "",
      status: milestone.status,
      notes: milestone.notes || "",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "blocked":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300"
      case "in_progress":
        return "bg-yellow-500/20 text-yellow-300"
      case "blocked":
        return "bg-red-500/20 text-red-300"
      default:
        return "bg-gray-500/20 text-gray-300"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "setup":
        return "bg-blue-500/20 text-blue-300"
      case "consultation":
        return "bg-purple-500/20 text-purple-300"
      case "configuration":
        return "bg-green-500/20 text-green-300"
      case "integration":
        return "bg-orange-500/20 text-orange-300"
      case "testing":
        return "bg-yellow-500/20 text-yellow-300"
      case "training":
        return "bg-pink-500/20 text-pink-300"
      case "deployment":
        return "bg-indigo-500/20 text-indigo-300"
      default:
        return "bg-gray-500/20 text-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading milestones...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1c3a]/50 border-[#F2C94C]/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{milestones.length}</div>
            <div className="text-sm text-white/70">Total Milestones</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1c3a]/50 border-[#F2C94C]/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">
              {milestones.filter(m => m.status === "completed").length}
            </div>
            <div className="text-sm text-white/70">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1c3a]/50 border-[#F2C94C]/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {milestones.filter(m => m.status === "in_progress").length}
            </div>
            <div className="text-sm text-white/70">In Progress</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1c3a]/50 border-[#F2C94C]/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#F2C94C]">{completionPercentage}%</div>
            <div className="text-sm text-white/70">Completion</div>
          </CardContent>
        </Card>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-white hover:brightness-110">
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1c3a] border-[#F2C94C]/20 text-white">
            <DialogHeader>
              <DialogTitle>Create New Milestone</DialogTitle>
              <DialogDescription>Add a new implementation milestone for this client.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-[#0a0b1a] border-[#F2C94C]/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#0a0b1a] border-[#F2C94C]/20 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="bg-[#0a0b1a] border-[#F2C94C]/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1c3a] border-[#F2C94C]/20">
                      <SelectItem value="setup">Setup</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="configuration">Configuration</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="deployment">Deployment</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estimated_days">Estimated Days</Label>
                  <Input
                    id="estimated_days"
                    type="number"
                    value={formData.estimated_days}
                    onChange={(e) => setFormData({ ...formData, estimated_days: e.target.value })}
                    className="bg-[#0a0b1a] border-[#F2C94C]/20 text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-[#0a0b1a] border-[#F2C94C]/20 text-white"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMilestone} className="bg-[#F2C94C] text-white hover:bg-[#F2994A]">
                  Create Milestone
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-[#F2C94C]/20 text-[#F2C94C] hover:bg-[#F2C94C]/10">
              <Copy className="h-4 w-4 mr-2" />
              Add from Templates
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1c3a] border-[#F2C94C]/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Milestones from Templates</DialogTitle>
              <DialogDescription>Select milestone templates to add to this client's implementation plan.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplates.includes(template.id)
                        ? "bg-[#F2C94C]/20 border-[#F2C94C]"
                        : "bg-[#0a0b1a] border-[#F2C94C]/20 hover:border-[#F2C94C]/40"
                    }`}
                    onClick={() => {
                      setSelectedTemplates(prev =>
                        prev.includes(template.id)
                          ? prev.filter(id => id !== template.id)
                          : [...prev, template.id]
                      )
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{template.name}</div>
                        <div className="text-sm text-white/70">{template.description}</div>
                        <div className="flex gap-2 mt-2">
                          <Badge className={getCategoryColor(template.category)}>
                            {template.category}
                          </Badge>
                          {template.estimated_days && (
                            <Badge variant="outline" className="text-white/70">
                              {template.estimated_days} days
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-white/50">
                        {selectedTemplates.includes(template.id) ? "✓" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFromTemplates} className="bg-[#F2C94C] text-white hover:bg-[#F2994A]">
                  Add Selected ({selectedTemplates.length})
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="border-[#F2C94C]/20 text-[#F2C94C] hover:bg-[#F2C94C]/10">
          <Eye className="h-4 w-4 mr-2" />
          Preview Client View
        </Button>
      </div>

      {/* Milestones list */}
      <Card className="bg-[#1a1c3a]/50 border-[#F2C94C]/20">
        <CardHeader>
          <CardTitle className="text-white">Implementation Milestones</CardTitle>
          <CardDescription className="text-white/70">
            Manage the implementation milestones for {client.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <div className="text-center py-8 text-white/70">
              <div className="text-lg mb-2">No milestones yet</div>
              <div className="text-sm">Create your first milestone or add from templates to get started.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-4 p-4 bg-[#0a0b1a] rounded-lg border border-[#F2C94C]/20 hover:border-[#F2C94C]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-white/50 text-sm font-mono">#{milestone.order_index}</div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(milestone.status)}
                      <div>
                        <div className="font-semibold text-white">{milestone.title}</div>
                        {milestone.description && (
                          <div className="text-sm text-white/70">{milestone.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(milestone.category)}>
                      {milestone.category}
                    </Badge>
                    <Badge className={getStatusColor(milestone.status)}>
                      {milestone.status.replace("_", " ")}
                    </Badge>
                    {milestone.estimated_days && (
                      <Badge variant="outline" className="text-white/70">
                        {milestone.estimated_days} days
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(milestone)}
                      className="border-[#F2C94C]/20 text-[#F2C94C] hover:bg-[#F2C94C]/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingMilestone} onOpenChange={() => setEditingMilestone(null)}>
        <DialogContent className="bg-[#1a1c3a] border-[#F2C94C]/20 text-white">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
            <DialogDescription>Update the milestone details and status.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-[#0a0b1a] border-[#F2C94C]/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#0a0b1a] border-[#F2C94C]/20 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-[#0a0b1a] border-[#F2C94C]/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1c3a] border-[#F2C94C]/20">
                    <SelectItem value="setup">Setup</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="configuration">Configuration</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="deployment">Deployment</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-[#0a0b1a] border-[#F2C94C]/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1c3a] border-[#F2C94C]/20">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-estimated-days">Estimated Days</Label>
                <Input
                  id="edit-estimated-days"
                  type="number"
                  value={formData.estimated_days}
                  onChange={(e) => setFormData({ ...formData, estimated_days: e.target.value })}
                  className="bg-[#0a0b1a] border-[#F2C94C]/20 text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-[#0a0b1a] border-[#F2C94C]/20 text-white"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingMilestone(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateMilestone} className="bg-[#F2C94C] text-white hover:bg-[#F2994A]">
                Update Milestone
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
