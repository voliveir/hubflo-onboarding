"use client";
import { PasswordProtection } from "@/components/password-protection"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ClientsManager } from "@/components/clients-manager"
import { useSearchParams } from "next/navigation"

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const status = searchParams?.get("status") || undefined;
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
            <ClientsManager initialStatus={status} />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
