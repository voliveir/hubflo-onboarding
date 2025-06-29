"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getAllIntegrations, createIntegration, updateIntegration, deleteIntegration } from "@/lib/database"
import type { Integration } from "@/lib/types"
import { Plus, Edit, Trash2, ExternalLink, Search } from "lucide-react"

interface CreateIntegrationData {
  integration_type: "zapier" | "native" | "api"
  title: string
  description: string
  external_url: string
  icon_name?: string
  category: string
  is_active: boolean
  tags: string[]
}

interface UpdateIntegrationData extends CreateIntegrationData {
  id: string
}

export function MasterIntegrationsManager() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [filteredIntegrations, setFilteredIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  useEffect(() => {
    filterIntegrations()
  }, [integrations, searchTerm, filterType, filterCategory])

  const fetchIntegrations = async () => {
    try {
      const data = await getAllIntegrations()
      setIntegrations(data)
    } catch (error) {
      console.error("Error fetching integrations:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterIntegrations = () => {
    let filtered = integrations

    if (searchTerm) {
      filtered = filtered.filter(
        (integration) =>
          integration.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          integration.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          integration.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((integration) => integration.integration_type === filterType)
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((integration) => integration.category === filterCategory)
    }

    setFilteredIntegrations(filtered)
  }

  const handleCreateIntegration = async (data: CreateIntegrationData) => {
    try {
      await createIntegration(data)
      await fetchIntegrations()
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Error creating integration:", error)
    }
  }

  const handleUpdateIntegration = async (data: UpdateIntegrationData) => {
    try {
      await updateIntegration(data.id, data)
      await fetchIntegrations()
      setEditingIntegration(null)
    } catch (error) {
      console.error("Error updating integration:", error)
    }
  }

  const handleDeleteIntegration = async (id: string) => {
    if (confirm("Are you sure you want to delete this integration?")) {
      try {
        await deleteIntegration(id)
        await fetchIntegrations()
      } catch (error) {
        console.error("Error deleting integration:", error)
      }
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "zapier":
        return "bg-orange-100 text-orange-800"
      case "native":
        return "bg-blue-100 text-blue-800"
      case "api":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const uniqueCategories = Array.from(new Set(integrations.map((i) => i.category).filter(Boolean)))

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Master Integrations</CardTitle>
              <CardDescription>Manage the master list of available integrations</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Integration
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Integration</DialogTitle>
                  <DialogDescription>Create a new integration in the master list</DialogDescription>
                </DialogHeader>
                <IntegrationForm onSubmit={handleCreateIntegration} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="zapier">Zapier</SelectItem>
                <SelectItem value="native">Native</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category!}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Integrations List */}
          <div className="space-y-4">
            {filteredIntegrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium">{integration.title}</h3>
                    <Badge className={getTypeBadgeColor(integration.integration_type)}>
                      {integration.integration_type}
                    </Badge>
                    {integration.category && <Badge variant="outline">{integration.category}</Badge>}
                    {!integration.is_active && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                  {integration.description && <p className="text-sm text-gray-600 mb-2">{integration.description}</p>}
                  {integration.tags && integration.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {integration.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => window.open(integration.external_url, "_blank")}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingIntegration(integration)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteIntegration(integration.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No integrations found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingIntegration} onOpenChange={() => setEditingIntegration(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Integration</DialogTitle>
            <DialogDescription>Update the integration details</DialogDescription>
          </DialogHeader>
          {editingIntegration && (
            <IntegrationForm integration={editingIntegration} onSubmit={handleUpdateIntegration} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface IntegrationFormProps {
  integration?: Integration
  onSubmit: (data: CreateIntegrationData | UpdateIntegrationData) => void
}

function IntegrationForm({ integration, onSubmit }: IntegrationFormProps) {
  const [formData, setFormData] = useState({
    integration_type: integration?.integration_type || "zapier",
    title: integration?.title || "",
    description: integration?.description || "",
    url: integration?.external_url || "",
    icon_name: integration?.icon_name || "",
    category: integration?.category || "",
    tags: integration?.tags?.join(", ") || "",
    is_active: integration?.is_active ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      integration_type: formData.integration_type as "zapier" | "native" | "api",
      title: formData.title,
      description: formData.description,
      external_url: formData.url, // Map url to external_url
      icon_name: formData.icon_name,
      category: formData.category,
      is_active: formData.is_active,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    if (integration) {
      onSubmit({ id: integration.id, ...data })
    } else {
      onSubmit(data)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="integration_type">Type</Label>
          <Select
            value={formData.integration_type}
            onValueChange={(value) => setFormData({ ...formData, integration_type: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zapier">Zapier</SelectItem>
              <SelectItem value="native">Native</SelectItem>
              <SelectItem value="api">API</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., CRM, Email, Project Management"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="icon_name">Icon Name (Lucide React)</Label>
        <Input
          id="icon_name"
          value={formData.icon_name}
          onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
          placeholder="e.g., Mail, Database, Code"
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="e.g., email, automation, productivity"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit">{integration ? "Update" : "Create"} Integration</Button>
      </div>
    </form>
  )
}
