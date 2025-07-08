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

  // Pill color helpers
  const getStatusPill = (status: string) => {
    switch (status) {
      case "completed": return "bg-[#10B981]/20 text-[#10B981]"
      case "interested": return "bg-[#FACC15]/20 text-[#FACC15]"
      default: return "bg-slate-700/60 text-slate-200"
    }
  }
  const getCategoryPill = () => "bg-slate-800 text-slate-400"
  const getUpsellPill = () => "bg-gradient-to-r from-[#F2C94C] via-[#F2994A] to-[#F2C94C] text-white"
  const getPricePill = () => "bg-emerald-500/20 text-emerald-200"

  // Filter available features to exclude already assigned ones
  const unassignedFeatures = availableFeatures.filter(
    (feature) => !clientFeatures.some((cf) => cf.feature_id === feature.id),
  )

  return (
    <div className="space-y-8">
      {/* Main Panel with radial fade */}
      <div className="rounded-lg border border-[#e7b86833] p-8 relative" style={{ background: 'radial-gradient(ellipse at 60% 0%, #02051b 60%, #090c25 100%)' }}>
        {clientFeatures.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No features proposed or assigned yet.</div>
        ) : (
          <div className="flex flex-col gap-6">
            {clientFeatures.map((clientFeature) => {
              const feature = clientFeature.feature
              if (!feature) return null
              return (
                <div
                  key={clientFeature.id}
                  className="flex items-start justify-between rounded-lg border border-[#e7b86833] bg-[#02051b] p-6 transition-all duration-150 hover:shadow-[0_4px_24px_0_rgba(231,184,104,0.18)] hover:-translate-y-1"
                >
                  {/* Left block */}
                  <div className="w-7/10 min-w-0 pr-6">
                    <div className="text-lg font-bold text-white mb-1 truncate">{feature.title}</div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${getStatusPill(clientFeature.status)}`}>{clientFeature.status}</span>
                      {feature.category && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${getCategoryPill()}`}>{feature.category}</span>
                      )}
                      {feature.pricing_amount && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${getPricePill()}`}><DollarSign className="h-3 w-3 mr-1" />${feature.pricing_amount}</span>
                      )}
                      {feature.is_upsell_eligible && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${getUpsellPill()}`}>Upsell</span>
                      )}
                    </div>
                    <p className="text-slate-300 line-clamp-2 mb-2">{feature.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                      <span>Proposed {new Date(clientFeature.proposed_date).toLocaleDateString()}</span>
                      {clientFeature.sales_person && <span>• By {clientFeature.sales_person}</span>}
                    </div>
                  </div>
                  {/* Right block: controls */}
                  <div className="flex flex-col items-end gap-2 min-w-[120px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Switch
                        id={`enabled-${clientFeature.id}`}
                        checked={clientFeature.is_enabled}
                        onCheckedChange={async (checked) => handleUpdateFeature(clientFeature.id, { is_enabled: checked })}
                        className="data-[state=checked]:bg-[#F2C94C] data-[state=checked]:border-[#F2C94C]"
                      />
                      <span className="text-xs text-slate-300">Enabled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClientFeature(clientFeature.id)}
                        className="rounded-full border border-red-500 text-red-400 hover:bg-red-900/20 flex items-center gap-2 px-4 py-1 h-8"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                      <Dialog open={editingFeature?.id === clientFeature.id} onOpenChange={(open) => setEditingFeature(open ? clientFeature : null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border border-blue-500 text-blue-400 hover:bg-blue-900/20 flex items-center gap-2 px-4 py-1 h-8"
                          >
                            <Edit className="h-4 w-4" /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-[#10122b] border border-[#F2C94C]/30">
                          <DialogHeader>
                            <DialogTitle className="text-white">Edit Feature for {client?.name}</DialogTitle>
                          </DialogHeader>
                          <FeatureUpdateForm
                            clientFeature={clientFeature}
                            onSubmit={async (updates) => {
                              await handleUpdateFeature(clientFeature.id, updates)
                              setEditingFeature(null)
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              )
            })}
            {/* Propose Feature Button (bottom-right, gold gradient pill) */}
            <div className="flex justify-end mt-8">
              <Dialog open={isProposalDialogOpen} onOpenChange={setIsProposalDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-[#F2C94C] via-[#F2994A] to-[#F2C94C] text-white font-semibold rounded-full px-6 py-2 shadow-md hover:shadow-gold-400/40 transition-all duration-150">
                    <Plus className="h-4 w-4 mr-2" /> Propose Feature
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-[#10122b] border border-[#F2C94C]/30">
                  <DialogHeader>
                    <DialogTitle className="text-white">Propose Feature to Client</DialogTitle>
                    <DialogDescription className="text-white/80">Select a feature to propose to {client?.name}</DialogDescription>
                  </DialogHeader>
                  {unassignedFeatures.length > 0 ? (
                    <FeatureProposalForm
                      availableFeatures={unassignedFeatures}
                      clientPackage={client?.success_package || ""}
                      onSubmit={handleProposeFeature}
                      client={client}
                    />
                  ) : (
                    <div className="text-slate-400 py-8 text-center">No features available to propose. Please add features in the Features section.</div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
        {/* Always show Propose Feature button if no features at all */}
        {clientFeatures.length === 0 && (
          <div className="flex justify-end mt-8">
            <Dialog open={isProposalDialogOpen} onOpenChange={setIsProposalDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#F2C94C] via-[#F2994A] to-[#F2C94C] text-white font-semibold rounded-full px-6 py-2 shadow-md hover:shadow-gold-400/40 transition-all duration-150">
                  <Plus className="h-4 w-4 mr-2" /> Propose Feature
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-[#10122b] border border-[#F2C94C]/30">
                <DialogHeader>
                  <DialogTitle className="text-white">Propose Feature to Client</DialogTitle>
                  <DialogDescription className="text-white/80">Select a feature to propose to {client?.name}</DialogDescription>
                </DialogHeader>
                {unassignedFeatures.length > 0 ? (
                  <FeatureProposalForm
                    availableFeatures={unassignedFeatures}
                    clientPackage={client?.success_package || ""}
                    onSubmit={handleProposeFeature}
                    client={client}
                  />
                ) : (
                  <div className="text-slate-400 py-8 text-center">No features available to propose. Please add features in the Features section.</div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
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
  const [status, setStatus] = useState("proposed")
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
            status,
          }),
        })
        const data = await res.json()
        if (data.success) {
          setSelectedFeatureId("")
          setSalesPerson("")
          setCustomNotes("")
          setStatus("proposed")
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
        <Label htmlFor="feature" className="text-white">Select Feature</Label>
        <Select value={selectedFeatureId} onValueChange={setSelectedFeatureId} required>
          <SelectTrigger className="text-white bg-[#181a2f] border border-slate-700 rounded-lg focus:ring-2 focus:ring-[#F2C94C]">
            <SelectValue placeholder="Choose a feature to propose" className="text-white placeholder-white/60" />
          </SelectTrigger>
          <SelectContent className="bg-[#181a2f] text-white">
            {relevantFeatures.map((feature) => (
              <SelectItem key={feature.id} value={feature.id} className="text-white">
                <div className="flex items-center justify-between w-full">
                  <span>{feature.title}</span>
                  {feature.pricing_amount && <span className="text-emerald-300 ml-2">${feature.pricing_amount}</span>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {relevantFeatures.length === 0 && (
          <p className="text-sm text-slate-400 mt-1">No features available for the {clientPackage} package.</p>
        )}
      </div>

      <div>
        <Label htmlFor="status" className="text-white">Status</Label>
        <Select value={status} onValueChange={setStatus} required>
          <SelectTrigger className="text-white bg-[#181a2f] border border-slate-700 rounded-lg focus:ring-2 focus:ring-[#F2C94C]">
            <SelectValue placeholder="Select status" className="text-white placeholder-white/60" />
          </SelectTrigger>
          <SelectContent className="bg-[#181a2f] text-white">
            <SelectItem value="proposed" className="text-white">Proposed</SelectItem>
            <SelectItem value="interested" className="text-white">Interested</SelectItem>
            <SelectItem value="approved" className="text-white">Approved</SelectItem>
            <SelectItem value="implementing" className="text-white">Implementing</SelectItem>
            <SelectItem value="completed" className="text-white">Completed</SelectItem>
            <SelectItem value="declined" className="text-white">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="salesPerson" className="text-white">Sales Person</Label>
        <Input
          id="salesPerson"
          value={salesPerson}
          onChange={(e) => setSalesPerson(e.target.value)}
          placeholder="Your name"
          required
          className="text-white placeholder-white/60 bg-[#181a2f] border border-slate-700 rounded-lg focus:ring-2 focus:ring-[#F2C94C]"
        />
      </div>

      <div>
        <Label htmlFor="customNotes" className="text-white">Custom Notes</Label>
        <Textarea
          id="customNotes"
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
          placeholder="Add any notes for the proposal (optional)"
          rows={2}
          className="text-white placeholder-white/60 bg-[#181a2f] border border-slate-700 rounded-lg focus:ring-2 focus:ring-[#F2C94C]"
        />
      </div>

      <Button type="submit" className="w-full bg-gradient-to-r from-[#F2C94C] via-[#F2994A] to-[#F2C94C] text-[#010124] font-semibold rounded-lg hover:brightness-110 h-12" disabled={submitting}>
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
        <Label htmlFor="status" className="text-white">Status</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
          <SelectTrigger className="text-white bg-[#181a2f] border border-slate-700 rounded-lg focus:ring-2 focus:ring-[#F2C94C]">
            <SelectValue className="text-white placeholder-white/60" />
          </SelectTrigger>
          <SelectContent className="bg-[#181a2f] text-white">
            <SelectItem value="proposed" className="text-white">Proposed</SelectItem>
            <SelectItem value="interested" className="text-white">Interested</SelectItem>
            <SelectItem value="approved" className="text-white">Approved</SelectItem>
            <SelectItem value="implementing" className="text-white">Implementing</SelectItem>
            <SelectItem value="completed" className="text-white">Completed</SelectItem>
            <SelectItem value="declined" className="text-white">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Switch id="is_enabled" checked={isEnabled} onCheckedChange={setIsEnabled} />
          <Label htmlFor="is_enabled" className="text-white">Show in Client Portal</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="is_featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
          <Label htmlFor="is_featured" className="text-white">Featured</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="customNotes" className="text-white">Notes</Label>
        <Textarea
          id="customNotes"
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
          placeholder="Update notes about this feature for the client"
          rows={3}
          className="text-white placeholder-white/60 bg-[#181a2f] border border-slate-700 rounded-lg focus:ring-2 focus:ring-[#F2C94C]"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" className="bg-gradient-to-r from-[#F2C94C] via-[#F2994A] to-[#F2C94C] text-[#010124] font-semibold rounded-lg hover:brightness-110 h-12">Update Feature</Button>
      </div>
    </form>
  )
}
