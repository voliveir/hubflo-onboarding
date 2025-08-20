"use client"

import { useEffect, useState, useRef } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Client } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Loader2, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "client_approval", label: "Client Approval" }, // NEW status
  { value: "waiting_for_approval", label: "Waiting for Approval" },
  { value: "complete", label: "Complete" },
]

const CHECKLIST_STEPS = [
  { key: "create_assets", label: "Create assets by duplicating Canva assets" },
  { key: "create_natively_app", label: "Create application in Natively" },
  { key: "create_test_user", label: "Create test user/portal" },
  { key: "test_login", label: "Test the application login locally" },
  { key: "download_and_create_ios_app", label: "Download the application from Natively and create a new application in iOS" },
  // NEW: Client Approval step
  { key: "client_approval", label: "Client Approval of app details (assets, name, description)" },
  { key: "submit", label: "Submit" },
]

type WhiteLabelChecklist = {
  [key: string]: { completed: boolean, completed_at?: string } | undefined
  create_assets?: { completed: boolean, completed_at?: string }
  create_natively_app?: { completed: boolean, completed_at?: string }
  create_test_user?: { completed: boolean, completed_at?: string }
  test_login?: { completed: boolean, completed_at?: string }
  download_and_create_ios_app?: { completed: boolean, completed_at?: string }
  submit?: { completed: boolean, completed_at?: string }
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    not_started: 'bg-slate-700 text-slate-200',
    in_progress: 'bg-gradient-to-r from-[#F2C94C]/80 to-[#F2994A]/80 text-[#010124]',
    client_approval: 'bg-blue-500/20 text-blue-300 border-blue-500/40', // NEW style
    complete: 'bg-emerald-600 text-white',
    waiting_for_approval: 'bg-slate-500 text-white',
  }
  const labelMap: Record<string, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    client_approval: 'Client Approval', // NEW label
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
    const [localAppName, setLocalAppName] = useState(client.white_label_app_name || "")
    const [localAppDescription, setLocalAppDescription] = useState(client.white_label_app_description || "")
    const [localAppAssets, setLocalAppAssets] = useState<string[]>(client.white_label_app_assets || [])
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [dirty, setDirty] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    useEffect(() => {
      setLocalStatus(client.white_label_status || "not_started")
      setLocalChecklist(client.white_label_checklist || {})
      setLocalAndroidUrl(client.white_label_android_url || "")
      setLocalIosUrl(client.white_label_ios_url || "")
      setLocalAppName(client.white_label_app_name || "")
      setLocalAppDescription(client.white_label_app_description || "")
      setLocalAppAssets(client.white_label_app_assets || [])
      setDirty(false)
    }, [client])

    useEffect(() => {
      if (
        localStatus !== (client.white_label_status || "not_started") ||
        JSON.stringify(localChecklist) !== JSON.stringify(client.white_label_checklist || {}) ||
        localAndroidUrl !== (client.white_label_android_url || "") ||
        localIosUrl !== (client.white_label_ios_url || "") ||
        localAppName !== (client.white_label_app_name || "") ||
        localAppDescription !== (client.white_label_app_description || "") ||
        localAppAssets.join(",") !== (client.white_label_app_assets || []).join(",")
      ) {
        setDirty(true)
      } else {
        setDirty(false)
      }
    }, [localStatus, localChecklist, localAndroidUrl, localIosUrl, localAppName, localAppDescription, localAppAssets, client])

    const handleChecklistChange = (stepKey: string, checked: boolean) => {
      setLocalChecklist((prev) => ({
        ...prev,
        [stepKey]: {
          completed: checked,
          completed_at: checked ? new Date().toISOString() : undefined
        }
      }))
    }

    const handleDateChange = (stepKey: string, dateString: string) => {
      setLocalChecklist((prev) => ({
        ...prev,
        [stepKey]: {
          completed: prev[stepKey]?.completed || false,
          completed_at: dateString ? new Date(dateString).toISOString() : undefined
        }
      }))
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Use the server-side API route for upload
          const formData = new FormData();
          formData.append('file', file);
          formData.append('clientId', client.id);
          
          console.log('Uploading file via API:', file.name);
          
          const response = await fetch('/api/upload-asset', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Upload API error:', errorData);
            alert(`Failed to upload ${file.name}: ${errorData.error || 'Unknown error'}`);
            continue;
          }
          
          const result = await response.json();
          console.log('Upload API success:', result);
          
          if (result.success && result.publicUrl) {
            uploadedUrls.push(result.publicUrl);
            console.log('Added public URL from API:', result.publicUrl);
          } else {
            console.error('API returned no public URL');
            alert(`Failed to get public URL for ${file.name}`);
          }
        } catch (error) {
          console.error('Error processing file:', error);
          alert(`Error processing ${file.name}: ${error}`);
        }
      }
      
      // Update the local state with all uploaded URLs
      if (uploadedUrls.length > 0) {
        setLocalAppAssets(prev => {
          const newAssets = [...prev, ...uploadedUrls];
          console.log('Updated localAppAssets after upload:', newAssets);
          return newAssets;
        });
      }
      
      // Clear the file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemoveAsset = (url: string) => {
      setLocalAppAssets(prev => prev.filter(u => u !== url))
    }

    const handleSave = async () => {
      setSavingId(client.id);
      try {
        const { error } = await supabase
          .from("clients")
          .update({
            white_label_status: localStatus,
            white_label_checklist: localChecklist,
            white_label_android_url: localAndroidUrl,
            white_label_ios_url: localIosUrl,
            white_label_app_name: localAppName,
            white_label_app_description: localAppDescription,
            white_label_app_assets: localAppAssets,
          })
          .eq("id", client.id);
        if (error) {
          alert('Failed to save client: ' + error.message);
          console.error('Save error:', error);
        } else {
          console.log('Saved client with assets:', localAppAssets);
          await fetchClients();
        }
      } finally {
        setSavingId(null);
      }
    };

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
              <Label className="mb-1 text-gray-300">App Name</Label>
              <Input
                value={localAppName}
                onChange={e => setLocalAppName(e.target.value)}
                disabled={savingId === client.id}
                placeholder="Enter app name"
                className="bg-[#15173d] border border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label className="mb-1 text-gray-300">App Description</Label>
              <div className="mb-2 text-xs text-gray-400">
                Use <code className="bg-gray-800 px-1 rounded">**bold**</code> for emphasis, 
                <code className="bg-gray-800 px-1 rounded ml-1">•</code> for bullet points, 
                and line breaks for paragraphs.
              </div>
              <textarea
                value={localAppDescription}
                onChange={e => setLocalAppDescription(e.target.value)}
                disabled={savingId === client.id}
                placeholder="Enter app description with formatting..."
                rows={8}
                className="w-full bg-[#15173d] border border-white/10 text-white placeholder:text-gray-500 rounded-md p-3 resize-y"
              />
            </div>
            <div>
              <Label className="mb-1 text-gray-300">App Assets (upload images)</Label>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={savingId === client.id}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold/20 file:text-brand-gold hover:file:bg-brand-gold/40"
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {localAppAssets.map((url, i) => (
                  <div key={i} className="relative group">
                    <img 
                      src={url} 
                      alt={`Asset ${i + 1}`} 
                      className="h-16 w-16 object-cover rounded shadow border border-white/10 bg-[#181a2f] cursor-pointer hover:border-brand-gold/50 hover:scale-105 transition-all duration-200" 
                      onClick={() => setSelectedImage(url)}
                      onLoad={() => console.log(`Image ${i + 1} loaded successfully:`, url)}
                      onError={(e) => {
                        console.error(`Image ${i + 1} failed to load:`, url);
                        console.error('Error details:', e);
                        // Try to fetch the image to see what error we get
                        fetch(url)
                          .then(response => {
                            console.log(`Fetch response for image ${i + 1}:`, response.status, response.statusText);
                            return response.text();
                          })
                          .then(text => console.log(`Response body for image ${i + 1}:`, text.substring(0, 200)))
                          .catch(fetchError => console.error(`Fetch error for image ${i + 1}:`, fetchError));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAsset(url)}
                      className="absolute top-0 right-0 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      aria-label="Remove asset"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
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
              <ul className="space-y-3 mt-2">
                {CHECKLIST_STEPS.map(step => {
                  const stepData = localChecklist[step.key]
                  const isCompleted = stepData?.completed || false
                  const completedAt = stepData?.completed_at
                  
                  return (
                    <li key={step.key} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={checked => handleChecklistChange(step.key, !!checked)}
                          disabled={savingId === client.id}
                          className={`w-5 h-5 rounded border data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-[#F2C94C] data-[state=checked]:to-[#F2994A] data-[state=checked]:border-[#F2C94C] data-[state=checked]:text-[#010124] border-gray-600`}
                        />
                        <span className="text-base text-white">{step.label}</span>
                      </div>
                      {isCompleted && (
                        <div className="ml-8 flex items-center gap-2">
                          <Label className="text-sm text-gray-400">Completed on:</Label>
                          <Input
                            type="datetime-local"
                            value={completedAt ? new Date(completedAt).toISOString().slice(0, 16) : ""}
                            onChange={e => handleDateChange(step.key, e.target.value)}
                            disabled={savingId === client.id}
                            className="bg-[#15173d] border border-white/10 text-white text-sm h-8 px-2"
                          />
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
            {client.white_label_client_approval_status && (
              <div className="mt-4">
                <Label className="text-gray-300">Client Approval Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className={
                    client.white_label_client_approval_status === "approved"
                      ? "text-green-400 font-semibold"
                      : client.white_label_client_approval_status === "changes_requested"
                      ? "text-orange-400 font-semibold"
                      : "text-yellow-300 font-semibold"
                  }>
                    {client.white_label_client_approval_status === "approved"
                      ? "Approved"
                      : client.white_label_client_approval_status === "changes_requested"
                      ? "Changes Requested"
                      : "Pending"}
                  </span>
                  {client.white_label_client_approval_at && (
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(client.white_label_client_approval_at).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            )}
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

        {/* Full Screen Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-bold bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
              >
                ×
              </button>
              <img 
                src={selectedImage || ""} 
                alt="Full size asset" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
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