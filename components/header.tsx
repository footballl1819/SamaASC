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
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#22D3EE]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="relative flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        {/* Centered logo and name */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg overflow-hidden border border-sky-400/30 relative"
            style={{
              background: 'linear-gradient(135deg, #e0f2fe 0%, #0ea5e9 50%, #0284c7 100%)',
              boxShadow: '0 4px 30px -4px rgba(14, 165, 233, 0.3)'
            }}
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-[#0ea5e9]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-10 h-10 bg-[#0284c7]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="relative z-10">
              {team?.logo_url ? (
                <img src={team.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xs">{team?.name?.substring(0, 2).toUpperCase() || 'SA'}</span>
              )}
            </div>
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight drop-shadow-lg">{team?.name || title}</h1>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors border border-transparent hover:border-sky-400/30"
          title="Déconnexion"
        >
          <LogOut size={18} className="text-sky-400" />
        </button>
      </div>
    </header>
  );
}
