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
      <div className="flex items-center gap-4 mb-4">
        {/* Client name autocomplete for filter */}
        <div className="relative w-64">
          <Input
            placeholder="Filter by client name..."
            value={selectedClient ? selectedClient.name : clientSearch}
            onChange={e => {
              setClientSearch(e.target.value);
              setFilterClient('');
            }}
            onFocus={() => setClientSearch('')}
            className="w-64"
          />
          {clientSearch && (
            <div className="absolute z-10 bg-white border w-full max-h-48 overflow-auto shadow-lg rounded">
              {filteredClients.map(c => (
                <div
                  key={c.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
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
        <Button onClick={openNewCard}>+ Add Feedback</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STATUS_COLUMNS.map(col => (
          <div key={col.key} className="bg-gray-50 rounded-lg p-2 min-h-[400px]">
            <div className="font-bold text-lg mb-2">{col.label}</div>
            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading...</div>
            ) : (
              cards.filter(c => c.status === col.key).map(card => {
                const client = clients.find(cl => cl.id === card.client_id);
                return (
                  <Card key={card.id} className="mb-3">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-base">{card.title}</div>
                        <Badge className={TYPE_COLORS[card.type]}>{card.type.charAt(0).toUpperCase() + card.type.slice(1)}</Badge>
                      </div>
                      <div className="prose prose-sm mb-2" dangerouslySetInnerHTML={{ __html: marked(card.description || '') }} />
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span>Client: {client ? client.name : card.client_id}</span>
                        <span>|</span>
                        <span>{new Date(card.submission_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        {col.key !== 'backlog' && (
                          <Button size="sm" variant="outline" onClick={() => handleMove(card, 'backlog')}>Backlog</Button>
                        )}
                        {col.key !== 'in_progress' && (
                          <Button size="sm" variant="outline" onClick={() => handleMove(card, 'in_progress')}>In Progress</Button>
                        )}
                        {col.key !== 'completed' && (
                          <Button size="sm" variant="outline" onClick={() => handleMove(card, 'completed')}>Completed</Button>
                        )}
                        {col.key !== 'closed' && (
                          <Button size="sm" variant="outline" onClick={() => handleMove(card, 'closed')}>Closed</Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => openEditCard(card)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(card)}>Delete</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        ))}
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCard ? 'Edit Feedback' : 'Add Feedback'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <Textarea
              placeholder="Description (markdown supported)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
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