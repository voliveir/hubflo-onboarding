import { AdminSidebar } from "@/components/admin-sidebar";
import { PasswordProtection } from "@/components/password-protection";
import { CustomerSuccessManager } from "@/components/customer-success-manager";

export default function CustomerSuccessPage() {
  return (
    <PasswordProtection>
      <div className="flex h-screen bg-gradient-to-br from-[#010124] via-[#0a0a2a] to-[#1a1a40]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-100">Customer 360 Overview</h1>
              <p className="text-gray-300">Unified view of every customer. (Feature coming soon)</p>
            </div>
            {/* TODO: Add Customer 360 content here */}
            <CustomerSuccessManager />
          </div>
        </main>
      </div>
    </PasswordProtection>
  );
} 