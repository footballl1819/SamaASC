'use client';

import { Home, Users, Trophy, Image, ScrollText, Heart, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTeam } from '@/contexts/team-context';

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

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { team, user } = useTeam();

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.adminOnly) {
      return user?.role === 'admin';
    }
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t border-gray-800" style={{ backgroundColor: team?.nav_color ? `${team.nav_color}95` : 'rgba(31, 41, 55, 0.95)' }}>
      <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-300 min-w-[44px] ${
                isActive
                  ? 'scale-105'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              style={{
                backgroundColor: isActive ? (team?.accent_color ? `${team.accent_color}30` : 'rgba(34, 197, 94, 0.1)') : undefined,
                color: isActive ? (team?.accent_color || '#16a34a') : undefined,
              }}
            >
              <div className={`relative ${isActive ? 'drop-shadow-sm' : ''}`}>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="transition-all duration-300"
                />
                {isActive && (
                  <div 
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: team?.accent_color || '#16a34a' }}
                  />
                )}
              </div>
              <span className={`text-[10px] leading-tight font-medium transition-all duration-300 ${
                isActive ? '' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
