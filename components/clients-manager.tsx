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
import { Plus, Search, Edit, Trash2, Eye, Users, Package, Calendar, Filter, X, ChevronDown, ChevronUp, DollarSign, Clock } from "lucide-react"
import Link from "next/link"
import { EditClientForm } from "./edit-client-form"
import { getImplementationManagers, ImplementationManager } from "@/lib/implementationManagers"

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
  implementationManager: string
}

export function ClientsManager({ initialStatus, initialImplementationManager }: { initialStatus?: string, initialImplementationManager?: string } = {}) {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [managers, setManagers] = useState<ImplementationManager[]>([])
  
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
    revenueMax: "",
    implementationManager: initialImplementationManager || ""
  })

  useEffect(() => {
    if (initialStatus) {
      setFilters((prev) => ({ ...prev, status: initialStatus }))
    }
    if (initialImplementationManager) {
      setFilters((prev) => ({ ...prev, implementationManager: initialImplementationManager }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStatus, initialImplementationManager])

  useEffect(() => {
    loadClients()
    loadManagers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [clients, filters])

  const loadManagers = async () => {
    try {
      const data = await getImplementationManagers()
      setManagers(data)
    } catch (error) {
      // Optionally handle error
    }
  }

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

    // Implementation Manager filter
    if (filters.implementationManager && filters.implementationManager !== "all") {
      filtered = filtered.filter(client => client.implementation_manager === filters.implementationManager)
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
      revenueMax: "",
      implementationManager: ""
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
        return "bg-green-500/20 text-green-300"
      case "inactive":
        return "bg-red-500/20 text-red-300"
      case "pending":
        return "bg-yellow-400/20 text-yellow-300"
      case "draft":
        return "bg-slate-400/20 text-slate-200"
      case "completed":
        return "bg-blue-500/20 text-blue-300"
      default:
        return "bg-slate-400/20 text-slate-200"
    }
  }

  const getPackageColor = (pkg: string) => {
    switch (pkg) {
      case "light":
        return "bg-blue-500/20 text-blue-300"
      case "premium":
        return "bg-purple-500/20 text-purple-300"
      case "gold":
        return "bg-yellow-400/20 text-yellow-300"
      case "elite":
        return "bg-red-500/20 text-red-300"
      default:
        return "bg-slate-400/20 text-slate-200"
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
      <Card className="bg-[#10122b]/90 ring-1 ring-[#F2C94C]/30 rounded-2xl">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2C94C] mx-auto mb-4"></div>
            <p className="text-white/60">Loading clients...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Client Management</h2>
          <p className="text-white/80">Manage your client accounts and configurations</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-white font-semibold h-11 px-6 text-[18px] shadow-md hover:brightness-110 border border-[#F2C94C]/70 flex items-center">
          <Link href="/admin/clients/new">
            <Plus className="h-5 w-5 mr-2" />
            Add New Client
          </Link>
        </Button>
      </div>

      <Card className="bg-[#10122b]/90 ring-1 ring-[#F2C94C]/30 rounded-2xl p-0">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5 text-[#F2C94C]" />
            Clients ({filteredClients.length})
            {filteredClients.length !== clients.length && (
              <span className="text-sm font-normal text-white/60">
                of {clients.length} total
              </span>
            )}
          </CardTitle>
          <CardDescription className="text-white/80">Overview of all client accounts</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center space-x-2 mb-6">
            <Search className="h-4 w-4 text-white/60" />
            <Input
              placeholder="Search clients by name, slug, or package..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              className="max-w-sm bg-[#181a2f] border border-slate-600 text-white placeholder-white/60 rounded-lg focus:ring-2 focus:ring-[#F2C94C]"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 bg-[#181a2f] border border-slate-600 text-white hover:bg-[#23244a] rounded-lg"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters() && (
                <Badge variant="secondary" className="ml-1 bg-[#F2C94C]/20 text-[#F2C94C]">
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
                className="flex items-center gap-2 text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 gap-y-3 p-4 bg-[#181a2f]/50 rounded-lg">
                {/* Status Filter */}
                <div className="space-y-2">
                  <Label htmlFor="status-filter" className="text-sm font-medium text-white">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                    <SelectTrigger id="status-filter" className="h-9 bg-[#181a2f] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-[#F2C94C]">
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
                  <Label htmlFor="package-filter" className="text-sm font-medium text-white">Success Package</Label>
                  <Select value={filters.successPackage} onValueChange={(value) => updateFilter("successPackage", value)}>
                    <SelectTrigger id="package-filter" className="h-9 bg-[#181a2f] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-[#F2C94C]">
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
                  <Label htmlFor="billing-filter" className="text-sm font-medium text-white">Billing Type</Label>
                  <Select value={filters.billingType} onValueChange={(value) => updateFilter("billingType", value)}>
                    <SelectTrigger id="billing-filter" className="h-9 bg-[#181a2f] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-[#F2C94C]">
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
                  <Label htmlFor="plan-filter" className="text-sm font-medium text-white">Plan Type</Label>
                  <Select value={filters.planType} onValueChange={(value) => updateFilter("planType", value)}>
                    <SelectTrigger id="plan-filter" className="h-9 bg-[#181a2f] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-[#F2C94C]">
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
                  <Label htmlFor="date-from" className="text-sm font-medium text-white">Created From</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter("dateFrom", e.target.value)}
                    className="h-9 bg-[#181a2f] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-[#F2C94C]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-to" className="text-sm font-medium text-white">Created To</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter("dateTo", e.target.value)}
                    className="h-9 bg-[#181a2f] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-[#F2C94C]"
                  />
                </div>

                {/* Users Range Filters */}
                <div className="space-y-2">
                  <Label htmlFor="users-min" className="text-sm font-medium text-white">Min Users</Label>
                  <Input
                    id="users-min"
                    type="number"
                    placeholder="Min"
                    value={filters.usersMin}
                    onChange={(e) => updateFilter("usersMin", e.target.value)}
                    className="h-9 bg-[#181a2f] border border-slate-600 text-white placeholder-white/60 rounded-lg focus:ring-2 focus:ring-[#F2C94C]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="users-max" className="text-sm font-medium text-white">Max Users</Label>
                  <Input
                    id="users-max"
                    type="number"
                    placeholder="Max"
                    value={filters.usersMax}
                    onChange={(e) => updateFilter("usersMax", e.target.value)}
                    className="h-9 bg-[#181a2f] border border-slate-600 text-white placeholder-white/60 rounded-lg focus:ring-2 focus:ring-[#F2C94C]"
                  />
                </div>

                {/* Revenue Range Filters */}
                <div className="space-y-2">
                  <Label htmlFor="revenue-min" className="text-sm font-medium text-white">Min Revenue ($)</Label>
                  <Input
                    id="revenue-min"
                    type="number"
                    placeholder="Min"
                    value={filters.revenueMin}
                    onChange={(e) => updateFilter("revenueMin", e.target.value)}
                    className="h-9 bg-[#181a2f] border border-slate-600 text-white placeholder-white/60 rounded-lg focus:ring-2 focus:ring-[#F2C94C]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revenue-max" className="text-sm font-medium text-white">Max Revenue ($)</Label>
                  <Input
                    id="revenue-max"
                    type="number"
                    placeholder="Max"
                    value={filters.revenueMax}
                    onChange={(e) => updateFilter("revenueMax", e.target.value)}
                    className="h-9 bg-[#181a2f] border border-slate-600 text-white placeholder-white/60 rounded-lg focus:ring-2 focus:ring-[#F2C94C]"
                  />
                </div>

                {/* Implementation Manager Filter */}
                <div className="space-y-2">
                  <Label htmlFor="manager-filter" className="text-sm font-medium text-white">Implementation Manager</Label>
                  <Select value={filters.implementationManager} onValueChange={(value) => updateFilter("implementationManager", value)}>
                    <SelectTrigger id="manager-filter" className="h-9 bg-[#181a2f] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-[#F2C94C]">
                      <SelectValue placeholder="All managers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All managers</SelectItem>
                      {managers.map((manager) => (
                        <SelectItem key={manager.manager_id} value={manager.manager_id}>{manager.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Active Filters Summary */}
          {hasActiveFilters() && (
            <div className="mb-4 p-3 bg-[#10122b]/70 ring-1 ring-[#F2C94C]/20 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-slate-100">Active Filters</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gold-300 hover:text-gold-200 h-6 px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.status && (
                  <span className="bg-[#F2C94C]/20 text-[#F2C94C] px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Status: {filters.status}
                  </span>
                )}
                {filters.successPackage && (
                  <span className="bg-[#F2C94C]/20 text-[#F2C94C] px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Package: {filters.successPackage}
                  </span>
                )}
                {filters.billingType && (
                  <span className="bg-[#F2C94C]/20 text-[#F2C94C] px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Billing: {filters.billingType}
                  </span>
                )}
                {filters.planType && (
                  <span className="bg-[#F2C94C]/20 text-[#F2C94C] px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Plan: {filters.planType}
                  </span>
                )}
                {filters.dateFrom && (
                  <span className="bg-[#F2C94C]/20 text-[#F2C94C] px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    From: {new Date(filters.dateFrom).toLocaleDateString()}
                  </span>
                )}
                {filters.dateTo && (
                  <span className="bg-[#F2C94C]/20 text-[#F2C94C] px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    To: {new Date(filters.dateTo).toLocaleDateString()}
                  </span>
                )}
                {filters.usersMin && (
                  <span className="bg-[#F2C94C]/20 text-[#F2C94C] px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Users: ≥{filters.usersMin}
                  </span>
                )}
                {filters.usersMax && (
                  <span className="bg-[#F2C94C]/20 text-[#F2C94C] px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Users: ≤{filters.usersMax}
                  </span>
                )}
                {filters.revenueMin && (
                  <span className="bg-[#F2C94C]/20 text-[#F2C94C] px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Revenue: ≥${parseInt(filters.revenueMin).toLocaleString()}
                  </span>
                )}
                {filters.revenueMax && (
                  <span className="bg-[#F2C94C]/20 text-[#F2C94C] px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Revenue: ≤${parseInt(filters.revenueMax).toLocaleString()}
                  </span>
                )}
                {filters.implementationManager && (
                  <span className="bg-[#F2C94C]/20 text-[#F2C94C] px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Manager: {managers.find(m => m.manager_id === filters.implementationManager)?.name || filters.implementationManager}
                  </span>
                )}
              </div>
            </div>
          )}

          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No clients found</h3>
              <p className="text-white/60 mb-4">
                {hasActiveFilters() ? "No clients match your filter criteria." : "Get started by adding your first client."}
              </p>
              {!hasActiveFilters() && (
                <Button asChild className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-white font-semibold rounded-lg h-11 px-6 text-[18px] shadow-md hover:brightness-110 border border-[#F2C94C]/70">
                  <Link href="/admin/clients/new">
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Client
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="group bg-[#10122b]/90 ring-1 ring-[#F2C94C]/20 rounded-xl p-5 transition-all hover:ring-2 hover:ring-[#F2C94C]/40">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-[17px] text-white">{client.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase ${getPackageColor(client.success_package)}`}>
                          {client.success_package}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-[#F2C94C]" />
                          <span>Slug: {client.slug}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#F2C94C]" />
                          <span>{client.number_of_users || 0} users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#F2C94C]" />
                          <span>Billing: {client.billing_type}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/60 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">Plan:</span>
                          <span className="bg-[#23244a] text-white/80 px-2 py-0.5 rounded-full text-xs font-medium">{client.plan_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-[#F2C94C]" />
                          <span>${client.revenue_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#F2C94C]" />
                          <span>{new Date(client.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {/* Implementation Manager */}
                      <div className="mt-3">
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Users className="h-4 w-4 text-[#F2C94C]" />
                          <span className="font-medium text-white">Manager:</span>
                          <span className="bg-[#23244a] text-white/80 px-2 py-0.5 rounded-full text-xs font-medium">
                            {managers.find(m => m.manager_id === client.implementation_manager)?.name || client.implementation_manager}
                          </span>
                        </div>
                      </div>
                      
                      {/* Call Dates and Graduation Date */}
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Calendar className="h-4 w-4 text-[#F2C94C]" />
                          <span className="font-medium text-white">Key Dates:</span>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-6">
                          {client.graduation_date && (
                            <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full text-xs font-medium">
                              Graduation: {new Date(client.graduation_date).toLocaleDateString()}
                            </span>
                          )}
                          {client.light_onboarding_call_date && (
                            <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full text-xs font-medium">
                              Light Call: {new Date(client.light_onboarding_call_date).toLocaleDateString()}
                            </span>
                          )}
                          {client.premium_first_call_date && (
                            <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full text-xs font-medium">
                              Premium 1st: {new Date(client.premium_first_call_date).toLocaleDateString()}
                            </span>
                          )}
                          {client.premium_second_call_date && (
                            <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full text-xs font-medium">
                              Premium 2nd: {new Date(client.premium_second_call_date).toLocaleDateString()}
                            </span>
                          )}
                          {client.gold_first_call_date && (
                            <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full text-xs font-medium">
                              Gold 1st: {new Date(client.gold_first_call_date).toLocaleDateString()}
                            </span>
                          )}
                          {client.gold_second_call_date && (
                            <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full text-xs font-medium">
                              Gold 2nd: {new Date(client.gold_second_call_date).toLocaleDateString()}
                            </span>
                          )}
                          {client.gold_third_call_date && (
                            <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full text-xs font-medium">
                              Gold 3rd: {new Date(client.gold_third_call_date).toLocaleDateString()}
                            </span>
                          )}
                          {client.elite_configurations_started_date && (
                            <span className="bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full text-xs font-medium">
                              Elite Config: {new Date(client.elite_configurations_started_date).toLocaleDateString()}
                            </span>
                          )}
                          {client.elite_integrations_started_date && (
                            <span className="bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full text-xs font-medium">
                              Elite Integrations: {new Date(client.elite_integrations_started_date).toLocaleDateString()}
                            </span>
                          )}
                          {client.elite_verification_completed_date && (
                            <span className="bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full text-xs font-medium">
                              Elite Verification: {new Date(client.elite_verification_completed_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {client.custom_app && getCustomAppLabel(client.custom_app) !== "Not Applicable" && (
                        <div className="mt-2">
                          <span className="bg-[#23244a] text-white/80 px-2 py-0.5 rounded-full text-xs font-medium">
                            Custom App: {getCustomAppLabel(client.custom_app)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button asChild variant="outline" size="sm" className="w-8 h-8 bg-[#181a2f] rounded-md flex items-center justify-center hidden group-hover:flex">
                        <Link href={`/admin/clients/${client.id}`}>
                          <Eye className="h-4 w-4 text-[#F2C94C]" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClient(client.id, client.name)}
                        className="w-8 h-8 bg-[#181a2f] rounded-md flex items-center justify-center hidden group-hover:flex text-red-400 hover:text-red-300"
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
    </div>
  )
}
