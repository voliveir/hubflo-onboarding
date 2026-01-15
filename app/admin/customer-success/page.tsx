import { AdminSidebar } from "@/components/admin-sidebar";
import { PasswordProtection } from "@/components/password-protection";
import { CustomerSuccessManager } from "@/components/customer-success-manager";

export default function CustomerSuccessPage() {
  return (
    <PasswordProtection>
      <div className="flex h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-6 py-2 mb-6">
                <span className="text-brand-gold font-medium text-sm">Customer Success</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4" style={{color: '#060520'}}>
                Customer 360 Overview
              </h1>
              <p className="text-xl max-w-4xl leading-relaxed" style={{color: '#64748b'}}>Unified view of every customer. (Feature coming soon)</p>
            </div>
            {/* TODO: Add Customer 360 content here */}
            <CustomerSuccessManager />
          </div>
        </main>
      </div>
    </PasswordProtection>
  );
} 