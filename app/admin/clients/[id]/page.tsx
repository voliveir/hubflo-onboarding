import { notFound } from "next/navigation"
import { getClientById } from "@/lib/database"
import { PasswordProtection } from "@/components/password-protection"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Package, ExternalLink, Edit, Settings, BarChart3, Zap, Calendar, DollarSign, Users, Building, Phone, Mail, Globe, CheckCircle, Clock, XCircle, Flag } from "lucide-react"
import Link from "next/link"
import { ClientTimeTracking } from "@/components/client-time-tracking"
import { PinnedNoteEditor } from "@/components/pinned-note-editor"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ClientDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const clientId = resolvedParams.id

  // Validate that we have a valid client ID
  if (!clientId || clientId === "undefined" || typeof clientId !== "string") {
    console.error("Invalid client ID:", clientId)
    notFound()
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(clientId)) {
    console.error("Client ID is not a valid UUID:", clientId)
    notFound()
  }

  const client = await getClientById(clientId)

  if (!client) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-300"
      case "inactive":
        return "bg-red-500/20 text-red-300"
      case "pending":
        return "bg-yellow-400/20 text-yellow-200"
      case "draft":
        return "bg-slate-400/20 text-slate-200"
      case "completed":
        return "bg-blue-500/20 text-blue-300"
      default:
        return "bg-slate-400/20 text-slate-200"
    }
  }

  const getPackageColor = (pkg: string) => {
    switch (pkg.toLowerCase()) {
      case "light":
        return "bg-blue-500/20 text-blue-300"
      case "premium":
        return "bg-purple-500/20 text-purple-300"
      case "gold":
        return "bg-yellow-400/20 text-yellow-200"
      case "elite":
        return "bg-red-500/20 text-red-300"
      default:
        return "bg-slate-400/20 text-slate-200"
    }
  }

  const getProgressStatusColor = (completed: boolean) => {
    return completed ? "text-green-400" : "text-red-400"
  }

  const getProgressStatusIcon = (completed: boolean) => {
    return completed ? <CheckCircle className="h-8 w-8 text-green-400" /> : <XCircle className="h-8 w-8 text-red-400" />
  }

  function getCustomAppLabel(value: string | undefined) {
    switch (value) {
      case "gray_label":
        return "Gray Label"
      case "white_label":
        return "White Label"
      case "not_applicable":
      case "":
      case undefined:
        return "Not Applicable"
      default:
        return value
    }
  }

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-gradient-to-br from-[#0a0b1a] via-[#10122b] to-[#1a1c3a]">
        <AdminSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white">{client.name}</h1>
                  <p className="text-white/80">Client Details & Management</p>
                </div>
                <div className="flex space-x-3">
                  {client.slug && client.slug.trim() !== '' ? (
                    <Button variant="outline" asChild className="bg-[#181a2f] border border-slate-600 text-[#F2C94C] hover:bg-[#23244a]">
                      <Link href={`/client/${client.slug}`} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Portal
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" disabled className="bg-[#181a2f] border border-slate-600 text-slate-500 cursor-not-allowed" title="Client needs a slug to view portal. Please edit the client to add a slug.">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Portal
                    </Button>
                  )}
                  <Button asChild className="bg-gradient-to-r from-[#F2C94C] via-[#F2994A] to-[#F2994A] text-white font-semibold hover:brightness-110 border border-[#F2C94C]/70">
                    <Link href={`/admin/clients/${client.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Client
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                {/* Main Content - 8 cols on xl, 12 on <lg */}
                <div className="col-span-12 xl:col-span-8 space-y-6">
                  {/* Pinned Note Editor */}
                  <PinnedNoteEditor client={client} />

                  {/* Basic Information */}
                  <Card className="bg-[#060818]/90 rounded-2xl border border-[#F2C94C]/20 p-6 md:p-8 shadow-[#F2C94C]/5">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-white pl-3 border-l-4 border-[#F2C94C] flex items-center gap-2">
                        <User className="h-5 w-5 text-[#F2C94C]" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-12 gap-y-2">
                        <dt className="col-span-4 text-right text-slate-400">Client Name</dt>
                        <dd className="col-span-8 text-slate-100">{client.name}</dd>
                        
                        <dt className="col-span-4 text-right text-slate-400">Status</dt>
                        <dd className="col-span-8">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(client.status)}`}>
                            {client.status}
                          </span>
                        </dd>
                        
                        <dt className="col-span-4 text-right text-slate-400">Email</dt>
                        <dd className="col-span-8 text-slate-100">{client.email || "Not provided"}</dd>
                        
                        <dt className="col-span-4 text-right text-slate-400">Portal Slug</dt>
                        <dd className="col-span-8 text-slate-100 font-mono">{client.slug}</dd>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Package & Billing */}
                  <Card className="bg-[#060818]/90 rounded-2xl border border-[#F2C94C]/20 p-6 md:p-8 shadow-[#F2C94C]/5">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-white pl-3 border-l-4 border-[#F2C94C] flex items-center gap-2">
                        <Package className="h-5 w-5 text-[#F2C94C]" />
                        Package & Billing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-12 gap-y-2">
                        <dt className="col-span-4 text-right text-slate-400">Success Package</dt>
                        <dd className="col-span-8">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getPackageColor(client.success_package)}`}>
                            {client.success_package}
                          </span>
                        </dd>
                        
                        <dt className="col-span-4 text-right text-slate-400">Billing Type</dt>
                        <dd className="col-span-8 text-slate-100 capitalize">{client.billing_type}</dd>
                        
                        <dt className="col-span-4 text-right text-slate-400">Number of Users</dt>
                        <dd className="col-span-8 text-slate-100">{client.number_of_users || "Not specified"}</dd>
                        
                        <dt className="col-span-4 text-right text-slate-400">Custom App</dt>
                        <dd className="col-span-8 text-slate-100">{getCustomAppLabel(client.custom_app)}</dd>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Implementation Progress */}
                  <Card className="bg-[#060818]/90 rounded-2xl border border-[#F2C94C]/20 p-6 md:p-8 shadow-[#F2C94C]/5">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-white pl-3 border-l-4 border-[#F2C94C] flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-[#F2C94C]" />
                        Implementation Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4">
                        <div className="w-full sm:w-1/2 lg:w-1/3 bg-[#0d1120] rounded-xl border border-slate-700 p-4 text-center">
                          <div className="text-3xl font-bold text-blue-400">{client.calls_completed}</div>
                          <div className="text-sm text-slate-400">Calls Completed</div>
                        </div>
                        <div className="w-full sm:w-1/2 lg:w-1/3 bg-[#0d1120] rounded-xl border border-slate-700 p-4 text-center">
                          <div className="text-3xl font-bold text-green-400">{client.forms_setup}</div>
                          <div className="text-sm text-slate-400">Forms Setup</div>
                        </div>
                        <div className="w-full sm:w-1/2 lg:w-1/3 bg-[#0d1120] rounded-xl border border-slate-700 p-4 text-center">
                          <div className="text-3xl font-bold text-purple-400">{client.smartdocs_setup}</div>
                          <div className="text-sm text-slate-400">SmartDocs Setup</div>
                        </div>
                        <div className="w-full sm:w-1/2 lg:w-1/3 bg-[#0d1120] rounded-xl border border-slate-700 p-4 text-center">
                          <div className="text-3xl font-bold text-orange-400">{client.zapier_integrations_setup}</div>
                          <div className="text-sm text-slate-400">Zapier Integrations</div>
                        </div>
                        <div className="w-full sm:w-1/2 lg:w-1/3 bg-[#0d1120] rounded-xl border border-slate-700 p-4 text-center">
                          <div className="text-3xl font-bold">
                            {getProgressStatusIcon(client.migration_completed)}
                          </div>
                          <div className="text-sm text-slate-400">Migration</div>
                        </div>
                        <div className="w-full sm:w-1/2 lg:w-1/3 bg-[#0d1120] rounded-xl border border-slate-700 p-4 text-center">
                          <div className="text-3xl font-bold">
                            {getProgressStatusIcon(client.slack_access_granted)}
                          </div>
                          <div className="text-sm text-slate-400">Slack Access</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom Messages */}
                  {client.welcome_message && (
                    <Card className="bg-[#060818]/90 rounded-2xl border border-[#F2C94C]/20 p-6 md:p-8 shadow-[#F2C94C]/5">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold text-white pl-3 border-l-4 border-[#F2C94C]">
                          Welcome Message
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300">{client.welcome_message}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Time Tracking */}
                  <ClientTimeTracking
                    clientId={client.id}
                    clientName={client.name}
                    clientACV={client.revenue_amount}
                    clientPackage={client.success_package}
                  />
                </div>

                {/* Sidebar - 4 cols on xl, 12 on <lg */}
                <div className="col-span-12 xl:col-span-4 space-y-6">
                  {/* Quick Actions */}
                  <Card className="bg-[#060818]/90 rounded-2xl border border-[#F2C94C]/20 p-6 md:p-8 shadow-[#F2C94C]/5">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-white pl-3 border-l-4 border-[#F2C94C]">
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Link href={`/admin/clients/${client.id}/edit`} className="w-full flex items-center gap-3 bg-[#10152b] hover:bg-[#161c36] text-white py-2.5 px-4 rounded-lg transition-colors">
                        <Edit className="text-[#F2C94C]" />
                        <span className="flex-1 text-left">Edit Client</span>
                      </Link>
                      <Link href={`/admin/clients/${client.id}/integrations`} className="w-full flex items-center gap-3 bg-[#10152b] hover:bg-[#161c36] text-white py-2.5 px-4 rounded-lg transition-colors">
                        <Zap className="text-[#F2C94C]" />
                        <span className="flex-1 text-left">Manage Integrations</span>
                      </Link>
                      <Link href={`/admin/clients/${client.id}/tracking`} className="w-full flex items-center gap-3 bg-[#10152b] hover:bg-[#161c36] text-white py-2.5 px-4 rounded-lg transition-colors">
                        <BarChart3 className="text-[#F2C94C]" />
                        <span className="flex-1 text-left">Project Tracking</span>
                      </Link>
                      <Link href={`/admin/clients/${client.id}/milestones`} className="w-full flex items-center gap-3 bg-[#10152b] hover:bg-[#161c36] text-white py-2.5 px-4 rounded-lg transition-colors">
                        <Flag className="text-[#F2C94C]" />
                        <span className="flex-1 text-left">Implementation Milestones</span>
                      </Link>
                      <Link href={`/admin/clients/${client.id}/features`} className="w-full flex items-center gap-3 bg-[#10152b] hover:bg-[#161c36] text-white py-2.5 px-4 rounded-lg transition-colors">
                        <Settings className="text-[#F2C94C]" />
                        <span className="flex-1 text-left">Manage Features</span>
                      </Link>
                      {client.slug && client.slug.trim() !== '' ? (
                        <Link href={`/client/${client.slug}`} target="_blank" className="w-full flex items-center gap-3 bg-[#10152b] hover:bg-[#161c36] text-white py-2.5 px-4 rounded-lg transition-colors">
                          <ExternalLink className="text-[#F2C94C]" />
                          <span className="flex-1 text-left">View Client Portal</span>
                        </Link>
                      ) : (
                        <button className="w-full flex items-center gap-3 bg-[#10152b] text-slate-500 py-2.5 px-4 rounded-lg cursor-not-allowed" disabled title="Client needs a slug to view portal. Please edit the client to add a slug.">
                          <ExternalLink className="text-slate-500" />
                          <span className="flex-1 text-left">View Client Portal</span>
                        </button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Client Assets */}
                  <Card className="bg-[#060818]/90 rounded-2xl border border-[#F2C94C]/20 p-6 md:p-8 shadow-[#F2C94C]/5">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-white pl-3 border-l-4 border-[#F2C94C]">
                        Client Assets
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-400">Logo URL</label>
                        <p className="text-sm text-slate-100 break-all">{client.logo_url || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-400">Video URL</label>
                        <p className="text-sm text-slate-100 break-all">{client.video_url || "Not provided"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Settings */}
                  <Card className="bg-[#060818]/90 rounded-2xl border border-[#F2C94C]/20 p-6 md:p-8 shadow-[#F2C94C]/5">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-white pl-3 border-l-4 border-[#F2C94C]">
                        Portal Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Show Zapier Integrations</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${client.show_zapier_integrations ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {client.show_zapier_integrations ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Projects Enabled</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${client.projects_enabled ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {client.projects_enabled ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Show Feedback & Requests Board</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${client.feedback_board_enabled ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {client.feedback_board_enabled ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Enable Workflow Builder</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${client.workflow_builder_enabled ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {client.workflow_builder_enabled ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Show Figma Workflow</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${client.show_figma_workflow ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {client.show_figma_workflow ? "Yes" : "No"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timestamps */}
                  <Card className="bg-[#060818]/90 rounded-2xl border border-[#F2C94C]/20 p-6 md:p-8 shadow-[#F2C94C]/5">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-white pl-3 border-l-4 border-[#F2C94C]">
                        Timestamps
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-400">Created</label>
                        <p className="text-sm text-slate-100">{new Date(client.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-400">Last Updated</label>
                        <p className="text-sm text-slate-100">{new Date(client.updated_at).toLocaleDateString()}</p>
                      </div>
                      
                      {/* Milestone dates based on package type */}
                      {client.success_package === "light" && client.light_onboarding_call_date && (
                        <div>
                          <label className="text-sm font-medium text-slate-400">Onboarding Call</label>
                          <p className="text-sm text-slate-100">{new Date(client.light_onboarding_call_date).toLocaleDateString()}</p>
                        </div>
                      )}
                      
                      {client.success_package === "premium" && (
                        <>
                          {client.premium_first_call_date && (
                            <div>
                              <label className="text-sm font-medium text-slate-400">1st Onboarding Call</label>
                              <p className="text-sm text-slate-100">{new Date(client.premium_first_call_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {client.premium_second_call_date && (
                            <div>
                              <label className="text-sm font-medium text-slate-400">2nd Onboarding Call</label>
                              <p className="text-sm text-slate-100">{new Date(client.premium_second_call_date).toLocaleDateString()}</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {client.success_package === "gold" && (
                        <>
                          {client.gold_first_call_date && (
                            <div>
                              <label className="text-sm font-medium text-slate-400">1st Onboarding Call</label>
                              <p className="text-sm text-slate-100">{new Date(client.gold_first_call_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {client.gold_second_call_date && (
                            <div>
                              <label className="text-sm font-medium text-slate-400">2nd Onboarding Call</label>
                              <p className="text-sm text-slate-100">{new Date(client.gold_second_call_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {client.gold_third_call_date && (
                            <div>
                              <label className="text-sm font-medium text-slate-400">3rd Onboarding Call</label>
                              <p className="text-sm text-slate-100">{new Date(client.gold_third_call_date).toLocaleDateString()}</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {client.success_package === "elite" && (
                        <>
                          {client.elite_configurations_started_date && (
                            <div>
                              <label className="text-sm font-medium text-slate-400">Configurations Started</label>
                              <p className="text-sm text-slate-100">{new Date(client.elite_configurations_started_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {client.elite_integrations_started_date && (
                            <div>
                              <label className="text-sm font-medium text-slate-400">Integrations Started</label>
                              <p className="text-sm text-slate-100">{new Date(client.elite_integrations_started_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {client.elite_verification_completed_date && (
                            <div>
                              <label className="text-sm font-medium text-slate-400">Verification Completed</label>
                              <p className="text-sm text-slate-100">{new Date(client.elite_verification_completed_date).toLocaleDateString()}</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {client.graduation_date && (
                        <div>
                          <label className="text-sm font-medium text-slate-400">Graduation Date</label>
                          <p className="text-sm text-slate-100">{new Date(client.graduation_date).toLocaleDateString()}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </PasswordProtection>
  )
}
