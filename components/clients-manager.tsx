"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "@/hooks/use-toast"
import { getAllClients, deleteClient } from "@/lib/database"
import { type Client } from "@/lib/types"
import { Plus, Search, Edit, Trash2, Eye, Users, Package, Calendar, Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { EditClientForm } from "./edit-client-form"

interface FilterState {
  searchTerm: string
  status: string
  successPackage: string
  billingType: string
  planType: string
  dateFrom: string
  dateTo: string
  usersMin: string
  usersMax: string
  revenueMin: string
  revenueMax: string
}

export function ClientsManager({ initialStatus }: { initialStatus?: string } = {}) {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    status: initialStatus || "",
    successPackage: "",
    billingType: "",
    planType: "",
    dateFrom: "",
    dateTo: "",
    usersMin: "",
    usersMax: "",
    revenueMin: "",
    revenueMax: ""
  })

  useEffect(() => {
    if (initialStatus) {
      setFilters((prev) => ({ ...prev, status: initialStatus }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStatus])

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [clients, filters])

  const applyFilters = () => {
    let filtered = [...clients]

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          client.slug.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          client.success_package.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          (client.email && client.email.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(client => client.status === filters.status)
    }

    // Success package filter
    if (filters.successPackage && filters.successPackage !== "all") {
      filtered = filtered.filter(client => client.success_package === filters.successPackage)
    }

    // Billing type filter
    if (filters.billingType && filters.billingType !== "all") {
      filtered = filtered.filter(client => client.billing_type === filters.billingType)
    }

    // Plan type filter
    if (filters.planType && filters.planType !== "all") {
      filtered = filtered.filter(client => client.plan_type === filters.planType)
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(client => new Date(client.created_at) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(client => new Date(client.created_at) <= new Date(filters.dateTo))
    }

    // Users range filter
    if (filters.usersMin) {
      filtered = filtered.filter(client => (client.number_of_users || 0) >= parseInt(filters.usersMin))
    }
    if (filters.usersMax) {
      filtered = filtered.filter(client => (client.number_of_users || 0) <= parseInt(filters.usersMax))
    }

    // Revenue range filter
    if (filters.revenueMin) {
      filtered = filtered.filter(client => client.revenue_amount >= parseInt(filters.revenueMin))
    }
    if (filters.revenueMax) {
      filtered = filtered.filter(client => client.revenue_amount <= parseInt(filters.revenueMax))
    }

    setFilteredClients(filtered)
  }

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      status: "",
      successPackage: "",
      billingType: "",
      planType: "",
      dateFrom: "",
      dateTo: "",
      usersMin: "",
      usersMax: "",
      revenueMin: "",
      revenueMax: ""
    })
  }

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== "")
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== "").length
  }

  const loadClients = async () => {
    try {
      setLoading(true)
      const clientsData = await getAllClients()
      setClients(clientsData)
    } catch (error) {
      console.error("Error loading clients:", error)
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete "${clientName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const success = await deleteClient(clientId)
      if (success) {
        toast({
          title: "Success",
          description: "Client deleted successfully",
        })
        loadClients()
      } else {
        throw new Error("Failed to delete client")
      }
    } catch (error) {
      console.error("Error deleting client:", error)
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      })
    }
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    setEditDialogOpen(false)
    setEditingClient(null)
    loadClients()
    toast({
      title: "Success",
      description: "Client updated successfully",
    })
  }

  const handleEditCancel = () => {
    setEditDialogOpen(false)
    setEditingClient(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPackageColor = (pkg: string) => {
    switch (pkg) {
      case "light":
        return "bg-blue-100 text-blue-800"
      case "premium":
        return "bg-purple-100 text-purple-800"
      case "gold":
        return "bg-yellow-100 text-yellow-800"
      case "elite":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  function getCustomAppLabel(value: string | undefined) {
    switch (value) {
      case "gray_label":
        return "Gray Label"
      case "white_label":
        return "White Label"
      case "not_applicable":
      case "":
      case undefined:
        return "Not Applicable"
      default:
        return value
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading clients...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Client Management</h2>
          <p className="text-gray-600">Manage your client accounts and configurations</p>
        </div>
        <Button asChild>
          <Link href="/admin/clients/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Client
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clients ({filteredClients.length})
            {filteredClients.length !== clients.length && (
              <span className="text-sm font-normal text-gray-500">
                of {clients.length} total
              </span>
            )}
          </CardTitle>
          <CardDescription>Overview of all client accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients by name, slug, or package..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              className="max-w-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters() && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFiltersCount()}
                </Badge>
              )}
              {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                {/* Status Filter */}
                <div className="space-y-2">
                  <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                    <SelectTrigger id="status-filter" className="h-9">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Success Package Filter */}
                <div className="space-y-2">
                  <Label htmlFor="package-filter" className="text-sm font-medium">Success Package</Label>
                  <Select value={filters.successPackage} onValueChange={(value) => updateFilter("successPackage", value)}>
                    <SelectTrigger id="package-filter" className="h-9">
                      <SelectValue placeholder="All packages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All packages</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="elite">Elite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Billing Type Filter */}
                <div className="space-y-2">
                  <Label htmlFor="billing-filter" className="text-sm font-medium">Billing Type</Label>
                  <Select value={filters.billingType} onValueChange={(value) => updateFilter("billingType", value)}>
                    <SelectTrigger id="billing-filter" className="h-9">
                      <SelectValue placeholder="All billing types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All billing types</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Plan Type Filter */}
                <div className="space-y-2">
                  <Label htmlFor="plan-filter" className="text-sm font-medium">Plan Type</Label>
                  <Select value={filters.planType} onValueChange={(value) => updateFilter("planType", value)}>
                    <SelectTrigger id="plan-filter" className="h-9">
                      <SelectValue placeholder="All plan types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All plan types</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filters */}
                <div className="space-y-2">
                  <Label htmlFor="date-from" className="text-sm font-medium">Created From</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter("dateFrom", e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-to" className="text-sm font-medium">Created To</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter("dateTo", e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Users Range Filters */}
                <div className="space-y-2">
                  <Label htmlFor="users-min" className="text-sm font-medium">Min Users</Label>
                  <Input
                    id="users-min"
                    type="number"
                    placeholder="Min"
                    value={filters.usersMin}
                    onChange={(e) => updateFilter("usersMin", e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="users-max" className="text-sm font-medium">Max Users</Label>
                  <Input
                    id="users-max"
                    type="number"
                    placeholder="Max"
                    value={filters.usersMax}
                    onChange={(e) => updateFilter("usersMax", e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Revenue Range Filters */}
                <div className="space-y-2">
                  <Label htmlFor="revenue-min" className="text-sm font-medium">Min Revenue ($)</Label>
                  <Input
                    id="revenue-min"
                    type="number"
                    placeholder="Min"
                    value={filters.revenueMin}
                    onChange={(e) => updateFilter("revenueMin", e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revenue-max" className="text-sm font-medium">Max Revenue ($)</Label>
                  <Input
                    id="revenue-max"
                    type="number"
                    placeholder="Max"
                    value={filters.revenueMax}
                    onChange={(e) => updateFilter("revenueMax", e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Active Filters Summary */}
          {hasActiveFilters() && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-blue-900">Active Filters</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 h-6 px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.status && (
                  <Badge variant="secondary" className="text-xs">
                    Status: {filters.status}
                  </Badge>
                )}
                {filters.successPackage && (
                  <Badge variant="secondary" className="text-xs">
                    Package: {filters.successPackage}
                  </Badge>
                )}
                {filters.billingType && (
                  <Badge variant="secondary" className="text-xs">
                    Billing: {filters.billingType}
                  </Badge>
                )}
                {filters.planType && (
                  <Badge variant="secondary" className="text-xs">
                    Plan: {filters.planType}
                  </Badge>
                )}
                {filters.dateFrom && (
                  <Badge variant="secondary" className="text-xs">
                    From: {new Date(filters.dateFrom).toLocaleDateString()}
                  </Badge>
                )}
                {filters.dateTo && (
                  <Badge variant="secondary" className="text-xs">
                    To: {new Date(filters.dateTo).toLocaleDateString()}
                  </Badge>
                )}
                {filters.usersMin && (
                  <Badge variant="secondary" className="text-xs">
                    Users: ≥{filters.usersMin}
                  </Badge>
                )}
                {filters.usersMax && (
                  <Badge variant="secondary" className="text-xs">
                    Users: ≤{filters.usersMax}
                  </Badge>
                )}
                {filters.revenueMin && (
                  <Badge variant="secondary" className="text-xs">
                    Revenue: ≥${parseInt(filters.revenueMin).toLocaleString()}
                  </Badge>
                )}
                {filters.revenueMax && (
                  <Badge variant="secondary" className="text-xs">
                    Revenue: ≤${parseInt(filters.revenueMax).toLocaleString()}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-600 mb-4">
                {hasActiveFilters() ? "No clients match your filter criteria." : "Get started by adding your first client."}
              </p>
              {!hasActiveFilters() && (
                <Button asChild>
                  <Link href="/admin/clients/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Client
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{client.name}</h3>
                        <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
                        <Badge className={getPackageColor(client.success_package)}>{client.success_package}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span>Slug: {client.slug}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{client.number_of_users || 0} users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Billing: {client.billing_type}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Plan:</span>
                          <Badge variant="outline">{client.plan_type}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Revenue:</span>
                          <span>${client.revenue_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Created:</span>
                          <span>{new Date(client.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {client.custom_app && getCustomAppLabel(client.custom_app) !== "Not Applicable" && (
                        <div className="mt-2">
                          <Badge variant="outline">Custom App: {getCustomAppLabel(client.custom_app)}</Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/clients/${client.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditClient(client)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClient(client.id, client.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>Update client information and settings</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            {editingClient && (
              <EditClientForm client={editingClient} onSuccess={handleEditSuccess} onCancel={handleEditCancel} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
