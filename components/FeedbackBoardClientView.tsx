"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
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

export function FeedbackBoardClientView({ clientId }: { clientId: string }) {
  const [cards, setCards] = useState<FeedbackBoardCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
    // eslint-disable-next-line
  }, [clientId]);

  async function fetchCards() {
    setLoading(true);
    const res = await fetch(`/api/feedback-board?clientId=${clientId}`);
    const data = await res.json();
    setCards(data);
    setLoading(false);
  }

  // Only show placeholder if there are no cards at all
  const showPlaceholder = !loading && cards.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#010124]">Your Feedback & Requests</h2>
        <p className="text-gray-600 mt-2">Track the status of your submitted bugs, feature requests, and improvements</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STATUS_COLUMNS.map(col => {
          const colCards = cards.filter(c => c.status === col.key);
          return (
            <div key={col.key} className="bg-gray-50 rounded-lg p-2 min-h-[300px]">
              <div className="font-bold text-lg mb-2">{col.label}</div>
              {loading ? (
                <div className="text-center text-gray-400 py-8">Loading...</div>
              ) : showPlaceholder ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 21m0 0l-1.5-4m1.5 4h6m-6 0h6m0 0l1.5-4m-1.5 4l.75-4M12 3v12m0 0c-4.418 0-8 1.79-8 4v1h16v-1c0-2.21-3.582-4-8-4z" /></svg>
                  <span>No feedback/bugs submitted yet</span>
                </div>
              ) : (
                colCards.map(card => (
                  <Card key={card.id} className="mb-3">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-base">{card.title}</div>
                        <Badge className={TYPE_COLORS[card.type]}>{card.type.charAt(0).toUpperCase() + card.type.slice(1)}</Badge>
                      </div>
                      <div className="prose prose-sm mb-2" dangerouslySetInnerHTML={{ __html: marked(card.description || '') }} />
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span>{new Date(card.submission_date).toLocaleDateString()}</span>
                        <span>|</span>
                        <span>Status: {col.label}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FeedbackBoardClientView; 