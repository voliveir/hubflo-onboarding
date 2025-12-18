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
      <div className="flex h-screen bg-gradient-to-b from-[#10122b] to-[#0a0b1a]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">{client.name} - Implementation Milestones</h1>
              <p className="text-white/80">Manage implementation milestones and track progress</p>
            </div>
            <MilestonesManager client={client} />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
