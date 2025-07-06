"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { getAllFeatures, createFeature, updateFeature, deleteFeature } from "@/lib/database"
import type { Feature } from "@/lib/types"
import { Plus, Edit, Trash2, Rocket, Code, Wrench, Star, DollarSign, Calendar, GripVertical } from "lucide-react"

export function FeaturesManager() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null)

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      const data = await getAllFeatures()
      setFeatures(data)
    } catch (error) {
      console.error("Error fetching features:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFeature = async (featureData: Omit<Feature, "id" | "created_at" | "updated_at">) => {
    try {
      await createFeature(featureData)
      await fetchFeatures()
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Error creating feature:", error)
    }
  }

  const handleUpdateFeature = async (id: string, updates: Partial<Feature>) => {
    console.log('Updating feature with id:', id, 'and updates:', updates);
    try {
      await updateFeature(id, updates)
      await fetchFeatures()
      setEditingFeature(null)
    } catch (error) {
      console.error("Error updating feature:", error)
    }
  }

  const handleDeleteFeature = async (id: string) => {
    if (confirm("Are you sure you want to delete this feature?")) {
      try {
        await deleteFeature(id)
        await fetchFeatures()
      } catch (error) {
        console.error("Error deleting feature:", error)
      }
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "development":
        return "bg-yellow-100 text-yellow-800"
      case "beta":
        return "bg-blue-100 text-blue-800"
      case "released":
        return "bg-green-100 text-green-800"
      case "deprecated":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFeatureTypeIcon = (type: string) => {
    switch (type) {
      case "feature":
        return <Star className="h-4 w-4" />
      case "integration":
        return <Code className="h-4 w-4" />
      case "tool":
        return <Wrench className="h-4 w-4" />
      case "service":
        return <Rocket className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

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
              <CardTitle className="flex items-center gap-2 text-white">
                <Rocket className="h-5 w-5 text-blue-500" />
                Features Management
              </CardTitle>
              <CardDescription className="text-white/80">Manage upcoming features and upselling opportunities</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-white font-semibold rounded-full h-11 px-6 text-[18px] shadow-md hover:brightness-110 border border-[#F2C94C]/70 flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Feature
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-[#10122b] ring-1 ring-[#F2C94C]/30 rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Feature</DialogTitle>
                  <DialogDescription className="text-white/80">Add a new feature for upselling and client assignment</DialogDescription>
                </DialogHeader>
                <FeatureForm onSubmit={handleCreateFeature} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-6 mt-4">
            {features.map((feature) => (
              <div key={feature.id} className="group flex items-stretch bg-[#10122b]/90 ring-1 ring-[#F2C94C]/30 rounded-xl py-6 px-6 mb-2">
                <div className="flex items-center pr-4">
                  <GripVertical className="text-slate-500/60 w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      {getFeatureTypeIcon(feature.feature_type)}
                      <h3 className="font-semibold text-white text-[18px]">{feature.title}</h3>
                    </div>
                    {/* Status/label chips */}
                    {feature.status === 'beta' && <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-[11px] font-semibold" style={{ borderRadius: 12 }}>Beta</span>}
                    {feature.status === 'development' && <span className="bg-orange-400 text-white px-3 py-1 rounded-full text-[11px] font-semibold" style={{ borderRadius: 12 }}>Development</span>}
                    {feature.status === 'released' && <span className="bg-green-400 text-white px-3 py-1 rounded-full text-[11px] font-semibold" style={{ borderRadius: 12 }}>Released</span>}
                    {feature.is_upsell_eligible && <span className="bg-pink-400 text-white px-3 py-1 rounded-full text-[11px] font-semibold" style={{ borderRadius: 12 }}>Upsell</span>}
                  </div>
                  <p className="text-[15px] text-slate-200 mb-2">{feature.description}</p>
                  {/* Enabled package pills */}
                  {feature.target_packages && feature.target_packages.length > 0 && (
                    <div className="flex items-center space-x-2 mb-2">
                      {feature.target_packages.includes('light') && <span className="bg-green-400/20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold" style={{ borderRadius: 12 }}>Light</span>}
                      {feature.target_packages.includes('premium') && <span className="bg-blue-400/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold" style={{ borderRadius: 12 }}>Premium</span>}
                      {feature.target_packages.includes('gold') && <span className="bg-yellow-300/20 text-yellow-200 px-3 py-1 rounded-full text-xs font-semibold" style={{ borderRadius: 12 }}>Gold</span>}
                      {feature.target_packages.includes('elite') && <span className="bg-purple-400/20 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold" style={{ borderRadius: 12 }}>Elite</span>}
                    </div>
                  )}
                  {/* Release Date */}
                  {(feature.release_date || feature.estimated_release_date) && (
                    <div className="flex items-center text-xs text-white/60 mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      {feature.release_date
                        ? `Released: ${new Date(feature.release_date).toLocaleDateString()}`
                        : `Est. Release: ${new Date(feature.estimated_release_date!).toLocaleDateString()}`}
                    </div>
                  )}
                  {/* Sales Notes */}
                  {feature.sales_notes && (
                    <div className="text-xs text-pink-200 bg-pink-900/30 p-2 rounded mt-2">
                      <strong>Sales Notes:</strong> {feature.sales_notes}
                    </div>
                  )}
                </div>
                {/* Actions: hidden until row hover */}
                <div className="flex flex-col space-y-2 ml-4 justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-8 h-8 bg-[#181a2f] rounded-md flex items-center justify-center" onClick={() => setEditingFeature(feature)}>
                        <Edit className="h-5 w-5 text-[#F2C94C]" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-[#10122b] ring-1 ring-[#F2C94C]/30 rounded-3xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">Edit Feature</DialogTitle>
                        <DialogDescription className="text-white/80">Update feature details</DialogDescription>
                      </DialogHeader>
                      <FeatureForm feature={feature} onSubmit={(data) => handleUpdateFeature(feature.id, data)} />
                    </DialogContent>
                  </Dialog>
                  <Button className="w-8 h-8 bg-[#181a2f] rounded-md flex items-center justify-center" onClick={() => handleDeleteFeature(feature.id)}>
                    <Trash2 className="h-5 w-5 text-[#F2C94C]" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {features.length === 0 && (
            <div className="text-center py-8 text-white/60">
              <Rocket className="h-12 w-12 mx-auto mb-4 text-white/30" />
              <p>No features created yet. Click "Add Feature" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface FeatureFormProps {
  feature?: Feature
  onSubmit: (data: Omit<Feature, "id" | "created_at" | "updated_at">) => void
}

function FeatureForm({ feature, onSubmit }: FeatureFormProps) {
  const [formData, setFormData] = useState({
    title: feature?.title || "",
    description: feature?.description || "",
    category: feature?.category || "General",
    feature_type: feature?.feature_type || "feature",
    status: feature?.status || "development",
    pricing_tier: feature?.pricing_tier || "free",
    pricing_amount: feature?.pricing_amount || 0,
    target_packages: feature?.target_packages || [],
    sales_notes: feature?.sales_notes || "",
    implementation_notes: feature?.implementation_notes || "",
    is_active: feature?.is_active ?? true,
    is_upsell_eligible: feature?.is_upsell_eligible ?? true,
    estimated_release_date: feature?.estimated_release_date
      ? new Date(feature.estimated_release_date).toISOString().split("T")[0]
      : "",
    demo_url: feature?.demo_url || "",
    documentation_url: feature?.documentation_url || "",
    video_url: feature?.video_url || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      ...formData,
      pricing_amount: formData.pricing_amount || undefined,
      estimated_release_date: formData.estimated_release_date
        ? new Date(formData.estimated_release_date).toISOString()
        : undefined,
      tags: [],
      icon_name: "",
      icon_url: "",
      release_date: undefined,
    }

    onSubmit(submitData)
  }

  const handleTargetPackageChange = (pkg: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        target_packages: [...prev.target_packages, pkg],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        target_packages: prev.target_packages.filter((p) => p !== pkg),
      }))
    }
  }

  const availablePackages = ["light", "premium", "gold", "elite", "starter", "professional", "enterprise"]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title" className="text-white">Feature Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            required
            className="bg-[#181a2f] border border-slate-600 text-white placeholder-white/60"
          />
        </div>
        <div>
          <Label htmlFor="category" className="text-white">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-white">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="bg-[#181a2f] border border-slate-600 text-white placeholder-white/60"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="feature_type" className="text-white">Type</Label>
          <Select
            value={formData.feature_type}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, feature_type: value as 'feature' | 'integration' | 'tool' | 'service' }))}
          >
            <SelectTrigger className="text-white bg-[#181a2f] border border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="integration">Integration</SelectItem>
              <SelectItem value="tool">Tool</SelectItem>
              <SelectItem value="service">Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status" className="text-white">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as 'development' | 'beta' | 'released' | 'deprecated' }))}
          >
            <SelectTrigger className="text-white bg-[#181a2f] border border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="beta">Beta</SelectItem>
              <SelectItem value="released">Released</SelectItem>
              <SelectItem value="deprecated">Deprecated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="pricing_tier" className="text-white">Pricing Tier</Label>
          <Select
            value={formData.pricing_tier}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, pricing_tier: value as 'free' | 'premium' | 'enterprise' | 'addon' }))}
          >
            <SelectTrigger className="text-white bg-[#181a2f] border border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
              <SelectItem value="addon">Add-on</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pricing_amount" className="text-white">Pricing Amount ($)</Label>
          <Input
            id="pricing_amount"
            type="number"
            step="0.01"
            value={formData.pricing_amount}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, pricing_amount: Number.parseFloat(e.target.value) || 0 }))
            }
          />
        </div>
        <div>
          <Label htmlFor="estimated_release_date" className="text-white">Estimated Release Date</Label>
          <Input
            id="estimated_release_date"
            type="date"
            value={formData.estimated_release_date}
            onChange={(e) => setFormData((prev) => ({ ...prev, estimated_release_date: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label className="text-white">Target Packages</Label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {availablePackages.map((pkg) => (
            <div key={pkg} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`pkg-${pkg}`}
                checked={formData.target_packages.includes(pkg)}
                onChange={(e) => handleTargetPackageChange(pkg, e.target.checked)}
                className="rounded"
              />
              <label key={pkg} className="flex items-center space-x-2 text-sm font-medium text-white">
                {pkg}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="sales_notes" className="text-white">Sales Notes</Label>
        <Textarea
          id="sales_notes"
          value={formData.sales_notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, sales_notes: e.target.value }))}
          placeholder="Notes for sales team about when to propose this feature"
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="is_active" className="text-white">Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="is_upsell_eligible"
            checked={formData.is_upsell_eligible}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_upsell_eligible: checked }))}
          />
          <Label htmlFor="is_upsell_eligible" className="text-white">Upsell Eligible</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit">{feature ? "Update Feature" : "Create Feature"}</Button>
      </div>
    </form>
  )
}
