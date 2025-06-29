"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  updateClientFeature,
} from "@/lib/database"
import type { ClientFeature, Feature, Client } from "@/lib/types"
import { Plus, Edit, Rocket, Calendar, User, DollarSign, Trash2 } from "lucide-react"
import { useState } from "react"

interface ClientFeaturesManagerProps {
  clientFeatures: ClientFeature[]
  availableFeatures: Feature[]
  client: Client | null
}

export function ClientFeaturesManager({ clientFeatures, availableFeatures, client }: ClientFeaturesManagerProps) {
  const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<ClientFeature | null>(null)

  const handleProposeFeature = async (featureId: string, salesPerson: string, customNotes?: string) => {
    // The API route already inserts the new feature, so just close the dialog or trigger a refresh here
    setIsProposalDialogOpen(false)
  }

  const handleUpdateFeature = async (clientFeatureId: string, updates: Partial<ClientFeature>) => {
    try {
      const res = await fetch("/api/update-client-feature", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientFeatureId, updates }),
      })
      const data = await res.json()
      if (data.success) {
        setEditingFeature(null)
        window.location.reload(); // Reload the page to refresh the feature list
      } else {
        alert("Error updating client feature: " + (data.error || "Unknown error"))
      }
    } catch (error: any) {
      alert("Error updating client feature: " + error.message)
    }
  }

  const handleDeleteClientFeature = async (clientFeatureId: string) => {
    if (confirm("Are you sure you want to remove this feature from the client?")) {
      try {
        const res = await fetch("/api/delete-client-feature", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientFeatureId }),
        });
        const data = await res.json();
        if (data.success) {
          window.location.reload();
        } else {
          alert("Error deleting client feature: " + (data.error || "Unknown error"));
        }
      } catch (error: any) {
        alert("Error deleting client feature: " + error.message);
      }
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "proposed":
        return "bg-gray-100 text-gray-800"
      case "interested":
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "implementing":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-purple-100 text-purple-800"
      case "declined":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Filter available features to exclude already assigned ones
  const unassignedFeatures = availableFeatures.filter(
    (feature) => !clientFeatures.some((cf) => cf.feature_id === feature.id),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-[#ECB22D]" />
                Client Features
              </CardTitle>
              <CardDescription>
                Manage features proposed and assigned to {client?.name || "this client"}
              </CardDescription>
            </div>
            <Dialog open={isProposalDialogOpen} onOpenChange={setIsProposalDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Propose Feature
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Propose Feature to Client</DialogTitle>
                  <DialogDescription>Select a feature to propose to {client?.name}</DialogDescription>
                </DialogHeader>
                <FeatureProposalForm
                  availableFeatures={unassignedFeatures}
                  clientPackage={client?.success_package || ""}
                  onSubmit={handleProposeFeature}
                  client={client}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientFeatures.map((clientFeature) => {
              const feature = clientFeature.feature
              if (!feature) return null

              return (
                <div key={clientFeature.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium">{feature.title}</h3>
                        <Badge className={getStatusBadgeColor(clientFeature.status)}>{clientFeature.status}</Badge>
                        {feature.category && <Badge variant="outline">{feature.category}</Badge>}
                        {feature.pricing_amount && (
                          <Badge variant="outline" className="text-green-600">
                            <DollarSign className="h-3 w-3 mr-1" />${feature.pricing_amount}
                          </Badge>
                        )}
                        {clientFeature.is_featured && (
                          <Badge variant="secondary" className="bg-[#ECB22D] text-[#010124]">
                            Featured
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{feature.description}</p>

                      {/* Dates */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Proposed: {new Date(clientFeature.proposed_date).toLocaleDateString()}
                        </div>
                        {clientFeature.sales_person && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            By: {clientFeature.sales_person}
                          </div>
                        )}
                      </div>

                      {/* Custom Notes */}
                      {clientFeature.custom_notes && (
                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">
                          <strong>Notes:</strong> {clientFeature.custom_notes}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setEditingFeature(clientFeature)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Update Feature Status</DialogTitle>
                            <DialogDescription>Update the status and settings for this feature</DialogDescription>
                          </DialogHeader>
                          <FeatureUpdateForm
                            clientFeature={clientFeature}
                            onSubmit={(updates) => handleUpdateFeature(clientFeature.id, updates)}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClientFeature(clientFeature.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {clientFeatures.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Rocket className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No features proposed to this client yet.</p>
              <p className="text-sm">Click "Propose Feature" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface FeatureProposalFormProps {
  availableFeatures: Feature[]
  clientPackage: string
  onSubmit: (featureId: string, salesPerson: string, customNotes?: string) => void
  client: Client | null
}

function FeatureProposalForm({ availableFeatures, clientPackage, onSubmit, client }: FeatureProposalFormProps) {
  const [selectedFeatureId, setSelectedFeatureId] = useState("")
  const [salesPerson, setSalesPerson] = useState("")
  const [customNotes, setCustomNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFeatureId && salesPerson && client?.id) {
      setSubmitting(true)
      try {
        const res = await fetch("/api/propose-feature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: client.id,
            featureId: selectedFeatureId,
            salesPerson,
            customNotes,
          }),
        })
        const data = await res.json()
        if (data.success) {
          setSelectedFeatureId("")
          setSalesPerson("")
          setCustomNotes("")
          if (onSubmit) onSubmit(selectedFeatureId, salesPerson, customNotes)
          window.location.reload(); // Reload the page to show the new feature
        } else {
          alert("Error proposing feature: " + (data.error || "Unknown error"))
        }
      } catch (err: any) {
        alert("Error proposing feature: " + err.message)
      } finally {
        setSubmitting(false)
      }
    }
  }

  // Filter features that target this client's package
  const relevantFeatures = availableFeatures.filter(
    (feature) => (Array.isArray(feature.target_packages) ? feature.target_packages.length === 0 || feature.target_packages.includes(clientPackage) : true)
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="feature">Select Feature</Label>
        <Select value={selectedFeatureId} onValueChange={setSelectedFeatureId} required>
          <SelectTrigger>
            <SelectValue placeholder="Choose a feature to propose" />
          </SelectTrigger>
          <SelectContent>
            {relevantFeatures.map((feature) => (
              <SelectItem key={feature.id} value={feature.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{feature.title}</span>
                  {feature.pricing_amount && <span className="text-green-600 ml-2">${feature.pricing_amount}</span>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {relevantFeatures.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">No features available for the {clientPackage} package.</p>
        )}
      </div>

      <div>
        <Label htmlFor="salesPerson">Sales Person</Label>
        <Input
          id="salesPerson"
          value={salesPerson}
          onChange={(e) => setSalesPerson(e.target.value)}
          placeholder="Your name"
          required
        />
      </div>

      <div>
        <Label htmlFor="customNotes">Custom Notes</Label>
        <Textarea
          id="customNotes"
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
          placeholder="Add any notes for the proposal (optional)"
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full bg-[#ECB22D] text-[#010124] hover:bg-[#d4a029]" disabled={submitting}>
        {submitting ? "Submitting..." : "Propose Feature"}
      </Button>
    </form>
  )
}

interface FeatureUpdateFormProps {
  clientFeature: ClientFeature
  onSubmit: (updates: Partial<ClientFeature>) => void
}

function FeatureUpdateForm({ clientFeature, onSubmit }: FeatureUpdateFormProps) {
  const [status, setStatus] = useState(clientFeature.status)
  const [isEnabled, setIsEnabled] = useState(clientFeature.is_enabled)
  const [isFeatured, setIsFeatured] = useState(clientFeature.is_featured)
  const [customNotes, setCustomNotes] = useState(clientFeature.custom_notes || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      status,
      is_enabled: isEnabled,
      is_featured: isFeatured,
      custom_notes: customNotes,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="proposed">Proposed</SelectItem>
            <SelectItem value="interested">Interested</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="implementing">Implementing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Switch id="is_enabled" checked={isEnabled} onCheckedChange={setIsEnabled} />
          <Label htmlFor="is_enabled">Show in Client Portal</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="is_featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
          <Label htmlFor="is_featured">Featured</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="customNotes">Notes</Label>
        <Textarea
          id="customNotes"
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
          placeholder="Update notes about this feature for the client"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit">Update Feature</Button>
      </div>
    </form>
  )
}
