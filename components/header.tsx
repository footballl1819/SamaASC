'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTeam } from '@/contexts/team-context';
import { LogOut } from 'lucide-react';

const TITLES: Record<string, string> = {
  '/': 'Accueil',
  '/equipe': 'Mon Équipe',
  '/classement': 'Classement',
  '/galerie': 'Galerie',
  '/resultats': 'Résultats',
  '/supporters': 'Supporters',
  '/admin': 'Admin',
  '/parametres': 'Paramètres',
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const title = TITLES[pathname] || 'Accueil';
  const { logout, team } = useTeam();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-gray-800" style={{ backgroundColor: team?.nav_color ? `${team.nav_color}95` : 'rgba(31, 41, 55, 0.95)' }}>
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        {/* Centered logo and name */}
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
              <span className="text-white font-bold text-xs">{team?.name?.substring(0, 2).toUpperCase() || 'SA'}</span>
            )}
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">{team?.name || title}</h1>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          title="Déconnexion"
        >
          <LogOut size={18} className="text-white" />
        </button>
      </div>
    </header>
  );
}
