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
import { Checkbox } from "@/components/ui/checkbox"

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

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    not_started: 'bg-slate-700 text-slate-200',
    in_progress: 'bg-gradient-to-r from-[#F2C94C]/80 to-[#F2994A]/80 text-[#010124]',
    complete: 'bg-emerald-600 text-white',
    waiting_for_approval: 'bg-slate-500 text-white',
  }
  const labelMap: Record<string, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    complete: 'Complete',
    waiting_for_approval: 'Waiting for Approval',
  }
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-slate-700 text-slate-200'}`}>{labelMap[status] || status}</span>
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
      <div id={client.id} className="scroll-mt-32">
        <Card className={`relative bg-[#0B0E24] rounded-2xl ring-2 ring-[#F2C94C]/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.18)] p-0 flex flex-col min-h-[420px]`}>
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <CardTitle className="text-xl flex-1 truncate text-white">{client.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div>
              <Label className="mb-1 text-gray-300">Android App URL</Label>
              <Input
                value={localAndroidUrl}
                onChange={e => setLocalAndroidUrl(e.target.value)}
                disabled={savingId === client.id}
                placeholder="Paste Google Play Store URL"
                className="bg-[#15173d] border border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label className="mb-1 text-gray-300">iOS App URL</Label>
              <Input
                value={localIosUrl}
                onChange={e => setLocalIosUrl(e.target.value)}
                disabled={savingId === client.id}
                placeholder="Paste iOS App Store URL"
                className="bg-[#15173d] border border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label className="mb-1 text-gray-300">Status</Label>
              <Select
                value={localStatus}
                onValueChange={val => setLocalStatus((val as Client["white_label_status"]) || "not_started")}
                disabled={savingId === client.id}
              >
                <SelectTrigger className="w-full bg-[#15173d] border border-white/10 text-white flex items-center">
                  <div className="flex items-center gap-2 w-full">
                    <StatusPill status={localStatus} />
                    <span className="flex-1" />
                    <svg className="h-4 w-4 ml-auto text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#15173d] border border-white/10 text-white">
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="flex items-center gap-2">
                      <StatusPill status={opt.value} />
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-6 text-gray-300">Internal Checklist</Label>
              <ul className="space-y-2 mt-2">
                {CHECKLIST_STEPS.map(step => (
                  <li key={step.key} className="flex items-center gap-3">
                    <Checkbox
                      checked={!!localChecklist[step.key]}
                      onCheckedChange={checked => handleChecklistChange(step.key, !!checked)}
                      disabled={savingId === client.id}
                      className={`w-5 h-5 rounded border data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-[#F2C94C] data-[state=checked]:to-[#F2994A] data-[state=checked]:border-[#F2C94C] data-[state=checked]:text-[#010124] border-gray-600`}
                    />
                    <span className="text-base text-white">{step.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-2">
              <Button
                onClick={handleSave}
                disabled={!dirty || savingId === client.id}
                className="w-full bg-gradient-to-br from-[#F2C94C] to-[#F2994A] text-[#010124] font-bold rounded-xl shadow-gold-glow shadow-md shadow-black/30 py-3 px-4 hover:scale-105 transition-transform"
              >
                {savingId === client.id ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0d0f2b] to-[#15173d] flex">
      <div className="flex flex-col min-h-screen"><AdminSidebar /></div>
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-2 mb-8">
            <span className="text-3xl font-bold tracking-tight text-white">Mobile App: White Label</span>
            <span className="text-base text-[#F2C94C]">Track internal steps for every white-label build</span>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
            </div>
          ) : (
            clients.filter(client => client.custom_app === "white_label").length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-[#0B0E24] rounded-2xl ring-1 ring-[#F2C94C]/40 shadow-inner-glass">
                <div className="text-4xl mb-2">🎉</div>
                <div className="text-lg text-white font-semibold mb-1">No white-label projects yet – create one from any client's page.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {clients.filter(client => client.custom_app === "white_label").map(client => (
                  <WhiteLabelClientCard key={client.id} client={client} />
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  )
} 