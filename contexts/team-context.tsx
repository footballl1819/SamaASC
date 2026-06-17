'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface Team {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  team_photo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  nav_color: string;
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
        // Check localStorage for user and team data
        const storedUser = localStorage.getItem('user');
        const storedTeam = localStorage.getItem('team');
        
        if (storedUser && storedTeam) {
          const userData = JSON.parse(storedUser);
          const teamData = JSON.parse(storedTeam);
          
          setUser({
            id: userData.id,
            team_id: userData.team_id,
            username: userData.username,
            name: userData.name,
            role: userData.role as 'admin' | 'member',
          });
          
          setTeam(teamData);
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
    localStorage.removeItem('user');
    localStorage.removeItem('team');
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
