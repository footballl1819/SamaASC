'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Player, Match, Announcement, Standing, GalleryItem, Coach, PlayerStat, MatchLineup, POSITION_LABELS } from '@/lib/types';
import AppShell from '@/components/app-shell';
import FileUpload from '@/components/file-upload';
import { useTeam } from '@/contexts/team-context';
import { Users, Calendar, Megaphone, Trophy, Image, Settings, Plus, Trash2, Edit2, Save, X, ChevronDown, Target, Shirt, Check } from 'lucide-react';

type Tab = 'players' | 'matches' | 'lineup' | 'announcements' | 'standings' | 'gallery' | 'coach' | 'stats';

const TAB_CONFIG: { key: Tab; label: string; icon: typeof Users }[] = [
  { key: 'coach', label: 'Coach', icon: Settings },
  { key: 'players', label: 'Joueurs', icon: Users },
  { key: 'matches', label: 'Matchs', icon: Calendar },
  { key: 'lineup', label: '11 Départ', icon: Shirt },
  { key: 'announcements', label: 'Annonces', icon: Megaphone },
  { key: 'standings', label: 'Classement', icon: Trophy },
  { key: 'stats', label: 'Stats', icon: Target },
  { key: 'gallery', label: 'Galerie', icon: Image },
];

export default function AdminPage() {
  const router = useRouter();
  const { team, user, loading: contextLoading } = useTeam();
  const [tab, setTab] = useState<Tab>('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [lineups, setLineups] = useState<MatchLineup[]>([]);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  // Lineup tab state
  const [lineupMatchId, setLineupMatchId] = useState<string>('');
  const [lineupFormation, setLineupFormation] = useState<string>('4-3-3');
  const [lineupStarters, setLineupStarters] = useState<string[]>([]);
  const [lineupSubs, setLineupSubs] = useState<string[]>([]);
  const [standingsComp, setStandingsComp] = useState<string>('');

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
      // Check if user is admin
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }
    }
  }, [team, user, contextLoading, router]);

  const loadAll = useCallback(async () => {
    if (!team) return;
    
    const [p, m, a, s, g, c, ps, l] = await Promise.all([
      supabase.from('players').select('*').eq('team_id', team.id).order('jersey_number'),
      supabase.from('matches').select('*').eq('team_id', team.id).order('match_date', { ascending: false }),
      supabase.from('announcements').select('*').eq('team_id', team.id).order('created_at', { ascending: false }),
      supabase.from('standings').select('*').eq('team_id', team.id).order('competition_name').order('position'),
      supabase.from('gallery').select('*').eq('team_id', team.id).order('created_at', { ascending: false }),
      supabase.from('coach').select('*').eq('team_id', team.id).limit(1),
      supabase.from('player_stats').select('*').eq('team_id', team.id).order('goals', { ascending: false }),
      supabase.from('match_lineup').select('*').eq('team_id', team.id),
    ]);
    setPlayers(p.data || []);
    setMatches(m.data || []);
    setAnnouncements(a.data || []);
    setStandings(s.data || []);
    setGallery(g.data || []);
    setPlayerStats(ps.data || []);
    setLineups(l.data || []);
    if (c.data && c.data.length > 0) setCoach(c.data[0]);
    if (s.data && s.data.length > 0) setStandingsComp(s.data[0].competition_name);
    setLoading(false);
  }, [team]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleDelete = async (table: string, id: string) => {
    await supabase.from(table).delete().eq('id', id);
    loadAll();
  };

  const handlePlayerSubmit = async () => {
    if (!team) return;
    
    const payload = {
      name: form.name, photo_url: form.photo_url || null,
      position: form.position || 'DEF', jersey_number: form.jersey_number ? parseInt(form.jersey_number) : null,
      is_starter: form.is_starter === 'true',
      team_id: team.id,
    };
    if (editing) { await supabase.from('players').update(payload).eq('id', editing); }
    else { await supabase.from('players').insert(payload); }
    setShowForm(false); setEditing(null); setForm({}); loadAll();
  };

  const handleMatchSubmit = async () => {
    if (!team) return;
    
    const payload = {
      opponent: form.opponent, match_date: form.match_date, match_time: form.match_time || null,
      venue: form.venue || null, competition: form.competition || null, is_home: form.is_home !== 'false',
      status: form.status || 'upcoming', score_home: form.score_home ? parseInt(form.score_home) : null,
      score_away: form.score_away ? parseInt(form.score_away) : null, formation: form.formation || '4-3-3',
      team_id: team.id,
    };
    if (editing) { await supabase.from('matches').update(payload).eq('id', editing); }
    else { await supabase.from('matches').insert(payload); }
    setShowForm(false); setEditing(null); setForm({}); loadAll();
  };

  const handleAnnouncementSubmit = async () => {
    if (!team) return;
    
    const payload = { title: form.title, content: form.content, type: form.type || 'other', event_date: form.event_date || null, team_id: team.id };
    if (editing) { await supabase.from('announcements').update(payload).eq('id', editing); }
    else { await supabase.from('announcements').insert(payload); }
    setShowForm(false); setEditing(null); setForm({}); loadAll();
  };

  const handleStandingSubmit = async () => {
    if (!team) return;
    
    const payload = {
      competition_name: form.competition_name, position: parseInt(form.position) || 0,
      team_name: form.team_name, points: parseInt(form.points) || 0, played: parseInt(form.played) || 0,
      won: parseInt(form.won) || 0, drawn: parseInt(form.drawn) || 0, lost: parseInt(form.lost) || 0,
      goals_for: parseInt(form.goals_for) || 0, goals_against: parseInt(form.goals_against) || 0,
      team_id: team.id,
    };
    if (editing) { await supabase.from('standings').update(payload).eq('id', editing); }
    else { await supabase.from('standings').insert(payload); }
    setShowForm(false); setEditing(null); setForm({}); loadAll();
  };

  const handleGallerySubmit = async () => {
    if (!team) return;
    
    const payload = { type: form.type || 'image', url: form.url, caption: form.caption || null, event_type: form.event_type || 'other', team_id: team.id };
    if (editing) { await supabase.from('gallery').update(payload).eq('id', editing); }
    else { await supabase.from('gallery').insert(payload); }
    setShowForm(false); setEditing(null); setForm({}); loadAll();
  };

  const handleCoachSubmit = async () => {
    if (!team) return;
    
    const payload = { name: form.name, photo_url: form.photo_url || null, role: form.role || 'Entraineur', team_id: team.id };
    if (coach) { await supabase.from('coach').update(payload).eq('id', coach.id); }
    else { await supabase.from('coach').insert(payload); }
    setForm({}); loadAll();
  };

  const handleStatSubmit = async () => {
    if (!team) return;
    
    const payload = {
      player_id: form.player_id, competition_name: form.competition_name,
      goals: parseInt(form.goals) || 0, assists: parseInt(form.assists) || 0,
      matches_played: parseInt(form.matches_played) || 0,
      team_id: team.id,
    };
    if (editing) { await supabase.from('player_stats').update(payload).eq('id', editing); }
    else { await supabase.from('player_stats').insert(payload); }
    setShowForm(false); setEditing(null); setForm({}); loadAll();
  };

  const handleSaveLineup = async () => {
    if (!lineupMatchId || !team) return;
    // Save formation to match
    await supabase.from('matches').update({ formation: lineupFormation }).eq('id', lineupMatchId);
    // Delete existing lineup
    await supabase.from('match_lineup').delete().eq('match_id', lineupMatchId);
    // Insert new starters
    const inserts = lineupStarters.map((pid, idx) => ({
      match_id: lineupMatchId, player_id: pid, position_slot: idx + 1, is_substitute: false, team_id: team.id,
    }));
    // Insert substitutes
    lineupSubs.forEach((pid, idx) => {
      inserts.push({ match_id: lineupMatchId, player_id: pid, position_slot: idx + 12, is_substitute: true, team_id: team.id });
    });
    if (inserts.length > 0) await supabase.from('match_lineup').insert(inserts);
    loadAll();
  };

  // Load lineup when match selected
  useEffect(() => {
    if (!lineupMatchId) { setLineupStarters([]); setLineupSubs([]); return; }
    const match = matches.find(m => m.id === lineupMatchId);
    if (match) setLineupFormation(match.formation || '4-3-3');
    const existing = lineups.filter(l => l.match_id === lineupMatchId);
    if (existing.length > 0) {
      setLineupStarters(existing.filter(l => !l.is_substitute).sort((a, b) => a.position_slot - b.position_slot).map(l => l.player_id));
      setLineupSubs(existing.filter(l => l.is_substitute).map(l => l.player_id));
    } else {
      // Default to is_starter players
      setLineupStarters(players.filter(p => p.is_starter).map(p => p.id).slice(0, 11));
      setLineupSubs(players.filter(p => !p.is_starter).map(p => p.id));
    }
  }, [lineupMatchId, matches, lineups, players]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const startEdit = (item: any, fields: string[]) => {
    const f: Record<string, string> = {};
    fields.forEach(field => { f[field] = String(item[field] ?? ''); });
    setForm(f);
    setEditing(String(item.id));
    setShowForm(true);
  };

  const Input = ({ label, field, type = 'text', placeholder = '' }: { label: string; field: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      <input type={type} value={form[field] || ''} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
        placeholder={placeholder} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm input-shadow focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500" />
    </div>
  );

  const Select = ({ label, field, options }: { label: string; field: string; options: { value: string; label: string }[] }) => (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      <div className="relative">
        <select value={form[field] || ''} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm input-shadow focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 appearance-none bg-white">
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );

  if (loading || contextLoading) {
    return (<AppShell><div className="space-y-4 pt-4"><div className="h-12 rounded-xl bg-gray-100 animate-pulse" /><div className="h-64 rounded-2xl bg-gray-100 animate-pulse" /></div></AppShell>);
  }

  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const standingsCompetitions = Array.from(new Set(standings.map(s => s.competition_name)));
  const filteredStandings = standingsComp ? standings.filter(s => s.competition_name === standingsComp) : standings;

  const toggleStarter = (pid: string) => {
    if (lineupStarters.includes(pid)) {
      setLineupStarters(prev => prev.filter(id => id !== pid));
      setLineupSubs(prev => [...prev, pid]);
    } else if (lineupStarters.length < 11) {
      setLineupStarters(prev => [...prev, pid]);
      setLineupSubs(prev => prev.filter(id => id !== pid));
    }
  };

  const toggleSub = (pid: string) => {
    if (lineupSubs.includes(pid)) {
      setLineupSubs(prev => prev.filter(id => id !== pid));
    } else {
      setLineupSubs(prev => [...prev, pid]);
      setLineupStarters(prev => prev.filter(id => id !== pid));
    }
  };

  return (
    <AppShell>
      <div className="space-y-4 pt-4">
        {/* Tab Selector */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TAB_CONFIG.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button key={t.key} onClick={() => { setTab(t.key); setShowForm(false); setEditing(null); setForm({}); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                  isActive ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-600 shadow-md hover:shadow-lg'}`}>
                <Icon size={14} />{t.label}
              </button>
            );
          })}
        </div>

        {/* COACH TAB */}
        {tab === 'coach' && (
          <div className="rounded-2xl bg-white p-4 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-gray-700">Informations Coach</h3>
            <Input label="Nom" field="name" placeholder="Nom du coach" />
            <FileUpload 
              value={form.photo_url || null}
              onChange={(url) => setForm(prev => ({ ...prev, photo_url: url }))}
              label="Photo"
            />
            <Input label="Rôle" field="role" placeholder="Entraineur" />
            <button onClick={handleCoachSubmit} className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold btn-shadow hover:bg-green-700 flex items-center justify-center gap-2">
              <Save size={16} />{coach ? 'Mettre à jour' : 'Ajouter'}
            </button>
            {coach && (
              <div className="flex items-center gap-3 mt-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  {coach.photo_url ? <img src={coach.photo_url} alt="" className="w-full h-full rounded-full object-cover" /> : <Users size={18} className="text-green-600" />}
                </div>
                <div><div className="font-semibold text-sm">{coach.name}</div><div className="text-xs text-gray-400">{coach.role}</div></div>
              </div>
            )}
          </div>
        )}

        {/* PLAYERS TAB */}
        {tab === 'players' && (
          <>
            {!showForm && (
              <button onClick={() => { setShowForm(true); setEditing(null); setForm({ position: 'DEF', is_starter: 'false' }); }}
                className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold btn-shadow hover:bg-green-700 flex items-center justify-center gap-2">
                <Plus size={16} /> Ajouter un joueur
              </button>
            )}
            {showForm && tab === 'players' && (
              <div className="rounded-2xl bg-white p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">{editing ? 'Modifier' : 'Ajouter'} un joueur</h3>
                  <button onClick={() => { setShowForm(false); setEditing(null); setForm({}); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
                <Input label="Nom" field="name" placeholder="Nom du joueur" />
                <FileUpload 
                  value={form.photo_url || null}
                  onChange={(url) => setForm(prev => ({ ...prev, photo_url: url }))}
                  label="Photo"
                />
                <Select label="Poste" field="position" options={[
                  { value: 'GK', label: 'Gardien' }, { value: 'DEF', label: 'Défenseur' },
                  { value: 'MIL', label: 'Milieu' }, { value: 'ATT', label: 'Attaquant' },
                ]} />
                <Input label="Numéro" field="jersey_number" type="number" placeholder="10" />
                <Select label="Titulaire" field="is_starter" options={[{ value: 'true', label: 'Oui' }, { value: 'false', label: 'Non' }]} />
                <button onClick={handlePlayerSubmit} className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold btn-shadow hover:bg-green-700 flex items-center justify-center gap-2">
                  <Save size={16} /> {editing ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            )}
            <div className="space-y-2">
              {players.map(p => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-md">
                  <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center overflow-hidden border border-green-200">
                    {p.photo_url ? <img src={p.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-green-600">{p.jersey_number}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">{p.name}</div>
                    <div className="text-xs text-gray-400">{POSITION_LABELS[p.position]} {p.is_starter ? '- Titulaire' : '- Remplaçant'}</div>
                  </div>
                  <button onClick={() => startEdit(p, ['name','photo_url','position','jersey_number','is_starter'])} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete('players', p.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* MATCHES TAB */}
        {tab === 'matches' && (
          <>
            {!showForm && (
              <button onClick={() => { setShowForm(true); setEditing(null); setForm({ is_home: 'true', status: 'upcoming', formation: '4-3-3' }); }}
                className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold btn-shadow hover:bg-green-700 flex items-center justify-center gap-2">
                <Plus size={16} /> Ajouter un match
              </button>
            )}
            {showForm && tab === 'matches' && (
              <div className="rounded-2xl bg-white p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">{editing ? 'Modifier' : 'Ajouter'} un match</h3>
                  <button onClick={() => { setShowForm(false); setEditing(null); setForm({}); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
                <Input label="Adversaire" field="opponent" placeholder="ASC..." />
                <Input label="Date" field="match_date" type="date" />
                <Input label="Heure" field="match_time" type="time" />
                <Input label="Lieu" field="venue" placeholder="Terrain..." />
                <Input label="Compétition" field="competition" placeholder="Championnat..." />
                <Select label="Domicile" field="is_home" options={[{ value: 'true', label: 'Oui' }, { value: 'false', label: 'Non' }]} />
                <Select label="Statut" field="status" options={[
                  { value: 'upcoming', label: 'À venir' }, { value: 'live', label: 'En direct' },
                  { value: 'completed', label: 'Terminé' }, { value: 'postponed', label: 'Reporté' },
                ]} />
                <Select label="Formation" field="formation" options={[
                  { value: '4-3-3', label: '4-3-3' }, { value: '4-4-2', label: '4-4-2' }, { value: '3-5-2', label: '3-5-2' },
                ]} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Score domicile" field="score_home" type="number" />
                  <Input label="Score extérieur" field="score_away" type="number" />
                </div>
                <button onClick={handleMatchSubmit} className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold btn-shadow hover:bg-green-700 flex items-center justify-center gap-2">
                  <Save size={16} /> {editing ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            )}
            <div className="space-y-2">
              {matches.map(m => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-md">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900">vs {m.opponent}</div>
                    <div className="text-xs text-gray-400">{m.match_date} {m.match_time || ''} - {m.status === 'completed' ? `${m.score_home}-${m.score_away}` : m.status} - {m.formation}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold">{m.formation}</span>
                  <button onClick={() => startEdit(m, ['opponent','match_date','match_time','venue','competition','is_home','status','score_home','score_away','formation'])} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete('matches', m.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* LINEUP TAB - Starting 11 per match */}
        {tab === 'lineup' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-lg space-y-3">
              <h3 className="text-sm font-bold text-gray-700">Composer le 11 de départ</h3>
              <div className="relative">
                <select value={lineupMatchId} onChange={e => setLineupMatchId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm input-shadow focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 appearance-none bg-white font-medium">
                  <option value="">Choisir un match...</option>
                  {upcomingMatches.map(m => (
                    <option key={m.id} value={m.id}>vs {m.opponent} - {m.match_date}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {lineupMatchId && (
                <>
                  {/* Formation selector */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Formation</label>
                    <div className="flex gap-2">
                      {['4-3-3', '4-4-2', '3-5-2'].map(f => (
                        <button key={f} onClick={() => setLineupFormation(f)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-300 ${
                            lineupFormation === f ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Starters */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-green-700">Titulaires ({lineupStarters.length}/11)</span>
                      {lineupStarters.length !== 11 && <span className="text-[10px] text-amber-500 font-medium">Il faut 11 joueurs</span>}
                    </div>
                    <div className="space-y-1.5">
                      {lineupStarters.map((pid, idx) => {
                        const p = players.find(pl => pl.id === pid);
                        if (!p) return null;
                        return (
                          <div key={pid} className="flex items-center gap-2 rounded-lg bg-green-50 p-2 border border-green-200">
                            <span className="text-xs font-bold text-green-600 w-5 text-center">{idx + 1}</span>
                            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center overflow-hidden border border-green-200">
                              {p.photo_url ? <img src={p.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-[9px] font-bold text-green-600">{p.jersey_number}</span>}
                            </div>
                            <div className="flex-1 min-w-0"><div className="text-xs font-semibold text-gray-800 truncate">{p.name}</div><div className="text-[10px] text-gray-400">{POSITION_LABELS[p.position]}</div></div>
                            <button onClick={() => toggleStarter(pid)} className="text-red-400 hover:text-red-600 transition-colors"><X size={14} /></button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Available players to add as starters */}
                  {lineupStarters.length < 11 && (
                    <div>
                      <span className="text-xs font-bold text-gray-500 mb-1 block">Ajouter titulaire</span>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {players.filter(p => !lineupStarters.includes(p.id)).map(p => (
                          <button key={p.id} onClick={() => toggleStarter(p.id)}
                            className="w-full flex items-center gap-2 rounded-lg p-2 text-left hover:bg-green-50 transition-colors">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                              {p.photo_url ? <img src={p.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-[9px] font-bold text-gray-500">{p.jersey_number}</span>}
                            </div>
                            <div className="flex-1"><div className="text-xs font-medium text-gray-700">{p.name}</div><div className="text-[10px] text-gray-400">{POSITION_LABELS[p.position]}</div></div>
                            <Plus size={14} className="text-green-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Substitutes */}
                  <div>
                    <span className="text-xs font-bold text-gray-500 mb-1 block">Remplaçants ({lineupSubs.length})</span>
                    <div className="space-y-1">
                      {lineupSubs.map(pid => {
                        const p = players.find(pl => pl.id === pid);
                        if (!p) return null;
                        return (
                          <div key={pid} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 border border-gray-200">
                            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center overflow-hidden border border-gray-200">
                              {p.photo_url ? <img src={p.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-[9px] font-bold text-gray-400">{p.jersey_number}</span>}
                            </div>
                            <div className="flex-1 min-w-0"><div className="text-xs font-medium text-gray-600 truncate">{p.name}</div><div className="text-[10px] text-gray-400">{POSITION_LABELS[p.position]}</div></div>
                            <button onClick={() => toggleSub(pid)} className="text-red-400 hover:text-red-600 transition-colors"><X size={14} /></button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add more subs */}
                  <div>
                    <span className="text-xs font-bold text-gray-400 mb-1 block">Ajouter remplaçant</span>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {players.filter(p => !lineupStarters.includes(p.id) && !lineupSubs.includes(p.id)).map(p => (
                        <button key={p.id} onClick={() => toggleSub(p.id)}
                          className="w-full flex items-center gap-2 rounded-lg p-2 text-left hover:bg-gray-50 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                            {p.photo_url ? <img src={p.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-[9px] font-bold text-gray-500">{p.jersey_number}</span>}
                          </div>
                          <div className="flex-1"><div className="text-xs font-medium text-gray-600">{p.name}</div><div className="text-[10px] text-gray-400">{POSITION_LABELS[p.position]}</div></div>
                          <Plus size={14} className="text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={handleSaveLineup} className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold btn-shadow hover:bg-green-700 flex items-center justify-center gap-2">
                    <Save size={16} /> Sauvegarder la composition
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {tab === 'announcements' && (
          <>
            {!showForm && (
              <button onClick={() => { setShowForm(true); setEditing(null); setForm({ type: 'other' }); }}
                className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold btn-shadow hover:bg-green-700 flex items-center justify-center gap-2">
                <Plus size={16} /> Ajouter une annonce
              </button>
            )}
            {showForm && tab === 'announcements' && (
              <div className="rounded-2xl bg-white p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">{editing ? 'Modifier' : 'Ajouter'} une annonce</h3>
                  <button onClick={() => { setShowForm(false); setEditing(null); setForm({}); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
                <Input label="Titre" field="title" placeholder="Titre de l'annonce" />
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Contenu</label>
                  <textarea value={form.content || ''} onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Détails de l'annonce..." rows={3}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm input-shadow focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-none" />
                </div>
                <Select label="Type" field="type" options={[
                  { value: 'match', label: 'Match' }, { value: 'training', label: 'Entraînement' },
                  { value: 'meeting', label: 'Réunion' }, { value: 'other', label: 'Autre' },
                ]} />
                <Input label="Date événement" field="event_date" type="date" />
                <button onClick={handleAnnouncementSubmit} className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold btn-shadow hover:bg-green-700 flex items-center justify-center gap-2">
                  <Save size={16} /> {editing ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            )}
            <div className="space-y-2">
              {announcements.map(a => (
                <div key={a.id} className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-md">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900">{a.title}</div>
                    <div className="text-xs text-gray-400 truncate">{a.content}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">{a.type}</span>
                  </div>
                  <button onClick={() => startEdit(a, ['title','content','type','event_date'])} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors mt-1"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete('announcements', a.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors mt-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* STANDINGS TAB - with competition filter */}
        {tab === 'standings' && (
          <>
            {/* Competition filter */}
            {standingsCompetitions.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {standingsCompetitions.map(c => (
                  <button key={c} onClick={() => setStandingsComp(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                      standingsComp === c ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-600 shadow-sm hover:shadow-md'}`}>
                    {c}
                  </button>
                ))}
              </div>
            )}
            {!showForm && (
              <button onClick={() => { setShowForm(true); setEditing(null); setForm({ competition_name: standingsComp || '' }); }}
                className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold btn-shadow hover:bg-green-700 flex items-center justify-center gap-2">
                <Plus size={16} /> Ajouter au classement
              </button>
            )}
            {showForm && tab === 'standings' && (
              <div className="rounded-2xl bg-white p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">{editing ? 'Modifier' : 'Ajouter'} classement</h3>
                  <button onClick={() => { setShowForm(false); setEditing(null); setForm({}); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
                <Input label="Compétition" field="competition_name" placeholder="Championnat..." />
                <Input label="Position" field="position" type="number" />
                <Input label="Équipe" field="team_name" placeholder="Nom équipe" />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Points" field="points" type="number" />
                  <Input label="Joués" field="played" type="number" />
                  <Input label="Victoires" field="won" type="number" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Nuls" field="drawn" type="number" />
                  <Input label="Défaites" field="lost" type="number" />
                  <Input label="Buts pour" field="goals_for" type="number" />
                </div>
                <Input label="Buts contre" field="goals_against" type="number" />
                <button onClick={handleStandingSubmit} className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold btn-shadow hover:bg-green-700 flex items-center justify-center gap-2">
                  <Save size={16} /> {editing ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            )}
            <div className="space-y-2">
              {filteredStandings.map(s => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-md">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-600">{s.position}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">{s.team_name}</div>
                    <div className="text-xs text-gray-400">{s.competition_name} - {s.points} pts</div>
                  </div>
                  <button onClick={() => startEdit(s, ['competition_name','position','team_name','points','played','won','drawn','lost','goals_for','goals_against'])} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete('standings', s.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* STATS TAB */}
        {tab === 'stats' && (
          <>
            {!showForm && (
              <button onClick={() => { setShowForm(true); setEditing(null); setForm({ goals: '0', assists: '0', matches_played: '0' }); }}
                className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold btn-shadow hover:bg-green-700 flex items-center justify-center gap-2">
                <Plus size={16} /> Ajouter des stats
              </button>
            )}
            {showForm && tab === 'stats' && (
              <div className="rounded-2xl bg-white p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">{editing ? 'Modifier' : 'Ajouter'} des statistiques</h3>
                  <button onClick={() => { setShowForm(false); setEditing(null); setForm({}); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
                <Select label="Joueur" field="player_id" options={players.map(p => ({ value: p.id, label: `${p.name} (${POSITION_LABELS[p.position]})` }))} />
                <Input label="Compétition" field="competition_name" placeholder="Championnat du Quartier" />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Buts" field="goals" type="number" />
                  <Input label="Passes D." field="assists" type="number" />
                  <Input label="Matchs J." field="matches_played" type="number" />
                </div>
                <button onClick={handleStatSubmit} className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold btn-shadow hover:bg-green-700 flex items-center justify-center gap-2">
                  <Save size={16} /> {editing ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            )}
            <div className="space-y-2">
              {playerStats.map(s => {
                const player = players.find(p => p.id === s.player_id);
                return (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-md">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center overflow-hidden border border-green-200">
                      {player?.photo_url ? <img src={player.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] font-bold text-green-600">{player?.jersey_number || ''}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">{player?.name || 'Inconnu'}</div>
                      <div className="text-xs text-gray-400">{s.competition_name}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-0.5 font-bold text-green-600">{s.goals} <Target size={10} /></span>
                      <span className="text-gray-200">|</span>
                      <span className="font-bold text-blue-600">{s.assists} P</span>
                    </div>
                    <button onClick={() => startEdit(s, ['player_id','competition_name','goals','assists','matches_played'])} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete('player_stats', s.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* GALLERY TAB */}
        {tab === 'gallery' && (
          <>
            {!showForm && (
              <button onClick={() => { setShowForm(true); setEditing(null); setForm({ type: 'image', event_type: 'other' }); }}
                className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold btn-shadow hover:bg-green-700 flex items-center justify-center gap-2">
                <Plus size={16} /> Ajouter un média
              </button>
            )}
            {showForm && tab === 'gallery' && (
              <div className="rounded-2xl bg-white p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">{editing ? 'Modifier' : 'Ajouter'} un média</h3>
                  <button onClick={() => { setShowForm(false); setEditing(null); setForm({}); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
                <Select label="Type" field="type" options={[{ value: 'image', label: 'Image' }, { value: 'video', label: 'Vidéo' }]} />
                <FileUpload 
                  value={form.url || null}
                  onChange={(url) => setForm(prev => ({ ...prev, url }))}
                  label="Fichier"
                  accept="image/*,video/*"
                />
                <Input label="Légende" field="caption" placeholder="Description..." />
                <Select label="Type événement" field="event_type" options={[
                  { value: 'match', label: 'Match' }, { value: 'training', label: 'Entraînement' }, { value: 'other', label: 'Autre' },
                ]} />
                <button onClick={handleGallerySubmit} className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold btn-shadow hover:bg-green-700 flex items-center justify-center gap-2">
                  <Save size={16} /> {editing ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {gallery.map(g => (
                <div key={g.id} className="relative group">
                  <div className="aspect-square rounded-xl overflow-hidden shadow-md">
                    <img src={g.url} alt={g.caption || ''} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(g, ['type','url','caption','event_type'])} className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow"><Edit2 size={10} className="text-blue-500" /></button>
                    <button onClick={() => handleDelete('gallery', g.id)} className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow"><Trash2 size={10} className="text-red-500" /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
