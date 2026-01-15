import { PasswordProtection } from "@/components/password-protection"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ClientIntegrationManager } from "@/components/client-integration-manager"
import { getClientById } from "@/lib/database"
import { notFound } from "next/navigation"

interface ClientIntegrationsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ClientIntegrationsPage({ params }: ClientIntegrationsPageProps) {
  const resolvedParams = await params
  const clientId = resolvedParams.id

  // Validate that we have a valid client ID
  if (!clientId || clientId === "undefined" || typeof clientId !== "string") {
    console.error("Invalid client ID:", clientId)
    notFound()
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(clientId)) {
    console.error("Client ID is not a valid UUID:", clientId)
    notFound()
  }

  const client = await getClientById(clientId)

  if (!client) {
    notFound()
  }

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-[1320px] mx-auto px-8 py-10">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
                <span className="text-brand-gold font-medium text-sm">Integrations</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4" style={{color: '#060520'}}>
                {client.name} - Integrations
              </h1>
              <p className="text-xl max-w-4xl leading-relaxed" style={{color: '#64748b'}}>Manage integrations for this client</p>
            </div>
            <ClientIntegrationManager clientId={client.id} clientName={client.name} />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
