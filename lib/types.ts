export interface Client {
  id: string
  name: string
  slug: string
  email?: string
  success_package: "light" | "premium" | "gold" | "elite" | "starter" | "professional" | "enterprise"
  billing_type: "monthly" | "yearly"
  plan_type: "pro" | "business" | "unlimited"
  revenue_amount: number
  custom_app: string
  notes: string | null
  number_of_users?: number
  logo_url?: string | null
  welcome_message?: string | null
  video_url?: string | null
  show_zapier_integrations?: boolean
  projects_enabled?: boolean
  status: "active" | "draft" | "pending" | "completed"
  calls_scheduled: number
  calls_completed: number
  forms_setup: number
  smartdocs_setup: number
  zapier_integrations_setup: number
  migration_completed: boolean
  slack_access_granted: boolean
  project_completion_percentage: number
  created_at: string
  updated_at: string
  graduation_date?: string | null
  workflow_builder_enabled: boolean
  workflow?: any // JSON object for workflow builder data
}

export interface Integration {
  id: string
  title: string
  description: string
  category: string
  integration_type: "zapier" | "native" | "api"
  external_url: string
  documentation_url?: string
  icon_url?: string
  icon_name?: string
  tags?: string[]
  url?: string // Keep for backward compatibility
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ClientIntegration {
  id: string
  client_id: string
  integration_id: string
  is_enabled: boolean
  is_featured: boolean
  sort_order: number
  title: string
  description: string
  category: string
  integration_type: "zapier" | "native" | "api"
  external_url: string
  documentation_url?: string
  created_at: string
  updated_at: string
  integration?: Integration
}

export interface Feature {
  id: string
  title: string
  description: string
  category: string
  feature_type: "feature" | "integration" | "tool" | "service"
  status: "development" | "beta" | "released" | "deprecated"
  release_date?: string
  estimated_release_date?: string
  pricing_tier: "free" | "premium" | "enterprise" | "addon"
  pricing_amount?: number
  icon_name?: string
  icon_url?: string
  demo_url?: string
  documentation_url?: string
  video_url?: string
  tags?: string[]
  is_active: boolean
  is_upsell_eligible: boolean
  target_packages: string[]
  sales_notes?: string
  implementation_notes?: string
  created_at: string
  updated_at: string
}

export interface ClientFeature {
  id: string
  client_id: string
  feature_id: string
  status: "proposed" | "interested" | "approved" | "implementing" | "completed" | "declined"
  is_enabled: boolean
  is_featured: boolean
  sort_order: number
  proposed_date: string
  approved_date?: string
  implementation_date?: string
  completed_date?: string
  pricing_override?: number
  custom_notes?: string
  sales_person?: string
  created_at: string
  updated_at: string
  feature?: Feature
}

export interface ProjectTask {
  id: string
  client_id: string
  title: string
  description: string
  status: "pending" | "in_progress" | "completed" | "blocked"
  priority: "low" | "medium" | "high" | "urgent"
  assigned_to?: string
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface ChecklistItem {
  id: string
  client_id: string
  client_name?: string
  client_email?: string
  title: string
  description?: string
  is_completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface TaskCompletion {
  id: string
  client_id: string
  client_name: string
  client_email?: string
  task_id: string
  task_title: string
  is_completed: boolean
  completed_at?: string
  webhook_sent: boolean
  webhook_sent_at?: string
  created_at: string
  updated_at: string
}

export interface PlatformSettings {
  id?: string
  platform_name: string
  platform_logo_url?: string
  primary_color: string
  secondary_color: string
  welcome_message: string
  support_email: string
  support_phone?: string
  smtp_host?: string
  smtp_port?: number
  smtp_username?: string
  smtp_password?: string
  smtp_from_email?: string
  smtp_from_name?: string
  enable_email_notifications: boolean
  enable_slack_notifications: boolean
  slack_webhook_url?: string
  default_success_package: string
  allow_client_self_registration: boolean
  require_admin_approval: boolean
  created_at?: string
  updated_at?: string
}

export interface DashboardStats {
  totalClients: number
  activeClients: number
  pendingClients: number
  completedClients: number
  totalIntegrations: number
  activeIntegrations: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
}

export interface ClientStats {
  total: number
  active: number
  premium: number
  gold: number
  elite: number
  light: number
  starter: number
  professional: number
  enterprise: number
  draft: number
}

export interface FormData {
  name: string
  slug: string
  email?: string
  success_package: string
  billing_type: string
  number_of_users?: number
  logo_url?: string
  welcome_message?: string
  video_url?: string
  show_zapier_integrations?: boolean
  projects_enabled?: boolean
  status?: string
}

export interface TrackingData {
  calls_scheduled?: number
  calls_completed?: number
  forms_setup?: number
  smartdocs_setup?: number
  zapier_integrations_setup?: number
  migration_completed?: boolean
  slack_access_granted?: boolean
}

export interface PackageLimits {
  calls: number
  forms: number
  smartdocs: number
  integrations: number
  migration: boolean
  slack: boolean
}

export interface ServiceStatus {
  text: string
  color: string
}

export interface ProgressCalculation {
  overall: number
  calls: number
  forms: number
  smartdocs: number
  integrations: number
}

export interface ClientChecklist {
  id: string
  client_id: string
  category: "basics" | "project_boards" | "workspace_templates"
  task_key: string
  task_title: string
  task_description?: string
  is_completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface CreateClientData {
  name: string
  slug: string
  logo_url?: string
  number_of_users: number
  plan_type: "pro" | "business" | "unlimited"
  billing_type: "monthly" | "quarterly" | "annually"
  success_package: "light" | "premium" | "gold" | "elite"
  revenue_amount: number
  custom_app: "gray_label" | "white_label" | "not_applicable"
  projects_enabled: boolean
  welcome_message?: string
  video_url?: string
  show_zapier_integrations?: boolean
  notes?: string
  status?: "draft" | "active"
}

export interface UpdateClientData extends Partial<CreateClientData> {
  id: string
  calls_scheduled?: number
  calls_completed?: number
  forms_setup?: number
  smartdocs_setup?: number
  zapier_integrations_setup?: number
  migration_completed?: boolean
  slack_access_granted?: boolean
  project_completion_percentage?: number
}

export interface UpdateChecklistItemData {
  client_id: string
  task_key: string
  is_completed: boolean
}

export interface CreateIntegrationData {
  integration_type: "zapier" | "native" | "api"
  title: string
  description?: string
  url: string
  icon_name?: string
  category?: string
  tags?: string[]
  is_active?: boolean
}

export interface UpdateIntegrationData extends Partial<CreateIntegrationData> {
  id: string
}

export interface CreateClientIntegrationData {
  client_id: string
  integration_id?: string // If using master integration
  // For custom integrations
  integration_type?: "zapier" | "native" | "api"
  title?: string
  description?: string
  url?: string
  icon_name?: string
  category?: string
  // Client-specific settings
  is_featured?: boolean
  sort_order?: number
}

export interface UpdateClientIntegrationData extends Partial<CreateClientIntegrationData> {
  id: string
}

// Kanban Board Types
export interface KanbanWorkflow {
  id: string
  success_package: "light" | "premium" | "gold" | "elite"
  stage_key: string
  stage_name: string
  stage_description?: string
  stage_order: number
  is_final_stage: boolean
  color: string
  icon_name?: string
  created_at: string
}

export interface ClientStage {
  id: string
  client_id: string
  current_stage: string
  stage_order: number
  stage_started_at: string
  stage_completed_at?: string
  stage_notes?: string
  next_action_required?: string
  next_action_due_date?: string
  created_at: string
  updated_at: string
}

export interface KanbanActivity {
  id: string
  client_id: string
  stage_key: string
  activity_type: string
  activity_title: string
  activity_description?: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  assigned_to?: string
  due_date?: string
  completed_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ClientWithStage extends Client {
  stage?: ClientStage
  workflow_stages?: KanbanWorkflow[]
}

export interface ClientFollowUp {
  id: string
  client_id: string
  title: string
  due_date: string // ISO date string
  is_completed: boolean
  completed_at?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}
