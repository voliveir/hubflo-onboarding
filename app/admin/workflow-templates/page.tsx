import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"
import AdminWorkflowTemplatesManager from "@/components/admin-workflow-templates-manager"

export default function AdminWorkflowTemplatesPage() {
  return (
    <PasswordProtection>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Workflow Templates</h1>
              <p className="text-gray-600">Create and manage workflow templates for all clients. Templates saved here will be available for clients to load in their workflow builder.</p>
            </div>
            <AdminWorkflowTemplatesManager />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
} 