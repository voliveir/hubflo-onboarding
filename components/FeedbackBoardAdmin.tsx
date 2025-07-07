"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FeedbackBoardCard } from '@/lib/types';
import { marked } from 'marked';
import { GripVertical } from 'lucide-react';

const STATUS_COLUMNS = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'closed', label: 'Won\'t Fix / Closed' },
];
const TYPE_COLORS = {
  bug: 'bg-yellow-200 text-yellow-800',
  feature: 'bg-blue-200 text-blue-800',
  improvement: 'bg-green-200 text-green-800',
};

export function FeedbackBoardAdmin() {
  const [cards, setCards] = useState<FeedbackBoardCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClient, setFilterClient] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<FeedbackBoardCard | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'bug',
    client_id: '',
  });
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [clientSearch, setClientSearch] = useState('');

  useEffect(() => {
    fetchCards();
  }, [filterClient]);

  useEffect(() => {
    fetch('/api/feedback-board/clients')
      .then(res => res.json())
      .then(setClients);
  }, []);

  async function fetchCards() {
    setLoading(true);
    const url = '/api/feedback-board' + (filterClient ? `?clientId=${filterClient}` : '');
    const res = await fetch(url);
    const data = await res.json();
    setCards(data);
    setLoading(false);
  }

  function openNewCard() {
    setEditingCard(null);
    setForm({ title: '', description: '', type: 'bug', client_id: '' });
    setShowDialog(true);
  }

  function openEditCard(card: FeedbackBoardCard) {
    setEditingCard(card);
    setForm({
      title: card.title,
      description: card.description,
      type: card.type,
      client_id: card.client_id,
    });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.title || !form.client_id) return;
    if (editingCard) {
      await fetch('/api/feedback-board', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCard.id, ...form }),
      });
    } else {
      await fetch('/api/feedback-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setShowDialog(false);
    fetchCards();
  }

  async function handleDelete(card: FeedbackBoardCard) {
    if (!confirm('Delete this card?')) return;
    await fetch('/api/feedback-board', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: card.id }),
    });
    fetchCards();
  }

  async function handleMove(card: FeedbackBoardCard, newStatus: string) {
    await fetch('/api/feedback-board', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: card.id, status: newStatus }),
    });
    fetchCards();
  }

  // Filtered client list for search
  const filteredClients = clientSearch
    ? clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
    : clients;
  const selectedClient = clients.find(c => c.id === filterClient);
  const formSelectedClient = clients.find(c => c.id === form.client_id);

  return (
    <div className="flex flex-col gap-6">
      {/* Filter + Add bar */}
      <div className="sticky top-0 z-10 flex items-center gap-4 mb-4 bg-[#10122b]/80 px-4 py-3 rounded-xl ring-1 ring-[#F2C94C]/10 shadow-inner-glass backdrop-blur-md">
        <div className="relative w-64">
          <Input
            placeholder="Filter by client name..."
            value={selectedClient ? selectedClient.name : clientSearch}
            onChange={e => {
              setClientSearch(e.target.value);
              setFilterClient('');
            }}
            onFocus={() => setClientSearch('')}
            className="w-64 bg-[#181a2f] text-white border border-[#23244a] rounded-full px-4 py-2"
          />
          {clientSearch && (
            <div className="absolute z-10 bg-[#181a2f] border border-[#23244a] w-full max-h-48 overflow-auto shadow-lg rounded-xl">
              {filteredClients.map(c => (
                <div
                  key={c.id}
                  className="px-3 py-2 hover:bg-[#23244a] cursor-pointer text-white"
                  onClick={() => {
                    setFilterClient(c.id);
                    setClientSearch('');
                  }}
                >
                  {c.name}
                </div>
              ))}
              {filteredClients.length === 0 && (
                <div className="px-3 py-2 text-gray-400">No clients found</div>
              )}
            </div>
          )}
        </div>
        <Button onClick={openNewCard} className="bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#010124] font-semibold rounded-full px-5 py-2 shadow-md ml-2 hover:brightness-110 border border-[#F2C94C]/70" style={{ boxShadow: '0 0 8px #F2C94C55' }}>+ Add Feedback</Button>
      </div>
      {/* Board columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-[#F2C94C]/70 scrollbar-track-transparent">
        {STATUS_COLUMNS.map(col => {
          const colCards = cards.filter(c => c.status === col.key);
          return (
            <div key={col.key} className="bg-brand-navy-light/5 rounded-xl p-2 min-h-[400px] border-r border-[#F2C94C]/30 flex flex-col gap-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-[18px] text-[#F2C94C]">{col.label}</span>
                <span className="inline-flex items-center h-[20px] px-2 rounded-full text-[13px] font-semibold bg-[#181a2f]/30 text-[#F2C94C]" style={{ minHeight: 12 }}>{colCards.length}</span>
              </div>
              {loading ? (
                <div className="text-center text-white/40 py-8">Loading...</div>
              ) : (
                colCards.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-600 italic min-h-[120px]">No items yet 🚀</div>
                ) : (
                  colCards.map(card => {
                    const client = clients.find(cl => cl.id === card.client_id);
                    return (
                      <div key={card.id} className="group flex items-stretch">
                        <div className="flex items-center pr-2 cursor-grab select-none">
                          <GripVertical className="text-slate-500/60 w-4 h-4" />
                        </div>
                        <Card className="flex-1 mb-3 bg-[#11122b] border-4 border-[#F2C94C]/50 rounded-xl shadow-lg transition-all duration-150 hover:-translate-y-0.5 hover:ring-2 hover:ring-[#F2C94C]/40">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-white text-[16px]">{card.title}</div>
                              <span className={
                                card.status === 'backlog'
                                  ? 'bg-slate-500 text-white px-3 py-1 rounded-full text-[11px] font-semibold'
                                  : card.status === 'in_progress'
                                  ? 'bg-orange-400 text-white px-3 py-1 rounded-full text-[11px] font-semibold'
                                  : card.status === 'completed'
                                  ? 'bg-green-400 text-white px-3 py-1 rounded-full text-[11px] font-semibold'
                                  : 'bg-red-500 text-white px-3 py-1 rounded-full text-[11px] font-semibold'
                              } style={{ borderRadius: 12, minHeight: 22 }}>{STATUS_COLUMNS.find(s => s.key === card.status)?.label}</span>
                            </div>
                            <div className="prose prose-sm mb-2 text-slate-300" dangerouslySetInnerHTML={{ __html: marked(card.description || '') }} />
                            <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                              <span>Client: {client ? client.name : card.client_id}</span>
                              <span>|</span>
                              <span>{new Date(card.submission_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2 flex-wrap mt-2">
                              {['backlog', 'in_progress', 'completed', 'closed'].map(status => (
                                <Button
                                  key={status}
                                  size="sm"
                                  variant="ghost"
                                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors border border-[#F2C94C]/30 ${card.status === status ? 'bg-gradient-to-r from-[#F2C94C] to-[#F2994A] text-[#10122b]' : 'bg-[#181a2f] text-[#F2C94C] hover:bg-[#23244a]'}`}
                                  onClick={() => handleMove(card, status)}
                                >
                                  {STATUS_COLUMNS.find(s => s.key === status)?.label}
                                </Button>
                              ))}
                              <Button size="sm" variant="outline" className="rounded-full hidden group-hover:flex" onClick={() => openEditCard(card)}>Edit</Button>
                              <Button size="sm" variant="destructive" className="rounded-full hidden group-hover:flex" onClick={() => handleDelete(card)}>Delete</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })
                )
              )}
            </div>
          );
        })}
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">{editingCard ? 'Edit Feedback' : 'Add Feedback'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="text-black placeholder:text-black/50"
            />
            <Textarea
              placeholder="Description (markdown supported)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
              className="text-black placeholder:text-black/50"
            />
            <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
              </SelectContent>
            </Select>
            {/* Client name autocomplete for form */}
            <div className="relative w-full">
              <Input
                placeholder="Client name..."
                value={formSelectedClient ? formSelectedClient.name : clientSearch}
                onChange={e => {
                  setClientSearch(e.target.value);
                  setForm(f => ({ ...f, client_id: '' }));
                }}
                onFocus={() => setClientSearch('')}
                className="text-black placeholder:text-black/50"
              />
              {clientSearch && (
                <div className="absolute z-10 bg-white border w-full max-h-48 overflow-auto shadow-lg rounded">
                  {filteredClients.map(c => (
                    <div
                      key={c.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setForm(f => ({ ...f, client_id: c.id }));
                        setClientSearch('');
                      }}
                    >
                      {c.name}
                    </div>
                  ))}
                  {filteredClients.length === 0 && (
                    <div className="px-3 py-2 text-gray-400">No clients found</div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingCard ? 'Save' : 'Add'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FeedbackBoardAdmin; 