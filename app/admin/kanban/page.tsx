import { KanbanBoard } from "@/components/kanban-board"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"

export default function KanbanPage() {
  return (
    <PasswordProtection>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
              <p className="text-gray-600">Track clients through their success package workflows</p>
            </div>
            <KanbanBoard />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
} 