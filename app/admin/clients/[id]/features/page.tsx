import { ClientFeaturesManager } from "@/components/client-features-manager"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"
import { getClientFeatures, getAllFeatures, getClientById } from "@/lib/database"
import { notFound } from "next/navigation"
import type { ClientFeature, Feature, Client } from "@/lib/types"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ClientFeaturesPage({ params }: PageProps) {
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

  // Fetch all data server-side
  const [clientFeatures, availableFeatures, client] = await Promise.all([
    getClientFeatures(clientId),
    getAllFeatures(),
    getClientById(clientId),
  ])

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-5xl mx-auto px-8 pt-8">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
                <span className="text-brand-gold font-medium text-sm">Features</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4" style={{color: '#060520'}}>
                Client Features
              </h1>
              <p className="text-xl max-w-4xl leading-relaxed mb-8" style={{color: '#64748b'}}>Manage features and upselling opportunities for this client</p>
            </div>
            <ClientFeaturesManager
              clientFeatures={clientFeatures}
              availableFeatures={availableFeatures}
              client={client}
            />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
