"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { updateClient, isSlugAvailable, getTaskCompletions, updateTaskCompletion } from "@/lib/database"
import { type Client } from "@/lib/types"
import { Save, ArrowLeft, CheckCircle, XCircle, Loader2, AlertCircle, Package, Settings, Calendar, Users, Palette, DollarSign } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { getImplementationManagers, ImplementationManager } from "@/lib/implementationManagers"

// --- Admin Onboarding Task Checklist Component ---
interface OnboardingTaskAdminChecklistProps {
  clientId: string
  projectsEnabled: boolean
}

function OnboardingTaskAdminChecklist({ clientId, projectsEnabled }: OnboardingTaskAdminChecklistProps) {
  const [loading, setLoading] = useState(true)
  const [completions, setCompletions] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const TASKS = [
    { key: "basics", label: "Setup Basics & Foundations" },
    ...(projectsEnabled ? [{ key: "project_board", label: "Setup Your Project Board" }] : []),
    { key: "workspace_templates", label: "Setup Workspace Template(s)" },
  ]

  useEffect(() => {
    async function fetchCompletions() {
      setLoading(true)
      setError(null)
      try {
        const data = await getTaskCompletions(clientId)
        setCompletions(data)
      } catch (e) {
        setError("Failed to load onboarding task completions.")
      } finally {
        setLoading(false)
      }
    }
    if (clientId) fetchCompletions()
  }, [clientId, projectsEnabled])

  const handleToggle = async (taskKey: string, checked: boolean) => {
    setSaving(taskKey)
    try {
      await updateTaskCompletion(clientId, taskKey, checked)
      setCompletions((prev) => ({ ...prev, [taskKey]: checked }))
      toast({ title: "Success", description: `Marked '${TASKS.find(t => t.key === taskKey)?.label}' as ${checked ? "complete" : "incomplete"}.` })
    } catch (e) {
      toast({ title: "Error", description: `Failed to update task: ${TASKS.find(t => t.key === taskKey)?.label}`, variant: "destructive" })
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <div className="text-sm text-slate-400">Loading onboarding tasks...</div>
  if (error) return <div className="text-sm text-red-400">{error}</div>

  return (
    <div className="space-y-4">
      {TASKS.map((task) => (
        <div key={task.key} className="flex items-center gap-3">
          <Checkbox
            checked={!!completions[task.key]}
            onCheckedChange={(checked) => handleToggle(task.key, !!checked)}
            disabled={saving === task.key}
            id={`onboarding-task-${task.key}`}
            className="text-[#F2C94C] border-slate-600"
          />
          <label htmlFor={`onboarding-task-${task.key}`} className={`text-base ${completions[task.key] ? "line-through text-slate-500" : "text-white"}`}>
            {task.label}
          </label>
          {saving === task.key && <span className="text-xs text-slate-400 ml-2">Saving...</span>}
        </div>
      ))}
    </div>
  )
}

interface EditClientFormProps {
  client: Client
  onSuccess?: () => void
  onCancel?: () => void
}

export function EditClientForm({ client, onSuccess, onCancel }: EditClientFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<Client>>({
    name: client.name,
    slug: client.slug,
    success_package: client.success_package,
    billing_type: client.billing_type,
    number_of_users: client.number_of_users,
    logo_url: client.logo_url,
    welcome_message: client.welcome_message,
    video_url: client.video_url,
    show_zapier_integrations: client.show_zapier_integrations,
    projects_enabled: client.projects_enabled,
    status: client.status,
    custom_app: client.custom_app,
    email: client.email,
    plan_type: client.plan_type,
    revenue_amount: client.revenue_amount,
    workflow_builder_enabled: client.workflow_builder_enabled,
    show_figma_workflow: client.show_figma_workflow || false,
    figma_workflow_url: client.figma_workflow_url || "",
    feedback_board_enabled: client.feedback_board_enabled || true,
  })

  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [saving, setSaving] = useState(false)
  const [managers, setManagers] = useState<ImplementationManager[]>([])

  useEffect(() => {
    if (formData.slug && formData.slug !== client.slug) {
      checkSlugAvailability(formData.slug)
    } else {
      setSlugAvailable(null)
    }
  }, [formData.slug, client.slug])

  useEffect(() => {
    getImplementationManagers().then((data) => {
      setManagers(data)
      // Set initial calendar links if not set
      if (!client.calendar_contact_success || !client.calendar_schedule_call || !client.calendar_integrations_call || !client.calendar_upgrade_consultation) {
        const defaultManager = data.find(m => m.manager_id === (client.implementation_manager || 'vanessa')) || data[0]
        if (defaultManager) {
          setFormData((prev) => ({
            ...prev,
            implementation_manager: defaultManager.manager_id,
            calendar_contact_success: client.calendar_contact_success || defaultManager.calendar_contact_success,
            calendar_schedule_call: client.calendar_schedule_call || defaultManager.calendar_schedule_call,
            calendar_integrations_call: client.calendar_integrations_call || defaultManager.calendar_integrations_call,
            calendar_upgrade_consultation: client.calendar_upgrade_consultation || defaultManager.calendar_upgrade_consultation,
          }))
        }
      }
    })
  }, [client])

  const checkSlugAvailability = async (slug: string) => {
    if (slug.length < 3) {
      setSlugAvailable(null)
      return
    }

    setCheckingSlug(true)
    try {
      const available = await isSlugAvailable(slug, client.id)
      setSlugAvailable(available)
    } catch (error) {
      console.error("Error checking slug availability:", error)
      setSlugAvailable(null)
    } finally {
      setCheckingSlug(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData((prev: Partial<Client>) => ({
      ...prev,
      name,
      slug: prev.slug === client.slug ? generateSlug(name) : prev.slug,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Debug: Log the selected implementation manager
    console.log('Submitting implementation_manager:', formData.implementation_manager)

    if (!formData.name || !formData.slug) {
      toast({
        title: "Error",
        description: "Name and slug are required",
        variant: "destructive",
      })
      return
    }

    if (formData.slug !== client.slug && slugAvailable === false) {
      toast({
        title: "Error",
        description: "Slug is not available",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await updateClient(client.id, formData)
      toast({
        title: "Success",
        description: "Client updated successfully",
      })
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/admin/clients/${client.id}`)
      }
    } catch (error) {
      console.error("Error updating client:", error)
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getPackageFeatures = (pkg: string) => {
    const features = {
      light: ["1 Call", "Basic Support"],
      premium: ["2 Calls", "2 Forms", "1 Zapier Integration", "Priority Support"],
      gold: ["3 Calls", "4 Forms", "2 Zapier Integrations", "Premium Support"],
      elite: [
        "Unlimited Calls",
        "Unlimited Forms",
        "Unlimited Integrations",
        "Migration Support",
        "Slack Access",
        "Dedicated Support",
      ],
    }
    return features[pkg as keyof typeof features] || []
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

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Top Action Row */}
        <div className="flex items-center gap-4 mb-6">
          {!onCancel && (
            <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700 rounded-full px-4">
              <Link href={`/admin/clients/${client.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Client
              </Link>
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={saving || (formData.slug !== client.slug && slugAvailable === false)}
            className="bg-gradient-to-r from-[#F2C94C] via-[#F2994A] to-[#F2C94C] text-white font-semibold rounded-full px-6 hover:shadow-[#F2C94C]/25"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="border-slate-600 text-slate-300 hover:bg-slate-700 rounded-full px-4">
              Cancel
            </Button>
          )}
        </div>

        {/* Main Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#F2C94C]" />
                <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              </div>
              <p className="text-sm text-slate-300">Update client details and configuration</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Client Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter client name"
                    required
                    className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-white">URL Slug *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="slug"
                      value={formData.slug || ""}
                      onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, slug: e.target.value }))}
                      placeholder="client-url-slug"
                      required
                      className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                    />
                    {checkingSlug && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                    {!checkingSlug && slugAvailable === true && <CheckCircle className="h-4 w-4 text-green-400" />}
                    {!checkingSlug && slugAvailable === false && <XCircle className="h-4 w-4 text-red-400" />}
                  </div>
                  {formData.slug && formData.slug !== client.slug && (
                    <p className="text-sm text-slate-400">Client will be accessible at: <code className="bg-slate-800 px-2 py-1 rounded text-slate-200">/client/{formData.slug}</code></p>
                  )}
                  {slugAvailable === false && <p className="text-sm text-red-400">This slug is already taken</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, email: e.target.value }))}
                    placeholder="client@email.com"
                    className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-white">Status</Label>
                    <select
                      id="status"
                      value={formData.status || "active"}
                      onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, status: e.target.value as Client["status"] }))}
                      className="w-full px-3 py-2 bg-[#0a0b1a] border border-slate-600 rounded-md text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                    >
                      <option value="active" className="bg-[#0a0b1a] text-white">Active</option>
                      <option value="inactive" className="bg-[#0a0b1a] text-white">Inactive</option>
                      <option value="pending" className="bg-[#0a0b1a] text-white">Pending</option>
                      <option value="completed" className="bg-[#0a0b1a] text-white">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number_of_users" className="text-white">Number of Users</Label>
                    <Input
                      id="number_of_users"
                      type="number"
                      min="1"
                      value={formData.number_of_users || 1}
                      onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, number_of_users: Number.parseInt(e.target.value) || 1 }))}
                      className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan_type" className="text-white">Plan Type</Label>
                    <select
                      id="plan_type"
                      value={formData.plan_type || "pro"}
                      onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, plan_type: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-[#0a0b1a] border border-slate-600 rounded-md text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                    >
                      <option value="pro" className="bg-[#0a0b1a] text-white">Pro</option>
                      <option value="business" className="bg-[#0a0b1a] text-white">Business</option>
                      <option value="unlimited" className="bg-[#0a0b1a] text-white">Unlimited</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Package & Billing Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#F2C94C]" />
                <h3 className="text-lg font-semibold text-white">Package & Billing</h3>
              </div>
              <p className="text-sm text-slate-300">Configure success package and billing settings</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="success_package" className="text-white">Success Package</Label>
                  <select
                    id="success_package"
                    value={formData.success_package || "premium"}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, success_package: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-[#0a0b1a] border border-slate-600 rounded-md text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                  >
                    <option value="light" className="bg-[#0a0b1a] text-white">Light</option>
                    <option value="premium" className="bg-[#0a0b1a] text-white">Premium</option>
                    <option value="gold" className="bg-[#0a0b1a] text-white">Gold</option>
                    <option value="elite" className="bg-[#0a0b1a] text-white">Elite</option>
                  </select>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {getPackageFeatures(formData.success_package || "premium").map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="billing_type" className="text-white">Billing Type</Label>
                    <select
                      id="billing_type"
                      value={formData.billing_type || "monthly"}
                      onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, billing_type: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-[#0a0b1a] border border-slate-600 rounded-md text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                    >
                      <option value="monthly" className="bg-[#0a0b1a] text-white">Monthly</option>
                      <option value="quarterly" className="bg-[#0a0b1a] text-white">Quarterly</option>
                      <option value="annually" className="bg-[#0a0b1a] text-white">Annually</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom_app" className="text-white">Custom App</Label>
                    <select
                      id="custom_app"
                      value={formData.custom_app || "not_applicable"}
                      onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, custom_app: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-[#0a0b1a] border border-slate-600 rounded-md text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                    >
                      <option value="gray_label" className="bg-[#0a0b1a] text-white">Gray Label</option>
                      <option value="white_label" className="bg-[#0a0b1a] text-white">White Label</option>
                      <option value="not_applicable" className="bg-[#0a0b1a] text-white">Not Applicable</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="revenue_amount" className="text-white">Revenue ($)</Label>
                    <Input
                      id="revenue_amount"
                      type="number"
                      min="0"
                      value={formData.revenue_amount || 0}
                      onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, revenue_amount: Number.parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Branding & Content Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-[#F2C94C]" />
                <h3 className="text-lg font-semibold text-white">Branding & Content</h3>
              </div>
              <p className="text-sm text-slate-300">Customize the look and feel of the client portal</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo_url" className="text-white">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url || ""}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                    className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome_message" className="text-white">Welcome Message</Label>
                  <Textarea
                    id="welcome_message"
                    value={formData.welcome_message || ""}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, welcome_message: e.target.value }))}
                    placeholder="Welcome message for the client portal"
                    rows={3}
                    className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video_url" className="text-white">Video URL</Label>
                  <Input
                    id="video_url"
                    value={formData.video_url || ""}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, video_url: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                  />
                </div>
              </div>
            </div>

            {/* Feature Settings Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#F2C94C]" />
                <h3 className="text-lg font-semibold text-white">Feature Settings</h3>
              </div>
              <p className="text-sm text-slate-300">Configure which features are enabled for this client</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_zapier_integrations" className="text-white">Show Zapier Integrations</Label>
                    <p className="text-sm text-slate-400">Display integration management section</p>
                  </div>
                  <Switch
                    id="show_zapier_integrations"
                    checked={formData.show_zapier_integrations || false}
                    onCheckedChange={(checked) => setFormData((prev: Partial<Client>) => ({ ...prev, show_zapier_integrations: checked }))}
                    className="data-[state=checked]:bg-[#F2C94C] data-[state=checked]:border-[#F2C94C]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="projects_enabled" className="text-white">Enable Project Tracking</Label>
                    <p className="text-sm text-slate-400">Show project progress and tracking</p>
                  </div>
                  <Switch
                    id="projects_enabled"
                    checked={formData.projects_enabled !== false}
                    onCheckedChange={(checked) => setFormData((prev: Partial<Client>) => ({ ...prev, projects_enabled: checked }))}
                    className="data-[state=checked]:bg-[#F2C94C] data-[state=checked]:border-[#F2C94C]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="workflow_builder_enabled" className="text-white">Enable Workflow Builder</Label>
                    <p className="text-sm text-slate-400">Show collaborative workflow builder in client portal</p>
                  </div>
                  <Switch
                    id="workflow_builder_enabled"
                    checked={formData.workflow_builder_enabled || false}
                    onCheckedChange={(checked) => setFormData((prev: Partial<Client>) => ({ ...prev, workflow_builder_enabled: checked }))}
                    className="data-[state=checked]:bg-[#F2C94C] data-[state=checked]:border-[#F2C94C]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_figma_workflow" className="text-white">Show Figma Workflow in Client Portal</Label>
                    <p className="text-sm text-slate-400">Embed a Figma workflow for this client</p>
                  </div>
                  <Switch
                    id="show_figma_workflow"
                    checked={formData.show_figma_workflow || false}
                    onCheckedChange={(checked) => setFormData((prev: Partial<Client>) => ({ ...prev, show_figma_workflow: checked }))}
                    className="data-[state=checked]:bg-[#F2C94C] data-[state=checked]:border-[#F2C94C]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="feedback_board_enabled" className="text-white">Show Feedback & Requests Board</Label>
                  </div>
                  <Switch
                    id="feedback_board_enabled"
                    checked={formData.feedback_board_enabled ?? true}
                    onCheckedChange={checked => setFormData((f) => ({ ...f, feedback_board_enabled: checked }))}
                    className="data-[state=checked]:bg-[#F2C94C] data-[state=checked]:border-[#F2C94C]"
                  />
                </div>
              </div>
              
              {formData.show_figma_workflow && (
                <div className="mt-4">
                  <Label htmlFor="figma_workflow_url" className="text-white">Figma Workflow Share URL</Label>
                  <Input
                    id="figma_workflow_url"
                    value={formData.figma_workflow_url || ""}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, figma_workflow_url: e.target.value }))}
                    placeholder="https://www.figma.com/file/..."
                    className="bg-[#0a0b1a] border-slate-600 text-white placeholder:text-slate-400 focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Width Sections */}
        <div className="space-y-8">
          {/* Current Progress */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#F2C94C]" />
              <h3 className="text-lg font-semibold text-white">Current Progress</h3>
            </div>
            <p className="text-sm text-slate-300">Overview of client's onboarding progress</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-[#0a0b1a] rounded-lg border border-slate-600">
                <div className="text-xl font-bold text-blue-400">
                  {client.calls_completed}/{client.calls_scheduled}
                </div>
                <div className="text-sm text-slate-400">Calls</div>
              </div>
              <div className="text-center p-4 bg-[#0a0b1a] rounded-lg border border-slate-600">
                <div className="text-xl font-bold text-green-400">{client.forms_setup}</div>
                <div className="text-sm text-slate-400">Forms</div>
              </div>
              <div className="text-center p-4 bg-[#0a0b1a] rounded-lg border border-slate-600">
                <div className="text-xl font-bold text-purple-400">{client.zapier_integrations_setup}</div>
                <div className="text-sm text-slate-400">Integrations</div>
              </div>
              <div className="text-center p-4 bg-[#0a0b1a] rounded-lg border border-slate-600">
                <div className="text-xl font-bold text-orange-400">{client.project_completion_percentage}%</div>
                <div className="text-sm text-slate-400">Complete</div>
              </div>
            </div>
          </div>

          {/* Calendar Links Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#F2C94C]" />
              <h3 className="text-lg font-semibold text-white">Calendar Links</h3>
            </div>
            <p className="text-sm text-slate-300">Configure calendar links for this client</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <div className="space-y-2">
                <Label htmlFor="calendar_contact_success" className="text-white">Contact Success Calendar Link</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="calendar_contact_success"
                    value={formData.calendar_contact_success || ""}
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
                    value={formData.calendar_schedule_call || ""}
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
                    value={formData.calendar_integrations_call || ""}
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

          {/* Timestamps Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#F2C94C]" />
              <h3 className="text-lg font-semibold text-white">Timestamps</h3>
            </div>
            <p className="text-sm text-slate-300">Track important milestone dates for this client</p>
            
            <div className="space-y-4">
              {client.success_package === "light" && (
                <div className="space-y-2">
                  <Label htmlFor="light_onboarding_call_date" className="text-white">Onboarding Call Date</Label>
                  <div className="relative">
                    <Input
                      id="light_onboarding_call_date"
                      type="date"
                      value={formData.light_onboarding_call_date || ""}
                      onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, light_onboarding_call_date: e.target.value }))}
                      className="bg-[#0a0b1a] border-slate-600 text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                    />
                    {formData.light_onboarding_call_date && (
                      <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400" onClick={() => setFormData(prev => ({ ...prev, light_onboarding_call_date: "" }))}>
                        <span aria-label="Clear date">×</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {client.success_package === "premium" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="premium_first_call_date" className="text-white">1st Onboarding Call Date</Label>
                    <div className="relative">
                      <Input
                        id="premium_first_call_date"
                        type="date"
                        value={formData.premium_first_call_date || ""}
                        onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, premium_first_call_date: e.target.value }))}
                        className="bg-[#0a0b1a] border-slate-600 text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                      />
                      {formData.premium_first_call_date && (
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400" onClick={() => setFormData(prev => ({ ...prev, premium_first_call_date: "" }))}>
                          <span aria-label="Clear date">×</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="premium_second_call_date" className="text-white">2nd Onboarding Call Date</Label>
                    <div className="relative">
                      <Input
                        id="premium_second_call_date"
                        type="date"
                        value={formData.premium_second_call_date || ""}
                        onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, premium_second_call_date: e.target.value }))}
                        className="bg-[#0a0b1a] border-slate-600 text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                      />
                      {formData.premium_second_call_date && (
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400" onClick={() => setFormData(prev => ({ ...prev, premium_second_call_date: "" }))}>
                          <span aria-label="Clear date">×</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {client.success_package === "gold" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gold_first_call_date" className="text-white">1st Onboarding Call Date</Label>
                    <div className="relative">
                      <Input
                        id="gold_first_call_date"
                        type="date"
                        value={formData.gold_first_call_date || ""}
                        onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, gold_first_call_date: e.target.value }))}
                        className="bg-[#0a0b1a] border-slate-600 text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                      />
                      {formData.gold_first_call_date && (
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400" onClick={() => setFormData(prev => ({ ...prev, gold_first_call_date: "" }))}>
                          <span aria-label="Clear date">×</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gold_second_call_date" className="text-white">2nd Onboarding Call Date</Label>
                    <div className="relative">
                      <Input
                        id="gold_second_call_date"
                        type="date"
                        value={formData.gold_second_call_date || ""}
                        onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, gold_second_call_date: e.target.value }))}
                        className="bg-[#0a0b1a] border-slate-600 text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                      />
                      {formData.gold_second_call_date && (
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400" onClick={() => setFormData(prev => ({ ...prev, gold_second_call_date: "" }))}>
                          <span aria-label="Clear date">×</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gold_third_call_date" className="text-white">3rd Onboarding Call Date</Label>
                    <div className="relative">
                      <Input
                        id="gold_third_call_date"
                        type="date"
                        value={formData.gold_third_call_date || ""}
                        onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, gold_third_call_date: e.target.value }))}
                        className="bg-[#0a0b1a] border-slate-600 text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                      />
                      {formData.gold_third_call_date && (
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400" onClick={() => setFormData(prev => ({ ...prev, gold_third_call_date: "" }))}>
                          <span aria-label="Clear date">×</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {client.success_package === "elite" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="elite_configurations_started_date" className="text-white">Configurations Started Date</Label>
                    <div className="relative">
                      <Input
                        id="elite_configurations_started_date"
                        type="date"
                        value={formData.elite_configurations_started_date || ""}
                        onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, elite_configurations_started_date: e.target.value }))}
                        className="bg-[#0a0b1a] border-slate-600 text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                      />
                      {formData.elite_configurations_started_date && (
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400" onClick={() => setFormData(prev => ({ ...prev, elite_configurations_started_date: "" }))}>
                          <span aria-label="Clear date">×</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="elite_integrations_started_date" className="text-white">Integrations Started Date</Label>
                    <div className="relative">
                      <Input
                        id="elite_integrations_started_date"
                        type="date"
                        value={formData.elite_integrations_started_date || ""}
                        onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, elite_integrations_started_date: e.target.value }))}
                        className="bg-[#0a0b1a] border-slate-600 text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                      />
                      {formData.elite_integrations_started_date && (
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400" onClick={() => setFormData(prev => ({ ...prev, elite_integrations_started_date: "" }))}>
                          <span aria-label="Clear date">×</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="elite_verification_completed_date" className="text-white">Verification Completed Date</Label>
                    <div className="relative">
                      <Input
                        id="elite_verification_completed_date"
                        type="date"
                        value={formData.elite_verification_completed_date || ""}
                        onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, elite_verification_completed_date: e.target.value }))}
                        className="bg-[#0a0b1a] border-slate-600 text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                      />
                      {formData.elite_verification_completed_date && (
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400" onClick={() => setFormData(prev => ({ ...prev, elite_verification_completed_date: "" }))}>
                          <span aria-label="Clear date">×</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="graduation_date" className="text-white">Graduation Date</Label>
                <div className="relative">
                  <Input
                    id="graduation_date"
                    type="date"
                    value={formData.graduation_date || ""}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, graduation_date: e.target.value }))}
                    className="bg-[#0a0b1a] border-slate-600 text-white focus:border-[#F2C94C] focus:ring-[#F2C94C]/20"
                  />
                  {formData.graduation_date && (
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400" onClick={() => setFormData(prev => ({ ...prev, graduation_date: "" }))}>
                      <span aria-label="Clear date">×</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Task Completions (Admin Control) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#F2C94C]" />
            <h3 className="text-lg font-semibold text-white">Onboarding Task Completions</h3>
          </div>
          <p className="text-sm text-slate-300">Mark core onboarding tasks as complete for this client</p>
          
          <OnboardingTaskAdminChecklist clientId={client.id} projectsEnabled={formData.projects_enabled !== false} />
        </div>

        {formData.slug !== client.slug && (
          <Alert className="border-red-500/30 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              Changing the slug will update the client's portal URL. Make sure to inform the client of the new URL.
            </AlertDescription>
          </Alert>
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
            disabled={saving || (formData.slug !== client.slug && slugAvailable === false)}
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[#F2C94C] via-[#F2994A] to-[#F2C94C] text-white font-semibold rounded-full px-6 hover:shadow-[#F2C94C]/25"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
