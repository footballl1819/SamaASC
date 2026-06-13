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
        // Load user and team from sessionStorage
        const userId = sessionStorage.getItem('currentUserId');
        const userName = sessionStorage.getItem('currentUserName');
        const userRole = sessionStorage.getItem('currentUserRole');
        const teamId = sessionStorage.getItem('currentTeamId');
        const teamSlug = sessionStorage.getItem('currentTeamSlug');
        const teamName = sessionStorage.getItem('currentTeamName');

        if (userId && userName && userRole && teamId) {
          setUser({
            id: userId,
            team_id: teamId,
            username: userName,
            name: userName,
            role: userRole as 'admin' | 'member',
          });

          // Load team from Supabase
          if (supabase) {
            const { data: teamData } = await supabase
              .from('teams')
              .select('*')
              .eq('id', teamId)
              .single();

            if (teamData) {
              setTeam(teamData);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const logout = async () => {
    // Clear sessionStorage
    sessionStorage.removeItem('currentUserId');
    sessionStorage.removeItem('currentUserName');
    sessionStorage.removeItem('currentUserRole');
    sessionStorage.removeItem('currentTeamId');
    sessionStorage.removeItem('currentTeamSlug');
    sessionStorage.removeItem('currentTeamName');
    
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
