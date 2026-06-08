'use client';

import { usePathname } from 'next/navigation';

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xs">SA</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/50" />
      </div>
    </header>
  );
}
