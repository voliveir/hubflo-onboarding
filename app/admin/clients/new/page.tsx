import { CreateClientForm } from "@/components/create-client-form"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"

export default function NewClientPage() {
  return (
    <PasswordProtection>
      <div className="flex h-screen bg-gradient-to-b from-[#0a0b1a] via-[#10122b] to-[#1a1c3a]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 pt-8 pb-24">
            {/* Page Title Block */}
            <div className="rounded-lg border border-[#e7b86833] p-8 mb-8 bg-[#02051b]/60">
              <h1 className="text-3xl font-bold text-white mb-2">Add a New Client</h1>
              <p className="text-slate-400">Create a new client portal with customized onboarding experience</p>
            </div>
            
            {/* Form Panel */}
            <div className="rounded-lg border border-[#e7b86833] p-8 bg-[#02051b]/60">
              <CreateClientForm />
            </div>
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
