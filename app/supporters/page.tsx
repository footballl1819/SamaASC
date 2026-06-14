'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Supporter } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { useTeam } from '@/contexts/team-context';
import { Heart, Send, Flame, MessageCircle } from 'lucide-react';

export default function SupportersPage() {
  const router = useRouter();
  const { team, user, loading: contextLoading } = useTeam();
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);

  const STICKERS = ['⚽', '🔥', '💪', '🎉', '👏', '❤️', '⭐', '🏆', '🚀', '💯'];

  useEffect(() => {
    // Check authentication
    if (!contextLoading) {
      if (!team) {
        router.push('/login');
        return;
      }
      if (!user) {
        router.push('/user-login');
        return;
      }
    }
  }, [team, user, contextLoading, router]);

  useEffect(() => {
    async function load() {
      if (!team || !supabase) return;
      
      const { data } = await supabase.from('supporters').select('*').eq('team_id', team.id).order('created_at', { ascending: false });
      setSupporters(data || []);
      setLoading(false);
    }
    load();

    // Setup realtime subscription
    if (team && supabase) {
      const channel = supabase
        .channel('supporters-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'supporters',
            filter: `team_id=eq.${team.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setSupporters(prev => [payload.new as Supporter, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setSupporters(prev => prev.map(s => s.id === payload.new.id ? payload.new as Supporter : s));
            } else if (payload.eventType === 'DELETE') {
              setSupporters(prev => prev.filter(s => s.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase!.removeChannel(channel);
      };
    }
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !team) return;
    if (!selectedSticker && !message.trim()) return;
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/supporters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: user.name || user.username, 
          message: (selectedSticker ? selectedSticker + ' ' : '') + message.trim(), 
          team_id: team.id 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit message');
      }

      const data = await response.json();
      setSupporters(prev => [data, ...prev]);
      setMessage('');
      setSelectedSticker(null);
    } catch (error) {
      console.error('Error submitting message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || contextLoading) {
    return (
      <AppShell>
        <div className="space-y-4 pt-4">
          <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      </AppShell>
    );
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  }

  const COLORS = ['from-green-400 to-green-600', 'from-blue-400 to-blue-600', 'from-amber-400 to-amber-600', 'from-red-400 to-red-600', 'from-teal-400 to-teal-600'];

  return (
    <AppShell>
      <div className="space-y-5 pt-4">
        {/* Page Header with Icon */}
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg icon-hover"
            style={{ 
              background: team?.secondary_color ? `linear-gradient(135deg, ${team.secondary_color}, ${team.accent_color})` : 'linear-gradient(135deg, #22c55e, #15803d)'
            }}
          >
            <Heart size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supporters</h1>
            <p className="text-sm text-gray-500">Messages de soutien</p>
          </div>
        </div>

        {/* Header Card */}
        <div className="rounded-2xl bg-gradient-to-br from-rose-500 via-red-500 to-orange-600 p-5 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={20} />
            <span className="text-sm font-bold">Ambiance du Quartier</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            Sama ASC représente tout le quartier! Exprimez votre soutien et garantissez l&apos;ambiance!
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Heart size={16} className="animate-pulse" />
            <span className="text-sm font-medium">{supporters.length} messages de soutien</span>
          </div>
        </div>

        {/* Post Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle size={16} className="text-green-600" />
            <span className="text-sm font-bold text-gray-700">Votre message</span>
          </div>
          
          {/* Sticker Picker */}
          <div className="flex gap-2 flex-wrap">
            {STICKERS.map((sticker) => (
              <button
                key={sticker}
                type="button"
                onClick={() => setSelectedSticker(selectedSticker === sticker ? null : sticker)}
                className={`text-2xl p-2 rounded-lg transition-all ${
                  selectedSticker === sticker 
                    ? 'ring-2 scale-110' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: selectedSticker === sticker ? (team?.secondary_color ? `${team.secondary_color}20` : 'rgba(34, 197, 94, 0.1)') : undefined,
                } as React.CSSProperties}
              >
                {sticker}
              </button>
            ))}
          </div>
          
          <textarea
            placeholder="Votre message de soutien..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm input-shadow focus:outline-none focus:ring-2 resize-none"
            style={{
              '--tw-ring-color': team?.secondary_color || '#22c55e',
            } as React.CSSProperties}
          />
          <button
            type="submit"
            disabled={!message.trim() || submitting}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold btn-shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: team?.secondary_color || '#22c55e' }}
          >
            <Send size={16} />
            {submitting ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>

        {/* Messages */}
        <div className="space-y-3">
          {supporters.map((s, idx) => (
            <div
              key={s.id}
              className="rounded-xl bg-white p-4 shadow-md hover-lift"
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${COLORS[idx % COLORS.length]} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <span className="text-white text-xs font-bold">
                    {s.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-400">{timeAgo(s.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.message}</p>
                  <p className="text-xs text-gray-400 mt-1">- {s.name}</p>
                </div>
              </div>
            </div>
          ))}

          {supporters.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Heart size={40} className="mb-3 opacity-50" />
              <p className="text-sm">Soyez le premier à soutenir l&apos;équipe!</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
