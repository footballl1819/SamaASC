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
          // Load user and team data from API route (bypasses RLS)
          const { data: { session: currentSession } } = await supabase!.auth.getSession();
          const token = currentSession?.access_token;
          
          if (token) {
            const response = await fetch('/api/auth/user', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.user) {
                setUser({
                  id: data.user.id,
                  team_id: data.user.team_id,
                  username: data.user.username,
                  name: data.user.name,
                  role: data.user.role as 'admin' | 'member',
                });
              }
              
              if (data.team) {
                setTeam(data.team);
              }
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
        const token = session.access_token;
        
        if (token) {
          const response = await fetch('/api/auth/user', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.user) {
              setUser({
                id: data.user.id,
                team_id: data.user.team_id,
                username: data.user.username,
                name: data.user.name,
                role: data.user.role as 'admin' | 'member',
              });
            }
            
            if (data.team) {
              setTeam(data.team);
            }
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
