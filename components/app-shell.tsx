'use client';

import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';
import { useTeam } from '@/contexts/team-context';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { team } = useTeam();

  return (
    <div 
      className="min-h-screen transition-colors duration-300 relative"
      style={{ 
        background: team?.secondary_color && team?.accent_color 
          ? `linear-gradient(135deg, ${team.primary_color} 0%, ${team.secondary_color} 50%, ${team.accent_color} 100%)`
          : team?.primary_color || '#f9fafb',
      }}
    >
      {/* Logo background overlay */}
      {team?.logo_url && (
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url(${team.logo_url})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
      <Header />
      <main className="relative pt-14 pb-20 px-4 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
