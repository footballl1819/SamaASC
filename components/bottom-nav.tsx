'use client';

import { Home, Users, Trophy, Image, ScrollText, Heart, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { icon: Home, label: 'Accueil', path: '/' },
  { icon: Users, label: 'Mon Équipe', path: '/equipe' },
  { icon: Trophy, label: 'Classement', path: '/classement' },
  { icon: Image, label: 'Galerie', path: '/galerie' },
  { icon: ScrollText, label: 'Résultats', path: '/resultats' },
  { icon: Heart, label: 'Supporters', path: '/supporters' },
  { icon: Settings, label: 'Admin', path: '/admin' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 pb-safe">
      <div className="flex items-center justify-around px-1 py-1.5 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-300 min-w-[48px] ${
                isActive
                  ? 'bg-green-50 text-green-600 scale-105'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className={`relative ${isActive ? 'drop-shadow-sm' : ''}`}>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="transition-all duration-300"
                />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] leading-tight font-medium transition-all duration-300 ${
                isActive ? 'text-green-600' : 'text-gray-400'
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
