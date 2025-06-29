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
import {
  getClientIntegrations,
  getAllIntegrations,
  createClientIntegration,
  updateClientIntegration,
  deleteClientIntegration,
} from "@/lib/database"
import type {
  ClientIntegration,
  Integration,
  CreateClientIntegrationData,
  UpdateClientIntegrationData,
} from "@/lib/supabase"
import { Plus, Edit, Trash2, ExternalLink, Star, ArrowUp, ArrowDown } from "lucide-react"

interface ClientIntegrationsManagerProps {
  clientId: string
}

export function ClientIntegrationsManager({ clientId }: ClientIntegrationsManagerProps) {
  const [clientIntegrations, setClientIntegrations] = useState<ClientIntegration[]>([])
  const [masterIntegrations, setMasterIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingIntegration, setEditingIntegration] = useState<ClientIntegration | null>(null)

  useEffect(() => {
    fetchData()
  }, [clientId])

  const fetchData = async () => {
    try {
      const [clientInts, masterInts] = await Promise.all([getClientIntegrations(clientId), getAllIntegrations()])
      setClientIntegrations(clientInts)
      setMasterIntegrations(masterInts.filter((i) => i.is_active))
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddIntegration = async (data: CreateClientIntegrationData) => {
    try {
      await createClientIntegration({ ...data, client_id: clientId })
      await fetchData()
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding integration:", error)
    }
  }

  const handleUpdateIntegration = async (data: UpdateClientIntegrationData) => {
    try {
      await updateClientIntegration(data)
      await fetchData()
      setEditingIntegration(null)
    } catch (error) {
      console.error("Error updating integration:", error)
    }
  }

  const handleDeleteIntegration = async (id: string) => {
    if (confirm("Are you sure you want to remove this integration?")) {
      try {
        await deleteClientIntegration(id)
        await fetchData()
      } catch (error) {
        console.error("Error deleting integration:", error)
      }
    }
  }

  const handleToggleFeatured = async (integration: ClientIntegration) => {
    await handleUpdateIntegration({
      id: integration.id,
      is_featured: !integration.is_featured,
    })
  }

  const handleReorder = async (integration: ClientIntegration, direction: "up" | "down") => {
    const currentOrder = integration.sort_order
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1

    await handleUpdateIntegration({
      id: integration.id,
      sort_order: newOrder,
    })
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const sortedIntegrations = [...clientIntegrations].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Client Integrations</CardTitle>
              <CardDescription>Manage integrations for this client</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Integration
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Integration</DialogTitle>
                  <DialogDescription>Add an integration for this client</DialogDescription>
                </DialogHeader>
                <ClientIntegrationForm masterIntegrations={masterIntegrations} onSubmit={handleAddIntegration} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedIntegrations.map((integration) => {
              const masterIntegration = integration.integration
              const title = masterIntegration?.title || integration.title
              const description = masterIntegration?.description || integration.description
              const integrationType = masterIntegration?.integration_type || integration.integration_type
              const category = masterIntegration?.category || integration.category

              return (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium">{title}</h3>
                      {integration.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      <Badge className={getTypeBadgeColor(integrationType!)}>{integrationType}</Badge>
                      {category && <Badge variant="outline">{category}</Badge>}
                    </div>
                    {description && <p className="text-sm text-gray-600">{description}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReorder(integration, "up")}
                      disabled={integration.sort_order === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReorder(integration, "down")}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggleFeatured(integration)}>
                      <Star className={`h-4 w-4 ${integration.is_featured ? "text-yellow-500 fill-current" : ""}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(masterIntegration?.url || integration.url, "_blank")}
                    >
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
              )
            })}
          </div>

          {clientIntegrations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No integrations added yet. Click "Add Integration" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingIntegration} onOpenChange={() => setEditingIntegration(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Integration</DialogTitle>
            <DialogDescription>Update the integration settings</DialogDescription>
          </DialogHeader>
          {editingIntegration && (
            <ClientIntegrationForm
              masterIntegrations={masterIntegrations}
              integration={editingIntegration}
              onSubmit={handleUpdateIntegration}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ClientIntegrationFormProps {
  masterIntegrations: Integration[]
  integration?: ClientIntegration
  onSubmit: (data: CreateClientIntegrationData | UpdateClientIntegrationData) => void
}

function ClientIntegrationForm({ masterIntegrations, integration, onSubmit }: ClientIntegrationFormProps) {
  const [useCustom, setUseCustom] = useState(!integration?.integration_id)
  const [formData, setFormData] = useState({
    integration_id: integration?.integration_id || "",
    integration_type: integration?.integration_type || "zapier",
    title: integration?.title || "",
    description: integration?.description || "",
    url: integration?.url || "",
    icon_name: integration?.icon_name || "",
    category: integration?.category || "",
    is_featured: integration?.is_featured || false,
    sort_order: integration?.sort_order || 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = useCustom
      ? {
          integration_type: formData.integration_type as any,
          title: formData.title,
          description: formData.description,
          url: formData.url,
          icon_name: formData.icon_name,
          category: formData.category,
          is_featured: formData.is_featured,
          sort_order: formData.sort_order,
        }
      : {
          integration_id: formData.integration_id,
          is_featured: formData.is_featured,
          sort_order: formData.sort_order,
        }

    if (integration) {
      onSubmit({ id: integration.id, ...data })
    } else {
      onSubmit(data)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input type="radio" checked={!useCustom} onChange={() => setUseCustom(false)} />
          <span>Use Master Integration</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="radio" checked={useCustom} onChange={() => setUseCustom(true)} />
          <span>Custom Integration</span>
        </label>
      </div>

      {!useCustom ? (
        <div>
          <Label htmlFor="integration_id">Select Integration</Label>
          <Select
            value={formData.integration_id}
            onValueChange={(value) => setFormData({ ...formData, integration_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose an integration" />
            </SelectTrigger>
            <SelectContent>
              {masterIntegrations.map((integration) => (
                <SelectItem key={integration.id} value={integration.id}>
                  {integration.title} ({integration.integration_type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <>
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
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required={useCustom}
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
              required={useCustom}
            />
          </div>

          <div>
            <Label htmlFor="icon_name">Icon Name</Label>
            <Input
              id="icon_name"
              value={formData.icon_name}
              onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
            />
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_featured"
            checked={formData.is_featured}
            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
          />
          <Label htmlFor="is_featured">Featured</Label>
        </div>
        <div>
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input
            id="sort_order"
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: Number.parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit">{integration ? "Update" : "Add"} Integration</Button>
      </div>
    </form>
  )
}
