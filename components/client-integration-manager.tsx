"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Star, ArrowUp, ArrowDown, Search, ExternalLink, GripVertical } from "lucide-react"
import {
  getClientIntegrations,
  getMasterIntegrations,
  addIntegrationToClient,
  removeIntegrationFromClient,
  updateClientIntegration,
} from "@/lib/database"
import type { ClientIntegration, Integration } from "@/lib/types"
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
  const [activeTab, setActiveTab] = useState<"assigned" | "available">("assigned")

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

  // New pill badge style
  const getTypePill = (type: string) => {
    switch (type) {
      case "zapier":
        return "bg-orange-500/20 text-orange-300"
      case "native":
        return "bg-blue-400/20 text-blue-200"
      case "api":
        return "bg-emerald-400/20 text-emerald-200"
      default:
        return "bg-slate-600/60 text-slate-200"
    }
  }
  const getCategoryPill = () => "bg-slate-600/60 text-slate-200"

  if (loading) {
    return (
      <Card className="bg-[#060818]/90 border border-[#F2C94C]/20 rounded-xl p-8">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400 mx-auto mb-4"></div>
            <p className="text-slate-300">Loading integrations...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Tab Bar as Large Pills */}
      <div className="flex gap-4 mb-8">
        <button
          className={`px-8 py-3 rounded-full text-base font-semibold transition-all duration-150
            ${activeTab === "assigned"
              ? "bg-gradient-to-r from-[#F2C94C] via-[#F2994A] to-[#F2C94C] text-white shadow-lg"
              : "bg-transparent border border-[#F2C94C]/50 text-slate-300 hover:bg-[#181a2f]/40"}
          `}
          onClick={() => setActiveTab("assigned")}
        >
          Assigned Integrations ({clientIntegrations.length})
        </button>
        <button
          className={`px-8 py-3 rounded-full text-base font-semibold transition-all duration-150
            ${activeTab === "available"
              ? "bg-gradient-to-r from-[#F2C94C] via-[#F2994A] to-[#F2C94C] text-white shadow-lg"
              : "bg-transparent border border-[#F2C94C]/50 text-slate-300 hover:bg-[#181a2f]/40"}
          `}
          onClick={() => setActiveTab("available")}
        >
          Add from Library ({filteredAvailable.length})
        </button>
      </div>

      {/* Assigned Integrations Tab */}
      {activeTab === "assigned" && (
        <Card className="bg-[#060818]/90 border border-[#F2C94C]/50 rounded-xl p-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-white pl-3 border-l-4 border-[#F2C94C]">Current Integrations</CardTitle>
            <CardDescription className="text-slate-300">Integrations currently available to {clientName}</CardDescription>
          </CardHeader>
          <CardContent>
            {clientIntegrations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 mb-4">No integrations assigned yet</p>
                <p className="text-sm text-slate-500">
                  Add integrations from the library to customize this client's experience
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {clientIntegrations
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((clientIntegration, index) => (
                    <div
                      key={clientIntegration.id}
                      className="group flex items-stretch rounded-lg border border-slate-800 bg-[#0a0b1a]/70 hover:bg-[#10122b]/70 transition-all duration-150 p-6 shadow-none hover:shadow-lg hover:shadow-[#F2C94C]/10 cursor-pointer relative"
                      style={{ transform: "translateY(0)", transition: "box-shadow 0.2s, transform 0.2s" }}
                    >
                      {/* Drag handle */}
                      <div className="flex flex-col justify-center items-center pr-5 cursor-grab select-none text-slate-500">
                        <GripVertical className="h-5 w-5" />
                        <div className="flex flex-col items-center gap-1 mt-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReorder(clientIntegration.id, "up")}
                            disabled={index === 0}
                            className="h-7 w-7 p-0"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReorder(clientIntegration.id, "down")}
                            disabled={index === clientIntegrations.length - 1}
                            className="h-7 w-7 p-0"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white truncate">
                            {clientIntegration.integration?.title || clientIntegration.title}
                          </h3>
                          {clientIntegration.is_featured && (
                            <Badge className="bg-yellow-400/20 text-yellow-200 px-2 py-0.5 rounded-full text-xxs font-semibold uppercase ml-1">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {!clientIntegration.is_enabled && (
                            <Badge className="bg-[#F2C94C]/10 text-[#F2C94C] border border-[#F2C94C]/40 px-2 py-0.5 rounded-full text-xxs font-semibold uppercase ml-1">
                              Disabled
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 truncate mb-2">
                          {clientIntegration.integration?.description || clientIntegration.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-semibold uppercase ${getTypePill(clientIntegration.integration?.integration_type || clientIntegration.integration_type || "zapier")}`}>
                            {(clientIntegration.integration?.integration_type || clientIntegration.integration_type || "zapier").toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-semibold uppercase ${getCategoryPill()}`}>
                            {clientIntegration.integration?.category || clientIntegration.category}
                          </span>
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
                      {/* Right controls */}
                      <div className="flex flex-col items-end justify-between gap-3 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`enabled-${clientIntegration.id}`} className="text-xs text-slate-300">
                              Enabled
                            </Label>
                            <Switch
                              id={`enabled-${clientIntegration.id}`}
                              checked={clientIntegration.is_enabled}
                              onCheckedChange={(checked) => handleToggleEnabled(clientIntegration.id, checked)}
                              className="data-[state=checked]:bg-[#F2C94C] data-[state=checked]:border-[#F2C94C]"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`featured-${clientIntegration.id}`} className="text-xs text-slate-300">
                              Featured
                            </Label>
                            <Switch
                              id={`featured-${clientIntegration.id}`}
                              checked={clientIntegration.is_featured}
                              onCheckedChange={(checked) => handleToggleFeatured(clientIntegration.id, checked)}
                              className="data-[state=checked]:bg-[#F2C94C] data-[state=checked]:border-[#F2C94C]"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveIntegration(clientIntegration.id)}
                            className="text-red-500 hover:text-red-400"
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
      )}

      {/* Add from Library Tab */}
      {activeTab === "available" && (
        <Card className="bg-[#060818]/90 border border-[#F2C94C]/50 rounded-xl p-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-white pl-3 border-l-4 border-[#F2C94C]">Add Integrations</CardTitle>
            <CardDescription className="text-slate-300">Select integrations from the master library to add to {clientName}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
                <Input
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#181a2f] border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-[#F2C94C]"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-slate-700 bg-[#181a2f] text-white rounded-lg focus:ring-2 focus:ring-[#F2C94C]"
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
                <p className="text-slate-400 mb-4">
                  {availableIntegrations.length === 0
                    ? "All available integrations have been added"
                    : "No integrations match your search"}
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm("")}
                    className="border-[#F2C94C]/50 text-[#F2C94C] hover:bg-[#181a2f]/40"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {filteredAvailable.map((integration) => (
                  <div key={integration.id} className="flex items-stretch rounded-lg border border-slate-800 bg-[#0a0b1a]/70 hover:bg-[#10122b]/70 transition-all duration-150 p-6 shadow-none hover:shadow-lg hover:shadow-[#F2C94C]/10 cursor-pointer relative">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate mb-1">{integration.title}</h3>
                      <p className="text-xs text-slate-300 truncate mb-2">{integration.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-semibold uppercase ${getTypePill(integration.integration_type)}`}>
                          {integration.integration_type.toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-semibold uppercase ${getCategoryPill()}`}>
                          {integration.category}
                        </span>
                        {integration.external_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={integration.external_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Preview
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddIntegration(integration.id)}
                      className="ml-4 border-[#F2C94C]/50 text-[#F2C94C] hover:bg-[#181a2f]/40"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
