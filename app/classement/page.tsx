'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Standing } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { useTeam } from '@/contexts/team-context';
import { Trophy } from 'lucide-react';

export default function ClassementPage() {
  const { team } = useTeam();
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');

  useEffect(() => {
    async function load() {
      if (!team) return;
      
      const { data } = await supabase.from('standings').select('*').eq('team_id', team.id).order('competition_name').order('position');
      setStandings(data || []);
      if (data && data.length > 0) {
        setSelectedCompetition(data[0].competition_name);
      }
      setLoading(false);
    }
    load();
  }, [team]);

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-4 pt-4">
          <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      </AppShell>
    );
  }

  const competitions = Array.from(new Set(standings.map(s => s.competition_name)));
  const filtered = standings.filter(s => s.competition_name === selectedCompetition);
  const ourTeam = filtered.find(s => s.team_name === team?.name);

  return (
    <AppShell>
      <div className="space-y-5 pt-4">
        {/* Competition Selector - always visible */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {competitions.map(comp => (
            <button
              key={comp}
              onClick={() => setSelectedCompetition(comp)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                selectedCompetition === comp
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 shadow-md hover:shadow-lg'
              }`}
            >
              {comp}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Trophy size={48} className="mb-3 opacity-50" />
            <p className="text-sm">Aucun classement disponible</p>
          </div>
        )}

        {/* Our Position Card */}
        {ourTeam && (
          <div className="rounded-2xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-5 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={18} />
              <span className="text-sm font-medium text-green-200">{selectedCompetition}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-5xl font-bold">{ourTeam.position}<span className="text-2xl text-green-200">e</span></div>
                <div className="text-green-200 text-sm mt-1">{ourTeam.team_name}</div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold">{ourTeam.points}</div>
                  <div className="text-[10px] text-green-200 uppercase tracking-wider">Pts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{ourTeam.goals_for}-{ourTeam.goals_against}</div>
                  <div className="text-[10px] text-green-200 uppercase tracking-wider">Buts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{ourTeam.won + ourTeam.drawn + ourTeam.lost}</div>
                  <div className="text-[10px] text-green-200 uppercase tracking-wider">Joués</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center gap-1 text-sm">
                <span className="text-green-200">V:</span>
                <span className="font-bold">{ourTeam.won}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-green-200">N:</span>
                <span className="font-bold">{ourTeam.drawn}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-green-200">D:</span>
                <span className="font-bold">{ourTeam.lost}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-green-200">Diff:</span>
                <span className="font-bold">{ourTeam.goals_for - ourTeam.goals_against > 0 ? '+' : ''}{ourTeam.goals_for - ourTeam.goals_against}</span>
              </div>
            </div>
          </div>
        )}

        {/* Full Standings Table */}
        {filtered.length > 0 && (
          <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
            <div className="grid grid-cols-[32px_1fr_32px_32px_32px_32px_32px_40px] gap-1 px-3 py-2.5 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <div>#</div>
              <div>Équipe</div>
              <div>J</div>
              <div>V</div>
              <div>N</div>
              <div>D</div>
              <div>Pts</div>
              <div>Diff</div>
            </div>
            {filtered.map((standing, idx) => {
              const isUs = standing.team_name === team?.name;
              const diff = standing.goals_for - standing.goals_against;
              return (
                <div
                  key={standing.id}
                  className={`grid grid-cols-[32px_1fr_32px_32px_32px_32px_32px_40px] gap-1 px-3 py-2.5 text-xs items-center transition-colors duration-200 ${
                    isUs
                      ? 'bg-green-50 border-l-2 border-green-600'
                      : idx % 2 === 0
                      ? 'bg-white'
                      : 'bg-gray-50/50'
                  } ${idx < filtered.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className={`font-bold ${isUs ? 'text-green-600' : 'text-gray-400'}`}>
                    {standing.position}
                  </div>
                  <div className={`font-semibold truncate ${isUs ? 'text-green-700' : 'text-gray-800'}`}>
                    {standing.team_name}
                  </div>
                  <div className="text-gray-500 text-center">{standing.played}</div>
                  <div className="text-gray-500 text-center">{standing.won}</div>
                  <div className="text-gray-500 text-center">{standing.drawn}</div>
                  <div className="text-gray-500 text-center">{standing.lost}</div>
                  <div className={`font-bold text-center ${isUs ? 'text-green-600' : 'text-gray-700'}`}>
                    {standing.points}
                  </div>
                  <div className={`text-center ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {diff > 0 ? '+' : ''}{diff}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
