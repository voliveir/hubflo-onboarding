"use client";
import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { FeedbackBoardCard } from '@/lib/types';
import { marked } from 'marked';
import { useReveal } from '@/hooks/useReveal';
import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';

const STATUS_COLUMNS = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'closed', label: 'Won\'t Fix / Closed' },
];
const TYPE_COLORS = {
  bug: 'bg-brand-gold/20 text-brand-gold border-brand-gold/40',
  feature: 'bg-brand-gold/20 text-brand-gold border-brand-gold/40',
  improvement: 'bg-brand-gold/20 text-brand-gold border-brand-gold/40',
};

export function FeedbackBoardClientView({ clientId }: { clientId: string }) {
  const { ref, isVisible } = useReveal();
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
    <div ref={ref} className={cn("flex flex-col gap-6", isVisible && "animate-fade-in-up")}>
      <div className="mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Your Feedback & Requests</h2>
        <p className="text-white/80 mt-2">Track the status of your submitted bugs, feature requests, and improvements</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STATUS_COLUMNS.map(col => {
          const colCards = cards.filter(c => c.status === col.key);
          return (
            <div key={col.key} className="bg-[#10122b]/90 text-white rounded-3xl border border-brand-gold/30 p-4 min-h-[300px] transition-all duration-300 hover:border-brand-gold/60 hover:shadow-lg">
              <div className="font-bold text-lg mb-4 text-white">{col.label}</div>
              {loading ? (
                <div className="text-center text-white/60 py-8">Loading...</div>
              ) : showPlaceholder ? (
                <div className="flex flex-col items-center justify-center h-40 text-white/60">
                  <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/40 mb-4 opacity-40">
                    <Package className="w-8 h-8 text-brand-gold" strokeWidth={1.5} />
                  </div>
                  <span className="text-center mb-4">No feedback submitted yet</span>
                </div>
              ) : (
                colCards.map(card => (
                  <div key={card.id} className="bg-[#181a2f] text-white rounded-2xl border border-brand-gold/30 p-4 mb-3 transition-all duration-300 hover:border-brand-gold/60 hover:shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-base text-white">{card.title}</div>
                      <Badge className={TYPE_COLORS[card.type]}>{card.type.charAt(0).toUpperCase() + card.type.slice(1)}</Badge>
                    </div>
                    <div className="prose prose-sm mb-3 text-white/90" dangerouslySetInnerHTML={{ __html: marked(card.description || '') }} />
                    <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                      <span>{new Date(card.submission_date).toLocaleDateString()}</span>
                      <span>|</span>
                      <span>Status: {col.label}</span>
                    </div>
                  </div>
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