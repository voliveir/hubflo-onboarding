export interface Client {
  id: string
  name: string
  slug: string
  email?: string
  success_package: "light" | "premium" | "gold" | "elite" | "starter" | "professional" | "enterprise" | "no_success"
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
  onboarding_email_sent: boolean
  follow_up_email_sent?: boolean;
  // Milestone dates for each package type
  light_onboarding_call_date?: string | null
  premium_first_call_date?: string | null
  premium_second_call_date?: string | null
  gold_first_call_date?: string | null
  gold_second_call_date?: string | null
  gold_third_call_date?: string | null
  elite_configurations_started_date?: string | null
  elite_integrations_started_date?: string | null
  elite_verification_completed_date?: string | null
  graduation_date?: string | null
  extra_call_dates?: string[] // Additional call dates
  workflow_builder_enabled: boolean
  workflow?: any // JSON object for workflow builder data
  show_figma_workflow?: boolean
  figma_workflow_url?: string | null
  white_label_status?: "not_started" | "in_progress" | "waiting_for_approval" | "complete"
  white_label_checklist?: {
    create_assets?: { completed: boolean, completed_at?: string }
    create_natively_app?: { completed: boolean, completed_at?: string }
    create_test_user?: { completed: boolean, completed_at?: string }
    test_login?: { completed: boolean, completed_at?: string }
    download_and_create_ios_app?: { completed: boolean, completed_at?: string }
    client_approval?: { completed: boolean, completed_at?: string }
    submit?: { completed: boolean, completed_at?: string }
  }
  white_label_client_approval_status?: "pending" | "approved" | "changes_requested"
  white_label_client_approval_at?: string | null
  white_label_approval_requested_at?: string | null
  white_label_approval_notification_sent_at?: string | null
  white_label_approval_feedback?: string | null
  white_label_approval_feedback_at?: string | null
  white_label_implementation_manager_notified_at?: string | null
  white_label_android_url?: string | null
  white_label_ios_url?: string | null
  white_label_app_name?: string | null
  white_label_app_description?: string | null
  white_label_app_assets?: string[] | null
  feedback_board_enabled?: boolean
  implementation_manager: string
  calendar_contact_success?: string | null
  calendar_schedule_call?: string | null
  calendar_integrations_call?: string | null
  calendar_upgrade_consultation?: string | null
  churned?: boolean
  is_demo?: boolean
  churn_risk?: boolean
  // Milestone management fields
  milestones_enabled?: boolean
  milestone_road_theme?: 'default' | 'mountain' | 'ocean' | 'forest' | 'city'
  // Pinned note for project scope and go-live date
  pinned_note?: {
    initial_scope?: string
    scope_changes?: Array<{
      description: string
      extra_time?: string
      added_at: string
    }>
    go_live_date?: string | null
    new_estimated_go_live_date?: string | null
    updated_at?: string
  }
}

export interface Integration {
  id: string
  title: string
  description: string
  category: string
  integration_type: "zapier" | "native" | "api" | "makecom"
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
  integration_type: "zapier" | "native" | "api" | "makecom"
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
  success_package: "light" | "premium" | "gold" | "elite" | "no_success"
  revenue_amount: number
  custom_app: "gray_label" | "white_label" | "not_applicable"
  projects_enabled: boolean
  welcome_message?: string
  video_url?: string
  show_zapier_integrations?: boolean
  notes?: string
  status?: "draft" | "active"
  white_label_status?: "not_started" | "in_progress" | "waiting_for_approval" | "complete"
  white_label_checklist?: {
    create_assets?: { completed: boolean, completed_at?: string }
    create_natively_app?: { completed: boolean, completed_at?: string }
    create_test_user?: { completed: boolean, completed_at?: string }
    test_login?: { completed: boolean, completed_at?: string }
    download_and_create_ios_app?: { completed: boolean, completed_at?: string }
    submit?: { completed: boolean, completed_at?: string }
  }
  white_label_android_url?: string | null
  white_label_ios_url?: string | null
  onboarding_email_sent?: boolean
  implementation_manager: string
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
  white_label_status?: "not_started" | "in_progress" | "waiting_for_approval" | "complete"
  white_label_checklist?: {
    create_assets?: { completed: boolean, completed_at?: string }
    create_natively_app?: { completed: boolean, completed_at?: string }
    create_test_user?: { completed: boolean, completed_at?: string }
    test_login?: { completed: boolean, completed_at?: string }
    download_and_create_ios_app?: { completed: boolean, completed_at?: string }
    submit?: { completed: boolean, completed_at?: string }
  }
  white_label_android_url?: string | null
  white_label_ios_url?: string | null
  onboarding_email_sent?: boolean
  implementation_manager?: string
}

export interface UpdateChecklistItemData {
  client_id: string
  task_key: string
  is_completed: boolean
}

export interface CreateIntegrationData {
  integration_type: "zapier" | "native" | "api" | "makecom"
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
  integration_type?: "zapier" | "native" | "api" | "makecom"
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

export interface ClientFollowUpEmail {
  id: string;
  client_id: string;
  reminder_number: number;
  reminder_date: string; // ISO date string
  sent: boolean;
  sent_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Analytics Types
export interface AnalyticsEvent {
  id: string
  client_id: string
  event_type: string
  event_category: string
  event_data?: any
  stage_from?: string
  stage_to?: string
  package_type?: string
  user_agent?: string
  ip_address?: string
  session_id?: string
  created_at: string
}

export interface ClientJourneyAnalytics {
  id: string
  client_id: string
  stage_name: string
  stage_started_at: string
  stage_completed_at?: string
  duration_days?: number
  duration_hours?: number
  is_completed: boolean
  completion_reason?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ConversionTracking {
  id: string
  package_type: string
  stage_name: string
  clients_entered: number
  clients_completed: number
  conversion_rate?: number
  avg_duration_days?: number
  avg_duration_hours?: number
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

export interface IntegrationAdoptionMetrics {
  id: string
  integration_id: string
  integration_name: string
  integration_category?: string
  package_type: string
  total_offered: number
  total_adopted: number
  adoption_rate?: number
  avg_setup_time_hours?: number
  success_rate?: number
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

export interface FeatureUsageStatistics {
  id: string
  feature_id: string
  feature_name: string
  feature_category?: string
  package_type: string
  total_enabled: number
  total_used: number
  usage_rate?: number
  avg_usage_frequency?: number
  user_satisfaction_score?: number
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

export interface RevenueImpactTracking {
  id: string
  package_type: string
  revenue_source: string
  base_revenue?: number
  additional_revenue?: number
  total_revenue?: number
  client_count?: number
  avg_revenue_per_client?: number
  revenue_growth_rate?: number
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

export interface ClientSatisfactionScore {
  id: string
  client_id: string
  survey_type: string
  overall_satisfaction: number
  onboarding_experience: number
  implementation_support: number
  feature_satisfaction: number
  integration_satisfaction: number
  would_recommend: number
  nps_score: number
  feedback_text?: string
  survey_date: string
  created_at: string
}

export interface AnalyticsDashboardCache {
  id: string
  cache_key: string
  cache_data: any
  expires_at: string
  created_at: string
}

// Analytics Dashboard Data Types
export interface AnalyticsOverview {
  totalClients: number
  activeClients: number
  avgConversionRate: number
  avgClientSatisfaction: number
  totalRevenue: number
  revenueGrowth: number
  topPerformingPackage: string
  avgOnboardingTime: number
}

export interface ConversionAnalytics {
  packageType: string
  stages: {
    stageName: string
    clientsEntered: number
    clientsCompleted: number
    conversionRate: number
    avgDuration: number
  }[]
  overallConversionRate: number
  totalClients: number
}

export interface JourneyAnalytics {
  stageName: string
  avgDurationDays: number
  avgDurationHours: number
  completionRate: number
  clientsInStage: number
  clientsCompleted: number
  bottlenecks: string[]
}

export interface IntegrationAnalytics {
  integrationName: string
  category: string
  adoptionRate: number
  totalOffered: number
  totalAdopted: number
  avgSetupTime: number
  successRate: number
  packageType: string
}

export interface FeatureAnalytics {
  featureName: string
  category: string
  usageRate: number
  totalEnabled: number
  totalUsed: number
  avgUsageFrequency: number
  userSatisfactionScore: number
  packageType: string
}

export interface RevenueAnalytics {
  packageType: string
  revenueSource: string
  totalRevenue: number
  baseRevenue: number
  additionalRevenue: number
  clientCount: number
  avgRevenuePerClient: number
  revenueGrowthRate: number
  period: string
}

export interface SatisfactionAnalytics {
  overallSatisfaction: number
  onboardingExperience: number
  implementationSupport: number
  featureSatisfaction: number
  integrationSatisfaction: number
  wouldRecommend: number
  npsScore: number
  totalSurveys: number
  recentFeedback: string[]
}

export interface AnalyticsFilters {
  dateRange: {
    start: string
    end: string
  }
  packageType?: string
  stageName?: string
  integrationCategory?: string
  featureCategory?: string
}

export interface AnalyticsTimeframe {
  label: string
  value: string
  startDate: string
  endDate: string
}

export interface FeedbackBoardCard {
  id: string;
  title: string;
  description: string;
  type: 'bug' | 'feature' | 'improvement';
  status: 'backlog' | 'in_progress' | 'completed' | 'closed';
  client_id: string;
  submission_date: string;
  created_by?: string | null;
  updated_at: string;
}

export interface ImplementationManager {
  id: string;
  manager_id: string;
  name: string;
  calendar_contact_success: string;
  calendar_schedule_call: string;
  calendar_integrations_call: string;
  calendar_upgrade_consultation: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// IMPLEMENTATION MILESTONES TYPES
// ============================================================================

export interface ImplementationMilestone {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  category: string;
  order_index: number;
  estimated_days?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MilestoneTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  estimated_days?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TIME TRACKING TYPES
// ============================================================================

export interface TimeEntry {
  id: string;
  client_id: string;
  entry_type: 'meeting' | 'email' | 'initial_setup' | 'automation_workflow' | 'api_integration' | 'testing_debugging' | 'training_handoff' | 'revisions_rework' | 'implementation';
  date: string;
  duration_minutes: number;
  description?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientTimeSummary {
  client_id: string;
  total_minutes: number;
  total_hours: number;
  meeting_minutes: number;
  email_minutes: number;
  implementation_minutes: number;
  entry_count: number;
}


