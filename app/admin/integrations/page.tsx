"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Database } from "lucide-react"
import Link from "next/link"
import { MasterIntegrationsManager } from "@/components/master-integrations-manager"
import { supabase } from "@/lib/supabase"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PasswordProtection } from "@/components/password-protection"

export default function IntegrationsPage() {
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkTableExists() {
      try {
        // Try to query the integrations table
        const { error } = await supabase.from("integrations").select("id").limit(1)

        if (error) {
          if (error.message.includes("does not exist")) {
            setTableExists(false)
          } else {
            console.error("Error checking table:", error)
            setTableExists(false)
          }
        } else {
          setTableExists(true)
        }
      } catch (err) {
        console.error("Error checking table:", err)
        setTableExists(false)
      } finally {
        setLoading(false)
      }
    }

    checkTableExists()
  }, [])

  if (loading) {
    return (
      <PasswordProtection>
        <div className="min-h-screen bg-gradient-to-br from-[#10122b] to-[#181a2f]">
          <div className="fixed left-0 top-0 h-screen w-64 z-30">
            <AdminSidebar />
          </div>
          <main className="ml-64 flex-1 overflow-y-auto min-h-screen">
            <div className="p-8">
              <div className="w-full bg-[#10122b] px-8 pt-8 pb-6 rounded-2xl shadow-lg ring-1 ring-[#F2C94C]/30 mb-8">
                <h1 className="text-3xl font-bold text-white mb-1">Master Integrations</h1>
                <p className="text-white/80">Loading...</p>
              </div>
            </div>
          </main>
        </div>
      </PasswordProtection>
    )
  }

  if (tableExists === false) {
    return (
      <PasswordProtection>
        <div className="min-h-screen bg-gradient-to-br from-[#10122b] to-[#181a2f]">
          <div className="fixed left-0 top-0 h-screen w-64 z-30">
            <AdminSidebar />
          </div>
          <main className="ml-64 flex-1 overflow-y-auto min-h-screen">
            <div className="p-8">
              <div className="w-full bg-[#10122b] px-8 pt-8 pb-6 rounded-2xl shadow-lg ring-1 ring-[#F2C94C]/30 mb-8">
                <h1 className="text-3xl font-bold text-white mb-1">Master Integrations</h1>
                <p className="text-white/80">Manage the master list of available integrations</p>
              </div>

              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Database Setup Required</strong>
                  <br />
                  The integrations table doesn't exist yet. Please run the database setup scripts first.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Setup Required
                  </CardTitle>
                  <CardDescription>
                    You need to run the database migration scripts to create the integrations table.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/admin/setup">
                      <Database className="mr-2 h-4 w-4" />
                      Go to Database Setup
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </PasswordProtection>
    )
  }

  return (
    <PasswordProtection>
      <div className="min-h-screen bg-gradient-to-br from-[#10122b] to-[#181a2f]">
        <div className="fixed left-0 top-0 h-screen w-64 z-30">
          <AdminSidebar />
        </div>
        <main className="ml-64 flex-1 overflow-y-auto min-h-screen">
          <div className="p-8">
            <div className="w-full bg-[#10122b] px-8 pt-8 pb-6 rounded-2xl shadow-lg ring-1 ring-[#F2C94C]/30 mb-8">
              <h1 className="text-3xl font-bold text-white mb-1">Master Integrations</h1>
              <p className="text-white/80">Manage the master list of available integrations</p>
            </div>
            <MasterIntegrationsManager />
          </div>
        </main>
      </div>
    </PasswordProtection>
  )
}
