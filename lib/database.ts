import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type {
  Client,
  PlatformSettings,
  Integration,
  ClientIntegration,
  ProjectTask,
  ChecklistItem,
  TaskCompletion,
  Feature,
  ClientFeature,
  KanbanWorkflow,
  ClientStage,
  ClientWithStage,
  KanbanActivity,
  ClientFollowUp,
  AnalyticsEvent,
  ClientJourneyAnalytics,
  ConversionTracking,
  IntegrationAdoptionMetrics,
  FeatureUsageStatistics,
  RevenueImpactTracking,
  ClientSatisfactionScore,
  AnalyticsOverview,
  FeedbackBoardCard,
  ClientFollowUpEmail,
} from "./types"
import { addDays, startOfDay, endOfDay, isWithinInterval, parseISO } from "date-fns"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
  )
}

const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

// Helper functions to convert between UI and database values
const convertCustomAppToDb = (uiValue: string): string => {
  // Accept both UI and DB values
  if (uiValue === "gray_label" || uiValue === "Gray Label") return "gray_label"
  if (uiValue === "white_label" || uiValue === "White Label") return "white_label"
  if (uiValue === "not_applicable" || uiValue === "Not Applicable") return "not_applicable"
  return "not_applicable"
}

const convertCustomAppFromDb = (dbValue: string): string => {
  const mapping: Record<string, string> = {
    gray_label: "Gray Label",
    white_label: "White Label",
    not_applicable: "Not Applicable",
  }
  return mapping[dbValue] || "Not Applicable"
}

const convertBillingTypeToDb = (uiValue: string): string => {
  return uiValue.toLowerCase()
}

const convertBillingTypeFromDb = (dbValue: string): string => {
  const mapping: Record<string, string> = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    annually: "Annually",
  }
  return mapping[dbValue] || "Monthly"
}

// Helper function to transform client data from database
function transformClientFromDb(data: any): Client {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    email: data.email || undefined,
    success_package: data.success_package,
    billing_type: data.billing_type,
    plan_type: data.plan_type,
    revenue_amount: data.revenue_amount,
    custom_app: data.custom_app,
    notes: data.notes || undefined,
    number_of_users: data.number_of_users,
    logo_url: data.logo_url || undefined,
    welcome_message: data.welcome_message || undefined,
    video_url: data.video_url || undefined,
    show_zapier_integrations: data.show_zapier_integrations,
    projects_enabled: data.projects_enabled,
    status: data.status,
    calls_scheduled: data.calls_scheduled || 0,
    calls_completed: data.calls_completed || 0,
    forms_setup: data.forms_setup || 0,
    smartdocs_setup: data.smartdocs_setup || 0,
    zapier_integrations_setup: data.zapier_integrations_setup || 0,
    migration_completed: data.migration_completed || false,
    slack_access_granted: data.slack_access_granted || false,
    project_completion_percentage: data.project_completion_percentage || 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
    // Milestone dates for each package type
    light_onboarding_call_date: data.light_onboarding_call_date || undefined,
    premium_first_call_date: data.premium_first_call_date || undefined,
    premium_second_call_date: data.premium_second_call_date || undefined,
    gold_first_call_date: data.gold_first_call_date || undefined,
    gold_second_call_date: data.gold_second_call_date || undefined,
    gold_third_call_date: data.gold_third_call_date || undefined,
    elite_configurations_started_date: data.elite_configurations_started_date || undefined,
    elite_integrations_started_date: data.elite_integrations_started_date || undefined,
    elite_verification_completed_date: data.elite_verification_completed_date || undefined,
    workflow_builder_enabled: data.workflow_builder_enabled || false,
    workflow: data.workflow || undefined,
    show_figma_workflow: data.show_figma_workflow || false,
    figma_workflow_url: data.figma_workflow_url || "",
    white_label_status: data.white_label_status,
    white_label_checklist: data.white_label_checklist,
    white_label_android_url: data.white_label_android_url,
    white_label_ios_url: data.white_label_ios_url,
    feedback_board_enabled: data.feedback_board_enabled || false,
    implementation_manager: data.implementation_manager || undefined,
    churned: data.churned || false,
    is_demo: data.is_demo || false,
    churn_risk: data.churn_risk || false,
    extra_call_dates: data.extra_call_dates || [],
    onboarding_email_sent: data.onboarding_email_sent ?? false,
    follow_up_email_sent: data.follow_up_email_sent ?? false,
    // NEW: white label app details
    white_label_app_name: data.white_label_app_name || null,
    white_label_app_description: data.white_label_app_description || null,
    white_label_app_assets: Array.isArray(data.white_label_app_assets)
      ? data.white_label_app_assets
      : (typeof data.white_label_app_assets === 'string' && data.white_label_app_assets
          ? JSON.parse(data.white_label_app_assets)
          : []),
    // NEW: white label approval workflow fields
    white_label_client_approval_status: data.white_label_client_approval_status || null,
    white_label_client_approval_at: data.white_label_client_approval_at || null,
    white_label_approval_requested_at: data.white_label_approval_requested_at || null,
    white_label_approval_notification_sent_at: data.white_label_approval_notification_sent_at || null,
    white_label_approval_feedback: data.white_label_approval_feedback || null,
    white_label_approval_feedback_at: data.white_label_approval_feedback_at || null,
    white_label_implementation_manager_notified_at: data.white_label_implementation_manager_notified_at || null,
    // Pinned note for project scope and go-live date
    pinned_note: data.pinned_note && typeof data.pinned_note === 'object' ? data.pinned_note : undefined,
  }
}

// Helper function to transform client data for database
const transformClientForDb = (clientData: any): any => {
  const transformed = { ...clientData }

  if (transformed.custom_app) {
    transformed.custom_app = convertCustomAppToDb(transformed.custom_app)
  }

  if (transformed.billing_type) {
    transformed.billing_type = convertBillingTypeToDb(transformed.billing_type)
  }

  if (typeof transformed.workflow_builder_enabled !== "undefined") {
    transformed.workflow_builder_enabled = !!transformed.workflow_builder_enabled
  }
  if (typeof transformed.show_figma_workflow !== "undefined") {
    transformed.show_figma_workflow = !!transformed.show_figma_workflow
  }
  if (typeof transformed.figma_workflow_url !== "undefined") {
    transformed.figma_workflow_url = transformed.figma_workflow_url
  }

  // Ensure white label fields are always included
  if (typeof clientData.white_label_status !== "undefined") {
    transformed.white_label_status = clientData.white_label_status
  }
  if (typeof clientData.white_label_checklist !== "undefined") {
    transformed.white_label_checklist = clientData.white_label_checklist
  }
  if (typeof clientData.white_label_android_url !== "undefined") {
    transformed.white_label_android_url = clientData.white_label_android_url
  }
  if (typeof clientData.white_label_ios_url !== "undefined") {
    transformed.white_label_ios_url = clientData.white_label_ios_url
  }

  // Handle graduation date
  if (typeof clientData.graduation_date !== "undefined") {
    // Convert empty string to null for DB compatibility
    transformed.graduation_date = clientData.graduation_date === "" ? null : clientData.graduation_date;
  }

  // Handle milestone date fields (convert empty string to null)
  const milestoneDateFields = [
    'light_onboarding_call_date',
    'premium_first_call_date',
    'premium_second_call_date',
    'gold_first_call_date',
    'gold_second_call_date',
    'gold_third_call_date',
    'elite_configurations_started_date',
    'elite_integrations_started_date',
    'elite_verification_completed_date',
  ];
  for (const field of milestoneDateFields) {
    if (typeof clientData[field] !== "undefined") {
      transformed[field] = clientData[field] === "" ? null : clientData[field];
    }
  }

  if (typeof clientData.churned !== "undefined") {
    transformed.churned = !!clientData.churned
  }

  if (typeof clientData.is_demo !== "undefined") {
    transformed.is_demo = !!clientData.is_demo
  }

  if (typeof clientData.churn_risk !== "undefined") {
    transformed.churn_risk = !!clientData.churn_risk
  }

  // Handle extra_call_dates (array of strings)
  if (typeof clientData.extra_call_dates !== "undefined") {
    transformed.extra_call_dates = Array.isArray(clientData.extra_call_dates)
      ? clientData.extra_call_dates
      : [];
  }

  if (typeof clientData.onboarding_email_sent !== "undefined") {
    transformed.onboarding_email_sent = !!clientData.onboarding_email_sent;
  }

  return transformed
}

// Export the createClient function that the form component expects
export async function createClient(formData: any): Promise<Client> {
  try {
    // Map form data to database schema with required fields
    const clientData = {
      name: formData.name,
      slug: formData.slug,
      email: formData.email || null,
      success_package: formData.success_package,
      billing_type: convertBillingTypeToDb(formData.billing_type),
      number_of_users: formData.number_of_users,
      logo_url: formData.logo_url || null,
      welcome_message: formData.welcome_message || null,
      video_url: formData.video_url || null,
      show_zapier_integrations: formData.show_zapier_integrations || false,
      projects_enabled: formData.projects_enabled !== false,
      status: formData.status || "active",
      // Required fields with defaults
      plan_type: formData.plan_type || "pro", // Use form data or default to pro
      revenue_amount: typeof formData.revenue_amount !== "undefined" ? Number(formData.revenue_amount) : 0,
      custom_app: convertCustomAppToDb(formData.custom_app || "Not Applicable"),
      notes: null, // Optional notes
      // Initialize project tracking fields
      calls_scheduled: 0,
      calls_completed: 0,
      forms_setup: 0,
      smartdocs_setup: 0,
      zapier_integrations_setup: 0,
      migration_completed: false,
      slack_access_granted: false,
      project_completion_percentage: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      workflow_builder_enabled: formData.workflow_builder_enabled || false,
      show_figma_workflow: formData.show_figma_workflow || false,
      figma_workflow_url: formData.figma_workflow_url || "",
      implementation_manager: formData.implementation_manager || undefined,
      onboarding_email_sent: typeof formData.onboarding_email_sent !== "undefined" ? formData.onboarding_email_sent : false,
      follow_up_email_sent: typeof formData.follow_up_email_sent !== "undefined" ? formData.follow_up_email_sent : false,
    }

    const { data, error } = await supabase.from("clients").insert([clientData]).select().single()

    if (error) {
      console.error("Error creating client:", error)
      throw new Error(`Failed to create client: ${error.message}`)
    }

    // Automatically create a client_stages record for the new client
    const clientId = data.id
    const initialStage = {
      client_id: clientId,
      current_stage: "new",
      stage_order: 1,
    }
    const { error: stageError } = await supabase.from("client_stages").insert([initialStage])
    if (stageError) {
      console.error("Error creating client_stages record:", stageError)
      // Optionally, you could throw here or just log
    }

    return transformClientFromDb(data)
  } catch (error) {
    console.error("Error in createClient:", error)
    throw error
  }
}

export async function getAllClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching clients:", error)
      return []
    }

    return (data || []).map(transformClientFromDb)
  } catch (error) {
    console.error("Error in getAllClients:", error)
    return []
  }
}

export async function getClients(): Promise<Client[]> {
  return getAllClients()
}

export async function getClient(identifier: string): Promise<Client | null> {
  try {
    let query = supabase.from("clients").select("*")

    // Check if identifier looks like a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)

    if (isUUID) {
      query = query.eq("id", identifier)
    } else {
      query = query.eq("slug", identifier)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // No rows returned
      }
      throw error
    }

    return transformClientFromDb(data)
  } catch (error) {
    console.error("Error fetching client:", error)
    return null
  }
}

export async function getClientBySlug(slug: string): Promise<Client | null> {
  try {
    // Force fresh data by adding a cache-busting parameter
    const { data, error } = await supabase
      .from("clients")
      .select(`*, white_label_app_name, white_label_app_description, white_label_app_assets`)
      .eq("slug", slug)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // No rows returned
      }
      console.error("Error fetching client:", error)
      return null
    }

    console.log('Fresh client data from DB:', {
      id: data.id,
      name: data.name,
      assets: data.white_label_app_assets
    });

    return transformClientFromDb(data)
  } catch (error) {
    console.error("Error in getClientBySlug:", error)
    return null
  }
}

export async function getClientById(id: string): Promise<Client | null> {
  try {
    // Validate UUID format before querying
    if (!id || id === "undefined" || typeof id !== "string") {
      console.error("Invalid client ID provided:", id)
      return null
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      console.error("Client ID is not a valid UUID:", id)
      return null
    }

    const { data, error } = await supabase.from("clients").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      throw error
    }

    return transformClientFromDb(data)
  } catch (error) {
    console.error("Error fetching client by ID:", error)
    throw error
  }
}

export async function addClient(clientData: Partial<Client>): Promise<Client | null> {
  try {
    const transformedData = transformClientForDb(clientData)
    const { data, error } = await supabase.from("clients").insert([transformedData]).select().single()

    if (error) {
      console.error("Error adding client:", error)
      return null
    }

    return transformClientFromDb(data)
  } catch (error) {
    console.error("Error in addClient:", error)
    return null
  }
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
  try {
    const transformedUpdates = transformClientForDb(updates)
    console.log('Updating client', id, 'with', transformedUpdates)
    const { data, error } = await supabase.from("clients").update(transformedUpdates).eq("id", id).select("*").single()
    console.log('Supabase update response:', { data, error })
    // Debug: Directly select the row after update
    const { data: selectData, error: selectError } = await supabase.from("clients").select("*").eq("id", id).single()
    console.log('Direct select after update:', { selectData, selectError })
    if (error) {
      console.error("Error updating client:", error)
      return null
    }
    return transformClientFromDb(data)
  } catch (error) {
    console.error("Error in updateClient:", error)
    return null
  }
}

export async function deleteClient(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("clients").delete().eq("id", id)

    if (error) {
      console.error("Error deleting client:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteClient:", error)
    return false
  }
}

export async function isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  try {
    let query = supabase.from("clients").select("id").eq("slug", slug)

    if (excludeId) {
      query = query.neq("id", excludeId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error checking slug availability:", error)
      throw new Error(`Failed to check slug availability: ${error.message}`)
    }

    return data.length === 0
  } catch (error) {
    console.error("Error in isSlugAvailability:", error)
    throw error
  }
}

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  return isSlugAvailable(slug)
}

export async function getClientStats() {
  try {
    const { data, error } = await supabase.from("clients").select("success_package, status")

    if (error) {
      console.error("Error fetching client stats:", error)
      throw new Error(`Failed to fetch client statistics: ${error.message}`)
    }

    const stats = {
      total: data.length,
      active: data.filter((c) => c.status === "active").length,
      premium: data.filter((c) => c.success_package === "premium").length,
      gold: data.filter((c) => c.success_package === "gold").length,
      elite: data.filter((c) => c.success_package === "elite").length,
      light: data.filter((c) => c.success_package === "light").length,
      starter: data.filter((c) => c.success_package === "starter").length,
      professional: data.filter((c) => c.success_package === "professional").length,
      enterprise: data.filter((c) => c.success_package === "enterprise").length,
      draft: data.filter((c) => c.status === "draft").length,
    }

    return stats
  } catch (error) {
    console.error("Error in getClientStats:", error)
    throw error
  }
}

// Robust checklist functions that handle schema issues gracefully
export async function getClientChecklist(clientId: string): Promise<ChecklistItem[]> {
  try {
    // Try to query the table and handle any schema issues
    const { data, error } = await supabase
      .from("client_checklists")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at")

    if (error) {
      console.error("Database error in getClientChecklist:", error)
      // Return empty array for any database errors
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching client checklist:", error)
    return []
  }
}

export async function getClientChecklists(clientId: string): Promise<ChecklistItem[]> {
  return getClientChecklist(clientId)
}

export async function updateChecklistItem(itemId: string, isCompleted: boolean): Promise<void> {
  try {
    const updates: any = {
      is_completed: isCompleted,
      updated_at: new Date().toISOString(),
    }

    if (isCompleted) {
      updates.completed_at = new Date().toISOString()
    } else {
      updates.completed_at = null
    }

    const { error } = await supabase.from("client_checklists").update(updates).eq("id", itemId)

    if (error) {
      console.error("Database error in updateChecklistItem:", error)
      throw error
    }
  } catch (error) {
    console.error("Error updating checklist item:", error)
    throw error
  }
}

export async function createChecklistItem(
  clientId: string,
  title: string,
  isCompleted = false,
  clientName?: string,
  clientEmail?: string,
): Promise<ChecklistItem> {
  try {
    // If clientName or clientEmail is not provided, try to get it from the database
    let finalClientName = clientName
    let finalClientEmail = clientEmail

    if (!finalClientName || !finalClientEmail) {
      const client = await getClientById(clientId)
      finalClientName = finalClientName || client?.name || "Unknown Client"
      finalClientEmail = finalClientEmail || client?.email || undefined
    }

    const itemData = {
      client_id: clientId,
      client_name: finalClientName,
      client_email: finalClientEmail,
      title: title,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    }

    const { data, error } = await supabase.from("client_checklists").insert([itemData]).select("*").single()

    if (error) {
      console.error("Database error in createChecklistItem:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error creating checklist item:", error)
    throw error
  }
}

export async function addChecklistItem(
  item: Omit<ChecklistItem, "id" | "created_at" | "updated_at">,
): Promise<ChecklistItem> {
  const { data, error } = await supabase.from("client_checklists").insert([item]).select().single()

  if (error) {
    console.error("Error adding checklist item:", error)
    throw error
  }

  return data
}

export async function deleteChecklistItem(id: string): Promise<void> {
  const { error } = await supabase.from("client_checklists").delete().eq("id", id)

  if (error) {
    console.error("Error deleting checklist item:", error)
    throw error
  }
}

// Enhanced Task Completion Functions for Webhook Integration
export async function getTaskCompletions(clientId: string): Promise<Record<string, boolean>> {
  try {
    const response = await supabase.from("task_completions").select("task_id, is_completed").eq("client_id", clientId)

    const { data, error } = response

    if (error) {
      console.error("Error fetching task completions:", error)
      return {}
    }

    // Convert array to object for easy lookup
    const completions: Record<string, boolean> = {}
    data?.forEach((item) => {
      completions[item.task_id] = item.is_completed
    })

    return completions
  } catch (error) {
    console.error("Error in getTaskCompletions:", error)
    return {}
  }
}

export async function updateTaskCompletion(
  clientId: string,
  taskId: string,
  isCompleted: boolean,
  taskTitle?: string,
): Promise<TaskCompletion> {
  try {
    const completedAt = isCompleted ? new Date().toISOString() : null

    // Get client information for webhook data
    const client = await getClientById(clientId)

    // Use upsert to handle both insert and update cases
    const response = await supabase
      .from("task_completions")
      .upsert(
        {
          client_id: clientId,
          client_name: client?.name || "Unknown Client",
          client_email: client?.email || null,
          task_id: taskId,
          task_title: taskTitle || taskId, // Use taskId as fallback if no title provided
          is_completed: isCompleted,
          completed_at: completedAt,
          updated_at: new Date().toISOString(),
          // Reset webhook status when completion changes
          webhook_sent: false,
          webhook_sent_at: null,
        },
        {
          onConflict: "client_id,task_id",
        },
      )
      .select()
      .single()

    const { data, error } = response

    if (error) {
      console.error("Error updating task completion:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in updateTaskCompletion:", error)
    throw error
  }
}

export async function getTaskCompletion(clientId: string, taskId: string): Promise<boolean> {
  try {
    const response = await supabase
      .from("task_completions")
      .select("is_completed")
      .eq("client_id", clientId)
      .eq("task_id", taskId)
      .single()

    const { data, error } = response

    if (error) {
      if (error.code === "PGRST116") {
        return false // No record found, default to incomplete
      }
      console.error("Error fetching task completion:", error)
      return false
    }

    return data?.is_completed || false
  } catch (error) {
    console.error("Error in getTaskCompletion:", error)
    return false
  }
}

export async function getPendingWebhooks(): Promise<TaskCompletion[]> {
  try {
    const { data, error } = await supabase
      .from("task_completions")
      .select("*")
      .eq("is_completed", true)
      .or("webhook_sent.is.null,webhook_sent.eq.false")
      .order("completed_at", { ascending: true })

    if (error) {
      console.error("Error fetching pending webhooks:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getPendingWebhooks:", error)
    return []
  }
}

export async function markWebhookSent(taskCompletionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("task_completions")
      .update({
        webhook_sent: true,
        webhook_sent_at: new Date().toISOString(),
      })
      .eq("id", taskCompletionId)

    if (error) {
      console.error("Error marking webhook as sent:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in markWebhookSent:", error)
    throw error
  }
}

export async function getWebhookData(clientId?: string): Promise<TaskCompletion[]> {
  try {
    let query = supabase.from("task_completions").select("*").eq("is_completed", true)

    if (clientId) {
      query = query.eq("client_id", clientId)
    }

    const { data, error } = await query.order("completed_at", { ascending: false })

    if (error) {
      console.error("Error fetching webhook data:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getWebhookData:", error)
    return []
  }
}

// Helper function to count completed calls based on call dates
export function countCompletedCalls(client: Client): number {
  let completedCalls = 0
  
  // Count based on package type and call dates
  if (client.success_package === 'light') {
    if (client.light_onboarding_call_date) completedCalls++
  } else if (client.success_package === 'premium') {
    if (client.premium_first_call_date) completedCalls++
    if (client.premium_second_call_date) completedCalls++
  } else if (client.success_package === 'gold') {
    if (client.gold_first_call_date) completedCalls++
    if (client.gold_second_call_date) completedCalls++
    if (client.gold_third_call_date) completedCalls++
  } else if (client.success_package === 'elite') {
    // For elite, count all call dates that exist
    if (client.light_onboarding_call_date) completedCalls++
    if (client.premium_first_call_date) completedCalls++
    if (client.premium_second_call_date) completedCalls++
    if (client.gold_first_call_date) completedCalls++
    if (client.gold_second_call_date) completedCalls++
    if (client.gold_third_call_date) completedCalls++
  } else if (client.success_package === 'starter') {
    if (client.light_onboarding_call_date) completedCalls++
  } else if (client.success_package === 'professional') {
    if (client.premium_first_call_date) completedCalls++
    if (client.premium_second_call_date) completedCalls++
    if (client.gold_first_call_date) completedCalls++
  } else if (client.success_package === 'enterprise') {
    // For enterprise, count all call dates that exist
    if (client.light_onboarding_call_date) completedCalls++
    if (client.premium_first_call_date) completedCalls++
    if (client.premium_second_call_date) completedCalls++
    if (client.gold_first_call_date) completedCalls++
    if (client.gold_second_call_date) completedCalls++
    if (client.gold_third_call_date) completedCalls++
  }
  
  // Also count any extra call dates
  if (client.extra_call_dates && Array.isArray(client.extra_call_dates)) {
    completedCalls += client.extra_call_dates.length
  }
  
  return completedCalls
}

// Helper function to get scheduled calls based on package type
export function getScheduledCallsForPackage(packageType: string): number {
  const packageLimits: Record<string, number> = {
    light: 1,
    premium: 2,
    gold: 3,
    elite: 10, // Set to 10 for backend data as requested
    starter: 1,
    professional: 3,
    enterprise: 10, // Set to 10 for backend data as requested
  }
  
  return packageLimits[packageType] || 2 // Default to premium (2 calls)
}

export async function updateProjectTracking(clientId: string, tracking: any): Promise<Client> {
  try {
    // Get the current client data to calculate completed calls
    const client = await getClientById(clientId)
    if (!client) {
      throw new Error("Client not found")
    }
    
    // Calculate completed calls based on call dates
    const completedCalls = countCompletedCalls(client)
    
    // Calculate scheduled calls based on package type
    const scheduledCalls = getScheduledCallsForPackage(client.success_package)
    
    const { data, error } = await supabase
      .from("clients")
      .update({
        calls_scheduled: scheduledCalls, // Use calculated value instead of manual input
        calls_completed: completedCalls, // Use calculated value instead of manual input
        forms_setup: tracking.forms_setup,
        smartdocs_setup: tracking.smartdocs_setup,
        zapier_integrations_setup: tracking.zapier_integrations_setup,
        migration_completed: tracking.migration_completed,
        slack_access_granted: tracking.slack_access_granted,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId)
      .select()
      .single()

    if (error) throw error

    return transformClientFromDb(data)
  } catch (error) {
    console.error("Error updating project tracking:", error)
    throw error
  }
}

export async function calculateProjectCompletion(clientId: string): Promise<void> {
  try {
    const client = await getClientById(clientId)
    if (!client) return

    // Calculate completion based on package limits
    const limits = {
      light: { calls: 1, forms: 0, zapier: 0, migration: false, slack: false },
      premium: { calls: 2, forms: 2, zapier: 1, migration: false, slack: false },
      gold: { calls: 3, forms: 4, zapier: 2, migration: false, slack: false },
      elite: { calls: 999, forms: 999, zapier: 999, migration: true, slack: true },
      starter: { calls: 1, forms: 1, zapier: 0, migration: false, slack: false },
      professional: { calls: 3, forms: 5, zapier: 3, migration: false, slack: true },
      enterprise: { calls: 999, forms: 999, zapier: 999, migration: true, slack: true },
    }

    const packageLimits = limits[client.success_package] || limits.premium
    let totalTasks = 0
    let completedTasks = 0

    // Count calls
    if (packageLimits.calls > 0) {
      totalTasks += packageLimits.calls === 999 ? client.calls_scheduled : packageLimits.calls
      completedTasks += Math.min(
        client.calls_completed,
        packageLimits.calls === 999 ? client.calls_scheduled : packageLimits.calls,
      )
    }

    // Count forms and smartdocs
    if (packageLimits.forms > 0) {
      totalTasks += packageLimits.forms * 2 // forms + smartdocs
      completedTasks += Math.min(client.forms_setup + client.smartdocs_setup, packageLimits.forms * 2)
    }

    // Count zapier integrations
    if (packageLimits.zapier > 0) {
      totalTasks += packageLimits.zapier === 999 ? Math.max(client.zapier_integrations_setup, 1) : packageLimits.zapier
      completedTasks += Math.min(
        client.zapier_integrations_setup,
        packageLimits.zapier === 999 ? Math.max(client.zapier_integrations_setup, 1) : packageLimits.zapier,
      )
    }

    // Count elite features
    if (packageLimits.migration) {
      totalTasks += 1
      if (client.migration_completed) completedTasks += 1
    }

    if (packageLimits.slack) {
      totalTasks += 1
      if (client.slack_access_granted) completedTasks += 1
    }

    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    await supabase.from("clients").update({ project_completion_percentage: percentage }).eq("id", clientId)
  } catch (error) {
    console.error("Error calculating project completion:", error)
    throw error
  }
}

// Integration functions
export async function getMasterIntegrations(): Promise<Integration[]> {
  try {
    const { data, error } = await supabase
      .from("integrations")
      .select("*")
      .eq("is_active", true)
      .order("category")
      .order("title")

    if (error) {
      if (error.code === "42P01") {
        return []
      }
      throw error
    }

    return (data || []).map((integration: any) => ({
      id: integration.id,
      title: integration.title || "Unknown Integration",
      description: integration.description || "",
      category: integration.category || "General",
      integration_type: integration.integration_type || "zapier",
      external_url: integration.external_url || integration.url || "",
      documentation_url: integration.documentation_url || "",
      icon_url: integration.icon_url || "",
      icon_name: integration.icon_name || "",
      tags: integration.tags || [],
      is_active: integration.is_active !== false,
      created_at: integration.created_at || "",
      updated_at: integration.updated_at || "",
    }))
  } catch (error) {
    console.error("Error fetching master integrations:", error)
    return []
  }
}

export async function getIntegrations(): Promise<Integration[]> {
  return getMasterIntegrations()
}

export async function getAllIntegrations(): Promise<Integration[]> {
  try {
    const { data, error } = await supabase.from("integrations").select("*").order("category").order("title")

    if (error) {
      if (error.code === "42P01") {
        return []
      }
      throw error
    }

    return (data || []).map((integration: any) => ({
      id: integration.id,
      title: integration.title || "Unknown Integration",
      description: integration.description || "",
      category: integration.category || "General",
      integration_type: integration.integration_type || "zapier",
      external_url: integration.external_url || integration.url || "",
      documentation_url: integration.documentation_url || "",
      icon_url: integration.icon_url || "",
      icon_name: integration.icon_name || "",
      tags: integration.tags || [],
      is_active: integration.is_active !== false,
      created_at: integration.created_at || "",
      updated_at: integration.updated_at || "",
    }))
  } catch (error) {
    console.error("Error fetching all integrations:", error)
    return []
  }
}

export async function getClientIntegrations(clientId: string): Promise<ClientIntegration[]> {
  try {
    if (!clientId || clientId === "undefined") {
      console.error("Invalid client ID provided to getClientIntegrations")
      return []
    }

    const { data, error } = await supabase
      .from("client_integrations")
      .select(`
        *,
        integration:integrations(*)
      `)
      .eq("client_id", clientId)
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("Error fetching client integrations:", error)
      return []
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      client_id: item.client_id,
      integration_id: item.integration_id,
      is_enabled: item.is_enabled,
      is_featured: item.is_featured,
      sort_order: item.sort_order,
      title: item.integration?.title || "Unknown Integration",
      description: item.integration?.description || "",
      category: item.integration?.category || "General",
      integration_type: item.integration?.integration_type || "zapier",
      external_url: item.integration?.external_url || "",
      documentation_url: item.integration?.documentation_url || "",
      created_at: item.created_at,
      updated_at: item.updated_at,
      integration: item.integration,
    }))
  } catch (error) {
    console.error("Error in getClientIntegrations:", error)
    return []
  }
}

export async function addIntegrationToClient(
  clientId: string,
  integrationId: string,
  options: {
    is_featured?: boolean
    sort_order?: number
    is_enabled?: boolean
  } = {},
): Promise<ClientIntegration> {
  try {
    // Validate inputs
    if (!clientId || clientId === "undefined" || !integrationId || integrationId === "undefined") {
      throw new Error("Invalid clientId or integrationId")
    }

    // First check if the integration already exists for this client
    const { data: existing, error: checkError } = await supabase
      .from("client_integrations")
      .select("id")
      .eq("client_id", clientId)
      .eq("integration_id", integrationId)
      .maybeSingle()

    if (existing) {
      throw new Error("Integration already exists for this client")
    }

    // Insert the new client integration
    const insertData = {
      client_id: clientId,
      integration_id: integrationId,
      is_featured: options.is_featured || false,
      sort_order: options.sort_order || 1,
      is_enabled: options.is_enabled !== false, // Default to true
    }

    const { data, error } = await supabase
      .from("client_integrations")
      .insert(insertData)
      .select(`
        id,
        client_id,
        integration_id,
        is_featured,
        is_enabled,
        sort_order,
        created_at,
        updated_at
      `)
      .single()

    if (error) throw error

    // Get the integration details separately to avoid column issues
    const { data: integration, error: integrationError } = await supabase
      .from("integrations")
      .select("*")
      .eq("id", integrationId)
      .single()

    if (integrationError) throw integrationError

    return {
      id: data.id,
      client_id: data.client_id,
      integration_id: data.integration_id,
      is_featured: data.is_featured,
      is_enabled: data.is_enabled,
      sort_order: data.sort_order,
      created_at: data.created_at,
      updated_at: data.updated_at,
      title: integration.title || "Unknown Integration",
      description: integration.description || "",
      category: integration.category || "General",
      integration_type: integration.integration_type || "zapier",
      external_url: integration.external_url || "",
      documentation_url: integration.documentation_url || "",
      integration: {
        id: integration.id,
        title: integration.title || "Unknown Integration",
        description: integration.description || "",
        category: integration.category || "General",
        integration_type: integration.integration_type || "zapier",
        external_url: integration.external_url || integration.url || "",
        documentation_url: integration.documentation_url || "",
        icon_url: integration.icon_url || "",
        is_active: integration.is_active !== false,
        created_at: integration.created_at || "",
        updated_at: integration.updated_at || "",
      },
    }
  } catch (error) {
    console.error("Error adding integration to client:", error)
    throw error
  }
}

export async function addClientIntegration(
  clientIntegration: Omit<ClientIntegration, "id" | "created_at" | "updated_at">,
): Promise<ClientIntegration> {
  const { data, error } = await supabase.from("client_integrations").insert([clientIntegration]).select().single()

  if (error) {
    console.error("Error adding client integration:", error)
    throw error
  }

  return data
}

export async function removeIntegrationFromClient(clientIntegrationId: string): Promise<void> {
  try {
    const { error } = await supabase.from("client_integrations").delete().eq("id", clientIntegrationId)

    if (error) throw error
  } catch (error) {
    console.error("Error removing integration from client:", error)
    throw error
  }
}

export async function updateClientIntegration(
  clientIntegrationId: string,
  updates: {
    is_featured?: boolean
    sort_order?: number
    is_enabled?: boolean
  },
): Promise<ClientIntegration> {
  try {
    const { data, error } = await supabase
      .from("client_integrations")
      .update(updates)
      .eq("id", clientIntegrationId)
      .select(`
        id,
        client_id,
        integration_id,
        is_featured,
        is_enabled,
        sort_order,
        created_at,
        updated_at
      `)
      .single()

    if (error) throw error

    // Get the integration details separately
    const { data: integration, error: integrationError } = await supabase
      .from("integrations")
      .select("*")
      .eq("id", data.integration_id)
      .single()

    if (integrationError) throw integrationError

    return {
      id: data.id,
      client_id: data.client_id,
      integration_id: data.integration_id,
      is_featured: data.is_featured,
      is_enabled: data.is_enabled,
      sort_order: data.sort_order,
      created_at: data.created_at,
      updated_at: data.updated_at,
      title: integration.title || "Unknown Integration",
      description: integration.description || "",
      category: integration.category || "General",
      integration_type: integration.integration_type || "zapier",
      external_url: integration.external_url || "",
      documentation_url: integration.documentation_url || "",
      integration: {
        id: integration.id,
        title: integration.title || "Unknown Integration",
        description: integration.description || "",
        category: integration.category || "General",
        integration_type: integration.integration_type || "zapier",
        external_url: integration.external_url || integration.url || "",
        documentation_url: integration.documentation_url || "",
        icon_url: integration.icon_url || "",
        is_active: integration.is_active !== false,
        created_at: integration.created_at || "",
        updated_at: integration.updated_at || "",
      },
    }
  } catch (error) {
    console.error("Error updating client integration:", error)
    throw error
  }
}

export async function deleteClientIntegration(clientIntegrationId: string): Promise<void> {
  return removeIntegrationFromClient(clientIntegrationId)
}

// Project tracking functions
export async function getProjectTasks(clientId: string): Promise<ProjectTask[]> {
  const { data, error } = await supabase
    .from("project_tasks")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching project tasks:", error)
    throw error
  }

  return data || []
}

export async function createProjectTask(
  task: Omit<ProjectTask, "id" | "created_at" | "updated_at">,
): Promise<ProjectTask> {
  const { data, error } = await supabase.from("project_tasks").insert([task]).select().single()

  if (error) {
    console.error("Error creating project task:", error)
    throw error
  }

  return data
}

export async function addProjectTask(
  task: Omit<ProjectTask, "id" | "created_at" | "updated_at">,
): Promise<ProjectTask> {
  return createProjectTask(task)
}

export async function updateProjectTask(id: string, updates: Partial<ProjectTask>): Promise<ProjectTask> {
  const { data, error } = await supabase
    .from("project_tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating project task:", error)
    throw error
  }

  return data
}

export async function deleteProjectTask(id: string): Promise<void> {
  const { error } = await supabase.from("project_tasks").delete().eq("id", id)

  if (error) {
    console.error("Error deleting project task:", error)
    throw error
  }
}

// Dashboard stats
export async function getDashboardStats() {
  try {
    const [clientsResult, integrationsResult, tasksResult] = await Promise.all([
      supabase.from("clients").select("status"),
      supabase.from("client_integrations").select("status"),
      supabase.from("project_tasks").select("status"),
    ])

    const clients = clientsResult.data || []
    const integrations = integrationsResult.data || []
    const tasks = tasksResult.data || []

    return {
      totalClients: clients.length,
      activeClients: clients.filter((c) => c.status === "active").length,
      pendingClients: clients.filter((c) => c.status === "pending").length,
      totalIntegrations: integrations.length,
      completedIntegrations: integrations.filter((i) => i.status === "completed").length,
      pendingIntegrations: integrations.filter((i) => i.status === "pending").length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      pendingTasks: tasks.filter((t) => t.status === "pending").length,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    throw error
  }
}

// Settings functions
export async function getSettings(): Promise<PlatformSettings | null> {
  try {
    const { data, error } = await supabase.from("platform_settings").select("*").single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // No settings found
      }
      console.error("Error fetching settings:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in getSettings:", error)
    return null
  }
}

export async function getPlatformSettings(): Promise<PlatformSettings | null> {
  return getSettings()
}

export async function updateSettings(settings: PlatformSettings): Promise<PlatformSettings> {
  try {
    const { data: existingData } = await supabase.from("platform_settings").select("id").single()

    if (existingData) {
      // Update existing settings
      const { data, error } = await supabase
        .from("platform_settings")
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq("id", existingData.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating settings:", error)
        throw error
      }

      return data
    } else {
      // Create new settings
      const { data, error } = await supabase.from("platform_settings").insert([settings]).select().single()

      if (error) {
        console.error("Error creating settings:", error)
        throw error
      }

      return data
    }
  } catch (error) {
    console.error("Error in updateSettings:", error)
    throw error
  }
}

export async function updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
  return updateSettings(settings as PlatformSettings)
}

export async function testEmailConnection(settings: PlatformSettings): Promise<boolean> {
  try {
    // This would typically test the SMTP connection
    // For now, we'll simulate a test based on whether required fields are filled
    return !!(settings.smtp_host && settings.smtp_username && settings.smtp_password)
  } catch (error) {
    console.error("Error testing email connection:", error)
    return false
  }
}

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("clients").select("count").limit(1)

    return !error
  } catch (error) {
    console.error("Error testing database connection:", error)
    return false
  }
}

export async function createIntegration(
  integrationData: Omit<Integration, "id" | "created_at" | "updated_at">,
): Promise<Integration> {
  try {
    // Prepare data for insertion, ensuring both url and external_url are set
    const insertData = {
      ...integrationData,
      url: integrationData.external_url, // Set both fields to the same value
      external_url: integrationData.external_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("integrations").insert([insertData]).select().single()

    if (error) throw error

    return {
      id: data.id,
      title: data.title || "Unknown Integration",
      description: data.description || "",
      category: data.category || "General",
      integration_type: data.integration_type || "zapier",
      external_url: data.external_url || data.url || "",
      documentation_url: data.documentation_url || "",
      icon_url: data.icon_url || "",
      icon_name: data.icon_name || "",
      tags: data.tags || [],
      is_active: data.is_active !== false,
      created_at: data.created_at || "",
      updated_at: data.updated_at || "",
    }
  } catch (error) {
    console.error("Error creating integration:", error)
    throw error
  }
}

export async function addIntegration(
  integration: Omit<Integration, "id" | "created_at" | "updated_at">,
): Promise<Integration> {
  return createIntegration(integration)
}

export async function updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration> {
  try {
    // Remove id from updates and ensure proper field mapping
    const { id: _, ...updateData } = updates as any

    // Ensure both url and external_url are updated
    if (updateData.external_url) {
      updateData.url = updateData.external_url
    }

    const { data, error } = await supabase
      .from("integrations")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      title: data.title || "Unknown Integration",
      description: data.description || "",
      category: data.category || "General",
      integration_type: data.integration_type || "zapier",
      external_url: data.external_url || data.url || "",
      documentation_url: data.documentation_url || "",
      icon_url: data.icon_url || "",
      icon_name: data.icon_name || "",
      tags: data.tags || [],
      is_active: data.is_active !== false,
      created_at: data.created_at || "",
      updated_at: data.updated_at || "",
    }
  } catch (error) {
    console.error("Error updating integration:", error)
    throw error
  }
}

export async function deleteIntegration(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("integrations").delete().eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting integration:", error)
    throw error
  }
}

export async function createClientIntegration(
  clientId: string,
  integrationId: string,
  options: {
    is_featured?: boolean
    sort_order?: number
    is_enabled?: boolean
  } = {},
): Promise<ClientIntegration> {
  return addIntegrationToClient(clientId, integrationId, options)
}

// Features functions
export async function getAllFeatures(): Promise<Feature[]> {
  try {
    const { data, error } = await supabase.from("features").select("*").order("category").order("title")

    if (error) {
      if (error.code === "42P01") {
        return []
      }
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error fetching all features:", error)
    return []
  }
}

export async function getFeatureById(id: string): Promise<Feature | null> {
  const { data, error } = await supabase.from("features").select("*").eq("id", id).single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    console.error("Error fetching feature:", error)
    throw error
  }

  return data
}

export async function createFeature(featureData: Omit<Feature, "id" | "created_at" | "updated_at">): Promise<Feature> {
  try {
    const insertData = {
      ...featureData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("features").insert([insertData]).select().single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error creating feature:", error)
    throw error
  }
}

export async function addFeature(feature: Omit<Feature, "id" | "created_at" | "updated_at">): Promise<Feature> {
  return createFeature(feature)
}

export async function updateFeature(id: string, updates: Partial<Feature>): Promise<Feature> {
  try {
    const { data, error } = await supabase
      .from("features")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error updating feature:", error)
    throw error
  }
}

export async function deleteFeature(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("features").delete().eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting feature:", error)
    throw error
  }
}

// Client Features functions
export async function getClientFeatures(clientId: string): Promise<ClientFeature[]> {
  try {
    const { data, error } = await supabase
      .from("client_features")
      .select(`
        *,
        feature:features(*)
      `)
      .eq("client_id", clientId)
      .order("proposed_date", { ascending: false })

    if (error) {
      console.error("Error fetching client features:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getClientFeatures:", error)
    return []
  }
}

export async function proposeFeatureToClient(
  clientId: string,
  featureId: string,
  salesPerson: string,
  customNotes?: string,
): Promise<ClientFeature> {
  try {
    const insertData = {
      client_id: clientId,
      feature_id: featureId,
      status: "proposed",
      sales_person: salesPerson,
      custom_notes: customNotes,
      proposed_date: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("client_features").insert([insertData]).select().single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error proposing feature to client:", error)
    throw error
  }
}

export async function updateClientFeature(
  clientFeatureId: string,
  updates: Partial<ClientFeature>,
): Promise<ClientFeature> {
  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    // Set appropriate timestamps based on status
    if (updates.status === "approved" && !updates.approved_date) {
      updateData.approved_date = new Date().toISOString()
    }
    if (updates.status === "implementing" && !updates.implementation_date) {
      updateData.implementation_date = new Date().toISOString()
    }
    if (updates.status === "completed" && !updates.completed_date) {
      updateData.completed_date = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("client_features")
      .update(updateData)
      .eq("id", clientFeatureId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error updating client feature:", error)
    throw error
  }
}

export async function deleteClientFeature(id: string): Promise<void> {
  const { error } = await supabase.from("client_features").delete().eq("id", id)

  if (error) {
    console.error("Error deleting client feature:", error)
    throw error
  }
}

export async function getClientFeaturesForPortal(clientId: string): Promise<ClientFeature[]> {
  try {
    const { data, error } = await supabase
      .from("client_features")
      .select(`
        *,
        feature:features(*)
      `)
      .eq("client_id", clientId)
      .eq("is_enabled", true)
      .not("status", "eq", "declined")
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("Error fetching client features for portal:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getClientFeaturesForPortal:", error)
    return []
  }
}

// Kanban Board Functions
export async function getKanbanWorkflows(successPackage?: string): Promise<KanbanWorkflow[]> {
  let query = supabase
    .from("kanban_workflows")
    .select("*")
    .order("stage_order", { ascending: true })

  if (successPackage) {
    query = query.eq("success_package", successPackage)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching kanban workflows:", error)
    throw error
  }

  return data || []
}

export async function getClientStage(clientId: string): Promise<ClientStage | null> {
  const { data, error } = await supabase
    .from("client_stages")
    .select("*")
    .eq("client_id", clientId)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching client stage:", error)
    throw error
  }

  return data
}

export async function updateClientStage(clientId: string, stageData: Partial<ClientStage>): Promise<ClientStage> {
  const { data, error } = await supabase
    .from("client_stages")
    .upsert(
      {
        client_id: clientId,
        ...stageData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "client_id" }
    )
    .select()
    .single()

  if (error) {
    console.error("Error updating client stage:", error)
    throw error
  }

  return data
}

export async function moveClientToStage(clientId: string, newStage: string, notes?: string): Promise<void> {
  const workflows = await getKanbanWorkflows()
  const client = await getClientById(clientId)
  
  if (!client) {
    throw new Error("Client not found")
  }

  const workflow = workflows.find(w => w.success_package === client.success_package && w.stage_key === newStage)
  
  if (!workflow) {
    throw new Error(`Invalid stage ${newStage} for package ${client.success_package}`)
  }

  // Get the current stage
  const currentStage = await getClientStage(clientId)

  // Update the client stage
  await updateClientStage(clientId, {
    current_stage: newStage,
    stage_order: workflow.stage_order,
    stage_started_at: new Date().toISOString(),
    stage_notes: notes,
  })

  // If moving to graduation, mark the previous stage as completed
  if (newStage === "graduation") {
    if (currentStage && currentStage.current_stage !== "graduation") {
      await updateClientStage(clientId, {
        stage_completed_at: new Date().toISOString(),
      })
    }
  }

  // If moving to archived, set client status to completed
  if (newStage === "archived") {
    await updateClient(clientId, { status: "completed" })
  }

  // If moving from archived to any other stage, set status to active
  if (currentStage?.current_stage === "archived" && newStage !== "archived") {
    await updateClient(clientId, { status: "active" })
  }
}

export async function getClientsByStage(successPackage: string, stageKey: string): Promise<ClientWithStage[]> {
  const { data, error } = await supabase
    .from("clients")
    .select(`
      *,
      stage:client_stages(*)
    `)
    .eq("success_package", successPackage)
    .in("status", ["active", "completed"])
    .eq("client_stages.current_stage", stageKey)

  if (error) {
    console.error("Error fetching clients by stage:", error)
    throw error
  }

  return data || []
}

export async function getAllClientsWithStages(): Promise<ClientWithStage[]> {
  const { data, error } = await supabase
    .from("clients")
    .select(`
      *,
      stage:client_stages(*)
    `)
    .in("status", ["active", "completed"])
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching clients with stages:", error)
    throw error
  }

  return data || []
}

export async function createKanbanActivity(activityData: Omit<KanbanActivity, "id" | "created_at" | "updated_at">): Promise<KanbanActivity> {
  const { data, error } = await supabase
    .from("kanban_activities")
    .insert({
      ...activityData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating kanban activity:", error)
    throw error
  }

  return data
}

export async function updateKanbanActivity(activityId: string, updates: Partial<KanbanActivity>): Promise<KanbanActivity> {
  const { data, error } = await supabase
    .from("kanban_activities")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", activityId)
    .select()
    .single()

  if (error) {
    console.error("Error updating kanban activity:", error)
    throw error
  }

  return data
}

export async function getKanbanActivities(clientId: string, stageKey?: string): Promise<KanbanActivity[]> {
  let query = supabase
    .from("kanban_activities")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  if (stageKey) {
    query = query.eq("stage_key", stageKey)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching kanban activities:", error)
    throw error
  }

  return data || []
}

// Initialize kanban system if tables don't exist
export async function initializeKanbanSystem(): Promise<void> {
  try {
    // Check if kanban_workflows table exists
    const { data: workflows, error: workflowsError } = await supabase
      .from("kanban_workflows")
      .select("count")
      .limit(1)

    if (workflowsError && workflowsError.code === "42P01") {
      // Table doesn't exist, create basic structure
      console.log("Initializing kanban system...")
      
      // Create basic workflow data
      const basicWorkflows = [
        // Light Package
        { success_package: "light", stage_key: "new", stage_name: "New Client", stage_description: "Client has signed up and needs initial contact", stage_order: 1, is_final_stage: false, color: "#10B981", icon_name: "UserPlus" },
        { success_package: "light", stage_key: "call", stage_name: "Onboarding Call", stage_description: "Initial Zoom call with product specialist", stage_order: 2, is_final_stage: false, color: "#3B82F6", icon_name: "Phone" },
        { success_package: "light", stage_key: "graduation", stage_name: "Graduation", stage_description: "Client has completed onboarding and is ready", stage_order: 3, is_final_stage: true, color: "#8B5CF6", icon_name: "GraduationCap" },
        
        // Premium Package
        { success_package: "premium", stage_key: "new", stage_name: "New Client", stage_description: "Client has signed up and needs initial contact", stage_order: 1, is_final_stage: false, color: "#10B981", icon_name: "UserPlus" },
        { success_package: "premium", stage_key: "first_call", stage_name: "1st Onboarding Call", stage_description: "Initial discovery and requirements gathering", stage_order: 2, is_final_stage: false, color: "#3B82F6", icon_name: "Phone" },
        { success_package: "premium", stage_key: "second_call", stage_name: "2nd Onboarding Call", stage_description: "Workflow mapping and workspace structuring", stage_order: 3, is_final_stage: false, color: "#F59E0B", icon_name: "PhoneCall" },
        { success_package: "premium", stage_key: "graduation", stage_name: "Graduation", stage_description: "Client has completed onboarding and is ready", stage_order: 4, is_final_stage: true, color: "#8B5CF6", icon_name: "GraduationCap" },
        
        // Gold Package
        { success_package: "gold", stage_key: "new", stage_name: "New Client", stage_description: "Client has signed up and needs initial contact", stage_order: 1, is_final_stage: false, color: "#10B981", icon_name: "UserPlus" },
        { success_package: "gold", stage_key: "first_call", stage_name: "1st Onboarding Call", stage_description: "Initial discovery and requirements gathering", stage_order: 2, is_final_stage: false, color: "#3B82F6", icon_name: "Phone" },
        { success_package: "gold", stage_key: "second_call", stage_name: "2nd Onboarding Call", stage_description: "Advanced workflow setup and integrations", stage_order: 3, is_final_stage: false, color: "#F59E0B", icon_name: "PhoneCall" },
        { success_package: "gold", stage_key: "third_call", stage_name: "3rd Onboarding Call", stage_description: "Advanced integrations and optimization", stage_order: 4, is_final_stage: false, color: "#EF4444", icon_name: "PhoneIncoming" },
        { success_package: "gold", stage_key: "graduation", stage_name: "Graduation", stage_description: "Client has completed onboarding and is ready", stage_order: 5, is_final_stage: true, color: "#8B5CF6", icon_name: "GraduationCap" },
        
        // Elite Package
        { success_package: "elite", stage_key: "new", stage_name: "New Client", stage_description: "Client has signed up and needs initial contact", stage_order: 1, is_final_stage: false, color: "#10B981", icon_name: "UserPlus" },
        { success_package: "elite", stage_key: "first_call", stage_name: "1st Onboarding Call", stage_description: "Initial discovery and requirements gathering", stage_order: 2, is_final_stage: false, color: "#3B82F6", icon_name: "Phone" },
        { success_package: "elite", stage_key: "second_call", stage_name: "2nd Onboarding Call", stage_description: "Advanced workflow setup and integrations", stage_order: 3, is_final_stage: false, color: "#F59E0B", icon_name: "PhoneCall" },
        { success_package: "elite", stage_key: "third_call", stage_name: "3rd Onboarding Call", stage_description: "Advanced integrations and optimization", stage_order: 4, is_final_stage: false, color: "#EF4444", icon_name: "PhoneIncoming" },
        { success_package: "elite", stage_key: "graduation", stage_name: "Graduation", stage_description: "Client has completed onboarding and is ready", stage_order: 5, is_final_stage: true, color: "#8B5CF6", icon_name: "GraduationCap" },
      ]

      // Insert workflows (this will fail if table doesn't exist, but that's okay)
      for (const workflow of basicWorkflows) {
        try {
          await supabase.from("kanban_workflows").insert(workflow)
        } catch (error) {
          console.log("Could not insert workflow (table may not exist):", error)
        }
      }
    }
  } catch (error) {
    console.log("Kanban system initialization check failed:", error)
  }
}

/**
 * Create a new client follow-up
 */
export async function createClientFollowUp({ client_id, title, due_date, notes, milestone }: { client_id: string, title: string, due_date: string, notes?: string, milestone: number | null }): Promise<ClientFollowUp | null> {
  const { data, error } = await supabase
    .from("client_follow_ups")
    .insert([{ client_id, title, due_date, notes: notes || null, type: "manual", milestone }])
    .select()
    .single()
  if (error) {
    console.error("Error creating client follow-up:", error, JSON.stringify(error, null, 2))
    return null
  }
  return data as ClientFollowUp
}

/**
 * Get all client follow-ups due in the next 7 days (optionally filter by completion), including client info
 */
export async function getUpcomingClientFollowUps({ daysAhead = 7, includeCompleted = false } = {}): Promise<(ClientFollowUp & { client_name?: string, client_email?: string, client_package?: string })[]> {
  const today = new Date()
  const end = new Date()
  end.setDate(today.getDate() + daysAhead)
  let query = supabase
    .from("client_follow_ups")
    .select("*, client:clients(name,email,success_package)")
    .gte("due_date", today.toISOString().slice(0, 10))
    .lte("due_date", end.toISOString().slice(0, 10))
    .order("due_date", { ascending: true })
  if (!includeCompleted) {
    query = query.eq("is_completed", false)
  }
  const { data, error } = await query
  if (error) {
    console.error("Error fetching upcoming client follow-ups:", error)
    return []
  }
  // Map client fields for easier access
  return (data || []).map((fu: any) => ({
    ...fu,
    client_name: fu.client?.name,
    client_email: fu.client?.email,
    client_package: fu.client?.success_package,
  }))
}

/**
 * Mark a client follow-up as complete
 */
export async function completeClientFollowUp(id: string): Promise<ClientFollowUp | null> {
  const completedAt = new Date().toISOString()
  const { data, error } = await supabase
    .from("client_follow_ups")
    .update({ is_completed: true, completed_at: completedAt, updated_at: completedAt })
    .eq("id", id)
    .select()
    .single()
  if (error) {
    console.error("Error completing client follow-up:", error)
    return null
  }
  return data as ClientFollowUp
}

// Fetch workflow for a client
export async function getClientWorkflow(clientId: string): Promise<any> {
  const { data, error } = await supabase.from("clients").select("workflow").eq("id", clientId).single()
  if (error) throw error
  return data?.workflow || { nodes: [], edges: [] }
}

// Update workflow for a client
export async function updateClientWorkflow(clientId: string, workflow: any): Promise<void> {
  const { error } = await supabase
    .from("clients")
    .update({ workflow: workflow })
    .eq("id", clientId)

  if (error) {
    console.error("Error updating client workflow:", error)
    throw error
  }
}

// Analytics Functions
export async function trackAnalyticsEvent(eventData: Omit<AnalyticsEvent, "id" | "created_at">): Promise<AnalyticsEvent> {
  const { data, error } = await supabase
    .from("analytics_events")
    .insert({
      ...eventData,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error tracking analytics event:", error)
    throw error
  }

  return data
}

export async function getAnalyticsEvents(
  filters: {
    clientId?: string
    eventType?: string
    packageType?: string
    startDate?: string
    endDate?: string
  } = {}
): Promise<AnalyticsEvent[]> {
  let query = supabase.from("analytics_events").select("*").order("created_at", { ascending: false })

  if (filters.clientId) {
    query = query.eq("client_id", filters.clientId)
  }
  if (filters.eventType) {
    query = query.eq("event_type", filters.eventType)
  }
  if (filters.packageType) {
    query = query.eq("package_type", filters.packageType)
  }
  if (filters.startDate) {
    query = query.gte("created_at", filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte("created_at", filters.endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching analytics events:", error)
    throw error
  }

  return data || []
}

export async function getClientJourneyAnalytics(clientId: string): Promise<ClientJourneyAnalytics[]> {
  const { data, error } = await supabase
    .from("client_journey_analytics")
    .select("*")
    .eq("client_id", clientId)
    .order("started_at", { ascending: true })

  if (error) {
    console.error("Error fetching client journey analytics:", error)
    throw error
  }

  return data || []
}

export async function createClientJourneyEntry(
  journeyData: Omit<ClientJourneyAnalytics, "id" | "created_at" | "updated_at">
): Promise<ClientJourneyAnalytics> {
  const { data, error } = await supabase
    .from("client_journey_analytics")
    .insert({
      ...journeyData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating client journey entry:", error)
    throw error
  }

  return data
}

export async function updateClientJourneyEntry(
  id: string,
  updates: Partial<ClientJourneyAnalytics>
): Promise<ClientJourneyAnalytics> {
  const { data, error } = await supabase
    .from("client_journey_analytics")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating client journey entry:", error)
    throw error
  }

  return data
}

export async function getConversionAnalytics(
  packageType?: string,
  startDate?: string,
  endDate?: string
): Promise<ConversionTracking[]> {
  let query = supabase.from("conversion_tracking").select("*").order("period_start", { ascending: false })

  if (packageType) {
    query = query.eq("package_type", packageType)
  }
  if (startDate) {
    query = query.gte("period_start", startDate)
  }
  if (endDate) {
    query = query.lte("period_end", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching conversion analytics:", error)
    throw error
  }

  return data || []
}

export async function getIntegrationAdoptionMetrics(
  packageType?: string,
  startDate?: string,
  endDate?: string
): Promise<IntegrationAdoptionMetrics[]> {
  let query = supabase
    .from("integration_adoption_metrics")
    .select("*")
    .order("adoption_rate", { ascending: false })

  if (packageType) {
    query = query.eq("package_type", packageType)
  }
  if (startDate) {
    query = query.gte("period_start", startDate)
  }
  if (endDate) {
    query = query.lte("period_end", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching integration adoption metrics:", error)
    throw error
  }

  return data || []
}

export async function getFeatureUsageStatistics(
  packageType?: string,
  startDate?: string,
  endDate?: string
): Promise<FeatureUsageStatistics[]> {
  let query = supabase
    .from("feature_usage_statistics")
    .select("*")
    .order("usage_rate", { ascending: false })

  if (packageType) {
    query = query.eq("package_type", packageType)
  }
  if (startDate) {
    query = query.gte("period_start", startDate)
  }
  if (endDate) {
    query = query.lte("period_end", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching feature usage statistics:", error)
    throw error
  }

  return data || []
}

export async function getRevenueAnalytics(
  packageType?: string,
  startDate?: string,
  endDate?: string
): Promise<RevenueImpactTracking[]> {
  let query = supabase
    .from("revenue_impact_tracking")
    .select("*")
    .order("total_revenue", { ascending: false })

  if (packageType) {
    query = query.eq("package_type", packageType)
  }
  if (startDate) {
    query = query.gte("period_start", startDate)
  }
  if (endDate) {
    query = query.lte("period_end", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching revenue analytics:", error)
    throw error
  }

  return data || []
}

export async function getClientSatisfactionScores(
  clientId?: string,
  surveyType?: string,
  startDate?: string,
  endDate?: string
): Promise<ClientSatisfactionScore[]> {
  let query = supabase
    .from("client_satisfaction_scores")
    .select("*")
    .order("survey_date", { ascending: false })

  if (clientId) {
    query = query.eq("client_id", clientId)
  }
  if (surveyType) {
    query = query.eq("survey_type", surveyType)
  }
  if (startDate) {
    query = query.gte("survey_date", startDate)
  }
  if (endDate) {
    query = query.lte("survey_date", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching client satisfaction scores:", error)
    throw error
  }

  return data || []
}

export async function createClientSatisfactionScore(
  scoreData: Omit<ClientSatisfactionScore, "id" | "created_at">
): Promise<ClientSatisfactionScore> {
  const { data, error } = await supabase
    .from("client_satisfaction_scores")
    .insert({
      ...scoreData,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating client satisfaction score:", error)
    throw error
  }

  return data
}

export async function getAnalyticsOverview(startDate?: string, endDate?: string) {
  try {
    // Get all clients
    const clients = (await getAllClients()).filter(c => !c.is_demo);
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === "active").length;

    // MRR calculation
    let mrr = 0;
    let arr = 0;
    let payingClients = 0;
    let nonPayingClients = 0;
    const clientsByPackage: Record<string, number> = {};
    const now = new Date();
    let growthCount = 0;
    let growthCount60 = 0;
    let growthCount90 = 0;

    for (const client of clients) {
      // Count by package
      if (client.success_package) {
        clientsByPackage[client.success_package] = (clientsByPackage[client.success_package] || 0) + 1;
      }
      // MRR logic
      if (typeof client.revenue_amount === 'number' && client.revenue_amount > 0) {
        payingClients++;
        if (client.billing_type === 'monthly') {
          mrr += client.revenue_amount;
        } else if (client.billing_type === 'quarterly') {
          mrr += client.revenue_amount / 3;
        } else if (client.billing_type === 'yearly' || client.billing_type === 'annually') {
          mrr += client.revenue_amount / 12;
        }
      } else {
        nonPayingClients++;
      }
      // Growth: clients created in last 30, 60, 90 days
      if (client.created_at) {
        const created = new Date(client.created_at);
        const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays <= 30) growthCount++;
        if (diffDays <= 60) growthCount60++;
        if (diffDays <= 90) growthCount90++;
      }
    }
    arr = mrr * 12;
    // Total revenue (sum of all revenue_amount)
    const totalRevenue = clients.reduce((sum, c) => sum + (typeof c.revenue_amount === 'number' ? c.revenue_amount : 0), 0);
    // Growth rate: percent of new clients in last 30, 60, 90 days
    const growthRate = totalClients > 0 ? (growthCount / totalClients) * 100 : 0;
    const growthRate60 = totalClients > 0 ? (growthCount60 / totalClients) * 100 : 0;
    const growthRate90 = totalClients > 0 ? (growthCount90 / totalClients) * 100 : 0;

    // Find top performing package
    const topPerformingPackage = Object.entries(clientsByPackage).sort(([,a],[,b]) => b - a)[0]?.[0] || "premium";

    return {
      totalClients,
      activeClients,
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      clientsByPackage,
      payingClients,
      nonPayingClients,
      growthRate: Math.round(growthRate * 100) / 100,
      growthRate60: Math.round(growthRate60 * 100) / 100,
      growthRate90: Math.round(growthRate90 * 100) / 100,
      topPerformingPackage,
    };
  } catch (error) {
    console.error("Error getting analytics overview:", error);
    throw error;
  }
}

export async function getAnalyticsCache(cacheKey: string): Promise<any | null> {
  const { data, error } = await supabase
    .from("analytics_dashboard_cache")
    .select("cache_data")
    .eq("cache_key", cacheKey)
    .gt("expires_at", new Date().toISOString())
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null // No data found
    }
    console.error("Error fetching analytics cache:", error)
    throw error
  }

  return data?.cache_data || null
}

export async function setAnalyticsCache(cacheKey: string, cacheData: any, expiresInHours: number = 1): Promise<void> {
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from("analytics_dashboard_cache")
    .upsert({
      cache_key: cacheKey,
      cache_data: cacheData,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    })

  if (error) {
    console.error("Error setting analytics cache:", error)
    throw error
  }
}

export async function clearAnalyticsCache(cacheKey?: string): Promise<void> {
  let query = supabase.from("analytics_dashboard_cache").delete()

  if (cacheKey) {
    query = query.eq("cache_key", cacheKey)
  } else {
    query = query.lt("expires_at", new Date().toISOString())
  }

  const { error } = await query

  if (error) {
    console.error("Error clearing analytics cache:", error)
    throw error
  }
}

export async function getWhiteLabelClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("custom_app", "white_label")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching white label clients:", error)
      return []
    }

    return (data || []).map(transformClientFromDb)
  } catch (error) {
    console.error("Error in getWhiteLabelClients:", error)
    return []
  }
}

// Feedback Board CRUD
export async function getFeedbackBoardCards({ clientId, status }: { clientId?: string; status?: string } = {}): Promise<FeedbackBoardCard[]> {
  let query = supabase
    .from("feedback_board_cards")
    .select("*")
    .order("submission_date", { ascending: false });
  if (clientId) query = query.eq("client_id", clientId);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createFeedbackBoardCard(card: Omit<FeedbackBoardCard, "id" | "submission_date" | "updated_at">): Promise<FeedbackBoardCard | null> {
  const { data, error } = await supabase
    .from("feedback_board_cards")
    .insert([{ ...card }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateFeedbackBoardCard(id: string, updates: Partial<Omit<FeedbackBoardCard, "id" | "client_id" | "submission_date">>): Promise<FeedbackBoardCard | null> {
  const { data, error } = await supabase
    .from("feedback_board_cards")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteFeedbackBoardCard(id: string): Promise<void> {
  const { error } = await supabase
    .from("feedback_board_cards")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// Get all client follow-ups due in the next X days (alias for getUpcomingClientFollowUps)
export async function getDueClientFollowUps({ daysAhead = 7 } = {}): Promise<(ClientFollowUp & { client_name?: string, client_email?: string, client_package?: string })[]> {
  return getUpcomingClientFollowUps({ daysAhead, includeCompleted: false })
}

// Mark a client follow-up as done (alias for completeClientFollowUp)
export async function markClientFollowUpDone(id: string): Promise<ClientFollowUp | null> {
  return completeClientFollowUp(id)
}

// ACTIVITY LOG: CRUD for client_activity_log table
export async function getClientActivityLog(clientId: string) {
  const { data, error } = await supabase
    .from("client_activity_log")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addClientActivityLog({ client_id, event_type, event_data, created_by }: {
  client_id: string;
  event_type: string;
  event_data?: any;
  created_by?: string;
}) {
  const { data, error } = await supabase
    .from("client_activity_log")
    .insert([{ client_id, event_type, event_data, created_by }])
    .select()
    .single();
  if (error) throw error;
  return data;
}


// CONTACTS: CRUD for client_contacts table
export async function getClientContacts(clientId: string) {
  const { data, error } = await supabase
    .from("client_contacts")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addClientContact(contact: {
  client_id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from("client_contacts")
    .insert([contact])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateClientContact(id: string, updates: {
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from("client_contacts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteClientContact(id: string) {
  const { error } = await supabase
    .from("client_contacts")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return true;
}

// TAGS: CRUD for client_tags table
export async function getClientTags(clientId: string) {
  const { data, error } = await supabase
    .from("client_tags")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addClientTag(clientId: string, tag: string) {
  const { data, error } = await supabase
    .from("client_tags")
    .insert([{ client_id: clientId, tag }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteClientTag(id: string) {
  const { error } = await supabase
    .from("client_tags")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return true;
}

export async function updateClientActivityLog(id: string, updates: { event_data?: any; created_at?: string; }) {
  const { data, error } = await supabase
    .from("client_activity_log")
    .update({ ...updates })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteClientActivityLog(id: string) {
  const { error } = await supabase
    .from("client_activity_log")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return true;
}

/**
 * Mark follow-up email as sent for a client
 */
export async function markFollowUpEmailSent(clientId: string): Promise<void> {
  const { error } = await supabase
    .from("clients")
    .update({ follow_up_email_sent: true, updated_at: new Date().toISOString() })
    .eq("id", clientId)
  if (error) throw error
}

/**
 * Get all follow-up email reminders for a client
 */
export async function getClientFollowUpEmails(clientId: string): Promise<ClientFollowUpEmail[]> {
  const { data, error } = await supabase
    .from("client_follow_up_emails")
    .select("*")
    .eq("client_id", clientId)
    .order("reminder_number", { ascending: true })
  if (error) throw error
  return data || []
}

/**
 * Create a follow-up email reminder for a client and interval
 */
export async function createClientFollowUpEmail(clientId: string, reminder_number: number, reminder_date: string): Promise<void> {
  const { error } = await supabase
    .from("client_follow_up_emails")
    .upsert({
      client_id: clientId,
      reminder_number,
      reminder_date,
      sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "client_id,reminder_number" })
  if (error) throw error
}

/**
 * Mark a follow-up email reminder as sent
 */
export async function markClientFollowUpEmailSent(clientId: string, reminder_number: number): Promise<void> {
  const { error } = await supabase
    .from("client_follow_up_emails")
    .update({ sent: true, sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("client_id", clientId)
    .eq("reminder_number", reminder_number)
  if (error) throw error
}

// ============================================================================
// IMPLEMENTATION MILESTONES FUNCTIONS
// ============================================================================

export interface ImplementationMilestone {
  id: string
  client_id: string
  title: string
  description?: string
  category: string
  order_index: number
  estimated_days?: number
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  completed_at?: string
  completed_by?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface MilestoneTemplate {
  id: string
  name: string
  description?: string
  category: string
  estimated_days?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Get all milestones for a client
 */
export async function getClientMilestones(clientId: string): Promise<ImplementationMilestone[]> {
  const { data, error } = await supabase
    .from("implementation_milestones")
    .select("*")
    .eq("client_id", clientId)
    .order("order_index", { ascending: true })
  if (error) throw error
  return data || []
}

/**
 * Get milestone templates
 */
export async function getMilestoneTemplates(): Promise<MilestoneTemplate[]> {
  const { data, error } = await supabase
    .from("milestone_templates")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true })
  if (error) throw error
  return data || []
}

/**
 * Create a new milestone for a client
 */
export async function createClientMilestone(milestone: Omit<ImplementationMilestone, 'id' | 'created_at' | 'updated_at'>): Promise<ImplementationMilestone> {
  const { data, error } = await supabase
    .from("implementation_milestones")
    .insert([milestone])
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Update a milestone
 */
export async function updateClientMilestone(id: string, updates: Partial<ImplementationMilestone>): Promise<ImplementationMilestone> {
  const { data, error } = await supabase
    .from("implementation_milestones")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Delete a milestone
 */
export async function deleteClientMilestone(id: string): Promise<void> {
  const { error } = await supabase
    .from("implementation_milestones")
    .delete()
    .eq("id", id)
  if (error) throw error
}

/**
 * Reorder milestones for a client
 */
export async function reorderClientMilestones(clientId: string, milestoneIds: string[]): Promise<void> {
  const updates = milestoneIds.map((id, index) => ({
    id,
    order_index: index,
    updated_at: new Date().toISOString()
  }))
  
  const { error } = await supabase
    .from("implementation_milestones")
    .upsert(updates)
  if (error) throw error
}

/**
 * Calculate milestone completion percentage for a client
 */
export async function calculateMilestoneCompletion(clientId: string): Promise<number> {
  const { data, error } = await supabase
    .rpc('calculate_milestone_completion', { client_uuid: clientId })
  if (error) throw error
  return data || 0
}

/**
 * Bulk create milestones from templates for a client
 */
export async function createMilestonesFromTemplates(clientId: string, templateIds: string[]): Promise<ImplementationMilestone[]> {
  // Get the templates
  const { data: templates, error: templateError } = await supabase
    .from("milestone_templates")
    .select("*")
    .in("id", templateIds)
  if (templateError) throw templateError

  // Get current highest order index
  const { data: existingMilestones } = await supabase
    .from("implementation_milestones")
    .select("order_index")
    .eq("client_id", clientId)
    .order("order_index", { ascending: false })
    .limit(1)
  
  let nextOrderIndex = existingMilestones?.[0]?.order_index || 0

  // Create milestones from templates
  const milestones = templates.map((template, index) => ({
    client_id: clientId,
    title: template.name,
    description: template.description,
    category: template.category,
    order_index: nextOrderIndex + index + 1,
    estimated_days: template.estimated_days,
    status: 'pending' as const,
  }))

  const { data, error } = await supabase
    .from("implementation_milestones")
    .insert(milestones)
    .select()
  if (error) throw error
  return data || []
}

/**
 * Create a new milestone template
 */
export async function createMilestoneTemplate(template: Omit<MilestoneTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<MilestoneTemplate> {
  const { data, error } = await supabase
    .from("milestone_templates")
    .insert([template])
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Update a milestone template
 */
export async function updateMilestoneTemplate(id: string, updates: Partial<MilestoneTemplate>): Promise<MilestoneTemplate> {
  const { data, error } = await supabase
    .from("milestone_templates")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Delete a milestone template
 */
export async function deleteMilestoneTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from("milestone_templates")
    .delete()
    .eq("id", id)
  if (error) throw error
}

// ============================================================================
// TIME TRACKING FUNCTIONS
// ============================================================================

import type { TimeEntry, ClientTimeSummary } from "./types"

/**
 * Get all time entries for a client
 */
export async function getClientTimeEntries(clientId: string): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from("client_time_entries")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get time entries with filters
 */
export async function getTimeEntries(filters: {
  clientId?: string
  startDate?: string
  endDate?: string
  entryType?: "meeting" | "email" | "implementation"
} = {}): Promise<TimeEntry[]> {
  let query = supabase
    .from("client_time_entries")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (filters.clientId) {
    query = query.eq("client_id", filters.clientId)
  }

  if (filters.startDate) {
    query = query.gte("date", filters.startDate)
  }

  if (filters.endDate) {
    query = query.lte("date", filters.endDate)
  }

  if (filters.entryType) {
    query = query.eq("entry_type", filters.entryType)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Create a new time entry
 */
export async function createTimeEntry(
  entry: Omit<TimeEntry, "id" | "created_at" | "updated_at">
): Promise<TimeEntry> {
  const { data, error } = await supabase
    .from("client_time_entries")
    .insert([entry])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a time entry
 */
export async function updateTimeEntry(
  id: string,
  updates: Partial<Omit<TimeEntry, "id" | "client_id" | "created_at">>
): Promise<TimeEntry> {
  const { data, error } = await supabase
    .from("client_time_entries")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a time entry
 */
export async function deleteTimeEntry(id: string): Promise<void> {
  const { error } = await supabase.from("client_time_entries").delete().eq("id", id)
  if (error) throw error
}

/**
 * Get time summary for a client
 */
export async function getClientTimeSummary(clientId: string): Promise<ClientTimeSummary> {
  // Try to use the database function first
  const { data: functionData, error: functionError } = await supabase.rpc(
    "get_client_total_time",
    { client_uuid: clientId }
  )

  if (!functionError && functionData && functionData.length > 0) {
    const result = functionData[0]
    return {
      client_id: clientId,
      total_minutes: result.total_minutes || 0,
      total_hours: result.total_hours || 0,
      meeting_minutes: result.meeting_minutes || 0,
      email_minutes: result.email_minutes || 0,
      implementation_minutes: result.implementation_minutes || 0,
      entry_count: 0, // Will be calculated separately
    }
  }

  // Fallback to manual calculation
  const entries = await getClientTimeEntries(clientId)
  const totalMinutes = entries.reduce((sum, e) => sum + e.duration_minutes, 0)

  return {
    client_id: clientId,
    total_minutes: totalMinutes,
    total_hours: totalMinutes / 60.0,
    meeting_minutes: entries
      .filter((e) => e.entry_type === "meeting")
      .reduce((sum, e) => sum + e.duration_minutes, 0),
    email_minutes: entries
      .filter((e) => e.entry_type === "email")
      .reduce((sum, e) => sum + e.duration_minutes, 0),
    implementation_minutes: entries
      .filter((e) => e.entry_type === "implementation")
      .reduce((sum, e) => sum + e.duration_minutes, 0),
    entry_count: entries.length,
  }
}

/**
 * Get time summaries for all clients
 */
export async function getAllClientTimeSummaries(): Promise<
  (ClientTimeSummary & { client_name?: string; client_acv?: number; client_package?: string })[]
> {
  const { data: entries, error: entriesError } = await supabase
    .from("client_time_entries")
    .select("client_id, entry_type, duration_minutes, client:clients(name, revenue_amount, success_package)")

  if (entriesError) throw entriesError

  const clientSummaries: Record<
    string,
    ClientTimeSummary & { client_name?: string; client_acv?: number; client_package?: string }
  > = {}

  entries.forEach((entry: any) => {
    const clientId = entry.client_id
    if (!clientSummaries[clientId]) {
      clientSummaries[clientId] = {
        client_id: clientId,
        total_minutes: 0,
        total_hours: 0,
        meeting_minutes: 0,
        email_minutes: 0,
        implementation_minutes: 0,
        entry_count: 0,
        client_name: entry.client?.name,
        client_acv: entry.client?.revenue_amount,
        client_package: entry.client?.success_package,
      }
    }

    clientSummaries[clientId].total_minutes += entry.duration_minutes
    clientSummaries[clientId].total_hours = clientSummaries[clientId].total_minutes / 60.0
    clientSummaries[clientId].entry_count++

    if (entry.entry_type === "meeting") {
      clientSummaries[clientId].meeting_minutes += entry.duration_minutes
    } else if (entry.entry_type === "email") {
      clientSummaries[clientId].email_minutes += entry.duration_minutes
    } else if (entry.entry_type === "implementation") {
      clientSummaries[clientId].implementation_minutes += entry.duration_minutes
    }
  })

  return Object.values(clientSummaries)
}