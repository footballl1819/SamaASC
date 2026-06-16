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
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/10 relative overflow-hidden" style={{ backgroundColor: 'rgba(2, 6, 23, 0.95)' }}>
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#22D3EE]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="relative flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        {/* Centered logo and name */}
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg overflow-hidden border border-white/20"
            style={{ 
              background: team?.primary_color && team?.secondary_color 
                ? `linear-gradient(135deg, ${team.primary_color}, ${team.secondary_color})` 
                : 'linear-gradient(135deg, #22D3EE, #3B82F6)',
              boxShadow: team?.primary_color ? `0 4px 30px -4px ${team.primary_color}60` : undefined
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
          className="p-2 rounded-lg hover:bg-white/10 transition-colors border border-transparent hover:border-white/20"
          title="Déconnexion"
        >
          <LogOut size={18} className="text-[#22D3EE]" />
        </button>
      </div>
    </header>
  );
}
