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
              <h1 className="text-3xl font-bold text-gray-900">Edit Client</h1>
              <p className="text-gray-600">Update {client.name}'s information and settings</p>
            </div>
            <EditClientForm client={client} />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
