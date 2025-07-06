import { PasswordProtection } from "@/components/password-protection"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ClientIntegrationManager } from "@/components/client-integration-manager"
import { getClientById } from "@/lib/database"
import { notFound } from "next/navigation"

interface ClientIntegrationsPageProps {
  params: {
    id: string
  }
}

export default async function ClientIntegrationsPage({ params }: ClientIntegrationsPageProps) {
  const client = await getClientById(params.id)

  if (!client) {
    notFound()
  }

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-gradient-to-b from-[#0a0b1a] to-[#10122b]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1320px] mx-auto px-8 py-10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">{client.name} - Integrations</h1>
              <p className="text-white/80">Manage integrations for this client</p>
            </div>
            <ClientIntegrationManager clientId={client.id} clientName={client.name} />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
