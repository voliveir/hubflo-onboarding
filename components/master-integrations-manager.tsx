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
import { Plus, Edit, Trash2, ExternalLink, Search, Pencil } from "lucide-react"
import ReactMarkdown from 'react-markdown'

interface CreateIntegrationData {
  integration_type: "zapier" | "native" | "api" | "makecom"
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
      case "makecom":
        return "bg-purple-100 text-purple-800"
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
      <Card className="bg-[#10122b]/90 ring-1 ring-[#F2C94C]/30 rounded-2xl p-0">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Master Integrations</CardTitle>
              <CardDescription className="text-white/80">Manage the master list of available integrations</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-white font-semibold rounded-full h-11 px-6 text-[18px] shadow-md hover:brightness-110 border border-[#F2C94C]/70 flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Integration
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-[#10122b] ring-1 ring-[#F2C94C]/30 rounded-3xl">
                <DialogHeader>
                  <CardTitle className="text-white">Add New Integration</CardTitle>
                  <CardDescription className="text-white/80">Create a new integration in the master list</CardDescription>
                </DialogHeader>
                <IntegrationForm onSubmit={handleCreateIntegration} dark={true} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <Input
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#181a2f] border border-slate-600 text-white placeholder-white/60 rounded-lg focus:ring-2 focus:ring-[#F2C94C]"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48 bg-[#181a2f] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-[#F2C94C]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="zapier">Zapier</SelectItem>
                <SelectItem value="native">Native</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="makecom">Make.com</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48 bg-[#181a2f] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-[#F2C94C]">
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
              <div key={integration.id} className="group flex items-center justify-between bg-[#10122b]/90 ring-1 ring-[#F2C94C]/30 rounded-xl p-5">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-white text-[17px]">{integration.title}</h3>
                    {/* Chips: pill component, colors by type */}
                    {integration.integration_type === 'native' && <span className="bg-blue-400/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold" style={{ borderRadius: 12 }}>Native</span>}
                    {integration.integration_type === 'zapier' && <span className="bg-orange-400/20 text-orange-300 px-3 py-1 rounded-full text-xs font-semibold" style={{ borderRadius: 12 }}>Zapier</span>}
                    {integration.integration_type === 'api' && <span className="bg-green-400/20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold" style={{ borderRadius: 12 }}>API</span>}
                    {integration.integration_type === 'makecom' && <span className="bg-purple-400/20 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold" style={{ borderRadius: 12 }}>Make.com</span>}
                    {integration.category && <span className="bg-slate-400/20 text-slate-200 px-3 py-1 rounded-full text-xs font-semibold" style={{ borderRadius: 12 }}>{integration.category}</span>}
                    {!integration.is_active && <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-semibold" style={{ borderRadius: 12 }}>Inactive</span>}
                  </div>
                  {integration.description && (
                    <div className="text-sm text-slate-200 mt-2">
                      <ReactMarkdown>{integration.description}</ReactMarkdown>
                    </div>
                  )}
                  {integration.tags && integration.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {integration.tags.map((tag, index) => (
                        <span key={index} className="bg-[#23244a] text-white/80 px-2 py-0.5 rounded-full text-xs font-medium" style={{ borderRadius: 10 }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Action buttons: hidden until group hover */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-4">
                  <Button className="w-8 h-8 bg-[#181a2f] rounded-md flex items-center justify-center" onClick={() => setEditingIntegration(integration)}>
                    <Pencil className="h-5 w-5 text-[#F2C94C]" />
                  </Button>
                  <Button className="w-8 h-8 bg-[#181a2f] rounded-md flex items-center justify-center" onClick={() => handleDeleteIntegration(integration.id)}>
                    <Trash2 className="h-5 w-5 text-[#F2C94C]" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-8 text-white/60">
              <p>No integrations found.</p>
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
  onSubmit: (data: any) => void
  dark?: boolean
}

function IntegrationForm({ integration, onSubmit, dark = false }: IntegrationFormProps & { dark?: boolean }) {
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
      integration_type: formData.integration_type as "zapier" | "native" | "api" | "makecom",
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
          <Label htmlFor="integration_type" className={dark ? 'text-white' : 'text-black'}>Type</Label>
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
              <SelectItem value="makecom">Make.com</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category" className={dark ? 'text-white' : 'text-black'}>Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., CRM, Email, Project Management"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="title" className={dark ? 'text-white' : 'text-black'}>Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description" className={dark ? 'text-white' : 'text-black'}>Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="url" className={dark ? 'text-white' : 'text-black'}>URL</Label>
        <Input
          id="url"
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="icon_name" className={dark ? 'text-white' : 'text-black'}>Icon Name (Lucide React)</Label>
        <Input
          id="icon_name"
          value={formData.icon_name}
          onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
          placeholder="e.g., Mail, Database, Code"
        />
      </div>

      <div>
        <Label htmlFor="tags" className={dark ? 'text-white' : 'text-black'}>Tags (comma-separated)</Label>
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
        <Label htmlFor="is_active" className={dark ? 'text-white' : 'text-black'}>Active</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit">{integration ? "Update" : "Create"} Integration</Button>
      </div>
    </form>
  )
}
