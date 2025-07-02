import { notFound } from "next/navigation"
import { getClientById } from "@/lib/database"
import { PasswordProtection } from "@/components/password-protection"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Package, ExternalLink, Edit, Settings, BarChart3, Zap } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: {
    id: string
  }
}

export default async function ClientDetailPage({ params }: PageProps) {
  const client = await getClientById(params.id)

  if (!client) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPackageColor = (pkg: string) => {
    switch (pkg.toLowerCase()) {
      case "light":
        return "bg-blue-100 text-blue-800"
      case "premium":
        return "bg-purple-100 text-purple-800"
      case "gold":
        return "bg-yellow-100 text-yellow-800"
      case "elite":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-6 py-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
                  <p className="text-gray-600">Client Details & Management</p>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" asChild>
                    <Link href={`/client/${client.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Portal
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/admin/clients/${client.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Client
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Client Name</label>
                          <p className="text-gray-900 font-medium">{client.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <div className="mt-1">
                            <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-900">{client.email || "Not provided"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <p className="text-gray-900">{client.phone || "Not provided"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Company</label>
                          <p className="text-gray-900">{client.company || "Not provided"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Portal Slug</label>
                          <p className="text-gray-900 font-mono">{client.slug}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Package & Billing */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Package & Billing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Success Package</label>
                          <div className="mt-1">
                            <Badge className={getPackageColor(client.success_package)}>{client.success_package}</Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Billing Type</label>
                          <p className="text-gray-900 capitalize">{client.billing_type}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Number of Users</label>
                          <p className="text-gray-900">{client.number_of_users || "Not specified"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Custom App</label>
                          <p className="text-gray-900">{getCustomAppLabel(client.custom_app)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Implementation Progress */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Implementation Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{client.calls_completed}</div>
                          <div className="text-sm text-gray-600">Calls Completed</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{client.forms_setup}</div>
                          <div className="text-sm text-gray-600">Forms Setup</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{client.smartdocs_setup}</div>
                          <div className="text-sm text-gray-600">SmartDocs Setup</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{client.zapier_integrations_setup}</div>
                          <div className="text-sm text-gray-600">Zapier Integrations</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {client.migration_completed ? "✓" : "✗"}
                          </div>
                          <div className="text-sm text-gray-600">Migration</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-indigo-600">
                            {client.slack_access_granted ? "✓" : "✗"}
                          </div>
                          <div className="text-sm text-gray-600">Slack Access</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom Messages */}
                  {client.welcome_message && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Welcome Message</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{client.welcome_message}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                        <Link href={`/admin/clients/${client.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Client
                        </Link>
                      </Button>
                      <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                        <Link href={`/admin/clients/${client.id}/integrations`}>
                          <Zap className="h-4 w-4 mr-2" />
                          Manage Integrations
                        </Link>
                      </Button>
                      <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                        <Link href={`/admin/clients/${client.id}/tracking`}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Project Tracking
                        </Link>
                      </Button>
                      <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                        <Link href={`/admin/clients/${client.id}/features`}>
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Features
                        </Link>
                      </Button>
                      <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                        <Link href={`/client/${client.slug}`} target="_blank">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Client Portal
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Client Assets */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Client Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Logo URL</label>
                        <p className="text-sm text-gray-900 break-all">{client.logo_url || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Video URL</label>
                        <p className="text-sm text-gray-900 break-all">{client.video_url || "Not provided"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Portal Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Show Zapier Integrations</span>
                        <Badge variant={client.show_zapier_integrations ? "default" : "secondary"}>
                          {client.show_zapier_integrations ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Projects Enabled</span>
                        <Badge variant={client.projects_enabled ? "default" : "secondary"}>
                          {client.projects_enabled ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Show Feedback & Requests Board</span>
                        <Badge variant={client.feedback_board_enabled ? "default" : "secondary"}>
                          {client.feedback_board_enabled ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Enable Workflow Builder</span>
                        <Badge variant={client.workflow_builder_enabled ? "default" : "secondary"}>
                          {client.workflow_builder_enabled ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Show Figma Workflow</span>
                        <Badge variant={client.show_figma_workflow ? "default" : "secondary"}>
                          {client.show_figma_workflow ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timestamps */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Timestamps</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created</label>
                        <p className="text-sm text-gray-900">{new Date(client.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                        <p className="text-sm text-gray-900">{new Date(client.updated_at).toLocaleDateString()}</p>
                      </div>
                      
                      {/* Milestone dates based on package type */}
                      {client.success_package === "light" && client.light_onboarding_call_date && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Onboarding Call</label>
                          <p className="text-sm text-gray-900">{new Date(client.light_onboarding_call_date).toLocaleDateString()}</p>
                        </div>
                      )}
                      
                      {client.success_package === "premium" && (
                        <>
                          {client.premium_first_call_date && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">1st Onboarding Call</label>
                              <p className="text-sm text-gray-900">{new Date(client.premium_first_call_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {client.premium_second_call_date && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">2nd Onboarding Call</label>
                              <p className="text-sm text-gray-900">{new Date(client.premium_second_call_date).toLocaleDateString()}</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {client.success_package === "gold" && (
                        <>
                          {client.gold_first_call_date && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">1st Onboarding Call</label>
                              <p className="text-sm text-gray-900">{new Date(client.gold_first_call_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {client.gold_second_call_date && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">2nd Onboarding Call</label>
                              <p className="text-sm text-gray-900">{new Date(client.gold_second_call_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {client.gold_third_call_date && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">3rd Onboarding Call</label>
                              <p className="text-sm text-gray-900">{new Date(client.gold_third_call_date).toLocaleDateString()}</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {client.success_package === "elite" && (
                        <>
                          {client.elite_configurations_started_date && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Configurations Started</label>
                              <p className="text-sm text-gray-900">{new Date(client.elite_configurations_started_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {client.elite_integrations_started_date && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Integrations Started</label>
                              <p className="text-sm text-gray-900">{new Date(client.elite_integrations_started_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {client.elite_verification_completed_date && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Verification Completed</label>
                              <p className="text-sm text-gray-900">{new Date(client.elite_verification_completed_date).toLocaleDateString()}</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {client.graduation_date && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Graduation Date</label>
                          <p className="text-sm text-gray-900">{new Date(client.graduation_date).toLocaleDateString()}</p>
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
