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

interface User {
  id: string;
  team_id: string;
  username: string;
  name: string;
  role: 'admin' | 'member';
}

interface TeamContextType {
  team: Team | null;
  user: User | null;
  loading: boolean;
  setTeam: (team: Team | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [team, setTeam] = useState<Team | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
    loadUser();
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

  const loadUser = () => {
    const userId = localStorage.getItem('currentUserId');
    const userName = localStorage.getItem('currentUserName');
    const userRole = localStorage.getItem('currentUserRole');
    
    if (userId && userName && userRole) {
      setUser({
        id: userId,
        team_id: localStorage.getItem('currentTeamId') || '',
        username: userName,
        name: userName, // You might want to store full name separately
        role: userRole as 'admin' | 'member',
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('currentTeamId');
    localStorage.removeItem('currentTeamSlug');
    localStorage.removeItem('currentTeamName');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('currentUserRole');
    setTeam(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <TeamContext.Provider value={{ team, user, loading, setTeam, setUser, logout }}>
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
