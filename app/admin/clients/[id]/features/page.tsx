import { ClientFeaturesManager } from "@/components/client-features-manager"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"
import { getClientFeatures, getAllFeatures, getClientById } from "@/lib/database"
import type { ClientFeature, Feature, Client } from "@/lib/types"

interface PageProps {
  params: {
    id: string
  }
}

export default async function ClientFeaturesPage({ params }: PageProps) {
  // Fetch all data server-side
  const [clientFeatures, availableFeatures, client] = await Promise.all([
    getClientFeatures(params.id),
    getAllFeatures(),
    getClientById(params.id),
  ])

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Client Features</h1>
              <p className="text-gray-600">Manage features and upselling opportunities for this client</p>
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
