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
import { updateClient, isSlugAvailable, getTaskCompletions, updateTaskCompletion, updateProjectTracking, countCompletedCalls, getScheduledCallsForPackage } from "@/lib/database"
import { type Client } from "@/lib/types"
import { Save, ArrowLeft, CheckCircle, XCircle, Loader2, AlertCircle, Package, Settings, Calendar, Users, Palette, DollarSign, X, Check } from "lucide-react"
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

  if (loading) return <div className="text-sm text-gray-600">Loading onboarding tasks...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>

  return (
    <div className="space-y-4">
      {TASKS.map((task) => (
        <div key={task.key} className="flex items-center gap-3">
          <Checkbox
            checked={!!completions[task.key]}
            onCheckedChange={(checked) => handleToggle(task.key, !!checked)}
            disabled={saving === task.key}
            id={`onboarding-task-${task.key}`}
            className="text-brand-gold border-gray-300"
          />
          <label htmlFor={`onboarding-task-${task.key}`} className={`text-base ${completions[task.key] ? "line-through text-gray-500" : ""}`} style={{color: completions[task.key] ? '#9ca3af' : '#060520'}}>
            {task.label}
          </label>
          {saving === task.key && <span className="text-xs text-gray-600 ml-2">Saving...</span>}
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
    light_onboarding_call_date: client.light_onboarding_call_date,
    premium_first_call_date: client.premium_first_call_date,
    premium_second_call_date: client.premium_second_call_date,
    gold_first_call_date: client.gold_first_call_date,
    gold_second_call_date: client.gold_second_call_date,
    gold_third_call_date: client.gold_third_call_date,
    elite_configurations_started_date: client.elite_configurations_started_date,
    elite_integrations_started_date: client.elite_integrations_started_date,
    elite_verification_completed_date: client.elite_verification_completed_date,
    churned: client.churned,
    is_demo: client.is_demo,
    churn_risk: client.churn_risk,
    extra_call_dates: client.extra_call_dates || [],
    created_at: client.created_at,
    onboarding_email_sent: client.onboarding_email_sent ?? false,
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
      // Update client data
      await updateClient(client.id, formData)
      
      // Check if any call dates or package type were changed and update project tracking
      const callDatesChanged = 
        formData.light_onboarding_call_date !== client.light_onboarding_call_date ||
        formData.premium_first_call_date !== client.premium_first_call_date ||
        formData.premium_second_call_date !== client.premium_second_call_date ||
        formData.gold_first_call_date !== client.gold_first_call_date ||
        formData.gold_second_call_date !== client.gold_second_call_date ||
        formData.gold_third_call_date !== client.gold_third_call_date ||
        JSON.stringify(formData.extra_call_dates) !== JSON.stringify(client.extra_call_dates)
      
      const packageChanged = formData.success_package !== client.success_package
      
      if (callDatesChanged || packageChanged) {
        // Update project tracking with current tracking data but recalculated calls
        const updatedClient = { ...client, ...formData }
        const completedCalls = countCompletedCalls(updatedClient)
        const scheduledCalls = getScheduledCallsForPackage(updatedClient.success_package)
        
        await updateProjectTracking(client.id, {
          calls_scheduled: scheduledCalls,
          calls_completed: completedCalls,
          forms_setup: client.forms_setup || 0,
          smartdocs_setup: client.smartdocs_setup || 0,
          zapier_integrations_setup: client.zapier_integrations_setup || 0,
          migration_completed: client.migration_completed || false,
          slack_access_granted: client.slack_access_granted || false,
        })
      }
      
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

  const handleManagerChange = (managerId: string) => {
      const selected = managers.find(m => m.manager_id === managerId)
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        implementation_manager: selected.manager_id,
        calendar_contact_success: selected.calendar_contact_success,
        calendar_schedule_call: selected.calendar_schedule_call,
        calendar_integrations_call: selected.calendar_integrations_call,
        calendar_upgrade_consultation: selected.calendar_upgrade_consultation,
      }))
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Top Action Row */}
        <div className="flex items-center gap-4 mb-6">
          {!onCancel && (
            <Button asChild variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full px-4">
              <Link href={`/admin/clients/${client.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Client
              </Link>
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={saving || (formData.slug !== client.slug && slugAvailable === false)}
            className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-semibold rounded-full px-6 hover:shadow-[#F2C94C]/25"
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
            <Button type="button" variant="outline" onClick={onCancel} className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full px-4">
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
                <Package className="h-5 w-5 text-brand-gold" />
                <h3 className="text-lg font-semibold" style={{color: '#060520'}}>Basic Information</h3>
              </div>
              <p className="text-sm text-gray-600">Update client details and configuration</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" style={{color: '#060520'}}>Client Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter client name"
                    required
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand-gold focus:ring-brand-gold/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" style={{color: '#060520'}}>URL Slug *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="slug"
                      value={formData.slug || ""}
                      onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, slug: e.target.value }))}
                      placeholder="client-url-slug"
                      required
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand-gold focus:ring-brand-gold/20"
                    />
                    {checkingSlug && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                    {!checkingSlug && slugAvailable === true && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {!checkingSlug && slugAvailable === false && <XCircle className="h-4 w-4 text-red-600" />}
                  </div>
                  {formData.slug && formData.slug !== client.slug && (
                    <p className="text-sm text-gray-600">Client will be accessible at: <code className="bg-gray-100 px-2 py-1 rounded text-gray-900">/client/{formData.slug}</code></p>
                  )}
                  {slugAvailable === false && <p className="text-sm text-red-600">This slug is already taken</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" style={{color: '#060520'}}>Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, email: e.target.value }))}
                    placeholder="client@email.com"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand-gold focus:ring-brand-gold/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="created_at" style={{color: '#060520'}}>Created Date</Label>
                  <Input
                    id="created_at"
                    type="date"
                    value={formData.created_at ? new Date(formData.created_at).toISOString().slice(0, 10) : ""}
                    onChange={e => setFormData((prev: Partial<Client>) => ({ ...prev, created_at: e.target.value }))}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand-gold focus:ring-brand-gold/20"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="status" style={{color: '#060520'}}>Status</Label>
                    <select
                      id="status"
                      value={formData.status || "active"}
                      onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, status: e.target.value as Client["status"] }))}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:border-brand-gold focus:ring-brand-gold/20"
                    >
                      <option value="active" className="bg-white text-gray-900">Active</option>
                      <option value="inactive" className="bg-white text-gray-900">Inactive</option>
                      <option value="pending" className="bg-white text-gray-900">Pending</option>
                      <option value="completed" className="bg-white text-gray-900">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number_of_users" style={{color: '#060520'}}>Number of Users</Label>
                    <Input
                      id="number_of_users"
                      type="number"
                      min="1"
                      value={formData.number_of_users || 1}
                      onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, number_of_users: Number.parseInt(e.target.value) || 1 }))}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand-gold focus:ring-brand-gold/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan_type" style={{color: '#060520'}}>Plan Type</Label>
                    <select
                      id="plan_type"
                      value={formData.plan_type || "pro"}
                      onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, plan_type: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:border-brand-gold focus:ring-brand-gold/20"
                    >
                      <option value="pro" className="bg-white text-gray-900">Pro</option>
                      <option value="business" className="bg-white text-gray-900">Business</option>
                      <option value="unlimited" className="bg-white text-gray-900">Unlimited</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="churned" style={{color: '#060520'}}>Client Churned</Label>
                    <p className="text-sm text-gray-600">Mark this client as churned (no longer active customer)</p>
                  </div>
                  <Switch
                    id="churned"
                    checked={formData.churned || false}
                    onCheckedChange={(checked) => setFormData((prev: Partial<Client>) => ({ ...prev, churned: checked }))}
                    className="data-[state=checked]:bg-brand-gold data-[state=checked]:border-brand-gold"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="churn_risk" style={{color: '#060520'}}>Churn Risk</Label>
                    <p className="text-sm text-gray-600">Mark this client as at risk of churn (shows in analytics)</p>
                  </div>
                  <Switch
                    id="churn_risk"
                    checked={formData.churn_risk || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, churn_risk: checked })}
                    className="data-[state=checked]:bg-brand-gold data-[state=checked]:border-brand-gold"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_demo" style={{color: '#060520'}}>Demo Account</Label>
                    <p className="text-sm text-gray-600">Mark this client as a demo/test account (excluded from analytics)</p>
                  </div>
                  <Switch
                    id="is_demo"
                    checked={formData.is_demo || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_demo: checked })}
                    className="data-[state=checked]:bg-brand-gold data-[state=checked]:border-brand-gold"
                  />
                </div>
              </div>
            </div>

            {/* Package & Billing Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-brand-gold" />
                <h3 className="text-lg font-semibold" style={{color: '#060520'}}>Package & Billing</h3>
              </div>
              <p className="text-sm text-gray-600">Configure success package and billing settings</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="success_package" style={{color: '#060520'}}>Success Package</Label>
                  <div className="flex flex-wrap gap-4">
                    {["light", "premium", "gold", "elite", "no_success"].map((pkg) => (
                      <div
                        key={pkg}
                        className={`flex-1 min-w-[260px] max-w-[400px] border rounded-lg p-4 cursor-pointer transition-all ${
                          formData.success_package === pkg
                            ? "border-brand-gold bg-brand-gold/10 ring-2 ring-brand-gold/20"
                            : "border-gray-300 hover:border-gray-400 bg-white"
                        }`}
                        onClick={() => setFormData((prev: Partial<Client>) => ({ ...prev, success_package: pkg as Client["success_package"] }))}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold capitalize" style={{color: '#060520'}}>{pkg === 'no_success' ? 'No Success Package' : pkg}</h3>
                          <input
                            type="radio"
                            name="success_package"
                            value={pkg}
                            checked={formData.success_package === pkg}
                            onChange={() => setFormData((prev: Partial<Client>) => ({ ...prev, success_package: pkg as Client["success_package"] }))}
                            className="text-brand-gold"
                          />
                        </div>
                        <div className="space-y-1">
                          {getPackageFeatures(pkg).map((feature, index) => (
                            <div key={index} className="text-sm text-gray-700 flex items-start">
                              <Check className="h-3 w-3 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Onboarding Email Sent toggle for No Success Package */}
                {formData.success_package === 'no_success' && (
                  <div className="flex items-center space-x-2 mt-4">
                    <Switch
                      id="onboarding_email_sent"
                      checked={formData.onboarding_email_sent}
                      onCheckedChange={(checked) => setFormData((prev: Partial<Client>) => ({ ...prev, onboarding_email_sent: checked }))}
                      className="text-brand-gold border-gray-300"
                    />
                    <Label htmlFor="onboarding_email_sent" style={{color: '#060520'}}>Onboarding Email Sent by CSM</Label>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="billing_type" style={{color: '#060520'}}>Billing Type</Label>
                    <select
                      id="billing_type"
                      value={formData.billing_type || "monthly"}
                      onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, billing_type: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:border-brand-gold focus:ring-brand-gold/20"
                    >
                      <option value="monthly" className="bg-white text-gray-900">Monthly</option>
                      <option value="quarterly" className="bg-white text-gray-900">Quarterly</option>
                      <option value="annually" className="bg-white text-gray-900">Annually</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom_app" style={{color: '#060520'}}>Custom App</Label>
                    <select
                      id="custom_app"
                      value={formData.custom_app || "not_applicable"}
                      onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, custom_app: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:border-brand-gold focus:ring-brand-gold/20"
                    >
                      <option value="gray_label" className="bg-white text-gray-900">Gray Label</option>
                      <option value="white_label" className="bg-white text-gray-900">White Label</option>
                      <option value="not_applicable" className="bg-white text-gray-900">Not Applicable</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="revenue_amount" style={{color: '#060520'}}>Revenue ($)</Label>
                    <Input
                      id="revenue_amount"
                      type="number"
                      min="0"
                      value={formData.revenue_amount || 0}
                      onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, revenue_amount: Number.parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand-gold focus:ring-brand-gold/20"
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
                <Palette className="h-5 w-5 text-brand-gold" />
                <h3 className="text-lg font-semibold" style={{color: '#060520'}}>Branding & Content</h3>
              </div>
              <p className="text-sm text-gray-600">Customize the look and feel of the client portal</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo_url" style={{color: '#060520'}}>Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url || ""}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand-gold focus:ring-brand-gold/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome_message" style={{color: '#060520'}}>Welcome Message</Label>
                  <Textarea
                    id="welcome_message"
                    value={formData.welcome_message || ""}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, welcome_message: e.target.value }))}
                    placeholder="Welcome message for the client portal"
                    rows={3}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand-gold focus:ring-brand-gold/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video_url" style={{color: '#060520'}}>Video URL</Label>
                  <Input
                    id="video_url"
                    value={formData.video_url || ""}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, video_url: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand-gold focus:ring-brand-gold/20"
                  />
                </div>
              </div>
            </div>

            {/* Feature Settings Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-brand-gold" />
                <h3 className="text-lg font-semibold" style={{color: '#060520'}}>Feature Settings</h3>
              </div>
              <p className="text-sm text-gray-600">Configure which features are enabled for this client</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_zapier_integrations" style={{color: '#060520'}}>Show Zapier Integrations</Label>
                    <p className="text-sm text-gray-600">Display integration management section</p>
                  </div>
                  <Switch
                    id="show_zapier_integrations"
                    checked={formData.show_zapier_integrations || false}
                    onCheckedChange={(checked) => setFormData((prev: Partial<Client>) => ({ ...prev, show_zapier_integrations: checked }))}
                    className="data-[state=checked]:bg-brand-gold data-[state=checked]:border-brand-gold"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="projects_enabled" style={{color: '#060520'}}>Enable Project Tracking</Label>
                    <p className="text-sm text-gray-600">Show project progress and tracking</p>
                  </div>
                  <Switch
                    id="projects_enabled"
                    checked={formData.projects_enabled !== false}
                    onCheckedChange={(checked) => setFormData((prev: Partial<Client>) => ({ ...prev, projects_enabled: checked }))}
                    className="data-[state=checked]:bg-brand-gold data-[state=checked]:border-brand-gold"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="workflow_builder_enabled" style={{color: '#060520'}}>Enable Workflow Builder</Label>
                    <p className="text-sm text-gray-600">Show collaborative workflow builder in client portal</p>
                  </div>
                  <Switch
                    id="workflow_builder_enabled"
                    checked={formData.workflow_builder_enabled || false}
                    onCheckedChange={(checked) => setFormData((prev: Partial<Client>) => ({ ...prev, workflow_builder_enabled: checked }))}
                    className="data-[state=checked]:bg-brand-gold data-[state=checked]:border-brand-gold"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show_figma_workflow" style={{color: '#060520'}}>Show Figma Workflow in Client Portal</Label>
                    <p className="text-sm text-gray-600">Embed a Figma workflow for this client</p>
                  </div>
                  <Switch
                    id="show_figma_workflow"
                    checked={formData.show_figma_workflow || false}
                    onCheckedChange={(checked) => setFormData((prev: Partial<Client>) => ({ ...prev, show_figma_workflow: checked }))}
                    className="data-[state=checked]:bg-brand-gold data-[state=checked]:border-brand-gold"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="feedback_board_enabled" style={{color: '#060520'}}>Show Feedback & Requests Board</Label>
                  </div>
                  <Switch
                    id="feedback_board_enabled"
                    checked={formData.feedback_board_enabled ?? true}
                    onCheckedChange={checked => setFormData((f) => ({ ...f, feedback_board_enabled: checked }))}
                    className="data-[state=checked]:bg-brand-gold data-[state=checked]:border-brand-gold"
                  />
                </div>
              </div>
              
              {formData.show_figma_workflow && (
                <div className="mt-4">
                  <Label htmlFor="figma_workflow_url" style={{color: '#060520'}}>Figma Workflow Share URL</Label>
                  <Input
                    id="figma_workflow_url"
                    value={formData.figma_workflow_url || ""}
                    onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, figma_workflow_url: e.target.value }))}
                    placeholder="https://www.figma.com/file/..."
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand-gold focus:ring-brand-gold/20"
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
            <DollarSign className="h-5 w-5 text-brand-gold" />
            <h3 className="text-lg font-semibold" style={{color: '#060520'}}>Current Progress</h3>
          </div>
          <p className="text-sm text-gray-600">Overview of client's onboarding progress</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xl font-bold text-blue-600">
                {client.calls_completed}/{client.calls_scheduled}
              </div>
              <div className="text-sm text-gray-600">Calls</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xl font-bold text-green-600">{client.forms_setup}</div>
              <div className="text-sm text-gray-600">Forms</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xl font-bold text-purple-600">{client.zapier_integrations_setup}</div>
              <div className="text-sm text-gray-600">Integrations</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xl font-bold text-orange-600">{client.project_completion_percentage}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
          </div>

          {/* Calendar Links Section */}
          <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-gold" />
            <h3 className="text-lg font-semibold" style={{color: '#060520'}}>Calendar Links</h3>
          </div>
          <p className="text-sm text-gray-600">Configure calendar links for this client</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="implementation_manager" style={{color: '#060520'}}>Implementation Manager</Label>
                <select
                  name="implementation_manager"
                  id="implementation_manager"
                  value={formData.implementation_manager}
                  onChange={e => handleManagerChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:border-brand-gold focus:ring-brand-gold/20"
                >
                  {managers.map((manager) => (
                    <option key={manager.manager_id} value={manager.manager_id} className="bg-white text-gray-900">
                      {manager.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calendar_contact_success" style={{color: '#060520'}}>Contact Success Calendar Link</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="calendar_contact_success"
                    value={formData.calendar_contact_success || ""}
                    onChange={e => setFormData(prev => ({ ...prev, calendar_contact_success: e.target.value }))}
                    placeholder="Contact Success Calendar Link"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand-gold focus:ring-brand-gold/20"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFormData(prev => ({ ...prev, calendar_contact_success: managers.find(m => m.manager_id === formData.implementation_manager)?.calendar_contact_success || "" }))}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calendar_schedule_call" style={{color: '#060520'}}>Schedule Call Calendar Link</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="calendar_schedule_call"
                    value={formData.calendar_schedule_call || ""}
                    onChange={e => setFormData(prev => ({ ...prev, calendar_schedule_call: e.target.value }))}
                    placeholder="Schedule Call Calendar Link"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand-gold focus:ring-brand-gold/20"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFormData(prev => ({ ...prev, calendar_schedule_call: managers.find(m => m.manager_id === formData.implementation_manager)?.calendar_schedule_call || "" }))}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calendar_integrations_call" style={{color: '#060520'}}>Integrations Call Calendar Link</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="calendar_integrations_call"
                    value={formData.calendar_integrations_call || ""}
                    onChange={e => setFormData(prev => ({ ...prev, calendar_integrations_call: e.target.value }))}
                    placeholder="Integrations Call Calendar Link"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand-gold focus:ring-brand-gold/20"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFormData(prev => ({ ...prev, calendar_integrations_call: managers.find(m => m.manager_id === formData.implementation_manager)?.calendar_integrations_call || "" }))}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calendar_upgrade_consultation" style={{color: '#060520'}}>Upgrade Consultation Calendar Link</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="calendar_upgrade_consultation"
                    value={formData.calendar_upgrade_consultation || ''}
                    onChange={e => setFormData(prev => ({ ...prev, calendar_upgrade_consultation: e.target.value }))}
                    placeholder="Upgrade Consultation Calendar Link"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand-gold focus:ring-brand-gold/20"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFormData(prev => ({ ...prev, calendar_upgrade_consultation: managers.find(m => m.manager_id === formData.implementation_manager)?.calendar_upgrade_consultation || "" }))}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
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
            <Users className="h-5 w-5 text-brand-gold" />
            <h3 className="text-lg font-semibold" style={{color: '#060520'}}>Timestamps</h3>
          </div>
          <p className="text-sm text-gray-600">Track important milestone dates for this client</p>
          <Alert className="bg-brand-gold/10 border-brand-gold/20">
            <AlertCircle className="h-4 w-4 text-brand-gold" />
            <AlertDescription className="text-gray-700">
              Package type sets scheduled calls automatically. Call dates update completed calls count in tracking page
            </AlertDescription>
          </Alert>
            
            <div className="space-y-4">
              {client.success_package === "light" && (
                <div className="space-y-2">
                  <Label htmlFor="light_onboarding_call_date" style={{color: '#060520'}}>Onboarding Call Date</Label>
                  <div className="relative">
                    <Input
                      id="light_onboarding_call_date"
                      type="date"
                      value={formData.light_onboarding_call_date || ""}
                      onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, light_onboarding_call_date: e.target.value }))}
                      className="bg-white border-gray-300 text-gray-900 focus:border-brand-gold focus:ring-brand-gold/20"
                    />
                    {formData.light_onboarding_call_date && (
                      <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600" onClick={() => setFormData(prev => ({ ...prev, light_onboarding_call_date: "" }))}>
                        <span aria-label="Clear date">×</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {client.success_package === "premium" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="premium_first_call_date" style={{color: '#060520'}}>1st Onboarding Call Date</Label>
                    <div className="relative">
                      <Input
                        id="premium_first_call_date"
                        type="date"
                        value={formData.premium_first_call_date || ""}
                        onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, premium_first_call_date: e.target.value }))}
                        className="bg-white border-gray-300 text-gray-900 focus:border-brand-gold focus:ring-brand-gold/20"
                      />
                      {formData.premium_first_call_date && (
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600" onClick={() => setFormData(prev => ({ ...prev, premium_first_call_date: "" }))}>
                          <span aria-label="Clear date">×</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="premium_second_call_date" style={{color: '#060520'}}>2nd Onboarding Call Date</Label>
                    <div className="relative">
                      <Input
                        id="premium_second_call_date"
                        type="date"
                        value={formData.premium_second_call_date || ""}
                        onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, premium_second_call_date: e.target.value }))}
                        className="bg-white border-gray-300 text-gray-900 focus:border-brand-gold focus:ring-brand-gold/20"
                      />
                      {formData.premium_second_call_date && (
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600" onClick={() => setFormData(prev => ({ ...prev, premium_second_call_date: "" }))}>
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
                    <Label htmlFor="gold_first_call_date" style={{color: '#060520'}}>1st Onboarding Call Date</Label>
                    <div className="relative">
                      <Input
                        id="gold_first_call_date"
                        type="date"
                        value={formData.gold_first_call_date || ""}
                        onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, gold_first_call_date: e.target.value }))}
                        className="bg-white border-gray-300 text-gray-900 focus:border-brand-gold focus:ring-brand-gold/20"
                      />
                      {formData.gold_first_call_date && (
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600" onClick={() => setFormData(prev => ({ ...prev, gold_first_call_date: "" }))}>
                          <span aria-label="Clear date">×</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gold_second_call_date" style={{color: '#060520'}}>2nd Onboarding Call Date</Label>
                    <div className="relative">
                      <Input
                        id="gold_second_call_date"
                        type="date"
                        value={formData.gold_second_call_date || ""}
                        onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, gold_second_call_date: e.target.value }))}
                        className="bg-white border-gray-300 text-gray-900 focus:border-brand-gold focus:ring-brand-gold/20"
                      />
                      {formData.gold_second_call_date && (
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600" onClick={() => setFormData(prev => ({ ...prev, gold_second_call_date: "" }))}>
                          <span aria-label="Clear date">×</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gold_third_call_date" style={{color: '#060520'}}>3rd Onboarding Call Date</Label>
                    <div className="relative">
                      <Input
                        id="gold_third_call_date"
                        type="date"
                        value={formData.gold_third_call_date || ""}
                        onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, gold_third_call_date: e.target.value }))}
                        className="bg-white border-gray-300 text-gray-900 focus:border-brand-gold focus:ring-brand-gold/20"
                      />
                      {formData.gold_third_call_date && (
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600" onClick={() => setFormData(prev => ({ ...prev, gold_third_call_date: "" }))}>
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
                    <Label htmlFor="elite_configurations_started_date" style={{color: '#060520'}}>Configurations Started Date</Label>
                    <div className="relative">
                      <Input
                        id="elite_configurations_started_date"
                        type="date"
                        value={formData.elite_configurations_started_date || ""}
                        onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, elite_configurations_started_date: e.target.value }))}
                        className="bg-white border-gray-300 text-gray-900 focus:border-brand-gold focus:ring-brand-gold/20"
                      />
                      {formData.elite_configurations_started_date && (
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600" onClick={() => setFormData(prev => ({ ...prev, elite_configurations_started_date: "" }))}>
                          <span aria-label="Clear date">×</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="elite_integrations_started_date" style={{color: '#060520'}}>Integrations Started Date</Label>
                    <div className="relative">
                      <Input
                        id="elite_integrations_started_date"
                        type="date"
                        value={formData.elite_integrations_started_date || ""}
                        onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, elite_integrations_started_date: e.target.value }))}
                        className="bg-white border-gray-300 text-gray-900 focus:border-brand-gold focus:ring-brand-gold/20"
                      />
                      {formData.elite_integrations_started_date && (
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600" onClick={() => setFormData(prev => ({ ...prev, elite_integrations_started_date: "" }))}>
                          <span aria-label="Clear date">×</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="elite_verification_completed_date" style={{color: '#060520'}}>Verification Completed Date</Label>
                    <div className="relative">
                      <Input
                        id="elite_verification_completed_date"
                        type="date"
                        value={formData.elite_verification_completed_date || ""}
                        onChange={(e) => setFormData((prev: Partial<Client>) => ({ ...prev, elite_verification_completed_date: e.target.value }))}
                        className="bg-white border-gray-300 text-gray-900 focus:border-brand-gold focus:ring-brand-gold/20"
                      />
                      {formData.elite_verification_completed_date && (
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600" onClick={() => setFormData(prev => ({ ...prev, elite_verification_completed_date: "" }))}>
                          <span aria-label="Clear date">×</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>

          {/* Additional Calls Section */}
          <div className="space-y-2 mt-8">
            <Label className="text-base font-semibold" style={{color: '#060520'}}>Additional Calls</Label>
            <p className="text-sm text-gray-600 mb-2">Track any extra calls beyond the standard package calls.</p>
            {formData.extra_call_dates && formData.extra_call_dates.length > 0 ? (
              formData.extra_call_dates.map((date, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <Input
                    type="date"
                    value={date || ""}
                    onChange={e => {
                      const newDates = [...(formData.extra_call_dates || [])];
                      newDates[idx] = e.target.value;
                      setFormData(prev => ({ ...prev, extra_call_dates: newDates }));
                    }}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-brand-gold focus:ring-brand-gold/20 w-48"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => {
                      const newDates = [...(formData.extra_call_dates || [])];
                      newDates.splice(idx, 1);
                      setFormData(prev => ({ ...prev, extra_call_dates: newDates }));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-sm mb-2">No extra calls tracked yet.</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setFormData(prev => ({ ...prev, extra_call_dates: [...(prev.extra_call_dates || []), ""] }))}
            >
              Add Another Call Date
            </Button>
          </div>
        </div>

        {/* Onboarding Task Completions (Admin Control) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-brand-gold" />
            <h3 className="text-lg font-semibold" style={{color: '#060520'}}>Onboarding Task Completions</h3>
          </div>
          <p className="text-sm text-gray-600">Mark core onboarding tasks as complete for this client</p>
          
          <OnboardingTaskAdminChecklist clientId={client.id} projectsEnabled={formData.projects_enabled !== false} />
        </div>

        {formData.slug !== client.slug && (
          <Alert className="border-red-300 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Changing the slug will update the client's portal URL. Make sure to inform the client of the new URL.
            </AlertDescription>
          </Alert>
        )}
      </form>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full px-6"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={saving || (formData.slug !== client.slug && slugAvailable === false)}
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-semibold rounded-full px-6 hover:shadow-[#F2C94C]/25"
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
