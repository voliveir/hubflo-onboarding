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
      <div className="flex h-screen bg-gradient-to-br from-[#0a0b1a] via-[#10122b] to-[#1a1c3a]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <div className="bg-[#10122b]/90 ring-1 ring-[#F2C94C]/30 rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-white">Client Management</h1>
                <p className="text-white/80 mt-2">Manage all your clients and their onboarding progress</p>
                {implementationManager && (
                  <span className="inline-block mt-4 px-3 py-1 rounded-full bg-[#F2C94C]/10 text-[#F2C94C] font-semibold text-sm">
                    Showing: {implementationManager.charAt(0).toUpperCase() + implementationManager.slice(1)}'s Clients
                  </span>
                )}
              </div>
            </div>
            <ClientsManager initialStatus={status} initialImplementationManager={implementationManager} />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
