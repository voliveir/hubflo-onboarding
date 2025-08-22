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
  Copy,
  Settings,
  Users,
  Target,
  Zap,
  Play,
  Rocket,
  MapPin,
} from "lucide-react"
import { getMilestoneTemplates, createMilestoneTemplate, updateMilestoneTemplate, deleteMilestoneTemplate } from "@/lib/database"
import type { MilestoneTemplate } from "@/lib/types"

export function GlobalMilestonesManager() {
  const [templates, setTemplates] = useState<MilestoneTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MilestoneTemplate | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "general",
    estimated_days: "",
    is_active: true,
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const data = await getMilestoneTemplates()
      setTemplates(data)
    } catch (error) {
      console.error("Error loading templates:", error)
      toast.error("Failed to load milestone templates")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required")
      return
    }

    try {
      const newTemplate = await createMilestoneTemplate({
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        estimated_days: formData.estimated_days ? parseInt(formData.estimated_days) : undefined,
        is_active: formData.is_active,
      })

      setTemplates([...templates, newTemplate])
      setShowCreateDialog(false)
      resetForm()
      toast.success("Template created successfully")
    } catch (error) {
      console.error("Error creating template:", error)
      toast.error("Failed to create template")
    }
  }

  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !formData.name.trim()) {
      toast.error("Name is required")
      return
    }

    try {
      const updatedTemplate = await updateMilestoneTemplate(editingTemplate.id, {
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        estimated_days: formData.estimated_days ? parseInt(formData.estimated_days) : undefined,
        is_active: formData.is_active,
      })

      setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t))
      setEditingTemplate(null)
      resetForm()
      toast.success("Template updated successfully")
    } catch (error) {
      console.error("Error updating template:", error)
      toast.error("Failed to update template")
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      await deleteMilestoneTemplate(id)
      setTemplates(templates.filter(t => t.id !== id))
      toast.success("Template deleted successfully")
    } catch (error) {
      console.error("Error deleting template:", error)
      toast.error("Failed to delete template")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "general",
      estimated_days: "",
      is_active: true,
    })
  }

  const openEditDialog = (template: MilestoneTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || "",
      category: template.category,
      estimated_days: template.estimated_days?.toString() || "",
      is_active: template.is_active,
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "setup":
        return <Settings className="h-4 w-4" />
      case "consultation":
        return <Users className="h-4 w-4" />
      case "configuration":
        return <Target className="h-4 w-4" />
      case "integration":
        return <Zap className="h-4 w-4" />
      case "testing":
        return <Play className="h-4 w-4" />
      case "training":
        return <Users className="h-4 w-4" />
      case "deployment":
        return <Rocket className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
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
        <div className="text-white">Loading milestone templates...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1a1c3a]/50 border-[#F2C94C]/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{templates.length}</div>
            <div className="text-sm text-white/70">Total Templates</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1c3a]/50 border-[#F2C94C]/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">
              {templates.filter(t => t.is_active).length}
            </div>
            <div className="text-sm text-white/70">Active Templates</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1c3a]/50 border-[#F2C94C]/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#F2C94C]">
              {templates.filter(t => !t.is_active).length}
            </div>
            <div className="text-sm text-white/70">Inactive Templates</div>
          </CardContent>
        </Card>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-white hover:brightness-110">
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1c3a] border-[#F2C94C]/20 text-white">
            <DialogHeader>
              <DialogTitle>Create New Milestone Template</DialogTitle>
              <DialogDescription>Add a new milestone template that can be used across all clients.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate} className="bg-[#F2C94C] text-white hover:bg-[#F2994A]">
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates list */}
      <Card className="bg-[#1a1c3a]/50 border-[#F2C94C]/20">
        <CardHeader>
          <CardTitle className="text-white">Milestone Templates</CardTitle>
          <CardDescription className="text-white/70">
            Manage milestone templates that can be used across all clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-white/70">
              <div className="text-lg mb-2">No templates yet</div>
              <div className="text-sm">Create your first milestone template to get started.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center gap-4 p-4 bg-[#0a0b1a] rounded-lg border border-[#F2C94C]/20 hover:border-[#F2C94C]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <div>
                        <div className="font-semibold text-white">{template.name}</div>
                        {template.description && (
                          <div className="text-sm text-white/70">{template.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                    {template.estimated_days && (
                      <Badge variant="outline" className="text-white/70">
                        {template.estimated_days} days
                      </Badge>
                    )}
                    <Badge className={template.is_active ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-300"}>
                      {template.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(template)}
                      className="border-[#F2C94C]/20 text-[#F2C94C] hover:bg-[#F2C94C]/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template.id)}
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
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="bg-[#1a1c3a] border-[#F2C94C]/20 text-white">
          <DialogHeader>
            <DialogTitle>Edit Milestone Template</DialogTitle>
            <DialogDescription>Update the template details and settings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit-is-active">Active</Label>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTemplate} className="bg-[#F2C94C] text-white hover:bg-[#F2994A]">
                Update Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
