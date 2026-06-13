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
        // Check Supabase auth session
        const { data: { session } } = await supabase!.auth.getSession();
        
        if (session) {
          // Load user from database based on auth session
          const { data: userData, error: userError } = await supabase!
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userData) {
            setUser({
              id: userData.id,
              team_id: userData.team_id,
              username: userData.username,
              name: userData.username,
              role: userData.role as 'admin' | 'member',
            });

            // Load team
            const { data: teamData } = await supabase!
              .from('teams')
              .select('*')
              .eq('id', userData.team_id)
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

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: userData } = await supabase!
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          setUser({
            id: userData.id,
            team_id: userData.team_id,
            username: userData.username,
            name: userData.username,
            role: userData.role as 'admin' | 'member',
          });

          const { data: teamData } = await supabase!
            .from('teams')
            .select('*')
            .eq('id', userData.team_id)
            .single();

          if (teamData) {
            setTeam(teamData);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setTeam(null);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase!.auth.signOut();
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
