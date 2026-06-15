'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Match, Player, MatchVote } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { useTeam } from '@/contexts/team-context';
import { Trophy, Calendar, MapPin, ThumbsUp, Check, ScrollText, X } from 'lucide-react';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function ResultatsPage() {
  const router = useRouter();
  const { team, user, loading: contextLoading } = useTeam();
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [votes, setVotes] = useState<MatchVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [voterName, setVoterName] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');

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
      
      const [m, p, v] = await Promise.all([
        fetch(`/api/data/matches?team_id=${team.id}`).then(r => r.json()),
        fetch(`/api/data/players?team_id=${team.id}`).then(r => r.json()),
        fetch(`/api/data/match-votes?team_id=${team.id}`).then(r => r.json()).catch(() => []),
      ]);
      setMatches(m);
      setPlayers(p);
      setVotes(v);
      setLoading(false);
    }
    load();

    // Setup realtime subscriptions
    if (team && supabase) {
      const channels: any[] = [];
      const tables = ['matches', 'players', 'match_votes'];

      tables.forEach(table => {
        const channel = supabase!
          .channel(`${table}-changes`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: table,
              filter: `team_id=eq.${team.id}`,
            },
            () => {
              load();
            }
          )
          .subscribe();
        channels.push(channel);
      });

      return () => {
        channels.forEach(channel => supabase!.removeChannel(channel));
      };
    }
  }, [team]);

  const handleVote = async (matchId: string, playerId: string) => {
    if (!voterName.trim() || !team || !supabase) return;
    const { data } = await supabase
      .from('match_votes')
      .insert({ match_id: matchId, player_id: playerId, voter_name: voterName.trim(), team_id: team.id })
      .select();
    if (data && data.length > 0) {
      setVotes(prev => [...prev, data[0]]);
      setVotedFor(playerId);
    }
  };

  const getVotesForPlayer = (matchId: string, playerId: string) => {
    return votes.filter(v => v.match_id === matchId && v.player_id === playerId).length;
  };

  const getManOfMatch = (matchId: string) => {
    const matchVotes = votes.filter(v => v.match_id === matchId);
    if (matchVotes.length === 0) return null;
    const counts: Record<string, number> = {};
    matchVotes.forEach(v => {
      counts[v.player_id] = (counts[v.player_id] || 0) + 1;
    });
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return players.find(p => p.id === topId) || null;
  };

  const filteredMatches = matches.filter(m => m.status === 'completed' && (!selectedCompetition || m.competition === selectedCompetition));

  if (loading || contextLoading) {
    return (
      <AppShell>
        <div className="space-y-4 pt-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4 pt-4">
        {/* Page Header with Icon */}
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg icon-hover"
            style={{ 
              background: team?.secondary_color ? `linear-gradient(135deg, ${team.secondary_color}, ${team.accent_color})` : 'linear-gradient(135deg, #22c55e, #15803d)'
            }}
          >
            <ScrollText size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Résultats</h1>
            <p className="text-sm text-gray-500">Matchs terminés et votes</p>
          </div>
        </div>

        {/* Competition Filter */}
        <div className="relative">
          <select
            value={selectedCompetition}
            onChange={(e) => setSelectedCompetition(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 appearance-none shadow-md"
          >
            <option value="">Toutes les compétitions</option>
            {['Coupe Maire', 'Coupe Zonal', 'Coupe Départementale', 'Coupe Régional', 'Amical'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {filteredMatches.map((match) => {
          const motm = getManOfMatch(match.id);
          const userHasVoted = votes.some(v => v.match_id === match.id && v.voter_name === user?.name || v.voter_name === user?.username);

          return (
            <div key={match.id} className="rounded-2xl bg-white shadow-lg overflow-hidden hover-lift">
              {/* Match Header */}
              <button
                onClick={() => {
                  setSelectedMatch(match.id);
                  setShowVoteModal(true);
                  setSelectedPlayer('');
                }}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-400">{match.competition}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-600">
                    Terminé
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-center flex-1">
                    <div className="font-bold text-gray-900 text-sm">Sama ASC</div>
                  </div>
                  <div className="flex items-center gap-3 px-3">
                    <span className={`text-2xl font-bold ${
                      match.score_home !== null && match.score_home > (match.score_away || 0)
                        ? 'text-green-600'
                        : 'text-gray-800'
                    }`}>
                      {match.score_home ?? '-'}
                    </span>
                    <span className="text-gray-300">-</span>
                    <span className={`text-2xl font-bold ${
                      match.score_home !== null && match.score_home < (match.score_away || 0)
                        ? 'text-green-600'
                        : 'text-gray-800'
                    }`}>
                      {match.score_away ?? '-'}
                    </span>
                  </div>
                  <div className="text-center flex-1">
                    <div className="font-bold text-gray-900 text-sm">{match.opponent}</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{formatDate(match.match_date)}</span>
                  </div>
                  {match.venue && (
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{match.venue}</span>
                    </div>
                  )}
                </div>
              </button>

              {/* Scorers Section */}
              {match.scorers && (
                <div className="mx-4 mb-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600">⚽</span>
                    <span className="text-[10px] text-blue-600 font-medium uppercase">Buteurs</span>
                  </div>
                  <div className="text-sm text-blue-800">{match.scorers}</div>
                </div>
              )}

              {/* Man of the Match */}
              {motm && (
                <div className="mx-4 mb-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                      {motm.photo_url ? (
                        <img src={motm.photo_url} alt={motm.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="text-3xl font-bold text-white">{motm.jersey_number || '?'}</span>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Trophy size={16} className="text-amber-500" />
                        <span className="text-[10px] text-amber-600 font-bold uppercase">Homme du match</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">{motm.name}</div>
                      <div className="text-sm text-gray-600">#{motm.jersey_number || '?'}</div>
                      <div className="text-sm font-bold text-amber-700 mt-2">Bonne continuation {motm.name}!</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredMatches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Trophy size={48} className="mb-3 opacity-50" />
            <p className="text-sm">Aucun résultat disponible</p>
          </div>
        )}

        {/* Voting Modal */}
        {showVoteModal && selectedMatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Votez pour l'homme du match</h3>
                <button onClick={() => setShowVoteModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm input-shadow focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Sélectionnez un joueur</label>
                  <select
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 appearance-none shadow-md"
                  >
                    <option value="">Choisir un joueur...</option>
                    {players.map(player => (
                      <option key={player.id} value={player.id}>{player.name} #{player.jersey_number || '?'}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    if (selectedPlayer && voterName.trim()) {
                      handleVote(selectedMatch, selectedPlayer);
                      setShowVoteModal(false);
                    }
                  }}
                  disabled={!selectedPlayer || !voterName.trim()}
                  className="w-full py-2.5 rounded-xl text-white text-sm font-semibold btn-shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: team?.secondary_color || '#22c55e' }}
                >
                  <ThumbsUp size={16} />
                  Voter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
