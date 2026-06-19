'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface UserContextType {
  userRole: 'admin' | 'member' | null;
  teamId: string | null;
  loading: boolean;
  refreshUserInfo: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserInfo = async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        setUserRole(null);
        setTeamId(null);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserRole(null);
        setTeamId(null);
        setLoading(false);
        return;
      }

      // Get user team info from RPC
      const { data: teamInfo, error } = await supabase.rpc('get_user_team_info');
      
      if (error || !teamInfo) {
        console.error('Error getting user team info:', error);
        setUserRole(null);
        setTeamId(null);
        setLoading(false);
        return;
      }

      const result = teamInfo as { success?: boolean; error?: string; team_id?: string; user_role?: string };

      if (result.error) {
        console.error('Team info error:', result.error);
        setUserRole(null);
        setTeamId(null);
      } else {
        setUserRole(result.user_role as 'admin' | 'member');
        setTeamId(result.team_id || null);
        
        // Store in localStorage for persistence
        localStorage.setItem('team_id', result.team_id || '');
        localStorage.setItem('user_role', result.user_role || '');
      }
    } catch (error) {
      console.error('Error refreshing user info:', error);
      setUserRole(null);
      setTeamId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check localStorage first for immediate load
    const storedTeamId = localStorage.getItem('team_id');
    const storedUserRole = localStorage.getItem('user_role');
    
    if (storedTeamId && storedUserRole) {
      setTeamId(storedTeamId);
      setUserRole(storedUserRole as 'admin' | 'member');
      setLoading(false);
    }

    // Then refresh from server
    refreshUserInfo();

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await refreshUserInfo();
        } else if (event === 'SIGNED_OUT') {
          setUserRole(null);
          setTeamId(null);
          localStorage.removeItem('team_id');
          localStorage.removeItem('user_role');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  return (
    <UserContext.Provider value={{ userRole, teamId, loading, refreshUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
