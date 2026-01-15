import { PasswordProtection } from "@/components/password-protection"
import { AdminSidebar } from "@/components/admin-sidebar"
import { MilestonesManager } from "@/components/milestones-manager"
import { getClientById } from "@/lib/database"
import { notFound } from "next/navigation"

interface ClientMilestonesPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ClientMilestonesPage({ params }: ClientMilestonesPageProps) {
  const resolvedParams = await params
  const client = await getClientById(resolvedParams.id)

  if (!client) {
    notFound()
  }

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto p-8">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
                <span className="text-brand-gold font-medium text-sm">Milestones</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4" style={{color: '#060520'}}>
                {client.name} - Implementation Milestones
              </h1>
              <p className="text-xl max-w-4xl leading-relaxed" style={{color: '#64748b'}}>Manage implementation milestones and track progress</p>
            </div>
            <MilestonesManager client={client} />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
