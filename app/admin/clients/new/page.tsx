import { CreateClientForm } from "@/components/create-client-form"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"

export default function NewClientPage() {
  return (
    <PasswordProtection>
      <div className="flex h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-6xl mx-auto px-8 pt-8 pb-24">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
                <span className="text-brand-gold font-medium text-sm">Client Portal</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4" style={{color: '#060520'}}>
                Add a New Client
              </h1>
              <p className="text-xl max-w-4xl leading-relaxed" style={{color: '#64748b'}}>Create a new client portal with customized onboarding experience</p>
            </div>
            
            {/* Form Panel */}
            <div className="rounded-lg border border-gray-200 p-8 bg-white shadow-sm">
              <CreateClientForm />
            </div>
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
