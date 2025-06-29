import { PasswordProtection } from "@/components/password-protection"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ClientsManager } from "@/components/clients-manager"

export default function ClientsPage() {
  return (
    <PasswordProtection>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
              <p className="text-gray-600">Manage all your clients and their onboarding progress</p>
            </div>
            <ClientsManager />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
