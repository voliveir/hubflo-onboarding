"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Save, ArrowLeft, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"

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

  if (loading) return <div className="text-sm text-gray-500">Loading onboarding tasks...</div>
  if (error) return <div className="text-sm text-red-500">{error}</div>

  return (
    <div className="space-y-4">
      {TASKS.map((task) => (
        <div key={task.key} className="flex items-center gap-3">
          <Checkbox
            checked={!!completions[task.key]}
            onCheckedChange={(checked) => handleToggle(task.key, !!checked)}
            disabled={saving === task.key}
            id={`onboarding-task-${task.key}`}
          />
          <label htmlFor={`onboarding-task-${task.key}`} className={`text-base ${completions[task.key] ? "line-through text-gray-400" : "text-gray-900"}`}>
            {task.label}
          </label>
          {saving === task.key && <span className="text-xs text-gray-400 ml-2">Saving...</span>}
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
  })

  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (formData.slug && formData.slug !== client.slug) {
      checkSlugAvailability(formData.slug)
    } else {
      setSlugAvailable(null)
    }
  }, [formData.slug, client.slug])

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

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          {!onCancel && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/clients/${client.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Client
              </Link>
            </Button>
          )}
          <Button type="submit" disabled={saving || (formData.slug !== client.slug && slugAvailable === false)}>
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
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>Update client details and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="slug"
                    value={formData.slug || ""}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, slug: e.target.value }))}
                    placeholder="client-url-slug"
                    required
                  />
                  {checkingSlug && <Loader2 className="h-4 w-4 animate-spin" />}
                  {!checkingSlug && slugAvailable === true && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {!checkingSlug && slugAvailable === false && <XCircle className="h-4 w-4 text-red-600" />}
                </div>
                {formData.slug && formData.slug !== client.slug && (
                  <p className="text-sm text-gray-600">Client will be accessible at: /client/{formData.slug}</p>
                )}
                {slugAvailable === false && <p className="text-sm text-red-600">This slug is already taken</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, email: e.target.value }))}
                  placeholder="client@email.com"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status || "active"}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, status: e.target.value as Client["status"] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number_of_users">Number of Users</Label>
                  <Input
                    id="number_of_users"
                    type="number"
                    min="1"
                    value={formData.number_of_users || 1}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, number_of_users: Number.parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan_type">Plan Type</Label>
                  <select
                    id="plan_type"
                    value={formData.plan_type || "pro"}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, plan_type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pro">Pro</option>
                    <option value="business">Business</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="success_package">Success Package</Label>
                <select
                  id="success_package"
                  value={formData.success_package || "premium"}
                  onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, success_package: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="premium">Premium</option>
                  <option value="gold">Gold</option>
                  <option value="elite">Elite</option>
                </select>
                <div className="flex flex-wrap gap-1 mt-2">
                  {getPackageFeatures(formData.success_package || "premium").map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="billing_type">Billing Type</Label>
                  <select
                    id="billing_type"
                    value={formData.billing_type || "monthly"}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, billing_type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom_app">Custom App</Label>
                  <select
                    id="custom_app"
                    value={formData.custom_app || "not_applicable"}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, custom_app: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gray_label">Gray Label</option>
                    <option value="white_label">White Label</option>
                    <option value="not_applicable">Not Applicable</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revenue_amount">Revenue ($)</Label>
                  <Input
                    id="revenue_amount"
                    type="number"
                    min="0"
                    value={formData.revenue_amount || 0}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, revenue_amount: Number.parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    prefix="$"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branding & Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Branding & Content</CardTitle>
              <CardDescription>Customize the client's portal appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url || ""}
                  onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, logo_url: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo_url && (
                  <div className="mt-2">
                    <img
                      src={formData.logo_url || "/placeholder.svg"}
                      alt="Client Logo Preview"
                      className="h-12 w-auto border rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome_message">Welcome Message</Label>
                <Textarea
                  id="welcome_message"
                  value={formData.welcome_message || ""}
                  onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, welcome_message: e.target.value }))}
                  placeholder="Welcome to your onboarding portal..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_url">Welcome Video URL</Label>
                <Input
                  id="video_url"
                  value={formData.video_url || ""}
                  onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Feature Settings</CardTitle>
            <CardDescription>Configure which features are enabled for this client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show_zapier_integrations">Show Zapier Integrations</Label>
                  <p className="text-sm text-gray-600">Display integration management section</p>
                </div>
                <Switch
                  id="show_zapier_integrations"
                  checked={formData.show_zapier_integrations || false}
                  onCheckedChange={(checked) => setFormData((prev: Partial<Client>) => ({ ...prev, show_zapier_integrations: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="projects_enabled">Enable Project Tracking</Label>
                  <p className="text-sm text-gray-600">Show project progress and tracking</p>
                </div>
                <Switch
                  id="projects_enabled"
                  checked={formData.projects_enabled !== false}
                  onCheckedChange={(checked) => setFormData((prev: Partial<Client>) => ({ ...prev, projects_enabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="workflow_builder_enabled">Enable Workflow Builder</Label>
                  <p className="text-sm text-gray-600">Show collaborative workflow builder in client portal</p>
                </div>
                <Switch
                  id="workflow_builder_enabled"
                  checked={formData.workflow_builder_enabled || false}
                  onCheckedChange={(checked) => setFormData((prev: Partial<Client>) => ({ ...prev, workflow_builder_enabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show_figma_workflow">Show Figma Workflow in Client Portal</Label>
                  <p className="text-sm text-gray-600">Embed a Figma workflow for this client</p>
                </div>
                <Switch
                  id="show_figma_workflow"
                  checked={formData.show_figma_workflow || false}
                  onCheckedChange={(checked) => setFormData((prev: Partial<Client>) => ({ ...prev, show_figma_workflow: checked }))}
                />
              </div>
            </div>
            {formData.show_figma_workflow && (
              <div className="mt-4">
                <Label htmlFor="figma_workflow_url">Figma Workflow Share URL</Label>
                <Input
                  id="figma_workflow_url"
                  value={formData.figma_workflow_url || ""}
                  onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, figma_workflow_url: e.target.value }))}
                  placeholder="https://www.figma.com/file/..."
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Progress</CardTitle>
            <CardDescription>Overview of client's onboarding progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {client.calls_completed}/{client.calls_scheduled}
                </div>
                <div className="text-sm text-gray-600">Calls</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{client.forms_setup}</div>
                <div className="text-sm text-gray-600">Forms</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">{client.zapier_integrations_setup}</div>
                <div className="text-sm text-gray-600">Integrations</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">{client.project_completion_percentage}%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {formData.slug !== client.slug && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Changing the slug will update the client's portal URL. Make sure to inform the client of the new URL.
            </AlertDescription>
          </Alert>
        )}
      </form>

      {/* Onboarding Task Completions (Admin Control) */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Onboarding Task Completions</CardTitle>
            <CardDescription>Mark core onboarding tasks as complete for this client</CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingTaskAdminChecklist clientId={client.id} projectsEnabled={formData.projects_enabled !== false} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
