'use client';

import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="pt-14 pb-20 px-4 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
