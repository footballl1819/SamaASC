'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Match, Player, MatchVote } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { useTeam } from '@/contexts/team-context';
import { Trophy, Calendar, MapPin, ThumbsUp, Check, ScrollText } from 'lucide-react';

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

        {matches.map((match) => {
          const motm = getManOfMatch(match.id);
          const isExpanded = selectedMatch === match.id;

          return (
            <div key={match.id} className="rounded-2xl bg-white shadow-lg overflow-hidden hover-lift">
              {/* Match Header */}
              <button
                onClick={() => setSelectedMatch(isExpanded ? null : match.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-400">{match.competition}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    match.status === 'live'
                      ? 'bg-red-100 text-red-600 animate-pulse'
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {match.status === 'live' ? 'En direct' : 'Terminé'}
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

              {/* Man of the Match */}
              {motm && match.status === 'completed' && (
                <div className="mx-4 mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                  <Trophy size={18} className="text-amber-500 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-amber-600 font-medium uppercase">Homme du match</div>
                    <div className="text-sm font-bold text-amber-800">{motm.name}</div>
                  </div>
                </div>
              )}

              {/* Vote Section */}
              {isExpanded && match.status === 'completed' && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <ThumbsUp size={14} className="text-green-600" />
                    Votez pour l&apos;homme du match
                  </h4>
                  <input
                    type="text"
                    placeholder="Votre nom"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-3 input-shadow focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {players.slice(0, 8).map(player => {
                      const voteCount = getVotesForPlayer(match.id, player.id);
                      const hasVoted = votedFor === player.id;
                      return (
                        <button
                          key={player.id}
                          onClick={() => handleVote(match.id, player.id)}
                          disabled={!voterName.trim() || hasVoted}
                          className={`flex items-center gap-2 rounded-lg p-2 text-left text-xs transition-all duration-200 ${
                            hasVoted
                              ? 'bg-green-50 border border-green-300 text-green-700'
                              : 'bg-gray-50 border border-gray-100 hover:bg-green-50 hover:border-green-200 disabled:opacity-50'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                            {player.photo_url ? (
                              <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-bold text-green-600">{player.jersey_number || ''}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{player.name}</div>
                            <div className="text-gray-400">{voteCount} vote{voteCount !== 1 ? 's' : ''}</div>
                          </div>
                          {hasVoted && <Check size={14} className="text-green-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {matches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Trophy size={48} className="mb-3 opacity-50" />
            <p className="text-sm">Aucun résultat disponible</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
