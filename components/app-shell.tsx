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
        background: 'linear-gradient(135deg, #020617 0%, #071A3D 50%, #2D0A5B 100%)'
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#22D3EE]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>
      <Header />
      <main className="relative pt-14 pb-20 px-4 w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
