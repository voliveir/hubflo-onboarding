"use client"

import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Client } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "waiting_for_approval", label: "Waiting for Approval" },
  { value: "complete", label: "Complete" },
]

const CHECKLIST_STEPS = [
  { key: "create_assets", label: "Create assets by duplicating Canva assets" },
  { key: "create_natively_app", label: "Create application in Natively" },
  { key: "create_test_user", label: "Create test user/portal" },
  { key: "test_login", label: "Test the application login locally" },
  { key: "download_and_create_ios_app", label: "Download the application from Natively and create a new application in iOS" },
  { key: "submit", label: "Submit" },
]

type WhiteLabelChecklist = {
  [key: string]: boolean | undefined
  create_assets?: boolean
  create_natively_app?: boolean
  create_test_user?: boolean
  test_login?: boolean
  download_and_create_ios_app?: boolean
  submit?: boolean
}

export default function MobileAppWhiteLabelPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  async function fetchClients() {
    setLoading(true)
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("name", { ascending: true })
    setLoading(false)
    if (error) return setClients([])
    setClients(data as Client[])
  }

  useEffect(() => {
    fetchClients()
  }, [])

  function WhiteLabelClientCard({ client }: { client: Client }) {
    const [localStatus, setLocalStatus] = useState<NonNullable<Client["white_label_status"]>>(client.white_label_status || "not_started")
    const [localChecklist, setLocalChecklist] = useState<WhiteLabelChecklist>(client.white_label_checklist || {})
    const [localAndroidUrl, setLocalAndroidUrl] = useState(client.white_label_android_url || "")
    const [localIosUrl, setLocalIosUrl] = useState(client.white_label_ios_url || "")
    const [dirty, setDirty] = useState(false)

    useEffect(() => {
      setLocalStatus(client.white_label_status || "not_started")
      setLocalChecklist(client.white_label_checklist || {})
      setLocalAndroidUrl(client.white_label_android_url || "")
      setLocalIosUrl(client.white_label_ios_url || "")
      setDirty(false)
    }, [client])

    useEffect(() => {
      if (
        localStatus !== (client.white_label_status || "not_started") ||
        JSON.stringify(localChecklist) !== JSON.stringify(client.white_label_checklist || {}) ||
        localAndroidUrl !== (client.white_label_android_url || "") ||
        localIosUrl !== (client.white_label_ios_url || "")
      ) {
        setDirty(true)
      } else {
        setDirty(false)
      }
    }, [localStatus, localChecklist, localAndroidUrl, localIosUrl, client])

    const handleChecklistChange = (stepKey: string, checked: boolean) => {
      setLocalChecklist((prev) => ({ ...prev, [stepKey]: checked }))
    }

    const handleSave = async () => {
      setSavingId(client.id)
      await supabase
        .from("clients")
        .update({
          white_label_status: localStatus,
          white_label_checklist: localChecklist,
          white_label_android_url: localAndroidUrl,
          white_label_ios_url: localIosUrl,
        })
        .eq("id", client.id)
      await fetchClients()
      setSavingId(null)
    }

    return (
      <Card className={`relative bg-white/90 ${savingId === client.id ? "opacity-60" : ""}`}>
        <CardHeader className="pb-2 flex-row items-center gap-2">
          <CardTitle className="text-xl flex-1 truncate">{client.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div>
            <Label className="mb-1">Android App URL</Label>
            <Input
              value={localAndroidUrl}
              onChange={e => setLocalAndroidUrl(e.target.value)}
              disabled={savingId === client.id}
              placeholder="Paste Google Play Store URL"
            />
          </div>
          <div>
            <Label className="mb-1">iOS App URL</Label>
            <Input
              value={localIosUrl}
              onChange={e => setLocalIosUrl(e.target.value)}
              disabled={savingId === client.id}
              placeholder="Paste iOS App Store URL"
            />
          </div>
          <div>
            <Label className="mb-1">Status</Label>
            <Select
              value={localStatus}
              onValueChange={val => setLocalStatus((val as Client["white_label_status"]) || "not_started")}
              disabled={savingId === client.id}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2">Internal Checklist</Label>
            <ul className="space-y-2 mt-2">
              {CHECKLIST_STEPS.map(step => (
                <li key={step.key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!localChecklist[step.key]}
                    onChange={e => handleChecklistChange(step.key, e.target.checked)}
                    disabled={savingId === client.id}
                    className="accent-[#ECB22D] w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-base">{step.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-2 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!dirty || savingId === client.id}
              className="bg-[#ECB22D] text-[#010124] hover:bg-[#d4a029] font-semibold min-w-[100px]"
            >
              {savingId === client.id ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex h-screen min-h-screen bg-gray-100">
      <div className="h-full"><AdminSidebar /></div>
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl font-bold tracking-tight">Mobile App: White Label</span>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clients.filter(client => client.custom_app === "white_label").map(client => (
                <WhiteLabelClientCard key={client.id} client={client} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 