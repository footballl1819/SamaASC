'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Announcement, Match } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { useTeam } from '@/contexts/team-context';
import { Calendar, MapPin, Clock, Trophy, Dumbbell, Users, Megaphone, ChevronRight } from 'lucide-react';

const TYPE_CONFIG: Record<string, { icon: typeof Calendar; color: string; bg: string; label: string }> = {
  match: { icon: Trophy, color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'Match' },
  training: { icon: Dumbbell, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'Entraînement' },
  meeting: { icon: Users, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Réunion' },
  other: { icon: Megaphone, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', label: 'Annonce' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(dateStr: string) {
  const now = new Date();
  now.setHours(0,0,0,0);
  const target = new Date(dateStr + 'T00:00:00');
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Demain';
  if (diff > 1 && diff <= 7) return `Dans ${diff} jours`;
  return formatDate(dateStr);
}

export default function AccueilPage() {
  const router = useRouter();
  const { team, user, loading: contextLoading } = useTeam();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

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
      if (!team) return;
      
      const [annRes, matchRes] = await Promise.all([
        supabase.from('announcements').select('*').eq('team_id', team.id).order('event_date', { ascending: true }),
        supabase.from('matches').select('*').eq('team_id', team.id).eq('status', 'upcoming').order('match_date', { ascending: true }),
      ]);
      setAnnouncements(annRes.data || []);
      setUpcomingMatches(matchRes.data || []);
      setLoading(false);
    }
    load();
  }, [team]);

  if (loading || contextLoading) {
    return (
      <AppShell>
        <div className="space-y-4 pt-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </AppShell>
    );
  }

  const nextMatch = upcomingMatches[0];

  return (
    <AppShell>
      <div className="space-y-5 pt-4">
        {/* Hero / Next Match Banner */}
        {nextMatch && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-5 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                  Prochain Match
                </div>
                <span className="text-green-200 text-xs">{daysUntil(nextMatch.match_date)}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1.5 shadow-inner">
                    <span className="font-bold text-lg">SA</span>
                  </div>
                  <span className="text-xs text-green-200">Sama ASC</span>
                </div>
                <div className="text-center px-3">
                  <span className="text-3xl font-bold">VS</span>
                  <div className="text-xs text-green-200 mt-1">
                    {nextMatch.competition || 'Amical'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-1.5 shadow-inner border border-white/20">
                    <span className="font-bold text-sm">{nextMatch.opponent.replace('ASC ', '')}</span>
                  </div>
                  <span className="text-xs text-green-200">{nextMatch.opponent}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-green-100">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>{formatDate(nextMatch.match_date)}</span>
                </div>
                {nextMatch.match_time && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{nextMatch.match_time}</span>
                  </div>
                )}
              </div>
              {nextMatch.venue && (
                <div className="flex items-center justify-center gap-1.5 text-sm text-green-200 mt-1.5">
                  <MapPin size={14} />
                  <span>{nextMatch.venue}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Announcements */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Annonces</h2>
            <span className="text-xs text-gray-400">{announcements.length} annonces</span>
          </div>
          <div className="space-y-3">
            {announcements.map((ann) => {
              const config = TYPE_CONFIG[ann.type];
              const Icon = config.icon;
              return (
                <div
                  key={ann.id}
                  className={`rounded-xl border p-4 hover-lift ${config.bg}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/60 shadow-sm`}>
                      <Icon size={18} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold ${config.color}`}>
                          {config.label}
                        </span>
                        {ann.event_date && (
                          <span className="text-xs text-gray-400">
                            {daysUntil(ann.event_date)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{ann.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{ann.content}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white p-3 text-center shadow-md hover-lift">
            <div className="text-2xl font-bold text-green-600">{upcomingMatches.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Matchs à venir</div>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-md hover-lift">
            <div className="text-2xl font-bold text-blue-600">{announcements.filter(a => a.type === 'training').length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Entraînements</div>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-md hover-lift">
            <div className="text-2xl font-bold text-amber-600">{announcements.filter(a => a.type === 'meeting').length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Réunions</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
