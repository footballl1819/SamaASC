'use client';

import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';
import { useTeam } from '@/contexts/team-context';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { team } = useTeam();

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ 
        backgroundColor: team?.primary_color || '#f9fafb',
      }}
    >
      <Header />
      <main className="pt-14 pb-20 px-4 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
