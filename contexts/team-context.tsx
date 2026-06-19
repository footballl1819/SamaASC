'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';

interface Team {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logo_url: string | null;
  team_photo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  nav_color: string;
  description: string | null;
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
            email: userData.email || '',
            role: userData.role as 'admin' | 'member',
            profile_photo_url: userData.profile_photo_url || null,
            created_at: userData.created_at || new Date().toISOString(),
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

    // Listen for localStorage changes (for login updates)
    const handleStorageChange = () => {
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
          email: userData.email || '',
          role: userData.role as 'admin' | 'member',
          profile_photo_url: userData.profile_photo_url || null,
          created_at: userData.created_at || new Date().toISOString(),
        });
        
        setTeam(teamData);
      } else {
        setUser(null);
        setTeam(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdated', handleStorageChange);
    };
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
