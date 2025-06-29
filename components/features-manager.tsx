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
import { Plus, Edit, Trash2, Rocket, Code, Wrench, Star, DollarSign, Calendar } from "lucide-react"

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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-blue-500" />
                Features Management
              </CardTitle>
              <CardDescription>Manage upcoming features and upselling opportunities</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Feature</DialogTitle>
                  <DialogDescription>Add a new feature for upselling and client assignment</DialogDescription>
                </DialogHeader>
                <FeatureForm onSubmit={handleCreateFeature} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature) => (
              <div key={feature.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {getFeatureTypeIcon(feature.feature_type)}
                        <h3 className="font-medium">{feature.title}</h3>
                      </div>
                      <Badge className={getStatusBadgeColor(feature.status)}>{feature.status}</Badge>
                      <Badge variant="outline">{feature.category}</Badge>
                      {feature.pricing_amount && (
                        <Badge variant="outline" className="text-green-600">
                          <DollarSign className="h-3 w-3 mr-1" />${feature.pricing_amount}
                        </Badge>
                      )}
                      {feature.is_upsell_eligible && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          Upsell
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{feature.description}</p>

                    {/* Target Packages */}
                    {feature.target_packages && feature.target_packages.length > 0 && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-gray-500">Target Packages:</span>
                        {feature.target_packages.map((pkg) => (
                          <Badge key={pkg} variant="outline" className="text-xs">
                            {pkg}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Release Date */}
                    {(feature.release_date || feature.estimated_release_date) && (
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        {feature.release_date
                          ? `Released: ${new Date(feature.release_date).toLocaleDateString()}`
                          : `Est. Release: ${new Date(feature.estimated_release_date!).toLocaleDateString()}`}
                      </div>
                    )}

                    {/* Sales Notes */}
                    {feature.sales_notes && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">
                        <strong>Sales Notes:</strong> {feature.sales_notes}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingFeature(feature)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Feature</DialogTitle>
                          <DialogDescription>Update feature details</DialogDescription>
                        </DialogHeader>
                        <FeatureForm feature={feature} onSubmit={(data) => handleUpdateFeature(feature.id, data)} />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFeature(feature.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {features.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Rocket className="h-12 w-12 mx-auto mb-4 text-gray-300" />
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
          <Label htmlFor="title">Feature Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="feature_type">Type</Label>
          <Select
            value={formData.feature_type}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, feature_type: value }))}
          >
            <SelectTrigger>
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
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
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
          <Label htmlFor="pricing_tier">Pricing Tier</Label>
          <Select
            value={formData.pricing_tier}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, pricing_tier: value }))}
          >
            <SelectTrigger>
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
          <Label htmlFor="pricing_amount">Pricing Amount ($)</Label>
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
          <Label htmlFor="estimated_release_date">Estimated Release Date</Label>
          <Input
            id="estimated_release_date"
            type="date"
            value={formData.estimated_release_date}
            onChange={(e) => setFormData((prev) => ({ ...prev, estimated_release_date: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label>Target Packages</Label>
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
              <Label htmlFor={`pkg-${pkg}`} className="text-sm capitalize">
                {pkg}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="sales_notes">Sales Notes</Label>
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
          <Label htmlFor="is_active">Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="is_upsell_eligible"
            checked={formData.is_upsell_eligible}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_upsell_eligible: checked }))}
          />
          <Label htmlFor="is_upsell_eligible">Upsell Eligible</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit">{feature ? "Update Feature" : "Create Feature"}</Button>
      </div>
    </form>
  )
}
