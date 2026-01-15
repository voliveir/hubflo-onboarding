"use client";
import { PasswordProtection } from "@/components/password-protection"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ClientsManager } from "@/components/clients-manager"
import { useSearchParams } from "next/navigation"

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const status = searchParams?.get("status") || undefined;
  const implementationManager = searchParams?.get("implementation_manager") || undefined;
  return (
    <PasswordProtection>
      <div className="flex h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
                <span className="text-brand-gold font-medium text-sm">Client Portal</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4" style={{color: '#060520'}}>
                Client Management
              </h1>
              <p className="text-xl max-w-4xl leading-relaxed" style={{color: '#64748b'}}>Manage all your clients and their onboarding progress</p>
              {implementationManager && (
                <span className="inline-block mt-4 px-4 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold font-semibold text-sm">
                  Showing: {implementationManager.charAt(0).toUpperCase() + implementationManager.slice(1)}'s Clients
                </span>
              )}
            </div>
            <ClientsManager initialStatus={status} initialImplementationManager={implementationManager} />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
