'use client';

import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';
import { useTeam } from '@/contexts/team-context';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { team } = useTeam();

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)'
      }}
    >
      <Header />
      <main className="relative pt-14 pb-20 px-4 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
