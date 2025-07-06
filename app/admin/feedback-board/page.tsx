import { FeedbackBoardAdmin } from '@/components/FeedbackBoardAdmin';
import { AdminSidebar } from '@/components/admin-sidebar';
import { PasswordProtection } from '@/components/password-protection';

export default function FeedbackBoardAdminPage() {
  return (
    <PasswordProtection>
      <div className="min-h-screen bg-gradient-to-br from-[#10122b] to-[#181a2f]">
        <div className="fixed left-0 top-0 h-screen w-64 z-30">
          <AdminSidebar />
        </div>
        <main className="ml-64 flex-1 overflow-y-auto min-h-screen">
          <div className="p-8">
            <div className="w-full bg-gradient-to-r from-[#10122b] to-[#181a2f] px-8 pt-8 pb-6 rounded-2xl shadow-lg ring-1 ring-[#F2C94C]/30 mb-8">
              <h1 className="text-3xl font-bold text-white mb-1">Feedback Board</h1>
              <p className="text-white/80">Track and manage client-submitted bugs, feature requests, and improvements</p>
            </div>
            <FeedbackBoardAdmin />
          </div>
        </main>
      </div>
    </PasswordProtection>
  );
} 