'use client';

import { usePathname } from 'next/navigation';
import { useTeam } from '@/contexts/team-context';
import { LogOut } from 'lucide-react';

const TITLES: Record<string, string> = {
  '/': 'Sama ASC',
  '/equipe': 'Mon Équipe',
  '/classement': 'Classement',
  '/galerie': 'Galerie',
  '/resultats': 'Résultats',
  '/supporters': 'Supporters',
  '/admin': 'Admin',
};

export default function Header() {
  const pathname = usePathname();
  const title = TITLES[pathname] || 'Sama ASC';
  const { logout, team } = useTeam();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md overflow-hidden"
            style={{ 
              background: team?.primary_color && team?.secondary_color 
                ? `linear-gradient(135deg, ${team.primary_color}, ${team.secondary_color})` 
                : 'linear-gradient(135deg, #22c55e, #15803d)'
            }}
          >
            {team?.logo_url ? (
              <img src={team.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-xs">SA</span>
            )}
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div 
            className="w-2 h-2 rounded-full animate-pulse shadow-sm"
            style={{ 
              backgroundColor: team?.accent_color || '#22c55e',
              boxShadow: `0 0 8px ${team?.accent_color || '#22c55e'}80`
            }}
          />
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Déconnexion"
          >
            <LogOut size={18} className="text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
