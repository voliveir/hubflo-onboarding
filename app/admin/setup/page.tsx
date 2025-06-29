import { AdminSidebar } from "@/components/admin-sidebar"
import { DatabaseStatusCheck } from "@/components/database-status-check"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, AlertTriangle } from "lucide-react"
import { PasswordProtection } from "@/components/password-protection"

export default function AdminSetupPage() {
  return (
    <PasswordProtection>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Database Setup</h1>
              <p className="text-gray-600">Initialize and manage your database schema</p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Database Status</CardTitle>
                <CardDescription>Check the status of your database tables and run setup scripts</CardDescription>
              </CardHeader>
              <CardContent>
                <DatabaseStatusCheck />
              </CardContent>
            </Card>

            {/* Setup Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Setup Instructions
                </CardTitle>
                <CardDescription>Follow these steps to set up your database properly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Create Clients Table</h4>
                      <p className="text-sm text-gray-600">
                        Run script: <code className="bg-gray-100 px-1 rounded">001-create-clients-table.sql</code>
                      </p>
                      <Badge variant="outline" className="mt-1">
                        Required
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Seed Sample Data</h4>
                      <p className="text-sm text-gray-600">
                        Run script: <code className="bg-gray-100 px-1 rounded">002-seed-sample-data.sql</code>
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        Optional
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Fix Package Constraints</h4>
                      <p className="text-sm text-gray-600">
                        Run script:{" "}
                        <code className="bg-gray-100 px-1 rounded">003-fix-success-package-constraint.sql</code>
                      </p>
                      <Badge variant="outline" className="mt-1">
                        Required
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Add Project Tracking</h4>
                      <p className="text-sm text-gray-600">
                        Run script: <code className="bg-gray-100 px-1 rounded">004-add-project-tracking.sql</code>
                      </p>
                      <Badge variant="outline" className="mt-1">
                        Required
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">5</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Add Client Integrations</h4>
                      <p className="text-sm text-gray-600">
                        Run script: <code className="bg-gray-100 px-1 rounded">005-add-client-integrations.sql</code>
                      </p>
                      <Badge variant="outline" className="mt-1">
                        Required
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">6</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Create Master Integrations</h4>
                      <p className="text-sm text-gray-600">
                        Run script: <code className="bg-gray-100 px-1 rounded">006-create-master-integrations.sql</code>
                      </p>
                      <Badge variant="outline" className="mt-1">
                        Required
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Scripts must be run in the correct order (001, 002, 003, etc.)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>You can run these scripts directly in your Supabase SQL editor</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>The sample data script (002) is optional but recommended for testing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>After running all scripts, refresh this page to verify the setup</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
