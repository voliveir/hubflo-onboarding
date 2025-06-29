import { AdminDashboard } from "@/components/admin-dashboard"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"

export default function AdminPage() {
  return (
    <PasswordProtection>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your Hubflo onboarding platform</p>
            </div>
            <AdminDashboard />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
