import { PasswordProtection } from "@/components/password-protection"
import { AdminSidebar } from "@/components/admin-sidebar"
import { EditClientForm } from "@/components/edit-client-form"
import { getClientById } from "@/lib/database"
import { notFound } from "next/navigation"

interface EditClientPageProps {
  params: {
    id: string
  }
}

export default async function EditClientPage({ params }: EditClientPageProps) {
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
      <div className="flex h-screen bg-gradient-to-b from-[#0a0b1a] via-[#10122b] to-[#1a1c3a]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 pt-8 pb-24">
            {/* Page Title Block */}
            <div className="rounded-lg border border-[#e7b86833] p-8 mb-8 bg-[#02051b]/60">
              <h1 className="text-3xl font-bold text-white mb-2">Edit Client</h1>
              <p className="text-slate-400">Update {client.name}'s information and settings</p>
            </div>
            
            {/* Form Panel */}
            <div className="rounded-lg border border-[#e7b86833] p-8 bg-[#02051b]/60">
              <EditClientForm client={client} />
            </div>
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
