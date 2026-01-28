import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"
import { UniversityManager } from "@/components/university-manager"

export default function UniversityPage() {
  return (
    <PasswordProtection>
      <div className="min-h-screen bg-white">
        <div className="fixed left-0 top-0 h-screen w-64 z-30">
          <AdminSidebar />
        </div>
        <main className="ml-64 flex-1 overflow-y-auto min-h-screen bg-gray-50">
          <div className="p-8">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
                <span className="text-brand-gold font-medium text-sm">Education</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4" style={{color: '#060520'}}>
                Hubflo University
              </h1>
              <p className="text-xl max-w-4xl leading-relaxed" style={{color: '#64748b'}}>
                Manage courses, lectures, quizzes, and educational content for client onboarding
              </p>
            </div>
            <UniversityManager />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
