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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { getAllClients, deleteClient } from "@/lib/database"
import { type Client } from "@/lib/types"
import { Plus, Search, Edit, Trash2, Eye, Users, Package, Calendar, Filter, X, ChevronDown, ChevronUp, DollarSign, Clock, AlertTriangle, Download } from "lucide-react"
import Link from "next/link"
import { EditClientForm } from "./edit-client-form"
import { getImplementationManagers, ImplementationManager } from "@/lib/implementationManagers"
import { useRouter, useSearchParams } from "next/navigation"

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
  no_onboarding_call?: boolean
}

export function ClientsManager({ initialStatus, initialImplementationManager }: { initialStatus?: string, initialImplementationManager?: string } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    implementationManager: initialImplementationManager || "",
    no_onboarding_call: false,
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

  // Add effect to update filters from query params
  useEffect(() => {
    const churned = searchParams.get('churned');
    const noOnboardingCall = searchParams.get('no_onboarding_call');
    if (churned === 'true') {
      setFilters((prev) => ({ ...prev, status: '', successPackage: '', billingType: '', planType: '', implementationManager: '', searchTerm: '', no_onboarding_call: false }));
    }
    if (noOnboardingCall === 'true') {
      setFilters((prev) => ({ ...prev, status: '', successPackage: '', billingType: '', planType: '', implementationManager: '', searchTerm: '', no_onboarding_call: true }));
    }
  }, [searchParams])

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

    // Churned filter from query param
    if (searchParams.get('churned') === 'true') {
      filtered = filtered.filter(client => client.churned === true)
    }

    // Filter for no_onboarding_call
    if (filters.no_onboarding_call) {
      filtered = filtered.filter(client => {
        let missingFirstCall = false;
        if (client.success_package === 'light' && !client.light_onboarding_call_date) missingFirstCall = true;
        if (client.success_package === 'premium' && !client.premium_first_call_date) missingFirstCall = true;
        if (client.success_package === 'gold' && !client.gold_first_call_date) missingFirstCall = true;
        if (client.success_package === 'elite' && !client.elite_configurations_started_date) missingFirstCall = true;
        // Exclude completed clients
        return missingFirstCall && client.status !== 'completed';
      });
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

  const handleExportCSV = () => {
    if (filteredClients.length === 0) {
      toast({
        title: "No Data",
        description: "No clients to export",
        variant: "destructive",
      })
      return
    }

    // Create CSV headers
    const headers = [
      "ID",
      "Name", 
      "Slug",
      "Email",
      "Status",
      "Success Package",
      "Billing Type",
      "Plan Type",
      "Number of Users",
      "Revenue Amount",
      "Implementation Manager",
      "Created At",
      "Light Onboarding Call Date",
      "Premium First Call Date",
      "Premium Second Call Date", 
      "Gold First Call Date",
      "Gold Second Call Date",
      "Gold Third Call Date",
      "Elite Configurations Started Date",
      "Elite Integrations Started Date",
      "Elite Verification Completed Date",
      "Extra Call Dates",
      "Custom App",
      "Churned",
      "Churn Risk",
      "Onboarding Email Sent"
    ]

    // Create CSV rows
    const csvRows = [
      headers,
      ...filteredClients.map(client => [
        client.id,
        client.name,
        client.slug,
        client.email || "",
        client.status,
        client.success_package,
        client.billing_type,
        client.plan_type,
        client.number_of_users || 0,
        client.revenue_amount,
        client.implementation_manager,
        client.created_at ? new Date(client.created_at).toISOString().slice(0, 10) : "",
        client.light_onboarding_call_date ? new Date(client.light_onboarding_call_date).toISOString().slice(0, 10) : "",
        client.premium_first_call_date ? new Date(client.premium_first_call_date).toISOString().slice(0, 10) : "",
        client.premium_second_call_date ? new Date(client.premium_second_call_date).toISOString().slice(0, 10) : "",
        client.gold_first_call_date ? new Date(client.gold_first_call_date).toISOString().slice(0, 10) : "",
        client.gold_second_call_date ? new Date(client.gold_second_call_date).toISOString().slice(0, 10) : "",
        client.gold_third_call_date ? new Date(client.gold_third_call_date).toISOString().slice(0, 10) : "",
        client.elite_configurations_started_date ? new Date(client.elite_configurations_started_date).toISOString().slice(0, 10) : "",
        client.elite_integrations_started_date ? new Date(client.elite_integrations_started_date).toISOString().slice(0, 10) : "",
        client.elite_verification_completed_date ? new Date(client.elite_verification_completed_date).toISOString().slice(0, 10) : "",
        Array.isArray(client.extra_call_dates) ? client.extra_call_dates.join("; ") : "",
        client.custom_app || "",
        client.churned ? "Yes" : "No",
        client.churn_risk ? "Yes" : "No",
        client.onboarding_email_sent ? "Yes" : "No"
      ])
    ]

    // Convert to CSV string
    const csvContent = csvRows.map(row => 
      row.map(field => {
        // Escape fields that contain commas, quotes, or newlines
        if (typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
          return `"${field.replace(/"/g, '""')}"`
        }
        return field
      }).join(',')
    ).join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `clients-export-${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: `Exported ${filteredClients.length} clients to CSV`,
    })
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

  // Add a helper to format date as yyyy-mm-dd (UTC)
  function formatDateUTC(date: Date) {
    return date ? date.toISOString().slice(0, 10) : '';
  }

  if (loading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold mx-auto mb-4"></div>
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
          <h2 className="text-2xl font-bold mb-2" style={{color: '#060520'}}>Client Management</h2>
          <p className="text-gray-600">Manage your client accounts and configurations</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleExportCSV}
            variant="outline"
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 h-11 px-6 text-[18px] flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </Button>
          <Button asChild className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-semibold h-11 px-6 text-[18px] shadow-md hover:brightness-110 border border-brand-gold/70 flex items-center">
            <Link href="/admin/clients/new">
              <Plus className="h-5 w-5 mr-2" />
              Add New Client
            </Link>
          </Button>
        </div>
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl p-0">
        <CardHeader className="pb-0 bg-white rounded-t-2xl">
          <CardTitle className="flex items-center gap-2" style={{color: '#060520'}}>
            <Users className="h-5 w-5 text-brand-gold" />
            Clients ({filteredClients.length})
            {filteredClients.length !== clients.length && (
              <span className="text-sm font-normal text-gray-500">
                of {clients.length} total
              </span>
            )}
          </CardTitle>
          <CardDescription className="text-gray-600">Overview of all client accounts</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 bg-white rounded-b-2xl">
          <div className="flex items-center space-x-2 mb-6">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients by name, slug, or package..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              className="max-w-sm bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters() && (
                <Badge variant="secondary" className="ml-1 bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
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
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 gap-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                {/* Status Filter */}
                <div className="space-y-2">
                  <Label htmlFor="status-filter" className="text-sm font-medium" style={{color: '#060520'}}>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                    <SelectTrigger id="status-filter" className="h-9 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold">
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
                  <Label htmlFor="package-filter" className="text-sm font-medium" style={{color: '#060520'}}>Success Package</Label>
                  <Select value={filters.successPackage} onValueChange={(value) => updateFilter("successPackage", value)}>
                    <SelectTrigger id="package-filter" className="h-9 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold">
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
                  <Label htmlFor="billing-filter" className="text-sm font-medium" style={{color: '#060520'}}>Billing Type</Label>
                  <Select value={filters.billingType} onValueChange={(value) => updateFilter("billingType", value)}>
                    <SelectTrigger id="billing-filter" className="h-9 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold">
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
                  <Label htmlFor="plan-filter" className="text-sm font-medium" style={{color: '#060520'}}>Plan Type</Label>
                  <Select value={filters.planType} onValueChange={(value) => updateFilter("planType", value)}>
                    <SelectTrigger id="plan-filter" className="h-9 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold">
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
                  <Label htmlFor="date-from" className="text-sm font-medium" style={{color: '#060520'}}>Created From</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter("dateFrom", e.target.value)}
                    className="h-9 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-to" className="text-sm font-medium" style={{color: '#060520'}}>Created To</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter("dateTo", e.target.value)}
                    className="h-9 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                  />
                </div>

                {/* Users Range Filters */}
                <div className="space-y-2">
                  <Label htmlFor="users-min" className="text-sm font-medium" style={{color: '#060520'}}>Min Users</Label>
                  <Input
                    id="users-min"
                    type="number"
                    placeholder="Min"
                    value={filters.usersMin}
                    onChange={(e) => updateFilter("usersMin", e.target.value)}
                    className="h-9 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="users-max" className="text-sm font-medium" style={{color: '#060520'}}>Max Users</Label>
                  <Input
                    id="users-max"
                    type="number"
                    placeholder="Max"
                    value={filters.usersMax}
                    onChange={(e) => updateFilter("usersMax", e.target.value)}
                    className="h-9 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                  />
                </div>

                {/* Revenue Range Filters */}
                <div className="space-y-2">
                  <Label htmlFor="revenue-min" className="text-sm font-medium" style={{color: '#060520'}}>Min Revenue ($)</Label>
                  <Input
                    id="revenue-min"
                    type="number"
                    placeholder="Min"
                    value={filters.revenueMin}
                    onChange={(e) => updateFilter("revenueMin", e.target.value)}
                    className="h-9 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revenue-max" className="text-sm font-medium" style={{color: '#060520'}}>Max Revenue ($)</Label>
                  <Input
                    id="revenue-max"
                    type="number"
                    placeholder="Max"
                    value={filters.revenueMax}
                    onChange={(e) => updateFilter("revenueMax", e.target.value)}
                    className="h-9 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                  />
                </div>

                {/* Implementation Manager Filter */}
                <div className="space-y-2">
                  <Label htmlFor="manager-filter" className="text-sm font-medium" style={{color: '#060520'}}>Implementation Manager</Label>
                  <Select value={filters.implementationManager} onValueChange={(value) => updateFilter("implementationManager", value)}>
                    <SelectTrigger id="manager-filter" className="h-9 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold">
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
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium" style={{color: '#060520'}}>Active Filters</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-brand-gold hover:text-brand-gold/80 h-6 px-2 hover:bg-gray-100"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.status && (
                  <span className="bg-brand-gold/20 border border-brand-gold/30 text-brand-gold px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Status: {filters.status}
                  </span>
                )}
                {filters.successPackage && (
                  <span className="bg-brand-gold/20 border border-brand-gold/30 text-brand-gold px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Package: {filters.successPackage}
                  </span>
                )}
                {filters.billingType && (
                  <span className="bg-brand-gold/20 border border-brand-gold/30 text-brand-gold px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Billing: {filters.billingType}
                  </span>
                )}
                {filters.planType && (
                  <span className="bg-brand-gold/20 border border-brand-gold/30 text-brand-gold px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Plan: {filters.planType}
                  </span>
                )}
                {filters.dateFrom && (
                  <span className="bg-brand-gold/20 border border-brand-gold/30 text-brand-gold px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    From: {new Date(filters.dateFrom).toLocaleDateString()}
                  </span>
                )}
                {filters.dateTo && (
                  <span className="bg-brand-gold/20 border border-brand-gold/30 text-brand-gold px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    To: {new Date(filters.dateTo).toLocaleDateString()}
                  </span>
                )}
                {filters.usersMin && (
                  <span className="bg-brand-gold/20 border border-brand-gold/30 text-brand-gold px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Users: ≥{filters.usersMin}
                  </span>
                )}
                {filters.usersMax && (
                  <span className="bg-brand-gold/20 border border-brand-gold/30 text-brand-gold px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Users: ≤{filters.usersMax}
                  </span>
                )}
                {filters.revenueMin && (
                  <span className="bg-brand-gold/20 border border-brand-gold/30 text-brand-gold px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Revenue: ≥${parseInt(filters.revenueMin).toLocaleString()}
                  </span>
                )}
                {filters.revenueMax && (
                  <span className="bg-brand-gold/20 border border-brand-gold/30 text-brand-gold px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Revenue: ≤${parseInt(filters.revenueMax).toLocaleString()}
                  </span>
                )}
                {filters.implementationManager && (
                  <span className="bg-brand-gold/20 border border-brand-gold/30 text-brand-gold px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Manager: {managers.find(m => m.manager_id === filters.implementationManager)?.name || filters.implementationManager}
                  </span>
                )}
              </div>
            </div>
          )}

          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2" style={{color: '#060520'}}>No clients found</h3>
              <p className="text-gray-600 mb-4">
                {hasActiveFilters() ? "No clients match your filter criteria." : "Get started by adding your first client."}
              </p>
              {!hasActiveFilters() && (
                <Button asChild className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-semibold rounded-lg h-11 px-6 text-[18px] shadow-md hover:brightness-110 border border-brand-gold/70">
                  <Link href="/admin/clients/new">
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Client
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                    <TableHead className="font-bold text-xs sticky left-0 z-10 bg-gray-50 min-w-[180px] px-3 py-2" style={{color: '#060520'}}>Name</TableHead>
                    <TableHead className="font-bold text-xs min-w-[100px] px-3 py-2" style={{color: '#060520'}}>Status</TableHead>
                    <TableHead className="font-bold text-xs min-w-[100px] px-3 py-2" style={{color: '#060520'}}>Package</TableHead>
                    <TableHead className="font-bold text-xs min-w-[140px] px-3 py-2" style={{color: '#060520'}}>Slug</TableHead>
                    <TableHead className="font-bold text-xs min-w-[100px] px-3 py-2" style={{color: '#060520'}}>Plan</TableHead>
                    <TableHead className="font-bold text-xs min-w-[80px] px-3 py-2" style={{color: '#060520'}}>Users</TableHead>
                    <TableHead className="font-bold text-xs min-w-[110px] px-3 py-2" style={{color: '#060520'}}>Revenue</TableHead>
                    <TableHead className="font-bold text-xs min-w-[100px] px-3 py-2" style={{color: '#060520'}}>Billing</TableHead>
                    <TableHead className="font-bold text-xs min-w-[140px] px-3 py-2" style={{color: '#060520'}}>Manager</TableHead>
                    <TableHead className="font-bold text-xs min-w-[110px] px-3 py-2" style={{color: '#060520'}}>Created</TableHead>
                    <TableHead className="font-bold text-xs min-w-[140px] px-3 py-2" style={{color: '#060520'}}>Last Call</TableHead>
                    <TableHead className="font-bold text-xs min-w-[100px] px-3 py-2" style={{color: '#060520'}}>Custom App</TableHead>
                    <TableHead className="font-bold text-xs min-w-[180px] px-3 py-2" style={{color: '#060520'}}>Alerts</TableHead>
                    <TableHead className="font-bold text-xs min-w-[100px] px-3 py-2" style={{color: '#060520'}}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => {
                    // Find the most recent call date
                    const callDates = [
                      client.light_onboarding_call_date,
                      client.premium_first_call_date,
                      client.premium_second_call_date,
                      client.gold_first_call_date,
                      client.gold_second_call_date,
                      client.gold_third_call_date,
                      ...(Array.isArray(client.extra_call_dates) ? client.extra_call_dates : [])
                    ].filter((d): d is string => !!d).map(date => new Date(date))
                    const lastCallDate = callDates.length > 0 ? new Date(Math.max(...callDates.map(d => d.getTime()))) : null
                    const now = new Date()

                    // Determine if the client is missing their first onboarding call
                    let missingFirstCall = false;
                    if (client.success_package === 'light' && !client.light_onboarding_call_date) missingFirstCall = true;
                    if (client.success_package === 'premium' && !client.premium_first_call_date) missingFirstCall = true;
                    if (client.success_package === 'gold' && !client.gold_first_call_date) missingFirstCall = true;
                    if (client.success_package === 'elite' && !client.elite_configurations_started_date) missingFirstCall = true;

                    // Check if last call was more than 2 weeks ago
                    let showNoRecentCallNote = false;
                    if (!missingFirstCall && lastCallDate) {
                      const diffDays = (now.getTime() - lastCallDate.getTime()) / (1000 * 60 * 60 * 24);
                      if (diffDays > 14) {
                        showNoRecentCallNote = true;
                      }
                    }
                    if (!missingFirstCall && !lastCallDate) {
                      showNoRecentCallNote = true;
                    }

                    // Check if last call was more than 1 week ago (but less than 2 weeks)
                    let showEmailReminder = false;
                    if (!missingFirstCall && lastCallDate) {
                      const diffDays = (now.getTime() - lastCallDate.getTime()) / (1000 * 60 * 60 * 24);
                      if (diffDays > 7 && diffDays <= 14) {
                        showEmailReminder = true;
                      }
                    }

                    let rowClass = "border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    // Churned takes precedence over churn risk with deeper red
                    if (client.churned) {
                      rowClass += " bg-red-950/20"
                    } else if (client.churn_risk) {
                      rowClass += " bg-red-50"
                    }

                    const alerts = [];
                    if (missingFirstCall) alerts.push({ text: "No Onboarding Call", color: "bg-yellow-100 text-yellow-800 border border-yellow-200" });
                    if (showNoRecentCallNote) alerts.push({ text: "No Call 2+ Weeks", color: "bg-red-100 text-red-800 border border-red-200" });
                    if (showEmailReminder) alerts.push({ text: "Email: 1+ Week", color: "bg-yellow-100 text-yellow-800 border border-yellow-200" });
                    if (client.churned) alerts.push({ text: "Churned", color: "bg-red-900 text-white border border-red-950" });
                    if (client.churn_risk) alerts.push({ text: "⚠ Churn Risk", color: "bg-red-600 text-white border border-red-700" });
                    if (client.success_package === 'no_success') {
                      if (client.onboarding_email_sent) {
                        alerts.push({ text: "CSM Email Sent", color: "bg-green-100 text-green-800 border border-green-200" });
                      } else {
                        alerts.push({ text: "CSM Needs Email", color: "bg-yellow-100 text-yellow-800 border border-yellow-200" });
                      }
                    }

                    return (
                      <TableRow key={client.id} className={rowClass}>
                        <TableCell className="font-semibold text-xs sticky left-0 z-10 bg-white border-r border-gray-200 min-w-[180px] px-3 py-2" style={{color: '#060520'}}>
                          <Link 
                            href={`/admin/clients/${client.id}`}
                            className="hover:text-brand-gold transition-colors cursor-pointer"
                          >
                            {client.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase ${getStatusColor(client.status)}`}>
                            {client.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase ${getPackageColor(client.success_package)}`}>
                            {client.success_package}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs min-w-[140px] px-3 py-2" style={{color: '#64748b'}}>
                          {client.slug ? (
                            <Link 
                              href={`/client/${client.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-brand-gold transition-colors cursor-pointer group"
                            >
                              <Package className="h-3 w-3 text-brand-gold group-hover:text-brand-gold" />
                              <span className="truncate">{client.slug}</span>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3 text-gray-400" />
                              <span className="truncate">—</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs px-3 py-2" style={{color: '#64748b'}}>
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{client.plan_type}</span>
                        </TableCell>
                        <TableCell className="text-xs px-3 py-2" style={{color: '#64748b'}}>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-brand-gold" />
                            {client.number_of_users || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs px-3 py-2" style={{color: '#64748b'}}>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-brand-gold" />
                            ${client.revenue_amount.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs px-3 py-2" style={{color: '#64748b'}}>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-brand-gold" />
                            {client.billing_type}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs min-w-[140px] px-3 py-2" style={{color: '#64748b'}}>
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                            {managers.find(m => m.manager_id === client.implementation_manager)?.name || client.implementation_manager || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs px-3 py-2" style={{color: '#64748b'}}>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-brand-gold" />
                            {client.created_at ? new Date(client.created_at).toISOString().slice(0, 10) : "—"}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs min-w-[140px] px-3 py-2" style={{color: '#64748b'}}>
                          {lastCallDate ? formatDateUTC(lastCallDate) : "—"}
                        </TableCell>
                        <TableCell className="text-xs px-3 py-2" style={{color: '#64748b'}}>
                          {client.custom_app && getCustomAppLabel(client.custom_app) !== "Not Applicable" ? (
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                              {getCustomAppLabel(client.custom_app)}
                            </span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-xs min-w-[180px] px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {alerts.map((alert, idx) => (
                              <span key={idx} className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${alert.color}`}>
                                {alert.text}
                              </span>
                            ))}
                            {alerts.length === 0 && <span className="text-gray-400">—</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs px-3 py-2">
                          <div className="flex items-center gap-1">
                            <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100">
                              <Link href={`/admin/clients/${client.id}`}>
                                <Eye className="h-3.5 w-3.5 text-brand-gold" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClient(client)}
                              className="h-7 w-7 p-0 hover:bg-gray-100"
                            >
                              <Edit className="h-3.5 w-3.5 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClient(client.id, client.name)}
                              className="h-7 w-7 p-0 hover:bg-gray-100 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredClients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center py-8 px-3" style={{color: '#64748b'}}>
                        No clients found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
