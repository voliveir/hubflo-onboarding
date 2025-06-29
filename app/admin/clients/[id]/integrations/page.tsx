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
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{client.name} - Integrations</h1>
              <p className="text-gray-600">Manage integrations for this client</p>
            </div>
            <ClientIntegrationManager clientId={client.id} />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
