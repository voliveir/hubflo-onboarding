"use client";

import { useState, useEffect } from "react";
import { getAllClients, updateClient } from "@/lib/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Users, Building2, Tag, NotebookPen, Clock } from "lucide-react";
import { type Client } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

export function CustomerSuccessManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllClients().then(setClients);
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setNotes(selectedClient.notes || "");
    }
  }, [selectedClient]);

  const filteredClients = clients.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveNotes = async () => {
    if (!selectedClient) return;
    setSaving(true);
    try {
      await updateClient(selectedClient.id, { notes });
      toast({ title: "Notes saved!", description: `Notes updated for ${selectedClient.name}.`, variant: "default" });
    } catch (err) {
      const errorMsg = typeof err === "object" && err && "message" in err ? (err as any).message : String(err);
      toast({ title: "Error saving notes", description: errorMsg || "Failed to save notes.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-[#10122b]/80 via-[#181a2f]/90 to-[#1a1a40]/95 rounded-3xl shadow-2xl border border-[#F2C94C]/10 backdrop-blur-xl p-4">
      {/* Client List */}
      <div className="w-1/3 min-w-[260px] max-w-[340px] border-r border-[#F2C94C]/10 bg-[#10122b]/80 p-4 flex flex-col rounded-2xl shadow-lg backdrop-blur-md">
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 bg-[#181a2f]/80 text-white border-[#F2C94C]/20 rounded-xl shadow-inner"
        />
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className={`cursor-pointer bg-gradient-to-br from-[#181a2f]/80 to-[#10122b]/90 border border-[#F2C94C]/20 hover:border-[#F2C94C]/40 transition-all rounded-xl shadow-md backdrop-blur-md ${selectedClient?.id === client.id ? "ring-2 ring-[#F2C94C]" : ""}`}
              onClick={() => setSelectedClient(client)}
            >
              <CardContent className="p-4 flex flex-col gap-1">
                <span className="font-semibold text-white">{client.name}</span>
                <span className="text-xs text-[#F2C94C]">{client.success_package?.toUpperCase() || "-"}</span>
                <span className="text-xs text-white/60">{client.status}</span>
              </CardContent>
            </Card>
          ))}
          {filteredClients.length === 0 && (
            <div className="text-white/60 text-center mt-8">No clients found.</div>
          )}
        </div>
      </div>
      {/* Detail Panel */}
      <div className="flex-1 p-10 bg-gradient-to-br from-[#181a2f]/80 via-[#10122b]/90 to-[#1a1a40]/95 rounded-3xl ml-6">
        {selectedClient ? (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
              <Building2 className="h-8 w-8 text-[#F2C94C]" />
              <h2 className="text-3xl font-extrabold text-white drop-shadow-glow">{selectedClient.name}</h2>
              <Badge variant="outline" className="ml-2 text-[#F2C94C] border-[#F2C94C]/40 bg-white/10 backdrop-blur-sm font-bold text-lg px-4 py-1 rounded-full">
                {selectedClient.success_package?.toUpperCase()}
              </Badge>
              <span className="ml-4 text-base text-white/70 font-semibold">{selectedClient.status}</span>
            </div>
            {/* Client Details Card */}
            <Card className="bg-gradient-to-br from-[#181a2f]/80 to-[#10122b]/90 border border-[#F2C94C]/30 rounded-2xl shadow-xl backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-lg font-bold">
                  <Building2 className="h-5 w-5 text-[#F2C94C]" /> Client Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-white/90 text-base">
                  <div><span className="font-semibold text-[#F2C94C]">Email:</span> {selectedClient.email || <span className="text-white/40">—</span>}</div>
                  <div><span className="font-semibold text-[#F2C94C]">Plan:</span> {selectedClient.plan_type}</div>
                  <div><span className="font-semibold text-[#F2C94C]">Billing:</span> {selectedClient.billing_type}</div>
                  <div><span className="font-semibold text-[#F2C94C]">Revenue:</span> ${selectedClient.revenue_amount?.toLocaleString() || 0}</div>
                  <div><span className="font-semibold text-[#F2C94C]">Users:</span> {selectedClient.number_of_users ?? <span className="text-white/40">—</span>}</div>
                  <div><span className="font-semibold text-[#F2C94C]">Implementation Manager:</span> {selectedClient.implementation_manager || <span className="text-white/40">—</span>}</div>
                  <div><span className="font-semibold text-[#F2C94C]">Created:</span> {selectedClient.created_at ? new Date(selectedClient.created_at).toLocaleDateString() : <span className="text-white/40">—</span>}</div>
                  <div><span className="font-semibold text-[#F2C94C]">Updated:</span> {selectedClient.updated_at ? new Date(selectedClient.updated_at).toLocaleDateString() : <span className="text-white/40">—</span>}</div>
                  <div><span className="font-semibold text-[#F2C94C]">Status:</span> {selectedClient.status}</div>
                </div>
              </CardContent>
            </Card>
            {/* Contacts Card (placeholder) */}
            <Card className="bg-gradient-to-br from-[#181a2f]/80 to-[#10122b]/90 border border-[#F2C94C]/30 rounded-2xl shadow-xl backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-lg font-bold">
                  <Users className="h-5 w-5 text-[#F2C94C]" /> Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white/80 text-base">(Contacts coming soon)</div>
              </CardContent>
            </Card>
            {/* Tags/Segments Card (placeholder) */}
            <Card className="bg-gradient-to-br from-[#181a2f]/80 to-[#10122b]/90 border border-[#F2C94C]/30 rounded-2xl shadow-xl backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-lg font-bold">
                  <Tag className="h-5 w-5 text-[#F2C94C]" /> Tags/Segments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white/80 text-base">(Tags/segments coming soon)</div>
              </CardContent>
            </Card>
            {/* Internal Notes Card (existing) */}
            <Card className="bg-gradient-to-br from-[#181a2f]/80 to-[#10122b]/90 border border-[#F2C94C]/30 rounded-2xl shadow-xl backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-lg font-bold">
                  <NotebookPen className="h-5 w-5 text-[#F2C94C]" /> Internal Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-[#181a2f]/80 text-white border-[#F2C94C]/20 mb-2 rounded-xl shadow-inner"
                  rows={4}
                  placeholder="Add internal notes..."
                />
                <Button onClick={handleSaveNotes} disabled={saving} className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-bold rounded-xl shadow-gold-glow mt-2">
                  {saving ? "Saving..." : "Save Notes"}
                </Button>
              </CardContent>
            </Card>
            {/* Timeline Card (basic events) */}
            <Card className="bg-gradient-to-br from-[#181a2f]/80 to-[#10122b]/90 border border-[#F2C94C]/30 rounded-2xl shadow-xl backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-lg font-bold">
                  <Clock className="h-5 w-5 text-[#F2C94C]" /> Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-white/80 text-base space-y-2">
                  <li><span className="font-semibold text-[#F2C94C]">Created:</span> {selectedClient.created_at ? new Date(selectedClient.created_at).toLocaleString() : <span className="text-white/40">—</span>}</li>
                  {selectedClient.light_onboarding_call_date && <li><span className="font-semibold text-[#F2C94C]">Light Onboarding Call:</span> {new Date(selectedClient.light_onboarding_call_date).toLocaleString()}</li>}
                  {selectedClient.premium_first_call_date && <li><span className="font-semibold text-[#F2C94C]">Premium 1st Call:</span> {new Date(selectedClient.premium_first_call_date).toLocaleString()}</li>}
                  {selectedClient.premium_second_call_date && <li><span className="font-semibold text-[#F2C94C]">Premium 2nd Call:</span> {new Date(selectedClient.premium_second_call_date).toLocaleString()}</li>}
                  {selectedClient.gold_first_call_date && <li><span className="font-semibold text-[#F2C94C]">Gold 1st Call:</span> {new Date(selectedClient.gold_first_call_date).toLocaleString()}</li>}
                  {selectedClient.gold_second_call_date && <li><span className="font-semibold text-[#F2C94C]">Gold 2nd Call:</span> {new Date(selectedClient.gold_second_call_date).toLocaleString()}</li>}
                  {selectedClient.gold_third_call_date && <li><span className="font-semibold text-[#F2C94C]">Gold 3rd Call:</span> {new Date(selectedClient.gold_third_call_date).toLocaleString()}</li>}
                  {selectedClient.elite_configurations_started_date && <li><span className="font-semibold text-[#F2C94C]">Elite Configurations Started:</span> {new Date(selectedClient.elite_configurations_started_date).toLocaleString()}</li>}
                  {selectedClient.elite_integrations_started_date && <li><span className="font-semibold text-[#F2C94C]">Elite Integrations Started:</span> {new Date(selectedClient.elite_integrations_started_date).toLocaleString()}</li>}
                  {selectedClient.elite_verification_completed_date && <li><span className="font-semibold text-[#F2C94C]">Elite Verification Completed:</span> {new Date(selectedClient.elite_verification_completed_date).toLocaleString()}</li>}
                  <li><span className="font-semibold text-[#F2C94C]">Project Completion:</span> {selectedClient.project_completion_percentage}%</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-white/60 text-xl">Select a client to view details.</div>
        )}
      </div>
    </div>
  );
} 