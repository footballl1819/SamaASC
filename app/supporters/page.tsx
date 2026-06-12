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
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim() || !team || !supabase) return;
    setSubmitting(true);
    const { data } = await supabase
      .from('supporters')
      .insert({ 
        name: user.name || user.username, 
        message: (selectedSticker ? selectedSticker + ' ' : '') + message.trim(), 
        team_id: team.id 
      })
      .select();
    if (data && data.length > 0) {
      setSupporters(prev => [data[0], ...prev]);
      setMessage('');
      setSelectedSticker(null);
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
                    ? 'bg-green-100 ring-2 ring-green-500 scale-110' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
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
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm input-shadow focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-none"
          />
          <button
            type="submit"
            disabled={!message.trim() || submitting}
            className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold btn-shadow hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
