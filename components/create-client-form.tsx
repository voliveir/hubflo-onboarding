"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient, checkSlugAvailability } from "@/lib/database"
import { Loader2, Check, X, Palette, Settings, Package } from "lucide-react"
import { Switch } from "@/components/ui/switch"

// Helper function to extract error message from various error types
const extractErrorMessage = (error: any): string => {
  // Handle null/undefined
  if (!error) return "An unknown error occurred"

  // Handle string errors
  if (typeof error === "string") return error

  // Handle Error instances
  if (error instanceof Error) return error.message

  // Handle Supabase error objects with code, details, hint, message
  if (typeof error === "object") {
    // Try to extract a meaningful message in order of preference
    if (error.message && typeof error.message === "string") {
      return error.message
    }
    if (error.details && typeof error.details === "string") {
      return error.details
    }
    if (error.hint && typeof error.hint === "string") {
      return error.hint
    }
    if (error.code && typeof error.code === "string") {
      return `Error ${error.code}: ${error.message || "Unknown database error"}`
    }

    // If it's an object but we can't extract a message, provide a generic one
    return "A database error occurred. Please try again."
  }

  // Fallback for any other type
  return String(error)
}

export default function CreateClientForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    email: "",
    description: "",
    success_package: "premium",
    plan_type: "pro",
    billing_type: "monthly",
    number_of_users: 1,
    revenue_amount: 0,
    custom_app: "not_applicable",
    status: "draft",
    // Branding
    logo_url: "",
    primary_color: "#3B82F6",
    custom_domain: "",
    // Features
    projects_enabled: false,
    show_zapier_integrations: true,
    // Tracking
    calls_scheduled: 0,
    calls_completed: 0,
    forms_setup: 0,
    smartdocs_setup: 0,
    zapier_integrations_setup: 0,
    migration_completed: false,
    slack_access_granted: false,
    notes: "",
    workflow_builder_enabled: false,
    feedback_board_enabled: false,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Auto-generate slug from name
    if (field === "name" && value) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
      setFormData((prev) => ({ ...prev, slug: generatedSlug }))
      checkSlug(generatedSlug)
    }

    // Check slug availability when manually changed
    if (field === "slug") {
      checkSlug(value)
    }
  }

  const checkSlug = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null)
      return
    }

    setSlugChecking(true)
    try {
      const available = await checkSlugAvailability(slug)
      setSlugAvailable(available)
    } catch (error) {
      console.error("Error checking slug:", error)
      setSlugAvailable(null)
    } finally {
      setSlugChecking(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Client name is required")
      }
      if (!formData.slug.trim()) {
        throw new Error("Slug is required")
      }
      if (slugAvailable === false) {
        throw new Error("Slug is not available")
      }

      // Create the client
      const result = await createClient(formData)

      // Check if result is an error object (Supabase errors have code, details, hint, message)
      if (result && typeof result === "object" && ("code" in result || "message" in result || "error" in result)) {
        const errorMessage = extractErrorMessage(result)
        throw new Error(errorMessage)
      }

      // Success - redirect after a short delay
      setTimeout(() => {
        router.push("/admin/clients")
      }, 100)
    } catch (error) {
      console.error("Error creating client:", error)
      const errorMessage = extractErrorMessage(error)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getPackageFeatures = (pkg: string) => {
    const features = {
      light: ["One Zoom call with a product specialist", "Video tutorials", "Chat support"],
      premium: [
        "2 Zoom calls with a product specialist",
        "Workflow mapping & workspace structuring",
        "Setup of a basic Zapier integration",
        "Help setting up workspace templates",
        "Up to 2 forms and/or SmartDocs setup",
        "Priority support during onboarding",
      ],
      gold: [
        "Includes everything in Premium, plus:",
        "Up to 3 Zoom calls with a product specialist",
        "Advanced Zapier integrations & workflows",
        "Up to 4 forms and/or SmartDocs setup",
        "Direct access to your account manager via Slack",
      ],
      elite: [
        "Includes everything in Gold, plus:",
        "Unlimited Onboarding Calls",
        "Unlimited Forms",
        "Unlimited SmartDocs",
        "Unlimited integrations",
        "Migration assistance (contacts, workspaces, clients)",
        "Custom integration setup (via API or partner tools)",
        "Full onboarding project managed by our team",
      ],
    }
    return features[pkg as keyof typeof features] || features.premium
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
          <CardDescription>Essential client details and configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter client name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Client Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="client@company.com"
              />
              <p className="text-sm text-gray-500">Used for Zapier integrations and notifications</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Portal URL Slug *</Label>
            <div className="relative">
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                placeholder="client-portal-url"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {slugChecking && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                {!slugChecking && slugAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                {!slugChecking && slugAvailable === false && <X className="h-4 w-4 text-red-500" />}
              </div>
            </div>
            {formData.slug && (
              <p className="text-sm text-gray-500">
                Portal will be available at: <code>/client/{formData.slug}</code>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of the client"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="number_of_users">Number of Users</Label>
              <Input
                id="number_of_users"
                type="number"
                min="1"
                value={formData.number_of_users}
                onChange={(e) => handleInputChange("number_of_users", Number.parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue_amount">Revenue Amount ($)</Label>
              <Input
                id="revenue_amount"
                type="number"
                min="0"
                value={formData.revenue_amount}
                onChange={(e) => handleInputChange("revenue_amount", Number.parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Success Package</span>
          </CardTitle>
          <CardDescription>Choose the appropriate success package for this client</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["light", "premium", "gold", "elite"].map((pkg) => (
              <div
                key={pkg}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  formData.success_package === pkg
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleInputChange("success_package", pkg)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold capitalize">{pkg}</h3>
                  <input
                    type="radio"
                    name="success_package"
                    value={pkg}
                    checked={formData.success_package === pkg}
                    onChange={() => handleInputChange("success_package", pkg)}
                    className="text-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  {getPackageFeatures(pkg).map((feature, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-start">
                      <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="plan_type">Plan Type</Label>
              <Select value={formData.plan_type} onValueChange={(value) => handleInputChange("plan_type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_type">Billing Type</Label>
              <Select value={formData.billing_type} onValueChange={(value) => handleInputChange("billing_type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom_app">Custom App</Label>
              <Select value={formData.custom_app} onValueChange={(value) => handleInputChange("custom_app", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gray_label">Gray Label</SelectItem>
                  <SelectItem value="white_label">White Label</SelectItem>
                  <SelectItem value="not_applicable">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Branding & Customization</span>
          </CardTitle>
          <CardDescription>Customize the look and feel of the client portal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => handleInputChange("logo_url", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => handleInputChange("primary_color", e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => handleInputChange("primary_color", e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_domain">Custom Domain</Label>
            <Input
              id="custom_domain"
              value={formData.custom_domain}
              onChange={(e) => handleInputChange("custom_domain", e.target.value)}
              placeholder="portal.clientdomain.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Features & Integrations</span>
          </CardTitle>
          <CardDescription>Configure available features for this client</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="projects_enabled"
                checked={formData.projects_enabled}
                onCheckedChange={(checked) => handleInputChange("projects_enabled", checked)}
              />
              <Label htmlFor="projects_enabled">Enable Projects Module</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show_zapier_integrations"
                checked={formData.show_zapier_integrations}
                onCheckedChange={(checked) => handleInputChange("show_zapier_integrations", checked)}
              />
              <Label htmlFor="show_zapier_integrations">Show Zapier Integrations</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="workflow_builder_enabled"
                checked={formData.workflow_builder_enabled}
                onCheckedChange={(checked) => handleInputChange("workflow_builder_enabled", checked)}
              />
              <Label htmlFor="workflow_builder_enabled">Enable Workflow Builder</Label>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Switch
              id="feedback_board_enabled"
              checked={formData.feedback_board_enabled}
              onCheckedChange={checked => setFormData(f => ({ ...f, feedback_board_enabled: checked }))}
            />
            <label htmlFor="feedback_board_enabled" className="text-sm font-medium">Show Feedback & Requests Board</label>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Tracking</CardTitle>
          <CardDescription>Set initial progress values (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="calls_scheduled">Calls Scheduled</Label>
              <Input
                id="calls_scheduled"
                type="number"
                min="0"
                value={formData.calls_scheduled}
                onChange={(e) => handleInputChange("calls_scheduled", Number.parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calls_completed">Calls Completed</Label>
              <Input
                id="calls_completed"
                type="number"
                min="0"
                value={formData.calls_completed}
                onChange={(e) => handleInputChange("calls_completed", Number.parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="forms_setup">Forms Setup</Label>
              <Input
                id="forms_setup"
                type="number"
                min="0"
                value={formData.forms_setup}
                onChange={(e) => handleInputChange("forms_setup", Number.parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smartdocs_setup">SmartDocs Setup</Label>
              <Input
                id="smartdocs_setup"
                type="number"
                min="0"
                value={formData.smartdocs_setup}
                onChange={(e) => handleInputChange("smartdocs_setup", Number.parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zapier_integrations_setup">Zapier Integrations</Label>
              <Input
                id="zapier_integrations_setup"
                type="number"
                min="0"
                value={formData.zapier_integrations_setup}
                onChange={(e) => handleInputChange("zapier_integrations_setup", Number.parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="migration_completed"
                checked={formData.migration_completed}
                onCheckedChange={(checked) => handleInputChange("migration_completed", checked)}
              />
              <Label htmlFor="migration_completed">Migration Completed</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="slack_access_granted"
                checked={formData.slack_access_granted}
                onCheckedChange={(checked) => handleInputChange("slack_access_granted", checked)}
              />
              <Label htmlFor="slack_access_granted">Slack Access Granted</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>Any additional information about this client</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Add any notes about this client..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <X className="h-4 w-4" />
              <span className="font-medium">Error creating client:</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || slugAvailable === false}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Create Client
        </Button>
      </div>
    </form>
  )
}

export { CreateClientForm }
