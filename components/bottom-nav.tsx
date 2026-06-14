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
    <nav className="fixed left-0 top-0 bottom-0 z-50 w-14 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-lg">
      <div className="flex flex-col items-center py-4 gap-3 h-full">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all duration-300 min-w-[44px] icon-hover ${
                isActive
                  ? 'scale-105'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
              style={{
                backgroundColor: isActive ? (team?.secondary_color ? `${team.secondary_color}20` : 'rgba(34, 197, 94, 0.1)') : undefined,
                color: isActive ? (team?.secondary_color || '#16a34a') : undefined,
              }}
            >
              <div className={`relative ${isActive ? 'drop-shadow-sm' : ''}`}>
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="transition-all duration-300"
                />
                {isActive && (
                  <div 
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: team?.secondary_color || '#16a34a' }}
                  />
                )}
              </div>
              <span className={`text-[8px] leading-tight font-medium transition-all duration-300 ${
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
