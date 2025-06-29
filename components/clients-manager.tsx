"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { getAllClients, deleteClient, type Client } from "@/lib/database"
import { Plus, Search, Edit, Trash2, Eye, Users, Package, Calendar } from "lucide-react"
import Link from "next/link"
import { EditClientForm } from "./edit-client-form"

export function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.success_package.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredClients(filtered)
  }, [clients, searchTerm])

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
          </CardTitle>
          <CardDescription>Overview of all client accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients by name, slug, or package..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "No clients match your search criteria." : "Get started by adding your first client."}
              </p>
              {!searchTerm && (
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
                          <span>{client.number_of_users} users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Billing: {client.billing_type}</span>
                        </div>
                      </div>
                      {client.custom_app && client.custom_app !== "Not Applicable" && (
                        <div className="mt-2">
                          <Badge variant="outline">Custom App: {client.custom_app}</Badge>
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
