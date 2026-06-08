'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface Team {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  description: string | null;
}

interface TeamContextType {
  team: Team | null;
  loading: boolean;
  setTeam: (team: Team | null) => void;
  logout: () => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    const teamId = localStorage.getItem('currentTeamId');
    if (!teamId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) throw error;
      setTeam(data);
    } catch (error) {
      console.error('Error loading team:', error);
      localStorage.removeItem('currentTeamId');
      localStorage.removeItem('currentTeamSlug');
      localStorage.removeItem('currentTeamName');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('currentTeamId');
    localStorage.removeItem('currentTeamSlug');
    localStorage.removeItem('currentTeamName');
    setTeam(null);
    window.location.href = '/login';
  };

  return (
    <TeamContext.Provider value={{ team, loading, setTeam, logout }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
