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
        if (!supabase) {
          setLoading(false);
          return;
        }

        // Get current session from Supabase Auth
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Load user data from database using Supabase Auth user ID
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError || !userData) {
            console.error('Error loading user data:', userError);
            setLoading(false);
            return;
          }

          // Load team data from database
          const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .eq('id', userData.team_id)
            .single();

          if (teamError || !teamData) {
            console.error('Error loading team data:', teamError);
            setLoading(false);
            return;
          }

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
          // Check localStorage as fallback for custom auth
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
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && supabase) {
        // Reload data from database
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          const { data: teamData } = await supabase
            .from('teams')
            .select('*')
            .eq('id', userData.team_id)
            .single();

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

          if (teamData) {
            setTeam(teamData);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setTeam(null);
      }
    });

    // Setup realtime subscription for user profile updates
    let userChannel: any = null;
    let teamChannel: any = null;

    if (user && team && supabase) {
      // Subscribe to user profile changes
      userChannel = supabase
        .channel('user-profile-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${user.id}`,
          },
          async (payload) => {
            // Update user state when profile changes
            const updatedUser = payload.new as any;
            setUser({
              id: updatedUser.id,
              team_id: updatedUser.team_id,
              username: updatedUser.username,
              name: updatedUser.name,
              email: updatedUser.email || '',
              role: updatedUser.role as 'admin' | 'member',
              profile_photo_url: updatedUser.profile_photo_url || null,
              created_at: updatedUser.created_at || new Date().toISOString(),
            });
          }
        )
        .subscribe();

      // Subscribe to team changes
      teamChannel = supabase
        .channel('team-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'teams',
            filter: `id=eq.${team.id}`,
          },
          async (payload) => {
            // Update team state when team data changes
            const updatedTeam = payload.new as any;
            setTeam(updatedTeam);
          }
        )
        .subscribe();
    }

    // Listen for localStorage changes (for custom auth fallback)
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
      subscription?.unsubscribe();
      if (userChannel) supabase?.removeChannel(userChannel);
      if (teamChannel) supabase?.removeChannel(teamChannel);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdated', handleStorageChange);
    };
  }, []);

  const logout = async () => {
    // Sign out from Supabase Auth
    await supabase?.auth.signOut();
    
    // Clear localStorage
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
