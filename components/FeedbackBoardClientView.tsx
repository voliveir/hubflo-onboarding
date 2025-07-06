"use client";
import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { FeedbackBoardCard } from '@/lib/types';
import { marked } from 'marked';
import { useReveal } from '@/hooks/useReveal';
import { cn } from '@/lib/utils';

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
            <div key={col.key} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/20 p-4 min-h-[300px] transition-all duration-300 hover:border-brand-gold/40">
              <div className="font-bold text-lg mb-4 text-white">{col.label}</div>
              {loading ? (
                <div className="text-center text-white/60 py-8">Loading...</div>
              ) : showPlaceholder ? (
                <div className="flex flex-col items-center justify-center h-40 text-white/60">
                  <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/20 mb-3">
                    <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 21m0 0l-1.5-4m1.5 4h6m-6 0h6m0 0l1.5-4m-1.5 4l.75-4M12 3v12m0 0c-4.418 0-8 1.79-8 4v1h16v-1c0-2.21-3.582-4-8-4z" />
                    </svg>
                  </div>
                  <span>No feedback/bugs submitted yet</span>
                </div>
              ) : (
                colCards.map(card => (
                  <div key={card.id} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-4 mb-3 transition-all duration-300 hover:border-brand-gold/40 hover:shadow-lg">
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