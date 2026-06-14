'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTeam } from '@/contexts/team-context';
import { LogOut, Menu, X, Home, Users, Trophy, Image, ScrollText, Heart, Settings } from 'lucide-react';

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

const NAV_ITEMS = [
  { icon: Home, label: 'Accueil', path: '/' },
  { icon: Users, label: 'Mon Équipe', path: '/equipe' },
  { icon: Trophy, label: 'Classement', path: '/classement' },
  { icon: Image, label: 'Galerie', path: '/galerie' },
  { icon: ScrollText, label: 'Résultats', path: '/resultats' },
  { icon: Heart, label: 'Supporters', path: '/supporters' },
  { icon: Settings, label: 'Admin', path: '/admin', adminOnly: true },
  { icon: Settings, label: 'Paramètres', path: '/parametres', adminOnly: true },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const title = TITLES[pathname] || 'Accueil';
  const { logout, team, user } = useTeam();
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.adminOnly) {
      return user?.role === 'admin';
    }
    return true;
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        {/* Menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Menu"
        >
          {menuOpen ? <X size={20} className="text-gray-600" /> : <Menu size={20} className="text-gray-600" />}
        </button>

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
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">{team?.name || title}</h1>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Déconnexion"
        >
          <LogOut size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Navigation menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2.5 mb-6">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md overflow-hidden"
                style={{ 
                  background: team?.primary_color && team?.secondary_color 
                    ? `linear-gradient(135deg, ${team.primary_color}, ${team.secondary_color})` 
                    : 'linear-gradient(135deg, #22c55e, #15803d)'
                }}
              >
                {team?.logo_url ? (
                  <img src={team.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold">{team?.name?.substring(0, 2).toUpperCase() || 'SA'}</span>
                )}
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{team?.name || 'SamaASC'}</h2>
                <p className="text-xs text-gray-500">Menu</p>
              </div>
            </div>
            <nav className="space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      router.push(item.path);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'scale-105'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: isActive ? (team?.secondary_color ? `${team.secondary_color}20` : 'rgba(34, 197, 94, 0.1)') : undefined,
                      color: isActive ? (team?.secondary_color || '#16a34a') : undefined,
                    }}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
