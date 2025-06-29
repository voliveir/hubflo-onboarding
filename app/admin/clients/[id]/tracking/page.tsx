import { PasswordProtection } from "@/components/password-protection"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ProjectTrackingAdmin } from "@/components/project-tracking-admin"
import { getClientById } from "@/lib/database"
import { notFound } from "next/navigation"

interface ClientTrackingPageProps {
  params: {
    id: string
  }
}

export default async function ClientTrackingPage({ params }: ClientTrackingPageProps) {
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
              <h1 className="text-3xl font-bold text-gray-900">{client.name} - Project Tracking</h1>
              <p className="text-gray-600">Track implementation progress and milestones</p>
            </div>
            <ProjectTrackingAdmin client={client} />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
