'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, ArrowRight, Plus } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!supabase) {
        setError('Erreur de connexion');
        setLoading(false);
        return;
      }
      // Check if team exists with this slug
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('slug', slug)
        .single();

      if (teamError || !team) {
        setError('Équipe non trouvée');
        setLoading(false);
        return;
      }

      // Store team info in localStorage
      localStorage.setItem('currentTeamId', team.id);
      localStorage.setItem('currentTeamSlug', team.slug);
      localStorage.setItem('currentTeamName', team.name);

      // Redirect to user login
      router.push('/user-login');
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
          <h1 className="text-3xl font-bold text-white mb-2">Sama ASC</h1>
          <p className="text-green-200">Connectez-vous à votre ASC</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Identifiant de l'ASC (Slug)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  placeholder="Ex: mon-asc"
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
                  Continuer
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="mt-6 text-center border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600 mb-3">
                Vous n'avez pas encore d'équipe ?
              </p>
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-green-600 text-green-600 rounded-xl font-medium hover:bg-green-50 transition-colors"
              >
                <Plus size={18} />
                Créer une nouvelle équipe
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Votre ASC n'est pas encore inscrite ?{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-green-600 font-medium hover:underline flex items-center justify-center gap-1"
              >
                <Plus size={14} />
                Créer une équipe
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
