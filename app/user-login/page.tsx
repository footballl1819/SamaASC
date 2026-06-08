'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { hashPassword, verifyPassword } from '@/lib/auth-utils';
import { Lock, User, ArrowRight, Plus } from 'lucide-react';

export default function UserLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tid = localStorage.getItem('currentTeamId');
    const tname = localStorage.getItem('currentTeamName');
    setTeamId(tid);
    setTeamName(tname);
    
    if (!tid) {
      router.push('/login');
    }
  }, [router]);

  if (!mounted || !teamId) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if user exists with this username in the team
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('team_id', teamId)
        .eq('username', username)
        .single();

      if (userError || !user) {
        setError('Identifiants incorrects');
        setLoading(false);
        return;
      }

      // Verify password
      const isValid = await verifyPassword(password, user.password);
      
      if (!isValid) {
        setError('Identifiants incorrects');
        setLoading(false);
        return;
      }

      // Store user info in localStorage
      localStorage.setItem('currentUserId', user.id);
      localStorage.setItem('currentUserName', user.username);
      localStorage.setItem('currentUserRole', user.role);

      // Redirect to home
      router.push('/');
    } catch (err) {
      setError('Erreur lors de la connexion');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">⚽</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{teamName}</h1>
          <p className="text-green-200">Connectez-vous à votre compte</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Pas encore de compte ?{' '}
              <button
                onClick={() => router.push('/user-register')}
                className="text-green-600 font-medium hover:underline flex items-center justify-center gap-1"
              >
                <Plus size={14} />
                Créer un compte
              </button>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ← Changer d'équipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
