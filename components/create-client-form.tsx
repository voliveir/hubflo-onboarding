"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { checkSlugAvailability } from "@/lib/database"
import { Loader2, Check, X, Palette, Settings, Package, Calendar, Users, DollarSign } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { getImplementationManagers, ImplementationManager } from "@/lib/implementationManagers"

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
  const [managers, setManagers] = useState<ImplementationManager[]>([])

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
    implementation_manager: 'vanessa',
    calendar_contact_success: "",
    calendar_schedule_call: "",
    calendar_integrations_call: "",
    calendar_upgrade_consultation: "",
    onboarding_email_sent: false,
  })

  useEffect(() => {
    getImplementationManagers().then((data) => {
      setManagers(data)
      // Set initial calendar links to the first manager (default: vanessa)
      const defaultManager = data.find(m => m.manager_id === 'vanessa') || data[0]
      if (defaultManager) {
        setFormData((prev) => ({
          ...prev,
          implementation_manager: defaultManager.manager_id,
          calendar_contact_success: defaultManager.calendar_contact_success,
          calendar_schedule_call: defaultManager.calendar_schedule_call,
          calendar_integrations_call: defaultManager.calendar_integrations_call,
          calendar_upgrade_consultation: defaultManager.calendar_upgrade_consultation,
        }))
      }
    })
  }, [])

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

  const handleManagerChange = (managerId: string) => {
    setFormData((prev) => {
      const selected = managers.find(m => m.manager_id === managerId)
      return selected ? {
        ...prev,
        implementation_manager: selected.manager_id,
        calendar_contact_success: selected.calendar_contact_success,
        calendar_schedule_call: selected.calendar_schedule_call,
        calendar_integrations_call: selected.calendar_integrations_call,
        calendar_upgrade_consultation: selected.calendar_upgrade_consultation,
      } : prev
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Debug: Log the selected implementation manager
    console.log('Submitting implementation_manager:', formData.implementation_manager)

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

      // Call the API route instead of direct DB insert
      const response = await fetch("/api/create-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "b7f2e1c4-9a3d-4e8b-8c2a-7d5e6f1a2b3c", // Replace with your actual key if different
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create client");
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
    if (pkg === 'no_success') {
      return [
        'One onboarding call (CSM will reach out to schedule)',
        'No forms, SmartDocs, or integrations included',
        'Video tutorials',
        'Chat support',
      ];
    }
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
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[#F2C94C]" />
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>
          </div>
          <p className="text-sm text-slate-300">Essential client details and configuration</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Client Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter client name"
                required
                className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Client Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="client@company.com"
                className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
              />
              <p className="text-sm text-slate-400">Used for Zapier integrations and notifications</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-white">Portal URL Slug *</Label>
            <div className="relative">
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                placeholder="client-portal-url"
                required
                className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {slugChecking && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                {!slugChecking && slugAvailable === true && <Check className="h-4 w-4 text-green-400" />}
                {!slugChecking && slugAvailable === false && <X className="h-4 w-4 text-red-400" />}
              </div>
            </div>
            {formData.slug && (
              <p className="text-sm text-slate-400">
                Portal will be available at: <code className="bg-slate-800 px-2 py-1 rounded text-slate-200">/client/{formData.slug}</code>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of the client"
              rows={3}
              className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-white">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger className="bg-[#0a0b1a] border-slate-600 text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0b1a] border-slate-600">
                  <SelectItem value="draft" className="text-white hover:bg-slate-700">Draft</SelectItem>
                  <SelectItem value="active" className="text-white hover:bg-slate-700">Active</SelectItem>
                  <SelectItem value="completed" className="text-white hover:bg-slate-700">Completed</SelectItem>
                  <SelectItem value="archived" className="text-white hover:bg-slate-700">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="number_of_users" className="text-white">Number of Users</Label>
              <Input
                id="number_of_users"
                type="number"
                min="1"
                value={formData.number_of_users}
                onChange={(e) => handleInputChange("number_of_users", Number.parseInt(e.target.value) || 1)}
                className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue_amount" className="text-white">Revenue Amount ($)</Label>
              <Input
                id="revenue_amount"
                type="number"
                min="0"
                value={formData.revenue_amount}
                onChange={(e) => handleInputChange("revenue_amount", Number.parseInt(e.target.value) || 0)}
                className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
              />
            </div>
          </div>
        </div>

        {/* Implementation Manager & Calendar Links */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#F2C94C]" />
            <h3 className="text-lg font-semibold text-white">Implementation Manager & Calendar Links</h3>
          </div>
          <p className="text-sm text-slate-300">Assign implementation manager and configure calendar links</p>
          
          <div className="space-y-2">
            <Label htmlFor="implementation_manager" className="text-white">Implementation Manager</Label>
            <select
              name="implementation_manager"
              id="implementation_manager"
              value={formData.implementation_manager}
              onChange={e => handleManagerChange(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#0a0b1a] border border-slate-600 rounded-md text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
            >
              {managers.map((manager) => (
                <option key={manager.manager_id} value={manager.manager_id} className="bg-[#0a0b1a] text-white">
                  {manager.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="calendar_contact_success" className="text-white">Contact Success Calendar Link</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="calendar_contact_success"
                  value={formData.calendar_contact_success}
                  onChange={e => setFormData(prev => ({ ...prev, calendar_contact_success: e.target.value }))}
                  placeholder="Contact Success Calendar Link"
                  className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFormData(prev => ({ ...prev, calendar_contact_success: managers.find(m => m.manager_id === formData.implementation_manager)?.calendar_contact_success || "" }))}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calendar_schedule_call" className="text-white">Schedule Call Calendar Link</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="calendar_schedule_call"
                  value={formData.calendar_schedule_call}
                  onChange={e => setFormData(prev => ({ ...prev, calendar_schedule_call: e.target.value }))}
                  placeholder="Schedule Call Calendar Link"
                  className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFormData(prev => ({ ...prev, calendar_schedule_call: managers.find(m => m.manager_id === formData.implementation_manager)?.calendar_schedule_call || "" }))}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calendar_integrations_call" className="text-white">Integrations Call Calendar Link</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="calendar_integrations_call"
                  value={formData.calendar_integrations_call}
                  onChange={e => setFormData(prev => ({ ...prev, calendar_integrations_call: e.target.value }))}
                  placeholder="Integrations Call Calendar Link"
                  className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFormData(prev => ({ ...prev, calendar_integrations_call: managers.find(m => m.manager_id === formData.implementation_manager)?.calendar_integrations_call || "" }))}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calendar_upgrade_consultation" className="text-white">Upgrade Consultation Calendar Link</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="calendar_upgrade_consultation"
                  value={formData.calendar_upgrade_consultation || ''}
                  onChange={e => setFormData(prev => ({ ...prev, calendar_upgrade_consultation: e.target.value }))}
                  placeholder="Upgrade Consultation Calendar Link"
                  className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFormData(prev => ({ ...prev, calendar_upgrade_consultation: managers.find(m => m.manager_id === formData.implementation_manager)?.calendar_upgrade_consultation || "" }))}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Package Selection */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[#F2C94C]" />
            <h3 className="text-lg font-semibold text-white">Success Package</h3>
          </div>
          <p className="text-sm text-slate-300">Choose the appropriate success package for this client</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {["light", "premium", "gold", "elite", "no_success"].map((pkg) => (
              <div
                key={pkg}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  formData.success_package === pkg
                    ? "border-[#F2C94C] bg-[#F2C94C]/10 ring-2 ring-[#F2C94C]/20"
                    : "border-slate-600 hover:border-slate-500 bg-[#0a0b1a]"
                }`}
                onClick={() => handleInputChange("success_package", pkg)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold capitalize text-white">{pkg === 'no_success' ? 'No Success Package' : pkg}</h3>
                  <input
                    type="radio"
                    name="success_package"
                    value={pkg}
                    checked={formData.success_package === pkg}
                    onChange={() => handleInputChange("success_package", pkg)}
                    className="text-[#F2C94C]"
                  />
                </div>
                <div className="space-y-1">
                  {getPackageFeatures(pkg).map((feature, index) => (
                    <div key={index} className="text-sm text-slate-300 flex items-start">
                      <Check className="h-3 w-3 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Onboarding Email Sent toggle for No Success Package */}
          {formData.success_package === 'no_success' && (
            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="onboarding_email_sent"
                checked={formData.onboarding_email_sent}
                onCheckedChange={(checked) => handleInputChange("onboarding_email_sent", checked)}
                className="text-[#F2C94C] border-slate-600"
              />
              <Label htmlFor="onboarding_email_sent" className="text-white">Onboarding Email Sent by CSM</Label>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="plan_type" className="text-white">Plan Type</Label>
              <Select value={formData.plan_type} onValueChange={(value) => handleInputChange("plan_type", value)}>
                <SelectTrigger className="bg-[#0a0b1a] border-slate-600 text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0b1a] border-slate-600">
                  <SelectItem value="pro" className="text-white hover:bg-slate-700">Pro</SelectItem>
                  <SelectItem value="business" className="text-white hover:bg-slate-700">Business</SelectItem>
                  <SelectItem value="unlimited" className="text-white hover:bg-slate-700">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_type" className="text-white">Billing Type</Label>
              <Select value={formData.billing_type} onValueChange={(value) => handleInputChange("billing_type", value)}>
                <SelectTrigger className="bg-[#0a0b1a] border-slate-600 text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0b1a] border-slate-600">
                  <SelectItem value="monthly" className="text-white hover:bg-slate-700">Monthly</SelectItem>
                  <SelectItem value="quarterly" className="text-white hover:bg-slate-700">Quarterly</SelectItem>
                  <SelectItem value="annually" className="text-white hover:bg-slate-700">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom_app" className="text-white">Custom App</Label>
              <Select value={formData.custom_app} onValueChange={(value) => handleInputChange("custom_app", value)}>
                <SelectTrigger className="bg-[#0a0b1a] border-slate-600 text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0b1a] border-slate-600">
                  <SelectItem value="gray_label" className="text-white hover:bg-slate-700">Gray Label</SelectItem>
                  <SelectItem value="white_label" className="text-white hover:bg-slate-700">White Label</SelectItem>
                  <SelectItem value="not_applicable" className="text-white hover:bg-slate-700">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-[#F2C94C]" />
            <h3 className="text-lg font-semibold text-white">Branding & Customization</h3>
          </div>
          <p className="text-sm text-slate-300">Customize the look and feel of the client portal</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="logo_url" className="text-white">Logo URL</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => handleInputChange("logo_url", e.target.value)}
                placeholder="https://example.com/logo.png"
                className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_color" className="text-white">Primary Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => handleInputChange("primary_color", e.target.value)}
                  className="w-16 h-10 p-1 border border-slate-600 rounded bg-[#0a0b1a]"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => handleInputChange("primary_color", e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1 bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_domain" className="text-white">Custom Domain</Label>
            <Input
              id="custom_domain"
              value={formData.custom_domain}
              onChange={(e) => handleInputChange("custom_domain", e.target.value)}
              placeholder="portal.clientdomain.com"
              className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
            />
          </div>
        </div>

        {/* Features */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#F2C94C]" />
            <h3 className="text-lg font-semibold text-white">Features & Integrations</h3>
          </div>
          <p className="text-sm text-slate-300">Configure available features for this client</p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="projects_enabled"
                checked={formData.projects_enabled}
                onCheckedChange={(checked) => handleInputChange("projects_enabled", checked)}
                className="text-[#F2C94C] border-slate-600"
              />
              <Label htmlFor="projects_enabled" className="text-white">Enable Projects Module</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show_zapier_integrations"
                checked={formData.show_zapier_integrations}
                onCheckedChange={(checked) => handleInputChange("show_zapier_integrations", checked)}
                className="text-[#F2C94C] border-slate-600"
              />
              <Label htmlFor="show_zapier_integrations" className="text-white">Show Zapier Integrations</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="workflow_builder_enabled"
                checked={formData.workflow_builder_enabled}
                onCheckedChange={(checked) => handleInputChange("workflow_builder_enabled", checked)}
                className="text-[#F2C94C] border-slate-600"
              />
              <Label htmlFor="workflow_builder_enabled" className="text-white">Enable Workflow Builder</Label>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Switch
              id="feedback_board_enabled"
              checked={formData.feedback_board_enabled}
              onCheckedChange={checked => setFormData(f => ({ ...f, feedback_board_enabled: checked }))}
              className="data-[state=checked]:bg-[#F2C94C] data-[state=checked]:border-[#F2C94C]"
            />
            <label htmlFor="feedback_board_enabled" className="text-sm font-medium text-white">Show Feedback & Requests Board</label>
          </div>
        </div>

        {/* Implementation Tracking */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#F2C94C]" />
            <h3 className="text-lg font-semibold text-white">Implementation Tracking</h3>
          </div>
          <p className="text-sm text-slate-300">Set initial progress values (optional)</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="calls_scheduled" className="text-white">Calls Scheduled</Label>
              <Input
                id="calls_scheduled"
                type="number"
                min="0"
                value={formData.calls_scheduled}
                onChange={(e) => handleInputChange("calls_scheduled", Number.parseInt(e.target.value) || 0)}
                className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calls_completed" className="text-white">Calls Completed</Label>
              <Input
                id="calls_completed"
                type="number"
                min="0"
                value={formData.calls_completed}
                onChange={(e) => handleInputChange("calls_completed", Number.parseInt(e.target.value) || 0)}
                className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="forms_setup" className="text-white">Forms Setup</Label>
              <Input
                id="forms_setup"
                type="number"
                min="0"
                value={formData.forms_setup}
                onChange={(e) => handleInputChange("forms_setup", Number.parseInt(e.target.value) || 0)}
                className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smartdocs_setup" className="text-white">SmartDocs Setup</Label>
              <Input
                id="smartdocs_setup"
                type="number"
                min="0"
                value={formData.smartdocs_setup}
                onChange={(e) => handleInputChange("smartdocs_setup", Number.parseInt(e.target.value) || 0)}
                className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zapier_integrations_setup" className="text-white">Zapier Integrations</Label>
              <Input
                id="zapier_integrations_setup"
                type="number"
                min="0"
                value={formData.zapier_integrations_setup}
                onChange={(e) => handleInputChange("zapier_integrations_setup", Number.parseInt(e.target.value) || 0)}
                className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="migration_completed"
                checked={formData.migration_completed}
                onCheckedChange={(checked) => handleInputChange("migration_completed", checked)}
                className="text-[#F2C94C] border-slate-600"
              />
              <Label htmlFor="migration_completed" className="text-white">Migration Completed</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="slack_access_granted"
                checked={formData.slack_access_granted}
                onCheckedChange={(checked) => handleInputChange("slack_access_granted", checked)}
                className="text-[#F2C94C] border-slate-600"
              />
              <Label htmlFor="slack_access_granted" className="text-white">Slack Access Granted</Label>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#F2C94C]" />
            <h3 className="text-lg font-semibold text-white">Additional Notes</h3>
          </div>
          <p className="text-sm text-slate-300">Any additional information about this client</p>
          
          <Textarea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Add any notes about this client..."
            rows={4}
            className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="border border-red-500/30 bg-red-500/10 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-400">
              <X className="h-4 w-4" />
              <span className="font-medium">Error creating client:</span>
            </div>
            <p className="text-red-300 mt-1">{error}</p>
          </div>
        )}
      </form>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0b1a]/95 backdrop-blur-sm border-t border-slate-700 p-4 z-50">
        <div className="max-w-6xl mx-auto flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 rounded-full px-6"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || slugAvailable === false}
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[#F2C94C] via-[#F2994A] to-[#F2C94C] text-white font-semibold rounded-full px-6 hover:shadow-[#F2C94C]/25"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Client
          </Button>
        </div>
      </div>
    </div>
  )
}

export { CreateClientForm }
