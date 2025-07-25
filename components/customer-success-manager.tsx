"use client";

import { useState, useEffect } from "react";
import { getAllClients, updateClient, getClientContacts, addClientContact, updateClientContact, deleteClientContact, getClientTags, addClientTag, deleteClientTag, getClientActivityLog, addClientActivityLog, updateClientActivityLog, deleteClientActivityLog } from "@/lib/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Users, Building2, Tag, NotebookPen, Clock, CheckCircle, Calendar, Phone, TrendingUp, UserCheck, Pencil, Trash2, List, Table as TableIcon } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { type Client } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function CustomerSuccessManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", role: "", phone: "", notes: "" });
  const [tags, setTags] = useState<any[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [manualEvent, setManualEvent] = useState("");
  const [addingManualEvent, setAddingManualEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [editingHealth, setEditingHealth] = useState(false);
  const [healthInput, setHealthInput] = useState("");
  const [viewMode, setViewMode] = useState<'card' | 'table'>("card");

  useEffect(() => {
    getAllClients().then(setClients);
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setNotes(selectedClient.notes || "");
    }
  }, [selectedClient]);

  // Fetch contacts when selectedClient changes
  useEffect(() => {
    if (selectedClient) {
      setContactsLoading(true);
      getClientContacts(selectedClient.id)
        .then(setContacts)
        .catch(() => setContacts([]))
        .finally(() => setContactsLoading(false));
    } else {
      setContacts([]);
    }
  }, [selectedClient]);

  // Fetch tags when selectedClient changes
  useEffect(() => {
    if (selectedClient) {
      setTagsLoading(true);
      getClientTags(selectedClient.id)
        .then(setTags)
        .catch(() => setTags([]))
        .finally(() => setTagsLoading(false));
    } else {
      setTags([]);
    }
  }, [selectedClient]);

  // Fetch activity log when selectedClient changes
  useEffect(() => {
    if (selectedClient) {
      setActivityLoading(true);
      getClientActivityLog(selectedClient.id)
        .then(setActivityLog)
        .catch(() => setActivityLog([]))
        .finally(() => setActivityLoading(false));
    } else {
      setActivityLog([]);
    }
  }, [selectedClient]);

  // Set initial health score from client.notes or a custom field if available
  useEffect(() => {
    if (selectedClient) {
      // For now, use notes as a placeholder for health score if it contains a number
      const match = selectedClient.notes && selectedClient.notes.match(/health\s*[:=]?\s*(\d+)/i);
      setHealthScore(match ? parseInt(match[1], 10) : null);
    }
  }, [selectedClient]);

  const saveHealthScore = async () => {
    if (!selectedClient) return;
    setEditingHealth(false);
    setHealthScore(Number(healthInput));
    // Optionally, save to Supabase (e.g., in notes or a new field)
    await updateClient(selectedClient.id, { notes: `health: ${healthInput}` });
  };

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

  const openAddContact = () => {
    setEditingContact(null);
    setContactForm({ name: "", email: "", role: "", phone: "", notes: "" });
    setContactModalOpen(true);
  };
  const openEditContact = (contact: any) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name || "",
      email: contact.email || "",
      role: contact.role || "",
      phone: contact.phone || "",
      notes: contact.notes || "",
    });
    setContactModalOpen(true);
  };
  const handleContactFormChange = (e: any) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };
  const handleSaveContact = async () => {
    try {
      if (!selectedClient) return;
      if (editingContact) {
        await updateClientContact(editingContact.id, contactForm);
        toast({ title: "Contact updated", variant: "default" });
      } else {
        await addClientContact({ ...contactForm, client_id: selectedClient.id });
        toast({ title: "Contact added", variant: "default" });
      }
      setContactModalOpen(false);
      // Refresh contacts
      setContactsLoading(true);
      const updated = await getClientContacts(selectedClient.id);
      setContacts(updated);
    } catch (err) {
      toast({ title: "Error saving contact", description: String(err), variant: "destructive" });
    } finally {
      setContactsLoading(false);
    }
  };
  const handleDeleteContact = async (id: string) => {
    if (!window.confirm("Delete this contact?")) return;
    try {
      await deleteClientContact(id);
      toast({ title: "Contact deleted", variant: "default" });
      setContacts(contacts.filter((c) => c.id !== id));
    } catch (err) {
      toast({ title: "Error deleting contact", description: String(err), variant: "destructive" });
    }
  };

  const handleAddTag = async (e: any) => {
    e.preventDefault();
    if (!selectedClient || !newTag.trim()) return;
    try {
      const tag = newTag.trim();
      await addClientTag(selectedClient.id, tag);
      setNewTag("");
      setTagsLoading(true);
      const updated = await getClientTags(selectedClient.id);
      setTags(updated);
    } catch (err) {
      toast({ title: "Error adding tag", description: String(err), variant: "destructive" });
    } finally {
      setTagsLoading(false);
    }
  };
  const handleDeleteTag = async (id: string) => {
    try {
      await deleteClientTag(id);
      setTags(tags.filter((t) => t.id !== id));
    } catch (err) {
      toast({ title: "Error deleting tag", description: String(err), variant: "destructive" });
    }
  };

  const handleAddManualEvent = async (e: any) => {
    e.preventDefault();
    if (!selectedClient || !manualEvent.trim()) return;
    setAddingManualEvent(true);
    try {
      await addClientActivityLog({
        client_id: selectedClient.id,
        event_type: "manual",
        event_data: { note: manualEvent.trim() },
        // Optionally: created_by: current admin user
      });
      setManualEvent("");
      // Refresh log
      setActivityLoading(true);
      const updated = await getClientActivityLog(selectedClient.id);
      setActivityLog(updated);
    } catch (err) {
      toast({ title: "Error adding event", description: String(err), variant: "destructive" });
    } finally {
      setAddingManualEvent(false);
      setActivityLoading(false);
    }
  };

  const openEditEvent = (event: any) => {
    setEditingEvent(event);
    setEditNote(event.event_data?.note || "");
    setEditDate(event.created_at ? new Date(event.created_at).toISOString().slice(0, 16) : "");
  };
  const handleEditEvent = async (e: any) => {
    e.preventDefault();
    if (!editingEvent) return;
    setEditLoading(true);
    try {
      await updateClientActivityLog(editingEvent.id, {
        event_data: { note: editNote },
        created_at: editDate ? new Date(editDate).toISOString() : editingEvent.created_at,
      });
      setEditingEvent(null);
      setEditNote("");
      setEditDate("");
      setActivityLoading(true);
      const updated = await getClientActivityLog(selectedClient.id);
      setActivityLog(updated);
    } catch (err) {
      toast({ title: "Error updating event", description: String(err), variant: "destructive" });
    } finally {
      setEditLoading(false);
      setActivityLoading(false);
    }
  };
  const handleDeleteEvent = async (event: any) => {
    if (!window.confirm("Delete this timeline entry?")) return;
    try {
      await deleteClientActivityLog(event.id);
      setActivityLog(activityLog.filter((e) => e.id !== event.id));
    } catch (err) {
      toast({ title: "Error deleting event", description: String(err), variant: "destructive" });
    }
  };

  // Helper: get a set of event types and values from the activity log to avoid duplicates
  const activityLogTypes = new Set(activityLog.map(e => e.event_type + (e.event_data?.tag || e.event_data?.name || e.event_data?.note || '')));

  // Helper: get last activity date from activityLog or key fields
  const lastActivity = activityLog.length > 0
    ? activityLog[0].created_at
    : selectedClient && selectedClient.updated_at;

  // Helper: get next scheduled action (soonest call/renewal/follow-up)
  const nextAction = (() => {
    const dates = [
      selectedClient?.light_onboarding_call_date,
      selectedClient?.premium_first_call_date,
      selectedClient?.premium_second_call_date,
      selectedClient?.gold_first_call_date,
      selectedClient?.gold_second_call_date,
      selectedClient?.gold_third_call_date,
      selectedClient?.contract_end_date,
    ].filter(Boolean).map(d => new Date(d));
    if (dates.length === 0) return null;
    const soonest = dates.sort((a, b) => a.getTime() - b.getTime())[0];
    return soonest;
  })();

  return (
    <div className="flex bg-gradient-to-br from-[#10122b]/80 via-[#181a2f]/90 to-[#1a1a40]/95 rounded-3xl shadow-2xl border border-[#F2C94C]/10 backdrop-blur-xl p-4">
      {/* Client List */}
      <div className="w-1/3 min-w-[260px] max-w-[340px] border-r border-[#F2C94C]/10 bg-[#10122b]/80 p-4 flex flex-col rounded-2xl shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-[#181a2f]/80 text-white border-[#F2C94C]/20 rounded-xl shadow-inner"
          />
          <Button
            size="icon"
            variant={viewMode === 'card' ? 'default' : 'outline'}
            className={viewMode === 'card' ? 'bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] shadow-gold-glow' : 'border-[#F2C94C] text-[#F2C94C]'}
            onClick={() => setViewMode('card')}
            aria-label="Card view"
          >
            <List />
          </Button>
          <Button
            size="icon"
            variant={viewMode === 'table' ? 'default' : 'outline'}
            className={viewMode === 'table' ? 'bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] shadow-gold-glow' : 'border-[#F2C94C] text-[#F2C94C]'}
            onClick={() => setViewMode('table')}
            aria-label="Table view"
          >
            <TableIcon />
          </Button>
        </div>
        {viewMode === 'card' ? (
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
        ) : (
          <div className="flex-1 overflow-y-auto">
            <Table className="min-w-full text-white/90 bg-transparent">
              <TableHeader>
                <TableRow className="bg-[#181a2f]/80 border-b border-[#F2C94C]/20">
                  <TableHead className="text-[#F2C94C] font-bold">Name</TableHead>
                  <TableHead className="text-[#F2C94C] font-bold">Package</TableHead>
                  <TableHead className="text-[#F2C94C] font-bold">Status</TableHead>
                  <TableHead className="text-[#F2C94C] font-bold">ARR</TableHead>
                  <TableHead className="text-[#F2C94C] font-bold">CSM</TableHead>
                  <TableHead className="text-[#F2C94C] font-bold">Users</TableHead>
                  <TableHead className="text-[#F2C94C] font-bold">Health</TableHead>
                  <TableHead className="text-[#F2C94C] font-bold">Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow
                    key={client.id}
                    className={`cursor-pointer transition-all ${selectedClient?.id === client.id ? "bg-[#181a2f]/60 ring-2 ring-[#F2C94C]" : "hover:bg-[#181a2f]/40"}`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <TableCell className="font-semibold">{client.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[#F2C94C] border-[#F2C94C]/40 bg-white/10 backdrop-blur-sm font-bold px-3 py-1 rounded-full">{client.success_package?.toUpperCase() || "-"}</Badge></TableCell>
                    <TableCell>{client.status}</TableCell>
                    <TableCell>${client.revenue_amount?.toLocaleString() || 0}</TableCell>
                    <TableCell>{client.implementation_manager || "—"}</TableCell>
                    <TableCell>{client.number_of_users ?? "—"}</TableCell>
                    <TableCell>{(() => {
                      const match = client.notes && client.notes.match(/health\s*[:=]?\s*(\d+)/i);
                      return match ? match[1] : "—";
                    })()}</TableCell>
                    <TableCell>{client.updated_at ? new Date(client.updated_at).toLocaleDateString() : "—"}</TableCell>
                  </TableRow>
                ))}
                {filteredClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-white/60 py-8">No clients found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      {/* Detail Panel */}
      <div className="flex-1 p-10 bg-gradient-to-br from-[#181a2f]/80 via-[#10122b]/90 to-[#1a1a40]/95 rounded-3xl ml-6">
        {selectedClient ? (
          <div className="space-y-8">
            {selectedClient && (
              <Card className="mb-8 bg-gradient-to-br from-[#181a2f]/80 to-[#10122b]/90 border border-[#F2C94C]/40 rounded-3xl shadow-2xl backdrop-blur-xl p-6 flex flex-col md:flex-row items-center gap-8">
                {selectedClient.logo_url && (
                  <img src={selectedClient.logo_url} alt="Logo" className="w-20 h-20 rounded-2xl object-contain bg-[#10122b] border border-[#F2C94C]/30 shadow-gold-glow" />
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-4 mb-2">
                    <h2 className="text-3xl font-extrabold text-white drop-shadow-glow">{selectedClient.name}</h2>
                    <Badge variant="outline" className="text-[#F2C94C] border-[#F2C94C]/40 bg-white/10 backdrop-blur-sm font-bold text-lg px-4 py-1 rounded-full">
                      {selectedClient.success_package?.toUpperCase()}
                    </Badge>
                    <span className="text-base text-white/70 font-semibold">{selectedClient.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-6 items-center mb-2">
                    <span className="text-[#F2C94C] font-semibold">ARR:</span> <span className="text-white/90">${selectedClient.revenue_amount?.toLocaleString() || 0}</span>
                    <span className="text-[#F2C94C] font-semibold">CSM:</span> <span className="text-white/90">{selectedClient.implementation_manager || "—"}</span>
                    <span className="text-[#F2C94C] font-semibold">Users:</span> <span className="text-white/90">{selectedClient.number_of_users ?? "—"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <span key={tag.id} className="inline-flex items-center px-3 py-1 rounded-full bg-[#F2C94C]/20 text-[#F2C94C] font-semibold text-sm shadow-gold-glow">{tag.tag}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-6 items-center mb-2">
                    <span className="text-[#F2C94C] font-semibold">Health Score:</span>
                    {editingHealth ? (
                      <>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={healthInput}
                          onChange={e => setHealthInput(e.target.value)}
                          className="w-20 bg-[#10122b] text-white border-[#F2C94C]/20 rounded-full px-4 py-2"
                        />
                        <Button size="sm" className="ml-2 bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-bold rounded-xl shadow-gold-glow" onClick={saveHealthScore}>Save</Button>
                        <Button size="sm" variant="outline" className="ml-2 border-[#F2C94C] text-[#F2C94C] rounded-full px-4 font-bold" onClick={() => setEditingHealth(false)}>Cancel</Button>
                      </>
                    ) : (
                      <span className="text-white/90 font-bold text-xl cursor-pointer" onClick={() => { setEditingHealth(true); setHealthInput(healthScore?.toString() || ""); }}>{healthScore ?? "—"}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-6 items-center">
                    <span className="text-[#F2C94C] font-semibold">Last Activity:</span> <span className="text-white/90">{lastActivity ? new Date(lastActivity).toLocaleString() : "—"}</span>
                    <span className="text-[#F2C94C] font-semibold">Next Action:</span> <span className="text-white/90">{nextAction ? nextAction.toLocaleString() : "—"}</span>
                  </div>
                </div>
              </Card>
            )}
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
                  <Button size="sm" className="ml-auto bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-bold rounded-xl shadow-gold-glow" onClick={openAddContact}>Add</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contactsLoading ? (
                  <div className="text-white/60">Loading...</div>
                ) : contacts.length === 0 ? (
                  <div className="text-white/80 text-base">No contacts yet.</div>
                ) : (
                  <ul className="divide-y divide-[#F2C94C]/10">
                    {contacts.map((contact) => (
                      <li key={contact.id} className="py-3 flex flex-col md:flex-row md:items-center md:gap-6">
                        <div className="flex-1">
                          <div className="font-semibold text-white text-base">{contact.name}</div>
                          <div className="text-[#F2C94C] text-sm">{contact.role}</div>
                          <div className="text-white/80 text-sm">{contact.email}</div>
                          {contact.phone && <div className="text-white/60 text-sm">{contact.phone}</div>}
                          {contact.notes && <div className="text-white/50 text-xs mt-1">{contact.notes}</div>}
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                          <Button size="sm" variant="outline" className="border-[#F2C94C] text-[#F2C94C] rounded-full px-4 font-bold" onClick={() => openEditContact(contact)}>Edit</Button>
                          <Button size="sm" variant="outline" className="border-red-400 text-red-400 rounded-full px-4 font-bold" onClick={() => handleDeleteContact(contact.id)}>Delete</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
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
                {tagsLoading ? (
                  <div className="text-white/60">Loading...</div>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag) => (
                      <span key={tag.id} className="inline-flex items-center px-3 py-1 rounded-full bg-[#F2C94C]/20 text-[#F2C94C] font-semibold text-sm shadow-gold-glow">
                        {tag.tag}
                        <button
                          className="ml-2 text-[#F2C94C] hover:text-red-400 focus:outline-none"
                          onClick={() => handleDeleteTag(tag.id)}
                          title="Remove tag"
                          type="button"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <form className="flex gap-2 mt-2" onSubmit={handleAddTag}>
                  <Input
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    className="bg-[#10122b] text-white border-[#F2C94C]/20 rounded-full px-4 py-2"
                    disabled={tagsLoading}
                  />
                  <Button type="submit" className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-bold rounded-full shadow-gold-glow px-4" disabled={tagsLoading || !newTag.trim()}>
                    Add
                  </Button>
                </form>
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
                <form className="flex gap-2 mb-6" onSubmit={handleAddManualEvent}>
                  <Input
                    value={manualEvent}
                    onChange={e => setManualEvent(e.target.value)}
                    placeholder="Add timeline note..."
                    className="bg-[#10122b] text-white border-[#F2C94C]/20 rounded-full px-4 py-2"
                    disabled={addingManualEvent}
                  />
                  <Button type="submit" className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-bold rounded-full shadow-gold-glow px-4" disabled={addingManualEvent || !manualEvent.trim()}>
                    Add
                  </Button>
                </form>
                {activityLoading ? (
                  <div className="text-white/60">Loading...</div>
                ) : (
                  <ul className="space-y-6 mt-2">
                    {/* Activity log events */}
                    {activityLog.map((event) => (
                      <li key={event.id} className="flex items-start gap-4">
                        {event.event_type === "manual" && <NotebookPen className="h-6 w-6 text-[#F2C94C] mt-1" />}
                        {event.event_type === "tag_added" && <Tag className="h-6 w-6 text-[#F2C94C] mt-1" />}
                        {event.event_type === "tag_removed" && <Tag className="h-6 w-6 text-red-400 mt-1" />}
                        {event.event_type === "contact_added" && <Users className="h-6 w-6 text-[#F2C94C] mt-1" />}
                        {event.event_type === "contact_deleted" && <Users className="h-6 w-6 text-red-400 mt-1" />}
                        {event.event_type === "note_updated" && <NotebookPen className="h-6 w-6 text-[#F2C94C] mt-1" />}
                        {/* Fallback icon */}
                        {["manual","tag_added","tag_removed","contact_added","contact_deleted","note_updated"].indexOf(event.event_type) === -1 && <CheckCircle className="h-6 w-6 text-[#F2C94C] mt-1" />}
                        <div className="flex-1">
                          <div className="font-semibold text-[#F2C94C] capitalize flex items-center gap-2">
                            {event.event_type.replace(/_/g, " ")}
                            {event.event_type === "manual" && (
                              <>
                                <button className="ml-2 text-[#F2C94C] hover:text-yellow-400" onClick={() => openEditEvent(event)} title="Edit"><Pencil className="h-4 w-4" /></button>
                                <button className="ml-1 text-red-400 hover:text-red-600" onClick={() => handleDeleteEvent(event)} title="Delete"><Trash2 className="h-4 w-4" /></button>
                              </>
                            )}
                          </div>
                          <div className="text-white/90 text-sm">
                            {event.event_type === "manual" && event.event_data?.note}
                            {event.event_type === "tag_added" && `Tag added: ${event.event_data?.tag}`}
                            {event.event_type === "tag_removed" && `Tag removed: ${event.event_data?.tag}`}
                            {event.event_type === "contact_added" && `Contact added: ${event.event_data?.name}`}
                            {event.event_type === "contact_deleted" && `Contact deleted: ${event.event_data?.name}`}
                            {event.event_type === "note_updated" && `Notes updated`}
                            {/* Fallback: show event_data as JSON */}
                            {["manual","tag_added","tag_removed","contact_added","contact_deleted","note_updated"].indexOf(event.event_type) === -1 && JSON.stringify(event.event_data)}
                          </div>
                          <div className="text-white/60 text-xs mt-1">{new Date(event.created_at).toLocaleString()}</div>
                        </div>
                      </li>
                    ))}
                    {/* Key client fields (always show, but avoid duplicates) */}
                    {selectedClient.created_at && !activityLogTypes.has("created") && (
                      <li className="flex items-start gap-4">
                        <Calendar className="h-6 w-6 text-[#F2C94C] mt-1" />
                        <div>
                          <div className="font-semibold text-[#F2C94C]">Created</div>
                          <div className="text-white/90 text-sm">{new Date(selectedClient.created_at).toLocaleString()}</div>
                        </div>
                      </li>
                    )}
                    {selectedClient.light_onboarding_call_date && !activityLogTypes.has("light_onboarding_call_date") && (
                      <li className="flex items-start gap-4">
                        <Phone className="h-6 w-6 text-[#F2C94C] mt-1" />
                        <div>
                          <div className="font-semibold text-[#F2C94C]">Light Onboarding Call</div>
                          <div className="text-white/90 text-sm">{new Date(selectedClient.light_onboarding_call_date).toLocaleString()}</div>
                        </div>
                      </li>
                    )}
                    {selectedClient.premium_first_call_date && !activityLogTypes.has("premium_first_call_date") && (
                      <li className="flex items-start gap-4">
                        <Phone className="h-6 w-6 text-[#F2C94C] mt-1" />
                        <div>
                          <div className="font-semibold text-[#F2C94C]">Premium 1st Call</div>
                          <div className="text-white/90 text-sm">{new Date(selectedClient.premium_first_call_date).toLocaleString()}</div>
                        </div>
                      </li>
                    )}
                    {selectedClient.premium_second_call_date && !activityLogTypes.has("premium_second_call_date") && (
                      <li className="flex items-start gap-4">
                        <Phone className="h-6 w-6 text-[#F2C94C] mt-1" />
                        <div>
                          <div className="font-semibold text-[#F2C94C]">Premium 2nd Call</div>
                          <div className="text-white/90 text-sm">{new Date(selectedClient.premium_second_call_date).toLocaleString()}</div>
                        </div>
                      </li>
                    )}
                    {selectedClient.gold_first_call_date && !activityLogTypes.has("gold_first_call_date") && (
                      <li className="flex items-start gap-4">
                        <Phone className="h-6 w-6 text-[#F2C94C] mt-1" />
                        <div>
                          <div className="font-semibold text-[#F2C94C]">Gold 1st Call</div>
                          <div className="text-white/90 text-sm">{new Date(selectedClient.gold_first_call_date).toLocaleString()}</div>
                        </div>
                      </li>
                    )}
                    {selectedClient.gold_second_call_date && !activityLogTypes.has("gold_second_call_date") && (
                      <li className="flex items-start gap-4">
                        <Phone className="h-6 w-6 text-[#F2C94C] mt-1" />
                        <div>
                          <div className="font-semibold text-[#F2C94C]">Gold 2nd Call</div>
                          <div className="text-white/90 text-sm">{new Date(selectedClient.gold_second_call_date).toLocaleString()}</div>
                        </div>
                      </li>
                    )}
                    {selectedClient.gold_third_call_date && !activityLogTypes.has("gold_third_call_date") && (
                      <li className="flex items-start gap-4">
                        <Phone className="h-6 w-6 text-[#F2C94C] mt-1" />
                        <div>
                          <div className="font-semibold text-[#F2C94C]">Gold 3rd Call</div>
                          <div className="text-white/90 text-sm">{new Date(selectedClient.gold_third_call_date).toLocaleString()}</div>
                        </div>
                      </li>
                    )}
                    {selectedClient.elite_configurations_started_date && !activityLogTypes.has("elite_configurations_started_date") && (
                      <li className="flex items-start gap-4">
                        <UserCheck className="h-6 w-6 text-[#F2C94C] mt-1" />
                        <div>
                          <div className="font-semibold text-[#F2C94C]">Elite Configurations Started</div>
                          <div className="text-white/90 text-sm">{new Date(selectedClient.elite_configurations_started_date).toLocaleString()}</div>
                        </div>
                      </li>
                    )}
                    {selectedClient.elite_integrations_started_date && !activityLogTypes.has("elite_integrations_started_date") && (
                      <li className="flex items-start gap-4">
                        <UserCheck className="h-6 w-6 text-[#F2C94C] mt-1" />
                        <div>
                          <div className="font-semibold text-[#F2C94C]">Elite Integrations Started</div>
                          <div className="text-white/90 text-sm">{new Date(selectedClient.elite_integrations_started_date).toLocaleString()}</div>
                        </div>
                      </li>
                    )}
                    {selectedClient.elite_verification_completed_date && !activityLogTypes.has("elite_verification_completed_date") && (
                      <li className="flex items-start gap-4">
                        <CheckCircle className="h-6 w-6 text-[#F2C94C] mt-1" />
                        <div>
                          <div className="font-semibold text-[#F2C94C]">Elite Verification Completed</div>
                          <div className="text-white/90 text-sm">{new Date(selectedClient.elite_verification_completed_date).toLocaleString()}</div>
                        </div>
                      </li>
                    )}
                    {selectedClient.status && !activityLogTypes.has("status") && (
                      <li className="flex items-start gap-4">
                        <TrendingUp className="h-6 w-6 text-[#F2C94C] mt-1" />
                        <div>
                          <div className="font-semibold text-[#F2C94C]">Status</div>
                          <div className="text-white/90 text-sm">{selectedClient.status}</div>
                        </div>
                      </li>
                    )}
                    {selectedClient.project_completion_percentage > 0 && !activityLogTypes.has("project_completion_percentage") && (
                      <li className="flex items-start gap-4">
                        <TrendingUp className="h-6 w-6 text-[#F2C94C] mt-1" />
                        <div>
                          <div className="font-semibold text-[#F2C94C]">Project Completion</div>
                          <div className="text-white/90 text-sm">{selectedClient.project_completion_percentage}%</div>
                        </div>
                      </li>
                    )}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-white/60 text-xl">Select a client to view details.</div>
        )}
      </div>
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="bg-[#181a2f]/90 border border-[#F2C94C]/30 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit Contact" : "Add Contact"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSaveContact(); }}>
            <div>
              <Label htmlFor="contact-name" className="text-[#F2C94C]">Name</Label>
              <Input id="contact-name" name="name" value={contactForm.name} onChange={handleContactFormChange} required className="bg-[#10122b] text-white border-[#F2C94C]/20" />
            </div>
            <div>
              <Label htmlFor="contact-email" className="text-[#F2C94C]">Email</Label>
              <Input id="contact-email" name="email" value={contactForm.email} onChange={handleContactFormChange} required className="bg-[#10122b] text-white border-[#F2C94C]/20" />
            </div>
            <div>
              <Label htmlFor="contact-role" className="text-[#F2C94C]">Role</Label>
              <Input id="contact-role" name="role" value={contactForm.role} onChange={handleContactFormChange} className="bg-[#10122b] text-white border-[#F2C94C]/20" />
            </div>
            <div>
              <Label htmlFor="contact-phone" className="text-[#F2C94C]">Phone</Label>
              <Input id="contact-phone" name="phone" value={contactForm.phone} onChange={handleContactFormChange} className="bg-[#10122b] text-white border-[#F2C94C]/20" />
            </div>
            <div>
              <Label htmlFor="contact-notes" className="text-[#F2C94C]">Notes</Label>
              <Textarea id="contact-notes" name="notes" value={contactForm.notes} onChange={handleContactFormChange} className="bg-[#10122b] text-white border-[#F2C94C]/20" rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" className="border-[#F2C94C] text-[#F2C94C] rounded-full px-4 font-bold" onClick={() => setContactModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-bold rounded-xl shadow-gold-glow">{editingContact ? "Save" : "Add"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Edit Manual Event Modal */}
      <Dialog open={!!editingEvent} onOpenChange={v => { if (!v) setEditingEvent(null); }}>
        <DialogContent className="bg-[#181a2f]/90 border border-[#F2C94C]/30 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle>Edit Timeline Entry</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEditEvent}>
            <div>
              <Label htmlFor="edit-note" className="text-[#F2C94C]">Note</Label>
              <Textarea id="edit-note" value={editNote} onChange={e => setEditNote(e.target.value)} required className="bg-[#10122b] text-white border-[#F2C94C]/20" />
            </div>
            <div>
              <Label htmlFor="edit-date" className="text-[#F2C94C]">Date/Time</Label>
              <Input id="edit-date" type="datetime-local" value={editDate} onChange={e => setEditDate(e.target.value)} className="bg-[#10122b] text-white border-[#F2C94C]/20" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" className="border-[#F2C94C] text-[#F2C94C] rounded-full px-4 font-bold" onClick={() => setEditingEvent(null)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-bold rounded-xl shadow-gold-glow" disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 