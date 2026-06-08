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
    const initializeAuth = async () => {
      try {
        // First load team from localStorage
        await loadTeam();
        // Then load user
        loadUser();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loadTeam = async () => {
    const teamId = localStorage.getItem('currentTeamId');
    if (!teamId) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error || !data) {
        // Team not found, clear localStorage
        localStorage.removeItem('currentTeamId');
        localStorage.removeItem('currentTeamSlug');
        localStorage.removeItem('currentTeamName');
        setTeam(null);
        return;
      }
      setTeam(data);
    } catch (error) {
      console.error('Error loading team:', error);
      localStorage.removeItem('currentTeamId');
      localStorage.removeItem('currentTeamSlug');
      localStorage.removeItem('currentTeamName');
      setTeam(null);
    }
  };

  const loadUser = () => {
    const userId = localStorage.getItem('currentUserId');
    const userName = localStorage.getItem('currentUserName');
    const userRole = localStorage.getItem('currentUserRole');
    const teamId = localStorage.getItem('currentTeamId');
    
    if (userId && userName && userRole && teamId) {
      setUser({
        id: userId,
        team_id: teamId,
        username: userName,
        name: userName,
        role: userRole as 'admin' | 'member',
      });
    } else {
      setUser(null);
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
