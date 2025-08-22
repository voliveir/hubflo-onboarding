import { PasswordProtection } from "@/components/password-protection"
import { AdminSidebar } from "@/components/admin-sidebar"
import { GlobalMilestonesManager } from "@/components/global-milestones-manager"

export default function MilestonesPage() {
  return (
    <PasswordProtection>
      <div className="flex h-screen bg-gradient-to-b from-[#10122b] to-[#0a0b1a]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Implementation Milestones</h1>
              <p className="text-white/80">Manage milestone templates and global milestone settings</p>
            </div>
            <GlobalMilestonesManager />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
