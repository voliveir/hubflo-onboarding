import { PasswordProtection } from "@/components/password-protection"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SettingsManager } from "@/components/settings-manager"

export default function SettingsPage() {
  return (
    <PasswordProtection>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
              <p className="text-gray-600">Configure global platform settings</p>
            </div>
            <SettingsManager />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
