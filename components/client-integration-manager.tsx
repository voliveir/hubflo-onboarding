"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Star, ArrowUp, ArrowDown, Search, ExternalLink } from "lucide-react"
import {
  getClientIntegrations,
  getMasterIntegrations,
  addIntegrationToClient,
  removeIntegrationFromClient,
  updateClientIntegration,
  type ClientIntegration,
  type Integration,
} from "@/lib/database"
import { toast } from "sonner"

interface ClientIntegrationManagerProps {
  clientId: string
  clientName: string
}

export function ClientIntegrationManager({ clientId, clientName }: ClientIntegrationManagerProps) {
  const [clientIntegrations, setClientIntegrations] = useState<ClientIntegration[]>([])
  const [masterIntegrations, setMasterIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    fetchData()
  }, [clientId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [clientInts, masterInts] = await Promise.all([getClientIntegrations(clientId), getMasterIntegrations()])
      setClientIntegrations(clientInts)
      setMasterIntegrations(masterInts)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load integrations")
    } finally {
      setLoading(false)
    }
  }

  const handleAddIntegration = async (integrationId: string) => {
    try {
      const maxSortOrder = Math.max(...clientIntegrations.map((ci) => ci.sort_order), 0)
      await addIntegrationToClient(clientId, integrationId, {
        sort_order: maxSortOrder + 1,
        is_featured: false,
        is_enabled: true,
      })
      toast.success("Integration added successfully")
      fetchData()
    } catch (error) {
      console.error("Error adding integration:", error)
      toast.error("Failed to add integration")
    }
  }

  const handleRemoveIntegration = async (clientIntegrationId: string) => {
    if (!confirm("Are you sure you want to remove this integration?")) return

    try {
      await removeIntegrationFromClient(clientIntegrationId)
      toast.success("Integration removed successfully")
      fetchData()
    } catch (error) {
      console.error("Error removing integration:", error)
      toast.error("Failed to remove integration")
    }
  }

  const handleToggleFeatured = async (clientIntegrationId: string, isFeatured: boolean) => {
    try {
      await updateClientIntegration(clientIntegrationId, { is_featured: isFeatured })
      toast.success(`Integration ${isFeatured ? "featured" : "unfeatured"}`)
      fetchData()
    } catch (error) {
      console.error("Error updating integration:", error)
      toast.error("Failed to update integration")
    }
  }

  const handleToggleEnabled = async (clientIntegrationId: string, isEnabled: boolean) => {
    try {
      await updateClientIntegration(clientIntegrationId, { is_enabled: isEnabled })
      toast.success(`Integration ${isEnabled ? "enabled" : "disabled"}`)
      fetchData()
    } catch (error) {
      console.error("Error updating integration:", error)
      toast.error("Failed to update integration")
    }
  }

  const handleReorder = async (clientIntegrationId: string, direction: "up" | "down") => {
    const integration = clientIntegrations.find((ci) => ci.id === clientIntegrationId)
    if (!integration) return

    const newSortOrder = direction === "up" ? integration.sort_order - 1 : integration.sort_order + 1

    try {
      await updateClientIntegration(clientIntegrationId, { sort_order: newSortOrder })
      fetchData()
    } catch (error) {
      console.error("Error reordering integration:", error)
      toast.error("Failed to reorder integration")
    }
  }

  const availableIntegrations = masterIntegrations.filter(
    (mi) => !clientIntegrations.some((ci) => ci.integration_id === mi.id),
  )

  const filteredAvailable = availableIntegrations.filter((integration) => {
    const matchesSearch =
      integration.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(masterIntegrations.map((i) => i.category)))

  const getTypeColor = (type: string) => {
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
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading integrations...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="assigned" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assigned">Assigned Integrations ({clientIntegrations.length})</TabsTrigger>
          <TabsTrigger value="available">Add from Library ({filteredAvailable.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="assigned">
          <Card>
            <CardHeader>
              <CardTitle>Current Integrations</CardTitle>
              <CardDescription>Integrations currently available to {clientName}</CardDescription>
            </CardHeader>
            <CardContent>
              {clientIntegrations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No integrations assigned yet</p>
                  <p className="text-sm text-gray-400">
                    Add integrations from the library to customize this client's experience
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientIntegrations
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((clientIntegration, index) => (
                      <div key={clientIntegration.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex flex-col space-y-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReorder(clientIntegration.id, "up")}
                                disabled={index === 0}
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReorder(clientIntegration.id, "down")}
                                disabled={index === clientIntegrations.length - 1}
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">
                                  {clientIntegration.integration?.title || clientIntegration.title}
                                </h3>
                                {clientIntegration.is_featured && (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    <Star className="h-3 w-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                                {!clientIntegration.is_enabled && <Badge variant="secondary" className="bg-brand-gold/15 text-brand-gold border-brand-gold/40">Disabled</Badge>}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {clientIntegration.integration?.description || clientIntegration.description}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  className={getTypeColor(
                                    clientIntegration.integration?.integration_type ||
                                      clientIntegration.integration_type ||
                                      "zapier",
                                  )}
                                >
                                  {(
                                    clientIntegration.integration?.integration_type ||
                                    clientIntegration.integration_type ||
                                    "zapier"
                                  ).toUpperCase()}
                                </Badge>
                                <Badge variant="outline">
                                  {clientIntegration.integration?.category || clientIntegration.category}
                                </Badge>
                                {clientIntegration.integration?.external_url && (
                                  <Button variant="ghost" size="sm" asChild>
                                    <a
                                      href={clientIntegration.integration.external_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      View
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`enabled-${clientIntegration.id}`} className="text-sm">
                                Enabled
                              </Label>
                              <Switch
                                id={`enabled-${clientIntegration.id}`}
                                checked={clientIntegration.is_enabled}
                                onCheckedChange={(checked) => handleToggleEnabled(clientIntegration.id, checked)}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`featured-${clientIntegration.id}`} className="text-sm">
                                Featured
                              </Label>
                              <Switch
                                id={`featured-${clientIntegration.id}`}
                                checked={clientIntegration.is_featured}
                                onCheckedChange={(checked) => handleToggleFeatured(clientIntegration.id, checked)}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveIntegration(clientIntegration.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle>Add Integrations</CardTitle>
              <CardDescription>Select integrations from the master library to add to {clientName}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search integrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {filteredAvailable.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    {availableIntegrations.length === 0
                      ? "All available integrations have been added"
                      : "No integrations match your search"}
                  </p>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredAvailable.map((integration) => (
                    <div key={integration.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{integration.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{integration.description}</p>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getTypeColor(integration.integration_type)}>
                              {integration.integration_type.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{integration.category}</Badge>
                          </div>
                          {integration.external_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={integration.external_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Preview
                              </a>
                            </Button>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddIntegration(integration.id)}
                          className="ml-4"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
