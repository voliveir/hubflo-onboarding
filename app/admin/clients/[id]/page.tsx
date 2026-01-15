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
        return "bg-green-100 text-green-800 border border-green-200"
      case "inactive":
        return "bg-red-100 text-red-800 border border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      case "draft":
        return "bg-gray-100 text-gray-800 border border-gray-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  const getPackageColor = (pkg: string) => {
    switch (pkg.toLowerCase()) {
      case "light":
        return "bg-blue-100 text-blue-800 border border-blue-200"
      case "premium":
        return "bg-purple-100 text-purple-800 border border-purple-200"
      case "gold":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      case "elite":
        return "bg-red-100 text-red-800 border border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  const getProgressStatusColor = (completed: boolean) => {
    return completed ? "text-green-600" : "text-red-600"
  }

  const getProgressStatusIcon = (completed: boolean) => {
    return completed ? <CheckCircle className="h-8 w-8 text-green-600" /> : <XCircle className="h-8 w-8 text-red-600" />
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
      <div className="flex h-screen bg-white">
        <AdminSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-6 py-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-5xl lg:text-6xl font-bold mb-4" style={{color: '#060520'}}>{client.name}</h1>
                  <p className="text-xl leading-relaxed" style={{color: '#64748b'}}>Client Details & Management</p>
                </div>
                <div className="flex space-x-3">
                  {client.slug && client.slug.trim() !== '' ? (
                    <Button variant="outline" asChild className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Link href={`/client/${client.slug}`} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Portal
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" disabled className="bg-white border border-gray-300 text-gray-400 cursor-not-allowed" title="Client needs a slug to view portal. Please edit the client to add a slug.">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Portal
                    </Button>
                  )}
                  <Button asChild className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-semibold hover:brightness-110 border border-brand-gold/70">
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
                  <Card className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold pl-3 border-l-4 border-brand-gold flex items-center gap-2" style={{color: '#060520'}}>
                        <User className="h-5 w-5 text-brand-gold" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-12 gap-y-2">
                        <dt className="col-span-4 text-right text-gray-600">Client Name</dt>
                        <dd className="col-span-8" style={{color: '#060520'}}>{client.name}</dd>
                        
                        <dt className="col-span-4 text-right text-gray-600">Status</dt>
                        <dd className="col-span-8">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(client.status)}`}>
                            {client.status}
                          </span>
                        </dd>
                        
                        <dt className="col-span-4 text-right text-gray-600">Email</dt>
                        <dd className="col-span-8" style={{color: '#060520'}}>{client.email || "Not provided"}</dd>
                        
                        <dt className="col-span-4 text-right text-gray-600">Portal Slug</dt>
                        <dd className="col-span-8 font-mono" style={{color: '#060520'}}>{client.slug}</dd>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Package & Billing */}
                  <Card className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold pl-3 border-l-4 border-brand-gold flex items-center gap-2" style={{color: '#060520'}}>
                        <Package className="h-5 w-5 text-brand-gold" />
                        Package & Billing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-12 gap-y-2">
                        <dt className="col-span-4 text-right text-gray-600">Success Package</dt>
                        <dd className="col-span-8">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getPackageColor(client.success_package)}`}>
                            {client.success_package}
                          </span>
                        </dd>
                        
                        <dt className="col-span-4 text-right text-gray-600">Billing Type</dt>
                        <dd className="col-span-8 capitalize" style={{color: '#060520'}}>{client.billing_type}</dd>
                        
                        <dt className="col-span-4 text-right text-gray-600">Number of Users</dt>
                        <dd className="col-span-8" style={{color: '#060520'}}>{client.number_of_users || "Not specified"}</dd>
                        
                        <dt className="col-span-4 text-right text-gray-600">Custom App</dt>
                        <dd className="col-span-8" style={{color: '#060520'}}>{getCustomAppLabel(client.custom_app)}</dd>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Implementation Progress */}
                  <Card className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold pl-3 border-l-4 border-brand-gold flex items-center gap-2" style={{color: '#060520'}}>
                        <BarChart3 className="h-5 w-5 text-brand-gold" />
                        Implementation Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4">
                        <div className="w-full sm:w-1/2 lg:w-1/3 bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
                          <div className="text-3xl font-bold text-blue-600">{client.calls_completed}</div>
                          <div className="text-sm text-gray-600">Calls Completed</div>
                        </div>
                        <div className="w-full sm:w-1/2 lg:w-1/3 bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
                          <div className="text-3xl font-bold text-green-600">{client.forms_setup}</div>
                          <div className="text-sm text-gray-600">Forms Setup</div>
                        </div>
                        <div className="w-full sm:w-1/2 lg:w-1/3 bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
                          <div className="text-3xl font-bold text-purple-600">{client.smartdocs_setup}</div>
                          <div className="text-sm text-gray-600">SmartDocs Setup</div>
                        </div>
                        <div className="w-full sm:w-1/2 lg:w-1/3 bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
                          <div className="text-3xl font-bold text-orange-600">{client.zapier_integrations_setup}</div>
                          <div className="text-sm text-gray-600">Zapier Integrations</div>
                        </div>
                        <div className="w-full sm:w-1/2 lg:w-1/3 bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
                          <div className="text-3xl font-bold">
                            {getProgressStatusIcon(client.migration_completed)}
                          </div>
                          <div className="text-sm text-gray-600">Migration</div>
                        </div>
                        <div className="w-full sm:w-1/2 lg:w-1/3 bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
                          <div className="text-3xl font-bold">
                            {getProgressStatusIcon(client.slack_access_granted)}
                          </div>
                          <div className="text-sm text-gray-600">Slack Access</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom Messages */}
                  {client.welcome_message && (
                    <Card className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold pl-3 border-l-4 border-brand-gold" style={{color: '#060520'}}>
                          Welcome Message
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{client.welcome_message}</p>
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
                  <Card className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold pl-3 border-l-4 border-brand-gold" style={{color: '#060520'}}>
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Link href={`/admin/clients/${client.id}/edit`} className="w-full flex items-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg transition-colors border border-gray-200">
                        <Edit className="text-brand-gold" />
                        <span className="flex-1 text-left">Edit Client</span>
                      </Link>
                      <Link href={`/admin/clients/${client.id}/integrations`} className="w-full flex items-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg transition-colors border border-gray-200">
                        <Zap className="text-brand-gold" />
                        <span className="flex-1 text-left">Manage Integrations</span>
                      </Link>
                      <Link href={`/admin/clients/${client.id}/tracking`} className="w-full flex items-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg transition-colors border border-gray-200">
                        <BarChart3 className="text-brand-gold" />
                        <span className="flex-1 text-left">Project Tracking</span>
                      </Link>
                      <Link href={`/admin/clients/${client.id}/milestones`} className="w-full flex items-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg transition-colors border border-gray-200">
                        <Flag className="text-brand-gold" />
                        <span className="flex-1 text-left">Implementation Milestones</span>
                      </Link>
                      <Link href={`/admin/clients/${client.id}/features`} className="w-full flex items-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg transition-colors border border-gray-200">
                        <Settings className="text-brand-gold" />
                        <span className="flex-1 text-left">Manage Features</span>
                      </Link>
                      {client.slug && client.slug.trim() !== '' ? (
                        <Link href={`/client/${client.slug}`} target="_blank" className="w-full flex items-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg transition-colors border border-gray-200">
                          <ExternalLink className="text-brand-gold" />
                          <span className="flex-1 text-left">View Client Portal</span>
                        </Link>
                      ) : (
                        <button className="w-full flex items-center gap-3 bg-gray-50 text-gray-400 py-2.5 px-4 rounded-lg cursor-not-allowed border border-gray-200" disabled title="Client needs a slug to view portal. Please edit the client to add a slug.">
                          <ExternalLink className="text-gray-400" />
                          <span className="flex-1 text-left">View Client Portal</span>
                        </button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Client Assets */}
                  <Card className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold pl-3 border-l-4 border-brand-gold" style={{color: '#060520'}}>
                        Client Assets
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Logo URL</label>
                        <p className="text-sm break-all" style={{color: '#060520'}}>{client.logo_url || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Video URL</label>
                        <p className="text-sm break-all" style={{color: '#060520'}}>{client.video_url || "Not provided"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Settings */}
                  <Card className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold pl-3 border-l-4 border-brand-gold" style={{color: '#060520'}}>
                        Portal Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Show Zapier Integrations</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${client.show_zapier_integrations ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                          {client.show_zapier_integrations ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Projects Enabled</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${client.projects_enabled ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                          {client.projects_enabled ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Show Feedback & Requests Board</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${client.feedback_board_enabled ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                          {client.feedback_board_enabled ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Enable Workflow Builder</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${client.workflow_builder_enabled ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                          {client.workflow_builder_enabled ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Show Figma Workflow</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${client.show_figma_workflow ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                          {client.show_figma_workflow ? "Yes" : "No"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timestamps */}
                  <Card className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold pl-3 border-l-4 border-brand-gold" style={{color: '#060520'}}>
                        Timestamps
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Created</label>
                        <p className="text-sm" style={{color: '#060520'}}>{new Date(client.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Last Updated</label>
                        <p className="text-sm" style={{color: '#060520'}}>{new Date(client.updated_at).toLocaleDateString()}</p>
                      </div>
                      
                      {/* Milestone dates based on package type */}
                      {client.success_package === "light" && client.light_onboarding_call_date && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Onboarding Call</label>
                          <p className="text-sm" style={{color: '#060520'}}>{new Date(client.light_onboarding_call_date).toLocaleDateString()}</p>
                        </div>
                      )}
                      
                      {client.success_package === "premium" && (
                        <>
                          {client.premium_first_call_date && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">1st Onboarding Call</label>
                              <p className="text-sm" style={{color: '#060520'}}>{new Date(client.premium_first_call_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {client.premium_second_call_date && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">2nd Onboarding Call</label>
                              <p className="text-sm" style={{color: '#060520'}}>{new Date(client.premium_second_call_date).toLocaleDateString()}</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {client.success_package === "gold" && (
                        <>
                          {client.gold_first_call_date && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">1st Onboarding Call</label>
                              <p className="text-sm" style={{color: '#060520'}}>{new Date(client.gold_first_call_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {client.gold_second_call_date && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">2nd Onboarding Call</label>
                              <p className="text-sm" style={{color: '#060520'}}>{new Date(client.gold_second_call_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {client.gold_third_call_date && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">3rd Onboarding Call</label>
                              <p className="text-sm" style={{color: '#060520'}}>{new Date(client.gold_third_call_date).toLocaleDateString()}</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {client.success_package === "elite" && (
                        <>
                          {client.elite_configurations_started_date && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Configurations Started</label>
                              <p className="text-sm" style={{color: '#060520'}}>{new Date(client.elite_configurations_started_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {client.elite_integrations_started_date && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Integrations Started</label>
                              <p className="text-sm" style={{color: '#060520'}}>{new Date(client.elite_integrations_started_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {client.elite_verification_completed_date && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Verification Completed</label>
                              <p className="text-sm" style={{color: '#060520'}}>{new Date(client.elite_verification_completed_date).toLocaleDateString()}</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {client.graduation_date && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Graduation Date</label>
                          <p className="text-sm" style={{color: '#060520'}}>{new Date(client.graduation_date).toLocaleDateString()}</p>
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
