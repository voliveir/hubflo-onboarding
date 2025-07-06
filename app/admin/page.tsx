import { AdminDashboard } from "@/components/admin-dashboard"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"

export default function AdminPage() {
  return (
    <PasswordProtection>
      <div className="flex h-screen bg-gradient-to-br from-[#010124] via-[#0a0a2a] to-[#1a1a40]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-100">Admin Dashboard</h1>
              <p className="text-gray-300">Manage your Hubflo onboarding platform</p>
            </div>
            <AdminDashboard />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
