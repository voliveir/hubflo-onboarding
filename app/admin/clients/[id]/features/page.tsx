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
      <div className="flex h-screen bg-gradient-to-b from-[#0a0b1a] via-[#10122b] to-[#1a1c3a]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 pt-8">
            <h1 className="text-3xl font-bold text-white mb-1">Client Features</h1>
            <p className="text-slate-400 mb-8">Manage features and upselling opportunities for this client</p>
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
