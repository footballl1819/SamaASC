'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const teamId = localStorage.getItem('currentTeamId');
    const userId = localStorage.getItem('currentUserId');

    if (teamId && userId) {
      // User is logged in, go to home
      router.push('/');
    } else if (teamId) {
      // Team selected but not logged in, go to user login
      router.push('/user-login');
    } else {
      // No team selected, go to team selection/creation
      router.push('/login');
    }
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl animate-bounce">⚽</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Sama ASC</h1>
        <p className="text-green-200">Chargement...</p>
      </div>
    </div>
  );
}
